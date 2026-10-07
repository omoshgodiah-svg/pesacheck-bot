const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token);

app.get('/', (req, res) => {
  res.send('PesaCheck Bot is Live!');
});

app.post(`/bot${token}`, async (req, res) => {
  try {
    const msg = req.body.message;
    if (!msg) return res.sendStatus(200);
    
    const chatId = msg.chat.id;
    const text = msg.text || '';

    console.log('Received:', text);

    if (text.toLowerCase().includes('/start') || text.toLowerCase().includes('mambo')) {
      await bot.sendMessage(chatId, 'Mambo! Niko 24/7 - Scam Checker Only. Tuma M-Pesa CODE ni-verify!');
    } else if (text.toLowerCase().includes('confirm')) {
      await bot.sendMessage(chatId, `Nimepokea: ${text}. Na-verify...`);
      // hapa weka logic yako ya verify
    } else {
      await bot.sendMessage(chatId, 'Tuma CODE ya M-Pesa kama: confirm QGH7K9W2');
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Error:', err.message);
    res.sendStatus(200);
  }
});

module.exports = app;
