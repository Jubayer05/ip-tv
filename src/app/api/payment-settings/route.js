import { connectToDatabase } from "@/lib/db";
import PaymentSettings from "@/models/PaymentSettings";
import { NextResponse } from "next/server";
import { DEFAULT_PAYGATE_PROVIDERS } from "@/lib/paymentServices/paygateProviderDefaults";

// GET all payment settings
export async function GET() {
  try {
    await connectToDatabase();

    const settings = await PaymentSettings.find().sort({
      sortOrder: 1,
      createdAt: 1,
    });

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get payment settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment settings" },
      { status: 500 }
    );
  }
}

// POST new payment setting
export async function POST(request) {
  try {
    const body = await request.json();

    await connectToDatabase();

    console.log("💾 Creating payment settings:", {
      gateway: body.gateway,
      name: body.name,
      hasApiKey: !!body.apiKey,
      hasApiSecret: !!body.apiSecret,
      hasWebhookSecret: !!body.webhookSecret,
      webhookSecretLength: body.webhookSecret?.length || 0,
      hasIpnSecret: !!body.ipnSecret,
      ipnSecretLength: body.ipnSecret?.length || 0,
      hasBusinessId: !!body.businessId,
      allowedIpsCount: body.allowedIps?.length || 0,
    });

    // Check if gateway already exists
    const existing = await PaymentSettings.findOne({ gateway: body.gateway });
    if (existing) {
      return NextResponse.json(
        { error: "Payment gateway already exists" },
        { status: 400 }
      );
    }

    // Validation: API Key required for most gateways
    if (!body.apiKey && !["paygate"].includes(body.gateway)) {
      return NextResponse.json(
        { error: "API Key is required" },
        { status: 400 }
      );
    }

    // Validation: API Secret required for Stripe and Volet only (NOT for nowpayment)
    if (["stripe", "volet"].includes(body.gateway) && !body.apiSecret) {
      return NextResponse.json(
        { error: "API Secret is required for this gateway" },
        { status: 400 }
      );
    }

    // Validation: IPN Secret required for NOWPayments
    if (body.gateway === "nowpayment" && !body.ipnSecret) {
      return NextResponse.json(
        { error: "IPN Secret is required for NOWPayments" },
        { status: 400 }
      );
    }

    // ✅ Prepare the data to save - include ALL fields
    const paymentData = {
      gateway: body.gateway,
      name: body.name,
      isActive: body.isActive ?? false,
      minAmount: body.minAmount || 1,
      sandboxMode: body.sandboxMode ?? false,
      description: body.description || "",
      logo: body.logo || "",
      imageUrl: body.imageUrl || "",
      sortOrder: body.sortOrder || 0,
      bonusSettings: body.bonusSettings || [],
      feeSettings: body.feeSettings || {
        isActive: false,
        feePercentage: 0,
        feeType: "percentage",
        fixedAmount: 0,
      },
    };

    // ✅ Add optional fields if provided
    if (body.apiKey) paymentData.apiKey = body.apiKey;
    
    // Only add apiSecret if NOT nowpayment
    if (body.apiSecret && body.gateway !== "nowpayment") {
      paymentData.apiSecret = body.apiSecret;
    }
    
    // ✅ CRITICAL: Always include webhook secrets
    if (body.ipnSecret !== undefined) {
      paymentData.ipnSecret = body.ipnSecret;
      console.log("📝 IPN Secret provided:", body.ipnSecret ? `Yes (${body.ipnSecret.length} chars)` : "No");
    }
    
    if (body.webhookSecret !== undefined) {
      paymentData.webhookSecret = body.webhookSecret;
      console.log("📝 Webhook Secret provided:", body.webhookSecret ? `Yes (${body.webhookSecret.length} chars)` : "No");
    }
    
    if (body.businessId) paymentData.businessId = body.businessId;
    if (body.merchantId) paymentData.merchantId = body.merchantId;
    if (body.allowedIps && Array.isArray(body.allowedIps)) {
      paymentData.allowedIps = body.allowedIps.filter(ip => ip.trim() !== "");
    }
    if (body.fiatApiKey) paymentData.fiatApiKey = body.fiatApiKey;
    if (body.externalPartnerLinkId) {
      paymentData.externalPartnerLinkId = body.externalPartnerLinkId;
    }


    if (body.gateway === 'paygate') {
      console.log('Initializing PayGate with default providers...');
      paymentData.paygateProviders = DEFAULT_PAYGATE_PROVIDERS;
      console.log('PayGate initialized with', DEFAULT_PAYGATE_PROVIDERS.length, 'default providers');
    }

    console.log("📝 Prepared payment data:", {
      ...paymentData,
      apiKey: paymentData.apiKey ? "***" + paymentData.apiKey.slice(-4) : undefined,
      apiSecret: paymentData.apiSecret ? "***" : undefined,
      webhookSecret: paymentData.webhookSecret ? "***" : undefined,
      ipnSecret: paymentData.ipnSecret ? "***" : undefined,
    });

    const setting = new PaymentSettings(paymentData);
    await setting.save();

    console.log("✅ Payment settings created:", {
      gateway: setting.gateway,
      name: setting.name,
      hasWebhookSecret: !!setting.webhookSecret,
      hasIpnSecret: !!setting.ipnSecret,
      hasBusinessId: !!setting.businessId,
    });

    return NextResponse.json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error("❌ Create payment setting error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment setting" },
      { status: 500 }
    );
  }
}
