const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const app = express(); app.use(express.json());

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const URL = "https://pesacheck-bot.onrender.com";
const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${URL}/bot${TOKEN}`);

app.post(`/bot${TOKEN}`, (req,res)=>{ bot.processUpdate(req.body); res.sendStatus(200); });

bot.on('message', async (msg) => {
  const text = (msg.text||"").toLowerCase().trim();
  const amount = parseInt(text.replace(/[^0-9]/g,""));
  let reply = "";

  // 1. ROLE DESCRIPTION - Most important
  if (text.match(/what do you do|what is pesacheck|unafanya nini|kazi yako|who are you|nani wewe/)) {
    reply = `Mimi ni PesaCheck 🇰🇪 - Your M-Pesa Budget Coach!\n\nMy ONE job:\nTuma amount umepata (e.g. 15000) na nitakugawanyia haraka:\n50% Needs (rent, food)\n30% Wants (bundles, sherehe)\n20% Savings (chama)\n\nI speak: English, Kiswahili & Sheng. Ongea lugha yako!\n\nJaribu: Tuma "20000"`;
  }
  // 2. LANGUAGES
  else if (text.match(/which language|lugha gani|unaongea lugha gani|do you know sheng/)) {
    reply = `Najua 3 lugha za Kenya! 🇰🇪\n\n✅ English - For business\n✅ Kiswahili - Sanifu kabisa\n✅ Sheng - Ya mtaa, rada?\n\nWee ni wa gani? Ongea tu! Na tuma amount nikupe budget.`;
  }
  // 3. BUDGET CORE SERVICE
  else if (amount > 100) {
    const needs = Math.round(amount*0.5);
    const wants = Math.round(amount*0.3);
    const save = Math.round(amount*0.2);
    // Detect language for response
    if (text.match(/sasa|poa|mambo|rada|mzee|doh|ni aje/)) {
      reply = `Sawa mzee! Budget ya KES ${amount}:\n\n✅ NEEDS 50%: ${needs} - Keja, food, fare\n😎 WANTS 30%: ${wants} - Bundles, sherehe\n🔒 SAVE 20%: ${save} - Weka chama!\n\nIko sawa? Tuma ingine!`;
    } else if (text.match(/habari|shikamoo|niaje|vipi/)) {
      reply = `Poa! Bajeti ya KES ${amount}:\n\n✅ MAHITAJI 50%: ${needs}\n😎 MATAMANIO 30%: ${wants}\n🔒 AKIBA 20%: ${save}\n\nUnataka PDF?`;
    } else {
      reply = `💰 PesaCheck Budget for KES ${amount}:\n\n✅ NEEDS 50%: ${needs} - Rent, food, fare\n😎 WANTS 30%: ${wants} - Airtime, entertainment\n🔒 SAVINGS 20%: ${save} - Emergency fund\n\nSend another amount to calculate!`;
    }
  }
  // 4. GREETING
  else if (text.match(/^(hi|hii|hello|hey|mambo|sasa|poa|niaje|habari|salama)$/)) {
    reply = `Poa! Mimi ni PesaCheck - M-Pesa Budget Coach wako! 💰\n\nNiko hapa kukusaidia kupanga pesa.\n\nTuma tu pesa ulipata e.g. "15000" nikupe breakdown ya 50/30/20.\n\nI speak English, Kiswahili & Sheng!`;
  }
  // 5. FALLBACK - Never fail, always guide to service
  else {
    reply = `Nimekuelewa! 👍\n\nKama PesaCheck, kazi yangu ni kukupangia budget.\n\nTuma tu amount kama "15000" na nitakugawanyia:\n50% Needs | 30% Wants | 20% Savings\n\nAu uliza "what do you do" nikujieleze zaidi!`;
  }

  await bot.sendMessage(msg.chat.id, reply);
});

app.get('/', (req,res)=>res.send('PesaCheck V12 Live - 3 Lang Budget Coach'));
app.listen(process.env.PORT||10000, ()=>console.log("V12 Live - Role + 3 Langs + Budget"));
