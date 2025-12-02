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
const MAX_RETRIES = 5;

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
  status?: string | null;
  merchant_reference?: string | null;
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

async function getInvoiceByPaymentId(mpid: string): Promise<any | null> {
  const url = `${SUPABASE_URL}/rest/v1/invoices?montonio_payment_id=eq.${encodeURIComponent(mpid)}&select=*`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase fetch failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  if (Array.isArray(json) && json.length > 0) {
    return json[0];
  }
  return null;
}

async function updateInvoiceStatus(mpid: string, updates: Record<string, unknown>) {
  const url = `${SUPABASE_URL}/rest/v1/invoices?montonio_payment_id=eq.${encodeURIComponent(mpid)}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "return=representation",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Supabase invoice update failed: ${res.status} ${text}`);
    return null;
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function createWebhookLog(record: Record<string, unknown>) {
  const url = `${SUPABASE_URL}/rest/v1/webhook_logs`;
  try {
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
      console.error(`Failed to insert webhook log: ${res.status} ${text}`);
      return null;
    }
    const json = await res.json();
    if (Array.isArray(json) && json.length > 0) {
      return json[0];
    }
  } catch (error) {
    console.error("Error creating webhook log:", error);
  }
  return null;
}

async function updateWebhookLog(id: string, updates: Record<string, unknown>) {
  const url = `${SUPABASE_URL}/rest/v1/webhook_logs?id=eq.${encodeURIComponent(id)}`;
  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "return=representation",
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`Failed to update webhook log: ${res.status} ${text}`);
    }
  } catch (error) {
    console.error("Error updating webhook log:", error);
  }
}

Deno.serve(async (req: Request) => {
  let logId: string | undefined;
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

    const headers: Record<string, string> = {};
    for (const [key, value] of req.headers.entries()) {
      headers[key] = value;
    }

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

    const normalizedStatus = typeof paymentStatus === "string" ? paymentStatus.toLowerCase() : "";
    const logNotes = [
      orderId ? `order_id=${orderId}` : null,
      normalizedStatus ? `montonio_status=${normalizedStatus}` : null,
      merchantReference ? `merchant_reference=${merchantReference}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    const logEntry = await createWebhookLog({
      raw_body: payload,
      headers,
      status: "processing",
      attempts: 1,
      max_retries: MAX_RETRIES,
      montonio_payment_id: orderId ?? null,
      notes: logNotes || null,
    });
    logId = logEntry?.id as string | undefined;

    if (!orderId) {
      if (logId) {
        await updateWebhookLog(logId, {
          status: "failed",
          last_error: "Missing order id in payload",
          processed_at: new Date().toISOString(),
        });
      }
      return new Response(JSON.stringify({ error: "Missing order id in payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const isSuccess = ["paid", "completed", "succeeded"].includes(normalizedStatus);
    const isFailed = ["failed", "cancelled", "declined", "rejected", "voided", "expired"].includes(normalizedStatus);
    const isPending = ["pending", "created", "awaiting_payment", "processing"].includes(normalizedStatus);

    if (!paymentStatus) {
      if (logId) {
        await updateWebhookLog(logId, {
          status: "ignored",
          processed_at: new Date().toISOString(),
          notes: [logNotes, "ignored:missing_status"].filter(Boolean).join(" | ") || null,
        });
      }
      return new Response(JSON.stringify({ message: "Ignored - missing status", status: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!isSuccess && !isFailed && !isPending) {
      if (logId) {
        await updateWebhookLog(logId, {
          status: "ignored",
          processed_at: new Date().toISOString(),
          notes: [logNotes, `ignored:status=${paymentStatus}`].filter(Boolean).join(" | ") || null,
        });
      }
      return new Response(JSON.stringify({ message: "Ignored - unhandled status", status: paymentStatus }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const nowIso = new Date().toISOString();

    if (isSuccess) {
      const existingInvoice = await getInvoiceByPaymentId(orderId).catch((error) => {
        console.error("Failed to fetch invoice by montonio_payment_id:", error);
        return null;
      });

      if (existingInvoice) {
        await updateInvoiceStatus(orderId, {
          status: "paid",
          paid_at: nowIso,
        });
        if (logId) {
          await updateWebhookLog(logId, {
            status: "succeeded",
            processed_at: nowIso,
          });
        }

        return new Response(JSON.stringify({ message: "Invoice updated to paid" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const record = {
        user_id: null,
        policy_id: null,
        email: email ?? null,
        amount: amount ?? null,
        currency: currency ?? "EUR",
        montonio_payment_id: orderId,
      };

      const inserted = await insertInvoice(record);
      await updateInvoiceStatus(orderId, {
        status: "paid",
        paid_at: nowIso,
      });
      if (logId) {
        await updateWebhookLog(logId, {
          status: "succeeded",
          processed_at: nowIso,
        });
      }

      return new Response(JSON.stringify({ message: "Inserted", invoice: inserted }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (isFailed) {
      const updates: Record<string, unknown> = {
        status: "failed",
      };
      await updateInvoiceStatus(orderId, updates);
      if (logId) {
        await updateWebhookLog(logId, {
          status: "failed",
          processed_at: nowIso,
          notes: [logNotes, `failure:${paymentStatus}`].filter(Boolean).join(" | ") || null,
        });
      }
      return new Response(JSON.stringify({ message: "Failure acknowledged", status: paymentStatus }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (isPending) {
      await updateInvoiceStatus(orderId, {
        status: "pending",
      });
      if (logId) {
        await updateWebhookLog(logId, {
          status: "pending",
          processed_at: nowIso,
        });
      }
      return new Response(JSON.stringify({ message: "Pending status recorded", status: paymentStatus }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (logId) {
      await updateWebhookLog(logId, {
        status: "ignored",
        processed_at: nowIso,
      });
    }

    return new Response(JSON.stringify({ message: "Unhandled status", status: paymentStatus }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook handler error:", err);
    if (logId) {
      await updateWebhookLog(logId, {
        status: "failed",
        processed_at: new Date().toISOString(),
        last_error: err instanceof Error ? err.message : String(err),
      });
    }
    return new Response(JSON.stringify({ error: "Internal server error", details: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
