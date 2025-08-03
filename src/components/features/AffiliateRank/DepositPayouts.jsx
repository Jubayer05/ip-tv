"use client";

export default function DepositPayouts() {
  const balance = 87.0;

  const handleDepositFunds = () => {
    console.log("Deposit funds clicked");
  };

  const handleWithdrawFunds = () => {
    console.log("Withdraw funds clicked");
  };

  return (
    <div className="bg-black border border-[#212121] text-white p-6 rounded-lg max-w-md mx-auto">
      {/* Header */}
      <h2 className="text-lg font-bold mb-6 tracking-wide">
        DEPOSIT & PAYOUTS
      </h2>

      <div className="flex gap-4">
        {/* Balance Section */}
        <div className="mb-6 flex-1/2">
          <p className="text-gray-300 text-sm mb-3">
            Affiliate Wallet Balance:
          </p>
          <div className="inline-block border-2 bg-primary/15 border-primary text-primary rounded-full px-6 py-3">
            <span className="text-2xl font-bold">${balance.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6 flex-1/2 flex flex-col items-end">
          <button
            onClick={handleDepositFunds}
            className="w-[150px] ml-auto py-3 border border-cyan-400 text-cyan-400 rounded-full text-sm font-medium hover:bg-cyan-400 hover:text-gray-900 transition-colors duration-200"
          >
            Deposit Funds
          </button>

          <button
            onClick={handleWithdrawFunds}
            className="w-[150px] py-3 bg-cyan-400 text-gray-900 rounded-full text-sm font-medium hover:bg-cyan-500 transition-colors duration-200"
          >
            Withdraw Funds
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-white text-center font-medium text-xs leading-relaxed">
        *You can use your balance to buy plans or withdraw to your preferred
        payment method.
      </p>
    </div>
  );
}
