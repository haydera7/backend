// routes/chat.js
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import Property from "../models/Property.js";

dotenv.config();
const router = express.Router();


const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.2";

router.post("/", async (req, res) => {
  const { message } = req.body;

  try {
    // 🏠 Fetch sample property info for context
    const properties = await Property.find().limit(5);
    const context = properties
      .map((p) => `${p.title} in ${p.location} — ${p.price} ETB/month`)
      .join("\n");

    const prompt = `
You are SmartRent+ AI Assistant. Help the user find the best home to rent based on price, comfort, and weather.
Use the following property data to answer clearly and conversationally.

Available properties:
${context}

User question: ${message}
`;

    console.log("📡 Sending prompt to Hugging Face Router...");

    // ✅ Correct, current endpoint (November 2025)
    const response = await axios.post(
      `https://router.huggingface.co/hf-inference/${HF_MODEL}`,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    console.log("✅ Hugging Face Raw Response:", response.data);

    let reply = "Sorry, I didn’t get that.";
    if (Array.isArray(response.data) && response.data[0]?.generated_text) {
      reply = response.data[0].generated_text;
    } else if (response.data?.generated_text) {
      reply = response.data.generated_text;
    } else if (response.data?.error) {
      reply = `⚠️ Hugging Face Error: ${response.data.error}`;
    }

    res.json({ reply });
  } catch (err) {
    console.error("❌ Chat Error:", err.response?.data || err.message);
    res.status(500).json({
      reply: "⚠️ Sorry, something went wrong with the chatbot connection.",
    });
  }
});

export default router;
