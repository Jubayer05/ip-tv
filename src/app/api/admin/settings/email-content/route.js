// src/app/api/admin/settings/email-content/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    // Ensure singleton doc exists and includes emailContent
    const settings = await Settings.getSettings();

    return NextResponse.json({
      success: true,
      data: {
        content: settings?.emailContent?.content || "",
      },
    });
  } catch (error) {
    console.error("Error fetching email content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch email content" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();

    const { content } = await request.json();

    // Use the static helper to guarantee the doc exists and has defaults
    const settings = await Settings.getSettings();

    if (!settings.emailContent) settings.emailContent = { content: "" };
    settings.emailContent.content = content || "";

    await settings.save();

    return NextResponse.json({
      success: true,
      message: "Email content updated successfully",
    });
  } catch (error) {
    console.error("Error updating email content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update email content" },
      { status: 500 }
    );
  }
}
