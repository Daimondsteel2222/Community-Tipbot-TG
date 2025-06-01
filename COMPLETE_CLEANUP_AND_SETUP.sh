#!/bin/bash

echo "🧹 COMPLETE CLEANUP AND SETUP SCRIPT"
echo "======================================"

# Stop all PM2 processes
echo "🛑 Stopping all PM2 processes..."
pm2 stop all
pm2 delete all

# Remove old tipbot directory
echo "🗑️ Removing old tipbot directory..."
cd ~
rm -rf Community-Tipbot-TG

# Clone fresh repository
echo "📥 Cloning fresh repository..."
git clone https://github.com/Daimondsteel2222/Community-Tipbot-TG.git
cd Community-Tipbot-TG/Aegisum-TG-tipbot-initial-implementation

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file
echo "⚙️ Creating .env file..."
cat > .env << 'EOF'
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=7729729729:AAGCJhKJHKJHKJHKJHKJHKJHKJHKJHKJHKJ

# Database Configuration
DATABASE_PATH=./data/tipbot.db

# RPC Configuration for AEGS
AEGS_RPC_HOST=127.0.0.1
AEGS_RPC_PORT=29200
AEGS_RPC_USER=aegisumrpc
AEGS_RPC_PASSWORD=your_aegs_rpc_password

# RPC Configuration for SHIC
SHIC_RPC_HOST=127.0.0.1
SHIC_RPC_PORT=22555
SHIC_RPC_USER=shibacoind
SHIC_RPC_PASSWORD=your_shic_rpc_password

# RPC Configuration for PEPE
PEPE_RPC_HOST=127.0.0.1
PEPE_RPC_PORT=29344
PEPE_RPC_USER=pepecoind
PEPE_RPC_PASSWORD=your_pepe_rpc_password

# RPC Configuration for ADVC
ADVC_RPC_HOST=127.0.0.1
ADVC_RPC_PORT=22555
ADVC_RPC_USER=adventurecoind
ADVC_RPC_PASSWORD=your_advc_rpc_password

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/combined.log

# Security
ENCRYPTION_KEY=your_32_character_encryption_key_here

# Bot Configuration
BOT_NAME=Community Tip Bot
SUPPORTED_COINS=AEGS,SHIC,PEPE,ADVC
MIN_CONFIRMATIONS=1
TRANSACTION_FEE=0.001

# Dashboard Configuration
DASHBOARD_PORT=3000
DASHBOARD_SECRET=your_dashboard_secret_here
EOF

echo "📝 Please edit the .env file with your actual values:"
echo "   - TELEGRAM_BOT_TOKEN (your actual bot token)"
echo "   - RPC passwords for each coin"
echo "   - ENCRYPTION_KEY (32 characters)"
echo ""
echo "Press Enter when you've updated the .env file..."
read

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Create data directory
echo "📁 Creating data directory..."
mkdir -p data

# Test RPC connections
echo "🔌 Testing RPC connections..."
node -e "
const fs = require('fs');
require('dotenv').config();

const coins = ['AEGS', 'SHIC', 'PEPE', 'ADVC'];
const axios = require('axios');

async function testRPC(coin) {
    try {
        const host = process.env[\`\${coin}_RPC_HOST\`];
        const port = process.env[\`\${coin}_RPC_PORT\`];
        const user = process.env[\`\${coin}_RPC_USER\`];
        const password = process.env[\`\${coin}_RPC_PASSWORD\`];
        
        const response = await axios.post(\`http://\${host}:\${port}\`, {
            jsonrpc: '1.0',
            id: 'test',
            method: 'getblockchaininfo',
            params: []
        }, {
            auth: { username: user, password: password },
            timeout: 5000
        });
        
        console.log(\`✅ \${coin}: Connected (Block height: \${response.data.result.blocks})\`);
        return true;
    } catch (error) {
        console.log(\`❌ \${coin}: Failed - \${error.message}\`);
        return false;
    }
}

async function testAll() {
    console.log('Testing RPC connections...');
    let allGood = true;
    
    for (const coin of coins) {
        const result = await testRPC(coin);
        if (!result) allGood = false;
    }
    
    if (allGood) {
        console.log('\\n🎉 All RPC connections working!');
    } else {
        console.log('\\n⚠️ Some RPC connections failed. Please check your daemon configurations.');
    }
}

testAll().catch(console.error);
"

echo ""
echo "🚀 Starting the bot..."
pm2 start src/index.js --name "community-tipbot"

echo ""
echo "📊 Checking bot status..."
sleep 3
pm2 logs community-tipbot --lines 10

echo ""
echo "✅ Setup complete!"
echo ""
echo "Commands to manage your bot:"
echo "  pm2 logs community-tipbot     # View logs"
echo "  pm2 restart community-tipbot  # Restart bot"
echo "  pm2 stop community-tipbot     # Stop bot"
echo "  pm2 status                    # Check status"
echo ""
echo "🎉 Your Community Tip Bot should now be running!"