const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());

// Token peke yake ndio inahitajika
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) console.error("BOT TOKEN MISSING!");
const bot = new TelegramBot(token);

// Homepage - kuonyesha bot iko live
app.get('/', (req, res) => {
  res.send('PesaCheck Bot is Live 24/7 - No Daraja');
});

// Webhook ya Telegram
app.post(`/bot${token}`, async (req, res) => {
  try {
    const msg = req.body.message;
    if (!msg || !msg.text) return res.sendStatus(200);

    const chatId = msg.chat.id;
    const text = msg.text.trim();
    const lowerText = text.toLowerCase();

    // /start
    if (lowerText.startsWith('/start') || lowerText.includes('mambo') || lowerText === 'hi') {
      await bot.sendMessage(chatId, 
        `🛡️ *PesaCheck - Mlinzi wa M-Pesa*\n\nNiko 24/7. Niko tayari kuangalia CODE yako.\n\nTuma hivi:\n\`confirm QGH7K9W2LP\`\n\nNita-kuambia kama ni SCAM au inaonekana sawa.`, { parse_mode: 'Markdown' });
      return res.sendStatus(200);
    }

    // CONFIRM LOGIC - THE CORE
    if (lowerText.startsWith('confirm')) {
      const parts = text.split(/\s+/);
      let code = (parts[1] || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

      if (!code) {
        await bot.sendMessage(chatId, '❌ Andika hivi: `confirm QGH7K9W2LP`', { parse_mode: 'Markdown' });
        return res.sendStatus(200);
      }

      // --- VERIFICATION ENGINE ---
      const isLength10 = code.length === 10;
      const startsWithQ = code.startsWith('Q');
      const isAlphaNum = /^[A-Z0-9]{10}$/.test(code);
      const hasScamPattern = /^(QAAA|QHHH|QGHH|1234|0000)/.test(code) || /(.)\1\1\1/.test(code); // QAAA, 1111, QGHH etc

      let reply = '';

      if (!isLength10) {
        reply = `❌ *SCAM ALERT!* \n\nCODE \`${code}\` ni FAKE.\nSababu: M-Pesa code halisi huwa herufi 10 tu. Yako ni ${code.length}.\n\nMfano halali: \`QGH7K9W2LP\``;
      } else if (!startsWithQ || !isAlphaNum) {
        reply = `❌ *SCAM ALERT!* \n\nCODE \`${code}\` ni FAKE.\nSababu: Code halali lazima ianze na Q na iwe na herufi na nambari tu.`;
      } else if (hasScamPattern) {
        reply = `⚠️ *INASHUKIWA SANA!* \n\nCODE \`${code}\` ina pattern ya scam (kama QGHH, QAAA). 90% ya codes kama hizi ni Photoshop.\n\nUsitume kitu mpaka u-check balance: Piga *334#`;
      } else {
        reply = `✅ *FORMAT HALALI* \n\nCODE \`${code}\` imepita check zote za format.\n\n⚠️ KABLA YA KUTUMA PESA:\n1. Piga *334# uone kama pesa imeingia kweli\n2. Hakikisha SMS imetoka *MPESA* si 0700...\n3. Usitegemee screenshot pekee`;
      }

      await bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' });
      return res.sendStatus(200);
    }

    // Default
    await bot.sendMessage(chatId, 'Niko tayari. Tuma: `confirm CODE`', { parse_mode: 'Markdown' });
    return res.sendStatus(200);

  } catch (err) {
    console.error(err);
    res.sendStatus(200);
  }
});

module.exports = app;
