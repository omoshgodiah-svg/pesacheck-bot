const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const Groq = require('groq-sdk');

const app = express();
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get('/', (req, res) => res.send('PesaCheck Live V4'));

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if (!text) return;

  try {
    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.7,
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content: "You are PesaCheck, a Kenyan Gen-Z money buddy. Speak in Sheng/Swahili/English mix. You help with budgeting, saving, side hustles. ALWAYS answer, never empty. Keep under 40 words, funny, with emoji. If asked what you do: 'Mimi ni PesaCheck, nakusaidia na pesa, budget na saving mzee!'"
        },
        { role: "user", content: text }
      ],
    });

    let reply = completion.choices[0]?.message?.content?.trim();

    // Fix for reasoning models (just in case)
    if (!reply) {
      reply = completion.choices[0]?.message?.reasoning_content?.trim() || "";
    }

    if (!reply || reply.length < 2) {
      reply = "Mimi ni PesaCheck buda! Nakusaidia na pesa, budget, na savings - uliza chochote about doh! 💰";
    }

    await bot.sendMessage(chatId, reply);

  } catch (err) {
    console.error("ERROR:", err.message);
    await bot.sendMessage(chatId, "Mimi ni PesaCheck, mzee wa pesa! Uliza budget ama saving! 💸");
  }
});

app.listen(process.env.PORT || 10000, () => console.log("V4 Live"));
