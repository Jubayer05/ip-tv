import crypto from "crypto";

/**
 * Volet SCI (Shopping Cart Interface) Payment Service
 * 
 * Based on official Volet documentation:
 * - SCI URL: https://account.volet.com/sci/
 * - Authentication: Time-based token (SHA-256 of secretKey:YYYYMMDD:HH in UTC)
 * - Signature: HMAC-SHA256 of sorted parameters
 */
class VoletService {
  constructor() {
    this.sciPassword = null;      // SCI Password (apiKey) - for generating ac_sign
    this.apiSecurityWord = null;  // API Security Word (apiSecret) - for webhook verification
    this.sciName = null;          // SCI Name (businessId) - ac_sci_name
    this.accountEmail = null;     // Volet Account Email (merchantId) - ac_account_email
    this.sciUrl = "https://account.volet.com/sci/";
  }

  /**
   * Initialize service with credentials from PaymentSettings
   */
  initialize(paymentSettings) {
    if (!paymentSettings) {
      throw new Error("Payment settings are required");
    }

    this.sciPassword = paymentSettings.apiKey;           // SCI Password
    this.apiSecurityWord = paymentSettings.apiSecret;    // API Security Word
    this.sciName = paymentSettings.businessId;           // SCI Name
    this.accountEmail = paymentSettings.merchantId;      // Volet Account Email

    console.log("[VoletService] Initialized with:", {
      hasSciPassword: !!this.sciPassword,
      hasApiSecurityWord: !!this.apiSecurityWord,
      sciName: this.sciName,
      accountEmail: this.accountEmail,
    });
  }

  /**
   * Legacy method for backward compatibility
   */
  setCredentials(apiKey, secretKey, sciName, accountEmail) {
    this.sciPassword = apiKey;
    this.apiSecurityWord = secretKey;
    this.sciName = sciName || this.sciName;
    this.accountEmail = accountEmail || this.accountEmail;
  }

  /**
   * Generate time-based authentication token as per Volet documentation
   * Format: SHA-256 hash of "secretKey:YYYYMMDD:HH" (UTC time)
   */
  generateAuthToken() {
    if (!this.sciPassword) {
      throw new Error("SCI Password not configured");
    }

    const now = new Date();
    const dateUTC = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const hourUTC = now.toISOString().slice(11, 13); // HH

    const tokenString = `${this.sciPassword}:${dateUTC}:${hourUTC}`;
    const token = crypto.createHash("sha256").update(tokenString).digest("hex").toUpperCase();

    console.log("[VoletService] Generated auth token for:", { dateUTC, hourUTC });
    return token;
  }

  /**
   * Generate HMAC-SHA256 signature for SCI form (ac_sign)
   * Per Volet docs: Sort parameters alphabetically, concatenate values, then HMAC-SHA256
   * 
   * @param {Object} params - Form parameters (excluding ac_sign)
   * @returns {string} - HMAC-SHA256 signature in uppercase hex
   */
  generateSignature(params) {
    if (!this.sciPassword) {
      throw new Error("SCI Password not configured for signature generation");
    }

    // Sort parameters alphabetically by key
    const sortedKeys = Object.keys(params).sort();
    
    // Concatenate values in sorted order
    const signatureString = sortedKeys
      .filter(key => key !== "ac_sign") // Exclude ac_sign itself
      .map(key => params[key])
      .join("");

    // Create HMAC-SHA256 signature
    const signature = crypto
      .createHmac("sha256", this.sciPassword)
      .update(signatureString)
      .digest("hex")
      .toUpperCase();

    console.log("[VoletService] Generated signature:", {
      paramCount: sortedKeys.length,
      signatureLength: signature.length,
    });

    return signature;
  }

  /**
   * Build SCI form data for payment
   * 
   * @param {Object} options - Payment options
   * @returns {Object} - Form data with all required fields including ac_sign
   */
  buildSCIFormData({
    orderId,
    amount,
    currency = "USD",
    description = "",
    statusUrl = "",
    successUrl = "",
    failUrl = "",
    customerEmail = "",
  }) {
    if (!this.accountEmail || !this.sciName) {
      throw new Error("Volet account email and SCI name are required");
    }

    // Build form parameters (all ac_ prefixed as per Volet spec)
    const formData = {
      ac_account_email: this.accountEmail,
      ac_sci_name: this.sciName,
      ac_amount: String(Number(amount).toFixed(2)),
      ac_currency: currency.toUpperCase(),
      ac_order_id: String(orderId),
    };

    // Add optional fields if provided
    if (description) {
      formData.ac_comments = description;
    }
    if (statusUrl) {
      formData.ac_status_url = statusUrl; // Webhook callback URL
    }
    if (successUrl) {
      formData.ac_success_url = successUrl;
    }
    if (failUrl) {
      formData.ac_fail_url = failUrl;
    }
    if (customerEmail) {
      formData.ac_payer_email = customerEmail;
    }

    // Generate signature
    formData.ac_sign = this.generateSignature(formData);

    console.log("[VoletService] Built SCI form data:", {
      orderId: formData.ac_order_id,
      amount: formData.ac_amount,
      currency: formData.ac_currency,
      hasSignature: !!formData.ac_sign,
    });

    return formData;
  }

