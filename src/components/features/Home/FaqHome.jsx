"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { CircleMinus, CirclePlus } from "lucide-react";
import { useEffect, useState } from "react";

export default function FAQ() {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [openItem, setOpenItem] = useState(0);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  const ORIGINAL_HEADING = "FREQUENTLY ASKED QUESTIONS";
  const ORIGINAL_NO_FAQS = "No FAQs available at the moment.";

  const [heading, setHeading] = useState(ORIGINAL_HEADING);
  const [noFaqsText, setNoFaqsText] = useState(ORIGINAL_NO_FAQS);

  // Load FAQs from API
  const loadFAQs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/faq");
      const data = await res.json();

      if (data.success) {
        // Filter only active FAQs and sort by order
        const activeFaqs = (data.faqs || [])
          .filter((faq) => faq.isActive)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setFaqs(activeFaqs);
      }
    } catch (error) {
      console.error("Failed to load FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFAQs();
  }, []);

  // Translate static texts
  useEffect(() => {
    if (!isLanguageLoaded || language?.code === "en") {
      setHeading(ORIGINAL_HEADING);
      setNoFaqsText(ORIGINAL_NO_FAQS);
      return;
    }

    let isMounted = true;
    (async () => {
      const items = [ORIGINAL_HEADING, ORIGINAL_NO_FAQS];
      const translated = await translate(items);
      if (!isMounted) return;

      const [tHeading, tNoFaqs] = translated;
      setHeading(tHeading);
      setNoFaqsText(tNoFaqs);
    })();

    return () => {
      isMounted = false;
    };
  }, [language?.code, translate, isLanguageLoaded]);

  // Translate FAQ content
  useEffect(() => {
    if (!faqs.length || !isLanguageLoaded || language?.code === "en") return;

    let isMounted = true;
    (async () => {
      try {
        // Collect all questions and answers for translation
        const textsToTranslate = [];
        faqs.forEach((faq) => {
          textsToTranslate.push(faq.question);
          textsToTranslate.push(faq.answer);
        });

        const translated = await translate(textsToTranslate);
        if (!isMounted) return;

        // Update FAQs with translated content
        const translatedFaqs = faqs.map((faq, index) => ({
          ...faq,
          question: translated[index * 2],
          answer: translated[index * 2 + 1],
        }));

        setFaqs(translatedFaqs);
      } catch (error) {
        console.error("Error translating FAQs:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [faqs.length, language?.code, translate, isLanguageLoaded]);

  const toggleItem = (index) => {
    setOpenItem(openItem === index ? null : index);
  };

  if (loading) {
    return (
      <div className="mt-12 sm:mt-16 md:mt-20 lg:mt-24 container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-10 md:mb-12 tracking-wider">
          {heading}
        </h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div className="mt-12 sm:mt-16 md:mt-20 lg:mt-24 container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-10 md:mb-12 tracking-wider">
          {heading}
        </h1>
        <div className="text-center text-gray-400">
          <p>{noFaqsText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 sm:mt-16 md:mt-20 lg:mt-24 container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-10 md:mb-12 tracking-wider">
        {heading}
      </h1>

      {/* FAQ Items */}
      <div className="space-y-3 sm:space-y-4 md:space-y-5 max-w-4xl mx-auto">
        {faqs.map((faq, index) => (
          <div
            key={faq._id}
            className={`overflow-hidden rounded-xl sm:rounded-2xl transition-all duration-500 ease-in-out ${
              openItem === index
                ? "border border-primary shadow-lg shadow-cyan-400/20"
                : "border border-transparent"
            }`}
          >
            {/* Question Header */}
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between p-4 sm:p-5 md:p-6 text-white hover:bg-black/30 border border-[#ffffff00] hover:border-[#ffffff20] transition-all duration-300 ease-in-out rounded-xl sm:rounded-2xl group"
            >
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-left pr-3 sm:pr-4 transition-colors duration-300 leading-tight">
                {faq.question}
              </h3>
              <div className="flex-shrink-0 transition-transform duration-300 ease-in-out group-hover:scale-110">
                {openItem === index ? (
                  <CircleMinus className="w-5 h-5 sm:w-6 sm:h-6 text-primary transition-all duration-300 ease-in-out transform" />
                ) : (
                  <CirclePlus className="w-5 h-5 sm:w-6 sm:h-6 text-primary transition-all duration-300 ease-in-out transform" />
                )}
              </div>
            </button>

            {/* Answer Content with Smooth Height Transition */}
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                openItem === index
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
                <div className="border-t border-gray-800 pt-3 sm:pt-4 transition-all duration-300 ease-in-out">
                  <p className="text-gray-300 font-secondary text-xs sm:text-sm md:text-base leading-relaxed transform transition-all duration-500 ease-in-out">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
