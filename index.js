require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

const INTRO_MESSAGE = `Hi am PesaCheck, verify mpesa transactions if real or fake
Send me the transaction to confirm if real or fake`;

// Greetings in Swahili/English -> still show what bot does
const GREETINGS = ['hi', 'hello', 'habari', 'mambo', 'niaje', 'sasa', 'hujambo', 'hey'];

function isGreeting(text) {
  const lower = text.toLowerCase().trim();
  return GREETINGS.some(g => lower === g || lower.startsWith(g + ' '));
}

function checkMpesa(text) {
  const hasConfirmed = /confirmed/i.test(text);
  const hasMpesa = /M-PESA|M-Pesa|MPESA/i.test(text);
  const hasKsh = /Ksh|KSh|KSH/i.test(text);
  const hasTransID = /\b[A-Z0-9]{10}\b/.test(text); // The 10 combinations
  const hasCost = /transaction cost/i.test(text);
  const hasDatePattern = /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}:\d{2}\s*(AM|PM)/i.test(text);

  // FAKE indicators
  const isFuliza = /fuliza/i.test(text);
  const hasLink = /http|www\.|\.com|click here/i.test(text);
  const hasPersonalNumber = /\+2547\d{8}/.test(text) && !hasMpesa; // anonymous number

  if (isFuliza) {
    return { status: 'FAKE', reason: 'Hii ni message ya FULIZA, sio ya M-PESA ya kutumiwa pesa. Scammers hutumia hii kudanganya.' };
  }
  if (hasLink) {
    return { status: 'FAKE', reason: 'Fake - Ina link / website. Safaricom haitumi link kwa M-PESA SMS.' };
  }

  // Real M-PESA must have these 4 main things
  if (hasConfirmed && hasMpesa && hasKsh && hasTransID) {
    return { status: 'REAL', reason: 'Message iko na Confirmed, M-PESA, Ksh na Transaction ID ya herufi 10. Inaonekana ni ya kweli.' };
  } else {
    let missing = [];
    if (!hasConfirmed) missing.push('Confirmed');
    if (!hasMpesa) missing.push('M-PESA');
    if (!hasKsh) missing.push('Ksh');
    if (!hasTransID) missing.push('Transaction Code (herufi 10)');
    
    return { status: 'FAKE', reason: `Fake - Message haina vitu muhimu: ${missing.join(', ')}. Scammer ame-copy message bandia.` };
  }
}

bot.start((ctx) => {
  ctx.reply(INTRO_MESSAGE);
});

bot.on('text', (ctx) => {
  const text = ctx.message.text;

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

bot.launch();
console.log('PesaCheck is running...');
