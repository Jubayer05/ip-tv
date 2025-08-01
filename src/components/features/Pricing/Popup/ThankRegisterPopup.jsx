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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 font-secondary">
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
              <Check
                size={32}
                className="text-black font-bold"
                strokeWidth={3}
              />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-white text-2xl font-bold mb-4 tracking-wide">
              THANK YOU FOR YOUR ORDER!
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed">
              Check your email for IPTV details and a secure link to
              <br />
              view your order history.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Back to Home Button */}
            <button
              onClick={handleBackToHome}
              className="w-full bg-cyan-400 text-black py-4 rounded-full font-semibold text-sm hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2"
            >
              Back To Home Page
              <ArrowRight size={20} />
            </button>

            {/* Payment Confirm Button */}
            <button
              onClick={handlePaymentConfirm}
              className="w-full bg-cyan-400 text-black py-4 rounded-full font-semibold text-sm hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2"
            >
              Payment Confirm Popup
              <ArrowRight size={20} />
            </button>

            {/* Create Account Button */}
            <button
              onClick={handleCreateAccount}
              className="w-full bg-transparent border-2 border-primary text-primary py-4 rounded-full font-semibold text-sm hover:bg-cyan-400 hover:text-black transition-colors"
            >
              Create Account To Unlock Even More Benefits.
            </button>
          </div>

          {/* Footer Text */}
          <div className="text-center mt-8 space-y-2">
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
