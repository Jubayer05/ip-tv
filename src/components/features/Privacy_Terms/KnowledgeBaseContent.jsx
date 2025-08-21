"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { CircleMinus, CirclePlus } from "lucide-react";
import { useEffect, useState } from "react";

export default function KnowledgeBaseContent() {
  const { language, translate, isLanguageLoaded } = useLanguage();
  const [openItem, setOpenItem] = useState(null);
  const [openCategory, setOpenCategory] = useState(null);

  // Original text constants
  const ORIGINAL_TEXTS = {
    iptvHelpDocumentation: [
      {
        category: "Getting Started",
        description: "New to IPTV? Start here.",
        topics: [
          {
            question: "What is IPTV and how does it work?",
            answer:
              "IPTV (Internet Protocol Television) is a system that delivers television content over internet networks instead of traditional terrestrial, satellite, or cable formats. It works by streaming video content through your internet connection to compatible devices, allowing you to watch live TV, on-demand content, and recorded shows.",
          },
          {
            question: "How to activate your IPTV key",
            answer:
              "To activate your IPTV key:\n1) Log into your account dashboard\n2) Navigate to 'My Services' or 'Activations'\n3) Enter your activation key in the provided field\n4) Select your preferred server location\n5) Click 'Activate' and wait for confirmation\n\nYour service will be active within 5-10 minutes.",
          },
          {
            question: "Supported devices & apps",
            answer:
              "Our IPTV service supports:\n• Android devices (phones, tablets, TV boxes)\n• iOS devices (iPhone, iPad)\n• Smart TVs (Samsung, LG, Sony)\n• MAG boxes\n• Firestick/Fire TV\n• Windows/Mac computers\n• Dedicated IPTV apps like IPTV Smarters, TiviMate, and Perfect Player",
          },
          {
            question:
              "Step-by-step setup guides (Android, Smart TV, iOS, MAG, etc.)",
            answer:
              "Setup varies by device. Generally:\n1) Download the recommended IPTV app\n2) Open the app and select 'Add Playlist'\n3) Enter your M3U URL or portal credentials\n4) Configure EPG if provided\n5) Save settings and refresh channels\n\nDetailed guides are available for each device type in our knowledge base.",
          },
          {
            question: "How to use your IPTV dashboard",
            answer:
              "Your IPTV dashboard allows you to:\n• View active subscriptions\n• Download M3U playlists\n• Access EPG links\n• Manage multiple connections\n• View expiration dates\n• Contact support\n\nAccess it by logging into your account and selecting 'Dashboard' from the main menu.",
          },
        ],
      },
      {
        category: "Account & Orders",
        description: "Manage your profile, purchases, and settings with ease.",
        topics: [
          {
            question: "How to track your orders",
            answer:
              "Track your orders by:\n1) Logging into your account\n2) Going to 'Order History' or 'My Orders'\n3) Viewing order status (Pending, Processing, Completed)\n4) Checking delivery details and activation timelines\n\nYou'll also receive email notifications for order updates.",
          },
          {
            question: "Registering vs. checking out as a guest",
            answer:
              "Registered users get:\n• Order history access\n• Faster future checkouts\n• Subscription management tools\n• Priority support\n\nGuest checkout is faster for one-time purchases but doesn't provide account benefits. We recommend creating an account for better service management.",
          },
          {
            question: "How to update your profile or password",
            answer:
              "Update your profile:\n1) Login and go to 'Account Settings'\n2) Edit personal information, email, or contact details\n3) Save changes\n\nFor password changes:\n1) Go to 'Security Settings'\n2) Enter current password\n3) Set new password and confirm\n\nYou'll receive an email confirmation.",
          },
          {
            question: "Viewing your order history",
            answer:
              "Access order history by logging in and selecting 'Order History' from your dashboard. Here you can view:\n• Past purchases\n• Order dates\n• Payment status\n• Subscription details\n• Renewal dates\n• Download invoices for your records",
          },
          {
            question: "Troubleshooting IPTV key issues",
            answer:
              "Common key issues:\n1) Invalid key - check for typos\n2) Already activated - contact support for reset\n3) Expired key - purchase renewal\n4) Server issues - try different server location\n\nIf problems persist, contact support with your order details.",
          },
        ],
      },
      {
        category: "Resellers & Affiliates",
        description: "Resources for growing your IPTV business.",
        topics: [
          {
            question: "How to become a reseller",
            answer:
              "To become a reseller:\n1) Contact our sales team via email or support ticket\n2) Provide business information and expected volume\n3) Review and sign reseller agreement\n4) Make initial credit purchase\n5) Access reseller dashboard and start selling\n\nMinimum requirements and volume discounts apply.",
          },
          {
            question: "Setting up your affiliate link",
            answer:
              "Set up affiliate links:\n1) Login to affiliate dashboard\n2) Navigate to 'Marketing Tools'\n3) Generate custom tracking links\n4) Use provided banners and promotional materials\n5) Share links and track performance\n\nCommissions are tracked automatically and paid monthly.",
          },
          {
            question: "Understanding reseller pricing & commissions",
            answer:
              "Reseller pricing offers volume discounts:\n• 10+ subscriptions (15% discount)\n• 50+ (25% discount)\n• 100+ (35% discount)\n\nAffiliate commissions:\n• 20% for first 10 sales\n• 25% for 11-50 sales\n• 30% for 50+ monthly sales\n\nPayments processed monthly via PayPal or bank transfer.",
          },
          {
            question: "Managing clients and sub-resellers",
            answer:
              "Client management tools include:\n• Customer database\n• Subscription tracking\n• Renewal notifications\n• Bulk activations\n• Support ticket forwarding\n\nSub-reseller features:\n• Multi-tier commissions\n• Separate dashboards\n• Independent client management while maintaining oversight",
          },
          {
            question: "Affiliate dashboard walkthrough",
            answer:
              "Dashboard sections:\n1) Overview - earnings and click stats\n2) Marketing Tools - links and banners\n3) Reports - detailed analytics\n4) Payments - commission history\n5) Support - direct contact options\n\nReal-time tracking updates every hour.",
          },
        ],
      },
      {
        category: "Payments & Billing",
        description:
          "Your guide to payment options and common billing questions.",
        topics: [
          {
            question: "Supported payment gateways",
            answer:
              "We accept:\n• PayPal\n• Stripe (credit/debit cards)\n• Cryptocurrency (Bitcoin, Ethereum, USDT)\n• Bank transfers\n• Digital wallets\n\nAll payments are processed securely with SSL encryption. Some payment methods may have processing fees.",
          },
          {
            question: "How to apply coupons at checkout",
            answer:
              "Apply coupons:\n1) Add items to cart\n2) Proceed to checkout\n3) Look for 'Coupon Code' or 'Promo Code' field\n4) Enter code exactly as provided\n5) Click 'Apply' to see discount\n6) Complete payment\n\nCodes are case-sensitive and have expiration dates.",
          },
          {
            question: "Billing FAQs",
            answer:
              "Common billing questions:\n• Subscriptions auto-renew unless cancelled\n• Invoices are emailed upon payment\n• Refunds processed within 5-7 business days\n• Failed payments pause service temporarily\n• Pro-rated billing available for upgrades\n\nContact billing support for specific account questions.",
          },
          {
            question: "Refund & cancellation policy",
            answer:
              "Refund policy:\n• 48-hour money-back guarantee for new customers experiencing technical issues\n• Cancellations can be done anytime via dashboard\n• Service continues until expiration\n• No refunds for partial months unless service is completely non-functional\n• Technical issues must be reported within 48 hours",
          },
        ],
      },
      {
        category: "Troubleshooting",
        description: "Having an issue? Let's fix it fast.",
        topics: [
          {
            question: "Common error messages and what they mean",
            answer:
              "Common errors:\n• 'Authorization Failed' (check credentials)\n• 'Connection Timeout' (internet/server issue)\n• 'Playlist Not Found' (verify M3U URL)\n• 'Maximum Connections Exceeded' (too many devices)\n• 'Service Expired' (renew subscription)\n\nMost issues resolve with credential verification or app restart.",
          },
          {
            question: "Buffering or freezing? Try these solutions",
            answer:
              "Buffering solutions:\n1) Check internet speed (minimum 10 Mbps)\n2) Restart router and device\n3) Try different server location\n4) Close other internet-heavy apps\n5) Use wired connection instead of WiFi\n6) Clear app cache\n7) Try different IPTV app\n8) Contact ISP about throttling",
          },
          {
            question: "How to re-activate your IPTV key",
            answer:
              "Re-activation steps:\n1) Login to dashboard\n2) Go to 'My Services'\n3) Find expired/inactive subscription\n4) Click 'Reactivate' or 'Renew'\n5) Complete payment if required\n6) Wait 5-10 minutes for activation\n\nIf issues persist, contact support with order details.",
          },
          {
            question: "Contacting support with logs/screenshots",
            answer:
              "For effective support:\n1) Take screenshots of error messages\n2) Note exact steps that caused the issue\n3) Include device model and app version\n4) Provide subscription details\n5) Submit via support ticket system or email\n\nResponse time: 2-24 hours depending on issue complexity.",
          },
        ],
      },
    ],
  };

  // State for translated content
  const [iptvHelpDocumentation, setIptvHelpDocumentation] = useState(
    ORIGINAL_TEXTS.iptvHelpDocumentation
  );

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      try {
        // Collect all translatable text
        const allTexts = [];
        ORIGINAL_TEXTS.iptvHelpDocumentation.forEach((category) => {
          allTexts.push(category.category, category.description);
          category.topics.forEach((topic) => {
            allTexts.push(topic.question, topic.answer);
          });
        });

        const translated = await translate(allTexts);
        if (!isMounted) return;

        let currentIndex = 0;
        const updatedDocumentation = ORIGINAL_TEXTS.iptvHelpDocumentation.map(
          (category) => {
            const tCategory = translated[currentIndex++];
            const tDescription = translated[currentIndex++];

            const tTopics = category.topics.map((topic) => {
              const tQuestion = translated[currentIndex++];
              const tAnswer = translated[currentIndex++];

              return {
                ...topic,
                question: tQuestion,
                answer: tAnswer,
              };
            });

            return {
              ...category,
              category: tCategory,
              description: tDescription,
              topics: tTopics,
            };
          }
        );

        setIptvHelpDocumentation(updatedDocumentation);
      } catch (error) {
        console.error("Translation error:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  const toggleItem = (categoryIndex, topicIndex) => {
    const itemKey = `${categoryIndex}-${topicIndex}`;
    setOpenItem(openItem === itemKey ? null : itemKey);
  };

  const toggleCategory = (categoryIndex) => {
    setOpenCategory(openCategory === categoryIndex ? null : categoryIndex);
  };

  const formatAnswer = (answer) => {
    return answer.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        {index < answer.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="font-secondary text-white p-4 md:p-8 lg:p-12 max-w-6xl mx-auto">
      {/* Knowledge Base Categories */}
      <div className="space-y-4 md:space-y-8">
        {iptvHelpDocumentation.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-2 md:space-y-4">
            {/* Category Header */}
            <div className="mb-3 md:mb-6">
              <h2 className="text-lg lg:text-3xl font-bold uppercase mb-1 md:mb-2 tracking-wide text-white">
                {category.category}
              </h2>
              <p className="text-gray-400 text-xs">{category.description}</p>
            </div>

            {/* Category Topics */}
            <div className="space-y-2 md:space-y-4">
              {category.topics.map((topic, topicIndex) => {
                const itemKey = `${categoryIndex}-${topicIndex}`;
                const isOpen = openItem === itemKey;

                return (
                  <div
                    key={topicIndex}
                    className={`overflow-hidden rounded-lg md:rounded-2xl transition-all duration-500 ease-in-out ${
                      isOpen
                        ? "border border-primary shadow-lg shadow-cyan-400/20"
                        : "border border-transparent"
                    }`}
                  >
                    {/* Question Header */}
                    <button
                      onClick={() => toggleItem(categoryIndex, topicIndex)}
                      className="w-full flex items-center justify-between p-3 md:p-6 text-white hover:bg-black/30 border border-[#ffffff00] hover:border-[#ffffff20] transition-all duration-300 ease-in-out rounded-lg md:rounded-2xl group"
                    >
                      <h3 className="text-sm md:text-base lg:text-xl font-semibold text-left pr-2 md:pr-4 transition-colors duration-300">
                        {topic.question}
                      </h3>
                      <div className="flex-shrink-0 transition-transform duration-300 ease-in-out group-hover:scale-110">
                        {isOpen ? (
                          <CircleMinus className="w-4 h-4 md:w-6 md:h-6 text-primary transition-all duration-300 ease-in-out transform" />
                        ) : (
                          <CirclePlus className="w-4 h-4 md:w-6 md:h-6 text-primary transition-all duration-300 ease-in-out transform" />
                        )}
                      </div>
                    </button>

                    {/* Answer Content with Smooth Height Transition */}
                    <div
                      className={`transition-all duration-500 ease-in-out overflow-hidden ${
                        isOpen
                          ? "max-h-[500px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="px-3 md:px-6 pb-3 md:pb-6">
                        <div className="border-t border-gray-800 pt-2 md:pt-4 transition-all duration-300 ease-in-out">
                          <p className="text-gray-300 font-secondary text-xs leading-relaxed transform transition-all duration-500 ease-in-out">
                            {formatAnswer(topic.answer)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add spacing between categories except for the last one */}
            {categoryIndex < iptvHelpDocumentation.length - 1 && (
              <div className="pt-4 md:pt-8">
                <hr className="border-gray-700" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
