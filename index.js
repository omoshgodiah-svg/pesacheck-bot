require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

const INTRO_MESSAGE = `Hi am PesaCheck, verify mpesa transactions if real or fake
Send me the transaction to confirm if real or fake`;

// Greetings - Kiswahili na English
const GREETINGS = ['hi', 'hello', 'habari', 'mambo', 'niaje', 'sasa', 'hujambo', 'hey', 'poa', 'salama'];

function isGreeting(text) {
  const lower = text.toLowerCase().trim();
  return GREETINGS.some(g => lower === g || lower.startsWith(g + ' '));
}

function checkMpesa(text) {
  const hasConfirmed = /confirmed/i.test(text);
  const hasMpesa = /M-PESA|MPESA|M-Pesa/i.test(text);
  const hasKsh = /Ksh|KSh|KSH/i.test(text);
  const hasTransID = /\b[A-Z0-9]{10}\b/.test(text); // hizo ten combinations
  const hasCost = /transaction cost/i.test(text);

  // FAKE checks
  const isFuliza = /fuliza/i.test(text);
  const hasLink = /https?:\/\/|www\.|\.com|click here/i.test(text);
  const isAnonymous = /\+254|072|071|070|011|010/i.test(text) && text.length < 100;

  // 1. Fuliza scam
  if (isFuliza) {
    return { status: 'FAKE', reason: 'This is FULIZA message, not M-PESA payment. Scammers use it to lie they sent money.' };
  }

  // 2. Link scam / anonymous messages
  if (hasLink) {
    return { status: 'FAKE', reason: 'FAKE - Ina link. Safaricom M-PESA SMS haina link.' };
  }

  // 3. REAL M-PESA check - must have all key details
  if (hasConfirmed && hasMpesa && hasKsh && hasTransID) {
    return { status: 'REAL', reason: 'Transaction inaonekana ya kweli. Iko na Confirmed, M-PESA, Ksh, na Transaction Code ya herufi 10, na inaonekana kama SMS ya Safaricom.' };
  }

  // 4. If missing important details -> FAKE
  let missing = [];
  if (!hasConfirmed) missing.push('Confirmed');
  if (!hasMpesa) missing.push('M-PESA');
  if (!hasKsh) missing.push('Ksh');
  if (!hasTransID) missing.push('10-digit Code');
  
  return { status: 'FAKE', reason: `FAKE - Message haina vitu muhimu: ${missing.join(', ')}. Hii ni message bandia scammers hutengeneza kuonyesha wametuma pesa na haijafika kwa seller.` };
}

bot.start((ctx) => {
  ctx.reply(INTRO_MESSAGE);
});

bot.on('text', (ctx) => {
  const text = ctx.message.text;

  // Kama ni salamu tu - rudi kwa intro, usijibu kijinga
  if (isGreeting(text)) {
    return ctx.reply(INTRO_MESSAGE);
  }

  const result = checkMpesa(text);

  if (result.status === 'REAL') {
    ctx.reply(`✅ REAL\n\n${result.reason}`);
  } else {
    ctx.reply(`❌ FAKE\n\n${result.reason}`);
  }
});

// ===== HII NDIO FIX YA ERROR YAKO KWA SCREENSHOT =====
(async () => {
  try {
    await bot.telegram.deleteWebhook(); // inafuta conflict
    await bot.launch({ dropPendingUpdates: true });
    console.log('PesaCheck is running...');
  } catch (err) {
    console.log('Error starting bot:', err.message);
  }
})();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
