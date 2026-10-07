const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const Groq = require('groq-sdk');

console.log("=== STARTING PESACHECK ===");
console.log("Has TELEGRAM:", !!process.env.TELEGRAM_BOT_TOKEN);
console.log("Has GROQ:", !!process.env.GROQ_API_KEY);

const app = express();
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get('/', (req, res) => res.send('PesaCheck Bot is Live'));

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if (!text) return;

  console.log(`>>> GOT MESSAGE: ${text}`);

  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        { 
          role: "system", 
          content: "You are PesaCheck, a Kenyan financial buddy. You speak in Sheng + Swahili + English mix (sheng). You help users track money, budget, save. Keep replies short (under 2 lines), fun, with emojis. Never say message is empty. Always answer. If asked what you do: you are PesaCheck for pesa/budget." 
        },
        { role: "user", content: text }
      ],
      max_tokens: 150,
    });

    let reply = completion.choices[0]?.message?.content?.trim();

    if (!reply || reply.length === 0) {
      reply = "Hehe buda uliza tena, sikuwa nimekuskia poa! 😅";
    }

    console.log(`AI REPLY: ${reply}`);
    await bot.sendMessage(chatId, reply);

  } catch (err) {
    console.error("!!! GROQ/TELEGRAM ERROR:", err.message);
    // Never try to send empty error to telegram
    try {
      await bot.sendMessage(chatId, "Pole buda, network imenichekesha. Jaribu tena! 😅");
    } catch (e) {}
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
