/**
 * OpenRouter AI Service - Uses the openrouter/free meta-model.
 * It auto-routes to the best available free model. No credits needed.
 */

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function callOpenRouter(prompt: string): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API Key is missing. Please check your .env file.");
  }

  let response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost:5173",
      "X-OpenRouter-Title": "StartSmart 3D",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: "You are a business research assistant. Respond with ONLY valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    }),
  });

  // If first attempt fails (especially if it's a 400 due to json_object mode), try fallback
  if (!response.ok) {
    console.warn(`OpenRouter primary failed (${response.status}), attempting fallback...`);
    response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:5173",
        "X-OpenRouter-Title": "StartSmart 3D",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash:free",
        messages: [
          { role: "system", content: "Respond with ONLY valid JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 3000,
      }),
    });
  }

  if (!response.ok) {
    const errText = await response.text();
    console.error("OpenRouter Error Details:", errText);
    throw new Error(`OpenRouter API Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content returned from OpenRouter API");
  }

  return content;
}
