import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create upload directory
    const uploadDir = process.env.UPLOAD_DIR || "/var/www/uploads";
    const adsDir = path.join(uploadDir, "ads");
    await mkdir(adsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const filename = `ad_${timestamp}${fileExtension}`;
    const filepath = path.join(adsDir, filename);

    // Save file
    await writeFile(filepath, buffer);

    // Return the public URL
    const imageUrl = `/uploads/ads/${filename}`;

    return NextResponse.json({
      success: true,
      data: { imageUrl },
    });
  } catch (error) {
    console.error("Error uploading ad image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

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
    const uploadDir = process.env.UPLOAD_DIR || "/var/www/uploads";
    const filepath = path.join(uploadDir, "ads", filename);

    // Delete file
    await unlink(filepath);

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting ad image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
