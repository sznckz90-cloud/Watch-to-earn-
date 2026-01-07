
# Crypto Bot - Firebase Setup

## 1. Prerequisites
- Node.js installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- A Firebase project created on the console

## 2. Setup
1. Log in to Firebase:
   `firebase login`

2. Initialize in this folder:
   `firebase init functions firestore`

3. Replace the generated `functions/index.js` and `firestore.rules` with the files in this folder.

## 3. Configuration
Set your Telegram Bot Token in Firebase Environment config:
`firebase functions:config:set telegram.token="YOUR_TELEGRAM_BOT_TOKEN"`

## 4. Deploy
`firebase deploy`

## 5. Webhook Setup
After deployment, get the URL of the `telegramWebhook` function (it will look like `https://us-central1-YOUR-PROJECT.cloudfunctions.net/telegramWebhook`).
Set the webhook using your browser or curl:
`https://api.telegram.org/botYOUR_TOKEN/setWebhook?url=YOUR_FUNCTION_URL`
