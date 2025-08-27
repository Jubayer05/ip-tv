import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Verify webhook signature if needed (NOWPayments doesn't provide signature verification in sandbox)
    // In production, you might want to add additional verification
    
    const {
      payment_id,
      payment_status,
      order_id,
      price_amount,
      price_currency,
      pay_amount,
      pay_currency
    } = data;

    console.log("NOWPayments webhook received:", {
      payment_id,
      payment_status,
      order_id,
      price_amount,
      price_currency
    });

    // Here you can update your database with the payment status
    // For now, we'll just log it
    
    // You might want to update an order record in your database
    // await updateOrderStatus(order_id, payment_status);

    return NextResponse.json({ received: true });

  } catch (e) {
    console.error("NOWPayments webhook error:", e);
    return NextResponse.json(
      { error: e?.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
