import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";
import { uploadPaths, getPublicUrl, isValidFileType, isValidFileSize, uploadConfig } from "@/config/upload";

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

    // Validate file type using centralized config
    if (!isValidFileType(file)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size using centralized config
    if (!isValidFileSize(file)) {
      return NextResponse.json(
        { success: false, error: "File size too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use centralized upload path
    const adsDir = uploadPaths.ads();
    await mkdir(adsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const filename = `ad_${timestamp}${fileExtension}`;
    const filepath = path.join(adsDir, filename);

    // Save file
    await writeFile(filepath, buffer);

    // Return the public URL using centralized function
    const imageUrl = getPublicUrl('ads', filename);

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
    const adsDir = uploadPaths.ads();
    const filepath = path.join(adsDir, filename);

    // Delete file
    const { unlink } = await import("fs/promises");
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
