const express = require("express");
const fetch = require("node-fetch"); // 일부 환경에선 필요
const app = express();
app.use(express.json());
app.use(express.static("public"));

/* -----------------------------------------------
✅ 1. OpenAI - 텍스트/스토리 JSON 생성용
------------------------------------------------*/
app.post("/api/openai", async (req, res) => {
  const { prompt } = req.body;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return res.status(500).json({ error: "Missing OPENAI_API_KEY" });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
              You are a JSON-only generator for product storytelling pages.
              NEVER include explanations or natural language text.
              Always return ONLY JSON with this structure:
              {
                "sections": [
                  {
                    "stage": "문제 제기",
                    "title": "",
                    "subtitle": "",
                    "description": "",
                    "cta": "",
                    "tone": "",
                    "imagePrompt": "",
                    "layoutType": "text-left-image-right"
                  }
                ]
              }
            `
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.8
      })
    });

    const data = await response.json();
    res.json(data.choices?.[0]?.message || {});
  } catch (e) {
    console.error("❌ OpenAI API Error:", e);
    res.status(500).json({ error: "Failed to reach OpenAI" });
  }
});

/* -----------------------------------------------
✅ 2. Midjourney Proxy - 이미지 생성용
------------------------------------------------*/
app.post("/api/midjourney", async (req, res) => {
  const { prompt } = req.body;
  const MJ_API_KEY = process.env.MJ_API_KEY;
  if (!MJ_API_KEY) return res.status(500).json({ error: "Missing MJ_API_KEY" });

  try {
    const mjRes = await fetch("https://api.thenextleg.io/v2/imagine", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MJ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await mjRes.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Midjourney Proxy Error:", err);
    res.status(500).json({ error: "Midjourney proxy error" });
  }
});

/* -----------------------------------------------
✅ 서버 실행
------------------------------------------------*/
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


