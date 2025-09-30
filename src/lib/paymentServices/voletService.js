import crypto from "crypto";

class VoletService {
  constructor() {
    this.apiKey = null;
    this.secretKey = null;
    this.apiName = null;
    this.accountEmail = null;
    this.baseUrl = "https://account.volet.com/wsm/apiWebService"; // Correct SOAP endpoint
  }

  setCredentials(apiKey, secretKey, apiName, accountEmail) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.apiName = apiName;
    this.accountEmail = accountEmail;
  }

  // Generate authentication token as per Volet documentation
  generateAuthToken() {
    const now = new Date();
    const dateUTC = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const timeUTC = now.toISOString().slice(11, 13); // HH

    const text = `${this.secretKey}:${dateUTC}:${timeUTC}`;
    const crypto = require("crypto");
    return crypto.createHash("sha256").update(text).digest("hex").toUpperCase();
  }

  /**
   * Create a new payment/invoice
   */
  async createPayment({
    orderName,
    orderNumber,
    sourceCurrency = "USD",
    sourceAmount,
    currency = "BTC",
    email = "",
    callbackUrl,
    description = "",
    plugin = "",
    version = "",
  }) {
    if (!this.apiKey) {
      throw new Error("VOLET_API_KEY not configured");
    }

    const payload = {
      api_key: this.apiKey,
      order_name: orderName,
      order_number: orderNumber,
      source_currency: sourceCurrency,
      source_amount: String(sourceAmount),
      currency: currency,
      email: email,
      callback_url: callbackUrl,
      description: description,
      plugin: plugin,
      version: version,
    };

    try {
      const response = await fetch(`${this.baseUrl}/payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || data?.status !== "success") {
        throw new Error(
          data?.message || data?.error || "Failed to create payment"
        );
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Volet create payment error:", error);

      // Return a mock response instead of throwing to prevent crashes
      return {
        success: false,
        error: "Volet payment service is currently unavailable",
        data: null,
      };
    }
  }

  /**
   * Get payment details by transaction ID
   */
  async getPaymentDetails(txnId) {
    if (!this.apiKey) {
      throw new Error("VOLET_API_KEY not configured");
    }

    try {
      const response = await fetch(`${this.baseUrl}/payments/${txnId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || data?.status !== "success") {
        throw new Error(
          data?.message || data?.error || "Failed to get payment details"
        );
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Volet get payment details error:", error);
      throw error;
    }
  }

  /**
   * Get supported cryptocurrencies
   */
  async getSupportedCurrencies() {
    if (!this.apiKey) {
      throw new Error("VOLET_API_KEY not configured");
    }

    try {
      const response = await fetch(`${this.baseUrl}/currencies`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || data?.status !== "success") {
        throw new Error(
          data?.message || data?.error || "Failed to get supported currencies"
        );
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Volet get currencies error:", error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(postData, signature) {
    if (!this.secretKey) {
      console.error("VOLET_SECRET_KEY not configured");
      return false;
    }

    if (!signature) {
      console.error("No signature in webhook data");
      return false;
    }

    try {
      // Create HMAC SHA-256 hash
      const hmac = crypto.createHmac("sha256", this.secretKey);
      hmac.update(JSON.stringify(postData));
      const calculatedSignature = hmac.digest("hex");

      const isValid = calculatedSignature === signature;

      if (!isValid) {
        console.error("Signature verification failed:", {
          calculated: calculatedSignature,
          received: signature,
        });
      }

      return isValid;
    } catch (error) {
      console.error("Error verifying webhook signature:", error);
      return false;
    }
  }

  /**
   * Get balance for specific currency
   */
  async getBalance(currency = "BTC") {
    if (!this.apiKey) {
      throw new Error("VOLET_API_KEY not configured");
    }

    try {
      const response = await fetch(`${this.baseUrl}/balances/${currency}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || data?.status !== "success") {
        throw new Error(
          data?.message || data?.error || "Failed to get balance"
        );
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Volet get balance error:", error);
      throw error;
    }
  }

  /**
   * Get payment status description
   */
  getStatusDescription(status, statusCode) {
    const statusMap = {
      new: "Payment created, waiting for payment",
      pending: "Payment received, waiting for confirmations",
      completed: "Payment completed successfully",
      failed: "Payment failed",
      cancelled: "Payment cancelled",
      expired: "Payment expired",
    };

    const codeMap = {
      1: "New payment",
      2: "Pending payment",
      3: "Payment completed",
      4: "Payment failed",
      5: "Payment cancelled",
      6: "Payment expired",
    };

    return {
      status: statusMap[status] || `Unknown status: ${status}`,
      code: codeMap[statusCode] || `Unknown code: ${statusCode}`,
      isCompleted: status === "completed",
      isPending: status === "pending",
      isWaiting: status === "new",
      isFailed: ["failed", "cancelled", "expired"].includes(status),
    };
  }

  /**
   * Format payment response with additional information
   */
  formatPaymentResponse(paymentData) {
    const statusInfo = this.getStatusDescription(
      paymentData.status,
      paymentData.status_code
    );

    return {
      ...paymentData,
      statusInfo,
      isExpired:
        paymentData.expires_at && Date.now() / 1000 > paymentData.expires_at,
      timeRemaining: paymentData.expires_at
        ? Math.max(0, paymentData.expires_at - Date.now() / 1000)
        : 0,
      formattedAmount: {
        crypto: `${paymentData.amount} ${paymentData.currency}`,
        fiat: `${paymentData.source_amount} ${paymentData.source_currency}`,
      },
      paymentUrl: paymentData.payment_url || "",
      qrCodeData: paymentData.qr_code_data || "",
    };
  }

  /**
   * Check if payment needs attention (expired, failed, etc.)
   */
  needsAttention(paymentData) {
    const now = Date.now() / 1000;
    return {
      isExpired: paymentData.expires_at && now > paymentData.expires_at,
      isExpiringSoon:
        paymentData.expires_at && paymentData.expires_at - now < 300, // 5 minutes
      hasFailed: ["failed", "cancelled"].includes(paymentData.status),
      needsAction:
        ["new", "pending"].includes(paymentData.status) &&
        (!paymentData.expires_at || now < paymentData.expires_at),
    };
  }
}

const voletService = new VoletService();
export default voletService;
