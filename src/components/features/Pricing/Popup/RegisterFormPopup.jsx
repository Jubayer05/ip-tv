import { ArrowRight, X } from "lucide-react";
import { useState } from "react";
import NotRegisterPopup from "./NotRegisterPopup";
import ThankRegisterPopup from "./ThankRegisterPopup";

export default function RegisterFormPopup({ isOpen, onClose }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [showNotRegister, setShowNotRegister] = useState(false);

  const handleSubmit = () => {
    // Handle form submission here
    console.log("Form submitted:", { fullName, email });
    setShowThankYou(true);
  };

  const closeThankYou = () => {
    setShowThankYou(false);
    onClose();
  };

  const handleCreateAccount = () => {
    console.log("Create account clicked"); // Debug log
    setShowNotRegister(true);
  };

  const closeNotRegister = () => {
    setShowNotRegister(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
        {/* Modal Content */}
        <div className="bg-black rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto relative border border-[#FFFFFF26]">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 text-white hover:text-gray-300 transition-colors"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 tracking-wide">
              THANK YOU FOR YOUR ORDER!
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed font-secondary">
              Check your email for IPTV details and a secure link to
              <br className="hidden sm:block" />
              view your order history.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4 sm:space-y-6 font-secondary">
            {/* Full Name Field */}
            <div>
              <label className="block text-white text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                className="w-full bg-[#0c171c] border border-[#FFFFFF26] rounded-full px-4 sm:px-6 py-3 sm:py-4 text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-cyan-400 transition-colors text-sm sm:text-base"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-white text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full bg-[#0c171c] border border-[#FFFFFF26] rounded-full px-4 sm:px-6 py-3 sm:py-4 text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-cyan-400 transition-colors text-sm sm:text-base"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-cyan-400 text-black py-3 sm:py-4 rounded-full font-semibold text-xs sm:text-sm hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2 mt-6 sm:mt-8 font-secondary"
            >
              Proceed With Checkout
              <ArrowRight size={16} className="sm:w-5 sm:h-5" />
            </button>

            {/* Footer Text */}
            <p className="text-center text-gray-300 text-xs sm:text-sm mt-4 sm:mt-6 font-secondary">
              Or{" "}
              <button
                onClick={handleCreateAccount}
                className="text-primary hover:text-cyan-300 underline cursor-pointer"
              >
                Create an Account
              </button>{" "}
              to unlock even more benefits
            </p>
          </div>
        </div>
      </div>

      {/* Thank You Popup */}
      <ThankRegisterPopup isOpen={showThankYou} onClose={closeThankYou} />

      {/* Not Register Popup */}
      <NotRegisterPopup isOpen={showNotRegister} onClose={closeNotRegister} />
    </>
  );
}
