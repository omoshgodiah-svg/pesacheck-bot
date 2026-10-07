const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 10000;
const TOKEN = process.env.BOT_TOKEN;

console.log("Checking token...", TOKEN ? "Token exists" : "NO TOKEN FOUND!");

if (!TOKEN) {
  console.error("❌ BOT_TOKEN env variable missing!");
}

const bot = new TelegramBot(TOKEN, { polling: true });

bot.on('polling_error', (error) => {
  console.log("Polling error:", error.code, error.message);
});

bot.onText(/\/start/, (msg) => {
  console.log("Received /start from", msg.chat.id);
  bot.sendMessage(msg.chat.id, `👋 Jambo! Welcome to PesaCheck!

East Africa's leading fact-checking organization.

Send us any claim, news, or image and we verify it for you! Fighting misinformation in Kenya and beyond.

Try sending: "Is it true that..."`);
});

bot.on('message', (msg) => {
  console.log("Message received:", msg.text, "from", msg.chat.id);
  if (msg.text && !msg.text.startsWith('/')) {
    bot.sendMessage(msg.chat.id, `Thanks! You said: "${msg.text}"\n\n🔍 Our fact-checkers will verify this. For now this is a test reply - your bot is WORKING! ✅`);
  }
});

app.get('/', (req, res) => {
  res.send('PesaCheck Bot is running! Bot polling: ' + (bot ? 'active' : 'inactive'));
});

app.listen(PORT, () => {
  console.log(`Cloud web server ready on port ${PORT}`);
  console.log(`Bot started polling...`);
});
