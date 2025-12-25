import crypto from "crypto";

class NOWPaymentsService {
  constructor() {
    console.log("🟢🟢🟢 NOWPAYMENTS V1 SERVICE LOADED 🟢🟢🟢");
    this.apiKey = null;
    this.ipnSecret = null;
    this.baseUrl = process.env.NOWPAYMENTS_BASE_URL || "https://api.nowpayments.io/v1";
    this.sandboxMode = process.env.NOWPAYMENTS_SANDBOX_MODE === "true";
    
    if (this.sandboxMode) {
      this.baseUrl = process.env.NOWPAYMENTS_SANDBOX_BASE_URL || 
        "https://api-sandbox.nowpayments.io/v1";
      console.log("⚠️ NOWPayments running in SANDBOX mode");
    }
  }

  setApiKey(apiKey) {
    if (!apiKey) {
      throw new Error("NOWPayments API Key is required");
    }
    this.apiKey = apiKey;
  }

  setIpnSecret(ipnSecret) {
    if (!ipnSecret) {
      console.warn("⚠️ NOWPayments IPN Secret not set - webhook verification will be skipped");
    }
    this.ipnSecret = ipnSecret;
  }

  setSandboxMode(isSandbox = false) {
    this.sandboxMode = isSandbox;
    this.baseUrl = isSandbox 
      ? "https://api-sandbox.nowpayments.io/v1"
      : "https://api.nowpayments.io/v1";
  }

  validateCredentials() {
    if (!this.apiKey) {
      throw new Error("NOWPayments API key not configured. Please set it in Payment Settings.");
    }
  }

  // ==================== SUBSCRIPTION METHODS ====================

