require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

const INTRO_MESSAGE = `Hi am PesaCheck, verify mpesa transactions if real or fake
Send me the transaction to confirm if real or fake`;

// Salamu zote
const GREETINGS = ['hi', 'hii', 'hello', 'habari', 'mambo', 'niaje', 'sasa', 'hujambo', 'hey', 'poa', 'salama', 'niaje'];

function isGreeting(text) {
  const lower = text.toLowerCase().trim();
  // kama message ni fupi chini ya herufi 10, ni salamu tu
  if (lower.length < 10) return true;
  return GREETINGS.some(g => lower === g || lower.startsWith(g + ' ') || lower === g);
}

function checkMpesa(text) {
  const hasConfirmed = /confirmed/i.test(text);
  const hasMpesa = /M-PESA|MPESA/i.test(text);
  const hasKsh = /Ksh/i.test(text);
  const hasTransID = /\b[A-Z0-9]{10}\b/.test(text); // ten combinations
  const hasCost = /transaction cost|transacion cost/i.test(text);

  const isFuliza = /fuliza/i.test(text);
  
  // FIX: Link ni fake ISIPOKUWA kama ni ya Safaricom
  const hasSuspiciousLink = /https?:\/\//i.test(text) && !/safaricom\.co\.ke|safaricom\.com|my\.safaricom/i.test(text);

  if (isFuliza) {
    return { status: 'FAKE', reason: 'Hii ni FULIZA, sio M-PESA payment ya kununua kitu.' };
  }
  if (hasSuspiciousLink) {
    return { status: 'FAKE', reason: 'FAKE - Ina link ya ajabu. M-PESA halisi haina link ya wash wash.' };
  }

  // REAL M-PESA lazima iwe na hizi 4
  if (hasConfirmed && hasMpesa && hasKsh && hasTransID) {
    return { status: 'REAL', reason: 'Transaction ni ya kweli. Iko na Confirmed, M-PESA, Ksh na Code ya herufi 10 kama ya Safaricom.' };
  }

  return { status: 'FAKE', reason: `FAKE - Haina vitu muhimu. Scammer ame-edit message. Hakikisha ina Confirmed, M-PESA, Ksh na Code ya herufi 10.` };
}

bot.start((ctx) => ctx.reply(INTRO_MESSAGE));

bot.on('text', (ctx) => {
  const text = ctx.message.text.trim();
  
  // Kama ni salamu fupi
  if (isGreeting(text)) {
    return ctx.reply(INTRO_MESSAGE);
  }

  const result = checkMpesa(text);
  ctx.reply(result.status === 'REAL' ? `✅ REAL\n\n${result.reason}` : `❌ FAKE\n\n${result.reason}`);
});

// WEBHOOK FOR RENDER
app.use(express.json());
app.use(bot.webhookCallback('/webhook'));
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('PesaCheck is running...'));

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  const url = process.env.RENDER_EXTERNAL_URL;
  if (url) {
    const webhookUrl = `${url}/webhook`;
    try {
      await bot.telegram.deleteWebhook();
      await bot.telegram.setWebhook(webhookUrl);
      console.log(`Webhook set to ${webhookUrl}`);
    } catch (e) {
      console.log('Webhook error:', e.message);
    }
  }
});
