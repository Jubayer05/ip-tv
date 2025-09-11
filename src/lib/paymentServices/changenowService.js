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
          haders: {
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
    flow = "standard",
    type = "direct",
    rateId = "",
  }) {
    if (!this.apiKey) {
      throw new Error("CHANGENOW_API_KEY not configured");
    }

    try {
      // Get proper network for each currency
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
        fromNetwork, // Use proper network
        toCurrency,
        toNetwork, // Use proper network
        fromAmount: fromAmount?.toString(),
        toAmount: estimatedToAmount?.toString() || "",
        address,
        extraId,
        refundAddress,
        refundExtraId,
        userId,
        payload: "", // Can be used for additional data
        contactEmail,
        flow,
        type,
        rateId,
      };

      const response = await fetch(`${this.baseUrl}/exchange`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-changenow-api-key": this.apiKey,
          "x-forwarded-for": "0.0.0.0", // You might want to get real IP
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
}

export default new ChangeNOWService();
