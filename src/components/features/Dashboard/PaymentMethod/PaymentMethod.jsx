import Image from "next/image";
import { BsFillTrashFill } from "react-icons/bs";

const PaymentMethods = () => {
  const paymentMethods = [
    {
      id: 1,
      cardNumber: "1826",
      expiry: "02/2026",
      email: "domhupp@gmail.com",
      isPrimary: true,
    },
    {
      id: 2,
      cardNumber: "1826",
      expiry: "02/2026",
      email: "domhupp@gmail.com",
      isPrimary: false,
    },
    {
      id: 3,
      cardNumber: "1826",
      expiry: "02/2026",
      email: "domhupp@gmail.com",
      isPrimary: false,
    },
  ];

  return (
    <div className="bg-[#0e0e11] rounded-[15px] border border-[#212121] p-4 sm:p-6 md:p-8 w-full max-w-4xl mx-auto font-secondary">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
        <div>
          <h2 className="text-white text-base sm:text-lg font-semibold mb-2">
            SAVED PAYMENT METHODS
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm">
            Change how you pay for your plan
          </p>
        </div>
        <button className="border border-gray-600 text-white px-4 sm:px-6 py-2 rounded-full font-medium text-xs sm:text-sm hover:bg-gray-800 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center">
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Payment Method
        </button>
      </div>

      {/* Payment Methods List */}
      <div className="space-y-4 sm:space-y-6">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between border border-[#212121] rounded-[15px] p-3 sm:p-4 hover:bg-white/5 gap-4 sm:gap-0"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Visa Card Icon */}
              <div className="bg-white rounded-lg p-2 w-10 h-6 sm:w-12 sm:h-8 flex items-center justify-center flex-shrink-0">
                <Image
                  src="/icons/Rectangle 1131.png"
                  alt="visa"
                  width={100}
                  height={100}
                />
              </div>

              {/* Card Details */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm sm:text-base font-medium mb-1 truncate">
                  Visa ending in {method.cardNumber}
                </p>
                <p className="text-gray-400 text-xs sm:text-sm mb-1">
                  Expired {method.expiry}
                </p>
                <div className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="text-gray-400 text-xs sm:text-sm truncate">
                    {method.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {method.isPrimary ? (
                <span className="bg-cyan-400 text-gray-900 px-3 sm:px-6 py-2 rounded-full font-medium text-xs sm:text-sm">
                  Primary Card
                </span>
              ) : (
                <button className="border border-cyan-400 text-cyan-400 px-3 sm:px-6 py-2 rounded-full font-medium text-xs sm:text-sm hover:bg-cyan-400 hover:text-gray-900 transition-colors">
                  Make Primary Card
                </button>
              )}

              {/* Delete Button */}
              <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-red-400 hover:bg-red-400 transition-colors cursor-pointer flex-shrink-0">
                <BsFillTrashFill className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethods;
