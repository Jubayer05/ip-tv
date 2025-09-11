import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    await connectToDatabase();

    const { type, title, content } = await request.json();

    if (
      !type ||
      !["userGuide", "termsAndConditions", "privacyPolicy"].includes(type)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid content type" },
        { status: 400 }
      );
    }

    // Get or create settings document
    let settings = await Settings.findOne({ key: "global" });
    if (!settings) {
      settings = await Settings.create({ key: "global" });
    }

    // Initialize legalContent if it doesn't exist
    if (!settings.legalContent) {
      settings.legalContent = {
        userGuide: {
          title: "User Guide",
          content: "",
          lastUpdated: new Date(),
        },
        termsAndConditions: {
          title: "Terms and Conditions",
          content: "",
          lastUpdated: new Date(),
        },
        privacyPolicy: {
          title: "Privacy Policy",
          content: "",
          lastUpdated: new Date(),
        },
      };
    }

    // Update the specific content type
    settings.legalContent[type] = {
      title: title || settings.legalContent[type]?.title || type,
      content: content || "",
      lastUpdated: new Date(),
    };

    await settings.save();

    return NextResponse.json({
      success: true,
      message: `${type} updated successfully`,
      settings,
    });
  } catch (error) {
    console.error("Error updating legal content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update legal content" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const settings = await Settings.findOne({ key: "global" });
    if (!settings) {
      return NextResponse.json(
        { success: false, error: "Settings not found" },
        { status: 404 }
      );
    }

    if (type && settings.legalContent?.[type]) {
      return NextResponse.json({
        success: true,
        data: settings.legalContent[type],
      });
    }

    return NextResponse.json({
      success: true,
      data: settings.legalContent || {},
    });
  } catch (error) {
    console.error("Error fetching legal content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch legal content" },
      { status: 500 }
    );
  }
}
