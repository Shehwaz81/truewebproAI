import express from "express";
import dotenv from "dotenv";
import { generateDescriptionAndFAQ } from "./openrouterService";

// Load environment variables immediately
dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || "3000", 10);

// Middleware
app.use(express.json());           // parse JSON bodies
app.use(express.static("public")); // serve static files from /public

// Health check route (optional, good for Render)
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Main generate endpoint
app.post("/generate", async (req, res) => {
  const { productInfo } = req.body;

  if (!productInfo) {
    return res.status(400).json({ error: "Missing productInfo" });
  }

  try {
    const result = await generateDescriptionAndFAQ(productInfo);
    res.json({ result });
  } catch (err: any) {
    console.error("OpenRouter API error:", err.response?.data || err.message);

    res.status(500).json({
      error: "OpenAI API call failed",
      details: err.response?.data || err.message,
    });
  }
});

// Bind to 0.0.0.0 for Render deployment
app.listen(port, "0.0.0.0", () => {
  console.log(`OpenAI generation service running on port ${port}`);
});
