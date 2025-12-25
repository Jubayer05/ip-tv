import crypto from "crypto";

class HoodPayService {
  constructor() {
    this.apiKey = null;
    this.businessId = null;
    this.webhookSecret = null;
    this.baseUrl = process.env.HOODPAY_BASE_URL || "https://api.hoodpay.io/v1";
    this.sandboxMode = process.env.HOODPAY_SANDBOX_MODE === "true";
    this.allowedIps = [];

    if (this.sandboxMode) {
      this.baseUrl = process.env.HOODPAY_SANDBOX_BASE_URL || this.baseUrl;
    }
  }

  // ==================== CONFIGURATION ====================

  setApiKey(apiKey) {
    if (!apiKey) {
      throw new Error("HoodPay API Key is required");
    }
    this.apiKey = apiKey;
  }

  setBusinessId(businessId) {
    if (!businessId) {
      throw new Error("HoodPay Business ID is required");
    }
    this.businessId = businessId;
  }

  setWebhookSecret(secret) {
    if (!secret) {
      console.warn("⚠️ HoodPay Webhook Secret not set - webhook verification will be skipped");
    }
    this.webhookSecret = secret;
  }

  setAllowedIps(ips) {
    if (Array.isArray(ips)) {
      this.allowedIps = ips;
    } else if (typeof ips === "string") {
      this.allowedIps = ips.split(",").map((ip) => ip.trim());
    }
  }

  // Legacy method for backward compatibility
  setCredentials(apiKey, businessId) {
    this.setApiKey(apiKey);
    this.setBusinessId(businessId);
  }

  validateCredentials() {
    if (!this.apiKey) {
      throw new Error("HoodPay API key not configured");
    }
    if (!this.businessId) {
      throw new Error("HoodPay Business ID not configured");
    }
  }

  // ==================== PAYMENT CREATION ====================