  /**
   * Create a payment and return the SCI checkout URL
   * 
   * @param {Object} options - Payment options
   * @returns {Object} - Payment result with checkout URL
   */
  async createPayment({
    orderId,
    amount,
    currency = "USD",
    description = "",
    statusUrl = "",
    successUrl = "",
    failUrl = "",
    customerEmail = "",
  }) {
    try {
      // Build form data
      const formData = this.buildSCIFormData({
        orderId,
        amount,
        currency,
        description,
        statusUrl,
        successUrl,
        failUrl,
        customerEmail,
      });

      // Build checkout URL with query parameters
      // Volet SCI accepts both POST form and GET with query params
      const queryParams = new URLSearchParams(formData).toString();
      const checkoutUrl = `${this.sciUrl}?${queryParams}`;

      console.log("[VoletService] Created payment:", {
        orderId,
        amount,
        currency,
        checkoutUrlLength: checkoutUrl.length,
      });

      return {
        success: true,
        data: {
          paymentId: orderId,
          orderId: orderId,
          checkoutUrl: checkoutUrl,
          formData: formData,
          sciUrl: this.sciUrl,
          amount: amount,
          currency: currency,
          status: "pending",
        },
      };
    } catch (error) {
      console.error("[VoletService] Create payment error:", error);
      return {
        success: false,
        error: error.message || "Failed to create Volet payment",
        data: null,
      };
    }
  }

  /**
   * Verify webhook signature from Volet callback
   * 
   * @param {Object} callbackData - Webhook payload
   * @returns {boolean} - True if signature is valid
   */
  verifyWebhookSignature(callbackData) {
    if (!this.apiSecurityWord) {
      console.error("[VoletService] API Security Word not configured for webhook verification");
      return false;
    }

    const receivedSignature = callbackData.ac_sign;
    if (!receivedSignature) {
      console.error("[VoletService] No ac_sign in webhook data");
      return false;
    }

    try {
      // Build params object excluding ac_sign
      const params = { ...callbackData };
      delete params.ac_sign;

      // Sort parameters alphabetically
      const sortedKeys = Object.keys(params).sort();
      
      // Concatenate values in sorted order
      const signatureString = sortedKeys
        .map(key => params[key])
        .join("");

      // Calculate expected signature using API Security Word
      const expectedSignature = crypto
        .createHmac("sha256", this.apiSecurityWord)
        .update(signatureString)
        .digest("hex")
        .toUpperCase();

      const isValid = expectedSignature === receivedSignature.toUpperCase();

      if (!isValid) {
        console.error("[VoletService] Webhook signature mismatch:", {
          expected: expectedSignature.substring(0, 16) + "...",
          received: receivedSignature.substring(0, 16) + "...",
        });
      } else {
        console.log("[VoletService] Webhook signature verified successfully");
      }

      return isValid;
    } catch (error) {
      console.error("[VoletService] Error verifying webhook signature:", error);
      return false;
    }
  }

  /**
   * Parse webhook callback data and extract payment info
   * 
   * @param {Object} callbackData - Raw webhook data from Volet
   * @returns {Object} - Parsed payment information
   */
  parseWebhookData(callbackData) {
    return {
      orderId: callbackData.ac_order_id,
      transactionId: callbackData.ac_transaction_id || callbackData.ac_transfer,
      amount: parseFloat(callbackData.ac_amount || 0),
      currency: callbackData.ac_currency || "USD",
      payerEmail: callbackData.ac_payer_email || "",
      status: this.mapWebhookStatus(callbackData),
      rawData: callbackData,
    };
  }

  /**
   * Map Volet webhook status to internal status
   * 
   * @param {Object} callbackData - Webhook data
   * @returns {string} - Internal status (pending, completed, failed)
   */
  mapWebhookStatus(callbackData) {
    // Volet sends different fields to indicate status
    // Check for transaction ID presence as indicator of success
    if (callbackData.ac_transaction_id || callbackData.ac_transfer) {
      return "completed";
    }
    
    // Check for error indicators
    if (callbackData.ac_error || callbackData.error) {
      return "failed";
    }

    return "pending";
  }

  /**
   * Get payment status description
   */
  getStatusDescription(status) {
    const statusMap = {
      pending: "Payment pending - waiting for completion",
      completed: "Payment completed successfully",
      failed: "Payment failed",
      expired: "Payment expired",
      cancelled: "Payment cancelled",
    };

    return {
      status: statusMap[status] || `Unknown status: ${status}`,
      isCompleted: status === "completed",
      isPending: status === "pending",
      isFailed: ["failed", "expired", "cancelled"].includes(status),
    };
  }

  /**
   * Format payment response with additional information
   */
  formatPaymentResponse(paymentData) {
    const statusInfo = this.getStatusDescription(paymentData.status);

    return {
      ...paymentData,
      statusInfo,
      formattedAmount: `${paymentData.amount} ${paymentData.currency}`,
    };
  }
}

const voletService = new VoletService();
export default voletService;
