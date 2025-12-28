import jwt from "https://esm.sh/jsonwebtoken@9.0.2";

interface OrderRequest {
  amount: number;
  currency: string;
  description: string;
  bankId: string;
  customer: {
    firstName?: string;
    lastName?: string;
    companyName?: string;
    email?: string;
    phone?: string;
  };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const ACCESS_KEY = Deno.env.get("MONTONIO_ACCESS_KEY");
    const SECRET_KEY = Deno.env.get("MONTONIO_SECRET_KEY");
    const RETURN_URL = Deno.env.get("MONTONIO_RETURN_URL") ?? "https://cenasocta.lv/payment/success";
    const NOTIFICATION_URL = Deno.env.get("MONTONIO_NOTIFICATION_URL") ?? "";
    const API_BASE = Deno.env.get("MONTONIO_API_BASE_URL") ?? "https://stargate.montonio.com";

    if (!ACCESS_KEY || !SECRET_KEY) {
      throw new Error("Montonio credentials not configured");
    }

    const orderData: OrderRequest = await req.json();
    const { amount, currency, description, bankId, customer } = orderData;

    // Улучшенная валидация входных данных
    if (!amount || amount <= 0) {
      throw new Error("Invalid amount: must be a positive number");
    }
    if (!currency || !/^[A-Z]{3}$/.test(currency)) {
      throw new Error("Invalid currency: must be a 3-letter currency code (e.g., EUR)");
    }
    if (!description || description.trim().length < 3) {
      throw new Error("Invalid description: must be at least 3 characters long");
    }
    if (!bankId || bankId.trim().length < 2) {
      throw new Error("Invalid bank ID: must be at least 2 characters long");
    }
    if (customer?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      throw new Error("Invalid email format");
    }
    if (customer?.phone && !/^[\d\s\-\+\(\)]{6,}$/.test(customer.phone)) {
      throw new Error("Invalid phone number format");
    }

    // Улучшенная безопасность JWT: добавляем merchantReference и timestamp
    const tokenPayload = {
      accessKey: ACCESS_KEY,
      merchantReference: `CENAS-${Date.now()}`,
      timestamp: Date.now(),
      bankId: bankId,
      amount: amount,
    };
    
    const token = jwt.sign(tokenPayload, SECRET_KEY, {
      algorithm: "HS256",
      expiresIn: "5m", // Сокращаем время жизни токена для большей безопасности
    });

    const merchantReference = `CENAS-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;

    const orderPayload = {
      merchantReference,
      returnUrl: RETURN_URL,
      ...(NOTIFICATION_URL ? { notificationUrl: NOTIFICATION_URL } : {}),
      grandTotal: (amount / 100).toFixed(2),
      currency,
      paymentMethod: "bankPayment",
      paymentInitiationProvider: bankId,
      products: [
        {
          name: description,
          quantity: 1,
          price: (amount / 100).toFixed(2),
          sku: `insurance-${Date.now()}`,
        },
      ],
      billingAddress: {
        firstName: customer.firstName ?? "",
        lastName: customer.lastName ?? "",
        companyName: customer.companyName ?? "",
        email: customer.email ?? "",
        phoneNumber: customer.phone ?? "",
        addressLine1: "",
        city: "Riga",
        country: "LV",
        postalCode: "",
      },
    };

    console.log("Creating Montonio order", {
      merchantReference,
      bankId,
      amount,
      currency,
    });

    const response = await fetch(`${API_BASE}/api/stores/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Montonio API error", response.status, responseData);
      throw new Error(`Failed to create order: ${response.status}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        order: responseData,
        paymentUrl: responseData.paymentUrl,
        orderId: responseData.merchantReference ?? merchantReference,
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create order";
    console.error("create-order error", message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
