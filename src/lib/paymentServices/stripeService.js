import Stripe from "stripe";

class StripeService {
  constructor() {
    this.stripe = null;
    this.webhookSecret = null;
    this.publicKey = null;
  }

  // ==================== CONFIGURATION ====================

  initialize(secretKey) {
    if (!secretKey) {
      throw new Error("Stripe Secret Key is required");
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: "2023-10-16",
    });
  }

  setWebhookSecret(secret) {
    if (!secret) {
      console.warn("⚠️ Stripe Webhook Secret not set - webhook verification will be skipped");
    }
    this.webhookSecret = secret;
  }

  setPublicKey(publicKey) {
    this.publicKey = publicKey;
  }

  validateConfiguration() {
    if (!this.stripe) {
      throw new Error("Stripe not initialized. Call initialize() first.");
    }
  }

  // ==================== CHECKOUT SESSION (DEPOSITS) ====================

  /**
   * Create a checkout session for one-time wallet deposit
   */
  async createDepositCheckoutSession({
    amount,
    currency = "usd",
    depositId,
    customerEmail,
    successUrl,
    cancelUrl,
    metadata = {},
  }) {
    this.validateConfiguration();

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: customerEmail,
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: "Wallet Deposit",
                description: `Add $${amount} to your wallet`,
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        metadata: {
          type: "deposit",
          deposit_id: depositId,
          ...metadata,
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        payment_intent_data: {
          metadata: {
            type: "deposit",
            deposit_id: depositId,
            ...metadata,
          },
        },
      });

      return {
        success: true,
        sessionId: session.id,
        sessionUrl: session.url,
        paymentIntentId: session.payment_intent,
      };
    } catch (error) {
      console.error("❌ Stripe checkout session error:", error);
      throw new Error(`Failed to create Stripe checkout session: ${error.message}`);
    }
  }

  // ==================== SUBSCRIPTION CHECKOUT ====================

  /**
   * Create a checkout session for recurring subscription
   */
  async createSubscriptionCheckoutSession({
    priceId,
    customerEmail,
    customerId = null,
    successUrl,
    cancelUrl,
    metadata = {},
    trialPeriodDays = 0,
  }) {
    this.validateConfiguration();

    try {
      const sessionParams = {
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        metadata: {
          type: "subscription",
          ...metadata,
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      };

      // Add customer if exists, otherwise use email
      if (customerId) {
        sessionParams.customer = customerId;
      } else if (customerEmail) {
        sessionParams.customer_email = customerEmail;
      }

      // Add trial period if specified
      if (trialPeriodDays > 0) {
        sessionParams.subscription_data = {
          trial_period_days: trialPeriodDays,
        };
      }

      const session = await this.stripe.checkout.sessions.create(sessionParams);

      return {
        success: true,
        sessionId: session.id,
        sessionUrl: session.url,
        subscriptionId: session.subscription,
      };
    } catch (error) {
      console.error("❌ Stripe subscription session error:", error);
      throw new Error(`Failed to create subscription session: ${error.message}`);
    }
  }

  // ==================== CUSTOMER MANAGEMENT ====================

  /**
   * Create or retrieve a Stripe customer
   */
  async getOrCreateCustomer(email, userId, name = null) {
    this.validateConfiguration();

    try {
      // Search for existing customer
      const customers = await this.stripe.customers.list({
        email: email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        return customers.data[0];
      }

      // Create new customer
      const customer = await this.stripe.customers.create({
        email: email,
        metadata: {
          user_id: userId,
        },
        ...(name && { name }),
      });

      return customer;
    } catch (error) {
      console.error("❌ Stripe customer error:", error);
      throw new Error(`Failed to get/create customer: ${error.message}`);
    }
  }

  /**
   * Create a customer portal session for subscription management
   */
  async createCustomerPortalSession(customerId, returnUrl) {
    this.validateConfiguration();

    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return {
        success: true,
        url: session.url,
      };
    } catch (error) {
      console.error("❌ Stripe customer portal error:", error);
      throw new Error(`Failed to create customer portal: ${error.message}`);
    }
  }

  // ==================== WEBHOOK VERIFICATION ====================

  /**
   * Verify Stripe webhook signature
   */
  verifyWebhookSignature(rawBody, signature) {
    if (!this.webhookSecret) {
      console.warn("⚠️ Stripe Webhook Secret not configured - SKIPPING signature verification");
      return true; // Allow in dev mode, but log warning
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret
      );
      return event;
    } catch (error) {
      console.error("❌ Stripe webhook signature verification failed:", error.message);
      return false;
    }
  }

  // ==================== PAYMENT RETRIEVAL ====================

  /**
   * Retrieve payment intent details
   */
  async getPaymentIntent(paymentIntentId) {
    this.validateConfiguration();

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error("❌ Stripe get payment intent error:", error);
      throw new Error(`Failed to retrieve payment intent: ${error.message}`);
    }
  }

  /**
   * Retrieve checkout session details
   */
  async getCheckoutSession(sessionId) {
    this.validateConfiguration();

    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      console.error("❌ Stripe get session error:", error);
      throw new Error(`Failed to retrieve session: ${error.message}`);
    }
  }

  /**
   * Retrieve subscription details
   */
  async getSubscription(subscriptionId) {
    this.validateConfiguration();

    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error("❌ Stripe get subscription error:", error);
      throw new Error(`Failed to retrieve subscription: ${error.message}`);
    }
  }

  // ==================== SUBSCRIPTION MANAGEMENT ====================

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
    this.validateConfiguration();

    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd,
      });

      return {
        success: true,
        subscription,
      };
    } catch (error) {
      console.error("❌ Stripe cancel subscription error:", error);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  /**
   * Resume a cancelled subscription
   */
  async resumeSubscription(subscriptionId) {
    this.validateConfiguration();

    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });

      return {
        success: true,
        subscription,
      };
    } catch (error) {
      console.error("❌ Stripe resume subscription error:", error);
      throw new Error(`Failed to resume subscription: ${error.message}`);
    }
  }

  // ==================== REFUNDS ====================

  /**
   * Create a refund
   */
  async createRefund(paymentIntentId, amount = null, reason = "requested_by_customer") {
    this.validateConfiguration();

    try {
      const refundParams = {
        payment_intent: paymentIntentId,
        reason,
      };

      if (amount) {
        refundParams.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await this.stripe.refunds.create(refundParams);

      return {
        success: true,
        refund,
      };
    } catch (error) {
      console.error("❌ Stripe refund error:", error);
      throw new Error(`Failed to create refund: ${error.message}`);
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Check if payment is completed
   */
  isPaymentCompleted(status) {
    return status === "succeeded" || status === "paid";
  }

  /**
   * Check if payment is pending
   */
  isPaymentPending(status) {
    return status === "processing" || status === "requires_payment_method";
  }

  /**
   * Check if payment failed
   */
  isPaymentFailed(status) {
    return status === "canceled" || status === "failed";
  }

  /**
   * Format amount from cents to dollars
   */
  formatAmount(amountInCents, currency = "usd") {
    return (amountInCents / 100).toFixed(2);
  }

  /**
   * Convert amount to cents
   */
  toCents(amount) {
    return Math.round(amount * 100);
  }
}

// Export singleton instance
const stripeService = new StripeService();
export default stripeService;
