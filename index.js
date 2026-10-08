require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

const INTRO = `Hi am PesaCheck, verify mpesa transactions if real or fake
Send me the transaction to confirm if real or fake`;

function isGreeting(t) {
  if (!t) return false;
  const low = t.toLowerCase().trim();
  return low.length < 15 && /^(hi|hii|hello|habari|mambo|niaje|sasa|poa)/i.test(low);
}

function verify(text) {
  if (!text) return { status: 'FAKE', reason: 'Tuma ujumbe wa M-PESA kama text.' };
  
  const hasConfirmed = /confirmed/i.test(text);
  const hasMpesa = /M-PESA|MPESA/i.test(text);
  const hasKsh = /Ksh/i.test(text);
  const hasCode = /\b[A-Z0-9]{10}\b/.test(text);
  const isFuliza = /fuliza/i.test(text);
  const badLink = /https?:\/\//i.test(text) && !/safaricom|my\.safaricom/i.test(text);

  if (isFuliza) return { status: 'FAKE', reason: 'Hii ni FULIZA, sio malipo ya M-PESA.' };
  if (badLink) return { status: 'FAKE', reason: 'FAKE - Ina link ya wash wash. M-PESA halisi haina link isipokuwa ya Safaricom.' };

  if (hasConfirmed && hasMpesa && hasKsh && hasCode) {
    return { status: 'REAL', reason: 'Ni ya kweli - Iko na Confirmed, M-PESA, Ksh na Transaction Code ya herufi 10.' };
  }
  return { status: 'FAKE', reason: 'FAKE - Haina format ya Safaricom. Scammer ame-tengeneza message bandia. Hakikisha ina Confirmed, M-PESA, Ksh na Code.' };
}

// START
bot.start((ctx) => ctx.reply(INTRO));

// HII NDIO FIX KUBWA - inashika text, caption, forwarded, zote
bot.on('message', async (ctx) => {
  try {
    const msg = ctx.message;
    const text = msg.text || msg.caption || '';

    console.log('Received:', text.substring(0, 50));

    if (!text) return ctx.reply(INTRO);

    if (isGreeting(text)) {
      return await ctx.reply(INTRO);
    }

    const result = verify(text);
    const reply = result.status === 'REAL' ? `✅ REAL\n\n${result.reason}` : `❌ FAKE\n\n${result.reason}`;
    await ctx.reply(reply);

  } catch (err) {
    console.log('Error:', err.message);
    await ctx.reply(INTRO);
  }
});

// WEBHOOK FOR RENDER
app.use(express.json());
app.use(bot.webhookCallback('/webhook'));

app.get('/', (req, res) => res.send('PesaCheck running...'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log('Server on', PORT);
  if (process.env.RENDER_EXTERNAL_URL) {
    const hook = `${process.env.RENDER_EXTERNAL_URL}/webhook`;
    await bot.telegram.deleteWebhook();
    await bot.telegram.setWebhook(hook);
    console.log('Webhook set:', hook);
  }
});
