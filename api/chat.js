export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const { message, history } = req.body;

    const conversation = [];

    if (Array.isArray(history)) {

      history.slice(-4).forEach(item => {

        conversation.push({
          role: item.role,
          content: item.content
        });

      });

    }

    conversation.push({
      role: "user",
      content: message
    });

    const systemPrompt = `
You are Bearly AI Assistant 🧸.

You are friendly, intelligent, concise and helpful.

RULES

- Always answer in the same language as the user's latest message.
- Never mix languages unless requested.
- Support Indonesian, English, Javanese, Japanese, Korean and other languages.
- If the user speaks Javanese, answer naturally.
- Maximum 200 words.
- Use 1-3 emojis naturally.
- Never invent facts.
- If you don't know the answer, say so honestly.
- Use previous conversation when provided.
`;

    let prompt = systemPrompt + "\n\nConversation:\n";

    conversation.forEach(item => {

      prompt += `${item.role}: ${item.content}\n`;

    });
        const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINIKEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 400
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini Error:", data);

      return res.status(response.status).json({
        reply: "❌ Bearly sedang mengalami kendala. Coba lagi beberapa saat."
      });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Maaf, Bearly belum bisa memberikan jawaban.";

    return res.status(200).json({
      reply
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      reply: "❌ Terjadi kesalahan pada server."
    });

  }

}
