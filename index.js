require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

const INTRO = `Hi am PesaCheck, verify mpesa transactions if real or fake
Send me the transaction to confirm if real or fake`;

// ONLY hizi ndio salamu - sio kila kitu kina hi
const ONLY_GREETINGS = ['hi', 'hii', 'hello', 'habari', 'mambo', 'niaje', 'hey', 'poa'];

function verifyMpesa(text) {
  const hasConfirmed = /confirmed/i.test(text);
  const hasMpesa = /M-PESA|MPESA/i.test(text);
  const hasKsh = /Ksh/i.test(text);
  const hasCode = /\b[A-Z0-9]{10}\b/.test(text); // hizo ten combinations
  const isFuliza = /fuliza/i.test(text);

  if (isFuliza) return { status: 'FAKE', reason: 'Hii ni FULIZA, sio payment ya M-PESA.' };

  // REAL lazima iwe na zote
  if (hasConfirmed && hasMpesa && hasKsh && hasCode) {
    return { status: 'REAL', reason: 'Ni ya kweli - Iko na Confirmed, M-PESA, Ksh na Code ya herufi 10.' };
  }
  return { status: 'FAKE', reason: 'FAKE - Hii ni bandia. Scammers hutengeneza message kama hii kudanganya pesa haijafika. Haina format kamili ya Safaricom.' };
}

bot.start((ctx) => ctx.reply(INTRO));

bot.on('message', async (ctx) => {
  const text = ctx.message.text || ctx.message.caption || '';
  console.log('IN:', text);

  const clean = text.toLowerCase().trim();

  // Kama ni salamu PEKE YAKE - hapo ndio intro
  if (ONLY_GREETINGS.includes(clean)) {
    return ctx.reply(INTRO);
  }

  // Kama ni transaction yoyote - verify
  const result = verifyMpesa(text);
  const reply = result.status === 'REAL' ? `✅ REAL\n\n${result.reason}` : `❌ FAKE\n\n${result.reason}`;
  return ctx.reply(reply);
});

app.use(express.json());
app.use(bot.webhookCallback('/webhook'));
app.get('/', (req, res) => res.send('PesaCheck running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log('Server running on', PORT);
  if (process.env.RENDER_EXTERNAL_URL) {
    const url = `${process.env.RENDER_EXTERNAL_URL}/webhook`;
    await bot.telegram.deleteWebhook();
    await bot.telegram.setWebhook(url);
    console.log('Webhook set:', url);
  }
});
