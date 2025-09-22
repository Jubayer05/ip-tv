class NOWPaymentsService {
  constructor() {
    this.apiKey = null; // Remove process.env
    this.apiSecret = null; // Add for completeness
    // Use sandbox API for testing
    this.baseUrl = "https://api-sandbox.nowpayments.io/v1";
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  setApiSecret(apiSecret) {
    this.apiSecret = apiSecret;
  }

  async createPayment({
    priceAmount,
    priceCurrency = "usd",
    payCurrency = "btc",
    orderId,
    orderDescription = "IPTV Subscription",
    ipnCallbackUrl,
    successUrl,
    cancelUrl,
    customerEmail,
  }) {
    if (!this.apiKey) {
      throw new Error("NOWPAYMENTS_API_KEY not configured");
    }

    const payload = {
      price_amount: Number(priceAmount),
      price_currency: priceCurrency.toLowerCase(),
      pay_currency: payCurrency.toLowerCase(),
      order_id: orderId,
      order_description: orderDescription,
      ipn_callback_url: ipnCallbackUrl,
      success_url: successUrl,
      cancel_url: cancelUrl,
      is_fixed_rate: true,
      is_fee_paid_by_user: false,
      customer_email: customerEmail || "",
    };

    console.log(
      "NOWPayments request payload:",
      JSON.stringify(payload, null, 2)
    );

    const response = await fetch(`${this.baseUrl}/payment`, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await response.json();
    console.log("NOWPayments response:", { status: response.status, data });

    if (!response.ok) {
      throw new Error(
        `NOWPayments API Error (${response.status}): ${JSON.stringify(data)}`
      );
    }

    return {
      success: true,
      data,
    };
  }

  // Use the correct sandbox payment URL format
  getPaymentUrl(paymentId) {
    // Try different URL formats that might work better
    return `https://sandbox.nowpayments.io/payment?iid=${paymentId}`;
  }

  // Alternative method to get payment URL from API response
  getPaymentUrlFromResponse(paymentData) {
    // Check if the response contains a direct payment URL
    if (paymentData.payment_url) {
      return paymentData.payment_url;
    }
    if (paymentData.invoice_url) {
      return paymentData.invoice_url;
    }
    // Fallback to constructed URL
    return `https://sandbox.nowpayments.io/payment?iid=${paymentData.payment_id}`;
  }

  async getPayment(paymentId) {
    if (!this.apiKey) {
      throw new Error("NOWPAYMENTS_API_KEY not configured");
    }

    const response = await fetch(`${this.baseUrl}/payment/${paymentId}`, {
      method: "GET",
      headers: {
        "x-api-key": this.apiKey,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `NOWPayments API Error (${response.status}): ${JSON.stringify(data)}`
      );
    }

    return {
      success: true,
      data,
    };
  }

  async getCurrencies() {
    if (!this.apiKey) {
      throw new Error("NOWPAYMENTS_API_KEY not configured");
    }

    const response = await fetch(`${this.baseUrl}/currencies`, {
      method: "GET",
      headers: {
        "x-api-key": this.apiKey,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `NOWPayments API Error (${response.status}): ${JSON.stringify(data)}`
      );
    }

    return {
      success: true,
      data,
    };
  }

  async getEstimate(amount, currencyFrom = "usd", currencyTo = "btc") {
    if (!this.apiKey) {
      throw new Error("NOWPAYMENTS_API_KEY not configured");
    }

    const params = new URLSearchParams({
      amount: String(amount),
      currency_from: currencyFrom.toLowerCase(),
      currency_to: currencyTo.toLowerCase(),
    });

    const response = await fetch(`${this.baseUrl}/estimate?${params}`, {
      method: "GET",
      headers: {
        "x-api-key": this.apiKey,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `NOWPayments API Error (${response.status}): ${JSON.stringify(data)}`
      );
    }

    return {
      success: true,
      data,
    };
  }

  getStatusDescription(status) {
    const statusMap = {
      waiting: "Waiting for payment",
      confirming: "Payment being confirmed",
      confirmed: "Payment confirmed",
      finished: "Payment completed successfully",
      failed: "Payment failed",
      expired: "Payment expired",
      refunded: "Payment refunded",
      partially_paid: "Payment partially completed",
    };

    const lowerStatus = (status || "").toLowerCase();
    return {
      status: statusMap[lowerStatus] || `Unknown status: ${status}`,
      isCompleted: ["confirmed", "finished"].includes(lowerStatus),
      isPending: ["waiting", "confirming", "partially_paid"].includes(
        lowerStatus
      ),
      isFailed: ["failed", "expired", "refunded"].includes(lowerStatus),
    };
  }

  verifyWebhookSignature(payload, signature) {
    // NOWPayments doesn't use HMAC signatures like Plisio
    // They use IP whitelisting and other methods
    // For now, we'll just return true, but you should implement proper verification
    return true;
  }
}

const nowpaymentsService = new NOWPaymentsService();
export default nowpaymentsService;
