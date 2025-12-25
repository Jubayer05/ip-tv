import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import PaymentSettings from "@/models/PaymentSettings";
import { DEFAULT_PAYGATE_PROVIDERS } from "@/lib/paymentServices/paygateProviderDefaults";

// GET - Fetch PayGate provider settings
export async function GET(request) {
  try {
    console.log('[PayGate Admin API] Fetching provider settings...');
    await connectToDatabase();

    const settings = await PaymentSettings.findOne({ gateway: "paygate" });

    if (!settings) {
      console.log('[PayGate Admin API] No PayGate settings found');
      return NextResponse.json({
        success: false,
        error: "PayGate settings not found. Please create PayGate gateway first.",
      }, { status: 404 });
    }

    // Return configured providers or initialize with defaults
    let providers = settings.paygateProviders;
    
    if (!providers || providers.length === 0) {
      console.log('[PayGate Admin API] No providers configured, initializing with defaults...');
      
      // Save defaults to database
      settings.paygateProviders = DEFAULT_PAYGATE_PROVIDERS;
      settings.markModified('paygateProviders');
      await settings.save();
      
      providers = DEFAULT_PAYGATE_PROVIDERS;
      console.log('[PayGate Admin API] Initialized with', providers.length, 'default providers');
    }

    // Sort by sortOrder
    const sortedProviders = providers.sort((a, b) => a.sortOrder - b.sortOrder);

    console.log('[PayGate Admin API] Returning', sortedProviders.length, 'providers');

    return NextResponse.json({
      success: true,
      providers: sortedProviders,
    });
  } catch (error) {
    console.error("[PayGate Admin API] Error fetching providers:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch PayGate providers",
    }, { status: 500 });
  }
}

// POST - Update PayGate provider settings
export async function POST(request) {
  try {
    const body = await request.json();
    const { providers } = body;

    console.log('[PayGate Admin API] Updating providers...', { count: providers?.length });

    if (!providers || !Array.isArray(providers)) {
      return NextResponse.json({
        success: false,
        error: "Invalid providers data",
      }, { status: 400 });
    }

    // Validate each provider
    for (const provider of providers) {
      if (!provider.code || !provider.name || !provider.type || !provider.provider) {
        return NextResponse.json({
          success: false,
          error: "Each provider must have code, name, type, and provider fields",
        }, { status: 400 });
      }

      if (provider.minAmount < 0) {
        return NextResponse.json({
          success: false,
          error: "Minimum amount cannot be negative",
        }, { status: 400 });
      }
    }

    await connectToDatabase();

    const settings = await PaymentSettings.findOne({ gateway: "paygate" });

    if (!settings) {
      return NextResponse.json({
        success: false,
        error: "PayGate settings not found",
      }, { status: 404 });
    }

    // Update providers - ensure all fields are properly saved
    settings.paygateProviders = providers.map((p, index) => ({
      code: p.code,
      name: p.name,
      description: p.description || '',
      minAmount: Number(p.minAmount) || 0,
      maxAmount: p.maxAmount ? Number(p.maxAmount) : null,
      icon: p.icon || '💳',
      type: p.type,
      provider: p.provider,
      isActive: p.isActive !== false,
      sortOrder: p.sortOrder !== undefined ? p.sortOrder : index,
      supportedRegions: p.supportedRegions || ['GLOBAL'],
    }));

    // Mark as modified to ensure save
    settings.markModified('paygateProviders');
    await settings.save();

    console.log("✅ PayGate providers updated successfully:", {
      count: settings.paygateProviders.length,
      activeCount: settings.paygateProviders.filter(p => p.isActive).length,
    });

    // Return sorted providers
    const sortedProviders = settings.paygateProviders.sort((a, b) => a.sortOrder - b.sortOrder);

    return NextResponse.json({
      success: true,
      message: "PayGate providers updated successfully",
      providers: sortedProviders,
    });
  } catch (error) {
    console.error("[PayGate Admin API] Error updating providers:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to update PayGate providers",
    }, { status: 500 });
  }
}

// PUT - Initialize default providers
export async function PUT(request) {
  try {
    console.log('[PayGate Admin API] Resetting to defaults...');
    await connectToDatabase();

    const settings = await PaymentSettings.findOne({ gateway: "paygate" });

    if (!settings) {
      return NextResponse.json({
        success: false,
        error: "PayGate settings not found",
      }, { status: 404 });
    }

    // Initialize with default providers
    settings.paygateProviders = DEFAULT_PAYGATE_PROVIDERS.map(p => ({ ...p }));
    settings.markModified('paygateProviders');
    await settings.save();

    console.log("✅ PayGate providers reset to defaults:", DEFAULT_PAYGATE_PROVIDERS.length);

    return NextResponse.json({
      success: true,
      message: "PayGate providers initialized with defaults",
      providers: settings.paygateProviders,
    });
  } catch (error) {
    console.error("[PayGate Admin API] Error resetting providers:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to initialize PayGate providers",
    }, { status: 500 });
  }
}
