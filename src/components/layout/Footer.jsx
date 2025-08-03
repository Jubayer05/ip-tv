import { Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import Image from "next/image";
import Polygon from "../ui/polygon";

export default function Footer() {
  const footerSections = [
    {
      title: "QUICK LINKS",
      type: "links",
      items: [
        { label: "Home", href: "#" },
        { label: "Pricing", href: "#" },
        { label: "Package Details", href: "#" },
        { label: "Features", href: "#" },
      ],
    },
    {
      title: "COMPANY",
      type: "links",
      items: [
        { label: "About Us", href: "/about-us" },
        { label: "FAQ", href: "/support/faq" },
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms of Use", href: "/terms-of-use" },
      ],
    },
    {
      title: "HELP CENTER",
      type: "links",
      items: [
        { label: "Blogs", href: "/blogs" },
        { label: "Knowledge Base", href: "/knowledge-base" },
        { label: "Support", href: "/support/contact" },
      ],
    },
    {
      title: "CONTACT US",
      type: "contact",
      items: [
        { label: "Phone Number:", value: "+123 456 7890" },
        { label: "Email Address:", value: "help@cheapstream.com" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Twitter, href: "#" },
    { icon: Linkedin, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Youtube, href: "#" },
  ];

  const renderSection = (section) => {
    if (section.type === "links") {
      return (
        <ul className="space-y-4">
          {section.items.map((item, index) => (
            <li key={index}>
              <a
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors font-secondary text-sm"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      );
    }

    if (section.type === "contact") {
      return (
        <div className="space-y-4">
          {section.items.map((item, index) => (
            <div key={index}>
              <p className="text-gray-300 mb-1">{item.label}</p>
              <p className="text-white">{item.value}</p>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <footer className="text-white">
      <Polygon showGradient={false} fullWidth={true} className="h-[700px]">
        <div className="max-w-5xl mx-auto">
          {/* Top Section - Logo, Description, Social Icons */}
          <div className="text-center mb-16">
            {/* Logo */}
            <div className="flex items-center justify-center mt-24 mb-6">
              <Image
                src="/logos/logo.png"
                alt="Cheap Stream"
                width={150}
                height={150}
              />
            </div>

            {/* Description */}
            <p className="text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Cheap Stream is a budget-friendly IPTV service that delivers
              unlimited access to movies, live TV, and entertainment in HD and
              4K—without contracts or hidden fees.
            </p>

            {/* Social Icons */}
            <div className="flex justify-center space-x-6">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <IconComponent className="w-6 h-6" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Bottom Section - 4 Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {footerSections.map((section, index) => (
              <div key={index} className="text-center sm:text-left">
                <h3 className="text-white font-semibold text-lg mb-6 tracking-wide">
                  {section.title}
                </h3>
                {renderSection(section)}
              </div>
            ))}
          </div>

          {/* Copyright Section */}
        </div>
      </Polygon>
      <div className="-mt-22 -translate-y-0 z-[500] pt-8 text-center">
        <p className="text-gray-400 text-sm font-secondary">
          Copyright © Cheap Stream {new Date().getFullYear()} . All rights
          reserved
        </p>
        <p className="text-gray-400 text-sm font-secondary mt-0">
          Developed by{" "}
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
