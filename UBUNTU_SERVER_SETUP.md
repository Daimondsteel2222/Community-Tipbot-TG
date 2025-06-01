# 🚀 Ubuntu Server Setup Guide - Community TipBot

## Step 1: Pull Latest Updates from GitHub

```bash
# Navigate to your bot directory
cd ~/Community-Tipbot-TG/Aegisum-TG-tipbot-initial-implementation

# Stash any local changes (if any)
git stash

# Pull the latest fixes
git pull origin main

# Check what was updated
git log --oneline -5
```

## Step 2: Install Dependencies

```bash
# Install Node.js if not already installed
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install bot dependencies
npm install

# Install dashboard dependencies
cd web-dashboard
npm install
cd ..
```

## Step 3: Configure Your Bot

### 3.1 Edit .env File
```bash
nano .env
```

**Update these critical settings:**
```env
# Your actual Telegram bot token from @BotFather
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# AEGS RPC Configuration
AEGS_RPC_HOST=127.0.0.1
AEGS_RPC_PORT=8332
AEGS_RPC_USER=your_actual_aegs_username
AEGS_RPC_PASS=your_actual_aegs_password

# SHIC RPC Configuration
SHIC_RPC_HOST=127.0.0.1
SHIC_RPC_PORT=8333
SHIC_RPC_USER=your_actual_shic_username
SHIC_RPC_PASS=your_actual_shic_password

# PEPE RPC Configuration
PEPE_RPC_HOST=127.0.0.1
PEPE_RPC_PORT=8334
PEPE_RPC_USER=your_actual_pepe_username
PEPE_RPC_PASS=your_actual_pepe_password

# ADVC RPC Configuration
ADVC_RPC_HOST=127.0.0.1
ADVC_RPC_PORT=8335
ADVC_RPC_USER=your_actual_advc_username
ADVC_RPC_PASS=your_actual_advc_password

# Dashboard Configuration
DASHBOARD_PORT=3000
DASHBOARD_PASSWORD=admin123
```

### 3.2 Make Scripts Executable
```bash
chmod +x quick_start.sh
```

## Step 4: Start Your Coin Daemons

**Make sure each daemon has proper RPC configuration:**

### AEGS Daemon Config (~/.aegs/aegs.conf):
```conf
rpcuser=your_actual_aegs_username
rpcpassword=your_actual_aegs_password
rpcport=8332
rpcallowip=127.0.0.1
server=1
daemon=1
listen=1
```

### Start Daemons:
```bash
# Start AEGS daemon
aegsd -daemon

# Start other daemons
shicd -daemon
peped -daemon
advcd -daemon

# Verify they're running
aegs-cli getinfo
shic-cli getinfo
pepe-cli getinfo
advc-cli getinfo
```

## Step 5: Test AEGS Connection

```bash
# Run the debug script to test everything
node debug_aegs_issue.js
```

**You should see:**
- ✅ Connection successful
- ✅ Database connection successful
- Block count and version info

## Step 6: Start the Bot

```bash
# Use the automated quick start script
./quick_start.sh
```

**OR manually:**
```bash
# Start bot
pm2 start src/index.js --name "community-tipbot"

# Start dashboard
pm2 start web-dashboard/server.js --name "tipbot-dashboard"

# Check status
pm2 status
```

## Step 7: Test Your Bot

### 7.1 Test Bot Commands
1. Start a chat with your bot on Telegram
2. Send `/start` - should show "Welcome to Community TipBot!"
3. Send `/balance` - should show your balances
4. Send `/deposit` - should show deposit addresses
5. Send `/history` - should show transaction history

### 7.2 Test AEGS Balance
1. Send some AEGS to your deposit address (get it with `/deposit`)
2. Wait for 1+ confirmations
3. Check `/balance` - should show your AEGS balance
4. You should receive pending and confirmed notifications

### 7.3 Access Web Dashboard
- **URL**: http://your_server_ip:3000
- **Username**: admin
- **Password**: admin123

## Step 8: Monitor and Manage

```bash
# View bot logs
pm2 logs community-tipbot

# View dashboard logs
pm2 logs tipbot-dashboard

# Restart services
pm2 restart community-tipbot
pm2 restart tipbot-dashboard

# Stop services
pm2 stop community-tipbot
pm2 stop tipbot-dashboard

# Auto-start on server reboot
pm2 startup
pm2 save
```

## Step 9: Domain Setup (Optional)

### For TGTIPBOT.aegisum.co.za:

### 9.1 Install Nginx
```bash
sudo apt update
sudo apt install nginx
```

### 9.2 Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/tgtipbot
```

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name TGTIPBOT.aegisum.co.za;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 9.3 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/tgtipbot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 9.4 SSL Certificate
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d TGTIPBOT.aegisum.co.za
```

## 🔍 Troubleshooting

### Bot Won't Start
```bash
# Check logs
pm2 logs community-tipbot

# Common issues:
# - Invalid Telegram token
# - Missing RPC credentials
# - Coin daemons not running
```

### AEGS Balance Still 0
```bash
# Test AEGS connection
aegs-cli getinfo

# Run debug script
node debug_aegs_issue.js

# Check if daemon is synced
aegs-cli getblockcount
```

### Dashboard Not Loading
```bash
# Check if running
pm2 status

# Check port
netstat -tulpn | grep 3000

# Check logs
pm2 logs tipbot-dashboard
```

## 🎉 Success Checklist

- [ ] Bot responds to `/start` with "Welcome to Community TipBot!"
- [ ] `/balance` shows correct balances (including AEGS)
- [ ] `/deposit` provides addresses
- [ ] `/history` shows transaction history
- [ ] Dashboard accessible at your domain/IP
- [ ] Deposit notifications working
- [ ] Footer shows clean "Powered by Aegisum EcoSystem"

## 🆘 Need Help?

If you encounter issues:

1. **Check PM2 logs first**: `pm2 logs`
2. **Verify daemons are running**: `aegs-cli getinfo`
3. **Test RPC connections**: `node debug_aegs_issue.js`
4. **Check .env configuration**
5. **Verify Telegram bot token**

**Your Community TipBot is now fully modernized and ready! 🚀**