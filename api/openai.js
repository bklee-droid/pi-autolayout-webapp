import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

/* -----------------------------------------------
✅ 1. OpenAI - 스토리형 상세페이지 JSON 생성
------------------------------------------------*/
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
              너는 상세페이지 AI 레이아웃 디자이너다.
              반드시 아래 JSON 구조로만 응답한다.
              JSON 이외의 문장은 절대 포함하지 않는다.

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

              tone은 섹션마다 달라도 좋다.
              tone이 모두 동일하지 않도록 2~3개 정도 섞어라.
              섹션 수는 4~7개 사이에서 랜덤으로 정하라.
              각 섹션은 문체, 강조점, 구성 순서가 일정하지 않아야 한다.
            `,
          },
          {
            role: "user",
            content: `
              ${prompt}
              구성 스타일은 ${["감성형","비주얼형","스토리텔링형","정보전달형","프리미엄 브랜드형"][Math.floor(Math.random()*5)]}으로 작성하라.
              문체는 ${["서술체","직설체","감성체","광고카피체","브랜드보이스체"][Math.floor(Math.random()*5)]}로 표현하라.
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

/* -----------------------------------------------
✅ 2. OpenAI - 이미지 생성용 DALL·E API
------------------------------------------------*/
app.post("/api/image", async (req, res) => {
  try {
    const { imagePrompt } = req.body;
    console.log("🎨 Image prompt received:", imagePrompt);

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const imageRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: imagePrompt,
        size: "1024x1024"
      })
    });

    const imageData = await imageRes.json();
    console.log("🖼️ OpenAI image response:", imageData);

    const imageUrl = imageData.data?.[0]?.url;
    if (!imageUrl) throw new Error("Image URL not found in response");

    res.status(200).json({ image_url: imageUrl });
  } catch (error) {
    console.error("🔥 Image generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

/* -----------------------------------------------
✅ 서버 실행
------------------------------------------------*/
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
