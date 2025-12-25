import { connectToDatabase } from "@/lib/db";
import Translation from "@/models/Translation";

// GET translations for a language
export async function GET(req, { params }) {
  try {
    await connectToDatabase();
    const { lang } = params;

    const translationDoc = await Translation.findOne({
      languageCode: lang.toLowerCase(),
    });

    if (!translationDoc) {
      return new Response(
        JSON.stringify({ translations: {}, languageCode: lang }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert Map to object for JSON response
    const translations = {};
    translationDoc.translations.forEach((value, key) => {
      translations[key] = value.translated;
    });

    return new Response(
      JSON.stringify({
        languageCode: translationDoc.languageCode,
        translations,
        lastUpdated: translationDoc.lastUpdated,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Get translations error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Request failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// POST to bulk update translations
export async function POST(req, { params }) {
  try {
    await connectToDatabase();
    const { lang } = params;
    const body = await req.json();
    const { translations } = body;

    const translationDoc = await Translation.getOrCreate(lang);

    // Update translations
    if (translations && typeof translations === "object") {
      Object.entries(translations).forEach(([key, value]) => {
        if (typeof value === "string") {
          translationDoc.setTranslation(key, value, key);
        }
      });
      await translationDoc.save();
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Translations updated",
        languageCode: translationDoc.languageCode,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Update translations error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Request failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
