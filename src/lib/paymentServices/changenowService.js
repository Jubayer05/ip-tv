class ChangeNOWService {
  constructor() {
    this.apiKey = process.env.CHANGENOW_API_KEY;
    this.baseUrl = "https://api.changenow.io/v2";
  }

  // Helper method to get the correct network for a currency
  getCurrencyNetwork(currency) {
    const networkMap = {
      btc: "btc",
      eth: "eth",
      usdt: "eth", // USDT on Ethereum network
      usdc: "eth", // USDC on Ethereum network
      trx: "trx",
      bnb: "bsc",
      matic: "polygon",
      // Add more mappings as needed
    };
    return networkMap[currency.toLowerCase()] || currency.toLowerCase();
  }

  // Add the missing method
  async getEstimatedExchangeAmount(
    fromAmount,
    fromCurrency,
    toCurrency,
    flow = "standard"
  ) {
    try {
      // Handle both object and individual parameter calls
      let params;
      if (typeof fromAmount === "object") {
        // Called with object: { fromCurrency, toCurrency, fromAmount, flow }
        params = fromAmount;
        fromAmount = params.fromAmount;
        fromCurrency = params.fromCurrency;
        toCurrency = params.toCurrency;
        flow = params.flow || "standard";
      } else {
        // Called with individual parameters: (fromAmount, fromCurrency, toCurrency, flow)
        params = { fromAmount, fromCurrency, toCurrency, flow };
      }

      // Get proper network for each currency
      const fromNetwork = this.getCurrencyNetwork(fromCurrency);
      const toNetwork = this.getCurrencyNetwork(toCurrency);

      const response = await fetch(
        `${this.baseUrl}/exchange/estimated-amount?fromCurrency=${fromCurrency}&toCurrency=${toCurrency}&fromAmount=${fromAmount}&flow=${flow}&fromNetwork=${fromNetwork}&toNetwork=${toNetwork}`,
        {
          method: "GET",
          headers: {
            "x-changenow-api-key": this.apiKey,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `ChangeNOW estimate error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          estimatedAmount: data.estimatedAmount,
          transactionSpeedForecast: data.transactionSpeedForecast,
          warningMessage: data.warningMessage,
        },
      };
    } catch (error) {
      console.error("ChangeNOW getEstimatedExchangeAmount error:", error);
      throw error;
    }
  }

  async createTransaction({
    fromCurrency,
    toCurrency,
    fromAmount,
    toAmount,
    address,
    extraId = "",
    refundAddress = "",
    refundExtraId = "",
    userId = "",
    contactEmail = "",
    flow = "standard", // Revert to "standard" for crypto-to-crypto
    type = "direct",
    rateId = "",
  }) {
    if (!this.apiKey) {
      throw new Error("CHANGENOW_API_KEY not configured");
    }

    try {
      // Revert to original network mapping for crypto-to-crypto
      const fromNetwork = this.getCurrencyNetwork(fromCurrency);
      const toNetwork = this.getCurrencyNetwork(toCurrency);

      // First, get estimated amount if not provided
      let estimatedToAmount = toAmount;
      if (!estimatedToAmount && fromAmount) {
        const estimate = await this.getEstimatedAmount({
          fromCurrency,
          toCurrency,
          fromAmount,
          flow,
        });
        estimatedToAmount = estimate.estimatedAmount;
      }

      const requestBody = {
        fromCurrency,
        fromNetwork,
        toCurrency,
        toNetwork,
        fromAmount: fromAmount?.toString(),
        toAmount: estimatedToAmount?.toString() || "",
        address,
        extraId,
        refundAddress,
        refundExtraId,
        userId,
        payload: "",
        contactEmail,
        flow, // "standard" for crypto-to-crypto
        type,
        rateId,
      };

      const response = await fetch(`${this.baseUrl}/exchange`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-changenow-api-key": this.apiKey,
          "x-forwarded-for": "0.0.0.0",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `ChangeNOW API error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      return {
        success: true,
        transactionId: data.id,
        fromAmount: data.fromAmount,
        toAmount: data.toAmount,
        payinAddress: data.payinAddress,
        payoutAddress: data.payoutAddress,
        payinExtraId: data.payinExtraId,
        payoutExtraId: data.payoutExtraId,
        fromCurrency: data.fromCurrency,
        toCurrency: data.toCurrency,
        fromNetwork: data.fromNetwork,
        toNetwork: data.toNetwork,
        flow: data.flow,
        type: data.type,
        rateId: data.rateId,
        refundAddress: data.refundAddress,
        refundExtraId: data.refundExtraId,
        payoutExtraIdName: data.payoutExtraIdName,
      };
    } catch (error) {
      console.error("ChangeNOW createTransaction error:", error);
      throw error;
    }
  }

  async getEstimatedAmount({
    fromCurrency,
    toCurrency,
    fromAmount,
    flow = "standard",
  }) {
    try {
      // Get proper network for each currency
      const fromNetwork = this.getCurrencyNetwork(fromCurrency);
      const toNetwork = this.getCurrencyNetwork(toCurrency);

      const response = await fetch(
        `${this.baseUrl}/exchange/estimated-amount?fromCurrency=${fromCurrency}&toCurrency=${toCurrency}&fromAmount=${fromAmount}&flow=${flow}&fromNetwork=${fromNetwork}&toNetwork=${toNetwork}`,
        {
          method: "GET",
          headers: {
            "x-changenow-api-key": this.apiKey,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `ChangeNOW estimate error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      return {
        estimatedAmount: data.estimatedAmount,
        transactionSpeedForecast: data.transactionSpeedForecast,
        warningMessage: data.warningMessage,
      };
    } catch (error) {
      console.error("ChangeNOW getEstimatedAmount error:", error);
      throw error;
    }
  }

  async getTransactionStatus(transactionId) {
    try {
      // Use the correct endpoint with query parameter
      const response = await fetch(
        `${this.baseUrl}/exchange/by-id?id=${transactionId}`,
        {
          method: "GET",
          headers: {
            "x-changenow-api-key": this.apiKey,
          },
        }
      );

      if (!response.ok) {
        // If 404, the transaction might not exist yet or ID is invalid
        if (response.status === 404) {
          return {
            success: false,
            error: "Transaction not found",
            status: "not_found",
          };
        }

        const errorText = await response.text();
        throw new Error(
          `ChangeNOW status error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      return {
        success: true,
        status: data.status,
        transactionId: data.id,
        fromAmount: data.amountFrom,
        toAmount: data.amountTo,
        expectedAmountFrom: data.expectedAmountFrom,
        expectedAmountTo: data.expectedAmountTo,
        payinAddress: data.payinAddress,
        payoutAddress: data.payoutAddress,
        payinExtraId: data.payinExtraId,
        payoutExtraId: data.payoutExtraId,
        fromCurrency: data.fromCurrency,
        toCurrency: data.toCurrency,
        fromNetwork: data.fromNetwork,
        toNetwork: data.toNetwork,
        flow: data.flow,
        type: data.type,
        rateId: data.rateId,
        refundAddress: data.refundAddress,
        refundExtraId: data.refundExtraId,
        payoutExtraIdName: data.payoutExtraIdName,
        payinHash: data.payinHash,
        payoutHash: data.payoutHash,
        refundHash: data.refundHash,
        refundAmount: data.refundAmount,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        depositReceivedAt: data.depositReceivedAt,
        validUntil: data.validUntil,
        actionsAvailable: data.actionsAvailable,
        fromLegacyTicker: data.fromLegacyTicker,
        toLegacyTicker: data.toLegacyTicker,
        userId: data.userId,
        relatedExchangesInfo: data.relatedExchangesInfo,
        repeatedExchangesInfo: data.repeatedExchangesInfo,
        originalExchangeInfo: data.originalExchangeInfo,
      };
    } catch (error) {
      console.error("ChangeNOW getTransactionStatus error:", error);
      throw error;
    }
  }

  // Map ChangeNOW status to our payment status
  mapStatusToPaymentStatus(changenowStatus) {
    const statusMap = {
      new: "pending",
      waiting: "pending",
      confirming: "pending",
      exchanging: "pending",
      sending: "pending",
      verifying: "pending",
      finished: "completed",
      failed: "failed",
      refunded: "refunded",
      expired: "failed",
      not_found: "pending", // Handle 404 case
    };
    return statusMap[changenowStatus] || "pending";
  }

  // Add helper method to check if currency is fiat
  isFiatCurrency(currency) {
    const fiatCurrencies = [
      "usd",
      "eur",
      "gbp",
      "cad",
      "aud",
      "jpy",
      "chf",
      "nok",
      "sek",
      "dkk",
      "pln",
      "czk",
      "huf",
      "ron",
      "bgn",
      "hrk",
      "rsd",
      "mkd",
      "bam",
      "all",
      "rub",
      "uah",
      "byn",
      "kzt",
      "uzs",
      "kgs",
      "tjs",
      "tmt",
      "azn",
      "amd",
      "gel",
      "try",
      "ils",
      "aed",
      "sar",
      "qar",
      "kwd",
      "bhd",
      "omr",
      "jod",
      "lbp",
      "egp",
      "mad",
      "tnd",
      "dzd",
      "lyd",
      "sdg",
      "etb",
      "kes",
      "ugx",
      "tzs",
      "rwf",
      "bif",
      "djf",
      "sos",
      "er",
      "etb",
      "zmw",
      "bwp",
      "szl",
      "lsl",
      "nad",
      "zar",
      "aoa",
      "mzn",
      "mwk",
      "zmw",
      "bwp",
      "szl",
      "lsl",
      "nad",
      "zar",
      "aoa",
      "mzn",
      "mwk",
    ];
    return fiatCurrencies.includes(currency.toLowerCase());
  }

  // Add method for fiat widget integration
  getFiatWidgetUrl({
    fromCurrency = "usd",
    toCurrency = "usdt",
    fromAmount,
    toAmount,
    address,
    userId = "",
    contactEmail = "",
  }) {
    const baseUrl = "https://changenow.io/exchange";
    const params = new URLSearchParams({
      from: fromCurrency,
      to: toCurrency,
      amount: fromAmount,
      address: address,
      userId: userId,
      email: contactEmail,
      flow: "fiat", // This is for the widget, not the API
    });

    return `${baseUrl}?${params.toString()}`;
  }

  // Add fiat transaction method
  async createFiatTransaction({
    fromAmount,
    fromCurrency,
    toCurrency,
    payoutAddress,
    payoutExtraId = "",
    depositType = "VISA_MC1", // Default to Visa/Mastercard
    payoutType = "CRYPTO_THROUGH_CN", // Default to crypto through ChangeNOW
    externalPartnerLinkId = "",
    customerEmail = "",
    customerPhone = "",
    apiKey, // NEW: optional override
  }) {
    const key = apiKey || this.apiKey;
    if (!key) throw new Error("CHANGENOW_API_KEY (fiat) not configured");

    try {
      // Get proper network for crypto currency
      const toNetwork = this.getCurrencyNetwork(toCurrency);

      const requestBody = {
        from_amount: Number(fromAmount),
        from_currency: fromCurrency.toUpperCase(),
        to_currency: toCurrency.toUpperCase(),
        from_network: null, // Fiat currencies don't have networks
        to_network: toNetwork,
        payout_address: payoutAddress,
        payout_extra_id: payoutExtraId,
        deposit_type: depositType,
        payout_type: payoutType,
        external_partner_link_id: externalPartnerLinkId,
        customer: {
          contact_info: {
            email: customerEmail,
            phone_number: customerPhone,
          },
        },
      };

      const response = await fetch(`${this.baseUrl}/fiat-transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key, // Fiat endpoint requires x-api-key
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `ChangeNOW fiat transaction error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      return {
        success: true,
        transactionId: data.id,
        fromAmount: data.from_amount,
        toAmount: data.to_amount,
        fromCurrency: data.from_currency,
        toCurrency: data.to_currency,
        payoutAddress: data.payout_address,
        payoutExtraId: data.payout_extra_id,
        depositType: data.deposit_type,
        payoutType: data.payout_type,
        status: data.status,
        checkoutUrl:
          data.checkout_url || `https://changenow.io/exchange/txs/${data.id}`,
        expiresAt: data.expires_at,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error("ChangeNOW createFiatTransaction error:", error);
      throw error;
    }
  }
}

export default new ChangeNOWService();
