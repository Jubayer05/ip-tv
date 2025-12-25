import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import PaymentSettings from "@/models/PaymentSettings";
import CryptoPayment from "@/models/CryptoPayment";
import nowpaymentsService from "@/lib/paymentServices/nowpaymentsServiceV2";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting subscription renewal cron job");

    await connectToDatabase();

    const now = new Date();
    
    // Check subscriptions expiring exactly 3 days from now to prevent duplicates
    const exactThreeDaysFromNow = new Date();
    exactThreeDaysFromNow.setDate(now.getDate() + 3);
    exactThreeDaysFromNow.setHours(0, 0, 0, 0);
    
    const endOfThreeDaysFromNow = new Date(exactThreeDaysFromNow);
    endOfThreeDaysFromNow.setHours(23, 59, 59, 999);

    console.log("Checking subscriptions expiring between:", exactThreeDaysFromNow, "and", endOfThreeDaysFromNow);

    // Count total expiring subscriptions first (without loading into memory)
    const totalCount = await Order.countDocuments({
      paymentStatus: "completed",
      status: "completed",
      "subscription.isActive": true,
      "subscription.autoRenew": { $ne: false },
      "subscription.nextBillingDate": {
        $gte: exactThreeDaysFromNow,
        $lte: endOfThreeDaysFromNow,
      },
    });

    console.log(`Found ${totalCount} subscriptions to renew`);

    if (totalCount === 0) {
      return NextResponse.json({
        success: true,
        message: "No subscriptions to renew",
        checked: 0,
        renewed: 0,
      });
    }

    // Load NOWPayments settings
    const paymentSettings = await PaymentSettings.findOne({
      gateway: "nowpayment",
      isActive: true,
    });

    if (!paymentSettings || !paymentSettings.apiKey) {
      console.error("NOWPayments not configured");
      return NextResponse.json(
        {
          error: "NOWPayments not configured",
          message: "Please configure NOWPayments in admin settings",
        },
        { status: 500 }
      );
    }

    await nowpaymentsService.initialize(paymentSettings);
    console.log("NOWPayments service initialized");

    const baseUrl = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL;
    let renewalCount = 0;
    let skippedCount = 0;
    let errors = [];

    // Process subscriptions in batches to prevent memory issues
    const BATCH_SIZE = 10;
    let processed = 0;

    while (processed < totalCount) {
      // Fetch subscriptions in batches using cursor for memory efficiency
      const expiringSubscriptions = await Order.find({
        paymentStatus: "completed",
        status: "completed",
        "subscription.isActive": true,
        "subscription.autoRenew": { $ne: false },
        "subscription.nextBillingDate": {
          $gte: exactThreeDaysFromNow,
          $lte: endOfThreeDaysFromNow,
        },
      })
        .populate("userId")
        .skip(processed)
        .limit(BATCH_SIZE)
        .lean(); // Use lean() for better memory efficiency

      if (expiringSubscriptions.length === 0) break;

      console.log(`Processing batch ${Math.floor(processed / BATCH_SIZE) + 1}, ${expiringSubscriptions.length} subscriptions`);

    // Process each expiring subscription in the batch
    for (const originalOrder of expiringSubscriptions) {
      try {
        const user = originalOrder.userId;
        if (!user) {
          console.warn(`No user found for order: ${originalOrder._id}`);
          skippedCount++;
          continue;
        }

        console.log(`Processing renewal for user: ${user.email}, order: ${originalOrder.orderNumber}`);

        // Check if renewal invoice already exists for this subscription
        const existingRenewalOrder = await Order.findOne({
          userId: user._id,
          "subscription.parentOrderId": originalOrder._id,
          "subscription.isRenewal": true,
          paymentStatus: { $in: ["pending", "processing"] },
          createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
        });

        if (existingRenewalOrder) {
          console.log(`Renewal invoice already exists: ${existingRenewalOrder.orderNumber}`);

          // Check if existing invoice has expired (NOWPayments invoices expire after 24h)
          const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          const isExpired = existingRenewalOrder.createdAt < twentyFourHoursAgo;

          if (!isExpired) {
            console.log("Active renewal invoice exists, skipping duplicate creation");
            skippedCount++;
            continue;
          } else {
            console.log("Existing invoice expired, creating new one");
            
            // Mark old renewal as expired
            existingRenewalOrder.status = "cancelled";
            existingRenewalOrder.paymentStatus = "expired";
            existingRenewalOrder.subscription.status = "expired";
            await existingRenewalOrder.save();

            // Update CryptoPayment record
            await CryptoPayment.updateOne(
              { orderId: existingRenewalOrder.orderNumber },
              { 
                $set: { 
                  paymentStatus: "expired",
                  internalStatus: "cancelled" 
                } 
              }
            );

            console.log(`Expired old renewal invoice: ${existingRenewalOrder.orderNumber}`);
          }
        }

        // Add renewal timestamp to prevent race conditions
        const renewalTimestamp = Date.now();
        const renewalOrderId = `renewal-${originalOrder.orderNumber}-${renewalTimestamp}`;

        // Lock the subscription temporarily to prevent concurrent renewals
        const lockResult = await Order.updateOne(
          {
            _id: originalOrder._id,
            "subscription.renewalLock": { $exists: false },
          },
          {
            $set: {
              "subscription.renewalLock": renewalTimestamp,
              "subscription.lastRenewalAttempt": new Date(),
            },
          }
        );

        if (lockResult.modifiedCount === 0) {
          console.log("Subscription locked by another process, skipping");
          skippedCount++;
          continue;
        }

        console.log("Subscription locked for renewal processing");

        // Create NEW invoice for renewal
        const invoiceResult = await nowpaymentsService.createInvoice({
          price_amount: Number(originalOrder.totalAmount),
          price_currency: "usd",
          order_id: renewalOrderId,
          order_description: `Subscription Renewal - ${originalOrder.products[0]?.productId || "IPTV"}`,
          ipn_callback_url: `${baseUrl}/api/payments/nowpayments/webhook`,
          success_url: `${baseUrl}/payment-success?order_id=${renewalOrderId}`,
          cancel_url: `${baseUrl}/payment-cancel?order_id=${renewalOrderId}`,
          customer_email: user.email,
        });

        if (!invoiceResult.success) {
          // Release lock on failure
          await Order.updateOne(
            { _id: originalOrder._id },
            { $unset: { "subscription.renewalLock": "" } }
          );
          
          throw new Error(`Invoice creation failed: ${invoiceResult.error}`);
        }

        const invoiceData = invoiceResult.data;

        console.log("Renewal invoice created:", {
          invoiceId: invoiceData.invoiceId,
          orderNumber: renewalOrderId,
        });

        // Create NEW order for renewal
        const renewalOrder = new Order({
          orderNumber: renewalOrderId,
          userId: user._id,
          guestEmail: null,
          products: originalOrder.products,
          totalAmount: originalOrder.totalAmount,
          originalAmount: originalOrder.originalAmount,
          serviceFee: originalOrder.serviceFee,
          discountAmount: 0,
          couponCode: "",
          paymentMethod: "Cryptocurrency",
          paymentGateway: "NOWPayments",
          paymentStatus: "pending",
          contactInfo: originalOrder.contactInfo,
          status: "new",
          
          subscription: {
            isActive: false,
            status: "pending_renewal",
            productId: originalOrder.subscription?.productId,
            planName: originalOrder.subscription?.planName,
            intervalDays: originalOrder.subscription?.intervalDays || 30,
            lastBillingDate: null,
            nextBillingDate: null,
            autoRenew: originalOrder.subscription?.autoRenew || false,
            
            parentOrderId: originalOrder._id,
            isRenewal: true,
            renewalAttempt: (originalOrder.subscription?.renewalAttempt || 0) + 1,
            renewalTimestamp: renewalTimestamp,
          },

          nowpaymentsPayment: {
            invoiceId: invoiceData.invoiceId,
            paymentUrl: invoiceData.invoiceUrl,
            priceCurrency: invoiceData.priceCurrency,
            priceAmount: invoiceData.priceAmount,
            orderId: renewalOrderId,
            purchaseId: invoiceData.purchaseId,
            createdAt: invoiceData.createdAt,
            expirationEstimateDate: invoiceData.expirationEstimateDate,
            paymentStatus: "waiting",
            callbackReceived: false,
            lastStatusUpdate: new Date(),
            metadata: {
              renewal: true,
              original_order_id: originalOrder._id.toString(),
              original_order_number: originalOrder.orderNumber,
              renewal_timestamp: renewalTimestamp,
            },
          },
        });

        await renewalOrder.save();

        // Create CryptoPayment record
        const cryptoPayment = new CryptoPayment({
          userId: user._id,
          userEmail: user.email,
          invoiceId: invoiceData.invoiceId,
          paymentId: null,
          orderId: renewalOrderId,
          paymentStatus: "waiting",
          internalStatus: "pending",
          priceAmount: Number(originalOrder.totalAmount),
          priceCurrency: "USD",
          payCurrency: "btc",
          payAmount: 0,
          actuallyPaid: 0,
          payAddress: "",
          purchaseId: invoiceData.purchaseId,
          invoiceUrl: invoiceData.invoiceUrl,
          orderDescription: `Subscription Renewal`,
          ipnCallbackUrl: `${baseUrl}/api/payments/nowpayments/webhook`,
          successUrl: `${baseUrl}/payment-success?order_id=${renewalOrderId}`,
          cancelUrl: `${baseUrl}/payment-cancel?order_id=${renewalOrderId}`,
          metadata: {
            user_id: user._id.toString(),
            purpose: "renewal",
            original_order_id: originalOrder._id.toString(),
            renewal_attempt: (originalOrder.subscription?.renewalAttempt || 0) + 1,
            renewal_timestamp: renewalTimestamp,
          },
        });

        await cryptoPayment.save();

        console.log("Renewal order and CryptoPayment created:", {
          orderId: renewalOrder._id,
          cryptoPaymentId: cryptoPayment._id,
        });

        // Update original order with renewal reference
        await Order.updateOne(
          { _id: originalOrder._id },
          {
            $set: {
              "subscription.pendingRenewalOrderId": renewalOrder._id,
              "subscription.renewalInvoiceUrl": invoiceData.invoiceUrl,
              "subscription.lastRenewalCreated": new Date(),
            },
            $unset: { "subscription.renewalLock": "" },
          }
        );

        // Send renewal email
        try {
          // TODO: Implement sendRenewalEmail
          // await sendRenewalEmail(user, {
          //   invoiceUrl: invoiceData.invoiceUrl,
          //   amount: originalOrder.totalAmount,
          //   expirationDate: originalOrder.subscription.nextBillingDate,
          //   orderNumber: renewalOrderId,
          // });

          console.log(`Renewal email sent to: ${user.email}`);
        } catch (emailError) {
          console.error("Failed to send renewal email:", emailError.message);
        }

        renewalCount++;

        console.log(`Renewal processed successfully for order: ${originalOrder.orderNumber}`);
      } catch (error) {
        console.error(`Error processing renewal for order ${originalOrder._id}:`, error);

        // Release lock on error
        await Order.updateOne(
          { _id: originalOrder._id },
          { $unset: { "subscription.renewalLock": "" } }
        ).catch(console.error);

        errors.push({
          orderId: originalOrder._id,
          orderNumber: originalOrder.orderNumber,
          error: error.message,
        });
      }
    }

      // Update processed count and add small delay between batches
      processed += expiringSubscriptions.length;

      // Small delay between batches to prevent overwhelming the payment API
      if (processed < totalCount) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } // End of while loop

    console.log("Renewal cron job completed");
    console.log(`Total checked: ${totalCount}`);
    console.log(`Successfully processed: ${renewalCount}`);
    console.log(`Skipped (already has pending renewal): ${skippedCount}`);
    console.log(`Errors: ${errors.length}`);

    return NextResponse.json({
      success: true,
      message: "Renewal cron job completed",
      totalChecked: totalCount,
      renewed: renewalCount,
      skipped: skippedCount,
      errors: errors,
    });
  } catch (error) {
    console.error("Renewal cron job failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Renewal cron job failed",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
