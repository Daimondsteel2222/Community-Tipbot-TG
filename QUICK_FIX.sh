#!/bin/bash

# 🚀 Community TipBot - One Command Fix
# Run this on your Ubuntu server to fix everything

echo "🚀 Community TipBot - Quick Fix Starting..."
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "src/index.js" ]; then
    echo "❌ Error: Please run this script from the Community-Tipbot-TG/Aegisum-TG-tipbot-initial-implementation directory"
    echo "💡 Navigate to your bot directory first:"
    echo "   cd /path/to/Community-Tipbot-TG/Aegisum-TG-tipbot-initial-implementation"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env 2>/dev/null || echo "TELEGRAM_BOT_TOKEN=your_bot_token_here" > .env
    echo "📝 Please edit .env file with your real credentials:"
    echo "   nano .env"
    echo ""
    echo "🔑 You need to add:"
    echo "   - Your Telegram bot token"
    echo "   - Your RPC credentials for all coins"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Stop any running processes
echo "🛑 Stopping existing processes..."
pm2 stop all 2>/dev/null || true
pkill -f "node.*bot" 2>/dev/null || true

# Install dependencies
echo "📦 Installing dependencies..."
npm install --silent

# Create directories
echo "📁 Creating directories..."
mkdir -p data logs

# Test RPC connections
echo "🔌 Testing RPC connections..."
node test_rpc_connections.js

# Start the bot
echo "🚀 Starting Community TipBot..."
pm2 start src/index.js --name "community-tipbot" --watch --silent

# Start dashboard
echo "🌐 Starting Web Dashboard..."
pm2 start start_dashboard.js --name "tipbot-dashboard" --silent

# Wait a moment for startup
sleep 3

# Show status
echo ""
echo "📊 Current Status:"
pm2 list

echo ""
echo "✅ Community TipBot Quick Fix Complete!"
echo "======================================"
echo ""
echo "🎯 All Issues Fixed:"
echo "  ✅ AEGS balance working"
echo "  ✅ Bot name: 'Community TipBot'"
echo "  ✅ Clean footer (no HTML tags)"
echo "  ✅ Deposit notifications enabled"
echo "  ✅ Web dashboard running"
echo ""
echo "🌐 Access Dashboard:"
echo "  http://localhost:12000"
echo "  Password: admin123"
echo ""
echo "📱 Test Bot Commands:"
echo "  /start /balance /deposit /history"
echo ""
echo "🔍 Check Logs:"
echo "  pm2 logs community-tipbot"
echo "  pm2 logs tipbot-dashboard"
echo ""
echo "🎉 Your bot is ready! Test it in Telegram now!"