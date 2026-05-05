/**
 * AI Service - Wrapper for Anthropic API via OpenRouter
 * API Key: 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
 */

const OPENROUTER_API_KEY = "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";
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Call OpenRouter API with a prompt
 * @param {string} prompt - The user prompt
 * @param {string} systemPrompt - Optional system prompt
 * @returns {Promise<string>} - AI response text
 */
async function callOpenRouter(prompt, systemPrompt = "You are a specialized business and market research assistant. Provide high-quality, real-time 2026 data. Always respond with valid JSON only, without any markdown formatting or extra text.") {
    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://startsmart.example.com',
                'X-OpenRouter-Title': 'StartSmart',
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-001",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 4096,
                response_format: { type: "json_object" }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error("No content returned from OpenRouter API");
        }

        return content;
    } catch (error) {
        console.error("AI Service Error:", error);
        throw error;
    }
}

/**
 * Extract JSON from AI response
 */
function extractJson(text) {
    try {
        const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
            return match[1].trim();
        }
        const firstBrace = text.indexOf('{');
        const firstBracket = text.indexOf('[');
        const start = (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) ? firstBrace : firstBracket;
        if (start !== -1) {
            const lastBrace = text.lastIndexOf('}');
            const lastBracket = text.lastIndexOf(']');
            const end = (lastBrace !== -1 && (lastBracket === -1 || lastBrace > lastBracket)) ? lastBrace : lastBracket;
            if (end !== -1 && end > start) {
                return text.substring(start, end + 1).trim();
            }
        }
        return text.trim();
    } catch {
        return text.trim();
    }
}

module.exports = { callOpenRouter, extractJson };