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
    <div className="bg-black border border-[#212121] text-white p-4 sm:p-6 rounded-lg w-full lg:max-w-md mx-auto">
      {/* Header */}
      <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 tracking-wide">
        DEPOSIT & PAYOUTS
      </h2>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Balance Section */}
        <div className="mb-4 sm:mb-6 flex-1">
          <p className="text-gray-300 text-xs sm:text-sm mb-3">
            Affiliate Wallet Balance:
          </p>
          <div className="inline-block border-2 bg-primary/15 border-primary text-primary rounded-full px-4 sm:px-6 py-2 sm:py-3">
            <span className="text-xl sm:text-2xl font-bold">
              ${balance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-4 sm:mb-6 flex-1 sm:flex sm:flex-col sm:items-end">
          <button
            onClick={handleDepositFunds}
            className="w-full sm:w-[150px] py-2 sm:py-3 border-2 border-cyan-400 text-cyan-400 rounded-full text-xs sm:text-sm font-bold hover:bg-cyan-400 hover:text-gray-900 transition-colors duration-200"
          >
            Deposit Funds
          </button>

          <button
            onClick={handleWithdrawFunds}
            className="w-full sm:w-[150px] py-2 sm:py-3 bg-cyan-400 text-gray-900 rounded-full text-xs sm:text-sm font-bold hover:bg-cyan-500 transition-colors duration-200"
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
