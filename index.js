function checkScams(text) {
  let t = text.toUpperCase().trim();
  let scams = [];

  // Kama ni Transaction ID peke yake (kama QRTUYF5) - usimwite scam
  if (/^[A-Z0-9]{10}$/.test(t)) {
    return []; // Ni code tu, si SMS
  }

  // 1. Fake M-Pesa - check tu kama ujumbe ni mrefu
  if (t.length > 20 && !t.includes("CONFIRMED")) {
    scams.push("1. Fake SMS: Hii si SMS ya M-Pesa original (hakuna 'Confirmed')");
  }
  // 2. Reverse scam
  if (t.includes("REVERSE") || t.includes("RUDISHIA") || t.includes("WRONG NUMBER") || t.includes("NIMETUMIA VIBAYA")) {
    scams.push("2. Reverse Scam: Anataka urudishe - check balance *334# kwanza");
  }
  // 3. Fake Paybill/Till
  if (t.includes("PAYBILL") && t.includes("ACCOUNT") && t.length < 30) {
    scams.push("3. Paybill Check: Thibitisha number kwa Safaricom 100");
  }
  // 4. Fuliza with link
  if (t.includes("FULIZA") && (t.includes("HTTP") || t.includes("CLICK") || t.includes("BONUS"))) {
    scams.push("4. Fuliza Scam: Safaricom haitumi link!");
  }
  // 5. Wash wash / Prize
  if ((t.includes("WIN") || t.includes("USHINDI")) && (t.includes("SEND") || t.includes("TUMA"))) {
    scams.push("5. Wash Wash: Hakuna ushindi bila bahati nasibu!");
  }
  return scams;
}

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";
  
  if (/^[A-Z0-9]{10}$/.test(text.trim().toUpperCase())) {
    return bot.sendMessage(chatId, `✅ Code ${text.toUpperCase()} inaonekana kama M-Pesa Transaction ID halisi.\n\nFormat iko sawa (herufi 10). Kama unataka ni-check SMS mzima, tuma SMS yote.`);
  }

  if (text.toLowerCase() === "mambo") {
    return bot.sendMessage(chatId, "Poa! Tuma code kama QRTUYF5 ama SMS yote nichambue.");
  }

  const found = checkScams(text);
  if (found.length === 0) {
    bot.sendMessage(chatId, `✅ LEGIT:\n"${text}"\n\nHakuna scam kati ya hizo 5.`);
  } else {
    bot.sendMessage(chatId, `🚨 SCAM DETECTED (${found.length}):\n\n${found.join("\n\n")}\n\nUsitume pesa! Piga 100`);
  }
});
