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
  // Normalize type names to be consistent
  const normalizedTypes = type.map(t => {
    if (t === 'faq') return 'faqs';
    else if (t === 'descriptions') return 'description';
    else if (t == 'feature') return 'features';
    return t;
  });
  
  const typeString = normalizedTypes.join(', ');

  const prompt = `
You are a world-class SEO AI that generates SEO-friendly content for products.

Product title:
${productTitle}

Keywords:
${keywords}

Types requested: ${typeString}

IMPORTANT: Generate ONLY the types listed above. Do NOT generate any types that are not in the list.
Always generate a title/header like this {"header": ${productTitle}} and make it SEO optimized.

Output instructions:
- ONLY output a valid JSON object.
- Do NOT include any Markdown formatting, code blocks, or extra text.
- The JSON structure should contain ONLY the keys for the requested types.

Available types and their structures:
1. "description": A string containing a highly SEO-optimized product description (minimum 150 words, use relevant keywords naturally, highlight features, benefits, and use cases).
2. "features": An array of feature strings (each feature around 100 words, SEO-focused).
3. "faqs": An array of question-answer objects (3-5 FAQs, each answer at least 40 words, address common concerns and advantages).
4. "metaTitle": A string for an SEO-friendly meta title (max 60 characters, include main keyword and product name).
5. "metaDescription": A string for an SEO-friendly meta description (max 160 characters, summarize value and include primary keywords).
${buildStructureExamples(normalizedTypes)}

Generate content for EXACTLY these types: ${typeString}
Do not include any other types in your output.

Formatting:
- Use clear keys for each section: description, features, faqs, metaTitle, metaDescription.
- Ensure content is original and avoids keyword stuffing.
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
        timeout: 30000,
      }
    );

    let content = response.data.choices?.[0]?.message?.content || '';
    content = content.replace(/```json|```/g, '').trim();

    const result = JSON.parse(content);
    
    // Validate that only requested types are present
    const validatedResult: any = {};
    normalizedTypes.forEach(requestedType => {
      if (result[requestedType] !== undefined) {
        validatedResult[requestedType] = result[requestedType];
      }
    });

    return validatedResult;

  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate SEO content');
  }
};

// Helper function to build structure examples based on requested types
function buildStructureExamples(types: string[]): string {
  const examples: string[] = [];
  
  if (types.includes('description')) {
    examples.push(
      `- If "description" is requested: {"description": "Your product description here"}. Make sure the description is around 150 words`
    );
  }
  
  if (types.includes('features')) {
    examples.push(
      `- If "features" is requested: {"features": ["Feature 1", "Feature 2", "Feature 3"]}. Each feature must be around 100 words`);
  }
  
  if (types.includes('faqs')) {
    examples.push(`- If "faqs" is requested: {"faqs": [{"q": "Question 1?", "a": "Answer 1"}, {"q": "Question 2?", "a": "Answer 2"}]}. The answer must be in around 100 words.`);
  }
  
  if (types.includes('metaTitle')) {
    examples.push(
      `- If "metaTitle" is requested: {"metaTitle": "SEO-friendly meta title here (max 60 characters)"}`
    );
  }

  if (types.includes('metaDescription')) {
    examples.push(
      `- If "metaDescription" is requested: {"metaDescription": "SEO-friendly meta description here (max 160 characters)"}`
    );
  }
  
  // Add combination examples
  if (types.length > 1) {
    const comboExample: any = {};
    types.forEach(t => {
      if (t === 'description') comboExample.description = "Your product description here";
      if (t === 'features') comboExample.features = ["Feature 1", "Feature 2"];
      if (t === 'faqs') comboExample.faqs = [{"q": "Sample question?", "a": "Sample answer"}];
      if (t === 'metaTitle') comboExample.metaTitle = "SEO-friendly meta title here";
      if (t === 'metaDescription') comboExample.metaDescription = "SEO-friendly meta description here";
    });
    examples.push(`- For multiple types ${JSON.stringify(types)}: ${JSON.stringify(comboExample)}`);
  }
  
  return "Example JSON structures:\n" + examples.join('\n');
}