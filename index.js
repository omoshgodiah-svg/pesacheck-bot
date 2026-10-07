const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const app = express(); app.use(express.json());

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const URL = "https://pesacheck-bot.onrender.com";
const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${URL}/bot${TOKEN}`);

app.post(`/bot${TOKEN}`, (req,res)=>{ bot.processUpdate(req.body); res.sendStatus(200); });

bot.on('message', async (msg) => {
  const t = (msg.text||"").toLowerCase();
  const amount = parseInt(t.replace(/[^0-9]/g,""));

  if (t.match(/^(hi|hello|mambo|sasa|poa)/)) {
    await bot.sendMessage(msg.chat.id, `Poa mzee! I'm PesaCheck - Your M-Pesa Budget Coach 💰\n\nTuma tu amount umepata e.g. "15000" na nitakugawanyia 50/30/20 papo hapo!\n\n50% Needs | 30% Wants | 20% Savings`);
  } else if (amount > 0) {
    const needs = Math.round(amount*0.5);
    const wants = Math.round(amount*0.3);
    const save = Math.round(amount*0.2);
    await bot.sendMessage(msg.chat.id, `💰 PesaCheck for KES ${amount}:\n\n✅ NEEDS (50%): ${needs} - Rent, food, fare\n😎 WANTS (30%): ${wants} - Airtime, sherehe, eating out\n🔒 SAVINGS (20%): ${save} - Chama, emergency\n\nNiko sawa? Want PDF ya hii budget?`);
  } else {
    await bot.sendMessage(msg.chat.id, `Niko! Tuma tu amount e.g. "20000" ni-breakdown budget yako. That's my ONE job for now! 💸`);
  }
});

app.get('/', (req,res)=>res.send('PesaCheck V11 Budget Coach Live'));
app.listen(process.env.PORT||10000, ()=>console.log("V11 SINGLE SERVICE LIVE"));
