// Add this to your payment services
// src/lib/paymentServices/coinbaseService.js

import axios from "axios";

class CoinbaseService {
  constructor() {
    this.apiKey = process.env.COINBASE_API_KEY;
    this.apiSecret = process.env.COINBASE_API_SECRET;
    this.baseUrl = "https://api.coinbase.com/v2";
  }

  async getExchangeRates(currency = "USD") {
    try {
      const response = await axios.get(
        `${this.baseUrl}/exchange-rates?currency=${currency}`
      );
      return response.data.data.rates;
    } catch (error) {
      console.error("Coinbase API error:", error);
      throw error;
    }
  }

  async createBuyOrder(amount, currency, paymentMethod) {
    try {
      // This would create a buy order for crypto
      // Implementation depends on Coinbase API
      const response = await axios.post(
        `${this.baseUrl}/accounts/${accountId}/buys`,
        {
          amount: amount,
          currency: currency,
          payment_method: paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Coinbase buy order error:", error);
      throw error;
    }
  }
}

export default new CoinbaseService();
