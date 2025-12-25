import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import Settings from "@/models/Settings";
import PricingClient from "./PricingClient";

export async function generateMetadata() {
  try {
    // Direct DB access instead of HTTP fetch (avoids Docker networking issues)
    await connectToDatabase();
    const settings = await Settings.getSettings();

    if (settings?.metaManagement?.packages) {
      const meta = settings.metaManagement.packages;
      return {
        title: meta.title,
        description: meta.description,
        keywords: meta.keywords,
        openGraph: {
          title: meta.openGraph?.title || meta.title,
          description: meta.openGraph?.description || meta.description,
          url: `${process.env.NEXT_PUBLIC_APP_URL}/packages`,
          type: "website",
          images: [
            {
              url: "/icons/live.png",
              width: 1200,
              height: 630,
              alt: meta.openGraph?.title || meta.title,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: meta.openGraph?.title || meta.title,
          description: meta.openGraph?.description || meta.description,
          images: ["/icons/live.png"],
        },
        alternates: {
          canonical: `${process.env.NEXT_PUBLIC_APP_URL}/packages`,
        },
      };
    }

    // If no custom meta, generate from product data
    const products = await Product.find({}).lean();

    if (products && products.length > 0) {
      const product = products[0];
      const minPrice = Math.min(...product.variants.map((v) => v.price));
      const maxPrice = Math.max(...product.variants.map((v) => v.price));

      const title = `IPTV Plans & Pricing - Pick What Works for You | Cheap Stream`;
      const description = `Choose from ${product.variants.length} different plans, starting at just $${minPrice}. All plans include HD channels, work on multiple devices, and come with our 24/7 support.`;
      const keywords = `IPTV plans, streaming prices, TV subscription, channel packages, best IPTV deal`;

      return {
        title,
        description,
        keywords,
        openGraph: {
          title,
          description,
          url: `${process.env.NEXT_PUBLIC_APP_URL}/packages`,
          type: "website",
          images: [
            {
              url: "/icons/live.png",
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images: ["/icons/live.png"],
        },
        alternates: {
          canonical: `${process.env.NEXT_PUBLIC_APP_URL}/packages`,
        },
      };
    }
  } catch (error) {
    console.error("Failed to fetch meta settings:", error);
  }

  // Fallback metadata with enhanced Open Graph
  return {
    title: "IPTV Plans & Pricing - Pick What Works for You | Cheap Stream",
    description:
      "Simple pricing, no surprises. Choose a plan that fits your budget and start watching in minutes. All plans include HD quality and work on any device.",
    keywords:
      "IPTV plans, streaming prices, TV subscription, channel packages, best IPTV deal, cord cutting",
    openGraph: {
      title: "IPTV Plans & Pricing - Pick What Works for You | Cheap Stream",
      description:
        "Simple pricing, no surprises. Choose a plan that fits your budget and start watching in minutes. All plans include HD quality and work on any device.",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/packages`,
      type: "website",
      images: [
        {
          url: "/icons/live.png",
          width: 1200,
          height: 630,
          alt: "Cheap Stream TV Plans and Pricing",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "IPTV Plans & Pricing - Pick What Works for You | Cheap Stream",
      description:
        "Simple pricing, no surprises. Choose a plan that fits your budget and start watching in minutes. All plans include HD quality and work on any device.",
      images: ["/icons/live.png"],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/packages`,
    },
  };
}

export default async function Pricing() {
  // Fetch product data for schema markup
  let product = null;
  try {
    await connectToDatabase();
    const products = await Product.find({}).lean();
    if (products && products.length > 0) {
      product = products[0]; // Get the first (and only) product
    }
  } catch (error) {
    console.error("Error fetching product for schema:", error);
  }

  // Serialize the product data to make it safe for Client Components
  const serializedProduct = product
    ? {
        _id: product._id.toString(),
        name: product.name,
        description: product.description,
        variants: product.variants?.map((variant) => ({
          ...variant,
          _id: variant._id?.toString(),
          // Handle any other nested ObjectIds in variants
          features: variant.features?.map((feature) => ({
            ...feature,
            _id: feature._id?.toString(),
          })),
        })),
        allowAnyQuantity: product.allowAnyQuantity,
        createdAt: product.createdAt?.toISOString(),
        updatedAt: product.updatedAt?.toISOString(),
        adultChannelsFeePercentage: product.adultChannelsFeePercentage,
        bulkDiscounts: product.bulkDiscounts?.map((discount) => ({
          ...discount,
          _id: discount._id?.toString(),
        })),
        devicePricing: product.devicePricing?.map((pricing) => ({
          ...pricing,
          _id: pricing._id?.toString(),
        })),
      }
    : null;

  return <PricingClient serializedProduct={serializedProduct} />;
}