  /**
   * Create a subscription plan
   * https://documenter.getpostman.com/view/7907941/T1LSCRHC#ce4913e2-0fc2-4722-b89e-d1f3e6c9c0e5
   */
  async createSubscriptionPlan({
    title,
    description = "",
    price_amount,
    price_currency = "usd",
    interval_day,
  }) {
    this.validateCredentials();

    const payload = {
      title,
      description,
      price_amount: Number(price_amount),
      price_currency: price_currency.toLowerCase(),
      interval_day: Number(interval_day),
    };

    console.log("📋 Creating NOWPayments subscription plan:", payload);

    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/plans`, {
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ NOWPayments Plan Creation Error:", data);
        throw new Error(
          data?.message || `Failed to create plan (${response.status})`
        );
      }

      console.log("✅ Subscription plan created:", data.id);

      return {
        success: true,
        data: {
          subscriptionId: data.id,
          title: data.title,
          description: data.description,
          priceAmount: data.price_amount,
          priceCurrency: data.price_currency,
          intervalDay: data.interval_day,
          createdAt: data.created_at,
        },
      };
    } catch (error) {
      console.error("❌ createSubscriptionPlan error:", error);
      throw error;
    }
  }

  /**
   * Create a subscription for a user (email recurring)
   * https://documenter.getpostman.com/view/7907941/T1LSCRHC#0e3b5c5e-0fc2-4722-b89e-d1f3e6c9c0e5
   */
  async createSubscription({
    subscription_plan_id,
    email,
    order_id,
    order_description = "IPTV Subscription",
  }) {
    this.validateCredentials();

    const payload = {
      subscription_plan_id,
      email,
      order_id,
      order_description,
    };

    console.log("📧 Creating NOWPayments email subscription:", {
      ...payload,
      email: email.replace(/(.{3}).*(@.*)/, "$1***$2"),
    });

    try {
      const response = await fetch(`${this.baseUrl}/subscriptions`, {
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ NOWPayments Subscription Error:", data);
        throw new Error(
          data?.message || `Failed to create subscription (${response.status})`
        );
      }

      console.log("✅ Subscription created:", data.id);

      return {
        success: true,
        data: {
          subscriptionId: data.id,
          subscriptionPlanId: data.subscription_plan_id,
          email: data.email,
          orderId: data.order_id,
          status: data.status,
          createdAt: data.created_at,
        },
      };
    } catch (error) {
      console.error("❌ createSubscription error:", error);
      throw error;
    }
  }

  /**
   * Create an invoice for manual payment
   * https://documenter.getpostman.com/view/7907941/T1LSCRHC#0e3b5c5e-0fc2-4722-b89e-d1f3e6c9c0e5
   */
  async createInvoice({
    price_amount,
    price_currency = "usd",
    order_id,
    order_description = "IPTV Subscription",
    ipn_callback_url,
    success_url,
    cancel_url,
    customer_email,
    purchase_id, // For partial payments
  }) {
    this.validateCredentials();

    // CRITICAL: Validate required fields
    if (!price_amount || Number(price_amount) <= 0) {
      throw new Error("price_amount is required and must be > 0");
    }

    if (!order_id) {
      throw new Error("order_id is required");
    }

    if (!success_url) {
      throw new Error("success_url is REQUIRED for NOWPayments invoice - without it, the checkout UI will be broken");
    }

    if (!cancel_url) {
      throw new Error("cancel_url is REQUIRED for NOWPayments invoice - without it, the checkout UI will be broken");
    }

    const payload = {
      price_amount: Number(price_amount),
      price_currency: price_currency.toLowerCase(),
      order_id: String(order_id),
      order_description,
      ipn_callback_url: ipn_callback_url || process.env.APP_WEBHOOK_URL,
      success_url,
      cancel_url,
    };

    if (customer_email) {
      payload.customer_email = customer_email;
    }

    if (purchase_id) {
      payload.purchase_id = purchase_id; // Continue partial payment
    }

    console.log("🧾 Creating NOWPayments invoice with payload:", {
      ...payload,
      ipn_callback_url: payload.ipn_callback_url?.substring(0, 50) + "...",
    });

    try {
      const response = await fetch(`${this.baseUrl}/invoice`, {
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log("📡 NOWPayments Invoice Response:", {
        status: response.status,
        statusText: response.statusText,
        data: data,
      });

      if (!response.ok) {
        console.error("❌ NOWPayments Invoice Error:", data);
        throw new Error(
          data?.message || `Failed to create invoice (${response.status})`
        );
      }

      console.log("✅ Invoice created successfully:", {
        id: data.id,
        invoiceUrl: data.invoice_url,
      });

      return {
        success: true,
        data: {
          invoiceId: data.id,
          invoiceUrl: data.invoice_url,
          purchaseId: data.purchase_id || data.id,
          orderId: data.order_id,
          priceAmount: data.price_amount,
          priceCurrency: data.price_currency,
          createdAt: data.created_at,
          expirationEstimateDate: data.expiration_estimate_date,
        },
      };
    } catch (error) {
      console.error("❌ createInvoice error:", error);
      throw error;
    }
  }

  // ==================== PAYMENT METHODS ====================

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
    isFixedRate = true,
    isFeePaidByUser = false,
    purchaseId, // For partial payments
  }) {
    this.validateCredentials();

    const payload = {
      price_amount: Number(priceAmount).toFixed(2),
      price_currency: priceCurrency.toLowerCase(),
      pay_currency: payCurrency.toLowerCase(),
      order_id: String(orderId),
      order_description: orderDescription,
      ipn_callback_url: ipnCallbackUrl || process.env.APP_WEBHOOK_URL,
      success_url: successUrl,
      cancel_url: cancelUrl,
      is_fixed_rate: isFixedRate,
      is_fee_paid_by_user: isFeePaidByUser,
    };

    if (customerEmail) {
      payload.customer_email = customerEmail;
    }

    if (purchaseId) {
      payload.purchase_id = purchaseId;
    }

    console.log("💳 Creating NOWPayments payment:", {
      ...payload,
      apiKey: this.apiKey?.substring(0, 10) + "...",
    });

    try {
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

      console.log("📡 NOWPayments API raw response:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error("❌ NOWPayments Payment Error:", {
          status: response.status,
          statusText: response.statusText,
          data,
        });
        throw new Error(
          data?.message || 
          data?.error || 
          `NOWPayments API Error (${response.status}): ${response.statusText}`
        );
      }

      console.log("✅ Payment created:", data.payment_id);

      // ✅ FIX: Correctly map NOWPayments API response fields
      // 🔥 IMPORTANT: Use purchase_id (not payment_id) for checkout URL
      const checkoutUrl = data.invoice_url || 
                         data.payment_url || 
                         (data.purchase_id ? `https://nowpayments.io/payment/?iid=${data.purchase_id}` : null);

      console.log("🔗 Generated checkout URL:", checkoutUrl);

      return {
        success: true,
        data: {
          payment_id: data.payment_id,              // Internal tracking ID
          paymentId: data.payment_id,               
          purchase_id: data.purchase_id,            // ✅ Checkout/Invoice ID
          purchaseId: data.purchase_id,             
          pay_address: data.pay_address,
          payAddress: data.pay_address,
          pay_currency: data.pay_currency,
          payCurrency: data.pay_currency,
          price_amount: data.price_amount,
          priceAmount: data.price_amount,
          price_currency: data.price_currency,
          priceCurrency: data.price_currency,
          pay_amount: data.pay_amount,
          payAmount: data.pay_amount,
          actually_paid: data.actually_paid || 0,
          actuallyPaid: data.actually_paid || 0,
          payment_status: data.payment_status,      
          paymentStatus: data.payment_status,       
          order_description: data.order_description,
          orderDescription: data.order_description,
          order_id: data.order_id,
          orderId: data.order_id,
          created_at: data.created_at,
          createdAt: data.created_at,
          updated_at: data.updated_at,
          updatedAt: data.updated_at,
          payment_url: checkoutUrl,                 // ✅ Correct URL with purchase_id
          paymentUrl: checkoutUrl,                  // ✅ Primary checkout URL
          invoice_url: data.invoice_url,
          invoiceUrl: data.invoice_url,
          expiration_estimate_date: data.expiration_estimate_date,
          expirationEstimateDate: data.expiration_estimate_date,
          network_fee: data.network_fee,
          networkFee: data.network_fee,
          amount_received: data.amount_received || 0,
          amountReceived: data.amount_received || 0,
          payin_extra_id: data.payin_extra_id || null,
          payinExtraId: data.payin_extra_id || null,
        },
      };
    } catch (error) {
      console.error("❌ createPayment error:", error);
      throw error;
    }
  }

  async getPaymentStatus(paymentId) {
    this.validateCredentials();

    if (!paymentId) {
      throw new Error("Payment ID is required");
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/payment/${paymentId}`,
        {
          method: "GET",
          headers: {
            "x-api-key": this.apiKey,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ NOWPayments Status Error:", data);
        throw new Error(
          data?.message || `Failed to get payment status (${response.status})`
        );
      }

      return {
        success: true,
        data: {
          paymentId: data.payment_id,
          paymentStatus: data.payment_status,
          payAddress: data.pay_address,
          priceAmount: data.price_amount,
          priceCurrency: data.price_currency,
          payCurrency: data.pay_currency,
          payAmount: data.pay_amount,
          actuallyPaid: data.actually_paid || 0,
          amountReceived: data.amount_received || 0,
          orderId: data.order_id,
          orderDescription: data.order_description,
          purchaseId: data.purchase_id,
          outcomeAmount: data.outcome_amount,
          outcomeCurrency: data.outcome_currency,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          expirationEstimateDate: data.expiration_estimate_date,
          networkFee: data.network_fee,
          burnedAmount: data.burned_amount,
        },
      };
    } catch (error) {
      console.error("❌ getPaymentStatus error:", error);
      throw error;
    }
  }

  async getMinimumPaymentAmount(currencyFrom, currencyTo = null) {
    this.validateCredentials();

    try {
      let url = `${this.baseUrl}/min-amount?currency_from=${currencyFrom}`;
      if (currencyTo) {
        url += `&currency_to=${currencyTo}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-api-key": this.apiKey,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to get minimum amount");
      }

      return {
        success: true,
        minAmount: data.min_amount,
      };
    } catch (error) {
      console.error("❌ getMinimumPaymentAmount error:", error);
      throw error;
    }
  }

  async getEstimatedPrice(amount, currencyFrom, currencyTo) {
    this.validateCredentials();

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    try {
      const url = `${this.baseUrl}/estimate?amount=${amount}&currency_from=${currencyFrom}&currency_to=${currencyTo}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-api-key": this.apiKey,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to get estimate");
      }

      return {
        success: true,
        data: {
          currencyFrom: data.currency_from,
          amountFrom: data.amount_from,
          currencyTo: data.currency_to,
          estimatedAmount: data.estimated_amount,
        },
      };
    } catch (error) {
      console.error("❌ getEstimatedPrice error:", error);
      throw error;
    }
  }

  async getAvailableCurrencies() {
    this.validateCredentials();

    try {
      const response = await fetch(`${this.baseUrl}/currencies`, {
        method: "GET",
        headers: {
          "x-api-key": this.apiKey,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to get currencies");
      }

      return {
        success: true,
        currencies: data.currencies || [],
      };
    } catch (error) {
      console.error("❌ getAvailableCurrencies error:", error);
      throw error;
    }
  }

  // ==================== WEBHOOK VERIFICATION ====================

  /**
   * Verify NOWPayments IPN webhook signature
   * https://documenter.getpostman.com/view/7907941/T1LSCRHC#cb16e6cf-89e6-4b5e-8e60-c06c3e08c0e5
   */
  verifyIpnSignature(webhookBody, receivedSignature) {
    if (!this.ipnSecret) {
      console.warn("⚠️ IPN Secret not configured - SKIPPING signature verification");
      return true;
    }

    if (!receivedSignature) {
      console.error("❌ No signature received in webhook");
      return false;
    }

    try {
      // Sort keys alphabetically
      const sortedKeys = Object.keys(webhookBody).sort();
      const sortedData = {};
      sortedKeys.forEach((key) => {
        sortedData[key] = webhookBody[key];
      });

      const sortedJson = JSON.stringify(sortedData);
      
      console.log("🔐 Verifying signature for sorted JSON:", 
        sortedJson.substring(0, 100) + "...");

      const hmac = crypto.createHmac("sha512", this.ipnSecret);
      const calculatedSignature = hmac.update(sortedJson).digest("hex");

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

  mapStatusToPaymentStatus(nowpaymentsStatus) {
    const statusMap = {
      waiting: "pending",
      confirming: "pending",
      confirmed: "pending",
      sending: "pending",
      partially_paid: "pending",
      finished: "completed",
      failed: "failed",
      refunded: "refunded",
      expired: "expired",
    };

    return statusMap[nowpaymentsStatus] || "pending";
  }

  mapStatusToOrderStatus(nowpaymentsStatus) {
    const statusMap = {
      waiting: "new",
      confirming: "processing",
      confirmed: "processing",
      sending: "processing",
      partially_paid: "new",
      finished: "confirmed",
      failed: "cancelled",
      refunded: "cancelled",
      expired: "cancelled",
    };

    return statusMap[nowpaymentsStatus] || "new";
  }

  mapStatusToSubscriptionStatus(nowpaymentsStatus) {
    const statusMap = {
      waiting: "inactive",
      confirming: "inactive",
      confirmed: "inactive",
      sending: "inactive",
      partially_paid: "past_due",
      finished: "active",
      failed: "expired",
      refunded: "cancelled",
      expired: "expired",
    };

    return statusMap[nowpaymentsStatus] || "inactive";
  }

  // ==================== LEGACY METHODS ====================

  // Use the correct payment URL format
  getPaymentUrl(paymentId) {
    return this.sandboxMode
      ? `https://sandbox.nowpayments.io/payment?iid=${paymentId}`
      : `https://nowpayments.io/payment/?iid=${paymentId}`;
  }

  // Alternative method to get payment URL from API response
  getPaymentUrlFromResponse(paymentData) {
    if (paymentData.payment_url) {
      return paymentData.payment_url;
    }
    if (paymentData.invoice_url) {
      return paymentData.invoice_url;
    }
    return this.getPaymentUrl(paymentData.payment_id);
  }

  async getPayment(paymentId) {
    return this.getPaymentStatus(paymentId);
  }

  async getCurrencies() {
    const result = await this.getAvailableCurrencies();
    return {
      success: result.success,
      data: result,
    };
  }

  async getEstimate(amount, currencyFrom = "usd", currencyTo = "btc") {
    const result = await this.getEstimatedPrice(amount, currencyFrom, currencyTo);
    return {
      success: result.success,
      data: result.data,
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
    return this.verifyIpnSignature(payload, signature);
  }
}

const nowpaymentsService = new NOWPaymentsService();
export default nowpaymentsService;
