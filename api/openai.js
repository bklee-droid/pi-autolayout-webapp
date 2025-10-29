console.log("🔑 OPENAI_API_KEY detected:", !!process.env.OPENAI_API_KEY);

module.exports = async (req, res) => {
  try {
    const { prompt } = req.body;

    console.log("📩 Received prompt:", prompt);

    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ Missing OPENAI_API_KEY");
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
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

    console.log("✅ OpenAI API status:", apiResponse.status);

    const data = await apiResponse.json();
    console.log("🧩 OpenAI raw data:", JSON.stringify(data, null, 2));

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({ error: data });
    }

    const message = data.choices?.[0]?.message?.content;
    if (!message) {
      throw new Error("OpenAI response missing message content");
    }

    res.status(200).json({ content: message });
  } catch (error) {
    console.error("🔥 Server error:", error);
    res.status(500).json({ error: error.message });
  }
};


