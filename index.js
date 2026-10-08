const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) console.log("NO TOKEN SET!");
const bot = new TelegramBot(token);

const PORT = process.env.PORT || 10000;

app.get('/', (req,res)=> res.send('PesaCheck Live on Render - OK'));

app.post(`/bot${token}`, async (req,res)=>{
  try{
    const msg = req.body.message;
    if(!msg ||!msg.text) return res.sendStatus(200);
    const chatId = msg.chat.id;
    const text = msg.text.trim().toLowerCase();

    if(text.startsWith('/start')){
      await bot.sendMessage(chatId, "PesaCheck iko LIVE! Tuma: confirm QGH7K9W2LP");
      return res.sendStatus(200);
    }
    if(text.startsWith('confirm')){
      let code = text.split(/\s+/)[1] || "";
      code = code.toUpperCase().replace(/[^A-Z0-9]/g,'');
      if(code.length!==10){
        await bot.sendMessage(chatId, "SCAM! CODE "+code+" ni FAKE. Length ni "+code.length+" badala ya 10");
      } else if(!code.startsWith('Q')){
        await bot.sendMessage(chatId, "SCAM! CODE "+code+" lazima ianze na Q");
      } else {
        await bot.sendMessage(chatId, "FORMAT SAWA! CODE "+code+" imepita. Bado piga 334# kuconfirm pesa.");
      }
      return res.sendStatus(200);
    }
    await bot.sendMessage(chatId, "Tuma: confirm CODE");
    return res.sendStatus(200);
  }catch(e){
    console.error("ERROR:", e.message);
    return res.sendStatus(200);
  }
});

app.listen(PORT, ()=>{
  console.log("Server running on "+PORT);
});
