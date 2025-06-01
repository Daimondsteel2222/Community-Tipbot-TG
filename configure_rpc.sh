#!/bin/bash

echo "🔧 COMMUNITY TIPBOT - RPC CONFIGURATION HELPER"
echo "=============================================="
echo ""

echo "This script will help you configure your RPC credentials."
echo "I can see from your logs that you're getting 401 Unauthorized errors,"
echo "which means your daemons are running but the credentials are wrong."
echo ""

# Function to find daemon config files
find_config_files() {
    echo "🔍 Looking for your daemon configuration files..."
    echo ""
    
    # Common locations for daemon configs
    AEGS_CONF=""
    SHIC_CONF=""
    PEPE_CONF=""
    ADVC_CONF=""
    
    # Check common locations
    if [ -f "$HOME/.aegisum/aegisum.conf" ]; then
        AEGS_CONF="$HOME/.aegisum/aegisum.conf"
    fi
    
    if [ -f "$HOME/.shibacoin/shibacoin.conf" ]; then
        SHIC_CONF="$HOME/.shibacoin/shibacoin.conf"
    fi
    
    if [ -f "$HOME/.pepecoin/pepecoin.conf" ]; then
        PEPE_CONF="$HOME/.pepecoin/pepecoin.conf"
    fi
    
    if [ -f "$HOME/.adventurecoin/adventurecoin.conf" ]; then
        ADVC_CONF="$HOME/.adventurecoin/adventurecoin.conf"
    fi
    
    # Also search in common directories
    echo "Searching for config files..."
    find /home -name "*.conf" 2>/dev/null | grep -E "(aegisum|shiba|pepe|adventure)" | head -10
    echo ""
}

# Function to show current RPC settings
show_current_settings() {
    echo "📋 Current .env RPC settings:"
    echo ""
    grep -E "(RPC_USER|RPC_PASS|RPC_PORT)" .env | sed 's/RPC_PASS=.*/RPC_PASS=***HIDDEN***/'
    echo ""
}

# Function to check daemon processes
check_daemons() {
    echo "🔍 Checking running daemon processes..."
    echo ""
    
    AEGS_RUNNING=$(pgrep -f "aegisum" | wc -l)
    SHIC_RUNNING=$(pgrep -f "shiba" | wc -l)
    PEPE_RUNNING=$(pgrep -f "pepe" | wc -l)
    ADVC_RUNNING=$(pgrep -f "adventure" | wc -l)
    
    echo "AEGS daemon: $([[ $AEGS_RUNNING -gt 0 ]] && echo "✅ RUNNING" || echo "❌ NOT RUNNING")"
    echo "SHIC daemon: $([[ $SHIC_RUNNING -gt 0 ]] && echo "✅ RUNNING" || echo "❌ NOT RUNNING")"
    echo "PEPE daemon: $([[ $PEPE_RUNNING -gt 0 ]] && echo "✅ RUNNING" || echo "❌ NOT RUNNING")"
    echo "ADVC daemon: $([[ $ADVC_RUNNING -gt 0 ]] && echo "✅ RUNNING" || echo "❌ NOT RUNNING")"
    echo ""
}

# Function to check listening ports
check_ports() {
    echo "🔍 Checking RPC ports..."
    echo ""
    
    for port in 8332 8333 8334 8335; do
        if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
            echo "Port $port: ✅ LISTENING"
        else
            echo "Port $port: ❌ NOT LISTENING"
        fi
    done
    echo ""
}

# Main execution
echo "Step 1: Checking daemon status..."
check_daemons

echo "Step 2: Checking RPC ports..."
check_ports

echo "Step 3: Looking for config files..."
find_config_files

echo "Step 4: Current bot configuration..."
show_current_settings

echo ""
echo "🎯 DIAGNOSIS RESULTS:"
echo "===================="
echo ""
echo "From your error logs, I can see:"
echo "- ✅ Your daemons ARE running (getting 401 instead of connection refused)"
echo "- ❌ Your RPC credentials are WRONG (401 Unauthorized)"
echo ""
echo "📋 TO FIX THIS:"
echo ""
echo "1. Find your daemon config files (locations shown above)"
echo "2. Look for 'rpcuser' and 'rpcpassword' in those files"
echo "3. Update your .env file with the REAL values"
echo "4. Restart the bot: pm2 restart tipbot"
echo ""
echo "💡 EXAMPLE:"
echo "If your aegisum.conf contains:"
echo "  rpcuser=myuser123"
echo "  rpcpassword=mypass456"
echo ""
echo "Then update .env to:"
echo "  AEGS_RPC_USER=myuser123"
echo "  AEGS_RPC_PASS=mypass456"
echo ""
echo "🔧 Need help? Run: node test_rpc_connections.js"
echo "📊 Full diagnosis: node diagnose_issues.js"
echo ""
echo "Once you fix the RPC credentials, your AEGS balance and"
echo "deposit notifications will work perfectly!"