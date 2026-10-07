const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const app = express();
app.use(express.json());

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const URL = "https://pesacheck-bot.onrender.com";
const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${URL}/bot${TOKEN}`);

app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.on('message', async (msg) => {
  const rawText = msg.text || "";
  const t = rawText.toLowerCase().trim();
  const amount = parseInt(t.replace(/[^0-9]/g, ""));
  let reply = "";

  // --- 1. PURPOSE / ROLE - THE MAIN OBJECTIVE ---
  if (t.match(/what do you do|what is pesacheck|purpose|objective|unafanya nini|kazi yako|who are you|nani wewe|about/)) {
    reply = `Karibu PesaCheck! 🛡️🇰🇪\n\n**MAIN PURPOSE:**\nMimi ni bot wa ku-check kama message ya M-Pesa / bank / job ni SCAM ama LEGIT. Kenya kuna matapeli wengi!\n\n**JINSI NA WORK:**\nForward tu ile SMS umeshuku hapa, nitai-analyze na nikupe jibu haraka: 🚨 SCAM au ✅ LEGIT + sababu.\n\n**LUGHA NAJUA (3 Languages):**\n✅ English\n✅ Kiswahili Sanifu\n✅ Sheng ya mtaa\n\n**BONUS FEATURE:**\nTuma amount kama "15000" nikupe budget ya 50/30/20 au food budget.\n\nJaribu sasa: Forward SMS moja umeshuku!`;
  }
  // --- 2. LANGUAGES DISPLAY ---
  else if (t.match(/which language|lugha gani|unajua lugha|do you speak|sheng|swahili/)) {
    reply = `PesaCheck inaongea lugha 3 za Kenya! 🔥\n\n1. **English:** "Hello, I can help you check if that M-Pesa message is a scam."\n2. **Kiswahili:** "Habari, naweza kukagua kama ujumbe wa M-Pesa ni tapeli."\n3. **Sheng:** "Poa mzee, ni-checkie io SMS kama ni wash wash ama ni legit?"\n\nOngea lugha yako! Kazi yangu kuu ni ku-check scammers.`;
  }
  // --- 3. MAIN SERVICE: SCAM CHECKER ---
  else if (t.length > 25 || t.match(/mpesa|m-pesa|congratulation|umeshinda|won|claim|blocked|pin|verify|kcb|equity|scam|tapeli|wash/)) {
    let isScam = false;
    let reasons = [];

    if (rawText.match(/07\d{8}/) && !rawText.includes("0722000000")) {
      isScam = true; reasons.push("Uses personal 07xx number, not Safaricom official 0722000000 / 234");
    }
    if (t.match(/congratulation|umeshinda|you have won|you won|zawadi|hongera.*umeshinda/)) {
      isScam = true; reasons.push("Fake 'You have WON' / 'Umeshinda' trick");
    }
    if (t.match(/pin|password|share.*pin|tuma.*pin|enter pin/)) {
      isScam = true; reasons.push("Asks for your M-Pesa PIN - Safaricom NEVER asks for PIN");
    }
    if (t.match(/send.*\d+.*to.*get|tuma.*\d+.*upate|lipisha.*upate|claim.*fee/)) {
      isScam = true; reasons.push("Asks you to SEND money to RECEIVE money/job/loan");
    }
    if (t.match(/http|www\.|bit\.ly|tinyurl|click here|bonyeza hapa/)) {
      isScam = true; reasons.push("Contains suspicious link");
    }

    if (isScam) {
      reply = `🚨 **SCAM ALERT! HII NI TAPELI 100%** 🚨\n\nSababu:\n- ${reasons.join("\n- ")}\n\n**USIFANYE HIVI:**\n❌ Usitume pesa\n❌ Usishare PIN\n❌ Usiclick link\n\n**FANYA HIVI:**\n✅ Delete SMS\n✅ Forward to 333 (Safaricom)\n✅ Block number\n\nLeta ingine nikuchambulie?`;
    } else if (t.length > 30) {
      reply = `✅ **Inaonekana LEGIT** but kaa chonjo!\n\nChecks zimepita:\n✓ No PIN request\n✓ No 'send to get' trick\n✓ No fake win\n\nLakini ukiwa na doubt, piga Safaricom 100 au bank yako directly. Usicall number kwa SMS!\n\nUnataka ni-check ingine? Au tuma amount kama "9000" nikupe budget?`;
    } else {
      reply = `Tuma FULL SMS hapa. Copy paste ujumbe wote uliotumiwa, usifupishe. Ndio nitaikagua vizuri.`;
    }
  }
  // --- 4. BONUS SERVICE: BUDGET FEATURE ---
  else if (amount >= 500) {
    if (t.match(/food|chakula|meal|mboga/)) {
      const food = Math.round(amount * 0.6);
      const other = Math.round(amount * 0.25);
      const save = amount - food - other;
      reply = `🍲 **Food Budget for KES ${amount}:**\n\n✅ FOOD 60%: KES ${food} - Unga, mboga, mafuta, maziwa\n✅ OTHER NEEDS 25%: KES ${other} - Fare, bundles\n🔒 SAVINGS 15%: KES ${save} - Akiba\n\nTip: Nunua wholesale Gikomba / Marikiti, pika home. Iko sawa mzee?`;
    } else {
      const needs = Math.round(amount * 0.5);
      const wants = Math.round(amount * 0.3);
      const save = Math.round(amount * 0.2);
      reply = `💰 **PesaCheck Budget for KES ${amount}:**\n\n✅ NEEDS 50%: KES ${needs} - Rent, food, fare\n😎 WANTS 30%: KES ${wants} - Airtime, sherehe\n🔒 SAVINGS 20%: KES ${save} - Chama / Emergency\n\nNa bado niko tayari ku-check SMS za utapeli! Forward moja?`;
    }
  }
  // --- 5. GREETING ---
  else {
    reply = `Poa! Mimi ni **PesaCheck** 🛡️ - M-Pesa Scam Checker wako!\n\n**Nini nafanya?**\nNa-check kama SMS ni tapeli ama legit.\n\n**Tuma:**\n1. Forward SMS umeshuku 👈 MAIN JOB\n2. Au tuma amount kama "10000" kwa budget\n\n**Lugha:** English, Kiswahili, Sheng.\n\nKaribu! Tuma kitu nikuchambulie.`;
  }

  await bot.sendMessage(msg.chat.id, reply, { parse_mode: "Markdown" });
});

app.get('/', (req, res) => res.send('PesaCheck V14 Live - Scam Checker + 3 Langs + Budget'));
app.listen(process.env.PORT || 10000, () => console.log("V14 FINAL LIVE"));
