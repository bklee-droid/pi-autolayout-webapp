import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

app.post("/api/openai", async (req, res) => {
  try {
    const { prompt } = req.body;

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
            content: `
            You are a layout generation assistant for product detail pages.
            Always respond ONLY with valid JSON:
            {
              "sections": [
                {
                  "title": "...",
                  "subtitle": "...",
                  "description": "...",
                  "cta": "...",
                  "tone": "프리미엄" | "감성" | "모던" | "친근" | "신뢰"
                }
              ]
            }

            tone 결정 기준:
            - 프리미엄: 고급·세련·럭셔리·브랜드 중심 문체
            - 감성: 감정적·따뜻한·공감형 표현
            - 모던: 미니멀·혁신적·기술 중심
            - 친근: 유머러스·편안·생활형 문체
            - 신뢰: 전문가·안정감·설득형 표현
            `,
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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
