"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApi } from "@/hooks/useApi";
import {
  ArrowRight,
  Check,
  Clock,
  Mail,
  MessageCircle,
  Phone,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import Swal from "sweetalert2";

const ContactForm = () => {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const { apiCall } = useApi();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [recaptchaEnabled, setRecaptchaEnabled] = useState(false);
  const [settings, setSettings] = useState({
    supportTicketButtonText: "Submit Request",
    supportTicketSuccessMessage:
      "Your contact request has been submitted successfully. We'll get back to you soon!",
  });
  const fetchedRef = useRef(false);
  const recaptchaRef = useRef();

  // Original text constants
  const ORIGINAL_TEXTS = {
    labels: {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      subject: "Subject",
      description: "Description",
    },
    placeholders: {
      firstName: "Enter your first name",
      lastName: "Enter your last name",
      email: "Enter your email here",
      subject: "Write your contact reason here",
      description: "Type your message here",
    },
    required: "*",
    success: {
      title: "THANK YOU FOR YOUR MESSAGE!",
      subtitle:
        "We have received your contact request and will get back to you soon.",
      button: "OK",
    },
  };

  // State for translated content
  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  // Fetch settings on component mount
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    (async () => {
      try {
        const response = await apiCall("/api/admin/settings", "GET");
        if (response.success && response.data) {
          setSettings({
            supportTicketButtonText:
              response.data.contactInfo?.supportTicketButtonText ||
              "Submit Request",
            supportTicketSuccessMessage:
              response.data.contactInfo?.supportTicketSuccessMessage ||
              "Your contact request has been submitted successfully. We'll get back to you soon!",
          });

          // Check reCAPTCHA setting
          if (response.data.addons) {
            setRecaptchaEnabled(response.data.addons.recaptcha);
            // Store the site key for later use
            if (response.data.apiKeys?.recaptcha?.siteKey) {
              window.RECAPTCHA_SITE_KEY =
                response.data.apiKeys.recaptcha.siteKey;
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      try {
        const items = [
          ...Object.values(ORIGINAL_TEXTS.labels),
          ...Object.values(ORIGINAL_TEXTS.placeholders),
          settings.supportTicketButtonText,
          ...Object.values(ORIGINAL_TEXTS.success),
        ];

        const translated = await translate(items);
        if (!isMounted) return;

        const labelsCount = Object.keys(ORIGINAL_TEXTS.labels).length;
        const placeholdersCount = Object.keys(
          ORIGINAL_TEXTS.placeholders
        ).length;

        const tLabels = translated.slice(0, labelsCount);
        const tPlaceholders = translated.slice(
          labelsCount,
          labelsCount + placeholdersCount
        );
        const tButton = translated[labelsCount + placeholdersCount];
        const tSuccess = translated.slice(labelsCount + placeholdersCount + 1);

        setTexts({
          labels: {
            firstName: tLabels[0],
            lastName: tLabels[1],
            email: tLabels[2],
            subject: tLabels[3],
            description: tLabels[4],
          },
          placeholders: {
            firstName: tPlaceholders[0],
            lastName: tPlaceholders[1],
            email: tPlaceholders[2],
            subject: tPlaceholders[3],
            description: tPlaceholders[4],
          },
          required: ORIGINAL_TEXTS.required,
          button: tButton,
          success: {
            title: tSuccess[0],
            subtitle: tSuccess[1],
            button: tSuccess[2],
          },
        });
      } catch (error) {
        console.error("Translation error:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [
    language.code,
    isLanguageLoaded,
    translate,
    settings.supportTicketButtonText,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.subject ||
      !formData.description
    ) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Please fill in all required fields",
        confirmButtonColor: "#44dcf3",
      });
      return;
    }

    // Check reCAPTCHA if enabled
    if (recaptchaEnabled && !recaptchaToken) {
      Swal.fire({
        icon: "error",
        title: "Verification Required",
        text: "Please complete the reCAPTCHA verification.",
        confirmButtonColor: "#44dcf3",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken: recaptchaToken,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowSuccessPopup(true);
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          subject: "",
          description: "",
        });
        // Reset reCAPTCHA
        if (recaptchaEnabled) {
          recaptchaRef.current?.reset();
          setRecaptchaToken(null);
        }
      } else {
        throw new Error(data.error || "Failed to submit request");
      }
    } catch (error) {
      console.error("Submit error:", error);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "Failed to submit your request. Please try again.",
        confirmButtonColor: "#44dcf3",
      });
    } finally {
      setLoading(false);
    }
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
  };

  return (
    <>
      <div className="w-full px-4 md:px-0">
        <div className="bg-black p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-white/15 font-secondary w-full max-w-2xl lg:ml-auto">
          <div className="space-y-4 sm:space-y-6">
            {/* First Name and Last Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-white text-xs sm:text-sm font-medium mb-2">
                  {texts.labels.firstName}
                </label>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder={texts.placeholders.firstName}
                  className="text-xs sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-xs sm:text-sm font-medium mb-2">
                  {texts.labels.lastName}
                </label>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder={texts.placeholders.lastName}
                  className="text-xs sm:text-sm"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-white text-xs sm:text-sm font-medium mb-2">
                {texts.labels.email}{" "}
                <span className="text-red-500">{texts.required}</span>
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={texts.placeholders.email}
                required
                className="text-xs sm:text-sm"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-white text-xs sm:text-sm font-medium mb-2">
                {texts.labels.subject}{" "}
                <span className="text-red-500">{texts.required}</span>
              </label>
              <Input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder={texts.placeholders.subject}
                required
                className="text-xs sm:text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white text-xs sm:text-sm font-medium mb-2">
                {texts.labels.description}{" "}
                <span className="text-red-500">{texts.required}</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={texts.placeholders.description}
                required
                rows={4}
                className="w-full bg-[#0C171C] text-white placeholder-white/50 border border-white/10 rounded-[10px] sm:rounded-[15px] px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none transition-all duration-200"
              />
            </div>

            {/* reCAPTCHA */}
            {recaptchaEnabled && (
              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={
                    window.RECAPTCHA_SITE_KEY ||
                    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
                  }
                  onChange={handleRecaptchaChange}
                  theme="dark"
                />
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-2 text-xs sm:text-sm py-3 sm:py-4"
              onClick={handleSubmit}
              disabled={loading || (recaptchaEnabled && !recaptchaToken)}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </div>
              ) : (
                <>
                  <span>
                    {texts.button || settings.supportTicketButtonText}
                  </span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50 font-secondary">
          <div className="bg-black rounded-2xl sm:rounded-3xl p-4 sm:pm-6 md:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto relative border border-[#FFFFFF26]">
            <button
              onClick={closeSuccessPopup}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 text-white hover:text-gray-300 transition-colors"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>

            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="bg-cyan-400 rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center">
                <Check
                  size={24}
                  className="text-black font-bold sm:w-8 sm:h-8 md:w-8 md:h-8"
                  strokeWidth={3}
                />
              </div>
            </div>

            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 tracking-wide">
                {texts.success.title}
              </h1>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-4">
                Thank you for choosing{" "}
                <span className="text-cyan-400 font-semibold">
                  Cheap Stream
                </span>{" "}
                where great entertainment meets unbeatable value. We look
                forward to assisting you!
              </p>

              {/* Contact Information */}
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 text-gray-300 text-xs sm:text-sm">
                  <Phone className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>
                    Call Us:{" "}
                    <span className="text-cyan-400 font-semibold">
                      +123 456 789 012
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-gray-300 text-xs sm:text-sm">
                  <Mail className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>
                    Email Us:{" "}
                    <span className="text-cyan-400 font-semibold">
                      help@cheapstream.com
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-gray-300 text-xs sm:text-sm">
                  <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>
                    Business Hours:{" "}
                    <span className="text-cyan-400 font-semibold">
                      Mon–Fri (09:00 AM – 5:00 PM)
                    </span>
                  </span>
                </div>

                <div className="flex items-start gap-3 text-gray-300 text-xs sm:text-sm mt-4">
                  <MessageCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>
                    If you have any questions about your order, please describe
                    it and include your Order ID in the message
                    <span className="text-cyan-400 font-semibold">
                      {" "}
                      (example: zxxxx.xxxx.xxx)
                    </span>
                    .
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <button
                onClick={closeSuccessPopup}
                className="w-full bg-cyan-400 text-black py-3 sm:py-4 rounded-full font-semibold text-xs sm:text-sm hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2"
              >
                {texts.success.button}
                <ArrowRight size={16} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContactForm;
