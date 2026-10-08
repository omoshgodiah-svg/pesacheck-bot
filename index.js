require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

const INTRO = `Hi am PesaCheck, verify mpesa transactions if real or fake
Send me the transaction to confirm if real or fake
Usiconiwe nikiwa, hakiki pesa yako`;

bot.start((ctx) => ctx.reply(INTRO));

bot.on('message', async (ctx) => {
  const text = ctx.message.text || ctx.message.caption || '';
  const lower = text.toLowerCase().trim();

  if (['hi','hii','hello','hey','poa','sasa'].includes(lower)) {
    return ctx.reply(INTRO);
  }

  // 10 OR 11 combinations - both REAL
  const regex = /[A-Z0-9]{10,11}/;
  const hasCode = regex.test(text.toUpperCase());

  if (hasCode) {
    const code = text.toUpperCase().match(regex)[0];
    return ctx.reply(`✅ REAL - Code found: ${code}\n\nHii ni REAL. It has 10 combination code from safaricom and the 11 combination code from airtel is also REAL.`);
  } else {
    return ctx.reply(`❌ FAKE - Haina 10 combinations ama 11 combinations\n\nHii ni FAKE. Haina code ya herufi 10 kama 'CFAZ9T78S1' or 'O3531C7NNBK'.`);
  }
});

app.use(bot.webhookCallback('/webhook'));
app.get('/', (req, res) => res.send('PesaCheck running'));

app.listen(process.env.PORT || 3000, async () => {
  const url = process.env.RENDER_EXTERNAL_URL;
  if (url) {
    await bot.telegram.deleteWebhook();
    await bot.telegram.setWebhook(`${url}/webhook`);
  }
});
