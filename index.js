const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const Groq = require('groq-sdk').Groq;

const app = express();
app.use(express.json());

console.log("=== STARTING PESACHECK ===");
console.log("Has TELEGRAM:",!!process.env.TELEGRAM_TOKEN);
console.log("Has GROQ:",!!process.env.GROQ_KEY);

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
const groq = new Groq({ apiKey: process.env.GROQ_KEY });

bot.on('message', async (msg) => {
  console.log(">>> GOT MESSAGE:", msg.text);
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {role: "system", content: "You are PesaCheck, Kenyan sheng friend. Reply short in sheng."},
        {role: "user", content: msg.text}
      ],
      max_tokens: 200
    });
    const reply = completion.choices[0].message.content;
    console.log("AI REPLY:", reply);
    await bot.sendMessage(msg.chat.id, reply);
  } catch (e) {
    console.error("!!! GROQ ERROR FULL:", JSON.stringify(e, null, 2));
    await bot.sendMessage(msg.chat.id, "Pole, AI imelala kidogo. Jaribu tena! 😴 Error: " + (e.message || "unknown"));
  }
});

app.get('/', (req,res) => res.send('OK'));
app.listen(process.env.PORT || 10000, () => console.log("Server listening"));
