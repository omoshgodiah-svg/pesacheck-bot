const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const Groq = require('groq-sdk');

const app = express();
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get('/', (req, res) => res.send('PesaCheck V5 Live'));

const MODELS = [
  "llama-3.3-70b-versatile",
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "llama-3.1-8b-instant"
];

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = (msg.text || "").trim();
  if (!text) return;

  let reply = null;

  for (const model of MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        model: model,
        temperature: 0.85,
        max_tokens: 150,
        messages: [
          {
            role: "system",
            content: `You are PesaCheck, Nairobi's best sheng money guy. Rules:
- User says "mambo", "oyaa", "sasa", "poa" => reply "Poa sana mzee! Niko fiti, pesa iko? Unataka nikusaidie na nini leo?"
- User asks what you do => "Mimi ni PesaCheck, boy wa pesa! Nakujenga na budget, saving, na kudinyana na pesa usichezwe!"
- Always in sheng, short (max 25 words), funny, Kenyan. Never say you are AI.`
          },
          { role: "user", content: text }
        ],
      });
      reply = completion.choices[0]?.message?.content?.trim();
      if (reply) {
        console.log(`SUCCESS with ${model}`);
        break;
      }
    } catch (e) {
      console.log(`FAIL ${model}: ${e.message}`);
    }
  }

  if (!reply) {
    if (text.toLowerCase().includes("mambo") || text.toLowerCase().includes("oyaa") || text.toLowerCase().includes("sasa")) {
      reply = "Poa sana mzee! Niko fiti, pesa iko? Unataka nikusaidie na nini leo? 💰";
    } else {
      reply = "Mimi ni PesaCheck, boy wa pesa! Nakujenga na budget na saving, sema tu! 💸";
    }
  }

  await bot.sendMessage(chatId, reply);
});

app.listen(process.env.PORT || 10000, () => console.log("V5 Live"));
