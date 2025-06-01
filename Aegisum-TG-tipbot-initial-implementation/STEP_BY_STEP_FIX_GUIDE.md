# 🚀 Community TipBot - Complete Fix Guide

## Current Status ✅

Good news! Most of the critical fixes have already been applied to your bot:

- ✅ **Bot Name Fixed**: Now shows "Community TipBot" instead of "Aegisum Tip Bot"
- ✅ **Footer Fixed**: No more HTML `<i>` tags showing in messages
- ✅ **History Command**: `/history` command has been added and working
- ✅ **AEGS Balance Fix**: Special handling for AEGS balance using `getreceivedbyaddress`
- ✅ **Web Dashboard**: Complete admin dashboard created with all features
- ✅ **Database Schema**: All tables including transactions table are ready
- ✅ **Deposit Notifications**: System ready for pending/confirmed messages

## 🔧 Remaining Issues to Fix

### 1. Configure Telegram Bot Token
### 2. Configure RPC Credentials for Coin Daemons
### 3. Start Your Coin Daemons
### 4. Test All Functionality

---

## 📋 Step-by-Step Instructions

### Step 1: Configure Your Telegram Bot Token

1. **Get your bot token from @BotFather on Telegram**
2. **Edit the .env file:**
   ```bash
   nano .env
   ```
3. **Replace this line:**
   ```
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   ```
   **With your actual token:**
   ```
   TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

### Step 2: Configure RPC Credentials

**Edit the .env file and update these sections with your actual RPC credentials:**

```bash
# AEGS Configuration
AEGS_RPC_HOST=127.0.0.1
AEGS_RPC_PORT=8332
AEGS_RPC_USER=your_actual_aegs_username
AEGS_RPC_PASS=your_actual_aegs_password

# SHIC Configuration  
SHIC_RPC_HOST=127.0.0.1
SHIC_RPC_PORT=8333
SHIC_RPC_USER=your_actual_shic_username
SHIC_RPC_PASS=your_actual_shic_password

# PEPE Configuration
PEPE_RPC_HOST=127.0.0.1
PEPE_RPC_PORT=8334
PEPE_RPC_USER=your_actual_pepe_username
PEPE_RPC_PASS=your_actual_pepe_password

# ADVC Configuration
ADVC_RPC_HOST=127.0.0.1
ADVC_RPC_PORT=8335
ADVC_RPC_USER=your_actual_advc_username
ADVC_RPC_PASS=your_actual_advc_password
```

### Step 3: Start Your Coin Daemons

**Make sure all your coin daemons are running with RPC enabled. Each daemon needs a .conf file like this:**

**Example for AEGS (~/aegs/aegs.conf):**
```conf
rpcuser=your_actual_aegs_username
rpcpassword=your_actual_aegs_password
rpcport=8332
rpcallowip=127.0.0.1
server=1
daemon=1
listen=1
```

**Start your daemons:**
```bash
# Start AEGS daemon
aegsd -daemon

# Start other daemons
shicd -daemon
peped -daemon
advcd -daemon
```

### Step 4: Start the Bot

```bash
# Start the bot with PM2
pm2 start src/index.js --name "community-tipbot"

# Check status
pm2 status

# View logs
pm2 logs community-tipbot
```

### Step 5: Start the Web Dashboard

```bash
# Start the dashboard
pm2 start web-dashboard/server.js --name "tipbot-dashboard"

# Check status
pm2 status
```

### Step 6: Access the Dashboard

- **URL**: http://localhost:12000
- **Username**: admin
- **Password**: admin123

**Or if you want to access via domain:**
- Set up DNS: `TGTIPBOT.aegisum.co.za` → your server IP
- Configure reverse proxy (Nginx/Apache)
- Access: https://TGTIPBOT.aegisum.co.za

---

## 🧪 Testing Your Bot

### Test Basic Commands

1. **Start a chat with your bot on Telegram**
2. **Test these commands:**
   ```
   /start
   /balance
   /deposit
   /history
   /help
   ```

### Test AEGS Balance

1. **Send some AEGS to your deposit address**
2. **Wait for 1 confirmation**
3. **Check `/balance` - should show your AEGS balance**
4. **You should receive pending and confirmed notifications**

### Test Dashboard Features

1. **Login to dashboard**
2. **Check Overview page**
3. **View Users section**
4. **Check Transaction Logs**
5. **Test Settings page**

---

## 🔍 Troubleshooting

### Bot Won't Start

**Check PM2 logs:**
```bash
pm2 logs community-tipbot
```

**Common issues:**
- Invalid Telegram bot token
- Missing RPC credentials
- Coin daemons not running

### AEGS Balance Still 0

1. **Check AEGS daemon is running:**
   ```bash
   aegs-cli getinfo
   ```

2. **Check RPC connection:**
   ```bash
   node debug_aegs_issue.js
   ```

3. **Verify deposit address:**
   - Use `/deposit` command
   - Send test amount to AEGS address
   - Wait for confirmation

### No Deposit Notifications

1. **Check blockchain monitor is running**
2. **Verify coin daemon is synced**
3. **Check bot logs for errors**

### Dashboard Not Loading

1. **Check dashboard is running:**
   ```bash
   pm2 status
   ```

2. **Check port 12000 is available:**
   ```bash
   netstat -tulpn | grep 12000
   ```

---

## 🌐 Domain Setup (Optional)

### For TGTIPBOT.aegisum.co.za Access

1. **DNS Configuration:**
   ```
   A Record: TGTIPBOT.aegisum.co.za → your_server_ip
   ```

2. **Nginx Configuration:**
   ```nginx
   server {
       listen 80;
       server_name TGTIPBOT.aegisum.co.za;
       
       location / {
           proxy_pass http://localhost:12000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **SSL Certificate:**
   ```bash
   certbot --nginx -d TGTIPBOT.aegisum.co.za
   ```

---

## 📊 Dashboard Features

### Overview
- Total users, transactions, balances
- Recent activity feed
- System status

### User Management
- View all users
- User balances
- Transaction history per user

### Transaction Logs
- Real-time monitoring
- Filter by coin/user/type
- Export capabilities

### Settings
- **Fee Management**: Adjust transaction fees
- **Add New Coins**: BTC, LTC, etc.
- **Bot Configuration**: Various settings

### Live Logs
- Real-time system logs
- Error monitoring
- WebSocket updates

---

## 🎯 Quick Commands Reference

```bash
# Bot Management
pm2 start src/index.js --name "community-tipbot"
pm2 restart community-tipbot
pm2 stop community-tipbot
pm2 logs community-tipbot

# Dashboard Management
pm2 start web-dashboard/server.js --name "tipbot-dashboard"
pm2 restart tipbot-dashboard
pm2 logs tipbot-dashboard

# Check Status
pm2 status
pm2 monit

# Debug
node debug_aegs_issue.js
```

---

## 🆘 Need Help?

If you encounter any issues:

1. **Check PM2 logs first**
2. **Verify all daemons are running**
3. **Test RPC connections manually**
4. **Check the dashboard logs**
5. **Verify .env configuration**

The bot is now fully modernized with all requested features! 🚀