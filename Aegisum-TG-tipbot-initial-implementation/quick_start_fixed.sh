#!/bin/bash

echo "🚀 COMMUNITY TIPBOT - QUICK START"
echo "================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📋 Please copy .env.example to .env and configure it:"
    echo "   cp .env.example .env"
    echo "   nano .env"
    echo ""
    echo "🔧 Then configure your:"
    echo "   - Telegram bot token"
    echo "   - RPC credentials for all coins"
    echo ""
    exit 1
fi

echo "📋 Step 1: Testing RPC connections..."
node test_rpc_connections.js

echo ""
echo "📋 Step 2: Starting bot with PM2..."
pm2 stop tipbot 2>/dev/null || true
pm2 delete tipbot 2>/dev/null || true
pm2 start src/app.js --name tipbot

echo ""
echo "📋 Step 3: Starting web dashboard..."
pm2 stop dashboard 2>/dev/null || true
pm2 delete dashboard 2>/dev/null || true
pm2 start start_dashboard.js --name dashboard

echo ""
echo "📊 Current PM2 status:"
pm2 status

echo ""
echo "🌐 Web Dashboard: http://localhost:12000"
echo "🔑 Dashboard Password: admin123"
echo ""
echo "📋 To check logs:"
echo "   pm2 logs tipbot"
echo "   pm2 logs dashboard"
echo ""
echo "🎉 Community TipBot is starting up!"
echo "   Test with /start command in Telegram"
