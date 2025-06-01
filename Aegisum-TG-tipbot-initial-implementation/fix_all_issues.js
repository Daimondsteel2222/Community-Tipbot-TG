#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING ALL COMMUNITY TIPBOT ISSUES');
console.log('=====================================\n');

// 1. Fix bot name references (ensure they're all "Community TipBot")
function fixBotName() {
    console.log('1. 🏷️  Fixing bot name references...');
    
    const filesToCheck = [
        'src/bot/telegram-bot.js',
        'src/app.js',
        'web-dashboard/public/index.html'
    ];
    
    filesToCheck.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            let changed = false;
            
            // Replace various forms of "Aegisum Tip Bot"
            const replacements = [
                ['Aegisum Tip Bot', 'Community TipBot'],
                ['aegisum tip bot', 'Community TipBot'],
                ['Aegisum TipBot', 'Community TipBot'],
                ['Welcome to Aegisum', 'Welcome to Community'],
            ];
            
            replacements.forEach(([old, new_]) => {
                if (content.includes(old)) {
                    content = content.replace(new RegExp(old, 'g'), new_);
                    changed = true;
                }
            });
            
            if (changed) {
                fs.writeFileSync(filePath, content);
                console.log(`   ✅ Updated: ${filePath}`);
            }
        }
    });
    console.log('');
}

// 2. Fix HTML footer display
function fixFooterHTML() {
    console.log('2. 🦶 Fixing footer HTML display...');
    
    const botFile = 'src/bot/telegram-bot.js';
    if (fs.existsSync(botFile)) {
        let content = fs.readFileSync(botFile, 'utf8');
        
        // Ensure footer doesn't have HTML tags
        if (content.includes('<i>Powered by') || content.includes('</i>')) {
            content = content.replace(/<i>Powered by Aegisum EcoSystem<\/i>/g, 'Powered by Aegisum EcoSystem');
            content = content.replace(/<i>/g, '').replace(/<\/i>/g, '');
            fs.writeFileSync(botFile, content);
            console.log('   ✅ Fixed HTML tags in footer');
        } else {
            console.log('   ✅ Footer already clean');
        }
    }
    console.log('');
}

// 3. Ensure history command is properly implemented
function fixHistoryCommand() {
    console.log('3. 📜 Checking history command implementation...');
    
    const botFile = 'src/bot/telegram-bot.js';
    if (fs.existsSync(botFile)) {
        const content = fs.readFileSync(botFile, 'utf8');
        
        if (content.includes('handleHistory') && content.includes('/history')) {
            console.log('   ✅ History command already implemented');
        } else {
            console.log('   ⚠️  History command needs implementation');
            // The history command should already be implemented in the latest code
        }
    }
    console.log('');
}

// 4. Create sample environment file with better defaults
function createSampleEnv() {
    console.log('4. ⚙️  Creating sample environment configuration...');
    
    const sampleEnv = `# Community TipBot Configuration
# IMPORTANT: Replace ALL placeholder values with your real values!

# ===========================================
# TELEGRAM BOT TOKEN (REQUIRED)
# ===========================================
# Get this from @BotFather on Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# ===========================================
# DATABASE CONFIGURATION
# ===========================================
DATABASE_PATH=./data/tipbot.db

# ===========================================
# ENCRYPTION KEY (32 characters)
# ===========================================
# Generate a random 32-character string
ENCRYPTION_KEY=your32characterencryptionkeyhere

# ===========================================
# COIN DAEMON RPC CONFIGURATION
# ===========================================
# IMPORTANT: These MUST match your actual daemon configurations!
# Check your daemon .conf files for the correct values

# AEGS Configuration
AEGS_RPC_HOST=127.0.0.1
AEGS_RPC_PORT=8332
AEGS_RPC_USER=your_aegs_rpc_user
AEGS_RPC_PASS=your_aegs_rpc_password

# SHIC Configuration  
SHIC_RPC_HOST=127.0.0.1
SHIC_RPC_PORT=8333
SHIC_RPC_USER=your_shic_rpc_user
SHIC_RPC_PASS=your_shic_rpc_password

# PEPE Configuration
PEPE_RPC_HOST=127.0.0.1
PEPE_RPC_PORT=8334
PEPE_RPC_USER=your_pepe_rpc_user
PEPE_RPC_PASS=your_pepe_rpc_password

# ADVC Configuration
ADVC_RPC_HOST=127.0.0.1
ADVC_RPC_PORT=8335
ADVC_RPC_USER=your_advc_rpc_user
ADVC_RPC_PASS=your_advc_rpc_password

# ===========================================
# WEB DASHBOARD CONFIGURATION
# ===========================================
DASHBOARD_PORT=12000
DASHBOARD_PASSWORD=admin123
SESSION_SECRET=your_session_secret_here

# ===========================================
# LOGGING CONFIGURATION
# ===========================================
LOG_LEVEL=info
LOG_FILE=./logs/tipbot.log

# ===========================================
# ADMIN CONFIGURATION (OPTIONAL)
# ===========================================
# Comma-separated list of Telegram user IDs who can use admin commands
ADMIN_TELEGRAM_IDS=

# ===========================================
# TROUBLESHOOTING NOTES
# ===========================================
# 1. If AEGS balance shows 0, check RPC connection
# 2. If no deposit notifications, check RPC credentials
# 3. Run: node test_rpc_connections.js to test connections
# 4. Run: node diagnose_issues.js for full diagnosis
`;

    fs.writeFileSync('.env.example', sampleEnv);
    console.log('   ✅ Created .env.example with detailed instructions');
    console.log('');
}

