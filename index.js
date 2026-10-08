require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

const INTRO = `Hi am PesaCheck, verify mpesa transactions if real or fake
Send me the transaction to confirm if real or fake`;

bot.start((ctx) => ctx.reply(INTRO));

bot.on('message', async (ctx) => {
  const text = ctx.message.text || ctx.message.caption || '';
  const lower = text.toLowerCase().trim();

  // 1. ONLY if user says ONLY "hi" alone - then show intro
  if (['hi','hii','hello','hey','poa','sasa'].includes(lower)) {
    return ctx.reply(INTRO);
  }

  // 2. EVERYTHING ELSE - check for 10 combinations
  // This is your rule: has 10 letters/numbers = REAL
  const has10Code = /[A-Z0-9]{10}/.test(text.toUpperCase());

  if (has10Code) {
    const code = text.toUpperCase().match(/[A-Z0-9]{10}/)[0];
    return ctx.reply(`✅ REAL - Code found: ${code}\n\nHii ni REAL. Iko na 10 combinations za Safaricom (${code}). Hata kama kuna info zingine, ni ya kweli.`);
  } else {
    return ctx.reply(`❌ FAKE - Haina 10 combinations\n\nHii ni FAKE. Haina code ya herufi 10 kama CFAZ9T78S1. Scammer hawezi kutengeneza code halisi.`);
  }
});

app.use(bot.webhookCallback('/webhook'));
app.get('/', (req, res) => res.send('PesaCheck running'));
app.listen(process.env.PORT || 3000, async () => {
  const url = process.env.RENDER_EXTERNAL_URL;
  if (url) {
    await bot.telegram.deleteWebhook();
    await bot.telegram.setWebhook(`${url}/webhook`);
    console.log('Webhook set');
  }
});
