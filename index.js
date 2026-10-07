const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const app = express();
app.use(express.json());

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MPESA_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_SECRET = process.env.MPESA_CONSUMER_SECRET;
const URL = process.env.RENDER_EXTERNAL_URL || "https://pesacheck-bot.onrender.com";

// ===== DICTIONARIES AS VARIABLES - STEALTH (not shown to user) =====
const shengWords = {
  oza:'sell',kuoza:'sell',uza:'sell',doh:'money',chapaa:'money',pesa:'money',mzinga:'money',
  poa:'cool',sasa:'hi',mambo:'hi',niaje:'hi',wash:'scam',tapeli:'scam',chakula:'food',food:'food',
  kula:'eat',biashara:'business',hustle:'business',bajeti:'budget',budget:'budget'
};
let lastBudget = {}; // store per chat

function getMealPlan(amount){
  const foodBudget = Math.round(amount * 0.6);
  const daily = Math.round(foodBudget / 30);
  return {
    foodBudget, daily,
    plan: `🍲 KES ${amount} - FOOD BREAKDOWN (Nairobi Marikiti prices):

FOOD BUDGET: KES ${foodBudget} (${daily}/day)

📅 DAILY MEAL PLAN - Balanced & Cheap:

🌅 BREAKFAST (50 bob):
• Uji + mandazi OR Chai + 2 chapati
• Cost: 50 x 30 = 1500

☀️ LUNCH (150 bob):
• Githeri / Rice + Beans / Ugali + Sukuma + Mayai
• Cost: 150 x 30 = 4500

🌙 SUPPER (200 bob):
• Ugali + Omena / Matumbo / Maharagwe + Kachumbari
• Fruit: Banana/Avocado
• Cost: 200 x 30 = 6000

🛒 WEEKLY SHOPPING LIST:
• Mchele 5kg: 700
• Maharagwe 3kg: 600
• Mafuta 3L: 900
• Sukuma/Spinach: 300/week
• Mayai tray: 450
• Omena 1kg: 200
• Tomatoes/Kitunguu: 500

💪 NUTRITION STANDARDS MET:
• Protein: Maharagwe/Mayai/Omena daily
• Carbs: Ugali/Rice/Githeri
• Vitamins: Sukuma/Kachumbari/Fruit
• Water: 2L daily

Total Food: ~KES ${foodBudget} - Baki ${amount-foodBudget} for rent/save!

Tip: Nunua wholesale Marikiti Sat morning, pika meal prep Sunday.`
  };
}

async function getDarajaToken(){
  if(!MPESA_KEY||!MPESA_SECRET) return null;
  try{
    const auth = Buffer.from(`${MPESA_KEY}:${MPESA_SECRET}`).toString('base64');
    const r = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',{headers:{Authorization:`Basic ${auth}`},timeout:3000});
    return r.data.access_token;
  }catch(e){ return null; }
}

const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${URL}/bot${TOKEN}`);
app.post(`/bot${TOKEN}`, (req,res)=>{ bot.processUpdate(req.body); res.sendStatus(200); });

bot.on('message', async (msg)=>{
  const raw = msg.text || "";
  const t = raw.toLowerCase();
  const chatId = msg.chat.id;
  const amount = parseInt(t.replace(/[^0-9]/g,""));
  const code = (raw.match(/\b[A-Z0-9]{8,12}\b/)||[])[0];

  // Check intent using stealth dictionaries
  let intent='unknown';
  if(t.match(/^(hi|poa|sasa|mambo)/)) intent='greeting';
  else if(t.match(/oza|uza|hustle|biashara|sell/)) intent='selling';
  else if(code || t.match(/confirmed.*kes|mpesa|scam|wash|tapeli/)) intent='scam';
  else if(t.match(/breakdown|food to eat|daily|meal plan|standards/)) intent='food_breakdown';
  else if(amount>=50 && t.match(/food|chakula|kula|meal|bajeti/)) intent='food';
  else if(amount>=50) intent='budget';

  try{
    if(intent==='greeting'){
      return await bot.sendMessage(chatId, `Poa! 🔥 Niko rada 24/7\n\n• Tuma M-Pesa SMS ni-check\n• "20k kuoza" → biashara ideas\n• "20k food" → full meal plan`);
    }
    if(intent==='selling' && amount){
      lastBudget[chatId]=amount;
      return await bot.sendMessage(chatId, `🔥 BIASHARA KES ${amount}:\n\n1. Mitumba Gikomba ${Math.round(amount*0.6)} - faida 80%\n2. Mayai & Smokies trolley ${Math.round(amount*0.3)}\n3. M-Pesa float ${Math.round(amount*0.5)}\n\nChagua 1 nikupee plan!`);
    }
    if(intent==='scam' && code){
      await bot.sendMessage(chatId, `🔍 Checking ${code}...`);
      const token = await getDarajaToken();
      const real = /^[A-Z]{2,4}\d+[A-Z0-9]{2,}/.test(code);
      return await bot.sendMessage(chatId, `${real?'✅':'⚠️'} CODE: ${code}\n${real?'Format REAL ✅':'Suspicious ⚠️'}\n${token?'Daraja: Connected ✅':'Forward full SMS'}`);
    }
    if(intent==='food_breakdown'){
      const amt = amount || lastBudget[chatId] || 20000;
      lastBudget[chatId]=amt;
      const m = getMealPlan(amt);
      return await bot.sendMessage(chatId, m.plan);
    }
    if(intent==='food' && amount){
      lastBudget[chatId]=amount;
      const m = getMealPlan(amount);
      return await bot.sendMessage(chatId, m.plan);
    }
    if(intent==='budget' && amount){
      lastBudget[chatId]=amount;
      return await bot.sendMessage(chatId, `💰 BUDGET KES ${amount}:\n✅ NEEDS 50%: ${Math.round(amount*0.5)}\n😎 WANTS 30%: ${Math.round(amount*0.3)}\n🔒 SAVE 20%: ${Math.round(amount*0.2)}\n\nReply "breakdown" for daily food plan + what to eat everyday.`);
    }
    // Follow-up without amount - use last budget
    if(t.match(/breakdown|properly|every day/)){
      const amt = lastBudget[chatId] || 20000;
      const m = getMealPlan(amt);
      return await bot.sendMessage(chatId, m.plan);
    }
    return await bot.sendMessage(chatId, `Niko 24/7 😊\n• "20k food" → full meal plan daily\n• "20k kuoza" → biashara\n• Tuma M-Pesa CODE`);
  }catch(e){
    console.log(e.message);
    try{ await bot.sendMessage(chatId, `Poa! Tuma "20000 food" nikupe daily meal plan.`); }catch{}
  }
});

app.get('/', (req,res)=>res.send(`V25 SMART BUDGET LIVE - Sheng:${Object.keys(shengWords).length} | Daraja:${MPESA_KEY?'OK':'No'} | 24/7`));
setInterval(()=>{axios.get(URL).catch(()=>{});}, 9*60*1000);
app.listen(process.env.PORT||10000, ()=>console.log('V25 LIVE'));
