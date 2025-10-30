import jwt from "https://esm.sh/jsonwebtoken@9.0.2"

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

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders
    })
  }

  try {
    // Get secrets from environment
    const ACCESS_KEY = Deno.env.get("MONTONIO_ACCESS_KEY")!;
    const SECRET_KEY = Deno.env.get("MONTONIO_SECRET_KEY")!;

    if (!ACCESS_KEY || !SECRET_KEY) {
      throw new Error("Montonio credentials not configured")
    }

    // Parse request body
    const orderData: OrderRequest = await req.json();
    const { amount, currency, description, bankId, customer } = orderData;

    // Validate required fields
    if (!amount || !currency || !bankId) {
      throw new Error("Missing required fields: amount, currency, bankId")
    }

    // Create JWT token for authorization
    const payload = { accessKey: ACCESS_KEY };
    const token = jwt.sign(payload, SECRET_KEY, {
      algorithm: "HS256",
      expiresIn: "10m",
    });

    // Generate unique order reference
    const merchantReference = `CENAS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Prepare order data for Montonio API
    const orderPayload = {
      merchantReference: merchantReference, // Уникальный ID заказа для отслеживания
      returnUrl: "https://cenasocta.lv/payment/success", // URL после успешной оплаты
      notificationUrl: "https://your-domain.com/webhook/payment-complete", // Webhook URL для уведомлений
      grandTotal: (amount / 100).toFixed(2), // Сумма в евро с 2 знаками после запятой
      currency: currency, // Валюта
      paymentMethod: "bankPayment", // Метод оплаты для банков
      paymentInitiationProvider: bankId, // ID выбранного банка
      products: [
        {
          name: description, // Название страховки
          quantity: 1,
          price: (amount / 100).toFixed(2), // Цена в евро
          sku: `insurance-${Date.now()}`, // SKU продукта
        }
      ],
      billingAddress: {
        firstName: customer.firstName || "",
        lastName: customer.lastName || "",
        companyName: customer.companyName || "",
        email: customer.email || "",
        phoneNumber: customer.phone || "",
        addressLine1: "",
        city: "Riga", // По умолчанию Riga для LV
        country: "LV",
        postalCode: "",
      }
    };

    console.log("Creating order with payload:", JSON.stringify(orderPayload, null, 2));

    // Make request to Montonio API
    const res = await fetch("https://stargate.montonio.com/api/stores/orders", {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderPayload)
    });

    const responseData = await res.json();

    if (!res.ok) {
      console.error("Montonio API error:", responseData);
      throw new Error(`Failed to create order: ${res.status}`)
    }

    console.log("Order created successfully:", responseData);

    return new Response(JSON.stringify({
      success: true,
      order: responseData,
      paymentUrl: responseData.paymentUrl, // URL для перенаправления в банк
      orderId: responseData.merchantReference
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err) {
    console.error('Error creating order:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to create order';

    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
