const PaymentMethodCard = () => {
  return (
    <div className="border border-[#212121] bg-black rounded-[15px] p-8 w-full font-secondary">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-white text-lg font-semibold mb-2">
          PAYMENT METHOD
        </h2>
        <p className="text-gray-400 text-sm">
          Change how you pay for your plan
        </p>
      </div>

      {/* Payment Method Details */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Visa Card Icon */}
          <div className="bg-white rounded-lg p-2 w-12 h-8 flex items-center justify-center">
            <div className="text-blue-600 font-bold text-sm">VISA</div>
          </div>

          {/* Card Details */}
          <div>
            <p className="text-white text-base font-medium mb-1">
              Visa ending in 1826
            </p>
            <p className="text-gray-400 text-sm mb-1">Expired 02/2026</p>
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="text-gray-400 text-sm">vipstore@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <button className="bg-cyan-400 text-gray-900 px-6 py-2 rounded-full font-medium text-sm hover:bg-cyan-300 transition-colors">
          Edit
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodCard;
