import jwt from "https://esm.sh/jsonwebtoken@9.0.2"

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
    const res = await fetch("https://stargate.montonio.com/api/stores/payment-methods", {
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
    console.error('Error:', err);
    return new Response(JSON.stringify({
      error: err.message,
      banks: []
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
