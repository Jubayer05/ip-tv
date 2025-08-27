import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

// GET - Fetch all products
export async function GET() {
  try {
    await connectToDatabase();
    const products = await Product.find({}).sort({ createdAt: -1 });

    // Ensure all products have the new fields with default values
    const productsWithDefaults = products.map((product) => ({
      ...product.toObject(),
      devicePricing: product.devicePricing || [
        { deviceCount: 1, multiplier: 1, description: "1 Device" },
        {
          deviceCount: 2,
          multiplier: 1.5,
          description: "2 Devices (50% more)",
        },
        { deviceCount: 3, multiplier: 2, description: "3 Devices (100% more)" },
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
    }));

    return NextResponse.json(productsWithDefaults);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    // Ensure required fields exist
    const productData = {
      name: body.name,
      description: body.description,
      variants: body.variants || [],
      devicePricing: body.devicePricing || [
        { deviceCount: 1, multiplier: 1, description: "1 Device" },
        {
          deviceCount: 2,
          multiplier: 1.5,
          description: "2 Devices (50% more)",
        },
        { deviceCount: 3, multiplier: 2, description: "3 Devices (100% more)" },
      ],
      bulkDiscounts: body.bulkDiscounts || [
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
      adultChannelsFeePercentage: body.adultChannelsFeePercentage || 20,
      allowAnyQuantity: body.allowAnyQuantity !== false,
    };

    const product = new Product(productData);
    await product.save();

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product", details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update existing product (single product)
export async function PUT(request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    // Update the one-and-only product
    const updatedProduct = await Product.findOneAndUpdate(
      {}, // match the first/only product
      {
        $set: {
          name: body.name,
          description: body.description,
          variants: body.variants || [],
          devicePricing: body.devicePricing || [],
          bulkDiscounts: body.bulkDiscounts || [],
          adultChannelsFeePercentage: body.adultChannelsFeePercentage ?? 20,
          allowAnyQuantity: body.allowAnyQuantity ?? true,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { error: "No product found to update" },
        { status: 404 }
      );
    }

    console.log(updatedProduct);

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update product", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
