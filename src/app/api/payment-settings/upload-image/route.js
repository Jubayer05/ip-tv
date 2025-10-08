import { mkdir, unlink, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Create payment-images directory if it doesn't exist
    const uploadDir = process.env.UPLOAD_DIR || "./public/uploads";
    const paymentImagesDir = path.join(uploadDir, "payment-images");
    await mkdir(paymentImagesDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileExtension = path.extname(file.name);
    const fileName = `payment_${timestamp}_${sanitizedFileName}`;
    const filePath = path.join(paymentImagesDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return the URL path (not full filesystem path)
    const fileUrl = `/uploads/payment-images/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: fileName,
    });
  } catch (error) {
    console.error("Payment image upload error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove uploaded images
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("imageUrl");

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Extract filename from URL
    const filename = path.basename(imageUrl);
    const uploadDir = process.env.UPLOAD_DIR || "./public/uploads";
    const filePath = path.join(uploadDir, "payment-images", filename);

    try {
      await unlink(filePath);
      return NextResponse.json({
        success: true,
        message: "Image deleted successfully",
      });
    } catch (unlinkError) {
      // File might not exist, which is okay
      return NextResponse.json({
        success: true,
        message: "Image deleted successfully",
      });
    }
  } catch (error) {
    console.error("Payment image delete error:", error);
    return NextResponse.json(
      { success: false, error: "Delete failed" },
      { status: 500 }
    );
  }
}
