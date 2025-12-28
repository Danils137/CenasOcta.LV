import jwt from "npm:jsonwebtoken@9.0.2"

Deno.serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get secrets from environment
    const ACCESS_KEY = Deno.env.get("MONTONIO_ACCESS_KEY")!;
    const SECRET_KEY = Deno.env.get("MONTONIO_SECRET_KEY")!;
    const API_BASE = Deno.env.get("MONTONIO_API_BASE_URL") ?? "https://stargate.montonio.com";
    const DEFAULT_CURRENCY = Deno.env.get("MONTONIO_CURRENCY") ?? "EUR";
    const DEFAULT_COUNTRY = Deno.env.get("MONTONIO_COUNTRY") ?? "LV";
    const DEFAULT_LOCALE = Deno.env.get("MONTONIO_LOCALE") ?? "en";
    const DEFAULT_GRAND_TOTAL = Deno.env.get("MONTONIO_GRAND_TOTAL") ?? "100.00";

    if (!ACCESS_KEY || !SECRET_KEY) {
      throw new Error("Montonio credentials not configured")
    }

    // Create JWT token for authorization
    const payload = { accessKey: ACCESS_KEY };
    const token = jwt.sign(payload, SECRET_KEY, {
      algorithm: "HS256",
      expiresIn: "10m",
    });

    // Make request to Montonio API
    const url = new URL(`${API_BASE}/api/stores/payment-methods`);
    const { searchParams } = new URL(req.url);
    const amount = searchParams.get("grandTotal") ?? DEFAULT_GRAND_TOTAL;
    const currency = searchParams.get("currency") ?? DEFAULT_CURRENCY;
    const country = searchParams.get("country") ?? DEFAULT_COUNTRY;
    const locale = searchParams.get("locale") ?? DEFAULT_LOCALE;

    url.searchParams.set("grandTotal", String(amount));
    url.searchParams.set("currency", currency);
    url.searchParams.set("country", country);
    url.searchParams.set("locale", locale);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!res.ok) {
      throw new Error(`Montonio API error: ${res.status}`)
    }

    const data = await res.json();

    // Filter only Bank Payments
    const banks = data.paymentMethods?.find((m: any) => m.systemName === "paymentInitiation");

    return new Response(JSON.stringify({
      banks: banks?.options || []
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch payment methods';
    console.error('Error:', message);
    return new Response(JSON.stringify({
      error: message,
      banks: []
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
