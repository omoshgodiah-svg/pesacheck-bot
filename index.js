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
  greeting: {
    en: ["Heyy! I'm good! What's good? Need budget help? 💸", "Yo! PesaCheck here! Ready to sort your money? 💰", "Helloo! Niko poa! How can I help with cash? 🙏"],
    sw: ["Poa sana mzee! Niko fiti! Pesa iko aje? 💰", "Mambo! Niko rada! Unataka nikusaidie na doh? 😂", "Sasa! Niko poa! Tuongee pesa! 💸"]
  },
  what: ["Mimi ni PesaCheck! Najua budget, saving, side hustle - English, Kiswahili & Sheng! 💰","I'm your money plug! Budget, save, make more doh! Multilingual! 🚀"],
  lang: ["I know 3! English, Kiswahili, Sheng! Ongea any! 😎","Najua English, Swahili na Sheng! Chagua lugha! 💬"],
  money: ["Poa! About pesa - budget, saving, ama hustle? Niko na tricks! 💰","Money talk? 50/30/20 rule is fire! Unatumia pesa aje? 💸"],
  def: ["Sawa mzee, nimeskia! Unataka nikusaidie na nini about pesa? 💰","Poa! Elaborate kidogo, niko hapa! 😎"]
};

app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.on('message', async (msg) => {
  const text = (msg.text || "").toLowerCase();
  let reply;
  if (["hii","hi","hello","mambo","sasa","oyaa","poa"].some(w=>text.includes(w))) {
    reply = text.match(/mambo|sasa|poa/) ? random(RESPONSES.greeting.sw) : random(RESPONSES.greeting.en);
  } else if (text.includes("what do you do") || text.includes("unafanya")) {
    reply = random(RESPONSES.what);
  } else if (text.includes("language") || text.includes("lugha")) {
    reply = random(RESPONSES.lang);
  } else if (["pesa","money","budget","save","loan","doh"].some(w=>text.includes(w))) {
    reply = random(RESPONSES.money);
  } else {
    reply = random(RESPONSES.def);
  }
  await bot.sendMessage(msg.chat.id, reply);
});

app.get('/', (req, res) => res.send('PesaCheck V8 WEBHOOK Live'));

app.listen(process.env.PORT || 10000, () => console.log("V8 WEBHOOK Live"));
