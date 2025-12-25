import { NextResponse } from "next/server";
import paygateService from "@/lib/paymentServices/paygateService";
import { connectToDatabase } from "@/lib/db";
import PaymentSettings from "@/models/PaymentSettings";
import { DEFAULT_PAYGATE_PROVIDERS } from "@/lib/paymentServices/paygateProviderDefaults";

export async function GET(request) {
  const requestId = `PROVIDERS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    console.log(`[PayGate Providers ${requestId}] Fetching available payment providers...`);
    
    const { searchParams } = new URL(request.url);
    const userRegion = searchParams.get('region') || 'US';
    
    console.log(`[PayGate Providers ${requestId}] User region:`, userRegion);
    
    await connectToDatabase();
    
    // Check if PayGate is enabled
    const settings = await PaymentSettings.findOne({
      gateway: "paygate",
      isActive: true,
    });

    if (!settings) {
      console.warn(`[PayGate Providers ${requestId}] PayGate not enabled in settings`);
      return NextResponse.json({
        success: false,
        error: "PayGate payment method is not enabled"
      }, { status: 400 });
    }

    console.log(`[PayGate Providers ${requestId}] PayGate is active, fetching providers...`);

    // Get providers from admin settings or use defaults
    let configuredProviders = settings.paygateProviders || [];
    
    // If no providers configured, use defaults
    if (configuredProviders.length === 0) {
      console.log(`[PayGate Providers ${requestId}] No configured providers, using defaults`);
      configuredProviders = DEFAULT_PAYGATE_PROVIDERS;
    }
    // Filter active providers and sort by sortOrder
    const afterActiveFilter = configuredProviders.filter(p => p.isActive);
    console.log(`[PayGate Providers ${requestId}] After isActive filter:`, afterActiveFilter.length);
    
    const activeProviders = afterActiveFilter
      .filter(p => {
        // Filter by region if specified
        if (!p.supportedRegions || p.supportedRegions.length === 0) return true;
        const regionMatch = p.supportedRegions.includes('GLOBAL') || p.supportedRegions.includes(userRegion);
        if (!regionMatch) {
          console.log(`[PayGate Providers ${requestId}] Filtered out ${p.code} - region mismatch`);
        }
        return regionMatch;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
    
    console.log(`[PayGate Providers ${requestId}] After region filter:`, activeProviders.length);

    // Group by type
    const providers = {
      card: activeProviders.filter(p => p.type === 'card'),
      crypto: activeProviders.filter(p => p.type === 'crypto'),
      bank: activeProviders.filter(p => p.type === 'bank'),
      all: activeProviders
    };
    
    console.log(`[PayGate Providers ${requestId}] Providers fetched:`, {
      cryptoCount: providers.crypto.length,
      cardCount: providers.card.length,
      bankCount: providers.bank.length,
      totalAvailable: providers.all.length,
      userRegion
    });

    return NextResponse.json({
      success: true,
      providers: {
        crypto: providers.crypto,
        card: providers.card,
        bank: providers.bank
      },
      userRegion,
      totalCount: {
        crypto: providers.crypto.length,
        card: providers.card.length,
        bank: providers.bank.length
      },
      message: "Available payment methods fetched successfully"
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error) {
    console.error(`[PayGate Providers ${requestId}] Error:`, {
      message: error.message,
      stack: error.stack
    });

    return NextResponse.json({
      success: false,
      error: "Failed to fetch payment providers"
    }, { status: 500 });
  }
}
