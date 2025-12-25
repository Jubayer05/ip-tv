import crypto from "crypto";
import axios from "axios";

/**
 * NOWPayments Service - Production Ready
 * Handles all NOWPayments API interactions with proper validation and error handling
 */
class NOWPaymentsService {
  constructor() {
    this.apiKey = null;
    this.ipnSecret = null;
    this.sandboxMode = process.env.NOWPAYMENTS_SANDBOX_MODE === "true";
    this.baseUrl = this.sandboxMode
      ? "https://api-sandbox.nowpayments.io/v1"
      : "https://api.nowpayments.io/v1";

    if (this.sandboxMode) {
      console.warn("NOWPayments running in SANDBOX mode");
    }
  }

  /**
   * Initialize service with fresh credentials from database
   * Call this on EVERY request to avoid caching issues
   */
  async initialize(paymentSettings) {
    if (!paymentSettings) {
      throw new Error("Payment settings not provided");
    }

    if (!paymentSettings.apiKey) {
      throw new Error("NOWPayments API key not configured in settings");
    }

    this.apiKey = paymentSettings.apiKey;
    this.ipnSecret = paymentSettings.ipnSecret || paymentSettings.apiSecret;
    
    if (paymentSettings.sandboxMode) {
      this.sandboxMode = true;
      this.baseUrl = "https://api-sandbox.nowpayments.io/v1";
    }

    console.log("NOWPayments service initialized:", {
      hasApiKey: !!this.apiKey,
      hasIpnSecret: !!this.ipnSecret,
      sandboxMode: this.sandboxMode,
      baseUrl: this.baseUrl,
    });
  }

  /**
   * Validate credentials before API calls
   */
  validateCredentials() {
    if (!this.apiKey) {
      throw new Error(
        "NOWPayments API key not set. Call initialize() first."
      );
    }
  }

  /**
   * Create Invoice - PRODUCTION READY
   * This is the CORRECT way to create NOWPayments checkout
   */
  async createInvoice({
    price_amount,
    price_currency = "usd",
    order_id,
    order_description = "Crypto Deposit",
    ipn_callback_url,
    success_url,
    cancel_url,
    customer_email,
  }) {
    this.validateCredentials();

    // 🔥 CRITICAL VALIDATION
    if (!price_amount || typeof price_amount !== "number" || price_amount <= 0) {
      throw new Error(
        `Invalid price_amount: ${price_amount}. Must be a positive number.`
      );
    }

    if (!order_id || typeof order_id !== "string") {
      throw new Error(`Invalid order_id: ${order_id}. Must be a string.`);
    }

    if (!success_url || !success_url.startsWith("http")) {
      throw new Error(
        `Invalid success_url: ${success_url}. success_url is REQUIRED and must be a valid URL.`
      );
    }

    if (!cancel_url || !cancel_url.startsWith("http")) {
      throw new Error(
        `Invalid cancel_url: ${cancel_url}. cancel_url is REQUIRED and must be a valid URL.`
      );
    }

    // Build payload
    const payload = {
      price_amount: Number(price_amount).toFixed(2),
      price_currency: price_currency.toLowerCase(),
      order_id: String(order_id),
      order_description,
      ipn_callback_url:
        ipn_callback_url || process.env.NOWPAYMENTS_IPN_URL,
      success_url,
      cancel_url,
    };

    if (customer_email) {
      payload.customer_email = customer_email;
    }

    console.log("Creating NOWPayments invoice:", {
      price_amount: payload.price_amount,
      price_currency: payload.price_currency,
      order_id: payload.order_id,
      success_url: payload.success_url?.substring(0, 50) + "...",
      cancel_url: payload.cancel_url?.substring(0, 50) + "...",
      ipn_callback_url: payload.ipn_callback_url?.substring(0, 50) + "...",
    });

    try {
      const response = await axios.post(
        `${this.baseUrl}/invoice`,
        payload,
        {
          headers: {
            "x-api-key": this.apiKey,
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 second timeout
        }
      );

      console.log("NOWPayments invoice created:", {
        status: response.status,
        invoiceId: response.data.id,
        invoiceUrl: response.data.invoice_url,
      });

      // Normalize URL format (fix missing slash)
      let invoiceUrl = response.data.invoice_url;
      if (invoiceUrl && invoiceUrl.includes("payment?iid=")) {
        invoiceUrl = invoiceUrl.replace("payment?iid=", "payment/?iid=");
      }

      return {
        success: true,
        data: {
          invoiceId: response.data.id,
          invoiceUrl: invoiceUrl,
          purchaseId: response.data.purchase_id || response.data.id,
          orderId: response.data.order_id,
          priceAmount: parseFloat(response.data.price_amount),
          priceCurrency: response.data.price_currency.toUpperCase(),
          createdAt: response.data.created_at,
          expirationEstimateDate: response.data.expiration_estimate_date,
        },
      };
    } catch (error) {
      console.error("NOWPayments invoice creation error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      // Enhanced error messages
      if (error.response?.status === 401) {
        throw new Error(
          "Invalid API key. Please check your NOWPayments credentials."
        );
      }

      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.message || "Invalid request";
        throw new Error(`NOWPayments validation error: ${errorMsg}`);
      }

      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create invoice"
      );
    }
  }

