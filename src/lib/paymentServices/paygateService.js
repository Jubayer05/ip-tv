class PayGateService {
  constructor() {
    this.merchantAddress = null; // Remove process.env
    this.baseUrl = "https://api.paygate.to";
    this.checkoutUrl = "https://checkout.paygate.to";
  }

  setMerchantAddress(address) {
    this.merchantAddress = address;
  }

  validateMerchantAddress(address) {
    if (!address) {
      throw new Error("Merchant address is required");
    }

    // Basic validation for Polygon USDC address format
    if (!address.startsWith("0x") || address.length !== 42) {
      throw new Error(
        "Invalid merchant address format. Must be a valid Polygon USDC address (0x...)"
      );
    }

    return true;
  }

  async createWallet({ address, callbackUrl }) {
    const walletAddress = address || this.merchantAddress;

    this.validateMerchantAddress(walletAddress);

    if (!callbackUrl) {
      throw new Error("Callback URL is required");
    }

    const params = new URLSearchParams({
      address: walletAddress,
      callback: callbackUrl,
    });

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
    console.log("PayGate wallet response:", { status: response.status, data });

    if (!response.ok) {
      throw new Error(
        `PayGate API Error (${response.status}): ${JSON.stringify(data)}`
      );
    }

    return {
      success: true,
      data: {
        address_in: data.address_in,
        polygon_address_in: data.polygon_address_in,
        callback_url: data.callback_url,
        ipn_token: data.ipn_token,
      },
    };
  }

  generatePaymentUrl({
    address_in,
    amount,
    provider = "moonpay",
    email,
    currency = "USD",
  }) {
    if (!address_in) {
      throw new Error("Encrypted address is required");
    }

    if (!amount || Number(amount) <= 0) {
      throw new Error("Valid amount is required");
    }

    if (!email) {
      throw new Error("Customer email is required");
    }

    // URL decode the address_in parameter
    const decodedAddress = decodeURIComponent(address_in);

    const params = new URLSearchParams({
      address: decodedAddress,
      amount: Number(amount).toFixed(2),
      provider: provider,
      email: email,
      currency: currency.toUpperCase(),
    });

    return `${this.checkoutUrl}/process-payment.php?${params.toString()}`;
  }

  async checkPaymentStatus(ipnToken) {
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
    console.log("PayGate status response:", { status: response.status, data });

    if (!response.ok) {
      throw new Error(
        `PayGate API Error (${response.status}): ${JSON.stringify(data)}`
      );
    }

    return {
      success: true,
      data: {
        status: data.status,
        value_coin: data.value_coin,
        txid_out: data.txid_out,
        coin: data.coin,
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
      isCompleted: lowerStatus === "paid",
      isPending: lowerStatus === "unpaid",
      isFailed: false,
    };
  }

  async createPayment({
    amount,
    currency = "USD",
    customerEmail,
    description = "IPTV Subscription",
    callbackUrl,
    successUrl,
    provider = "moonpay",
    metadata = {},
    userRegion = null, // Add this parameter
  }) {
    // Provider fallback based on region
    const getProviderForRegion = (region) => {
      const regionProviders = {
        US: ["moonpay", "coinbase", "transak", "banxa"],
        EU: ["banxa", "rampnetwork", "guardarian", "mercuryo"],
        UK: ["banxa", "rampnetwork", "guardarian"],
        CA: ["moonpay", "interac", "transak"],
        IN: ["upi", "transak", "mercuryo"],
        default: ["transak", "banxa", "mercuryo", "utorg", "transfi"],
      };

      const providers = regionProviders[region] || regionProviders["default"];
      return providers[0]; // Use first available provider
    };

    const selectedProvider = userRegion
      ? getProviderForRegion(userRegion)
      : provider;

    const walletResult = await this.createWallet({
      address: this.merchantAddress,
      callbackUrl,
    });

    const paymentUrl = this.generatePaymentUrl({
      address_in: walletResult.data.address_in,
      amount,
      provider: selectedProvider,
      email: customerEmail,
      currency,
    });

    return {
      success: true,
      data: {
        id: `paygate-${Date.now()}`,
        payment_url: paymentUrl,
        status: "pending",
        amount: Number(amount),
        currency: currency.toUpperCase(),
        wallet_data: walletResult.data,
        metadata,
        provider: selectedProvider,
      },
    };
  }
}

const paygateService = new PayGateService();
export default paygateService;
