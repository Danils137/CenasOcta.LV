import { createHmac } from "node:crypto";

interface MontonioPayload {
  orderId?: string;
  paymentStatus?: string;
  amount?: number;
  currency?: string;
  customerEmail?: string;
  merchantReference?: string;
  [key: string]: any;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const MONTONIO_SECRET = Deno.env.get("MONTONIO_SECRET") ?? "";
const MONTONIO_ACCESS_KEY = Deno.env.get("MONTONIO_ACCESS_KEY") ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase environment variables (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY).");
}
if (!MONTONIO_SECRET) {
  console.error("Missing MONTONIO_SECRET - webhook signature verification will fail without it.");
}

// Helper: verify a JWT HS256 token (no external deps)
function base64urlDecode(input: string): string {
  input = input.replace(/-/g, "+").replace(/_/g, "/");
  while (input.length % 4) input += "=";
  const decoded = atob(input);
  return decoded;
}

function verifyJwtHs256(token: string, secret: string): { valid: boolean; payload?: any; reason?: string } {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { valid: false, reason: "invalid_token_format" };
    const [headerB64, payloadB64, signatureB64] = parts;

    const signingInput = `${headerB64}.${payloadB64}`;

    const key = new TextEncoder().encode(secret);
    const data = new TextEncoder().encode(signingInput);

    let expectedSigB64: string;
    const hmac = createHmac("sha256", secret);
    hmac.update(signingInput);
    expectedSigB64 = hmac.digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const incomingSig = signatureB64.replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
    if (expectedSigB64 !== incomingSig) return { valid: false, reason: "signature_mismatch" };

    const payloadJson = JSON.parse(base64urlDecode(payloadB64));

    const now = Math.floor(Date.now() / 1000);
    if (payloadJson.exp && now > payloadJson.exp) return { valid: false, reason: "token_expired" };

    return { valid: true, payload: payloadJson };
  } catch (err) {
    return { valid: false, reason: "exception", payload: err };
  }
}

// Helper: insert invoice via Supabase REST
async function insertInvoice(record: {
  id?: string;
  user_id?: string | null;
  policy_id?: string | null;
  email?: string | null;
  amount?: number | null;
  currency?: string | null;
  montonio_payment_id?: string | null;
}) {
  const url = `${SUPABASE_URL}/rest/v1/invoices`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "return=representation",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify(record),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase insert failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  return json;
}

// Helper: check duplicate montonio_payment_id
async function existsMontonioPaymentId(mpid: string): Promise<boolean> {
  const url = `${SUPABASE_URL}/rest/v1/invoices?montonio_payment_id=eq.${encodeURIComponent(mpid)}&select=id`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase query failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  return Array.isArray(json) && json.length > 0;
}

Deno.serve(async (req: Request) => {
  try {
    // Validate method
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Read Authorization header
    const auth = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!auth) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const parts = auth.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return new Response(JSON.stringify({ error: "Invalid authorization header format" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const token = parts[1];

    // Verify token
    const verified = verifyJwtHs256(token, MONTONIO_SECRET);
    if (!verified.valid) {
      console.error("JWT verification failed:", verified.reason);
      return new Response(JSON.stringify({ error: "Invalid token", reason: verified.reason }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Parse body
    const body = await req.json().catch(() => null);
    if (!body) {
      return new Response(JSON.stringify({ error: "Invalid or empty JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Montonio might wrap payload in "data" or send raw
    const payload: MontonioPayload = body.data ?? body;

    const orderId = payload.orderId ?? payload.order?.id ?? payload.id ?? payload.order_id ?? payload.paymentId;
    const paymentStatus = payload.paymentStatus ?? payload.status ?? (payload.order && payload.order.status);
    const amount = payload.amount ?? (payload.order && payload.order.amount);
    const currency = payload.currency ?? (payload.order && payload.order.currency);
    const email = payload.customerEmail ?? payload.email ?? (payload.order && payload.order.customerEmail);
    const merchantReference = payload.merchantReference ?? payload.merchant_reference ?? payload.order?.merchantReference;

    if (!orderId) {
      return new Response(JSON.stringify({ error: "Missing order id in payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Only process PAID events
    if (!paymentStatus || paymentStatus.toString().toLowerCase() !== "paid") {
      return new Response(JSON.stringify({ message: "Ignored - not a PAID event", status: paymentStatus ?? null }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Deduplication: check montonio_payment_id
    const exists = await existsMontonioPaymentId(orderId);
    if (exists) {
      // Already processed
      return new Response(JSON.stringify({ message: "Already processed (duplicate)" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Prepare record
    const record = {
      user_id: null,
      policy_id: null,
      email: email ?? null,
      amount: amount ?? null,
      currency: currency ?? "EUR",
      montonio_payment_id: orderId,
    };

    // Insert invoice (service role)
    const inserted = await insertInvoice(record);

    // Optionally run background tasks
    // EdgeRuntime.waitUntil(asyncTask());

    return new Response(JSON.stringify({ message: "Inserted", invoice: inserted }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response(JSON.stringify({ error: "Internal server error", details: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
