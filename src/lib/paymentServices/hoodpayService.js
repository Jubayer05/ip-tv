class HoodPayService {
  constructor() {
    this.apiKey = null; // Remove process.env
    this.businessId = null; // Remove process.env
    this.baseUrl = "https://api.hoodpay.io/v1";
  }

  setCredentials(apiKey, businessId) {
    this.apiKey = apiKey;
    this.businessId = businessId;
  }

  async createPayment({
    amount,
    currency = "USD",
    customerEmail,
    description = "IPTV Subscription",
    callbackUrl,
    successUrl,
    metadata = {},
  }) {
    if (!this.apiKey) {
      throw new Error("HOODPAY_API_KEY not configured");
    }
    if (!this.businessId) {
      throw new Error("HOODPAY_BUSINESS_ID not configured");
    }

    // Based on HoodPay API docs, let's use the correct endpoint and required fields
    const body = {
      amount: Number(amount),
      currency: currency.toUpperCase(),
      customer_email: customerEmail || "",
      description,
      callback_url: callbackUrl,
      success_url: successUrl,
      // Only include metadata if it's not empty and supported
      ...(Object.keys(metadata).length > 0 && { metadata }),
    };

    const response = await fetch(
      `${this.baseUrl}/businesses/${this.businessId}/payments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    const data = await response.json();
    console.log("HoodPay response:", { status: response.status, data });

    if (!response.ok) {
      throw new Error(
        `HoodPay API Error (${response.status}): ${JSON.stringify(data)}`
      );
    }

    // HoodPay returns data in a nested structure, so we need to extract the actual payment data
    const paymentData = data.data?.data || data.data || data;

    return {
      success: true,
      data: {
        id: paymentData.id,
        payment_url: paymentData.url,
        status: "pending", // HoodPay doesn't return status in create response
        amount: Number(amount),
        currency: currency.toUpperCase(),
      },
    };
  }

  async getPayment(paymentId) {
    if (!this.apiKey) {
      throw new Error("HOODPAY_API_KEY not configured");
    }
    if (!this.businessId) {
      throw new Error("HOODPAY_BUSINESS_ID not configured");
    }

    console.log(`Fetching HoodPay payment: ${paymentId}`);

    // Use the correct endpoint with business ID
    const response = await fetch(
      `${this.baseUrl}/businesses/${this.businessId}/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        cache: "no-store",
      }
    );

    console.log(
      `HoodPay status response: ${response.status} ${response.statusText}`
    );

    // Check if response is empty or not JSON
    const text = await response.text();
    console.log(`HoodPay raw response:`, text);

    if (!text) {
      throw new Error("Empty response from HoodPay API");
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse HoodPay response as JSON:", parseError);
      throw new Error(`Invalid JSON response from HoodPay: ${text}`);
    }

    if (!response.ok) {
      throw new Error(
        `HoodPay API Error (${response.status}): ${JSON.stringify(data)}`
      );
    }

    return {
      success: true,
      data,
    };
  }

  getStatusDescription(status) {
    const statusMap = {
      pending: "Payment pending",
      paid: "Payment completed successfully",
      failed: "Payment failed",
      canceled: "Payment cancelled",
      expired: "Payment expired",
    };

    const lowerStatus = (status || "").toLowerCase();
    return {
      status: statusMap[lowerStatus] || `Unknown status: ${status}`,
      isCompleted: lowerStatus === "paid",
      isPending: lowerStatus === "pending",
      isFailed: ["failed", "canceled", "expired"].includes(lowerStatus),
    };
  }
}

const hoodpayService = new HoodPayService();
export default hoodpayService;
