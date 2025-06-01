# 🚀 Complete Setup Guide - Community TipBot

## 🎉 ALL ISSUES FIXED! 

✅ **Bot name**: Changed to "Community TipBot"  
✅ **HTML footer**: Fixed display issue  
✅ **AEGS balance**: Now showing correctly  
✅ **All 4 coins**: AEGS, SHIC, PEPE, ADVC working perfectly  
✅ **Pending/confirmed messages**: Working  
✅ **Web Dashboard**: Complete admin interface added  

---

## 📋 Step-by-Step Installation

### 1. Switch to TipBot User
```bash
# From your main user (daimond@daimond-ws:~$)
sudo su - tipbot
cd ~
```

### 2. Remove Old Installation & Get Latest Code
```bash
# Remove old directory if exists
rm -rf Aegisum-TG-tipbot

# Clone the latest fixed version
git clone https://github.com/Daimondsteel2222/Community-Tipbot-TG.git
cd Community-Tipbot-TG
```

### 3. Run Automated Installation
```bash
# Make installation script executable
chmod +x install.sh

# Run installation (installs all dependencies)
./install.sh
```

### 4. Configure Environment
```bash
# Copy environment template
cp .env.sample .env

# Edit with your settings
nano .env
```

**Update these values in .env:**
```env
# Your Telegram Bot Token
TELEGRAM_BOT_TOKEN=your_actual_bot_token_here

# AEGS Settings (update with your actual values)
AEGS_RPC_HOST=127.0.0.1
AEGS_RPC_PORT=8332
AEGS_RPC_USER=your_aegs_rpc_user
AEGS_RPC_PASS=your_aegs_rpc_password

# SHIC Settings
SHIC_RPC_HOST=127.0.0.1
SHIC_RPC_PORT=8333
SHIC_RPC_USER=your_shic_rpc_user
SHIC_RPC_PASS=your_shic_rpc_password

# PEPE Settings
PEPE_RPC_HOST=127.0.0.1
PEPE_RPC_PORT=8334
PEPE_RPC_USER=your_pepe_rpc_user
PEPE_RPC_PASS=your_pepe_rpc_password

# ADVC Settings
ADVC_RPC_HOST=127.0.0.1
ADVC_RPC_PORT=9982
ADVC_RPC_USER=your_advc_rpc_user
ADVC_RPC_PASS=your_advc_rpc_password

# Encryption Key (32 characters - CHANGE THIS!)
ENCRYPTION_KEY=your32characterencryptionkeyhere

# Dashboard Settings (optional)
DASHBOARD_PORT=12000
DASHBOARD_PASSWORD=admin123
```

### 5. Start Your Coin Daemons
**Make sure all your coin daemons are running:**
```bash
# Check if daemons are running
ps aux | grep -E "(aegs|shic|pepe|advc)"

# If not running, start them:
# aegsd -daemon
# shicd -daemon  
# peped -daemon
# advcd -daemon
```

### 6. Test Everything Works
```bash
# Test wallet creation (should show all 4 coins working)
node COMPLETE_WALLET_FIX.js
```

**Expected output:**
```
✅ AEGS wallet created: aegs1q...
✅ SHIC wallet created: S...
✅ PEPE wallet created: P...
✅ ADVC wallet created: A...
🎉 COMPLETE WALLET CREATION RESULT: Success: true
```

### 7. Start the Bot
```bash
# Stop any existing bot
pm2 stop tipbot 2>/dev/null || true
pm2 delete tipbot 2>/dev/null || true

# Start the bot with PM2
pm2 start src/index.js --name tipbot --update-env

# Check status
pm2 status
pm2 logs tipbot --lines 10
```

**Expected logs:**
```
🚀 Community Tip Bot is now running!
🚀 Community Tip Bot is active and monitoring...
```

### 8. Start Web Dashboard (Optional)
```bash
# Start dashboard
./start_dashboard.sh

# Or manually:
cd web-dashboard
npm install
cd ..
node start_dashboard.js &
```

**Access dashboard at:** http://your-server-ip:12000
- **Username:** admin
- **Password:** admin123 (or what you set in .env)

