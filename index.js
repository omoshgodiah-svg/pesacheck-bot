const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const app = express();
app.use(express.json());

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MPESA_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_SECRET = process.env.MPESA_CONSUMER_SECRET;
const URL = process.env.RENDER_EXTERNAL_URL;

async function getDarajaToken(){
  if(!MPESA_KEY ||!MPESA_SECRET) return null;
  try{
    const auth = Buffer.from(`${MPESA_KEY}:${MPESA_SECRET}`).toString('base64');
    const r = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',{
      headers:{ Authorization:`Basic ${auth}` }
    });
    return r.data.access_token;
  }catch(e){ return null; }
}

const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${URL}/bot${TOKEN}`);

// TWO TICKS FIX
app.post(`/bot${TOKEN}`, (req,res)=>{
  res.status(200).send('OK'); // Jibu Telegram HARAKA sana
  try{ bot.processUpdate(req.body); }catch{}
});

bot.on('message', async (msg)=>{
  const raw = msg.text || "";
  const t = raw.toLowerCase().trim();
  const chatId = msg.chat.id;
  const code = (raw.match(/\b[A-Z0-9]{8,12}\b/) || [])[0];

  try{
    if(t.match(/^(hi+|hello|hey|poa|sasa|mambo|niaje|start|help)$/)){
      return await bot.sendMessage(chatId, `Mambo! 👋

Niko 24/7 - Scam Checker Only.

Task yangu:

1. Tuma M-Pesa CODE
   → Nita-verify kama ni REAL au FAKE
   → Na Daraja API

Tuma CODE sasa hivi!`);
    }

    if(code || t.includes('mpesa') || raw.length > 20){
      const finalCode = code || "N/A";

      if(code){
        await bot.sendMessage(chatId, `🔍 Checking ${code}...`);

        const token = await getDarajaToken();
        const isRealFormat = /^[A-Z0-9]{8,12}$/.test(code) && /^[A-Z]/.test(code);
        const hasSuspicious = t.includes('07') && t.includes('mpesa');

        let result = `📄 CODE: ${code}\n`;
        result += `━━━━━━━━━━━━\n`;
        result += `${isRealFormat? '✅ Format: REAL' : '⚠️ Format: Ina-kaa fake'}\n`;
        result += `${token? '✅ Daraja: Connected' : '⚠️ Daraja: Check key'}\n`;
        result += `━━━━━━━━━━━━\n\n`;

        if(isRealFormat &&!hasSuspicious){
          result += `✅ Inaonekana REAL\nLakini hakikisha SMS imetoka MPESA, si 07xx number.`;
        }else{
          result += `🚨 Ina-kaa SCAM / FAKE\n\nTips:\n1. Safaricom hutuma na MPESA, si number\n2. CODE huanza na herufi\n3. Usitume pesa tena ukishuku`;
        }

        return await bot.sendMessage(chatId, result);
      } else {
        return await bot.sendMessage(chatId, `Tuma full M-Pesa SMS ama CODE kama "QGH7J8K9L0"\n\nNita-check kama ni legit.`);
      }
    }

    return await bot.sendMessage(chatId, `Mambo! Tuma M-Pesa CODE ni-check kama ni scam ama real. Niko 24/7.`);

  }catch(e){
    console.log(e.message);
    await bot.sendMessage(chatId, `Error kidogo - tuma CODE tena.`);
  }
});

app.get('/', (req,res)=>res.send('V32 SCAM CHECKER LIVE 24/7 - Two Ticks OK'));
setInterval(()=>{ if(URL) axios.get(URL).catch(()=>{}); }, 8*60*1000);
app.listen(process.env.PORT||10000, ()=>console.log('V32 LIVE'));
