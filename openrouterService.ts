import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = (process.env.OPENROUTER_API_KEY || "").trim();

if (!OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is not set in .env!");
}

export const generateDescriptionAndFAQ = async (
  productTitle: string,
  keywords: string,
  type: string[]
) => {
  const typeString = type.join(', '); // array → comma separated string

  const prompt = `
You are a world-class SEO AI that generates SEO-friendly content for products.

Product title:
${productTitle}

Keywords:
${keywords}

Types requested:
${typeString}

Output instructions:
- ONLY output a valid JSON object.
- Do NOT include any Markdown formatting, code blocks, or extra text.
- The JSON should follow this structure:

{
  "description": "...",
  "features": ["feature1", "feature2", "..."],
  "faqs": [
    {"q": "question1", "a": "answer1"},
    {"q": "question2", "a": "answer2"}
  ]
}

Generate ONLY the types requested in the "type" array: (${typeString})
`;

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: "deepseek/deepseek-chat-v3.1",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "X-Title": "AI Demo App",
          "HTTP-Referer": process.env.RENDER_EXTERNAL_URL || "https://truewebproai.onrender.com",
        },
        timeout: 30000, // 30 seconds to allow longer content
      }
    );

    // Get raw AI output
    let content = response.data.choices?.[0]?.message?.content || '';

    // Remove code block formatting if present
    content = content.replace(/```json|```/g, '').trim();

    const result = JSON.parse(content);

    return result; // now it's proper JSON, not a string
  } catch (err: any) {
    console.error("OpenRouter API error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.error?.message || err.message);
  }
};
