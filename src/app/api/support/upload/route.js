// Support file uploads API route
import { mkdir, stat, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export const runtime = "nodejs";

async function ensureDir(dirPath) {
  try {
    const s = await stat(dirPath);
    if (!s.isDirectory()) {
      throw new Error(`${dirPath} exists and is not a directory`);
    }
  } catch (e) {
    await mkdir(dirPath, { recursive: true });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size too large. Maximum 5MB allowed." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const originalName = file.name || "upload";
    const safeName = originalName.replace(/[^\w.\-]/g, "_");
    const fileName = `${timestamp}-${safeName}`;

    // Use VPS upload directory
    const uploadDir = process.env.UPLOAD_DIR || "/var/www/uploads";
    await ensureDir(uploadDir);

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Generate URL for the uploaded file
    const baseEnv = process.env.BASE_URL?.replace(/\/$/, "");
    const xfProto = request.headers.get("x-forwarded-proto");
    const xfHost = request.headers.get("x-forwarded-host");
    const originHeader = request.headers.get("origin");

    const origin = baseEnv
      ? baseEnv
      : xfProto && xfHost
      ? `${xfProto}://${xfHost}`
      : originHeader?.replace(/\/$/, "") || "";

    const url = origin
      ? `${origin}/uploads/${fileName}`
      : `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url,
      fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
