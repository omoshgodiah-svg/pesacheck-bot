const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const Groq = require('groq-sdk');

const app = express();
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get('/', (req, res) => res.send('PesaCheck Live'));

const FALLBACKS = [
  "Haha buda umenichekesha, sema tuu pesa story - niko rada! 😂",
  "Hehe mzee, hiyo sijaishika, but niko poa na pesa maneno! 💰",
  "Buda, rephrase tuu kidogo, nataka nikujenge na pesa! 🙏"
];

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if (!text) return;

  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      temperature: 0.8,
      max_tokens: 200,
      messages: [
        {
          role: "system",
          content: "You are PesaCheck, a Kenyan sheng money buddy. You speak sheng. You MUST always give an answer, never return empty. If user asks about loans, talk about general saving tips, SACCOs, side hustles, budgeting - don't mention mzungu. Keep it short, funny, Kenyan. Max 2 sentences."
        },
        { role: "user", content: text }
      ],
    });

    let reply = completion.choices[0]?.message?.content?.trim();

    if (!reply) {
      console.log("Groq returned empty, retrying...");
      // retry with safer prompt
      const retry = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: "You are PesaCheck, Kenyan money advisor. Answer in sheng, short." },
          { role: "user", content: "Explain in sheng: how to get money: " + text }
        ],
        max_tokens: 150
      });
      reply = retry.choices[0]?.message?.content?.trim();
    }

    if (!reply) {
      reply = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
    }

    await bot.sendMessage(chatId, reply);

  } catch (err) {
    console.error(err.message);
    await bot.sendMessage(chatId, FALLBACKS[0]);
  }
});

app.listen(process.env.PORT || 10000, () => console.log("Live"));
