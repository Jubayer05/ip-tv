"use client";
import { CircleMinus, CirclePlus } from "lucide-react";
import { useState } from "react";

export default function FAQ() {
  const [openItem, setOpenItem] = useState(0); // Only one item can be open at a time

  const faqData = [
    {
      question: "What is Cheap Stream?",
      answer:
        "Cheap Stream is a budget-friendly IPTV service that gives you access to thousands of movies, TV shows, live channels, and more—all streamed directly to your favorite device in HD or 4K.",
    },
    {
      question:
        "Do I need a cable subscription or satellite dish to use Cheap Stream?",
      answer:
        "No, you don't need a cable subscription or satellite dish. Cheap Stream works entirely over the internet, so you just need a stable internet connection to enjoy all the content.",
    },
    {
      question: "What kind of movies are available on Cheap Stream?",
      answer:
        "Cheap Stream offers a vast library of movies across all genres including action, comedy, drama, horror, sci-fi, documentaries, and more. You'll find both classic films and the latest releases.",
    },
    {
      question: "Can I watch Cheap Stream on multiple devices?",
      answer:
        "Yes, you can watch Cheap Stream on multiple devices including smart TVs, smartphones, tablets, computers, streaming devices, and more. Check your plan for specific device limits.",
    },
    {
      question: "Is there a contract or cancellation fee?",
      answer:
        "No, there are no long-term contracts or cancellation fees. You can cancel your subscription at any time without any penalties or additional charges.",
    },
    {
      question: "How do I get started with Cheap Stream?",
      answer:
        "Getting started is easy! Simply choose your preferred plan, create an account, make your payment, and you'll receive your login credentials to start streaming immediately.",
    },
  ];

  const toggleItem = (index) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <div className="mt-24 container">
      {/* Header */}
      <h1 className="text-white text-4xl font-bold text-center mb-12 tracking-wider">
        FREQUENTLY ASKED QUESTIONS
      </h1>

      {/* FAQ Items */}
      <div className="space-y-4">
        {faqData.map((item, index) => (
          <div
            key={index}
            className={`overflow-hidden rounded-2xl transition-all duration-500 ease-in-out ${
              openItem === index
                ? "border border-primary shadow-lg shadow-cyan-400/20"
                : "border border-transparent"
            }`}
          >
            {/* Question Header */}
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between p-6  text-white hover:bg-black/30 border border-[#ffffff00] hover:border-[#ffffff20] transition-all duration-300 ease-in-out rounded-2xl group"
            >
              <h3 className="text-lg md:text-xl font-semibold text-left pr-4 transition-colors duration-300">
                {item.question}
              </h3>
              <div className="flex-shrink-0 transition-transform duration-300 ease-in-out group-hover:scale-110">
                {openItem === index ? (
                  <CircleMinus className="w-6 h-6 text-primary transition-all duration-300 ease-in-out transform" />
                ) : (
                  <CirclePlus className="w-6 h-6 text-primary transition-all duration-300 ease-in-out transform" />
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
              <div className="px-6 pb-6">
                <div className="border-t border-gray-800 pt-4 transition-all duration-300 ease-in-out">
                  <p className="text-gray-300 font-secondary text-base leading-relaxed transform transition-all duration-500 ease-in-out">
                    {item.answer}
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
