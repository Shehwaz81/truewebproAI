import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = (process.env.OPENROUTER_API_KEY || "").trim();

if (!OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is not set in .env!");
}

export async function generateDescriptionAndFAQ(productInfo: string) {
  const prompt = `
Product Information and keywords:
${productInfo}

Write a short, SEO-optimized product description (under 60 words) and format it as HTML.
Do NOT include any Markdown code block formatting (no triple backticks or language tags). Output only valid HTML.

1. Main Product Description:
   - Wrap the product name or main heading in <h2>.
   - Add a product description in <p> with approximately 300 words.

2. Product Features:
   - Add a <h2> heading named "{product name} features".
   - Include at least 5 product features.
     - For each feature:
       - Use <h3> for the feature name.
       - Include a thorough description in <p> around 300 words.

3. FAQs:
   - Add a <h2> section called "{product name} FAQs".
   - Include a minimum of 6 FAQs.
     - For each FAQ:
       - Put the question in <h3>.
       - Put the answer in <p> with around 100 words.

4. Additional Instructions:
   - Add internal links to other related products or categories where appropriate.
   - Use external links to authoritative sources if relevant.
   - Include pictures of product if possible.

5. Output:
   - Only valid HTML.
   - Do not include any extra explanation or text outside the HTML.
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
