# 🚀 Community TipBot - Ubuntu Setup Guide

## 🎯 This guide will fix ALL your issues:
- ✅ AEGS balance showing 0
- ✅ No pending/confirmed deposit messages  
- ✅ Bot saying "Aegisum Tip bot" instead of "Community TipBot"
- ✅ Footer showing HTML tags `<i>Powered by Aegisum EcoSystem</i>`
- ✅ Add web dashboard for easy management
- ✅ Enable domain access (TGTIPBOT.aegisum.co.za)

---

## 📋 Prerequisites

Make sure you have:
- Ubuntu server with root access
- Node.js installed (v16 or higher)
- PM2 installed globally
- Your coin daemons running (AEGS, SHIC, PEPE, ADVC)
- Your Telegram bot token from @BotFather

---

## 🔧 Step-by-Step Fix Instructions

### Step 1: Navigate to your bot directory
```bash
cd /path/to/your/Community-Tipbot-TG/Aegisum-TG-tipbot-initial-implementation
```

### Step 2: Pull the latest fixes
```bash
git pull origin main
```

### Step 3: Install dependencies
```bash
npm install
```

### Step 4: Configure your .env file
```bash
cp .env.example .env  # if .env doesn't exist
nano .env
```

**Update these values in your .env file:**
```env
# Your real Telegram bot token
TELEGRAM_BOT_TOKEN=your_actual_bot_token_here

# Your real RPC credentials
AEGS_RPC_USER=your_actual_aegs_user
AEGS_RPC_PASS=your_actual_aegs_password
SHIC_RPC_USER=your_actual_shic_user
SHIC_RPC_PASS=your_actual_shic_password
PEPE_RPC_USER=your_actual_pepe_user
PEPE_RPC_PASS=your_actual_pepe_password
ADVC_RPC_USER=your_actual_advc_user
ADVC_RPC_PASS=your_actual_advc_password

# Dashboard settings
DASHBOARD_PORT=12000
DASHBOARD_PASSWORD=admin123
```

### Step 5: Run the complete fix script
```bash
chmod +x COMPLETE_FIX_SCRIPT.sh
./COMPLETE_FIX_SCRIPT.sh
```

### Step 6: Verify everything is working
```bash
# Check if bot and dashboard are running
pm2 list

# Check bot logs
pm2 logs community-tipbot

# Check dashboard logs  
pm2 logs tipbot-dashboard
```

---

## 🌐 Web Dashboard Access

### Local Access:
- URL: `http://localhost:12000`
- Username: `admin`
- Password: `admin123`

### Domain Setup (TGTIPBOT.aegisum.co.za):

1. **Install Nginx:**
```bash
sudo apt update
sudo apt install nginx
```

2. **Create Nginx configuration:**
```bash
sudo nano /etc/nginx/sites-available/tgtipbot.aegisum.co.za
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name tgtipbot.aegisum.co.za;

    location / {
        proxy_pass http://localhost:12000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Enable the site:**
```bash
sudo ln -s /etc/nginx/sites-available/tgtipbot.aegisum.co.za /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. **Install SSL certificate:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tgtipbot.aegisum.co.za
```

---

## 🧪 Testing Your Bot

### Test these commands in Telegram:

1. **Start the bot:**
   ```
   /start
   ```
   Should show: "🌟 Welcome to Community TipBot!"

2. **Check balance:**
   ```
   /balance
   ```
   Should show AEGS balance correctly (not 0 if you have deposits)

3. **Get deposit addresses:**
   ```
   /deposit
   ```
   Should show clean footer: "Powered by Aegisum EcoSystem" (no HTML tags)

4. **Check transaction history:**
   ```
   /history
   ```
   Should show your transaction history

---

## 🎛️ Dashboard Features

Your web dashboard includes:

### 📊 Overview Page:
- Real-time user count
- Total transactions
- Active balances
- System status

### 👥 User Management:
- View all users
- Check user balances
- User activity logs

### 💰 Transaction Logs:
- Real-time transaction monitoring
- Filter by coin type
- Export transaction data

### ⚙️ Settings:
- Adjust transaction fees
- Add new coins (BTC, LTC, etc.)
- Configure bot settings
- Backup/restore data

### 📈 Live Monitoring:
- Real-time logs
- System performance
- RPC connection status

---

## 🔧 Adding More Coins (BTC, LTC, etc.)

To add Bitcoin or Litecoin:

1. **Access the dashboard settings**
2. **Go to "Coin Management"**
3. **Click "Add New Coin"**
4. **Fill in the details:**
   - Coin symbol (BTC, LTC)
   - RPC host/port
   - RPC credentials
   - Confirmation requirements

The system will automatically:
- Generate new wallet addresses
- Start monitoring the blockchain
- Add the coin to all bot commands

---

## 🚨 Troubleshooting

### If AEGS balance still shows 0:
```bash
# Test RPC connection
node test_rpc_connections.js

# Check AEGS daemon
aegs-cli getinfo

# Restart bot with debug
pm2 restart community-tipbot --watch
pm2 logs community-tipbot
```

### If deposit notifications aren't working:
```bash
# Check blockchain monitor
pm2 logs community-tipbot | grep "deposit"

# Restart blockchain monitor
pm2 restart community-tipbot
```

### If dashboard won't start:
```bash
# Check port availability
netstat -tulpn | grep 12000

# Start dashboard manually
node start_dashboard.js
```

---

## 📱 Bot Commands Reference

| Command | Description |
|---------|-------------|
| `/start` | Initialize wallet |
| `/balance` | Check all coin balances |
| `/deposit` | Get deposit addresses |
| `/history` | View transaction history |
| `/tip @user amount coin` | Tip another user |
| `/withdraw address amount coin` | Withdraw to external address |
| `/rain amount coin` | Rain coins to active users |

---

## 🎉 Success Checklist

- [ ] Bot responds with "Community TipBot" (not "Aegisum Tip Bot")
- [ ] AEGS balance shows correct amount (not 0)
- [ ] Footer shows clean text (no HTML tags)
- [ ] Deposit notifications working
- [ ] Dashboard accessible at http://localhost:12000
- [ ] All RPC connections working
- [ ] Transaction history showing
- [ ] Domain access working (if configured)

---

## 🆘 Need Help?

If you encounter any issues:

1. **Check the logs:**
   ```bash
   pm2 logs community-tipbot
   pm2 logs tipbot-dashboard
   ```

2. **Restart everything:**
   ```bash
   pm2 restart all
   ```

3. **Run the fix script again:**
   ```bash
   ./COMPLETE_FIX_SCRIPT.sh
   ```

Your Community TipBot should now be working perfectly! 🚀