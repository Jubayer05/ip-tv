import crypto from "crypto";

class PlisioService {
  constructor() {
    this.apiKey = process.env.PLISIO_API_KEY;
    this.secretKey = process.env.PLISIO_SECRET_KEY;
    this.baseUrl = "https://api.plisio.net/api/v1";
  }

  /**
   * Create a new invoice
   */
  async createInvoice({
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
      throw new Error("PLISIO_API_KEY not configured");
    }

    const params = new URLSearchParams({
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
    });

    const url = `${this.baseUrl}/invoices/new?${params.toString()}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || data?.status !== "success") {
        throw new Error(
          data?.data?.message || data?.data || "Failed to create invoice"
        );
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Plisio create invoice error:", error);
      throw error;
    }
  }

  /**
   * Get invoice details by transaction ID
   */
  async getInvoiceDetails(txnId) {
    if (!this.apiKey) {
      throw new Error("PLISIO_API_KEY not configured");
    }

    const params = new URLSearchParams({
      api_key: this.apiKey,
    });

    const url = `${this.baseUrl}/operations/${txnId}?${params.toString()}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || data?.status !== "success") {
        throw new Error(
          data?.data?.message || data?.data || "Failed to get invoice details"
        );
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Plisio get invoice details error:", error);
      throw error;
    }
  }

  /**
   * Get supported cryptocurrencies
   */
  async getSupportedCurrencies() {
    if (!this.apiKey) {
      throw new Error("PLISIO_API_KEY not configured");
    }

    const params = new URLSearchParams({
      api_key: this.apiKey,
    });

    const url = `${this.baseUrl}/currencies?${params.toString()}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || data?.status !== "success") {
        throw new Error(
          data?.data?.message ||
            data?.data ||
            "Failed to get supported currencies"
        );
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Plisio get currencies error:", error);
      throw error;
    }
  }

  /**
   * Verify callback signature
   */
  verifyCallbackSignature(postData) {
    if (!this.secretKey) {
      console.error("PLISIO_SECRET_KEY not configured");
      return false;
    }

    if (!postData.verify_hash) {
      console.error("No verify_hash in callback data");
      return false;
    }

    try {
      const { verify_hash, ...data } = postData;

      // Sort the data keys and create ordered object
      const orderedData = {};
      Object.keys(data)
        .sort()
        .forEach((key) => {
          if (
            data[key] !== null &&
            data[key] !== undefined &&
            data[key] !== ""
          ) {
            orderedData[key] = data[key];
          }
        });

      // Create the string to hash
      const dataString = Object.keys(orderedData)
        .map((key) => `${key}=${orderedData[key]}`)
        .join("&");

      // Create HMAC SHA-1 hash
      const hmac = crypto.createHmac("sha1", this.secretKey);
      hmac.update(dataString);
      const calculatedHash = hmac.digest("hex");

      const isValid = calculatedHash === verify_hash;

      if (!isValid) {
        console.error("Signature verification failed:", {
          calculated: calculatedHash,
          received: verify_hash,
          dataString,
        });
      }

      return isValid;
    } catch (error) {
      console.error("Error verifying callback signature:", error);
      return false;
    }
  }

  /**
   * Get balance for specific currency
   */
  async getBalance(currency = "BTC") {
    if (!this.apiKey) {
      throw new Error("PLISIO_API_KEY not configured");
    }

    const params = new URLSearchParams({
      api_key: this.apiKey,
      currency: currency,
    });

    const url = `${this.baseUrl}/balances?${params.toString()}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || data?.status !== "success") {
        throw new Error(
          data?.data?.message || data?.data || "Failed to get balance"
        );
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Plisio get balance error:", error);
      throw error;
    }
  }

  /**
   * Get fee estimation
   */
  async getFeeEstimation(currency, addresses, amounts) {
    if (!this.apiKey) {
      throw new Error("PLISIO_API_KEY not configured");
    }

    const params = new URLSearchParams({
      api_key: this.apiKey,
      currency: currency,
      addresses: addresses,
      amounts: amounts,
    });

    const url = `${this.baseUrl}/operations/fee?${params.toString()}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || data?.status !== "success") {
        throw new Error(
          data?.data?.message || data?.data || "Failed to get fee estimation"
        );
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error("Plisio get fee estimation error:", error);
      throw error;
    }
  }

  /**
   * Get payment status description
   */
  getStatusDescription(status, statusCode) {
    const statusMap = {
      new: "Invoice created, waiting for payment",
      pending: "Payment received, waiting for confirmations",
      completed: "Payment completed successfully",
      error: "Payment failed",
      cancelled: "Payment cancelled",
      expired: "Invoice expired",
    };

    const codeMap = {
      1: "New invoice",
      2: "Pending payment",
      3: "Payment completed",
      4: "Payment error",
      5: "Payment cancelled",
      6: "Invoice expired",
    };

    return {
      status: statusMap[status] || `Unknown status: ${status}`,
      code: codeMap[statusCode] || `Unknown code: ${statusCode}`,
      isCompleted: status === "completed",
      isPending: status === "pending",
      isWaiting: status === "new",
      isFailed: ["error", "cancelled", "expired"].includes(status),
    };
  }

  /**
   * Format invoice response with additional information
   */
  formatInvoiceResponse(invoiceData) {
    const statusInfo = this.getStatusDescription(
      invoiceData.status,
      invoiceData.status_code
    );

    return {
      ...invoiceData,
      statusInfo,
      isExpired: Date.now() / 1000 > invoiceData.expire_at_utc,
      timeRemaining: Math.max(0, invoiceData.expire_at_utc - Date.now() / 1000),
      formattedAmount: {
        crypto: `${invoiceData.amount} ${invoiceData.currency}`,
        fiat: `${invoiceData.params.source_amount} ${invoiceData.source_currency}`,
      },
      paymentUrl: `bitcoin:${invoiceData.wallet_hash}?amount=${invoiceData.amount}`,
      qrCodeData: `bitcoin:${invoiceData.wallet_hash}?amount=${
        invoiceData.amount
      }&label=${encodeURIComponent(invoiceData.params.order_name)}`,
    };
  }

  /**
   * Check if invoice needs attention (expired, failed, etc.)
   */
  needsAttention(invoiceData) {
    const now = Date.now() / 1000;
    return {
      isExpired: now > invoiceData.expire_at_utc,
      isExpiringSoon: invoiceData.expire_at_utc - now < 300, // 5 minutes
      hasFailed: ["error", "cancelled"].includes(invoiceData.status),
      needsAction:
        ["new", "pending"].includes(invoiceData.status) &&
        now < invoiceData.expire_at_utc,
    };
  }
}

const plisioService = new PlisioService();
export default plisioService;
