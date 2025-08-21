"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

export default function TermsOfUseSection() {
  const { language, translate, isLanguageLoaded } = useLanguage();

  // Original text constants
  const ORIGINAL_TEXTS = {
    sections: [
      {
        title: "1. ACCEPTANCE OF TERMS",
        content:
          "By using this website or purchasing any IPTV service or subscription, you agree to these Terms of Use, our Privacy Policy, and any additional terms and conditions that may apply to specific features or services.",
      },
      {
        title: "2. SERVICE DESCRIPTION",
        intro:
          "We provide IPTV access through subscription-based digital content. Channel availability, resolution, and streaming quality may vary depending on the package, device, or geographic region.",
        footer:
          "We reserve the right to modify, suspend, or discontinue the service at any time without prior notice.",
      },
      {
        title: "3. USER ACCOUNTS",
        bulletPoints: [
          "You must be at least 18 years old or the age of majority in your country to create an account.",
          "You are responsible for maintaining the confidentiality of your login credentials.",
          "Sharing or reselling your account credentials is strictly prohibited.",
          "All orders and subscription activity are tied to your email or account profile.",
        ],
      },
      {
        title: "4. AFFILIATE & RESELLER CONDUCT",
        content:
          "Affiliates and resellers must follow platform rules and only promote our services through approved channels. Misuse, fraud, or spamming will result in removal from the program and forfeiture of any earnings or commissions.",
      },
      {
        title: "5. REFUND POLICY",
        content:
          "Due to the nature of digital IPTV services, all purchases are final. No refunds will be issued after a key has been generated or a service has been delivered unless otherwise stated in writing.",
      },
      {
        title: "6. ACCEPTABLE USE",
        intro:
          "You agree not to use our services for any unlawful, harmful, or unauthorized purposes. This includes, but is not limited to:",
        bulletPoints: [
          "Bypassing geo-restrictions or DRM protections",
          "Distributing copyrighted content without authorization",
          "Attempting to reverse-engineer or hack our platform",
          "Using the service for any fraudulent activity",
        ],
      },
      {
        title: "7. INTELLECTUAL PROPERTY",
        content:
          "All content, branding, design elements, and proprietary tools are the intellectual property of the platform or its licensors. Unauthorized copying, redistribution, or use of our materials is strictly prohibited.",
      },
      {
        title: "8. LIMITATION OF LIABILITY",
        content:
          "We are not liable for any direct, indirect, incidental, or consequential damages arising from the use of our platform or services. This includes disruptions caused by internet outages, device incompatibility, or third-party interference.",
      },
      {
        title: "9. MODIFICATIONS TO THE TERMS",
        content:
          "We reserve the right to update or change these Terms of Use at any time. Changes will be posted on this page and become effective immediately upon publication.",
      },
      {
        title: "10. CONTACT US",
        intro:
          "If you have any questions about these Terms, please contact us at:",
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
          if (section.content) allTexts.push(section.content);
          if (section.intro) allTexts.push(section.intro);
          if (section.footer) allTexts.push(section.footer);
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
          let tContent, tIntro, tFooter;

          if (section.content) tContent = translated[currentIndex++];
          if (section.intro) tIntro = translated[currentIndex++];
          if (section.footer) tFooter = translated[currentIndex++];

          let tBulletPoints, tContactInfo;

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
            content: tContent,
            intro: tIntro,
            footer: tFooter,
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
    <div className="font-secondary text-white p-8 lg:p-12 max-w-6xl mx-auto">
      {texts.sections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          {/* Section Header */}
          <section className="mb-4 md:mb-12">
            <h2 className="text-lg lg:text-3xl font-bold uppercase mb-2 md:mb-6 tracking-wide">
              {section.title}
            </h2>

            {section.intro && (
              <p className="text-gray-300 mb-6 leading-relaxed text-xs">
                {section.intro}
              </p>
            )}

            {section.bulletPoints && (
              <div className="space-y-3">
                {section.bulletPoints.map((point, pointIndex) => (
                  <p
                    key={pointIndex}
                    className="text-gray-300 leading-relaxed text-xs md:text-base"
                  >
                    • {point}
                  </p>
                ))}
              </div>
            )}

            {section.content && (
              <p className="text-gray-300 leading-relaxed text-xs md:text-base">
                {section.content}
              </p>
            )}

            {section.footer && (
              <p className="text-gray-300 leading-relaxed text-xs md:text-base">
                {section.footer}
              </p>
            )}

            {section.contactInfo && (
              <div className="space-y-2">
                {section.contactInfo.map((info, infoIndex) => (
                  <p
                    key={infoIndex}
                    className="text-gray-300 leading-relaxed text-xs md:text-base"
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
