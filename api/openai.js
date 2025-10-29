export default async function handler(req, res) {
  try {
    const { prompt } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an AI layout generator that returns structured JSON layouts for product pages." },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    res.status(200).json(data.choices[0].message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
