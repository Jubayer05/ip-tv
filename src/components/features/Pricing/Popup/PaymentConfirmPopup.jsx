import { Check, X } from "lucide-react";

export default function PaymentConfirmPopup({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[70] font-secondary">
      {/* Modal Content */}
      <div className="bg-black rounded-3xl p-8 w-full max-w-lg mx-auto relative border border-[#FFFFFF26]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-cyan-400 rounded-full w-16 h-16 flex items-center justify-center">
            <Check size={32} className="text-black font-bold" strokeWidth={3} />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-white text-2xl font-bold mb-3 tracking-wide">
            PAYMENT CONFIRMED
          </h1>
          <p className="text-gray-300 text-sm">Thank you for your purchase!</p>
        </div>

        {/* Order Details */}
        <div className="space-y-4 mb-8">
          {/* Order ID */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-white/75 text-sm">Order ID:</span>
            <span className="text-white text-sm font-medium">#92838239</span>
          </div>

          {/* Date */}
          <div className="flex justify-between items-center pb-5 border-b border-[#313131]">
            <span className="text-white/75 text-sm">Date:</span>
            <span className="text-white text-sm font-medium">
              24 August 2025
            </span>
          </div>

          {/* Service */}
          <div className="flex justify-between items-center">
            <span className="text-white/75 text-sm">Service:</span>
            <span className="text-white text-sm font-medium">
              Digital Subscription Access
            </span>
          </div>

          {/* Plan */}
          <div className="flex justify-between items-center">
            <span className="text-white/75 text-sm">Plan:</span>
            <span className="text-white text-sm font-medium">Premium</span>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center border-b border-[#313131] pb-5">
            <span className="text-white/75 text-sm">Total:</span>
            <span className="text-white text-sm font-medium">$87.93</span>
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
