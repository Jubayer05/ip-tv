import Stripe from "stripe";

class StripeService {
  constructor() {
    this.stripe = null; // Remove process.env initialization
  }

  setApiKey(apiKey) {
    if (!apiKey) {
      throw new Error("Stripe API key is required");
    }
    this.stripe = new Stripe(apiKey, {
      apiVersion: "2024-06-20",
    });
  }

  async createCheckoutSession({
    amount, // decimal number in fiat (e.g., 19.99)
    currency = "usd",
    orderName = "IPTV Subscription",
    customerEmail,
    metadata = {},
    successUrl,
    cancelUrl,
  }) {
    const unitAmount = Math.round(Number(amount) * 100);

    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: orderName },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail || undefined,
      metadata,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return session;
  }

  async retrieveSession(sessionId) {
    return this.stripe.checkout.sessions.retrieve(sessionId);
  }

  async retrievePaymentIntent(paymentIntentId) {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  constructWebhookEvent(rawBody, signature, webhookSecret) {
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
  }
}

const stripeService = new StripeService();
export default stripeService;
