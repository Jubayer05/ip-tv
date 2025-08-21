"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

export default function PrivacyPolicySection() {
  const { language, translate, isLanguageLoaded } = useLanguage();

  // Original text constants
  const ORIGINAL_TEXTS = {
    sections: [
      {
        title: "1. INFORMATION WE COLLECT",
        intro: "We collect the following types of information:",
        subsections: [
          {
            title: "• Personal Information:",
            content:
              "When you register, place an order, or contact us, we may collect your name, email address, and payment information.",
          },
          {
            title: "• Usage Data:",
            content:
              "We automatically collect data about your device, IP address, browser type, access times, and usage behavior to improve our services.",
          },
          {
            title: "• Order & Subscription Info:",
            content:
              "We keep records of your purchases, subscription plans, payment history, and license key usage.",
          },
        ],
      },
      {
        title: "2. HOW WE USE YOUR INFORMATION",
        intro: "We use your information to:",
        bulletPoints: [
          "Process and deliver your IPTV subscription.",
          "Send account- or order-related emails.",
          "Provide customer support and technical assistance.",
          "Improve our service and user experience.",
          "Prevent fraud and ensure platform security.",
          "Send promotional offers (only if you opt-in).",
        ],
      },
      {
        title: "3. DATA PROTECTION & SECURITY",
        content:
          "We take security seriously. Your personal data is stored securely and transmitted via SSL encryption. We implement industry-standard safeguards to protect your information from unauthorized access, alteration, or disclosure.",
        emphasis: "We do NOT store credit card details on our servers.",
      },
      {
        title: "4. SHARING WITH THIRD PARTIES",
        intro:
          "We do not sell or trade your personal data. However, we may share data with trusted third parties:",
        bulletPoints: [
          "Payment processors (e.g., PayPal, Stripe, crypto gateways)",
          "Email communication platforms (for confirmations and updates)",
          "Anti-fraud and analytics tools",
        ],
        footer:
          "All third parties are contractually bound to respect your privacy.",
      },
      {
        title: "5. COOKIES & TRACKING",
        intro: "We use cookies and similar technologies to:",
        bulletPoints: [
          "Maintain session states and preferences",
          "Track user activity for analytics",
          "Improve site speed and experience",
        ],
        footer: "You can control cookie preferences in your browser settings.",
      },
      {
        title: "6. YOUR RIGHTS",
        intro:
          "Depending on your location (e.g. EU/UK under GDPR), you may have the right to:",
        bulletPoints: [
          "Access your personal data",
          "Correct or update information",
          "Request deletion of your account and data",
          "Withdraw consent for marketing communications",
          "File a complaint with a supervisory authority",
        ],
        footer:
          "To exercise your rights, please email us at: help@cheapstream.com",
      },
      {
        title: "7. CHILDREN'S PRIVACY",
        content:
          "Our services are not intended for individuals under 18. We do not knowingly collect personal information from minors.",
      },
      {
        title: "8. INTERNATIONAL USERS",
        content:
          "By using our service outside your home country, you agree to the transfer of your information to our servers, which may be located in other jurisdictions.",
      },
      {
        title: "9. CHANGES TO THIS POLICY",
        content:
          "We may update this policy from time to time. Any significant changes will be posted on this page, and you will be notified via email or site notification.",
      },
      {
        title: "10. CONTACT US",
        intro:
          "If you have any questions or concerns about this policy, contact our Privacy Officer:",
        contactInfo: [
          "Email: help@cheapstream.com",
          "Support Page: Click Here",
        ],
      },
    ],
  };

  // State for translated content
  const [texts, setTexts] = useState(ORIGINAL_TEXTS);

  useEffect(() => {
    // Only translate when language is loaded and not English
    if (!isLanguageLoaded || language.code === "en") return;

    let isMounted = true;
    (async () => {
      try {
        // Collect all translatable text
        const allTexts = [];
        ORIGINAL_TEXTS.sections.forEach((section) => {
          allTexts.push(section.title);
          if (section.intro) allTexts.push(section.intro);
          if (section.content) allTexts.push(section.content);
          if (section.emphasis) allTexts.push(section.emphasis);
          if (section.footer) allTexts.push(section.footer);
          if (section.subsections) {
            section.subsections.forEach((subsection) => {
              allTexts.push(subsection.title, subsection.content);
            });
          }
          if (section.bulletPoints) {
            section.bulletPoints.forEach((point) => {
              allTexts.push(point);
            });
          }
          if (section.contactInfo) {
            section.contactInfo.forEach((info) => {
              allTexts.push(info);
            });
          }
        });

        const translated = await translate(allTexts);
        if (!isMounted) return;

        let currentIndex = 0;
        const updatedSections = ORIGINAL_TEXTS.sections.map((section) => {
          const tTitle = translated[currentIndex++];
          let tIntro, tContent, tEmphasis, tFooter;

          if (section.intro) tIntro = translated[currentIndex++];
          if (section.content) tContent = translated[currentIndex++];
          if (section.emphasis) tEmphasis = translated[currentIndex++];
          if (section.footer) tFooter = translated[currentIndex++];

          let tSubsections, tBulletPoints, tContactInfo;

          if (section.subsections) {
            tSubsections = section.subsections.map((subsection) => {
              const tSubTitle = translated[currentIndex++];
              const tSubContent = translated[currentIndex++];
              return {
                ...subsection,
                title: tSubTitle,
                content: tSubContent,
              };
            });
          }

          if (section.bulletPoints) {
            tBulletPoints = [];
            for (let i = 0; i < section.bulletPoints.length; i++) {
              tBulletPoints.push(translated[currentIndex++]);
            }
          }

          if (section.contactInfo) {
            tContactInfo = [];
            for (let i = 0; i < section.contactInfo.length; i++) {
              tContactInfo.push(translated[currentIndex++]);
            }
          }

          return {
            ...section,
            title: tTitle,
            intro: tIntro,
            content: tContent,
            emphasis: tEmphasis,
            footer: tFooter,
            subsections: tSubsections,
            bulletPoints: tBulletPoints,
            contactInfo: tContactInfo,
          };
        });

        setTexts({
          sections: updatedSections,
        });
      } catch (error) {
        console.error("Translation error:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code, isLanguageLoaded, translate]);

  return (
    <div className="font-secondary text-white p-4 md:p-8 lg:p-12 max-w-6xl mx-auto">
      {texts.sections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          {/* Section Header */}
          <section className="mb-4 md:mb-12">
            <h2 className="text-lg lg:text-3xl font-bold uppercase mb-2 md:mb-6 tracking-wide">
              {section.title}
            </h2>

            {section.intro && (
              <p className="text-gray-300 mb-3 md:mb-6 leading-relaxed text-xs">
                {section.intro}
              </p>
            )}

            {section.subsections && (
              <div className="space-y-3 md:space-y-6">
                {section.subsections.map((subsection, subIndex) => (
                  <div key={subIndex}>
                    <h3 className="font-secondary text-white font-semibold mb-1 md:mb-2 text-base">
                      {subsection.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed ml-2 md:ml-4 text-xs">
                      {subsection.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {section.bulletPoints && (
              <div className="space-y-2 md:space-y-3">
                {section.bulletPoints.map((point, pointIndex) => (
                  <p
                    key={pointIndex}
                    className="text-gray-300 leading-relaxed text-xs"
                  >
                    • {point}
                  </p>
                ))}
              </div>
            )}

            {section.content && (
              <p className="text-gray-300 leading-relaxed mb-3 md:mb-6 text-xs">
                {section.content}
              </p>
            )}

            {section.emphasis && (
              <p className="text-gray-300 leading-relaxed font-medium text-xs">
                We do <span className="font-bold uppercase">NOT</span> store
                credit card details on our servers.
              </p>
            )}

            {section.footer && (
              <p className="text-gray-300 leading-relaxed mt-3 md:mt-6 text-xs">
                {section.footer}
              </p>
            )}

            {section.contactInfo && (
              <div className="space-y-1 md:space-y-2">
                {section.contactInfo.map((info, infoIndex) => (
                  <p
                    key={infoIndex}
                    className="text-gray-300 leading-relaxed text-xs"
                  >
                    {info.includes("Email:") ? (
                      <>
                        Email:{" "}
                        <span className="font-semibold text-white">
                          help@cheapstream.com
                        </span>
                      </>
                    ) : info.includes("Support Page:") ? (
                      <>
                        Support Page:{" "}
                        <span className="font-semibold text-primary cursor-pointer hover:underline">
                          Click Here
                        </span>
                      </>
                    ) : (
                      info
                    )}
                  </p>
                ))}
              </div>
            )}
          </section>

          {/* Divider */}
          {sectionIndex < texts.sections.length - 1 && (
            <hr className="border-gray-700 mb-4 md:mb-12" />
          )}
        </div>
      ))}
    </div>
  );
}
