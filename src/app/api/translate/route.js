import { connectToDatabase } from "@/lib/db";
import Settings from "@/models/Settings";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      q,
      source = "auto",
      target = "en",
      format = "text",
      alternatives = 3,
      api_key = "",
    } = body || {};

    // Define which languages use DeepL vs Google Translate
    const deeplLanguages = [
      "sv",
      "no",
      "da",
      "fi",
      "fr",
      "de",
      "es",
      "it",
      "ru",
      "tr",
    ];
    const googleLanguages = ["ar", "hi", "zh"];

    const useDeepL = deeplLanguages.includes(target);
    const useGoogle = googleLanguages.includes(target);

    const translateOne = async (text) => {
      if (useDeepL) {
        return await translateWithDeepL(text, source, target);
      } else if (useGoogle) {
        return await translateWithGoogle(text, source, target);
      } else {
        // Fallback to DeepL for unknown languages
        return await translateWithDeepL(text, source, target);
      }
    };

    let result;
    if (Array.isArray(q)) {
      const translations = await Promise.all(
        q.map((item) => translateOne(item))
      );
      result = { translations };
    } else {
      const translation = await translateOne(q ?? "");
      result = { translation };
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Translation error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Translation failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

async function translateWithDeepL(text, source, target) {
  // Get DeepL API key from database
  await connectToDatabase();
  const settings = await Settings.getSettings();
  const DEEPL_API_KEY = settings?.otherApiKeys?.deepl?.apiKey;
  const DEEPL_BASE_URL =
    settings?.otherApiKeys?.deepl?.baseUrl || "https://api-free.deepl.com";

  if (!DEEPL_API_KEY) {
    throw new Error("DeepL API key not configured in admin settings");
  }

  // Map language codes to DeepL format (following official documentation)
  const deeplLanguageMap = {
    sv: "SV", // Swedish
    no: "NB", // Norwegian Bokmål
    da: "DA", // Danish
    fi: "FI", // Finnish
    fr: "FR", // French
    de: "DE", // German
    es: "ES", // Spanish
    it: "IT", // Italian
    ru: "RU", // Russian
    tr: "TR", // Turkish
    en: "EN", // English
  };

  const deeplTarget = deeplLanguageMap[target] || target.toUpperCase();

  // For source language, DeepL supports auto-detection with "auto"
  // or specific language codes
  let deeplSource;
  if (source === "auto") {
    deeplSource = null; // Let DeepL auto-detect
  } else {
    deeplSource = deeplLanguageMap[source] || source.toUpperCase();
  }

  console.log(
    `DeepL: Translating from ${deeplSource || "auto"} to ${deeplTarget}`
  );

  // Prepare request body according to DeepL API documentation
  const requestBody = new URLSearchParams({
    text: text,
    target_lang: deeplTarget,
  });

  // Only add source_lang if it's specified (not auto)
  if (deeplSource) {
    requestBody.append("source_lang", deeplSource);
  }

  const response = await fetch(`${DEEPL_BASE_URL}/v2/translate`, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: requestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("DeepL API Error:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(`DeepL API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("DeepL Response:", data);

  // Validate response structure
  if (
    !data.translations ||
    !Array.isArray(data.translations) ||
    data.translations.length === 0
  ) {
    throw new Error("Invalid DeepL API response format");
  }

  return data.translations[0].text;
}

async function translateWithGoogle(text, source, target) {
  // Get Google Translate API key from database
  await connectToDatabase();
  const settings = await Settings.getSettings();
  const GOOGLE_API_KEY = settings?.otherApiKeys?.googleTranslate?.apiKey;
  const GOOGLE_BASE_URL =
    settings?.otherApiKeys?.googleTranslate?.baseUrl ||
    "https://translation.googleapis.com";

  if (!GOOGLE_API_KEY) {
    throw new Error(
      "Google Translate API key not configured in admin settings"
    );
  }

  // Map language codes to Google Translate format
  const googleLanguageMap = {
    ar: "ar",
    hi: "hi",
    zh: "zh-cn", // Simplified Chinese
    en: "en",
  };

  const googleTarget = googleLanguageMap[target] || target;
  const googleSource =
    source === "auto" ? undefined : googleLanguageMap[source] || source;

  console.log(`Translating from ${googleSource || "auto"} to ${googleTarget}`);

  const requestBody = {
    q: text,
    target: googleTarget,
    format: "text",
  };

  // Only add source if it's not auto
  if (googleSource && googleSource !== "auto") {
    requestBody.source = googleSource;
  }

  const response = await fetch(
    `${GOOGLE_BASE_URL}/language/translate/v2?key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Google Translate API Error:", errorData);
    throw new Error(
      `Google Translate API error: ${response.status} - ${
        errorData.error?.message || "Unknown error"
      }`
    );
  }

  const data = await response.json();
  console.log("Google Translate Response:", data);
  return data.data.translations[0].translatedText;
}
