import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1";
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
    else if (t === 'feature') return 'features';
    else if (t === 'bulletFeature') return 'bulletFeature';
    return t;
  });
  const keyword_array = keywords.split(',');
  const typeString = normalizedTypes.join(', ');

  const prompt = `
    You are a top-tier SEO writing AI specialized in producing SEO-friendly, human-sounding product content.

    Product title:
    ${productTitle}

    Keywords:
    ${keywords}
    There are ${keyword_array.length} keywords provided.

    Types requested: ${typeString}

    IMPORTANT: Produce ONLY the types listed above. Do NOT output any types not included in the list.

    Output instructions:
    - Output ONLY a valid JSON object.
    - Do NOT include Markdown, code fences, commentary, or any extra text.
    - The JSON structure must include ONLY keys for the requested types.

    Available types and their structures:
    1. "description": A highly SEO-optimized product description (minimum 150 words). Use relevant keywords naturally, highlight features, benefits, and use cases. Do not add section headers inside this string; keep it cohesive. Avoid emphasis characters like stars or all-caps.
    2. "shortDescription": A concise overview of the product, its main features and purpose (25-35 words). Use relevant keywords naturally and read like normal language. Avoid emphasis characters.
    3. "features": An array of feature strings. Provide exactly one feature per keyword, so ${keyword_array.length} features in total. Each feature should be focused, around 80-120 words, and SEO-conscious.
    4. "faqs": An array of question-answer objects (EXACTLY 10 FAQs). Each answer must be 40-50 words and address common user concerns and advantages in clear language.
    5. "bulletFeature": An array of 10 concise bullet features, each 10-15 words, clearly highlighting selling points or benefits.
    6. "metaTitle": A single SEO-friendly meta title (max 60 characters) that includes the main keyword and product name.
    7. "metaDescription": A single SEO-friendly meta description (max 160 characters) summarizing value and including primary keywords.
    ${buildStructureExamples(normalizedTypes)}

    Generate content for EXACTLY these types: ${typeString}
    Do not include any other types in your output.
    Tone: Use a conversational, friendly tone. Write like a human speaking to another human. Use short sentences and clear everyday language.
    Section structure guidance: When producing the description, prefer clear micro-sections (Introduction, Features & Benefits, How it helps the customer, Closing) if sections are requested. Otherwise produce a cohesive single-paragraph description. Make content readable and scannable.
    Keyword usage: Include keywords naturally and target user intent for search. Do NOT keyword-stuff or produce awkward phrasing.
    Formatting:
    - Use clear keys matching requested types: description, features, faqs, bulletFeature, metaTitle, metaDescription.
    - Ensure content is SIMPLE, ORIGINAL, and accessible. Avoid advanced jargon and keep
  `;

  try {
    const response = await axios.post(
      OPENROUTER_API_URL + "/chat/completions",
      {
        model: "google/gemini-2.5-flash-lite",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 3500
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

    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.error('OpenRouter raw response (not valid JSON):', content);
      throw new Error('OpenRouter did not return valid JSON.');
    }
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
      `- If "description" is requested: {"description": "Your product description here"}. Make sure the description is 100-150 words. DO NOT split it up into sections, make it one paragraph that flows smoothly`
    );
  }
  if (types.includes("shortDescription")) {
    examples.push(
      `If "shortDescription" is requested: {"shortDescription": "Your product description here"}. Make sure the short description is 25-35 words`
    )
  }
  
  if (types.includes('features')) {
    examples.push(
      `- If "features" is requested: {"features": ["keyword Feature 1", "keyword Feature 2", "Feature 3"]}. There should be as many features as there are keywords (listed at the start}. Each feature must be around 100 words
      REMEMBER: 1 feature per keyword. So if there are 3 keywords, thats 3 features. If there is 1 keyword, thats 1 feature you should output.
      `);
  }
  
  if (types.includes('faqs')) {
    examples.push(`- If "faqs" is requested: {"faqs": [{"q": "Question 1?", "a": "Answer 1"}, {"q": "Question 2?", "a": "Answer 2"}]}. You MUST generate 10 FAQ's. The answer must be in around 40-50 words.`);
  }
  
  if (types.includes('metaTitle')) {
    examples.push(
      `- If "metaTitle" is requested: {"metaTitle": "SEO-friendly meta title here (around 60 characters)"}`
    );
  }

  if (types.includes('metaDescription')) {
    examples.push(
      `- If "metaDescription" is requested: {"metaDescription": "SEO-friendly meta description here (around 150 characters)"}`
    );
  }
  
  if (types.includes('bulletFeature')) {
    examples.push(
      `- If "bulletFeature" is requested: {"bulletFeature": ["Short feature 1 (10-15 words)", "Short feature 2 (10-15 words)", ..., "Short feature 10 (10-15 words)"]}`
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
      if (t === 'bulletFeature') comboExample.bulletFeature = ["Bullet Point Feature 1", " Bullet Point Feature 2", "Bullet PointFeature 3"]
    });
    examples.push(`- For multiple types ${JSON.stringify(types)}: ${JSON.stringify(comboExample)}`);
  }
  
  return "Example JSON structures:\n" + examples.join('\n');
}