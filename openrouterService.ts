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

    Product titles:
    ${productTitle}

    Keywords:
    ${keywords}

    Types requested:
    ${typeString}

    Output instructions:
    - ONLY output a valid JSON object.
    - Do NOT include any Markdown formatting, code blocks, or extra text.
    - Output should be neatly formated for curl requests and API calls
    - The JSON should follow this structure:

    {
      "description": "...",
      "features": ["feature1", "feature2", "..."],
      "faqs": [
        {"q": "question1", "a": "answer1"},
        {"q": "question2", "a": "answer2"}
      ]
    }

    Generate only the types requested in the "type" array. (${typeString}")
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
