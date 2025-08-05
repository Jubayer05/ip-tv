import { ArrowRight, Check, User, X } from "lucide-react";

export default function NotRegisterPopup({ isOpen, onClose }) {
  const handleCreateAccount = () => {
    // Handle create account action
    console.log("Creating account now");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-[60] font-secondary">
      {/* Modal Content */}
      <div className="bg-black rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto relative border border-[#FFFFFF26]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 text-white hover:text-gray-300 transition-colors"
        >
          <X size={20} className="sm:w-6 sm:h-6" />
        </button>

        {/* User Icon with X */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="relative">
            <div className="bg-cyan-400 rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center">
              <User
                size={24}
                className="text-black sm:w-8 sm:h-8 md:w-8 md:h-8"
                strokeWidth={2}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-black rounded-full w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center border-2 border-primary">
              <X
                size={12}
                className="text-primary sm:w-4 sm:h-4 md:w-4 md:h-4"
                strokeWidth={3}
              />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 tracking-wide">
            NOT REGISTERED YET?
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm">
            Create an account to unlock
          </p>
        </div>

        {/* Benefits List */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <Check
              size={16}
              className="text-green-400 flex-shrink-0 sm:w-5 sm:h-5"
              strokeWidth={2}
            />
            <span className="text-white text-xs sm:text-sm">
              Affiliate Mode
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Check
              size={16}
              className="text-green-400 flex-shrink-0 sm:w-5 sm:h-5"
              strokeWidth={2}
            />
            <span className="text-white text-xs sm:text-sm">
              Rank-Based Discounts
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Check
              size={16}
              className="text-green-400 flex-shrink-0 sm:w-5 sm:h-5"
              strokeWidth={2}
            />
            <span className="text-white text-xs sm:text-sm">
              Auto Renew & Saved Payment
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Check
              size={16}
              className="text-green-400 flex-shrink-0 sm:w-5 sm:h-5"
              strokeWidth={2}
            />
            <span className="text-white text-xs sm:text-sm">
              Full Dashboard Access
            </span>
          </div>
        </div>

        {/* Create Account Button */}
        <button
          onClick={handleCreateAccount}
          className="w-full bg-cyan-400 text-black py-3 sm:py-4 rounded-full font-semibold text-xs sm:text-sm hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2"
        >
          Create Account Now
          <ArrowRight size={16} className="sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}