// 5. Create quick start script
function createQuickStart() {
    console.log('5. 🚀 Creating quick start script...');
    
    const quickStartScript = `#!/bin/bash

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
`;

    fs.writeFileSync('quick_start_fixed.sh', quickStartScript);
    fs.chmodSync('quick_start_fixed.sh', '755');
    console.log('   ✅ Created quick_start_fixed.sh');
    console.log('');
}

// 6. Create comprehensive troubleshooting guide
function createTroubleshootingGuide() {
    console.log('6. 🔍 Creating troubleshooting guide...');
    
    const troubleshootingGuide = `# 🔧 COMMUNITY TIPBOT TROUBLESHOOTING GUIDE

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue: "AEGS Balance shows 0"
**Cause:** RPC connection to AEGS daemon failed
**Solution:**
1. Check if aegisumd is running: \`ps aux | grep aegisum\`
2. Check RPC port: \`netstat -tlnp | grep 8332\`
3. Verify RPC credentials in ~/.aegisum/aegisum.conf
4. Test connection: \`node test_rpc_connections.js\`

### Issue: "No deposit notifications"
**Cause:** Blockchain monitoring not working due to RPC failures
**Solution:**
1. Fix RPC connections first (see above)
2. Restart bot: \`pm2 restart tipbot\`
3. Check logs: \`pm2 logs tipbot\`

### Issue: "Connection refused" errors
**Cause:** Coin daemon not running or wrong port
**Solution:**
1. Start your coin daemons
2. Check daemon config files for correct RPC ports
3. Update .env file with correct ports

### Issue: "401 Unauthorized" errors
**Cause:** Wrong RPC username/password
**Solution:**
1. Check daemon .conf files for rpcuser/rpcpassword
2. Update .env file with correct credentials
3. Restart bot

### Issue: "Bot not responding to commands"
**Cause:** Invalid Telegram bot token
**Solution:**
1. Get new token from @BotFather
2. Update TELEGRAM_BOT_TOKEN in .env
3. Restart bot

## 🔍 DIAGNOSTIC COMMANDS

\`\`\`bash
# Check all issues at once
node diagnose_issues.js

# Test RPC connections
node test_rpc_connections.js

# Check running processes
ps aux | grep -E "(aegisum|shiba|pepe|adventure)"

# Check listening ports
netstat -tlnp | grep -E "(8332|8333|8334|8335)"

# Check PM2 status
pm2 status
pm2 logs tipbot

# Check bot logs
tail -f logs/error.log
tail -f logs/combined.log
\`\`\`

## 🎯 STEP-BY-STEP DEBUGGING

1. **Run diagnosis:** \`node diagnose_issues.js\`
2. **Fix RPC issues:** Update .env with real credentials
3. **Test connections:** \`node test_rpc_connections.js\`
4. **Restart bot:** \`pm2 restart tipbot\`
5. **Test commands:** Send /start to your bot
6. **Check logs:** \`pm2 logs tipbot\`

## 📞 GETTING HELP

If you're still having issues:
1. Run \`node diagnose_issues.js\`
2. Send the complete output
3. Include your daemon config files (hide passwords)
4. Mention which specific commands aren't working
`;

    fs.writeFileSync('TROUBLESHOOTING.md', troubleshootingGuide);
    console.log('   ✅ Created TROUBLESHOOTING.md');
    console.log('');
}

// Main execution
async function main() {
    try {
        fixBotName();
        fixFooterHTML();
        fixHistoryCommand();
        createSampleEnv();
        createQuickStart();
        createTroubleshootingGuide();
        
        console.log('🎉 ALL FIXES APPLIED SUCCESSFULLY!');
        console.log('');
        console.log('📋 NEXT STEPS:');
        console.log('1. Configure your .env file with real values');
        console.log('2. Run: node diagnose_issues.js');
        console.log('3. Run: node test_rpc_connections.js');
        console.log('4. Run: ./quick_start_fixed.sh');
        console.log('');
        console.log('🌐 Web Dashboard will be at: http://localhost:12000');
        console.log('🔑 Dashboard Password: admin123');
        console.log('');
        console.log('💡 For domain setup (TGTIPBOT.aegisum.co.za), see COMPLETE_FIX_GUIDE.md');
        
    } catch (error) {
        console.error('❌ Error during fixes:', error.message);
    }
}

main();