  /**
   * Get Payment Status
   */
  async getPaymentStatus(paymentId) {
    this.validateCredentials();

    if (!paymentId) {
      throw new Error("Payment ID is required");
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/payment/${paymentId}`,
        {
          headers: {
            "x-api-key": this.apiKey,
          },
          timeout: 15000,
        }
      );

      return {
        success: true,
        data: {
          paymentId: response.data.payment_id,
          invoiceId: response.data.invoice_id,
          paymentStatus: response.data.payment_status,
          payAddress: response.data.pay_address,
          priceAmount: parseFloat(response.data.price_amount),
          priceCurrency: response.data.price_currency.toUpperCase(),
          payCurrency: response.data.pay_currency?.toUpperCase(),
          payAmount: parseFloat(response.data.pay_amount || 0),
          actuallyPaid: parseFloat(response.data.actually_paid || 0),
          orderId: response.data.order_id,
          orderDescription: response.data.order_description,
          createdAt: response.data.created_at,
          updatedAt: response.data.updated_at,
          expirationEstimateDate: response.data.expiration_estimate_date,
        },
      };
    } catch (error) {
      console.error("Get payment status error:", {
        paymentId,
        message: error.message,
        status: error.response?.status,
      });

      throw new Error(
        error.response?.data?.message || "Failed to get payment status"
      );
    }
  }

  /**
   * Get Available Currencies
   */
  async getAvailableCurrencies() {
    this.validateCredentials();

    try {
      const response = await axios.get(`${this.baseUrl}/currencies`, {
        headers: {
          "x-api-key": this.apiKey,
        },
        timeout: 15000,
      });

      return {
        success: true,
        currencies: response.data.currencies || [],
      };
    } catch (error) {
      console.error("Get currencies error:", error.message);
      throw error;
    }
  }

  /**
   * Get Minimum Payment Amount
   */
  async getMinimumPaymentAmount(currencyFrom, currencyTo = null) {
    this.validateCredentials();

    try {
      let url = `${this.baseUrl}/min-amount?currency_from=${currencyFrom}`;
      if (currencyTo) {
        url += `&currency_to=${currencyTo}`;
      }

      const response = await axios.get(url, {
        headers: {
          "x-api-key": this.apiKey,
        },
        timeout: 15000,
      });

      return {
        success: true,
        minAmount: parseFloat(response.data.min_amount),
      };
    } catch (error) {
      console.error("Get minimum amount error:", error.message);
      throw error;
    }
  }

  /**
   * Get Estimated Price
   */
  async getEstimatedPrice(amount, currencyFrom, currencyTo) {
    this.validateCredentials();

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount for price estimate");
    }

    try {
      const url = `${this.baseUrl}/estimate?amount=${amount}&currency_from=${currencyFrom}&currency_to=${currencyTo}`;

      const response = await axios.get(url, {
        headers: {
          "x-api-key": this.apiKey,
        },
        timeout: 15000,
      });

      return {
        success: true,
        data: {
          currencyFrom: response.data.currency_from.toUpperCase(),
          amountFrom: parseFloat(response.data.amount_from),
          currencyTo: response.data.currency_to.toUpperCase(),
          estimatedAmount: parseFloat(response.data.estimated_amount),
        },
      };
    } catch (error) {
      console.error("Get estimate error:", error.message);
      throw error;
    }
  }

  /**
   * Verify IPN Webhook Signature - PRODUCTION READY
   */
  verifyIpnSignature(webhookBody, receivedSignature) {
    if (!this.ipnSecret) {
      console.error(
        "IPN Secret not configured - REJECTING webhook for security"
      );
      return false;
    }

    if (!receivedSignature) {
      console.error("No signature received in webhook header");
      return false;
    }

    try {
      // Sort keys alphabetically as per NOWPayments spec
      const sortedKeys = Object.keys(webhookBody).sort();
      const sortedData = {};
      sortedKeys.forEach((key) => {
        sortedData[key] = webhookBody[key];
      });

      const sortedJson = JSON.stringify(sortedData);

      // Calculate HMAC SHA-512
      const hmac = crypto.createHmac("sha512", this.ipnSecret);
      const calculatedSignature = hmac.update(sortedJson).digest("hex");

      const isValid = calculatedSignature === receivedSignature;

      if (!isValid) {
        console.error("Webhook signature mismatch:", {
          received: receivedSignature.substring(0, 20) + "...",
          calculated: calculatedSignature.substring(0, 20) + "...",
        });
      } else {
        console.log("Webhook signature verified successfully");
      }

      return isValid;
    } catch (error) {
      console.error("Signature verification error:", error);
      return false;
    }
  }

  /**
   * Map NOWPayments status to internal status
   */
  mapToInternalStatus(nowpaymentsStatus) {
    const statusMap = {
      waiting: "pending",
      confirming: "processing",
      confirmed: "processing",
      sending: "processing",
      partially_paid: "pending",
      finished: "completed",
      failed: "failed",
      refunded: "cancelled",
      expired: "cancelled",
    };

    return statusMap[nowpaymentsStatus] || "pending";
  }
}

// Singleton instance
const nowpaymentsService = new NOWPaymentsService();
export default nowpaymentsService;
