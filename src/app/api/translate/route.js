// import { connectToDatabase } from "@/lib/db";
// import Translation from "@/models/Translation";

// // Helper to convert nested object to dot-notation keys
// function flattenObject(obj, prefix = "", result = {}) {
//   for (const key in obj) {
//     if (obj.hasOwnProperty(key)) {
//       const newKey = prefix ? `${prefix}.${key}` : key;
//       if (
//         typeof obj[key] === "object" &&
//         obj[key] !== null &&
//         !Array.isArray(obj[key])
//       ) {
//         flattenObject(obj[key], newKey, result);
//       } else {
//         result[newKey] = obj[key];
//       }
//     }
//   }
//   return result;
// }

// // Helper to build nested object from dot-notation keys
// function unflattenObject(flatObj) {
//   const result = {};
//   for (const key in flatObj) {
//     if (flatObj.hasOwnProperty(key)) {
//       const keys = key.split(".");
//       let current = result;
//       for (let i = 0; i < keys.length - 1; i++) {
//         if (!current[keys[i]]) {
//           current[keys[i]] = {};
//         }
//         current = current[keys[i]];
//       }
//       current[keys[keys.length - 1]] = flatObj[key];
//     }
//   }
//   return result;
// }

// // Helper to generate cache keys from texts
// function generateCacheKeys(texts) {
//   // Use the text itself as the key (you can customize this)
//   // For now, using the original text as key for simplicity
//   return texts.map((text, index) => `text_${index}_${text.substring(0, 20)}`);
// }

// export async function POST(req) {
//   try {
//     await connectToDatabase();

//     const body = await req.json();
//     const { q, source = "auto", target = "en", format = "text" } = body || {};

//     // Skip caching for English
//     if (target === "en") {
//       const items = Array.isArray(q) ? q : [q ?? ""];
//       return new Response(
//         JSON.stringify(
//           Array.isArray(q) ? { translations: items } : { translation: items[0] }
//         ),
//         {
//           status: 200,
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//     }

//     // Normalize input to array
//     const items = Array.isArray(q) ? q : [q ?? ""];
//     const isArray = Array.isArray(q);

//     // Get or create translation document for this language
//     const translationDoc = await Translation.getOrCreate(target);

//     // Check which translations exist in cache
//     const cachedTranslations = {};
//     const missingIndices = [];
//     const missingTexts = [];
//     const cacheKeys = [];

//     items.forEach((text, index) => {
//       // Use text as cache key (normalized)
//       const cacheKey = text?.trim() || "";

//       // Check if translation exists
//       const cached = translationDoc.translations.get(cacheKey);

//       if (cached && cached.translated) {
//         cachedTranslations[index] = cached.translated;
//       } else {
//         missingIndices.push(index);
//         missingTexts.push(text);
//         cacheKeys.push(cacheKey);
//       }
//     });

//     // If all translations are cached, return immediately
//     if (missingIndices.length === 0) {
//       const results = items.map((_, index) => cachedTranslations[index]);
//       return new Response(
//         JSON.stringify(
//           isArray ? { translations: results } : { translation: results[0] }
//         ),
//         {
//           status: 200,
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//     }

//     // Translate missing texts via Google Translate API
//     let googleTranslations = [];
//     const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

//     if (apiKey && missingTexts.length > 0) {
//       const payload = {
//         q: missingTexts,
//         target,
//         format,
//         ...(source && source !== "auto" ? { source } : {}),
//       };

//       const res = await fetch(
//         `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         }
//       );

//       if (!res.ok) {
//         const text = await res.text().catch(() => "");
//         throw new Error(
//           `Google Translate API error: ${res.status} ${res.statusText} ${text}`.trim()
//         );
//       }

//       const data = await res.json();
//       googleTranslations =
//         data?.data?.translations?.map((t) => t?.translatedText ?? "") ?? [];

//       // Store new translations in database
//       if (googleTranslations.length > 0) {
//         missingTexts.forEach((originalText, idx) => {
//           if (originalText && googleTranslations[idx]) {
//             translationDoc.setTranslation(
//               originalText.trim(),
//               googleTranslations[idx],
//               originalText.trim()
//             );
//           }
//         });

//         // Save to database
//         await translationDoc.save();
//       }
//     } else if (!apiKey) {
//       console.warn("GOOGLE_TRANSLATE_API_KEY not configured");
//       // Fallback to cached or original text
//       googleTranslations = missingTexts;
//     }

//     // Combine cached and newly translated results
//     const finalResults = items.map((text, index) => {
//       if (cachedTranslations[index]) {
//         return cachedTranslations[index];
//       }
//       const missingIdx = missingIndices.indexOf(index);
//       return missingIdx !== -1 && googleTranslations[missingIdx]
//         ? googleTranslations[missingIdx]
//         : text;
//     });

//     const result = isArray
//       ? { translations: finalResults }
//       : { translation: finalResults[0] ?? "" };

//     return new Response(JSON.stringify(result), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (err) {
//     console.error("Translation endpoint error:", err);
//     return new Response(
//       JSON.stringify({ error: err?.message || "Request failed" }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   }
// }
