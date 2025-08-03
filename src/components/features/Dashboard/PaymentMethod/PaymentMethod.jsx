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
    <div className="bg-[#0e0e11] rounded-[15px] border border-[#212121] p-8 w-full max-w-4xl mx-auto font-secondary">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-white text-lg font-semibold mb-2">
            SAVED PAYMENT METHODS
          </h2>
          <p className="text-gray-400 text-sm">
            Change how you pay for your plan
          </p>
        </div>
        <button className="border border-gray-600 text-white px-6 py-2 rounded-full font-medium text-sm hover:bg-gray-800 transition-colors flex items-center gap-2">
          <svg
            className="w-4 h-4"
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
      <div className="space-y-6">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="flex items-center justify-between border border-[#212121] rounded-[15px] p-4 hover:bg-white/5"
          >
            <div className="flex items-center gap-4">
              {/* Visa Card Icon */}
              <div className="bg-white rounded-lg p-2 w-12 h-8 flex items-center justify-center">
                <div className="text-blue-600 font-bold text-sm">VISA</div>
              </div>

              {/* Card Details */}
              <div>
                <p className="text-white text-base font-medium mb-1">
                  Visa ending in {method.cardNumber}
                </p>
                <p className="text-gray-400 text-sm mb-1">
                  Expired {method.expiry}
                </p>
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="text-gray-400 text-sm">{method.email}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {method.isPrimary ? (
                <span className="bg-cyan-400 text-gray-900 px-6 py-2 rounded-full font-medium text-sm">
                  Primary Card
                </span>
              ) : (
                <button className="border border-cyan-400 text-cyan-400 px-6 py-2 rounded-full font-medium text-sm hover:bg-cyan-400 hover:text-gray-900 transition-colors">
                  Make Primary Card
                </button>
              )}

              {/* Delete Button */}
              <button className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-red-400 hover:bg-red-400 transition-colors cursor-pointer">
                <BsFillTrashFill />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethods;
