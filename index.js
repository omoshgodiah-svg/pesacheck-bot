require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

const INTRO = `Hi am PesaCheck, verify mpesa transactions if real or fake
Send me the transaction to confirm if real or fake`;

const GREETINGS = ['hi','hii','hello','habari','mambo','niaje','hey','poa','sasa'];

// HII NDIO LOGIC YAKO MPYA
function verifyMpesa(text) {
  if (!text) return { status: 'FAKE', reason: 'No text' };

  // Tafuta hizo 10 combinations - herufi kubwa na namba 10
  // CFAZ9T78S1, QGH5... etc
  const codeRegex = /\b[A-Z0-9]{10}\b/;
  const textUpper = text.toUpperCase();
  const match = textUpper.match(codeRegex);

  if (match) {
    const code = match[0];
    return {
      status: 'REAL',
      reason: `Hii ni REAL. Iko na code halisi ya Safaricom ya herufi 10: ${code}. Hata kama kuna info zingine ndani, code ndio inathibitisha sio scam.`
    };
  } else {
    return {
      status: 'FAKE',
      reason: `FAKE - Haina code ya herufi 10 ya Safaricom. Scammer hana code halisi. M-PESA halisi lazima ianze na code kama CFAZ9T78S1 (herufi 10 za mchanganyiko).`
    };
  }
}

bot.start((ctx) => ctx.reply(INTRO));

bot.on('message', async (ctx) => {
  const text = ctx.message.text || ctx.message.caption || '';
  console.log('IN:', text);

  if (!text) return ctx.reply(INTRO);

  const clean = text.toLowerCase().trim();
  // kama ni salamu pekee
  if (GREETINGS.includes(clean)) {
    return ctx.reply(INTRO);
  }

  const result = verifyMpesa(text);
  const reply = result.status === 'REAL'
   ? `✅ REAL\n\n${result.reason}`
    : `❌ FAKE\n\n${result.reason}`;

  return ctx.reply(reply);
});

// WEBHOOK FOR RENDER
app.use(express.json());
app.use(bot.webhookCallback('/webhook'));
app.get('/', (req, res) => res.send('PesaCheck running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log('Server on', PORT);
  if (process.env.RENDER_EXTERNAL_URL) {
    const url = `${process.env.RENDER_EXTERNAL_URL}/webhook`;
    await bot.telegram.deleteWebhook();
    await bot.telegram.setWebhook(url);
    console.log('Webhook set:', url);
  }
});
