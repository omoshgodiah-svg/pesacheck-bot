const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const app = express();
app.use(express.json());

// AI FUNCTION - Same brain for both bots
async function askAI(userText) {
  try {
    const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are PesaCheck, friendly Kenyan assistant. Help detect M-Pesa scams, answer any questions, speak Sheng/Swahili/English mix, short & helpful like Meta AI. Keep replies under 3 lines for WhatsApp." },
        { role: "user", content: userText }
      ]
    }, { headers: { Authorization: `Bearer ${process.env.GROQ_KEY}` } });
    return res.data.choices[0].message.content;
  } catch (e) {
    return "Pole, AI imelala kidogo. Jaribu tena! 😅";
  }
}

// ===== TELEGRAM - CHATS LIKE ME =====
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Jambo! PesaCheck AI Live 🇰🇪 Uliza chochote!");
});
bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  bot.sendChatAction(msg.chat.id, 'typing');
  const answer = await askAI(msg.text);
  bot.sendMessage(msg.chat.id, answer);
});

// ===== WHATSAPP - CHATS LIKE ME =====
const VERIFY_TOKEN = "pesacheck123";
app.get('/webhook', (req,res) => {
  if(req.query['hub.verify_token']===VERIFY_TOKEN) res.send(req.query['hub.challenge']);
  else res.sendStatus(403);
});
app.post('/webhook', async (req,res) => {
  const m = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if(m && m.text){
    const answer = await askAI(m.text.body); // AI brain for WhatsApp too!
    await axios.post(`https://graph.facebook.com/v18.0/${process.env.PHONE_ID}/messages`, {
      messaging_product:"whatsapp", to: m.from, text:{body: answer}
    }, { headers:{Authorization:`Bearer ${process.env.WHATSAPP_TOKEN}`}});
  }
  res.sendStatus(200);
});

app.get('/', (req,res)=>res.send('PesaCheck AI Both Live'));
app.listen(process.env.PORT||3000, ()=>console.log('Live'));
