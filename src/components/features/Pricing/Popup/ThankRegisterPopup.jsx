import { ArrowRight, Check, X } from "lucide-react";
import { useState } from "react";
import PaymentConfirmPopup from "./PaymentConfirmPopup";

export default function ThankRegisterPopup({ isOpen, onClose }) {
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);

  const handleBackToHome = () => {
    // Handle navigation to home page
    console.log("Navigating to home page");
    onClose();
  };

  const handleCreateAccount = () => {
    // Handle create account action
    console.log("Creating account");
    onClose();
  };

  const handlePaymentConfirm = () => {
    setShowPaymentConfirm(true);
  };

  const closePaymentConfirm = () => {
    setShowPaymentConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50 font-secondary">
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
            <h1 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 tracking-wide">
              THANK YOU FOR YOUR ORDER!
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Check your email for IPTV details and a secure link to
              <br className="hidden sm:block" />
              view your order history.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 sm:space-y-4">
            {/* Back to Home Button */}
            <button
              onClick={handleBackToHome}
              className="w-full bg-cyan-400 text-black py-3 sm:py-4 rounded-full font-semibold text-xs sm:text-sm hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2"
            >
              Back To Home Page
              <ArrowRight size={16} className="sm:w-5 sm:h-5" />
            </button>

            {/* Payment Confirm Button */}
            <button
              onClick={handlePaymentConfirm}
              className="w-full bg-cyan-400 text-black py-3 sm:py-4 rounded-full font-semibold text-xs sm:text-sm hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2"
            >
              Payment Confirm Popup
              <ArrowRight size={16} className="sm:w-5 sm:h-5" />
            </button>

            {/* Create Account Button */}
            <button
              onClick={handleCreateAccount}
              className="w-full bg-transparent border-2 border-primary text-primary py-3 sm:py-4 rounded-full font-semibold text-xs sm:text-sm hover:bg-cyan-400 hover:text-black transition-colors"
            >
              Create Account To Unlock Even More Benefits.
            </button>
          </div>

          {/* Footer Text */}
          <div className="text-center mt-6 sm:mt-8 space-y-2">
            <p className="text-gray-300 text-xs">
              A receipt has been sent to your email.
            </p>
            <p className="text-gray-400 text-xs">
              For questions, contact: info@iptvstore.com
            </p>
          </div>
        </div>
      </div>

      {/* Payment Confirm Popup */}
      <PaymentConfirmPopup
        isOpen={showPaymentConfirm}
        onClose={closePaymentConfirm}
      />
    </>
  );
}
