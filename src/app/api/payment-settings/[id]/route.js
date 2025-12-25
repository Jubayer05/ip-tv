import { connectToDatabase } from "@/lib/db";
import PaymentSettings from "@/models/PaymentSettings";
import { NextResponse } from "next/server";

// GET single payment setting
export async function GET(request, { params }) {
  try {
    const { id } = await params; // Await params

    await connectToDatabase();

    const setting = await PaymentSettings.findById(id);
    if (!setting) {
      return NextResponse.json(
        { error: "Payment setting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error("❌ Get payment setting error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment setting" },
      { status: 500 }
    );
  }
}

// PUT update payment setting
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    await connectToDatabase();

    // Get existing setting to check gateway type
    const existingSetting = await PaymentSettings.findById(id);
    if (!existingSetting) {
      return NextResponse.json(
        { error: "Payment setting not found" },
        { status: 404 }
      );
    }

    const updateData = {
      name: body.name,
      isActive: body.isActive,
      minAmount: body.minAmount,
      sandboxMode: body.sandboxMode,
      description: body.description,
      logo: body.logo,
      imageUrl: body.imageUrl,
      sortOrder: body.sortOrder,
      bonusSettings: body.bonusSettings,
      feeSettings: body.feeSettings,
    };

    // Add optional fields if they're provided
    if (body.apiKey !== undefined && body.apiKey !== "") {
      updateData.apiKey = body.apiKey;
    }
    
    // Only update apiSecret if NOT nowpayment
    if (body.apiSecret !== undefined && body.apiSecret !== "" && existingSetting.gateway !== "nowpayment") {
      updateData.apiSecret = body.apiSecret;
    }
    
    // Always include webhook secrets if they exist in body
    if ("ipnSecret" in body) {
      updateData.ipnSecret = body.ipnSecret;
    }
    
    if ("webhookSecret" in body) {
      updateData.webhookSecret = body.webhookSecret;
    }
    
    if (body.publishableKey !== undefined) {
      updateData.publishableKey = body.publishableKey;
    }
    
    if (body.businessId !== undefined) {
      updateData.businessId = body.businessId;
    }
    if (body.merchantId !== undefined) {
      updateData.merchantId = body.merchantId;
    }
    if (body.allowedIps !== undefined) {
      updateData.allowedIps = Array.isArray(body.allowedIps) 
        ? body.allowedIps.filter(ip => ip.trim() !== "")
        : [];
    }
    if (body.fiatApiKey !== undefined && body.fiatApiKey !== "") {
      updateData.fiatApiKey = body.fiatApiKey;
    }
    if (body.externalPartnerLinkId !== undefined && body.externalPartnerLinkId !== "") {
      updateData.externalPartnerLinkId = body.externalPartnerLinkId;
    }

    if (body.paygateProviders !== undefined) {
      updateData.paygateProviders = body.paygateProviders;
    }


    const setting = await PaymentSettings.findByIdAndUpdate(
      id, 
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!setting) {
      return NextResponse.json(
        { error: "Payment setting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error("❌ Update payment setting error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update payment setting" },
      { status: 500 }
    );
  }
}

// DELETE payment setting
export async function DELETE(request, { params }) {
  try {
    const { id } = await params; // Await params

    await connectToDatabase();

    const setting = await PaymentSettings.findByIdAndDelete(id);
    if (!setting) {
      return NextResponse.json(
        { error: "Payment setting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment setting deleted successfully",
    });
  } catch (error) {
    console.error("Delete payment setting error:", error);
    return NextResponse.json(
      { error: "Failed to delete payment setting" },
      { status: 500 }
    );
  }
}
