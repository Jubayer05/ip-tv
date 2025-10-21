import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";
import { NextResponse } from "next/server";

// GET /api/settings/languages - Get language settings
export async function GET() {
  try {
    await connectToDatabase();
    const settings = await Settings.getSettings();

    return NextResponse.json({
      success: true,
      data: settings.languageSettings || {
        availableLanguages: [
          { code: "en", name: "English", flag: "🇬🇧", isActive: true },
          { code: "sv", name: "Swedish", flag: "🇸🇪", isActive: true },
          { code: "no", name: "Norwegian", flag: "🇳🇴", isActive: true },
          { code: "da", name: "Danish", flag: "🇩🇰", isActive: true },
          { code: "fi", name: "Finnish", flag: "🇫🇮", isActive: true },
          { code: "fr", name: "French", flag: "🇫🇷", isActive: true },
          { code: "de", name: "German", flag: "🇩🇪", isActive: true },
          { code: "es", name: "Spanish", flag: "🇪🇸", isActive: true },
          { code: "it", name: "Italian", flag: "🇮🇹", isActive: true },
          { code: "ru", name: "Russian", flag: "🇷🇺", isActive: true },
          { code: "tr", name: "Turkish", flag: "🇹🇷", isActive: true },
          { code: "ar", name: "Arabic", flag: "🇸🇦", isActive: true },
          { code: "hi", name: "Hindi", flag: "🇮🇳", isActive: true },
          { code: "zh", name: "Chinese", flag: "🇨🇳", isActive: true },
        ],
        defaultLanguage: "en",
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    console.error("Error fetching language settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch language settings" },
      { status: 500 }
    );
  }
}

// PUT /api/settings/languages - Update language settings
export async function PUT(request) {
  try {
    await connectToDatabase();
    const { availableLanguages, defaultLanguage } = await request.json();

    if (!Array.isArray(availableLanguages)) {
      return NextResponse.json(
        { error: "availableLanguages must be an array" },
        { status: 400 }
      );
    }

    if (!defaultLanguage || typeof defaultLanguage !== "string") {
      return NextResponse.json(
        { error: "defaultLanguage is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate that default language is in the available languages
    const defaultLangExists = availableLanguages.find(
      (lang) => lang.code === defaultLanguage && lang.isActive
    );

    if (!defaultLangExists) {
      return NextResponse.json(
        { error: "Default language must be active in available languages" },
        { status: 400 }
      );
    }

    const settings = await Settings.getSettings();

    settings.languageSettings = {
      availableLanguages,
      defaultLanguage,
      lastUpdated: new Date(),
    };

    await settings.save();

    return NextResponse.json({
      success: true,
      data: settings.languageSettings,
      message: "Language settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating language settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update language settings" },
      { status: 500 }
    );
  }
}
