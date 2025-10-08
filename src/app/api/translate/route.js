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

    // Map language codes to LibreTranslate format
    const libretranslateLanguageMap = {
      en: "en", // English
      sv: "sv", // Swedish
      no: "no", // Norwegian
      da: "da", // Danish
      fi: "fi", // Finnish
      fr: "fr", // French
      de: "de", // German
      es: "es", // Spanish
      it: "it", // Italian
      ru: "ru", // Russian
      tr: "tr", // Turkish
      ar: "ar", // Arabic
      hi: "hi", // Hindi
      zh: "zh", // Chinese
    };

    const libretranslateTarget = libretranslateLanguageMap[target] || target;
    const libretranslateSource =
      source === "auto" ? "auto" : libretranslateLanguageMap[source] || source;

    const translateOne = async (text) => {
      return await translateWithLibreTranslate(
        text,
        libretranslateSource,
        libretranslateTarget
      );
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

async function translateWithLibreTranslate(text, source, target) {
  // Use your server's IP instead of localhost
  const LIBRETRANSLATE_URL = "http://155.254.35.168:5000";

  const requestBody = {
    q: text,
    source: source,
    target: target,
    format: "text",
  };

  const response = await fetch(`${LIBRETRANSLATE_URL}/translate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("LibreTranslate API Error:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(
      `LibreTranslate API error: ${response.status} - ${errorText}`
    );
  }

  const data = await response.json();

  // Validate response structure
  if (!data.translatedText) {
    throw new Error("Invalid LibreTranslate API response format");
  }

  return data.translatedText;
}
