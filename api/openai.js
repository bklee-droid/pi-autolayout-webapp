const fetch = require("node-fetch");

module.exports = async (req, res) => {
  try {
    const { prompt } = req.body;

    console.log("📩 Received prompt:", prompt);

    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ Missing OPENAI_API_KEY");
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

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

    console.log("✅ OpenAI response status:", response.status);

    const data = await response.json();
    console.log("🧩 OpenAI raw data:", JSON.stringify(data, null, 2));

    if (!data?.choices?.[0]?.message?.content) {
      throw new Error("No message content from OpenAI");
    }

    res.status(200).json({ content: data.choices[0].message.content });
  } catch (err) {
    console.error("🔥 Server error:", err);
    res.status(500).json({ error: err.message });
  }
};

