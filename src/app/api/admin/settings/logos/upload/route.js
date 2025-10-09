import { mkdir, unlink, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const logoType = formData.get("logoType");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!logoType) {
      return NextResponse.json(
        { success: false, error: "Logo type is required" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/x-icon",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid file type. Only JPEG, PNG, WebP, and ICO are allowed.",
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

    // Create logos directory if it doesn't exist
    const uploadDir = process.env.UPLOAD_DIR || "/var/www/uploads";
    const logosDir = path.join(uploadDir, "logos");
    await mkdir(logosDir, { recursive: true });

    // Generate unique filename based on logo type
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const fileName = `${logoType}_${timestamp}${fileExtension}`;
    const filePath = path.join(logosDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return the URL path (not full filesystem path)
    const fileUrl = `/uploads/logos/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: fileName,
    });
  } catch (error) {
    console.error("Logo upload error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove uploaded logos
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("imageUrl");
    const logoType = searchParams.get("logoType");

    if (!imageUrl || !logoType) {
      return NextResponse.json(
        { success: false, error: "Image URL and logo type are required" },
        { status: 400 }
      );
    }

    // Don't allow deletion of default logos
    const defaultLogos = [
      "/logos/logo.png",
      "/logos/cheap_stream_logo.png",
      "/favicon.ico",
    ];
    if (defaultLogos.includes(imageUrl)) {
      return NextResponse.json({
        success: true,
        message: "Default logo cannot be deleted",
      });
    }

    // Extract filename from URL
    const filename = path.basename(imageUrl);
    const uploadDir = process.env.UPLOAD_DIR || "/var/www/uploads";
    const filePath = path.join(uploadDir, "logos", filename);

    try {
      await unlink(filePath);
      return NextResponse.json({
        success: true,
        message: "Logo deleted successfully",
      });
    } catch (unlinkError) {
      // File might not exist, which is okay
      return NextResponse.json({
        success: true,
        message: "Logo deleted successfully",
      });
    }
  } catch (error) {
    console.error("Logo delete error:", error);
    return NextResponse.json(
      { success: false, error: "Delete failed" },
      { status: 500 }
    );
  }
}
