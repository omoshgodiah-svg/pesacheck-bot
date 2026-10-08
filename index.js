const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const token = process.env.BOT_TOKEN;
if (!token) {
  console.log("BOT_TOKEN missing!");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const app = express();

function checkScams(text) {
  let t = text.toUpperCase().trim();
  let scams = [];
  if (/^[A-Z0-9]{10}$/.test(t)) return [];
  if (t.length > 20 && !t.includes("CONFIRMED")) {
    scams.push("1. Fake SMS: Hii si SMS ya M-Pesa original (hakuna 'Confirmed')");
  }
  if (t.includes("REVERSE") || t.includes("RUDISHIA") || t.includes("WRONG NUMBER") || t.includes("NIMETUMIA VIBAYA")) {
    scams.push("2. Reverse Scam: Anataka urudishe - check *334#");
  }
  if (t.includes("PAYBILL") && t.length < 100 && !t.includes("CONFIRMED")) {
    scams.push("3. Paybill Check: Thibitisha number 100");
  }
  if (t.includes("FULIZA") && (t.includes("HTTP") || t.includes("CLICK") || t.includes("BONUS"))) {
    scams.push("4. Fuliza Scam: Safaricom haitumi link!");
  }
  if ((t.includes("WIN") || t.includes("USHINDI") || t.includes("LOTTERY")) && (t.includes("SEND") || t.includes("TUMA"))) {
    scams.push("5. Wash Wash: Hakuna ushindi bila kushiriki!");
  }
  return scams;
}

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";
  
  if (/^[A-Z0-9]{10}$/.test(text.trim().toUpperCase())) {
    return bot.sendMessage(chatId, `✅ Code ${text.toUpperCase()} inaonekana kama M-Pesa Transaction ID halisi.\n\nFormat iko sawa. Tuma SMS mzima kama unataka check zaidi.`);
  }

  if (text.toLowerCase() === "mambo") {
    return bot.sendMessage(chatId, "Poa! Tuma code kama QRTUYF5 ama SMS yote nichambue hizo 5 scams.");
  }

  const found = checkScams(text);
  if (found.length === 0) {
    bot.sendMessage(chatId, `✅ LEGIT:\n"${text}"\n\nHakuna scam kati ya hizo 5.`);
  } else {
    bot.sendMessage(chatId, `🚨 SCAM DETECTED (${found.length}):\n\n${found.join("\n\n")}\n\nUsitume pesa! Piga 100`);
  }
});

app.get("/", (req,res)=> res.send("PesaCheck Live - 5 scams check active"));
app.listen(process.env.PORT || 10000, () => console.log("PesaCheck Legit Bot Started"));
