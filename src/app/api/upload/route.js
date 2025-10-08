import { mkdir, writeFile } from "fs/promises";
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

    // Create upload directory if it doesn't exist
    const uploadDir = process.env.UPLOAD_DIR || "/var/www/uploads";
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `upload_${timestamp}_${sanitizedFileName}`;
    const filePath = path.join(uploadDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return the URL path (not full filesystem path)
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: fileName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
