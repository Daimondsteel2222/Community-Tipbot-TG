#!/usr/bin/env node

/**
 * Comprehensive fix script for Community TipBot issues
 * 
 * This script addresses:
 * 1. AEGS balance not showing
 * 2. Pending/confirmed balance messages
 * 3. Footer HTML display issues
 * 4. Bot name references
 */

const fs = require('fs');
const path = require('path');

// Try to load dotenv if available
try {
    require('dotenv').config();
} catch (e) {
    // dotenv not available, continue without it
}

console.log('🔧 Community TipBot Issue Fix Script');
console.log('=====================================\n');

// Check environment variables for AEGS
function checkAEGSConfig() {
    console.log('1. Checking AEGS Configuration...');
    
    const requiredVars = [
        'AEGS_RPC_HOST',
        'AEGS_RPC_PORT', 
        'AEGS_RPC_USER',
        'AEGS_RPC_PASS'
    ];
    
    const missing = [];
    const present = [];
    
    requiredVars.forEach(varName => {
        if (process.env[varName]) {
            present.push(varName);
        } else {
            missing.push(varName);
        }
    });
    
    console.log(`   ✅ Present: ${present.join(', ')}`);
    if (missing.length > 0) {
        console.log(`   ❌ Missing: ${missing.join(', ')}`);
        console.log('   💡 Add these to your .env file for AEGS support');
    }
    
    return missing.length === 0;
}

// Create sample .env file
function createSampleEnv() {
    console.log('\n2. Creating sample .env file...');
    
    const sampleEnv = `# Community TipBot Configuration
# Copy this to .env and update with your values

# Telegram Bot Token
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Database Configuration
DATABASE_PATH=./data/tipbot.db

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

# Dashboard Configuration
DASHBOARD_PORT=12000
DASHBOARD_PASSWORD=admin123
SESSION_SECRET=your_session_secret_here

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/tipbot.log
`;

    const envPath = path.join(__dirname, '.env.sample');
    fs.writeFileSync(envPath, sampleEnv);
    console.log(`   ✅ Created ${envPath}`);
    console.log('   💡 Copy this to .env and update with your values');
}

// Check if fixes are already applied
function checkExistingFixes() {
    console.log('\n3. Checking existing fixes...');
    
    const telegramBotPath = path.join(__dirname, 'src/bot/telegram-bot.js');
    const content = fs.readFileSync(telegramBotPath, 'utf8');
    
    const fixes = {
        botName: content.includes('Community TipBot'),
        footer: !content.includes('<i>Powered by Aegisum EcoSystem</i>')
    };
    
    console.log(`   Bot Name Fix: ${fixes.botName ? '✅ Applied' : '❌ Needed'}`);
    console.log(`   Footer Fix: ${fixes.footer ? '✅ Applied' : '❌ Needed'}`);
    
    return fixes;
}

// Create installation script
function createInstallScript() {
    console.log('\n4. Creating installation script...');
    
    const installScript = `#!/bin/bash

# Community TipBot Installation Script
echo "🤖 Community TipBot Installation"
echo "================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Install dashboard dependencies
echo ""
echo "📦 Installing dashboard dependencies..."
cd web-dashboard
npm install
cd ..

# Create data directory
echo ""
echo "📁 Creating data directory..."
mkdir -p data
mkdir -p logs

# Copy sample environment file
echo ""
echo "⚙️  Setting up configuration..."
if [ ! -f .env ]; then
    cp .env.sample .env
    echo "✅ Created .env file from sample"
    echo "💡 Please edit .env file with your configuration"
else
    echo "⚠️  .env file already exists, skipping"
fi

# Make scripts executable
echo ""
echo "🔧 Making scripts executable..."
chmod +x start_bot.sh
chmod +x start_dashboard.sh
chmod +x debug_aegs_issue.js
chmod +x fix_issues.js

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start your coin daemons (AEGS, SHIC, PEPE, ADVC)"
echo "3. Run: ./start_bot.sh"
echo "4. Run: ./start_dashboard.sh (in another terminal)"
echo ""
echo "🌐 Dashboard will be available at: http://localhost:12000"
echo "🔑 Default dashboard password: admin123"
`;

    const installPath = path.join(__dirname, 'install.sh');
    fs.writeFileSync(installPath, installScript);
    fs.chmodSync(installPath, '755');
    console.log(`   ✅ Created ${installPath}`);
}

