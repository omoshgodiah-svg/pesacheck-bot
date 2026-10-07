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
    } 
    else if (text.toLowerCase().includes('confirm')) {
      const code = text.split(' ')[1] || text.replace('confirm','').trim();

      if(!code || code.length < 5) {
        await bot.sendMessage(chatId, '❌ Weka CODE sahihi: confirm QGH7K9W2');
        return res.sendStatus(200);
      }

      await bot.sendMessage(chatId, `⏳ Na-verify ${code}...`);

      try {
        // 1. Pata Token
        const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
        const tokenRes = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
          headers: { Authorization: `Basic ${auth}` }
        });
        const { access_token } = await tokenRes.json();

        // 2. Query Transaction (Transaction Status API)
        const queryRes = await fetch('https://sandbox.safaricom.co.ke/mpesa/transactionstatus/v1/query', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            Initiator: "testapi",
            SecurityCredential: process.env.MPESA_SECURITY_CRED,
            CommandID: "TransactionStatusQuery",
            TransactionID: code,
            PartyA: process.env.MPESA_SHORTCODE,
            IdentifierType: "4",
            ResultURL: "https://pesacheck-bot.vercel.app/result",
            QueueTimeOutURL: "https://pesacheck-bot.vercel.app/timeout",
            Remarks: "PesaCheck",
            Occasion: "Verify"
          })
        });

        const result = await queryRes.json();
        console.log('M-Pesa:', result);

        if(result.ResponseCode == "0") {
          await bot.sendMessage(chatId, `✅ CODE ${code} imepokelewa. Subiri confirmation kutoka Safaricom (kawaida 30sec). Kama ni SCAM, haitajibu.`);
        } else {
          await bot.sendMessage(chatId, `❌ SCAM ALERT! CODE ${code} haijulikani na Safaricom. Usitume pesa! \nReason: ${result.errorMessage || result.ResponseDescription}`);
        }

      } catch (e) {
        console.error(e);
        // Fallback kama Daraja haipo - check pattern
        if(code.startsWith('QGH') && code.length === 10) {
           await bot.sendMessage(chatId, `⚠️ ${code} inaonekana kama ya kweli (format sawa), lakini Daraja imeshindwa ku-connect. Jaribu tena.`);
        } else {
           await bot.sendMessage(chatId, `❌ ${code} inaonekana SCAM (format sio ya M-Pesa).`);
        }
      }
    }
    else {
      await bot.sendMessage(chatId, 'Tuma CODE ya M-Pesa kama: confirm QGH7K9W2');
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Error:', err.message);
    res.sendStatus(200);
  }
});

app.post('/result', (req, res) => {
  console.log('Daraja Result:', req.body);
  res.sendStatus(200);
});

app.post('/timeout', (req, res) => {
  console.log('Daraja Timeout:', req.body);
  res.sendStatus(200);
});

module.exports = app;
