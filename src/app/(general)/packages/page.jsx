import ProductSchema from "@/components/common/ProductSchema";
import FAQ from "@/components/features/Home/FaqHome";
import PricingBanner from "@/components/features/Pricing/PricingBanner";
import PricingPlan from "@/components/features/Pricing/PricingPlan";
import ReviewInput from "@/components/features/UserReview/ReviewInput";
import ReviewShowHome from "@/components/features/UserReview/ReviewShowHome";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";

export async function generateMetadata() {
  try {
    // First try to get custom meta from settings
    const settingsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/settings`,
      {
        cache: "no-store",
      }
    );

    // Check if response is ok and content-type is JSON
    if (
      settingsResponse.ok &&
      settingsResponse.headers.get("content-type")?.includes("application/json")
    ) {
      const settingsData = await settingsResponse.json();

      if (settingsData.success && settingsData.data.metaManagement?.packages) {
        const meta = settingsData.data.metaManagement.packages;
        return {
          title: meta.title,
          description: meta.description,
          keywords: meta.keywords,
          openGraph: {
            title: meta.openGraph.title,
            description: meta.openGraph.description,
            url: `${process.env.NEXT_PUBLIC_APP_URL}/packages`,
            type: "website",
            images: [
              {
                url: "/icons/live.png",
                width: 1200,
                height: 630,
                alt: meta.openGraph.title,
              },
            ],
          },
          twitter: {
            card: "summary_large_image",
            title: meta.openGraph.title,
            description: meta.openGraph.description,
            images: ["/icons/live.png"],
          },
          alternates: {
            canonical: `${process.env.NEXT_PUBLIC_APP_URL}/packages`,
          },
        };
      }
    } else {
      console.warn(
        "Settings API returned non-JSON response, falling back to default metadata"
      );
    }

    // If no custom meta, generate from product data
    await connectToDatabase();
    const products = await Product.find({}).lean();

    if (products && products.length > 0) {
      const product = products[0];
      const minPrice = Math.min(...product.variants.map((v) => v.price));
      const maxPrice = Math.max(...product.variants.map((v) => v.price));

      const title = `Buy IPTV Service - Premium Streaming Packages | Cheap Stream`;
      const description = `Get premium IPTV service with ${product.variants.length} flexible plans. HD streaming, multiple devices, premium channels. Starting from $${minPrice} to $${maxPrice}. Order now!`;
      const keywords = `buy IPTV, IPTV service, premium streaming, HD channels, IPTV packages, streaming service, Cheap Stream, IPTV subscription`;

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
    title: "Buy IPTV Service - Premium Streaming Packages | Cheap Stream",
    description:
      "Get premium IPTV service with flexible plans, HD streaming, multiple devices, and premium channels. Affordable pricing starting from $5. Order now!",
    keywords:
      "buy IPTV, IPTV service, premium streaming, HD channels, IPTV packages, streaming service, Cheap Stream, IPTV subscription",
    openGraph: {
      title: "Buy IPTV Service - Premium Streaming Packages | Cheap Stream",
      description:
        "Get premium IPTV service with flexible plans, HD streaming, multiple devices, and premium channels. Affordable pricing starting from $5. Order now!",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/packages`,
      type: "website",
      images: [
        {
          url: "/icons/live.png",
          width: 1200,
          height: 630,
          alt: "Cheap Stream IPTV Packages",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Buy IPTV Service - Premium Streaming Packages | Cheap Stream",
      description:
        "Get premium IPTV service with flexible plans, HD streaming, multiple devices, and premium channels. Affordable pricing starting from $5. Order now!",
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

  return (
    <div className="-mt-8 md:-mt-14">
      <div className="mt-14 md:mt-0 md:py-16">
        <PricingBanner />
        <PricingPlan />
        <ReviewShowHome />
        <ReviewInput />
        <FAQ />
      </div>
      {/* Add JSON-LD Schema for product-level SEO */}
      {serializedProduct && <ProductSchema product={serializedProduct} />}
    </div>
  );
}
