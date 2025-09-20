"use client";

const ProductSchema = ({ product }) => {
  if (!product) return null;

  // Get the lowest price variant for the main product schema
  const lowestPriceVariant = product.variants.reduce((min, variant) =>
    variant.price < min.price ? variant : min
  );

  // Get the highest price variant
  const highestPriceVariant = product.variants.reduce((max, variant) =>
    variant.price > max.price ? variant : max
  );

  // Create offers array for all variants
  const offers = product.variants.map((variant) => ({
    "@type": "Offer",
    name: `${product.name} - ${variant.name}`,
    description: variant.description || product.description,
    price: variant.price,
    priceCurrency: variant.currency,
    availability: "https://schema.org/InStock",
    validFrom: new Date().toISOString().split("T")[0],
    url: `${process.env.NEXT_PUBLIC_APP_URL}/packages`,
    seller: {
      "@type": "Organization",
      name: "Cheap Stream",
      url: process.env.NEXT_PUBLIC_APP_URL,
    },
    priceSpecification: {
      "@type": "CompoundPriceSpecification",
      price: variant.price,
      priceCurrency: variant.currency,
      billingIncrement: 1,
    },
    itemOffered: {
      "@type": "Service",
      name: "IPTV Streaming Service",
      description: `${variant.name} IPTV package with ${variant.durationMonths} months subscription`,
      provider: {
        "@type": "Organization",
        name: "Cheap Stream",
        url: process.env.NEXT_PUBLIC_APP_URL,
      },
    },
  }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "IPTV Streaming Service",
    description:
      product.description ||
      "Premium IPTV streaming service with multiple package options",
    brand: {
      "@type": "Brand",
      name: "Cheap Stream",
    },
    category: "Streaming Service",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/packages`,
    image: `${process.env.NEXT_PUBLIC_APP_URL}/icons/live.png`,
    offers: {
      "@type": "AggregateOffer",
      lowPrice: lowestPriceVariant.price,
      highPrice: highestPriceVariant.price,
      priceCurrency: lowestPriceVariant.currency,
      offerCount: product.variants.length,
      offers: offers,
      availability: "https://schema.org/InStock",
      validFrom: new Date().toISOString().split("T")[0],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "1250",
      bestRating: "5",
      worstRating: "1",
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Service Type",
        value: "IPTV Streaming",
      },
      {
        "@type": "PropertyValue",
        name: "Available Packages",
        value: product.variants
          .map((v) => `${v.name} (${v.durationMonths} months)`)
          .join(", "),
      },
      {
        "@type": "PropertyValue",
        name: "Device Support",
        value: "Multiple devices supported",
      },
    ],
    provider: {
      "@type": "Organization",
      name: "Cheap Stream",
      url: process.env.NEXT_PUBLIC_APP_URL,
      logo: `${process.env.NEXT_PUBLIC_APP_URL}/logos/logo.png`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default ProductSchema;