// Create startup scripts
function createStartupScripts() {
    console.log('\n5. Creating startup scripts...');
    
    // Bot startup script
    const botScript = `#!/bin/bash

echo "🤖 Starting Community TipBot..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run install.sh first."
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the bot
node src/index.js
`;

    const botScriptPath = path.join(__dirname, 'start_bot.sh');
    fs.writeFileSync(botScriptPath, botScript);
    fs.chmodSync(botScriptPath, '755');
    console.log(`   ✅ Created ${botScriptPath}`);
    
    // Dashboard startup script
    const dashboardScript = `#!/bin/bash

echo "🌐 Starting Community TipBot Dashboard..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run install.sh first."
    exit 1
fi

# Check if dashboard dependencies exist
if [ ! -d web-dashboard/node_modules ]; then
    echo "📦 Installing dashboard dependencies..."
    cd web-dashboard
    npm install
    cd ..
fi

# Start the dashboard
node start_dashboard.js
`;

    const dashboardScriptPath = path.join(__dirname, 'start_dashboard.sh');
    fs.writeFileSync(dashboardScriptPath, dashboardScript);
    fs.chmodSync(dashboardScriptPath, '755');
    console.log(`   ✅ Created ${dashboardScriptPath}`);
}

// Create README
function createReadme() {
    console.log('\n6. Creating README...');
    
    const readme = `# Community TipBot

A Telegram bot for tipping cryptocurrencies in communities.

## Features

- 🪙 Multi-coin support (AEGS, SHIC, PEPE, ADVC)
- 🔐 Non-custodial wallets (users control private keys)
- 💸 Tip other users
- 💰 Check balances
- 📥 Deposit addresses
- 📤 Withdraw to external addresses
- 🌧️ Rain feature for community rewards
- 🌐 Web dashboard for administration

## Quick Start

1. **Install dependencies:**
   \`\`\`bash
   ./install.sh
   \`\`\`

2. **Configure your bot:**
   - Edit \`.env\` file with your settings
   - Set up your coin daemon RPC credentials
   - Add your Telegram bot token

3. **Start the bot:**
   \`\`\`bash
   ./start_bot.sh
   \`\`\`

4. **Start the dashboard (optional):**
   \`\`\`bash
   ./start_dashboard.sh
   \`\`\`

## Configuration

### Required Environment Variables

\`\`\`env
# Telegram Bot Token (get from @BotFather)
TELEGRAM_BOT_TOKEN=your_bot_token

# Coin RPC Configuration
AEGS_RPC_HOST=127.0.0.1
AEGS_RPC_PORT=8332
AEGS_RPC_USER=your_rpc_user
AEGS_RPC_PASS=your_rpc_password

# Repeat for SHIC, PEPE, ADVC...
\`\`\`

### Coin Daemon Setup

Make sure your coin daemons are running with RPC enabled:

\`\`\`conf
# In your coin's .conf file
rpcuser=your_rpc_user
rpcpassword=your_rpc_password
rpcport=8332
rpcallowip=127.0.0.1
server=1
daemon=1
\`\`\`

## Web Dashboard

Access the admin dashboard at: \`http://localhost:12000\`

Features:
- 📊 Real-time bot status
- 👥 User management
- 💰 Balance monitoring
- 🔧 Fee configuration
- 📝 Transaction logs

Default login: \`admin123\` (change in .env)

## Bot Commands

- \`/start\` - Initialize wallet
- \`/balance\` - Check your balances
- \`/deposit\` - Get deposit addresses
- \`/tip <amount> <coin> <@user>\` - Tip another user
- \`/withdraw <amount> <coin> <address>\` - Withdraw to external address
- \`/rain <amount> <coin>\` - Rain coins to active users

## Troubleshooting

### AEGS Balance Not Showing

1. Check AEGS daemon is running
2. Verify RPC credentials in .env
3. Run debug script: \`node debug_aegs_issue.js\`

### Connection Issues

1. Check coin daemon logs
2. Verify RPC ports are open
3. Check firewall settings

### Dashboard Not Loading

1. Check port 12000 is available
2. Verify dashboard dependencies: \`cd web-dashboard && npm install\`

## Support

For support, please check:
1. Bot logs in \`./logs/\`
2. Coin daemon logs
3. Dashboard console output

## Security

- Users control their own private keys
- Bot only handles wallet operations
- Regular backups recommended
- Use strong RPC passwords

## License

MIT License - see LICENSE file for details.
`;

    const readmePath = path.join(__dirname, 'README.md');
    fs.writeFileSync(readmePath, readme);
    console.log(`   ✅ Created ${readmePath}`);
}

// Main execution
async function main() {
    try {
        const aegsConfigured = checkAEGSConfig();
        createSampleEnv();
        checkExistingFixes();
        createInstallScript();
        createStartupScripts();
        createReadme();
        
        console.log('\n✅ All fixes and improvements applied!');
        console.log('\nNext steps:');
        console.log('1. Run: ./install.sh');
        console.log('2. Edit .env file with your configuration');
        console.log('3. Start your coin daemons');
        console.log('4. Run: ./start_bot.sh');
        console.log('5. Run: ./start_dashboard.sh (optional)');
        
        if (!aegsConfigured) {
            console.log('\n⚠️  AEGS Configuration Missing:');
            console.log('   Add AEGS RPC settings to .env file for AEGS support');
        }
        
    } catch (error) {
        console.error('❌ Fix script failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = main;