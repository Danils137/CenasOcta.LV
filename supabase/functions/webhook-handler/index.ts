// webhook-handler.ts
import { createClient } from "npm:@supabase/supabase-js@2.33.0";
import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("MONTONIO_WEBHOOK_SECRET")!;
const MAX_RETRIES = 5;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
}
if (!WEBHOOK_SECRET) {
  console.error("Missing MONTONIO_WEBHOOK_SECRET environment variable");
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

console.info("webhook-handler starting");

// Function to verify webhook signature
async function verifySignature(rawBody: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature) return false;
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(rawBody);
    const secretBytes = encoder.encode(secret);
    const key = await crypto.subtle.importKey("raw", secretBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const hmac = await crypto.subtle.sign("HMAC", key, data);
    const hashBuffer = new Uint8Array(hmac);
    const computedSignature = btoa(String.fromCharCode(...hashBuffer)); // Base64 encode
    return computedSignature === signature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

// Function to process webhook payload
async function processWebhook(sb: any, logId: string, body: any) {
  try {
    // === Place business logic here ===
    // Example: update invoice status based on Montonio payload
    const paymentStatus = body?.status ?? body?.data?.status ?? 'unknown';
    const invoiceId = body?.invoice_id ?? body?.data?.invoice_id ?? null;

    if (paymentStatus === 'paid' && invoiceId) {
      // Example: update invoice table (adjust table and fields as needed)
      const { error: invoiceErr } = await sb
        .from("invoices") // Replace with your actual table
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", invoiceId);

      if (invoiceErr) throw invoiceErr;

      // Update webhook log
      const { error: updateErr } = await sb
        .from("webhook_logs")
        .update({
          status: "succeeded",
          attempts: sb.raw("attempts + 1"),
          processed_at: new Date().toISOString(),
          invoice_id: invoiceId,
        })
        .eq("id", logId);

      if (updateErr) throw updateErr;

      return true;
    } else {
      // For non-paid statuses or missing fields, mark as processed with note
      const { error: updateErr } = await sb
        .from("webhook_logs")
        .update({
          status: "succeeded",
          attempts: sb.raw("attempts + 1"),
          processed_at: new Date().toISOString(),
          invoice_id: invoiceId,
          notes: `Payment status: ${paymentStatus}`,
        })
        .eq("id", logId);

      if (updateErr) throw updateErr;

      return true;
    }
  } catch (err) {
    const errMsg = String((err as Error)?.message ?? err);
    await sb
      .from("webhook_logs")
      .update({
        status: "failed",
        attempts: sb.raw("attempts + 1"),
        last_error: errMsg,
      })
      .eq("id", logId);
    console.error("Processing error:", errMsg);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  try {
    // Collect headers
    const headers: Record<string, string> = {};
    for (const [k, v] of req.headers) headers[k] = v;

    // Read raw body
    const rawText = await req.text();

    // Verify webhook signature before processing
    const signature = req.headers.get("x-montonio-signature") || req.headers.get("signature");
    if (!verifySignature(rawText, signature, WEBHOOK_SECRET)) {
      console.warn("Invalid webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse JSON body
    let body: any = null;
    try {
      body = JSON.parse(rawText);
    } catch {
      body = rawText;
    }

    // Extract payment id (adjust the path to match your provider)
    const montonio_payment_id = body?.payment_id ?? body?.data?.payment?.id ?? null;

    // Idempotency: try to find existing log by montonio_payment_id
    let logId: string | null = null;
    if (montonio_payment_id) {
      const { data: existing, error: existingErr } = await sb
        .from("webhook_logs")
        .select("id, status")
        .eq("montonio_payment_id", montonio_payment_id)
        .limit(1)
        .maybeSingle();

      if (existingErr) {
        console.warn("Error checking existing webhook log:", existingErr);
      } else if (existing) {
        // If already succeeded, short-circuit
        if (existing.status === "succeeded") {
          return new Response(JSON.stringify({ ok: true, message: "Already processed" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
        logId = existing.id;
      }
    }

    // Insert new log if none exists
    if (!logId) {
      const insertPayload = {
        raw_body: typeof body === "string" ? null : body,
        headers,
        status: "processing",
        attempts: 0,
        max_retries: MAX_RETRIES,
        montonio_payment_id,
      };

      const { data: insertData, error: insertErr } = await sb
        .from("webhook_logs")
        .insert(insertPayload)
        .select("id")
        .single();

      if (insertErr) {
        console.error("Failed to insert webhook log:", insertErr);
        return new Response(JSON.stringify({ error: "failed to create log" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
      logId = insertData.id;
    }

    // logId should be set at this point
    if (!logId) {
      console.error("Log ID not set - this should not happen");
      return new Response(JSON.stringify({ error: "internal error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Process the webhook
    const ok = await processWebhook(sb, logId, body);

    if (!ok) {
      // Schedule background retries using EdgeRuntime.waitUntil
      const retryBackground = (async () => {
        try {
          for (let i = 1; i <= MAX_RETRIES; i++) {
            // Backoff: 30s * attempt, capped at 5min
            const delayMs = Math.min(30000 * i, 300000);
            await new Promise((r) => setTimeout(r, delayMs));

            const { data: attemptRow, error: attemptErr } = await sb
              .from("webhook_logs")
              .select("attempts, max_retries, status")
              .eq("id", logId)
              .maybeSingle();

            if (attemptErr || !attemptRow) {
              // If we can't read the row, stop retrying
              break;
            }

            const attempts = (attemptRow.attempts as number) ?? 0;
            const maxRetries = (attemptRow.max_retries as number) ?? MAX_RETRIES;
            const status = attemptRow.status;

            if (status === "succeeded") break;
            if (attempts >= maxRetries) break;

            // Re-run the processing logic using the same function
            const success = await processWebhook(sb, logId, body);
            if (success) {
              break;
            }
          }
        } catch (e) {
          console.error("Retry background error:", e);
        }
      })();

      // Use EdgeRuntime.waitUntil if available
      try {
        (globalThis as any).EdgeRuntime?.waitUntil?.(retryBackground);
      } catch {
        // Some runtime may not provide EdgeRuntime; still run background promise but don't block
        retryBackground.catch(() => {});
      }

      return new Response(JSON.stringify({ ok: true, message: "Queued for retry" }), {
        status: 202,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Fatal error in webhook handler:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
