"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const openrouterService_1 = require("../openrouterService");
async function handler(req, res) {
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
        const result = await (0, openrouterService_1.generateDescriptionAndFAQ)(productInfo);
        res.json({ result });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "OpenAI API call failed" });
    }
}
//# sourceMappingURL=generate.js.map