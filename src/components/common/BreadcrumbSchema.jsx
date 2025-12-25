"use client";

import { usePathname } from "next/navigation";

const BreadcrumbSchema = ({ customItems }) => {
  const pathname = usePathname();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cheapstreamtv.com";

  // If custom items are provided, use them
  if (customItems && customItems.length > 0) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: customItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url ? `${baseUrl}${item.url}` : undefined,
      })),
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    );
  }

  // Auto-generate breadcrumbs from pathname
  const pathSegments = pathname.split("/").filter(Boolean);

  const breadcrumbMap = {
    "about-us": "About Us",
    packages: "Plans & Pricing",
    affiliate: "Affiliate Program",
    reviews: "Customer Reviews",
    blogs: "Blog",
    explore: "Explore Channels",
    support: "Support",
    faq: "FAQ",
    contact: "Contact Us",
    "privacy-policy": "Privacy Policy",
    "terms-of-use": "Terms of Use",
    "knowledge-base": "Knowledge Base",
    login: "Sign In",
    register: "Sign Up",
  };

  const items = [
    { name: "Home", url: "/" },
    ...pathSegments.map((segment, index) => {
      const url = "/" + pathSegments.slice(0, index + 1).join("/");
      const name = breadcrumbMap[segment] || segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return { name, url: index === pathSegments.length - 1 ? undefined : url };
    }),
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url ? `${baseUrl}${item.url}` : undefined,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default BreadcrumbSchema;
