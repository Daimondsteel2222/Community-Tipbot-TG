#!/bin/bash

echo "🔧 Creating .env file with your RPC credentials..."

cat > .env << 'EOF'
# Community TipBot Configuration

# Telegram Bot Token (replace with your actual token)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Database Configuration
DATABASE_PATH=./data/tipbot.db

# Encryption Key (32 characters)
ENCRYPTION_KEY=your32characterencryptionkeyhere

# AEGS Configuration
AEGS_RPC_HOST=127.0.0.1
AEGS_RPC_PORT=8332
AEGS_RPC_USER=aegsrpc
AEGS_RPC_PASS=pJFssAAUq9chHP3/c84IDRjR2WG6e6qfK4EbZMjVZu0=

# SHIC Configuration
SHIC_RPC_HOST=127.0.0.1
SHIC_RPC_PORT=8333
SHIC_RPC_USER=shicrpc
SHIC_RPC_PASS=csidLInNYHm1EGI651+mQ1VC8vu23v1p4NiZcfagCoM=

# PEPE Configuration
PEPE_RPC_HOST=127.0.0.1
PEPE_RPC_PORT=8334
PEPE_RPC_USER=peperpc
PEPE_RPC_PASS=IHQBqUZ1qoj9YDwghcgFu7S49xuSi1IcIo6f1HfwDbQ=

# ADVC Configuration
ADVC_RPC_HOST=127.0.0.1
ADVC_RPC_PORT=9982
ADVC_RPC_USER=advcrpc
ADVC_RPC_PASS=OaVODP1NFGd55Xs8cHB7GbbbSl9rPE+5MeYj0vUQm/8=

# Dashboard Configuration
DASHBOARD_PORT=12000
DASHBOARD_PASSWORD=admin123
SESSION_SECRET=your_session_secret_here

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/tipbot.log
EOF

echo "✅ .env file created with your RPC credentials!"
echo ""
echo "🔧 Next steps:"
echo "1. Update TELEGRAM_BOT_TOKEN with your real bot token"
echo "2. Update ENCRYPTION_KEY with a 32-character random string"
echo "3. Run: node test_rpc_connections.js"
echo "4. Run: ./quick_start_fixed.sh"