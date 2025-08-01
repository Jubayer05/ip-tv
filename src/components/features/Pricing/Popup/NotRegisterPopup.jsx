import { ArrowRight, Check, User, X } from "lucide-react";

export default function NotRegisterPopup({ isOpen, onClose }) {
  const handleCreateAccount = () => {
    // Handle create account action
    console.log("Creating account now");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60] font-secondary">
      {/* Modal Content */}
      <div className="bg-black rounded-3xl p-8 w-full max-w-lg mx-auto relative border border-[#FFFFFF26]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
        >
          <X size={24} />
        </button>

        {/* User Icon with X */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="bg-cyan-400 rounded-full w-16 h-16 flex items-center justify-center">
              <User size={32} className="text-black" strokeWidth={2} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-black rounded-full w-8 h-8 flex items-center justify-center border-2 border-primary">
              <X size={16} className="text-primary" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-white text-2xl font-bold mb-4 tracking-wide">
            NOT REGISTERED YET?
          </h1>
          <p className="text-gray-300 text-sm">Create an account to unlock</p>
        </div>

        {/* Benefits List */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <Check
              size={20}
              className="text-green-400 flex-shrink-0"
              strokeWidth={2}
            />
            <span className="text-white text-sm">Affiliate Mode</span>
          </div>
          <div className="flex items-center gap-3">
            <Check
              size={20}
              className="text-green-400 flex-shrink-0"
              strokeWidth={2}
            />
            <span className="text-white text-sm">Rank-Based Discounts</span>
          </div>
          <div className="flex items-center gap-3">
            <Check
              size={20}
              className="text-green-400 flex-shrink-0"
              strokeWidth={2}
            />
            <span className="text-white text-sm">
              Auto Renew & Saved Payment
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Check
              size={20}
              className="text-green-400 flex-shrink-0"
              strokeWidth={2}
            />
            <span className="text-white text-sm">Full Dashboard Access</span>
          </div>
        </div>

        {/* Create Account Button */}
        <button
          onClick={handleCreateAccount}
          className="w-full bg-cyan-400 text-black py-4 rounded-full font-semibold text-sm hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2"
        >
          Create Account Now
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
