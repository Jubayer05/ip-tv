"use client";

const OrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Cheap Stream TV",
    alternateName: "Cheap Stream",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://cheapstreamtv.com",
    logo: `${process.env.NEXT_PUBLIC_APP_URL || "https://cheapstreamtv.com"}/logos/logo.png`,
    description:
      "Affordable IPTV streaming service offering live TV, movies, and sports on any device. Watch thousands of channels without breaking the bank.",
    foundingDate: "2020",
    sameAs: [
      "https://twitter.com/cheapstreamtv",
      "https://facebook.com/cheapstreamtv",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        availableLanguage: ["English"],
        url: `${process.env.NEXT_PUBLIC_APP_URL || "https://cheapstreamtv.com"}/support/contact`,
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
    },
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 0,
        longitude: 0,
      },
      geoRadius: "50000",
    },
    serviceType: "IPTV Streaming Service",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Streaming Plans",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "IPTV Subscription",
            description: "Live TV, movies, and sports streaming service",
          },
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default OrganizationSchema;
