const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const URL = "https://pesacheck-bot.onrender.com";

const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${URL}/bot${TOKEN}`);

function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

const RESPONSES = {
  greeting: ["Poa sana mzee! Niko fiti! Pesa iko aje? 💰","Heyy! I'm good! What's good? Need budget help? 💸","Mambo! Niko rada! Unataka nikusaidie na doh? 😂"],
  what: ["Mimi ni PesaCheck! Najua budget, saving, side hustle - English, Kiswahili & Sheng! 💰","I'm your money plug! Budget, save, make more doh! Multilingual! 🚀","Mzee, mimi ni boy wa pesa! Nakujenga na pesa, budget, savings! 💸"],
  lang: ["I know 3! English, Kiswahili, and Sheng! You can talk any! 😎","Najua English, Swahili na Sheng! Ongea ile unapenda! 💬","English ✅ Kiswahili ✅ Sheng ✅ - Chagua lugha!"],
  money: ["Poa! About pesa - budget, saving, ama hustle? Niko na tricks! 💰","Money talk? 50/30/20 rule is fire! Unatumia pesa aje? 💸"],
  def: ["Sawa mzee! Unataka nikusaidie na nini about pesa? Budget ama saving? 💰","Poa! Tell me how I can sort your wallet today? 😎"]
};

app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.on('message', async (msg) => {
  const t = (msg.text || "").toLowerCase().trim();
  let reply;

  // Check in RIGHT order - specific first, greeting LAST
  if (t.match(/which language|what language|unajua lugha gani|lugha gani/)) {
    reply = random(RESPONSES.lang);
  } else if (t.match(/what do you do|what can you do|unafanya nini|kazi yako/)) {
    reply = random(RESPONSES.what);
  } else if (t.match(/pesa|money|budget|save|loan|doh|hustle|biz/)) {
    reply = random(RESPONSES.money);
  } else if (t.match(/^(hi|hii|hiii|hello|hey|yo|mambo|sasa|oyaa|poa|niaje)$/) || t.match(/^(mambo|poa|sasa)/)) {
    reply = random(RESPONSES.greeting);
  } else {
    reply = random(RESPONSES.def);
  }

  await bot.sendMessage(msg.chat.id, reply);
});

app.get('/', (req, res) => res.send('PesaCheck V9 Live'));

app.listen(process.env.PORT || 10000, () => console.log("V9 Live - Fixed hi bug"));
