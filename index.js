const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const app = express();
app.use(express.json());

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MPESA_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_SECRET = process.env.MPESA_CONSUMER_SECRET;
const URL = process.env.RENDER_EXTERNAL_URL || "https://pesacheck-bot.onrender.com";

const shengWords = {
  oza:1, kuoza:1, uza:1, doh:1, chapaa:1, pesa:1, mzinga:1,
  poa:1, sasa:1, mambo:1, niaje:1, wash:1, tapeli:1,
  chakula:1, food:1, kula:1, biashara:1, hustle:1, bajeti:1, budget:1
};

let lastBudget = {};

function getMealPlan(amount){
  const foodBudget = Math.round(amount * 0.6);
  const daily = Math.round(foodBudget / 30);
  return `🍲 KES ${amount} - FULL DAILY FOOD PLAN:

FOOD BUDGET: KES ${foodBudget} = KES ${daily}/day

🌅 BREAKFAST (60 bob):
- Uji + mandazi 2 / Chai + chapati 2 + mayai

☀️ LUNCH (150 bob):
- Mon: Githeri + avocado
- Tue: Rice + beans + kachumbari
- Wed: Ugali + sukuma + mayai
- Thu: Chapati + ndengu
- Fri: Pilau kachumbari
- Weekend: Rice + omena

🌙 SUPPER (200 bob):
- Ugali + matumbo/omena/maharagwe + greens + banana

🛒 WEEKLY SHOPPING (Marikiti Sat):
Mchele 5kg 700, Maharagwe 3kg 600, Mafuta 3L 900, Sukuma 300, Mayai tray 450, Omena 1kg 200, Nyanya/Kitunguu 500

✅ MEETS STANDARDS: Protein daily, Carbs, Vitamins, 2L water.
Baki KES ${amount-foodBudget} for rent/save.`;
}

async function getDarajaToken(){
  if(!MPESA_KEY ||!MPESA_SECRET) return null;
  try{
    const auth = Buffer.from(`${MPESA_KEY}:${MPESA_SECRET}`).toString('base64');
    const r = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',{
      headers:{ Authorization:`Basic ${auth}` },
      timeout:3000
    });
    return r.data.access_token;
  }catch(e){ return null; }
}

const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${URL}/bot${TOKEN}`);

app.post(`/bot${TOKEN}`, (req,res)=>{
  res.sendStatus(200);
  bot.processUpdate(req.body);
});

bot.on('message', async (msg)=>{
  const raw = msg.text || "";
  const t = raw.toLowerCase().trim();
  const chatId = msg.chat.id;
  const amount = parseInt(t.replace(/[^0-9]/g,""));
  const code = (raw.match(/\b[A-Z0-9]{8,12}\b/) || [])[0];

  let intent='unknown';
  if(t.match(/^(h+i+|hello|hey|poa|sasa|mambo|niaje)$/)) intent='greeting';
  else if(t.match(/oza|uza|hustle|biashara|sell|kuoza/)) intent='selling';
  else if(code || t.match(/confirmed.*kes|mpesa|scam|wash|tapeli/)) intent='scam';
  else if(t.match(/breakdown|food to eat|meal plan|every day|standards|properly/)) intent='food_breakdown';
  else if(amount>=50 && t.match(/food|chakula|kula|meal/)) intent='food';
  else if(amount>=50) intent='budget';

  try{
    if(intent==='greeting'){
      return await bot.sendMessage(chatId, `Mambo! 👋\n\nTuma M-Pesa CODE ni-check, au andika kama "20k food" / "20k kuoza"`);
    }

    if(intent==='selling' && amount){
      lastBudget[chatId]=amount;
      return await bot.sendMessage(chatId, `🔥 Na KES ${amount}:\n\n1. Mitumba Gikomba ${Math.round(amount*0.6)} - faida 80%\n2. Mayai + Smokies trolley ${Math.round(amount*0.3)} - KES 800 daily\n3. M-Pesa float ${Math.round(amount*0.5)}\n\nChagua 1 nikupee full plan!`);
    }
    if(intent==='selling'){
      return await bot.sendMessage(chatId, `Unataka kuoza! Uko na capital ngapi? Tuma kama "nina 15k"`);
    }

    if(intent==='scam'){
      if(code){
        await bot.sendMessage(chatId, `🔍 Checking ${code}...`);
        const token = await getDarajaToken();
        const isRealFormat = /^[A-Z]{2,4}\d+[A-Z0-9]{2,}/.test(code);
        return await bot.sendMessage(chatId, `${isRealFormat?'✅ Format REAL':'⚠️ Ina-kaa fake'}: ${code}\n${token?'Daraja Connected ✅':'Tuma full SMS pia'}\n\nNote: Safaricom haina 07xx kwa M-Pesa.`);
      }
      return await bot.sendMessage(chatId, `Tuma full M-Pesa SMS hapa ni-check kama ni tapeli.`);
    }

    if(intent==='food_breakdown' || intent==='food'){
      const amt = amount || lastBudget[chatId] || 20000;
      lastBudget[chatId]=amt;
      return await bot.sendMessage(chatId, getMealPlan(amt));
    }

    if(intent==='budget' && amount){
      lastBudget[chatId]=amount;
      return await bot.sendMessage(chatId, `💰 KES ${amount} BUDGET:\n✅ NEEDS 50%: ${Math.round(amount*0.5)}\n😎 WANTS 30%: ${Math.round(amount*0.3)}\n🔒 SAVE 20%: ${Math.round(amount*0.2)}\n\nAndika "breakdown" nikupe chakula cha kila siku na bei ya Marikiti.`);
    }

    if(lastBudget[chatId] && t.match(/breakdown|nipe/)){
      return await bot.sendMessage(chatId, getMealPlan(lastBudget[chatId]));
    }

    return await bot.sendMessage(chatId, `Niko 24/7 😊\n• Tuma M-Pesa CODE\n• "20k food" - meal plan\n• "20k kuoza" - biashara`);

  }catch(e){
    console.log(e.message);
  }
});

app.get('/', (req,res)=>res.send(`V30 LEGIT LIVE - Two ticks fixed ✅ | Daraja:${MPESA_KEY?'OK':'No'} | 24/7`));
setInterval(()=>{ axios.get(URL).catch(()=>{}); }, 9*60*1000);
app.listen(process.env.PORT||10000, ()=>console.log('V30 LIVE'));
