import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

// POST - Migrate existing products to include new fields
export async function POST() {
  try {
    await connectToDatabase();

    // Find all existing products
    const products = await Product.find({});

    if (products.length === 0) {
      return NextResponse.json({ message: "No products found to migrate" });
    }

    // Update each product to include the new fields
    const updatePromises = products.map((product) => {
      const updateData = {
        devicePricing: product.devicePricing || [
          { deviceCount: 1, multiplier: 1, description: "1 Device" },
          {
            deviceCount: 2,
            multiplier: 1.5,
            description: "2 Devices (50% more)",
          },
          {
            deviceCount: 3,
            multiplier: 2,
            description: "3 Devices (100% more)",
          },
        ],
        bulkDiscounts: product.bulkDiscounts || [
          {
            minQuantity: 3,
            discountPercentage: 5,
            description: "3+ Orders: 5% OFF",
          },
          {
            minQuantity: 5,
            discountPercentage: 10,
            description: "5+ Orders: 10% OFF",
          },
          {
            minQuantity: 10,
            discountPercentage: 15,
            description: "10+ Orders: 15% OFF",
          },
        ],
        adultChannelsFeePercentage: product.adultChannelsFeePercentage || 20,
      };

      return Product.findByIdAndUpdate(product._id, updateData, {
        new: true,
        runValidators: true,
      });
    });

    const updatedProducts = await Promise.all(updatePromises);

    return NextResponse.json({
      message: `Successfully migrated ${updatedProducts.length} products`,
      products: updatedProducts,
    });
  } catch (error) {
    console.error("Error migrating products:", error);
    return NextResponse.json(
      { error: "Failed to migrate products", details: error.message },
      { status: 500 }
    );
  }
}
