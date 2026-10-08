require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

const INTRO_MESSAGE = `Hi am PesaCheck, verify mpesa transactions if real or fake
Send me the transaction to confirm if real or fake`;

const GREETINGS = ['hi','hello','habari','mambo','niaje','sasa','hujambo','hey','poa'];

function isGreeting(text) {
  const lower = text.toLowerCase().trim();
  return GREETINGS.some(g => lower === g || lower.startsWith(g + ' '));
}

function checkMpesa(text) {
  const hasConfirmed = /confirmed/i.test(text);
  const hasMpesa = /M-PESA|MPESA/i.test(text);
  const hasKsh = /Ksh/i.test(text);
  const hasTransID = /\b[A-Z0-9]{10}\b/.test(text);
  const isFuliza = /fuliza/i.test(text);
  const hasLink = /https?:\/\/|www\.|\.com|click here/i.test(text);

  if (isFuliza) return { status: 'FAKE', reason: 'This is FULIZA message, not M-PESA payment.' };
  if (hasLink) return { status: 'FAKE', reason: 'FAKE - Ina link. M-PESA halisi haina link.' };
  if (hasConfirmed && hasMpesa && hasKsh && hasTransID) {
    return { status: 'REAL', reason: 'Transaction inaonekana ya kweli. Iko na Confirmed, M-PESA, Ksh, na Code ya herufi 10.' };
  }
  return { status: 'FAKE', reason: `FAKE - Haina vitu muhimu (Confirmed/M-PESA/Ksh/Code). Ni message bandia.` };
}

bot.start((ctx) => ctx.reply(INTRO_MESSAGE));

bot.on('text', (ctx) => {
  const text = ctx.message.text;
  if (isGreeting(text)) return ctx.reply(INTRO_MESSAGE);
  const result = checkMpesa(text);
  ctx.reply(result.status === 'REAL' ? `✅ REAL\n\n${result.reason}` : `❌ FAKE\n\n${result.reason}`);
});

// WEBHOOK SETUP FOR RENDER - HII NDIO INAUA ERROR 409
app.use(express.json());
app.use(bot.webhookCallback('/webhook'));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('PesaCheck is running...'));

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  // Set webhook to Render URL
  const url = process.env.RENDER_EXTERNAL_URL;
  if (url) {
    const webhookUrl = `${url}/webhook`;
    await bot.telegram.deleteWebhook();
    await bot.telegram.setWebhook(webhookUrl);
    console.log(`Webhook set to ${webhookUrl}`);
  }
});
