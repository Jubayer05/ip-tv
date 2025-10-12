export async function POST(req) {
  try {
    const body = await req.json();
    const { q, source = "auto", target = "en" } = body || {};

    // Return the original text without translation
    let result;
    if (Array.isArray(q)) {
      result = { translations: q };
    } else {
      result = { translation: q || "" };
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Translation endpoint error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Request failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
