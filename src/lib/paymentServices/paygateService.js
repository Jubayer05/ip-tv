class PayGateService {
  constructor() {
    this.merchantAddress = null;
    this.webhookSecret = null;
    this.baseUrl = "https://api.paygate.to";
    this.checkoutUrl = "https://checkout.paygate.to";
    
    // NO API KEYS NEEDED! PayGate.to handles all providers automatically
    // Just need your Polygon wallet address to receive payouts
    
    // Supported payment providers and methods
    this.SUPPORTED_PROVIDERS = {
      // Card/Fiat Providers - All handled by PayGate.to
      'card-multi': {
        name: 'Multi Provider (Recommended)',
        type: 'card',
        provider: 'auto', // PayGate.to will auto-select best provider
        minAmount: 1,
        icon: '🌐',
        description: 'Auto-selects best provider for your region',
        supportedRegions: ['GLOBAL']
      },

      // === NEW PROVIDERS (via PayGate.to unified API) ===
      
      'card-bitnovo': {
        name: 'Bitnovo',
        type: 'card',
        provider: 'bitnovo',
        minAmount: 10,
        maxAmount: 10000,
        icon: '💳',
        description: 'Credit/Debit Card - Europe, Latin America',
        supportedRegions: ['EU', 'ES', 'PT', 'IT', 'FR', 'MX', 'LATAM']
      },

      'card-mercuryo': {
        name: 'Mercuryo',
        type: 'card',
        provider: 'mercuryo',
        minAmount: 30,
        maxAmount: 20000,
        icon: '💳',
        description: 'Credit/Debit Card - 180+ countries, Apple Pay, Google Pay',
        supportedRegions: ['GLOBAL']
      },

      'card-unlimit': {
        name: 'Unlimit',
        type: 'card',
        provider: 'unlimit',
        minAmount: 10,
        maxAmount: 10000,
        icon: '💳',
        description: 'Credit/Debit Card - 150+ countries, local methods',
        supportedRegions: ['GLOBAL']
      },

      'card-guardarian': {
        name: 'Guardarian',
        type: 'card',
        provider: 'guardarian',
        minAmount: 20,
        maxAmount: 500000,
        icon: '💳',
        description: 'Credit/Debit Card - 170+ countries, 50+ methods, high limits',
        supportedRegions: ['GLOBAL']
      },

      // === EXISTING PROVIDERS ===
      
      'card-wert': {
        name: 'Wert',
        type: 'card',
        provider: 'wert',
        minAmount: 50,
        icon: '💳',
        description: 'Credit/Debit Card via Wert - Global coverage',
        supportedRegions: ['GLOBAL']
      },
      'card-stripe': {
        name: 'Stripe (USA Only)',
        type: 'card',
        provider: 'stripe',
        minAmount: 2,
        icon: '💳',
        description: 'Credit/Debit Card via Stripe - US customers only',
        supportedRegions: ['US']
      },
      'card-transfi': {
        name: 'Transfi',
        type: 'card',
        provider: 'transfi',
        minAmount: 70,
        icon: '💳',
        description: 'Credit/Debit Card via Transfi - Global coverage',
        supportedRegions: ['GLOBAL']
      },
      'card-rampnetwork': {
        name: 'Ramp Network',
        type: 'card',
        provider: 'rampnetwork',
        minAmount: 4,
        icon: '💳',
        description: 'Credit/Debit Card via Ramp - EU, UK, US',
        supportedRegions: ['EU', 'UK', 'US']
      },
      
      // Bank Transfer
      'bank-sepa': {
        name: 'SEPA Bank Transfer',
        type: 'bank',
        provider: 'sepa',
        minAmount: 50,
        icon: '🏦',
        description: 'SEPA Bank Transfer (EU)',
        supportedRegions: ['EU']
      },
      'bank-ach': {
        name: 'ACH Bank Transfer',
        type: 'bank',
        provider: 'ach',
        minAmount: 50,
        icon: '🏦',
        description: 'ACH Bank Transfer (US)',
        supportedRegions: ['US']
      },
      
      // Crypto - Direct payments (no provider needed)
      'crypto-usdt-trc20': {
        name: 'USDT (TRC20)',
        type: 'crypto',
        network: 'tron',
        currency: 'usdt',
        minAmount: 1,
        icon: '�',
        description: 'Tether on Tron Network (Low Fees)'
      },
      'crypto-usdc-polygon': {
        name: 'USDC (Polygon)',
        type: 'crypto',
        network: 'polygon',
        currency: 'usdc',
        minAmount: 1,
        icon: '�',
        description: 'USD Coin on Polygon Network'
      },
    };
  }

  setMerchantAddress(address) {
    this.merchantAddress = address;
    console.log('[PayGate] Merchant address configured:', address?.substring(0, 10) + '...');
  }

  setWebhookSecret(secret) {
    this.webhookSecret = secret;
    console.log('[PayGate] Webhook secret configured');
  }

  /**
   * Get list of available payment methods
   */
  getAvailableProviders(userRegion = null) {
    console.log('[PayGate] Getting available providers for region:', userRegion || 'GLOBAL');
    
    const providers = Object.entries(this.SUPPORTED_PROVIDERS).map(([code, config]) => ({
      code,
      ...config,
      available: userRegion ? 
        (!config.supportedRegions || 
         config.supportedRegions.includes(userRegion) || 
         config.supportedRegions.includes('GLOBAL')) : 
        true
    }));

    const result = {
      crypto: providers.filter(p => p.type === 'crypto'),
      card: providers.filter(p => p.type === 'card' && p.available),
      bank: providers.filter(p => p.type === 'bank' && p.available),
      all: providers.filter(p => p.available)
    };

    console.log('[PayGate] Available providers:', {
      card: result.card.length,
      crypto: result.crypto.length,
      bank: result.bank.length,
      total: result.all.length
    });

    return result;
  }

  /**
   * Validate provider code
   */
  validateProvider(providerCode) {
    console.log('[PayGate] Validating provider:', providerCode);
    
    if (!providerCode) {
      throw new Error('Provider code is required');
    }

    const config = this.SUPPORTED_PROVIDERS[providerCode];
    if (!config) {
      const availableCodes = Object.keys(this.SUPPORTED_PROVIDERS).join(', ');
      console.error('[PayGate] Invalid provider code:', providerCode);
      console.log('[PayGate] Available providers:', availableCodes);
      throw new Error(`Unsupported provider: ${providerCode}. Available: ${availableCodes}`);
    }
    
    console.log('[PayGate] Provider validated successfully:', {
      code: providerCode,
      name: config.name,
      type: config.type,
      minAmount: config.minAmount
    });

    return config;
  }

  /**
   * Get provider configuration
   */
  getProviderConfig(providerCode) {
    return this.validateProvider(providerCode);
  }

  validateMerchantAddress(address) {
    console.log('[PayGate] Validating merchant address...');
    
    if (!address) {
      throw new Error("Merchant address is required");
    }

    // Basic validation for Polygon address format
    if (!address.startsWith("0x") || address.length !== 42) {
      console.error('[PayGate] Invalid address format:', address);
      throw new Error(
        "Invalid merchant address format. Must be a valid Polygon address (0x...)"
      );
    }

    console.log('[PayGate] Merchant address validated:', address.substring(0, 10) + '...');
    return true;
  }

  /**
   * Step 1: Create encrypted wallet address
   * Required: merchant address + callback URL
   */
  async createWallet({ address, callbackUrl }) {
    const walletAddress = address || this.merchantAddress;

    console.log('[PayGate] Step 1: Creating temporary wallet...');
    console.log('[PayGate] Merchant address:', walletAddress?.substring(0, 10) + '...');
    console.log('[PayGate] Callback URL:', callbackUrl?.substring(0, 50) + '...');

    this.validateMerchantAddress(walletAddress);

    if (!callbackUrl) {
      throw new Error("Callback URL is required");
    }

    const params = new URLSearchParams({
      address: walletAddress,
      callback: callbackUrl,
    });

    console.log('[PayGate] Calling wallet.php API...');

    const response = await fetch(
      `${this.baseUrl}/control/wallet.php?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('[PayGate] Wallet creation failed:', {
        status: response.status,
        error: data
      });
      throw new Error(
        `PayGate API Error (${response.status}): ${JSON.stringify(data)}`
      );
    }

    console.log('[PayGate] Wallet created successfully:', {
      addressIn: data.address_in?.substring(0, 15) + '...',
      polygonAddress: data.polygon_address_in?.substring(0, 15) + '...',
      ipnToken: data.ipn_token?.substring(0, 20) + '...',
      callbackUrl: data.callback_url?.substring(0, 40) + '...'
    });

    return {
      success: true,
      data: {
        address_in: data.address_in, // Encrypted address for payment link
        polygon_address_in: data.polygon_address_in, // Actual polygon address
        callback_url: data.callback_url,
        ipn_token: data.ipn_token, // Use this to check payment status
      },
    };
  }

  /**
   * Convert currency to USD (required for some providers)
   */
  async convertToUSD(fromCurrency, amount) {
    console.log('[PayGate] Converting currency to USD:', {
      from: fromCurrency,
      amount: amount
    });

    if (!fromCurrency || !amount) {
      throw new Error("Currency code and amount are required for conversion");
    }

    const params = new URLSearchParams({
      from: fromCurrency.toUpperCase(),
      value: Number(amount).toFixed(2),
    });

    const response = await fetch(
      `${this.baseUrl}/control/convert.php?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('[PayGate] Currency conversion failed:', {
        status: response.status,
        error: data
      });
      throw new Error(
        `PayGate Convert API Error (${response.status}): ${JSON.stringify(data)}`
      );
    }

    console.log('[PayGate] Conversion successful:', {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount: data.value_coin,
      exchangeRate: data.exchange_rate
    });

    return {
      success: true,
      data: {
        status: data.status,
        value_coin: data.value_coin,
        exchange_rate: data.exchange_rate,
      },
    };
  }

  /**
   * Step 2: Generate payment checkout URL
   * This redirects customer to PayGate.to payment page
   * Uses pay.php for multi-provider (auto) or process-payment.php for specific providers
   */
  generatePaymentUrl({
    address_in, // Encrypted address from createWallet()
    amount,
    provider = "auto", // auto, wert, stripe, transfi, rampnetwork, bitnovo, mercuryo, unlimit, guardarian
    email,
    currency = "USD",
  }) {
    console.log('[PayGate] Step 2: Generating payment checkout URL...');
    console.log('[PayGate] Parameters:', {
      provider,
      amount,
      currency,
      email: email?.substring(0, 3) + '***@' + email?.split('@')[1],
      hasAddressIn: !!address_in
    });

    if (!address_in) {
      throw new Error("Encrypted address (address_in) is required");
    }

    if (!amount || Number(amount) <= 0) {
      throw new Error("Valid amount is required");
    }

    if (!email) {
      throw new Error("Customer email is required");
    }

    // URL decode the address_in parameter (it comes encoded from API)
    const decodedAddress = decodeURIComponent(address_in);

    let checkoutUrl;

    if (provider === 'auto') {
      // Multi-provider mode: Use pay.php endpoint (no provider parameter)
      console.log('[PayGate] Using multi-provider mode (pay.php)');
      console.log('[PayGate] PayGate will auto-select best provider based on user region');
      
      const params = new URLSearchParams({
        address: decodedAddress,
        amount: Number(amount).toFixed(2),
        email: email,
        currency: currency.toUpperCase(),
        domain: 'checkout.paygate.to' // Optional: white-label domain
      });

      checkoutUrl = `${this.checkoutUrl}/pay.php?${params.toString()}`;
      
      console.log('[PayGate] Multi-provider checkout URL generated');
    } else {
      // Single provider mode: Use process-payment.php endpoint
      console.log('[PayGate] Using single provider mode:', provider);
      console.log('[PayGate] Direct routing to', provider, 'provider');
      
      const params = new URLSearchParams({
        address: decodedAddress,
        amount: Number(amount).toFixed(2),
        provider: provider,
        email: email,
        currency: currency.toUpperCase(),
      });

      checkoutUrl = `${this.checkoutUrl}/process-payment.php?${params.toString()}`;
      
      console.log('[PayGate] Single-provider checkout URL generated');
    }

    console.log('[PayGate] Checkout URL created successfully (length:', checkoutUrl.length, 'chars)');

    return checkoutUrl;
  }

  /**
   * Check payment status using IPN token
   * WARNING: Use sparingly - rely on webhook callbacks instead
   */
  async checkPaymentStatus(ipnToken) {
    console.log('[PayGate] Checking payment status...');
    console.log('[PayGate] IPN Token:', ipnToken?.substring(0, 20) + '...');

    if (!ipnToken) {
      throw new Error("IPN token is required");
    }

    const params = new URLSearchParams({
      ipn_token: ipnToken,
    });

    const response = await fetch(
      `${this.baseUrl}/control/payment-status.php?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('[PayGate] Status check failed:', {
        status: response.status,
        error: data
      });
      throw new Error(
        `PayGate API Error (${response.status}): ${JSON.stringify(data)}`
      );
    }

    console.log('[PayGate] Payment status retrieved:', {
      status: data.status,
      valueCoin: data.value_coin,
      coin: data.coin,
      hasTxidOut: !!data.txid_out
    });

    return {
      success: true,
      data: {
        status: data.status, // 'paid' or 'unpaid'
        value_coin: data.value_coin, // Amount paid in crypto
        txid_out: data.txid_out, // Payout transaction hash
        coin: data.coin, // Usually 'polygon_usdc'
      },
    };
  }

  getStatusDescription(status) {
    const statusMap = {
      paid: "Payment completed successfully",
      unpaid: "Payment pending",
    };

    const lowerStatus = (status || "").toLowerCase();
    return {
      status: statusMap[lowerStatus] || `Unknown status: ${status}`,
      isCompleted: lowerStatus === 'paid',
      isPending: lowerStatus === 'unpaid',
    };
  }

  /**
   * Verify callback parameters from PayGate webhook
   * PayGate sends GET request with these params:
   * - value_coin: Amount paid in USDC
   * - coin: Coin type (polygon_usdc)
   * - txid_in: Transaction from provider to order wallet
   * - txid_out: Payout transaction to merchant wallet
   * - address_in: Polygon address (should match polygon_address_in)
   */
  verifyCallbackParameters(params) {
    console.log('[PayGate] Verifying callback parameters...');

    const required = ["value_coin", "coin", "txid_in", "txid_out", "address_in"];
    const missing = required.filter((field) => !params[field]);

    if (missing.length > 0) {
      console.error('[PayGate] Missing required callback parameters:', missing);
      return false;
    }

    console.log('[PayGate] Callback parameters verified successfully:', {
      valueCoin: params.value_coin,
      coin: params.coin,
      txidIn: params.txid_in?.substring(0, 20) + '...',
      txidOut: params.txid_out?.substring(0, 20) + '...',
      addressIn: params.address_in?.substring(0, 15) + '...'
    });

    return true;
  }

  /**
   * Check if payment is completed
   */
  isPaymentCompleted(status) {
    return status?.toLowerCase() === 'paid';
  }

  /**
   * Check if payment is pending
   */
  isPaymentPending(status) {
    return status?.toLowerCase() === 'unpaid';
  }
  calculateServiceFee(amount, feePercentage = 0) {
    if (!feePercentage || feePercentage <= 0) {
      return {
        originalAmount: amount,
        serviceFee: 0,
        totalAmount: amount,
      };
    }

    const serviceFee = (amount * feePercentage) / 100;
    const totalAmount = amount + serviceFee;

    return {
      originalAmount: amount,
      serviceFee: Number(serviceFee.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
    };
  }

  /**
   * Create payment (combines wallet creation + URL generation)
   */
  async createPayment({
    amount,
    currency = "USD",
    customerEmail,
    description = "IPTV Subscription",
    callbackUrl,
    successUrl,
    cancelUrl,
    provider = 'auto', // auto, wert, stripe, transfi, rampnetwork, bitnovo, mercuryo, unlimit, guardarian
    metadata = {},
  }) {
    console.log('[PayGate] === Creating Payment ===');
    console.log('[PayGate] Payment details:', {
      amount,
      currency,
      provider,
      description
    });

    // Validate provider
    const providerConfig = this.validateProvider(
      provider.startsWith('card-') || provider.startsWith('bank-') || provider.startsWith('crypto-') ? provider : `card-${provider}`
    );

    console.log('[PayGate] Provider configuration loaded:', {
      name: providerConfig.name,
      type: providerConfig.type,
      minAmount: providerConfig.minAmount,
      maxAmount: providerConfig.maxAmount,
      actualProvider: providerConfig.provider
    });

    // Convert to USD if needed (required for some providers)
    let finalAmount = amount;
    let conversionRate = 1;

    if (currency.toUpperCase() !== "USD") {
      console.log('[PayGate] Non-USD currency detected, converting to USD...');
      try {
        const conversionResult = await this.convertToUSD(currency, amount);
        if (conversionResult.success) {
          finalAmount = conversionResult.data.value_coin;
          conversionRate = conversionResult.data.exchange_rate;
          console.log('[PayGate] Currency converted:', {
            original: `${amount} ${currency}`,
            converted: `${finalAmount} USD`,
            rate: conversionRate
          });
        }
      } catch (conversionError) {
        console.warn('[PayGate] Currency conversion failed, using original amount:', conversionError.message);
      }
    } else {
      console.log('[PayGate] USD currency, no conversion needed');
    }

    // Step 1: Create wallet
    console.log('[PayGate] Creating temporary wallet for order tracking...');
    const walletResult = await this.createWallet({
      address: this.merchantAddress,
      callbackUrl,
    });

    // Step 2: Generate payment URL
    console.log('[PayGate] Generating checkout URL for customer...');
    const paymentUrl = this.generatePaymentUrl({
      address_in: walletResult.data.address_in,
      amount: finalAmount,
      provider: providerConfig.provider,
      email: customerEmail,
      currency: "USD",
    });

    const paymentId = `paygate-${provider}-${Date.now()}`;

    console.log('[PayGate] Payment created successfully!');
    console.log('[PayGate] Payment ID:', paymentId);
    console.log('[PayGate] Provider:', providerConfig.provider, '(' + providerConfig.name + ')');
    console.log('[PayGate] Amount:', finalAmount, 'USD');
    console.log('[PayGate] Customer will be redirected to PayGate checkout');

    return {
      success: true,
      data: {
        id: paymentId,
        payment_url: paymentUrl,
        status: "pending",
        amount: Number(finalAmount),
        currency: "USD",
        originalAmount: Number(amount),
        originalCurrency: currency.toUpperCase(),
        conversionRate: conversionRate,
        wallet_data: walletResult.data,
        ipn_token: walletResult.data.ipn_token, // Save this to check payment status
        metadata: {
          ...metadata,
          provider: providerConfig.provider,
          providerType: providerConfig.type,
          providerName: providerConfig.name,
        },
      },
    };
  }

}

const paygateService = new PayGateService();
export default paygateService;
