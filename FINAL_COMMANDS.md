# 🚀 FINAL COMMANDS TO RUN

Brother, copy and paste these commands EXACTLY in your Ubuntu terminal:

## Step 1: Pull the Latest Updates
```bash
cd ~/Community-Tipbot-TG/Aegisum-TG-tipbot-initial-implementation
git pull origin main
```

## Step 2: Create Your .env File
```bash
./create_env_file.sh
```

## Step 3: Test RPC Connections
```bash
node simple_rpc_test.js
```

## Step 4: Install Dependencies (if needed)
```bash
npm install
```

## Step 5: Start the Bot
```bash
node src/bot.js
```

---

## 🎯 Expected Results

After Step 3, you should see:
```
✅ AEGS: Connected successfully! Block height: XXXX
✅ SHIC: Connected successfully! Block height: XXXX  
✅ PEPE: Connected successfully! Block height: XXXX
✅ ADVC: Connected successfully! Block height: XXXX

🎉 ALL RPC CONNECTIONS WORKING!
```

If you see this, your bot will work perfectly!

---

## 🔧 If You Need Your Telegram Bot Token

1. Go to @BotFather on Telegram
2. Send `/mybots`
3. Select your bot
4. Click "API Token"
5. Copy the token and update .env file:

```bash
nano .env
# Replace: TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
# With: TELEGRAM_BOT_TOKEN=1234567890:ABCDEF...
```

---

## 🎉 What Will Work After This

✅ **AEGS balance will show correctly**  
✅ **Deposit notifications will work**  
✅ **Bot says "Community TipBot"**  
✅ **Footer displays properly**  
✅ **All commands work perfectly**  

**You're literally 2 minutes away from success!**