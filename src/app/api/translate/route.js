export async function POST(req) {
  try {
    const body = await req.json();
    const {
      q,
      source = "auto",
      target = "ar",
      format = "text",
      alternatives = 3,
      api_key = "",
    } = body || {};

    const upstreamUrl = "http://162.217.249.95:5000/translate";

    const translateOne = async (text) => {
      const res = await fetch(upstreamUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          source,
          target,
          format,
          alternatives,
          api_key,
        }),
      });
      const data = await res.json();
      // LibreTranslate returns { translatedText: "..." }
      if (!res.ok) {
        throw new Error(data?.error || "Translation failed");
      }
      return data?.translatedText ?? data;
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
    return new Response(
      JSON.stringify({ error: err?.message || "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
