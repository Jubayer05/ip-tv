import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";
import { NextResponse } from "next/server";

// GET - Fetch card payment settings
export async function GET() {
  try {
    await connectToDatabase();
    const settings = await Settings.getSettings();

    return NextResponse.json({
      success: true,
      data: settings.cardPayment || {
        isEnabled: false,
        minAmount: 1,
        maxAmount: 1000,
        supportedCards: {
          visa: true,
          mastercard: true,
          amex: false,
          discover: false,
        },
        processingFee: {
          isActive: false,
          feePercentage: 0,
          fixedAmount: 0,
        },
        description: "Pay securely with your credit or debit card",
      },
    });
  } catch (error) {
    console.error("Error fetching card payment settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch card payment settings" },
      { status: 500 }
    );
  }
}

// PUT - Update card payment settings
export async function PUT(request) {
  try {
    await connectToDatabase();
    const updates = await request.json();

    const settings = await Settings.getSettings();

    // Ensure we have proper default values for nested objects
    const defaultCardPayment = {
      isEnabled: false,
      minAmount: 1,
      maxAmount: 1000,
      supportedCards: {
        visa: true,
        mastercard: true,
        amex: false,
        discover: false,
      },
      processingFee: {
        isActive: false,
        feePercentage: 0,
        fixedAmount: 0,
      },
      description: "Pay securely with your credit or debit card",
    };

    // Merge with existing settings, ensuring nested objects are properly handled
    settings.cardPayment = {
      ...defaultCardPayment,
      ...settings.cardPayment,
      ...updates,
      // Ensure nested objects are properly merged
      supportedCards: {
        ...defaultCardPayment.supportedCards,
        ...(settings.cardPayment?.supportedCards || {}),
        ...(updates.supportedCards || {}),
      },
      processingFee: {
        ...defaultCardPayment.processingFee,
        ...(settings.cardPayment?.processingFee || {}),
        ...(updates.processingFee || {}),
      },
    };

    await settings.save();

    return NextResponse.json({
      success: true,
      data: settings.cardPayment,
    });
  } catch (error) {
    console.error("Error updating card payment settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update card payment settings" },
      { status: 500 }
    );
  }
}
