import { Check, X } from "lucide-react";

export default function PaymentConfirmPopup({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-[70] font-secondary">
      {/* Modal Content */}
      <div className="bg-black rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto relative border border-[#FFFFFF26]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 text-white hover:text-gray-300 transition-colors"
        >
          <X size={20} className="sm:w-6 sm:h-6" />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="bg-cyan-400 rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center">
            <Check
              size={24}
              className="text-black font-bold sm:w-8 sm:h-8 md:w-8 md:h-8"
              strokeWidth={3}
            />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 tracking-wide">
            PAYMENT CONFIRMED
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm">
            Thank you for your purchase!
          </p>
        </div>

        {/* Order Details */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {/* Order ID */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-white/75 text-xs sm:text-sm">Order ID:</span>
            <span className="text-white text-xs sm:text-sm font-medium">
              #92838239
            </span>
          </div>

          {/* Date */}
          <div className="flex justify-between items-center pb-3 sm:pb-5 border-b border-[#313131]">
            <span className="text-white/75 text-xs sm:text-sm">Date:</span>
            <span className="text-white text-xs sm:text-sm font-medium">
              24 August 2025
            </span>
          </div>

          {/* Service */}
          <div className="flex justify-between items-center">
            <span className="text-white/75 text-xs sm:text-sm">Service:</span>
            <span className="text-white text-xs sm:text-sm font-medium text-right">
              Digital Subscription Access
            </span>
          </div>

          {/* Plan */}
          <div className="flex justify-between items-center">
            <span className="text-white/75 text-xs sm:text-sm">Plan:</span>
            <span className="text-white text-xs sm:text-sm font-medium">
              Premium
            </span>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center border-b border-[#313131] pb-3 sm:pb-5">
            <span className="text-white/75 text-xs sm:text-sm">Total:</span>
            <span className="text-white text-xs sm:text-sm font-medium">
              $87.93
            </span>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center space-y-2">
          <p className="text-gray-300 text-xs">
            A receipt has been sent to your email.
          </p>
          <p className="text-white/75 text-xs">
            For questions, contact: info@iptvstore.com
          </p>
        </div>
      </div>
    </div>
  );
}