  async createPayment({
    amount,
    currency = "USD",
    orderId,
    orderDescription = "IPTV Subscription",
    customerEmail,
    metadata = {},
    notifyUrl,
    returnUrl,
    cancelUrl,
    // Legacy parameters
    description,
    callbackUrl,
    successUrl,
  }) {
    this.validateCredentials();

    const payload = {
      amount: Number(amount).toFixed(2),
      currency: currency.toUpperCase(),
      description: orderDescription || description || "IPTV Subscription",
      customer_email: customerEmail || "",
      callback_url: notifyUrl || callbackUrl,
      success_url: returnUrl || successUrl,
      cancel_url: cancelUrl,
      metadata: {
        order_id: orderId,
        ...metadata,
      },
    };

    console.log("💳 Creating HoodPay payment:", {
      ...payload,
      apiKey: this.apiKey?.substring(0, 10) + "...",
    });

    try {
      const response = await fetch(
        `${this.baseUrl}/businesses/${this.businessId}/payments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(payload),
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ HoodPay Payment Error:", data);
        throw new Error(
          data?.message || `HoodPay API Error (${response.status})`
        );
      }

      // Extract payment data from nested structure
      const paymentData = data.data?.data || data.data || data;

      console.log("✅ Payment created:", paymentData.id);

      return {
        success: true,
        data: {
          paymentId: paymentData.id,
          paymentUrl: paymentData.url || paymentData.payment_url,
          status: paymentData.status || "created",
          amount: paymentData.amount || amount,
          currency: paymentData.currency || currency.toUpperCase(),
          orderId: orderId,
          createdAt: paymentData.created_at || new Date().toISOString(),
          expiresAt: paymentData.expires_at || paymentData.expiration_date,
          metadata: paymentData.metadata || metadata,
        },
      };
    } catch (error) {
      console.error("❌ createPayment error:", error);
      throw error;
    }
  }

  // ==================== PAYMENT STATUS ====================

  async getPaymentStatus(paymentId) {
    this.validateCredentials();

    try {
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

      const text = await response.text();

      if (!text) {
        throw new Error("Empty response from HoodPay API");
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse HoodPay response:", parseError);
        throw new Error(`Invalid JSON response from HoodPay: ${text}`);
      }

      if (!response.ok) {
        throw new Error(data?.message || "Failed to get payment status");
      }

      const paymentData = data.data?.data || data.data || data;

      return {
        success: true,
        data: {
          paymentId: paymentData.id,
          status: paymentData.status,
          amount: paymentData.amount,
          currency: paymentData.currency,
          paidAmount: paymentData.paid_amount || 0,
          metadata: paymentData.metadata,
          createdAt: paymentData.created_at,
          updatedAt: paymentData.updated_at,
          completedAt: paymentData.completed_at,
          expiresAt: paymentData.expires_at,
        },
      };
    } catch (error) {
      console.error("❌ getPaymentStatus error:", error);
      throw error;
    }
  }

  // Legacy method
  async getPayment(paymentId) {
    return this.getPaymentStatus(paymentId);
  }

  // ==================== WEBHOOK VERIFICATION ====================

  verifyWebhookSignature(payload, receivedSignature, requestIp = null) {
    // IP Whitelist Check (if configured)
    if (this.allowedIps.length > 0 && requestIp) {
      const isAllowedIp = this.allowedIps.some((allowedIp) => {
        return requestIp === allowedIp || requestIp.startsWith(allowedIp);
      });

      if (!isAllowedIp) {
        console.error("❌ Request from unauthorized IP:", requestIp);
        return false;
      }
      console.log("✅ IP whitelist check passed:", requestIp);
    }

    // Signature Verification
    if (!this.webhookSecret) {
      console.warn(
        "⚠️ Webhook Secret not configured - SKIPPING signature verification"
      );
      return true;
    }

    if (!receivedSignature) {
      console.error("❌ No signature received in webhook");
      return false;
    }

    try {
      // Convert payload to string if it's an object
      const payloadString =
        typeof payload === "string" ? payload : JSON.stringify(payload);

      console.log("🔐 Verifying webhook signature...");

      // Calculate HMAC-SHA256 signature
      const hmac = crypto.createHmac("sha256", this.webhookSecret);
      const calculatedSignature = hmac.update(payloadString).digest("hex");

      const isValid = calculatedSignature === receivedSignature;

      if (!isValid) {
        console.error("❌ Signature mismatch:", {
          received: receivedSignature.substring(0, 20) + "...",
          calculated: calculatedSignature.substring(0, 20) + "...",
        });
      } else {
        console.log("✅ Webhook signature verified");
      }

      return isValid;
    } catch (error) {
      console.error("❌ Signature verification error:", error);
      return false;
    }
  }

  // ==================== STATUS MAPPING ====================

  mapStatusToPaymentStatus(hoodpayStatus) {
    const statusMap = {
      created: "pending",
      pending: "pending",
      processing: "pending",
      completed: "completed",
      paid: "completed",
      expired: "expired",
      cancelled: "failed",
      canceled: "failed",
      failed: "failed",
    };

    return statusMap[hoodpayStatus?.toLowerCase()] || "pending";
  }

  mapStatusToOrderStatus(hoodpayStatus) {
    const statusMap = {
      created: "new",
      pending: "new",
      processing: "processing",
      completed: "confirmed",
      paid: "confirmed",
      expired: "cancelled",
      cancelled: "cancelled",
      canceled: "cancelled",
      failed: "cancelled",
    };

    return statusMap[hoodpayStatus?.toLowerCase()] || "new";
  }

  mapStatusToSubscriptionStatus(hoodpayStatus) {
    const statusMap = {
      created: "inactive",
      pending: "inactive",
      processing: "inactive",
      completed: "active",
      paid: "active",
      expired: "expired",
      cancelled: "cancelled",
      canceled: "cancelled",
      failed: "expired",
    };

    return statusMap[hoodpayStatus?.toLowerCase()] || "inactive";
  }

  // ==================== WEBHOOK EVENT TYPES ====================

  isPaymentCompleted(eventType) {
    return (
      eventType === "payment:completed" ||
      eventType === "payment.completed" ||
      eventType === "payment:paid" ||
      eventType === "payment.paid"
    );
  }

  isPaymentFailed(eventType) {
    return (
      eventType === "payment:failed" ||
      eventType === "payment.failed" ||
      eventType === "payment:cancelled" ||
      eventType === "payment.cancelled" ||
      eventType === "payment:canceled" ||
      eventType === "payment.canceled"
    );
  }

  isPaymentExpired(eventType) {
    return eventType === "payment:expired" || eventType === "payment.expired";
  }

  // ==================== UTILITY METHODS ====================

  async getAvailableCurrencies() {
    this.validateCredentials();

    try {
      const response = await fetch(`${this.baseUrl}/currencies`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to get currencies");
      }

      return {
        success: true,
        currencies: data.currencies || data.data || data,
      };
    } catch (error) {
      console.error("❌ getAvailableCurrencies error:", error);
      return {
        success: false,
        currencies: [],
      };
    }
  }

  async getExchangeRate(fromCurrency, toCurrency, amount) {
    this.validateCredentials();

    try {
      const response = await fetch(
        `${this.baseUrl}/exchange-rates?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to get exchange rate");
      }

      return {
        success: true,
        rate: data.rate,
        amount: data.amount,
      };
    } catch (error) {
      console.error("❌ getExchangeRate error:", error);
      return {
        success: false,
        rate: null,
      };
    }
  }

  getStatusDescription(status) {
    const statusMap = {
      created: "Payment created",
      pending: "Payment pending",
      processing: "Payment processing",
      completed: "Payment completed successfully",
      paid: "Payment completed successfully",
      failed: "Payment failed",
      canceled: "Payment cancelled",
      cancelled: "Payment cancelled",
      expired: "Payment expired",
    };

    const lowerStatus = (status || "").toLowerCase();
    return {
      status: statusMap[lowerStatus] || `Unknown status: ${status}`,
      isCompleted: ["completed", "paid"].includes(lowerStatus),
      isPending: ["created", "pending", "processing"].includes(lowerStatus),
      isFailed: ["failed", "canceled", "cancelled", "expired"].includes(
        lowerStatus
      ),
    };
  }
}

const hoodpayService = new HoodPayService();
export default hoodpayService;
