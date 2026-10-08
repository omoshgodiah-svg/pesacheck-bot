const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const app = express();
app.use(express.json());
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token);

app.get('/', (req, res) => res.send('PesaCheck Live'));
app.post(`/bot${token}`, async (req, res) => {
  try {
    const msg = req.body.message;
    if (!msg ||!msg.text) return res.sendStatus(200);
    const chatId = msg.chat.id;
    const text = msg.text.trim().toLowerCase();

    if (text.startsWith('/start')) {
      await bot.sendMessage(chatId, "PesaCheck - Mlinzi wa M-Pesa\n\nNiko 24/7. Tuma:\nconfirm QGH7K9W2LP\n\nNita-kuambia kama ni SCAM au sawa.");
      return res.sendStatus(200);
    }

    if (text.startsWith('confirm')) {
      let code = text.split(/\s+/)[1] || "";
      code = code.toUpperCase().replace(/[^A-Z0-9]/g, '');

      if(code.length!== 10) {
        await bot.sendMessage(chatId, "❌ SCAM ALERT! CODE " + code + " ni FAKE. Inafaa iwe 10 characters. Yako ni " + code.length);
      } else if(!code.startsWith('Q')) {
        await bot.sendMessage(chatId, "❌ SCAM ALERT! CODE " + code + " ni FAKE. Lazima ianze na Q");
      } else {
        await bot.sendMessage(chatId, "✅ FORMAT HALALI! CODE " + code + " imepita check. Bado piga 334# u-confirm pesa imeingia Safaricom.");
      }
      return res.sendStatus(200);
    }

    await bot.sendMessage(chatId, "Tuma: confirm CODE");
    return res.sendStatus(200);
  } catch(e) {
    console.error(e.message);
    return res.sendStatus(200);
  }
});
module.exports = app;
