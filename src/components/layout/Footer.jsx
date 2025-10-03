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
  const ORIGINAL_OUR_PRODUCTS = "Our Products";

  const ORIGINAL_SECTIONS = [
    {
      title: "QUICK LINKS",
      items: [
        { label: "Home", href: "/" },
        { label: "Package Details", href: "/packages" },
        { label: "Features", href: "/explore" },
        { label: "Customer Reviews", href: "/reviews" },
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
  const [ourProducts, setOurProducts] = useState(ORIGINAL_OUR_PRODUCTS);
  const [sections, setSections] = useState(ORIGINAL_SECTIONS);

  // New state for dynamic social media and contact info
  const [socialMedia, setSocialMedia] = useState({
    x: "",
    linkedin: "",
    instagram: "",
    youtube: "",
  });
  const [contactInfo, setContactInfo] = useState({
    phoneNumber: "+123 456 7890",
    emailAddress: "help@cheapstream.com",
  });

  // State for ads
  const [ads, setAds] = useState([]);
  const [adsLoading, setAdsLoading] = useState(false);

  // Fetch ads for footer
  const fetchAds = async () => {
    try {
      setAdsLoading(true);
      const response = await fetch("/api/ads/public?limit=4");
      const data = await response.json();

      if (data.success) {
        setAds(data.data);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setAdsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch settings for social media and contact info
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = await response.json();
        if (data.success) {
          setSocialMedia(data.data.socialMedia || {});
          setContactInfo(data.data.contactInfo || {});
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };

    fetchSettings();
    fetchAds();
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const items = [
        ORIGINAL_DESCRIPTION,
        ORIGINAL_COPYRIGHT,
        ORIGINAL_ALL_RIGHTS,
        ORIGINAL_DEVELOPED_BY,
        ORIGINAL_OUR_PRODUCTS,
        ...ORIGINAL_SECTIONS.map((section) => section.title),
        ...ORIGINAL_SECTIONS.flatMap((section) =>
          section.items.map((item) => item.label)
        ),
      ];
      const translated = await translate(items);
      if (!isMounted) return;

      const [
        tDescription,
        tCopyright,
        tAllRights,
        tDevelopedBy,
        tOurProducts,
        ...rest
      ] = translated;

      const tSectionTitles = rest.slice(0, ORIGINAL_SECTIONS.length);
      const tItemLabels = rest.slice(ORIGINAL_SECTIONS.length);

      setDescription(tDescription);
      setCopyright(tCopyright);
      setAllRights(tAllRights);
      setDevelopedBy(tDevelopedBy);
      setOurProducts(tOurProducts);

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

  // Update sections with dynamic contact info
  useEffect(() => {
    setSections((prevSections) =>
      prevSections.map((section) => {
        if (section.title.includes("CONTACT")) {
          return {
            ...section,
            items: [
              { label: "Phone Number:", value: contactInfo.phoneNumber },
              { label: "Email Address:", value: contactInfo.emailAddress },
            ],
          };
        }
        return section;
      })
    );
  }, [contactInfo]);

  const socialLinks = [
    { icon: Twitter, href: socialMedia.x || "#", platform: "x" },
    { icon: Linkedin, href: socialMedia.linkedin || "#", platform: "linkedin" },
    {
      icon: Instagram,
      href: socialMedia.instagram || "#",
      platform: "instagram",
    },
    { icon: Youtube, href: socialMedia.youtube || "#", platform: "youtube" },
  ].filter((social) => social.href && social.href !== "#");

  const handleAdClick = (linkUrl) => {
    window.open(linkUrl, "_blank", "noopener,noreferrer");
  };

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
      <Polygon showGradient={false} fullWidth={true} className="h-[750px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Section - Logo, Description, Social Icons */}
          <div className="text-center mb-8 md:mb-10">
            {/* Logo */}
            <div className="flex items-center justify-center mt-12 sm:mt-16 md:mt-20 lg:mt-24 mb-4 sm:mb-6">
              <Image
                src="/logos/logo.png"
                alt="Cheap Stream"
                width={150}
                height={150}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-[100px] lg:h-[100px]"
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

          {/* Ads Section - Remove the separate ads section */}

          {/* Bottom Section - 5 Column Grid with Ads in Last Column */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 sm:gap-8 lg:gap-12">
            {sections.map((section, index) => (
              <div key={index} className="text-left">
                <h3 className="text-white font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 md:mb-6 tracking-wide">
                  {section.title}
                </h3>
                {renderSection(section)}
              </div>
            ))}

            {/* Ads Column */}
            <div className="text-left">
              <h3 className="text-white font-semibold text-sm sm:text-base md:text-lg mb-4 sm:mb-6 tracking-wide">
                {ourProducts}
              </h3>
              {adsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                </div>
              ) : ads.length > 0 ? (
                <div className="space-y-3">
                  {ads.map((ad, index) => (
                    <div
                      key={ad._id || index}
                      onClick={() => handleAdClick(ad.linkUrl)}
                      className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-lg p-3 hover:from-white/10 hover:to-white/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer group border border-white/10 hover:border-white/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 flex-shrink-0 relative overflow-hidden rounded-lg">
                          <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = "/icons/profile.png";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-sm font-semibold group-hover:text-cyan-400 font-secondary transition-colors line-clamp-1 mb-2">
                            {ad.title}
                          </h4>
                          <p className="text-gray-300 text-xs leading-relaxed line-clamp-2 group-hover:text-gray-200 transition-colors">
                            {ad.description}
                          </p>
                          <div className="mt-2 flex items-center text-cyan-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span>View Details</span>
                            <svg
                              className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gray-700/50 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm">No products available</p>
                </div>
              )}
            </div>
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
