import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import NotRegisterPopup from "./NotRegisterPopup";
import ThankRegisterPopup from "./ThankRegisterPopup";

export default function RegisterFormPopup({ isOpen, onClose }) {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [showNotRegister, setShowNotRegister] = useState(false);

  // Original text constants
  const ORIGINAL_TEXTS = {
    title: "THANK YOU FOR YOUR ORDER!",
    subtitle:
      "Check your email for IPTV details and a secure link to view your order history.",
    form: {
      fullName: "Full Name",
      email: "Email",
      fullNamePlaceholder: "Enter full name",
      emailPlaceholder: "Enter email",
      submitButton: "Proceed With Checkout",
    },
    footer: {
      or: "Or",
      createAccount: "Create an Account",
      toUnlock: "to unlock even more benefits",
    },
  };

  // State for translated content
  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      try {
        const items = [
          ORIGINAL_TEXTS.title,
          ORIGINAL_TEXTS.subtitle,
          ...Object.values(ORIGINAL_TEXTS.form),
          ...Object.values(ORIGINAL_TEXTS.footer),
        ];

        const translated = await translate(items);
        if (!isMounted) return;

        const [tTitle, tSubtitle, ...tForm] = translated;
        const tFooter = tForm.slice(6);

        setTexts({
          title: tTitle,
          subtitle: tSubtitle,
          form: {
            fullName: tForm[0],
            email: tForm[1],
            fullNamePlaceholder: tForm[2],
            emailPlaceholder: tForm[3],
            submitButton: tForm[4],
          },
          footer: {
            or: tFooter[0],
            createAccount: tFooter[1],
            toUnlock: tFooter[2],
          },
        });
      } catch (error) {
        console.error("Translation error:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

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
              {texts.title}
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed font-secondary">
              {texts.subtitle}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4 sm:space-y-6 font-secondary">
            {/* Full Name Field */}
            <div>
              <label className="block text-white text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                {texts.form.fullName}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={texts.form.fullNamePlaceholder}
                className="w-full bg-[#0c171c] border border-[#FFFFFF26] rounded-full px-4 sm:px-6 py-3 sm:py-4 text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-cyan-400 transition-colors text-sm sm:text-base"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-white text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                {texts.form.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={texts.form.emailPlaceholder}
                className="w-full bg-[#0c171c] border border-[#FFFFFF26] rounded-full px-4 sm:px-6 py-3 sm:py-4 text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-cyan-400 transition-colors text-sm sm:text-base"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-cyan-400 text-black py-3 sm:py-4 rounded-full font-semibold text-xs sm:text-sm hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2 mt-6 sm:mt-8 font-secondary"
            >
              {texts.form.submitButton}
              <ArrowRight size={16} className="sm:w-5 sm:h-5" />
            </button>

            {/* Footer Text */}
            <p className="text-center text-gray-300 text-xs sm:text-sm mt-4 sm:mt-6 font-secondary">
              {texts.footer.or}{" "}
              <button
                onClick={handleCreateAccount}
                className="text-primary hover:text-cyan-300 underline cursor-pointer"
              >
                {texts.footer.createAccount}
              </button>{" "}
              {texts.footer.toUnlock}
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
