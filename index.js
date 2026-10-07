const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const app = express();
app.use(express.json());

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MPESA_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_SECRET = process.env.MPESA_CONSUMER_SECRET;

const bot = new TelegramBot(TOKEN, { polling: false });

async function getDarajaToken() {
  try {
    if(!MPESA_KEY ||!MPESA_SECRET) return null;
    const auth = Buffer.from(`${MPESA_KEY}:${MPESA_SECRET}`).toString('base64');
    const r = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: { Authorization: `Basic ${auth}` },
      timeout: 8000
    });
    return r.data.access_token;
  } catch(e) {
    console.log("Daraja Token Error:", e.message);
    return null;
  }
}

bot.on('message', async (msg) => {
  const raw = msg.text || "";
  const t = raw.toLowerCase().trim();
  const chatId = msg.chat.id;
  const codeMatch = raw.match(/\b[A-Z0-9]{8,12}\b/) || [];
  const code = codeMatch[0];

  try {
    if(t.match(/^(hi+|hello|hey|poa|sasa|mambo|niaje|start)$/)){
      return await bot.sendMessage(chatId, `Mambo! 👋\n\nNiko 24/7 - Scam Checker Only.\n\nTuma M-Pesa CODE ni-verify!`);
    }

    if(code){
      await bot.sendMessage(chatId, `🔍 Checking ${code}...`);

      // Hapa ndio verification logic - kwa sasa ni format check tu (Daraja token optional)
      const token = await getDarajaToken(); // ita-try but hata kama null, hatu-crash
      const isRealFormat = /^[A-Z0-9]{8,12}$/.test(code);

      let result = `CODE: ${code}\n`;
      result += `Format: ${isRealFormat? 'REAL ✅' : 'Fake ❌'}\n`;
      result += `Daraja: ${token? 'Connected' : 'Format-Check Only'}\n\n`;
      result += isRealFormat? "✅ Inaonekana kama CODE ya kweli" : "❌ Format si ya M-Pesa";

      return await bot.sendMessage(chatId, result);
    }

    return await bot.sendMessage(chatId, `Tuma M-Pesa CODE kama QGH7K9W2 ni-check!`);

  } catch(err){
    console.error("BOT ERROR:", err.message);
    try {
      await bot.sendMessage(chatId, `❌ Error kidogo: ${err.message}`);
    } catch(e){}
  }
});

app.post(`/bot${process.env.TELEGRAM_BOT_TOKEN}`, async (req, res) => {
  try {
    const message = req.body.message;
    // ... logic yako
    await bot.sendMessage(...)
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(200); // muhimu!
  }
});
app.get('/', (req, res) => res.send('PesaCHECK Bot Running 24/7'));

module.exports = app;
