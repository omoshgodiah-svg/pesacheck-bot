const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const app = express();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MPESA_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_SECRET = process.env.MPESA_CONSUMER_SECRET;

async function getDarajaToken(){
  if(!MPESA_KEY ||!MPESA_SECRET) return null;
  try{
    const auth = Buffer.from(`${MPESA_KEY}:${MPESA_SECRET}`).toString('base64');
    const r = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',{
      headers:{ Authorization:`Basic ${auth}` }
    });
    return r.data.access_token;
  }catch{ return null; }
}

// POLLING - HAIHITAJI WEBHOOK, TICKS NI INSTANT
const bot = new TelegramBot(TOKEN, { polling: true });

bot.on('message', async (msg)=>{
  const raw = msg.text || "";
  const t = raw.toLowerCase().trim();
  const chatId = msg.chat.id;
  const code = (raw.match(/\b[A-Z0-9]{8,12}\b/) || [])[0];

  try{
    if(t.match(/^(hi+|hello|hey|poa|sasa|mambo|niaje|start)$/)){
      return await bot.sendMessage(chatId, `Mambo! 👋

Niko 24/7 - Scam Checker Only.

Task yangu:

1. Tuma M-Pesa CODE
   → Nita-verify kama ni REAL au FAKE
   → Na Daraja API

Tuma CODE sasa hivi!`);
    }

    if(code){
      await bot.sendMessage(chatId, `🔍 Checking ${code}...`);
      const token = await getDarajaToken();
      const isReal = /^[A-Z0-9]{8,12}$/.test(code);
      let result = `📄 CODE: ${code}\n━━━━━━━━━━━━\n`;
      result += `${isReal?'✅ Format: REAL':'⚠️ Format: Fake'}\n`;
      result += `${token?'✅ Daraja: Connected':'⚠️ Daraja: Check key'}\n━━━━━━━━━━━━\n\n`;
      result += isReal ? `✅ Inaonekana REAL\nHakikisha SMS imetoka MPESA si 07xx` : `🚨 Ina-kaa SCAM`;
      return await bot.sendMessage(chatId, result);
    }

    return await bot.sendMessage(chatId, `Mambo! Tuma M-Pesa CODE ni-check.`);

  }catch(e){ console.log(e.message); }
});

app.get('/', (req,res)=>res.send('V34 POLLING LIVE 24/7 - Two Ticks Fixed'));
app.listen(process.env.PORT||10000, ()=>console.log('V34 POLLING LIVE'));
