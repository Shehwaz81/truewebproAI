import { generateDescriptionAndFAQ } from "../openrouterService";

interface VercelRequest {
  method: string;
  body: any;
}

interface VercelResponse {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  end: () => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productInfo } = req.body;
  
  if (!productInfo) {
    return res.status(400).json({ error: "Missing productInfo" });
  }

  try {
    const result = await generateDescriptionAndFAQ(productInfo);
    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OpenAI API call failed" });
  }
}
