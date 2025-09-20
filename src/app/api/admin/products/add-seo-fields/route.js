import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await connectToDatabase();

    const products = await Product.find({});
    let updatedCount = 0;

    for (const product of products) {
      const updates = {};

      // Add SEO fields if they don't exist
      if (!product.seoTitle) {
        updates.seoTitle =
          "Buy IPTV Service - Premium Streaming Packages | Cheap Stream";
      }

      if (!product.seoDescription) {
        const minPrice = Math.min(...product.variants.map((v) => v.price));
        const maxPrice = Math.max(...product.variants.map((v) => v.price));
        updates.seoDescription = `Get premium IPTV service with ${product.variants.length} flexible plans. HD streaming, multiple devices, premium channels. Starting from $${minPrice} to $${maxPrice}. Order now!`;
      }

      if (!product.seoKeywords) {
        updates.seoKeywords =
          "buy IPTV, IPTV service, premium streaming, HD channels, IPTV packages, streaming service, Cheap Stream, IPTV subscription";
      }

      if (Object.keys(updates).length > 0) {
        await Product.findByIdAndUpdate(product._id, updates);
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully added SEO fields to ${updatedCount} products`,
      updatedCount,
    });
  } catch (error) {
    console.error("Error adding SEO fields:", error);
    return NextResponse.json(
      { error: "Failed to add SEO fields" },
      { status: 500 }
    );
  }
}
