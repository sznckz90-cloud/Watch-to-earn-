import fs from 'fs/promises';
import path from 'path';

// This function generates the standalone Firebase code for the user
export async function generateFirebaseCode() {
  const outputDir = path.join(process.cwd(), 'firebase_output');
  
  // Create directories
  await fs.mkdir(path.join(outputDir, 'functions'), { recursive: true });

  // 1. Firebase Functions (index.js)
  const functionsCode = `
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
      const response = await axios.get(\`https://api.coingecko.com/api/v3/simple/price?ids=\${user.coinSymbol}&vs_currencies=usd&include_24hr_change=true\`);
      const data = response.data[user.coinSymbol];
      
      if (data) {
         const message = \`📊 \${user.coinSymbol.toUpperCase()} Update\\n💰 $\${data.usd}\\n📈 \${data.usd_24h_change.toFixed(2)}%\`;
         await bot.sendMessage(user.channelId, message);
         await db.collection("users").doc(userId).update({ lastPostedAt: admin.firestore.Timestamp.now() });
      }
    } catch (e) {
      console.error(\`Failed to update user \${userId}\`, e);
    }
  }));
  
  return null;
});
`;

  // 2. Firestore Rules
  const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Only allow admin SDK (Cloud Functions) to read/write freely
      // Users shouldn't access DB directly
      allow read, write: if false; 
    }
  }
}
`;

  // 3. Package.json for Functions
  const packageJson = `
{
  "name": "functions",
  "description": "Cloud Functions for Crypto Bot",
  "scripts": {
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "index.js",
  "dependencies": {
    "firebase-admin": "^11.8.0",
    "firebase-functions": "^4.4.0",
    "node-telegram-bot-api": "^0.61.0",
    "axios": "^1.6.0"
  },
  "private": true
}
`;

  // 4. Setup Instructions
  const readme = `
# Crypto Bot - Firebase Setup

## 1. Prerequisites
- Node.js installed
- Firebase CLI installed (\`npm install -g firebase-tools\`)
- A Firebase project created on the console

## 2. Setup
1. Log in to Firebase:
   \`firebase login\`

2. Initialize in this folder:
   \`firebase init functions firestore\`

3. Replace the generated \`functions/index.js\` and \`firestore.rules\` with the files in this folder.

## 3. Configuration
Set your Telegram Bot Token in Firebase Environment config:
\`firebase functions:config:set telegram.token="YOUR_TELEGRAM_BOT_TOKEN"\`

## 4. Deploy
\`firebase deploy\`

## 5. Webhook Setup
After deployment, get the URL of the \`telegramWebhook\` function (it will look like \`https://us-central1-YOUR-PROJECT.cloudfunctions.net/telegramWebhook\`).
Set the webhook using your browser or curl:
\`https://api.telegram.org/botYOUR_TOKEN/setWebhook?url=YOUR_FUNCTION_URL\`
`;

  await fs.writeFile(path.join(outputDir, 'functions/index.js'), functionsCode);
  await fs.writeFile(path.join(outputDir, 'firestore.rules'), firestoreRules);
  await fs.writeFile(path.join(outputDir, 'functions/package.json'), packageJson);
  await fs.writeFile(path.join(outputDir, 'README.md'), readme);
  
  console.log("Firebase code generated in firebase_output/");
}
