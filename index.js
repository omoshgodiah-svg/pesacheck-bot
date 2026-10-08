const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const app = express();

function checkScams(text) {
  let t = text.toUpperCase();
  let scams = [];

  // 1. Fake M-Pesa - lazima ianze na code na "Confirmed"
  if (!t.includes("CONFIRMED") || !t.includes("M-PESA") && !t.includes("MPESA")) {
    scams.push("1. Fake SMS: Hii si SMS ya M-Pesa original (hakuna 'Confirmed')");
  }
  // 2. Wrong number reverse scam
  if (t.includes("REVERSE") || t.includes("RUDISHIA") || t.includes("WRONG NUMBER")) {
    scams.push("2. Reverse Scam: Anataka urudishe pesa - usitume bila ku-check balance *334#");
  }
  // 3. Paybill/Till fake
  if (t.includes("PAYBILL") || t.includes("TILL") || t.includes("BUY GOODS")) {
    if (!/^\w{10}\s+Confirmed/.test(text)) scams.push("3. Paybill Check: Hakikisha Till/Paybill number ni ya kampuni legit - call Safaricom");
  }
  // 4. Fuliza / Loan link
  if (t.includes("FULIZA") && (t.includes("HTTP") || t.includes("WWW") || t.includes("CLICK"))) {
    scams.push("4. Fuliza Scam: Safaricom HAI-tumi link - ni SCAM!");
  }
  // 5. Wash wash / Prize
  if (t.includes("WIN") || t.includes("USHINDI") || t.includes("LOTTERY") || t.includes("CLAIM") && t.includes("SEND")) {
    scams.push("5. Wash Wash: Hakuna kushinda bila kushiriki - usitume pesa!");
  }
  return scams;
}

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";
  if (text.toLowerCase() === "mambo") {
    return bot.sendMessage(chatId, "Poa! Tuma SMS ya M-Pesa hapa nichambue. Usitume PIN yako.");
  }
  const found = checkScams(text);
  if (found.length === 0) {
    bot.sendMessage(chatId, `✅ Inaonekana LEGIT:\n"${text}"\n\nLakini bado check balance yako *334# usiamini SMS peke yake.`);
  } else {
    bot.sendMessage(chatId, `🚨 SCAM DETECTED (${found.length}):\n\n${found.join("\n\n")}\n\nUsitume pesa! Piga 100 au 234.`);
  }
});

app.get("/", (req,res)=> res.send("Bot Live"));
app.listen(process.env.PORT || 10000, () => console.log("PesaCheck Legit Bot Started"));