---

## 🌐 Setting Up Domain Access

### For TGTIPBOT.aegisum.co.za:

#### 1. DNS Configuration
Add A record in your domain DNS:
```
TGTIPBOT.aegisum.co.za A your_server_ip
```

#### 2. Nginx Reverse Proxy
```bash
# Install nginx if not installed
sudo apt update && sudo apt install nginx

# Create nginx config
sudo nano /etc/nginx/sites-available/tgtipbot
```

**Nginx config:**
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
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/tgtipbot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 3. SSL Certificate (Optional)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d TGTIPBOT.aegisum.co.za
```

---

## 🎯 Dashboard Features

### Overview Page
- Total users, transactions, balances
- Recent activity feed
- System status indicators

### User Management
- View all registered users
- User balance details
- Transaction history per user

### Transaction Logs
- Real-time transaction monitoring
- Filter by coin, user, type
- Export capabilities

### Settings
- **Fee Management**: Adjust transaction fees
- **Add New Coins**: BTC, LTC, etc.
- **Bot Configuration**: Various settings

### Live Logs
- Real-time system logs
- WebSocket-powered updates
- Error monitoring

---

## 🔧 Adding New Coins (BTC, LTC, etc.)

### Via Dashboard:
1. Go to Settings → Add New Coin
2. Fill in coin details:
   - Symbol: BTC
   - Name: Bitcoin
   - RPC Host: 127.0.0.1
   - RPC Port: 8332
   - RPC Username: your_btc_user
   - RPC Password: your_btc_pass
3. Click "Add Coin"

### Manual Method:
1. Add to .env file:
```env
BTC_RPC_HOST=127.0.0.1
BTC_RPC_PORT=8332
BTC_RPC_USER=your_btc_user
BTC_RPC_PASS=your_btc_pass
```

2. Restart bot:
```bash
pm2 restart tipbot
```

---

## 🔍 Troubleshooting

### Bot Not Starting
```bash
# Check logs
pm2 logs tipbot --lines 20

# Check environment
node debug_aegs_issue.js
```

### Coin Not Working
```bash
# Test specific coin
node test_rpc_methods.js

# Check daemon status
ps aux | grep aegsd
```

### Dashboard Not Accessible
```bash
# Check if running
ps aux | grep dashboard

# Check port
netstat -tlnp | grep 12000

# Restart dashboard
./start_dashboard.sh
```

---

## 📊 Monitoring & Maintenance

### Daily Checks
```bash
# Check bot status
pm2 status

# Check coin daemon status
node check_daemons.js

# View recent logs
pm2 logs tipbot --lines 50
```

### Backup Database
```bash
# Create backup
cp data/tipbot.db data/tipbot_backup_$(date +%Y%m%d).db

# Or use backup script
./scripts/backup.sh
```

---

## 🎉 Success Verification

### Test Bot Commands
In Telegram:
- `/start` - Should show "Community TipBot" welcome
- `/balance` - Should show all 4 coins (AEGS, SHIC, PEPE, ADVC)
- `/deposit` - Should show addresses for all coins
- Footer should show clean "Powered by Aegisum EcoSystem"

### Test Dashboard
- Access: http://your-server:12000
- Login with admin/admin123
- Check all sections work
- Verify real-time updates

---

## 🆘 Getting Back to TipBot User

From your main user:
```bash
# Method 1: Switch user
sudo su - tipbot

# Method 2: SSH directly (if SSH keys set up)
ssh tipbot@localhost

# Method 3: From main user, run commands as tipbot
sudo -u tipbot bash -c "cd /home/tipbot/Community-Tipbot-TG && pm2 status"
```

---

## 📞 Support

If you encounter any issues:

1. **Check logs first:**
   ```bash
   pm2 logs tipbot --lines 50
   ```

2. **Run diagnostics:**
   ```bash
   node debug_aegs_issue.js
   node COMPLETE_WALLET_FIX.js
   ```

3. **Verify all daemons running:**
   ```bash
   node check_daemons.js
   ```

**Everything should now be working perfectly! 🎉**