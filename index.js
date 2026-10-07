const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const Groq = require('groq-sdk');

const app = express();
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get('/', (req, res) => res.send('V6 Live'));

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = (msg.text || "").trim().toLowerCase();
  if (!text) return;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // fastest + never fails
      temperature: 0.9,
      max_tokens: 120,
      messages: [
        {
          role: "system",
          content: "You are PesaCheck, Kenyan money buddy. You understand BOTH English and Swahili/Sheng. Match user's language. If user says hi/hiii/hello/mambo/sasa/oyaa -> reply friendly greeting + ask about money. If English, reply English. If Swahili/Sheng, reply Sheng. Always add 1 emoji. Max 25 words. You help with money, budgeting, saving."
        },
        { role: "user", content: msg.text }
      ],
    });

    let reply = completion.choices[0]?.message?.content?.trim();
    if(!reply) throw new Error("empty");

    await bot.sendMessage(chatId, reply);
    console.log(`OK: ${msg.text} -> ${reply}`);

  } catch (err) {
    console.error("GROQ ERROR REAL:", err.message);
    // Smart fallback that knows English too
    let fallback;
    if (text.includes("hi") || text.includes("hello") || text.includes("hey") || text.includes("yo")) {
      fallback = "Heyy! I'm PesaCheck, your money plug! What's good, need help with budget or saving? 💸";
    } else {
      fallback = "Poa sana! Mimi ni PesaCheck, plug wa pesa. Niko ready kukujenga na doh! 💰";
    }
    await bot.sendMessage(chatId, fallback);
  }
});

app.listen(process.env.PORT || 10000, () => console.log("V6 Live"));
