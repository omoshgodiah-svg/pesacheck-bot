const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('PesaCheck Bot is Live - 24/7'));
app.listen(PORT, () => console.log(`Server on ${PORT}`));

// /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 
`👋 Karibu PesaCheck!

Mimi ni bot wa kukufunza kutambua SMS fake za M-Pesa Kenya.

📋 *Tuma hapa ujumbe uliotumiwa* (copy paste SMS yote) nami nitaichambua.

Example:
"QTD... Confirmed. You have received Ksh 2,000 from JOHN DOE..."

⚠️ Mimi SIOMBI PIN, CODE, ama Balance yako ya siri. Usitume vitu kama hizo popote.

Commands:
/help - Jinsi ya kutumia
/tips - Mbinu zote za conmen`, {parse_mode: 'Markdown'});
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id,
`Jinsi ya kutumia:

1. Enda kwa SMS zako
2. Copy SMS yote ya M-Pesa
3. Paste hapa

Nita-check:
✅ 1. Fake SMS (sender MPESA vs number)
✅ 2. Lugha ya SMS
✅ 3. Format ya Transaction Code
✅ 4. Iko na Balance?
✅ 5. Mbinu ya pressure/fuliza/till

Ukiskia mtu anakupigia akisema ni Safaricom - kata simu. Safaricom hawaombi PIN.`);
});

// Main logic
bot.on('message', (msg) => {
  const text = msg.text;
  if (text.startsWith('/')) return;
  if (text.toLowerCase().includes('mambo')) {
    bot.sendMessage(msg.chat.id, "Poa! Tuma tu SMS ya M-Pesa hapa nichambue. Usitume PIN yako.");
    return;
  }

  // Analysis
  let score = 0;
  let checks = [];

  // 1. Transaction Code format - Kenyan codes like QTD... 10 chars alphanumeric
  const codeRegex = /\b[A-Z0-9]{10}\b/;
  if (codeRegex.test(text)) {
    checks.push("✅ Transaction Code iko na format sahihi (herufi 10)");
    score++;
  } else {
    checks.push("⚠️ Hakuna Transaction Code ya kawaida (Q... 10 chars) - inaweza kuwa fake");
  }

  // 2. Balance check - Real M-Pesa always shows balance
  if (/balance/i.test(text) || /new m-pesa balance/i.test(text)) {
    checks.push("✅ Imeonyesha Balance - kawaida ni SMS halisi");
    score++;
  } else {
    checks.push("⚠️ HAIJAonyesha Balance - 99% ya SMS fake hazionyeshi balance");
  }

  // 3. Amount and Confirmed keyword
  if (/confirmed/i.test(text) && /ksh/i.test(text)) {
    checks.push("✅ Iko na 'Confirmed' na 'Ksh' - lugha ya M-Pesa halisi");
    score++;
  } else {
    checks.push("⚠️ Lugha sio ya M-Pesa halisi");
  }

  // 4. Urgency / Con language
  if (/tuma.*haraka|rudi.*pesa|nimetuma.*bahi mbaya|zawadi|fuliza.*activation/i.test(text)) {
    checks.push("🚨 Lugha ya pressure/con - 'tuma haraka', 'zawadi', 'activation fee' - HII NI SCAM!");
    score -= 2;
  }

  // 5. Sender education
  checks.push("💡 KUMBUKA: SMS halisi inatoka jina MPESA, sio number kama 07xx");

  // Result
  let verdict = "";
  if (score >= 3) verdict = "🟢 *Inaonekana kama SMS HALISI* - Lakini bado thibitisha na *334#";
  else if (score >= 1) verdict = "🟡 *Tilia shaka* - Angalia vizuri kabla ya kutuma pesa";
  else verdict = "🔴 *UWEZEKANO MKUBWA NI FAKE / SCAM* - USITUME PESA!";

  const finalMessage = `
${verdict}

*Uchambuzi:*
${checks.join('\n')}

---
*Mbinu za kujikinga:*
1. Fake SMS: Angalia sender ni MPESA
2. Wrong Number: Check balance kwa *334# usirudishe haraka
3. Call Scam: Safaricom HAWATAOMBA PIN yako - Kata simu piga 100
4. Fuliza Loan: Hakuna activation fee, usiclick link za WhatsApp
5. Till Scam: Subiri ujumbe wako mwenyewe wa MPESA, sio screenshot ya buyer

Tuma SMS nyingine nichambue.
`;

  bot.sendMessage(msg.chat.id, finalMessage, {parse_mode: 'Markdown'});
});

console.log("PesaCheck Legit Bot Started");
