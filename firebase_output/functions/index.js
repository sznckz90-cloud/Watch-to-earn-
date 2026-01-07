
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

// Environment Variables
// Set these using: firebase functions:config:set telegram.token="YOUR_TOKEN"
const token = functions.config().telegram.token;
const bot = new TelegramBot(token);

// 1. Telegram Webhook Function
exports.telegramWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const update = req.body;
    
    // Handle Commands
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const userId = update.message.from.id.toString();
      const text = update.message.text;

      if (text.startsWith("/start")) {
        await bot.sendMessage(chatId, "Welcome! /setup to configure.");
        await db.collection("users").doc(userId).set({
          channelId: chatId,
          coinSymbol: "bitcoin",
          intervalMinutes: 60,
          isActive: true,
          lastPostedAt: null
        }, { merge: true });
      }
      
      // ... Add more command handling logic here
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).send("Error");
  }
});

// 2. Scheduled Price Updater
// Runs every 1 minute
exports.scheduledPriceUpdate = functions.pubsub.schedule("every 1 minutes").onRun(async (context) => {
  const usersSnapshot = await db.collection("users").where("isActive", "==", true).get();
  
  const updates = [];
  
  usersSnapshot.forEach(doc => {
    const user = doc.data();
    const userId = doc.id;
    
    // Interval Check Logic
    const lastPosted = user.lastPostedAt ? user.lastPostedAt.toDate().getTime() : 0;
    const intervalMs = user.intervalMinutes * 60 * 1000;
    
    if (Date.now() - lastPosted >= intervalMs) {
      updates.push({ userId, user });
    }
  });

  // Process updates in parallel
  await Promise.all(updates.map(async ({ userId, user }) => {
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${user.coinSymbol}&vs_currencies=usd&include_24hr_change=true`);
      const data = response.data[user.coinSymbol];
      
      if (data) {
         const message = `📊 ${user.coinSymbol.toUpperCase()} Update\n💰 $${data.usd}\n📈 ${data.usd_24h_change.toFixed(2)}%`;
         await bot.sendMessage(user.channelId, message);
         await db.collection("users").doc(userId).update({ lastPostedAt: admin.firestore.Timestamp.now() });
      }
    } catch (e) {
      console.error(`Failed to update user ${userId}`, e);
    }
  }));
  
  return null;
});
