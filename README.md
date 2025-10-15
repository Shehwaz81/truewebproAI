# AI Content Generator API

A serverless API that generates SEO-optimized product descriptions and FAQs using OpenRouter's AI models.

## API Endpoint

**POST** `/api/generate`

### Request Body
```json
{
  "productInfo": "Your product description and keywords"
}
```

### Response
```json
{
  "result": "Generated HTML content with product description, features, and FAQs"
}
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your OpenRouter API key:
```
OPENROUTER_API_KEY=your_api_key_here
```

3. Run locally:
```bash
npm run dev
```

## Deployment on Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `OPENROUTER_API_KEY` = your OpenRouter API key
4. Deploy!

Your API will be available at: `https://your-app.vercel.app/api/generate`

## Usage Example

```bash
curl -X POST https://your-app.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{"productInfo": "Wireless headphones, noise cancellation, 30-hour battery"}'
```

## Files Structure

- `api/generate.ts` - Main API endpoint (Vercel serverless function)
- `openrouterService.ts` - OpenRouter API integration
- `public/` - Static files (HTML interface)
- `vercel.json` - Vercel deployment configuration
