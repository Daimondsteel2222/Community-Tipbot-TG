#!/bin/bash

echo "🚀 Community TipBot Quick Start Script"
echo "======================================"
echo ""

# Check if .env file exists and has proper configuration
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please copy .env.sample to .env and configure it first"
    exit 1
fi

# Check for Telegram bot token
if grep -q "your_telegram_bot_token_here" .env; then
    echo "❌ Telegram bot token not configured!"
    echo "Please edit .env file and set your TELEGRAM_BOT_TOKEN"
    echo "Get your token from @BotFather on Telegram"
    exit 1
fi

# Check for AEGS RPC configuration
if grep -q "your_aegs_rpc_user" .env; then
    echo "❌ AEGS RPC credentials not configured!"
    echo "Please edit .env file and set your AEGS RPC credentials"
    exit 1
fi

echo "✅ Configuration looks good!"
echo ""

# Install dependencies if needed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing main dependencies..."
    npm install
fi

if [ ! -d "web-dashboard/node_modules" ]; then
    echo "Installing dashboard dependencies..."
    cd web-dashboard && npm install && cd ..
fi

# Install PM2 if not available
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

echo "✅ Dependencies ready!"
echo ""

# Create data directory
mkdir -p data
mkdir -p logs

echo "🔍 Testing AEGS connection..."
node debug_aegs_issue.js

echo ""
echo "🚀 Starting services..."

# Stop any existing processes
pm2 delete community-tipbot 2>/dev/null || true
pm2 delete tipbot-dashboard 2>/dev/null || true

# Start the bot
echo "Starting Community TipBot..."
pm2 start src/index.js --name "community-tipbot" --log-file logs/bot.log --error-file logs/bot-error.log

# Start the dashboard
echo "Starting Web Dashboard..."
pm2 start web-dashboard/server.js --name "tipbot-dashboard" --log-file logs/dashboard.log --error-file logs/dashboard-error.log

echo ""
echo "📊 Service Status:"
pm2 status

echo ""
echo "🎉 Community TipBot Started!"
echo ""
echo "📱 Bot Commands:"
echo "   /start - Initialize wallet"
echo "   /balance - Check balances"
echo "   /deposit - Get deposit addresses"
echo "   /history - View transaction history"
echo ""
echo "🌐 Web Dashboard:"
echo "   URL: http://localhost:12000"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📝 Useful Commands:"
echo "   pm2 logs community-tipbot    # View bot logs"
echo "   pm2 logs tipbot-dashboard    # View dashboard logs"
echo "   pm2 restart community-tipbot # Restart bot"
echo "   pm2 status                   # Check status"
echo ""
echo "🔍 If AEGS balance shows 0:"
echo "   1. Make sure AEGS daemon is running"
echo "   2. Send test AEGS to your deposit address"
echo "   3. Wait for 1+ confirmations"
echo "   4. Check /balance again"
echo ""
echo "Happy tipping! 🎉"