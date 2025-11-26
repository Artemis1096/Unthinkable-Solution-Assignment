const Groq = require("groq-sdk");
const fs = require("fs");

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/**
 * Analyzes text using Groq's Llama model.
 * @param {object} params - { text, filePath, mimeType }
 * @returns {Promise<object>} - { sentiment, clarityScore, suggestions, improvedCaption }
 */
const analyzeWithLLM = async ({ text, filePath, mimeType }) => {
    try {
        const prompt = `Analyze this social media content and provide engagement suggestions.

Content: "${text}"

Provide a JSON response with:
- sentiment: (string) e.g., "Positive", "Neutral", "Negative", "Excited"
- clarityScore: (number) 1-10 rating for clarity
- suggestions: (array of strings) 3-5 specific actionable tips for better engagement
- improvedCaption: (string) a rewritten version optimized for social media engagement

Return ONLY the JSON object, no markdown formatting.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile", // Latest Llama model
            temperature: 0.7,
            max_tokens: 1024,
        });

        const responseText = chatCompletion.choices[0]?.message?.content || "";

        // Clean up markdown code blocks if present
        const cleanedText = responseText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        try {
            const jsonResponse = JSON.parse(cleanedText);
            return jsonResponse;
        } catch (parseError) {
            console.error("Failed to parse Groq response:", cleanedText);
            throw new Error("Failed to parse analysis results from AI.");
        }

    } catch (error) {
        console.error("Groq Analysis Error:", error);
        throw new Error("AI Analysis failed: " + error.message);
    }
};

module.exports = { analyzeWithLLM };
