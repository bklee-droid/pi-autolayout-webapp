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

    console.log("📩 Received prompt:", prompt);

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const diversitySeed = Math.random().toString(36).slice(2, 8);

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
              너는 상세페이지를 설계하는 AI 레이아웃 디자이너다.
              반드시 아래 JSON 형식으로만 응답한다.
              다른 문장이나 설명은 절대 포함하지 않는다.

              {
                "sections": [
                  {
                    "title": "섹션 제목",
                    "subtitle": "부제목",
                    "description": "본문 설명",
                    "cta": "버튼 문구",
                    "tone": "프리미엄" | "감성" | "모던" | "친근" | "신뢰"
                  }
                ]
              }

              tone은 각 섹션마다 달라야 하며,
              tone의 종류는 섞어서 최소 2종 이상 사용하라.
              섹션 수는 4~7개 사이로 랜덤하게 구성한다.
              tone 분포 예시: ["프리미엄","감성","신뢰","모던","친근"]
            `,
          },
          {
            role: "user",
            content: `
              ${prompt}
              브랜드의 스타일을 tone 조합에 반영하라.
              (랜덤값:${diversitySeed})
            `,
          },
        ],
      }),
    });

    console.log("✅ OpenAI API status:", response.status);
    const data = await response.json();
    console.log("🧩 OpenAI raw data:", JSON.stringify(data, null, 2));

    const message = data.choices?.[0]?.message?.content;
    if (!message) throw new Error("No message in OpenAI response");

    res.status(200).json({ content: message });
  } catch (error) {
    console.error("🔥 Server error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
