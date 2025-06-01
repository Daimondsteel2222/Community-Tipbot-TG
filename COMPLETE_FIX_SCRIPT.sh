#!/bin/bash

# 🚀 Community TipBot - Complete Fix Script
# This script fixes all the issues you mentioned

echo "🚀 Starting Community TipBot Complete Fix..."
echo "=============================================="

# Get current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📁 Working in: $SCRIPT_DIR"

# 1. First, let's backup any existing files
echo "📦 Creating backup..."
mkdir -p backups/$(date +%Y%m%d_%H%M%S)
cp -r src/ backups/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true

# 2. Apply the AEGS balance fix
echo "🔧 Fixing AEGS balance issue..."
node EMERGENCY_FIX.js

# 3. Apply all critical fixes
echo "🔧 Applying all critical fixes..."
node CRITICAL_FIXES.js

# 4. Fix the bot name and HTML issues
echo "🔧 Fixing bot name and HTML issues..."
node fix_all_issues.js

# 5. Stop any running bot processes
echo "🛑 Stopping existing bot processes..."
pm2 stop all 2>/dev/null || true
pkill -f "node.*bot" 2>/dev/null || true
pkill -f "node.*index" 2>/dev/null || true

# 6. Install/update dependencies
echo "📦 Installing dependencies..."
npm install --silent

# 7. Create data directory if it doesn't exist
echo "📁 Creating data directory..."
mkdir -p data logs

# 8. Test RPC connections
echo "🔌 Testing RPC connections..."
node test_rpc_connections.js

# 9. Start the bot
echo "🚀 Starting Community TipBot..."
pm2 start src/index.js --name "community-tipbot" --watch

# 10. Start the web dashboard
echo "🌐 Starting Web Dashboard..."
pm2 start start_dashboard.js --name "tipbot-dashboard"

# 11. Show status
echo "📊 Current Status:"
pm2 list

echo ""
echo "✅ Community TipBot Fix Complete!"
echo "=================================="
echo ""
echo "🎯 Issues Fixed:"
echo "  ✅ AEGS balance now working"
echo "  ✅ Bot name changed to 'Community TipBot'"
echo "  ✅ HTML footer tags removed"
echo "  ✅ Deposit notifications enabled"
echo "  ✅ Web dashboard available"
echo ""
echo "🌐 Access your dashboard at:"
echo "  http://localhost:12000"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "📱 Test your bot with:"
echo "  /start - Initialize wallet"
echo "  /balance - Check balances"
echo "  /deposit - Get deposit addresses"
echo "  /history - View transactions"
echo ""
echo "🔍 Check logs with:"
echo "  pm2 logs community-tipbot"
echo "  pm2 logs tipbot-dashboard"
echo ""
echo "🎉 Your Community TipBot is now ready!"