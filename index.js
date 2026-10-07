const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const app = express();
app.use(express.json());

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const URL = process.env.RENDER_EXTERNAL_URL || process.env.VERCEL_URL;
const MPESA_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_SECRET = process.env.MPESA_CONSUMER_SECRET;

const bot = new TelegramBot(TOKEN);
// Weka webhook - bila polling
if(URL){
  const fullUrl = URL.startsWith('http')? URL : `https://${URL}`;
  bot.setWebHook(`${fullUrl}/bot${TOKEN}`).then(()=>console.log('Webhook set')).catch(console.log);
}

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

bot.on('message', async (msg)=>{
  const raw = msg.text || "";
  const t = raw.toLowerCase().trim();
  const chatId = msg.chat.id;
  const code = (raw.match(/\b[A-Z0-9]{8,12}\b/) || [])[0];

  try{
    if(t.match(/^(hi+|hello|hey|poa|sasa|mambo|niaje|start)$/)){
      return await bot.sendMessage(chatId, `Mambo! 👋\n\nNiko 24/7 - Scam Checker Only.\n\nTuma M-Pesa CODE ni-verify!`);
    }
    if(code){
      await bot.sendMessage(chatId, `🔍 Checking ${code}...`);
      const token = await getDarajaToken();
      const isReal = /^[A-Z0-9]{8,12}$/.test(code);
      let result = `📄 CODE: ${code}\n━━━━━━━━━━━━\n`;
      result += `${isReal?'✅ Format: REAL':'⚠️ Format: Fake'}\n`;
      result += `${token?'✅ Daraja: Connected':'⚠️ Daraja: Check key'}\n━━━━━━━━━━━━\n`;
      result += isReal? `\n✅ Inaonekana REAL` : `\n🚨 Ina-kaa SCAM`;
      return await bot.sendMessage(chatId, result);
    }
    return await bot.sendMessage(chatId, `Mambo! Tuma M-Pesa CODE ni-check.`);
  }catch(e){ console.log(e.message); }
});

// Hii ndio muhimu - instant 200 = two ticks
app.post(`/bot${TOKEN}`, (req,res)=>{
  res.status(200).send('OK');
  bot.processUpdate(req.body);
});

app.get('/', (req,res)=>res.send('PesaCHECK LIVE - Webhook Mode'));

module.exports = app;
app.listen(process.env.PORT || 3000);
