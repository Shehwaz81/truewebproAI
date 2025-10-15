import express from "express";
import { generateDescriptionAndFAQ } from "./openrouterService";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/generate", async (req, res) => {
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
});

app.use(express.static("public"));

app.listen(port, () => {
  console.log(`OpenAI generation service running on port ${port} (http://localhost:${port})`);
});