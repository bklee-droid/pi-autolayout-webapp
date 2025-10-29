import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(__dirname)); // index.html served automatically

app.post("/api/openai", async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log("📩 Received prompt:", prompt);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an AI layout generator. Respond ONLY with JSON having {sections:[{title,subtitle,description,cta}]}.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content;
    res.status(200).json({ content: message });
  } catch (err) {
    console.error("🔥 Server error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
