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
  const typeString = type.join(', ') // turns the array of strings into one singular string that is comma seperated
  const prompt = `
You are a world class SEO AI that generates SEO-friendly content for products.

Product Title: ${productTitle}
Keywords: ${keywords}

Generate only the following types as structured JSON: ${typeString}

Output format example (only include fields requested in "types"):

{
  "description": "Product description here...",
  "features": [
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ],
  "faqs": [
    {"q": "Question 1?", "a": "Answer 1"},
    {"q": "Question 2?", "a": "Answer 2"}
  ]
}

- Only include the types requested.
- Output valid JSON, nothing else.
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
          // Render automatically sets the correct referer, but you can keep it
          "HTTP-Referer": process.env.RENDER_EXTERNAL_URL || "https://truewebproai.onrender.com",
        },
        timeout: 15000, // 15 seconds
      }
    );

    return response.data.choices?.[0]?.message?.content || "Failed to fetch content!";
  } catch (err: any) {
    console.error("OpenRouter API error:", err.response?.data || err.message);
    throw new Error(err.response?.data?.error?.message || err.message);
  }
}
