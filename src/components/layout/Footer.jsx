"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Polygon from "../ui/polygon";

export default function Footer() {
  const { language, translate } = useLanguage();

  const ORIGINAL_DESCRIPTION =
    "Cheap Stream is a budget-friendly IPTV service that delivers unlimited access to movies, live TV, and entertainment in HD and 4K—without contracts or hidden fees.";
  const ORIGINAL_COPYRIGHT = "Copyright © Cheap Stream";
  const ORIGINAL_ALL_RIGHTS = "All rights reserved";
  const ORIGINAL_DEVELOPED_BY = "Developed by";

  const ORIGINAL_SECTIONS = [
    {
      title: "QUICK LINKS",
      items: [
        { label: "Home", href: "/" },
        { label: "Package Details", href: "/packages" },
        { label: "Features", href: "/explore" },
      ],
    },
    {
      title: "COMPANY",
      items: [
        { label: "About Us", href: "/about-us" },
        { label: "FAQ", href: "/support/faq" },
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms of Use", href: "/terms-of-use" },
      ],
    },
    {
      title: "HELP CENTER",
      items: [
        { label: "Blogs", href: "/blogs" },
        { label: "Knowledge Base", href: "/knowledge-base" },
        { label: "Support", href: "/support/contact" },
      ],
    },
    {
      title: "CONTACT US",
      items: [
        { label: "Phone Number:", value: "+123 456 7890" },
        { label: "Email Address:", value: "help@cheapstream.com" },
      ],
    },
  ];

  const [description, setDescription] = useState(ORIGINAL_DESCRIPTION);
  const [copyright, setCopyright] = useState(ORIGINAL_COPYRIGHT);
  const [allRights, setAllRights] = useState(ORIGINAL_ALL_RIGHTS);
  const [developedBy, setDevelopedBy] = useState(ORIGINAL_DEVELOPED_BY);
  const [sections, setSections] = useState(ORIGINAL_SECTIONS);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const items = [
        ORIGINAL_DESCRIPTION,
        ORIGINAL_COPYRIGHT,
        ORIGINAL_ALL_RIGHTS,
        ORIGINAL_DEVELOPED_BY,
        ...ORIGINAL_SECTIONS.map((section) => section.title),
        ...ORIGINAL_SECTIONS.flatMap((section) =>
          section.items.map((item) => item.label)
        ),
      ];
      const translated = await translate(items);
      if (!isMounted) return;

      const [tDescription, tCopyright, tAllRights, tDevelopedBy, ...rest] =
        translated;

      const tSectionTitles = rest.slice(0, ORIGINAL_SECTIONS.length);
      const tItemLabels = rest.slice(ORIGINAL_SECTIONS.length);

      setDescription(tDescription);
      setCopyright(tCopyright);
      setAllRights(tAllRights);
      setDevelopedBy(tDevelopedBy);

      // Update sections with translated titles and labels
      let itemIndex = 0;
      const updatedSections = ORIGINAL_SECTIONS.map(
        (section, sectionIndex) => ({
          ...section,
          title: tSectionTitles[sectionIndex],
          items: section.items.map((item) => ({
            ...item,
            label: tItemLabels[itemIndex++],
          })),
        })
      );
      setSections(updatedSections);
    })();

    return () => {
      isMounted = false;
    };
  }, [language.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const socialLinks = [
    { icon: Twitter, href: "#" },
    { icon: Linkedin, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Youtube, href: "#" },
  ];

  const renderSection = (section) => {
    if (section.title.includes("CONTACT")) {
      return (
        <div className="space-y-0 md:space-y-3 -mt-2 md:mt-0 font-secondary">
          {section.items.map((item, index) => (
            <div key={index} className="mt-2">
              <p className="text-white mb-1 text-xs sm:text-sm md:text-base leading-6">
                {item.label}
              </p>
              <p className="text-white text-xs sm:text-sm md:text-base">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <ul className="space-y-0 md:space-y-3 -mt-2 md:mt-0">
        {section.items.map((item, index) => (
          <li key={index}>
            <a
              href={item.href}
              className="text-white hover:text-white transition-colors font-secondary text-xs sm:text-sm md:text-base"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <footer className="text-white -mt-6 md:mt-0">
      <Polygon showGradient={false} fullWidth={true} className="h-[700px]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Section - Logo, Description, Social Icons */}
          <div className="text-center mb-8 md:mb-10">
            {/* Logo */}
            <div className="flex items-center justify-center mt-12 sm:mt-16 md:mt-20 lg:mt-24 mb-4 sm:mb-6">
              <Image
                src="/logos/logo.png"
                alt="Cheap Stream"
                width={150}
                height={150}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-[150px] lg:h-[150px]"
              />
            </div>

            {/* Description */}
            <p className="text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed text-xs sm:text-sm md:text-base px-4 sm:px-0">
              {description}
            </p>

            {/* Social Icons */}
            <div className="flex justify-center space-x-4 sm:space-x-6">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="text-primary transition-colors"
                  >
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Bottom Section - Responsive Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 sm:gap-8 lg:gap-12">
            {sections.map((section, index) => (
              <div key={index} className="text-left">
                <h3 className="text-white font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 md:mb-6 tracking-wide">
                  {section.title}
                </h3>
                {renderSection(section)}
              </div>
            ))}
          </div>

          {/* Copyright Section */}
        </div>
      </Polygon>
      <div className="-mt-16 sm:-mt-20 md:-mt-22 -translate-y-0 z-[500] pt-4 sm:pt-6 md:pt-8 text-center px-4 sm:px-6 lg:px-8">
        <p className="text-gray-400 text-[10px] sm:text-sm font-secondary">
          {copyright} {new Date().getFullYear()} . {allRights}
        </p>
        <p className="text-gray-400 text-[10px] sm:text-sm font-secondary mt-1 sm:mt-0">
          {developedBy}{" "}
          <a
            href="https://weberspoint.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Weberspoint
          </a>
        </p>
      </div>
    </footer>
  );
}
