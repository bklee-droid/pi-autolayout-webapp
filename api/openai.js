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

    const apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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
              너는 상세페이지 디자인용 AI 레이아웃 생성기다.
              반드시 아래 JSON 구조로만 응답한다.
              JSON 이외의 어떤 문장이나 설명, 텍스트도 포함하지 않는다.

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

              tone 필드 설명:
              - 프리미엄: 고급·세련·럭셔리 톤
              - 감성: 감정적·따뜻·공감형 톤
              - 모던: 미니멀·혁신적·간결한 톤
              - 친근: 편안·생활형·유머러스 톤
              - 신뢰: 전문가·안정감·정직한 톤
            `,
          },
          {
            role: "user",
            content: `
              ${prompt}
              (랜덤값:${Math.random().toString(36).slice(2,8)})
              각 섹션에 tone을 반드시 포함해서 JSON만 반환해줘.
            `,
          },
        ],
      }),
    });

    console.log("✅ OpenAI API status:", apiResponse.status);
    const data = await apiResponse.json();
    console.log("🧩 OpenAI raw data:", JSON.stringify(data, null, 2));

    const message = data.choices?.[0]?.message?.content;
    if (!message) throw new Error("OpenAI response missing message content");

    res.status(200).json({ content: message });
  } catch (error) {
    console.error("🔥 Server error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
