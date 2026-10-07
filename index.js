const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

app.get('/', (req, res) => res.send('PesaCheck V7 ULTIMATE Live - No Groq'));

function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

const RESPONSES = {
  greeting: {
    en: ["Heyy! I'm good! What's good with you? Need help with budget? 💸", "Yo! PesaCheck here! Ready to sort your money? 💰", "Helloo! Niko poa! How can I help with your cash? 🙏"],
    sw: ["Poa sana mzee! Niko fiti! Pesa iko aje? 💰", "Mambo! Niko rada! Unataka nikusaidie na doh? 😂", "Sasa! Niko poa! Tuongee pesa! 💸"]
  },
  what_do_you_do: [
    "Mimi ni PesaCheck! Najua ku-budget, ku-save, na kukupa ideas za side hustle - English ama Kiswahili, both! 💰",
    "I'm your money plug! I help you budget, save, and make more doh! I speak English, Kiswahili & Sheng! 🚀",
    "Mzee, mimi ni boy wa pesa! Nakujenga na pesa, budget, savings, na business ideas! Multilingual! 💸"
  ],
  languages: [
    "I know 3! English, Kiswahili, and Sheng! You can talk to me in any, I match your vibe! 😎",
    "Najua English, Swahili na Sheng! Ongea ile unapenda, mimi niko sawa! 💬",
    "English ✅ Kiswahili ✅ Sheng ✅ - Chagua lugha, mimi niko rada!"
  ],
  money: [
    "Poa! About pesa - unataka budgeting, saving, ama side hustle idea? Niko na tricks mob! 💰",
    "Money talk? Sawa! Tell me - you want to save, budget, or make more? I got you! 💸",
    "Doh maneno! Best trick ni 50/30/20 rule. Unatumia pesa aje? Niambie nikujenge! 🙏"
  ],
  default: [
    "Sawa mzee, nimeskia! About pesa, unataka nikusaidie na nini exactly? Budget ama saving? 💰",
    "Poa! Elaborate kidogo about pesa - niko hapa kukusort! 😎",
    "Haha sawa! But let's talk money - how can PesaCheck help your wallet today? 💸"
  ]
};

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const textRaw = (msg.text || "").trim();
  const text = textRaw.toLowerCase();
  if (!text) return;

  let reply;

  if (["hii","hiii","hi","hello","hey","yo","mambo","sasa","oyaa","poa","niaje","rada"].some(w => text.includes(w))) {
    if (["mambo","sasa","poa","niaje"].some(w => text.includes(w))) reply = random(RESPONSES.greeting.sw);
    else reply = random(RESPONSES.greeting.en);
    // special if just "hiii" alone
    if (text.length <= 5) reply = random(RESPONSES.greeting.en) + " " + random(["What do you need?","Need budget help?"]);
  }
  else if (text.includes("what do you do") || text.includes("what can you do") || text.includes("unafanya nini")) {
    reply = random(RESPONSES.what_do_you_do);
  }
  else if (text.includes("language") || text.includes("lugha") || text.includes("kiswahili") || text.includes("sheng")) {
    reply = random(RESPONSES.languages);
  }
  else if (text.includes("pesa") || text.includes("money") || text.includes("budget") || text.includes("save") || text.includes("loan") || text.includes("doh") || text.includes("biz") || text.includes("hustle")) {
    reply = random(RESPONSES.money);
  }
  else {
    reply = random(RESPONSES.default);
  }

  await bot.sendMessage(chatId, reply);
  console.log(`Handled: ${textRaw} -> ${reply}`);
});

app.listen(process.env.PORT || 10000, () => console.log("V7 ULTIMATE Live - No Groq needed!"));
