class CryptomusService {
  constructor() {
    this.apiKey = process.env.CRYPTOMUS_API_KEY;
    this.merchantId = process.env.CRYPTOMUS_MERCHANT_ID;
    this.baseUrl = "https://api.cryptomus.com/v1";
  }

  // Generate signature for API requests
  generateSignature(data, apiKey) {
    const crypto = require("crypto");
    const dataString = JSON.stringify(data);
    const signature = crypto
      .createHash("md5")
      .update(Buffer.from(dataString).toString("base64") + apiKey)
      .digest("hex");
    return signature;
  }

  async createPayment({
    amount,
    currency = "USD",
    orderId,
    description = "IPTV Subscription",
    urlReturn,
    urlCallback,
    isTest = false,
    lifetime = 7200, // 2 hours
    toCurrency = "USDT",
    subtract = 0,
    additionalData = "",
    currencies = [],
    exceptCurrencies = [],
    network = "",
    address = "",
    isRefundable = true,
    contactEmail = "",
    name = "",
    urlSuccess = "",
    urlFailed = "",
  }) {
    if (!this.apiKey || !this.merchantId) {
      throw new Error(
        "CRYPTOMUS_API_KEY and CRYPTOMUS_MERCHANT_ID must be configured"
      );
    }

    try {
      const requestData = {
        amount: amount.toString(),
        currency,
        order_id: orderId,
        description,
        url_return: urlReturn,
        url_callback: urlCallback,
        is_test: isTest,
        lifetime,
        to_currency: toCurrency,
        subtract,
        additional_data: additionalData,
        currencies,
        except_currencies: exceptCurrencies,
        network,
        address,
        is_refundable: isRefundable,
        contact_email: contactEmail,
        name,
        url_success: urlSuccess,
        url_failed: urlFailed,
      };

      // Remove empty values
      Object.keys(requestData).forEach((key) => {
        if (
          requestData[key] === "" ||
          requestData[key] === null ||
          requestData[key] === undefined
        ) {
          delete requestData[key];
        }
      });

      const signature = this.generateSignature(requestData, this.apiKey);

      const response = await fetch(`${this.baseUrl}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          merchant: this.merchantId,
          sign: signature,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Cryptomus API error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();

      if (data.state !== 0) {
        throw new Error(`Cryptomus error: ${data.message || "Unknown error"}`);
      }

      return {
        success: true,
        paymentId: data.result.uuid,
        paymentUrl: data.result.url,
        orderId: data.result.order_id,
        amount: data.result.amount,
        currency: data.result.currency,
        toCurrency: data.result.to_currency,
        toAmount: data.result.to_amount,
        address: data.result.address,
        network: data.result.network,
        from: data.result.from,
        status: data.result.status,
        isFinal: data.result.is_final,
        additionalData: data.result.additional_data,
        currencies: data.result.currencies,
        createdAt: data.result.created_at,
        updatedAt: data.result.updated_at,
        expiredAt: data.result.expired_at,
        isTest: data.result.is_test,
        paymentMethod: data.result.payment_method,
        paymentStatus: data.result.payment_status,
        transactions: data.result.transactions || [],
      };
    } catch (error) {
      console.error("Cryptomus createPayment error:", error);
      throw error;
    }
  }

  async getPaymentStatus(paymentId) {
    if (!this.apiKey || !this.merchantId) {
      throw new Error(
        "CRYPTOMUS_API_KEY and CRYPTOMUS_MERCHANT_ID must be configured"
      );
    }

    try {
      const requestData = {
        uuid: paymentId,
      };

      const signature = this.generateSignature(requestData, this.apiKey);

      const response = await fetch(`${this.baseUrl}/payment/${paymentId}`, {
        method: "GET",
        headers: {
          merchant: this.merchantId,
          sign: signature,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Cryptomus status error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();

      if (data.state !== 0) {
        throw new Error(`Cryptomus error: ${data.message || "Unknown error"}`);
      }

      return {
        success: true,
        paymentId: data.result.uuid,
        paymentUrl: data.result.url,
        orderId: data.result.order_id,
        amount: data.result.amount,
        currency: data.result.currency,
        toCurrency: data.result.to_currency,
        toAmount: data.result.to_amount,
        address: data.result.address,
        network: data.result.network,
        from: data.result.from,
        status: data.result.status,
        isFinal: data.result.is_final,
        additionalData: data.result.additional_data,
        currencies: data.result.currencies,
        createdAt: data.result.created_at,
        updatedAt: data.result.updated_at,
        expiredAt: data.result.expired_at,
        isTest: data.result.is_test,
        paymentMethod: data.result.payment_method,
        paymentStatus: data.result.payment_status,
        transactions: data.result.transactions || [],
      };
    } catch (error) {
      console.error("Cryptomus getPaymentStatus error:", error);
      throw error;
    }
  }

  async getPaymentInfo(paymentId) {
    if (!this.apiKey || !this.merchantId) {
      throw new Error(
        "CRYPTOMUS_API_KEY and CRYPTOMUS_MERCHANT_ID must be configured"
      );
    }

    try {
      const requestData = {
        uuid: paymentId,
      };

      const signature = this.generateSignature(requestData, this.apiKey);

      const response = await fetch(`${this.baseUrl}/payment/info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          merchant: this.merchantId,
          sign: signature,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Cryptomus info error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();

      if (data.state !== 0) {
        throw new Error(`Cryptomus error: ${data.message || "Unknown error"}`);
      }

      return {
        success: true,
        paymentId: data.result.uuid,
        paymentUrl: data.result.url,
        orderId: data.result.order_id,
        amount: data.result.amount,
        currency: data.result.currency,
        toCurrency: data.result.to_currency,
        toAmount: data.result.to_amount,
        address: data.result.address,
        network: data.result.network,
        from: data.result.from,
        status: data.result.status,
        isFinal: data.result.is_final,
        additionalData: data.result.additional_data,
        currencies: data.result.currencies,
        createdAt: data.result.created_at,
        updatedAt: data.result.updated_at,
        expiredAt: data.result.expired_at,
        isTest: data.result.is_test,
        paymentMethod: data.result.payment_method,
        paymentStatus: data.result.payment_status,
        transactions: data.result.transactions || [],
      };
    } catch (error) {
      console.error("Cryptomus getPaymentInfo error:", error);
      throw error;
    }
  }

  // Map Cryptomus status to our payment status
  mapStatusToPaymentStatus(cryptomusStatus) {
    const statusMap = {
      waiting: "pending",
      confirm_check: "pending",
      paid: "completed",
      paid_over: "completed",
      fail: "failed",
      cancel: "failed",
      system_fail: "failed",
      refund_process: "refunded",
      refund_fail: "refunded",
      refund_paid: "refunded",
      locked: "pending",
    };
    return statusMap[cryptomusStatus] || "pending";
  }
}

export default new CryptomusService();
