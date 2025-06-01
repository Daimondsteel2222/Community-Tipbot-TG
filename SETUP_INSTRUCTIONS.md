# 🚀 FINAL SETUP INSTRUCTIONS

Brother, you're almost there! Here's exactly what you need to do:

## Step 1: Navigate to the Correct Directory
```bash
cd ~/Community-Tipbot-TG/Aegisum-TG-tipbot-initial-implementation
```

## Step 2: Create Your .env File
```bash
cp .env.example .env
```

## Step 3: Get Your Real RPC Credentials
```bash
# Check your daemon config files:
cat ~/.aegisum/aegisum.conf | grep -E "(rpcuser|rpcpassword)"
cat ~/.shibacoin/shibacoin.conf | grep -E "(rpcuser|rpcpassword)"
cat ~/.pepecoin/pepecoin.conf | grep -E "(rpcuser|rpcpassword)"
cat ~/.adventurecoin/adventurecoin.conf | grep -E "(rpcuser|rpcpassword)"
```

## Step 4: Update Your .env File
Edit the .env file with your REAL values:
```bash
nano .env
```

Replace these lines with your actual values:
```env
# Replace with your actual Telegram bot token
TELEGRAM_BOT_TOKEN=your_actual_telegram_token_here

# Replace with your actual RPC credentials from daemon configs
AEGS_RPC_USER=your_real_aegs_username
AEGS_RPC_PASS=your_real_aegs_password

SHIC_RPC_USER=your_real_shic_username
SHIC_RPC_PASS=your_real_shic_password

PEPE_RPC_USER=your_real_pepe_username
PEPE_RPC_PASS=your_real_pepe_password

ADVC_RPC_USER=your_real_advc_username
ADVC_RPC_PASS=your_real_advc_password
```

## Step 5: Test RPC Connections
```bash
node test_rpc_connections.js
```

## Step 6: Start the Bot
```bash
./quick_start_fixed.sh
```

## Step 7: Access Web Dashboard
Open: http://localhost:12000
Password: admin123

---

## 🔧 If You Need Help Finding RPC Credentials

Run these commands to find your actual RPC settings:

```bash
# Show AEGS RPC settings
echo "=== AEGS RPC Settings ==="
cat ~/.aegisum/aegisum.conf 2>/dev/null | grep -E "(rpcuser|rpcpassword|rpcport)" || echo "Config not found"

# Show SHIC RPC settings  
echo "=== SHIC RPC Settings ==="
cat ~/.shibacoin/shibacoin.conf 2>/dev/null | grep -E "(rpcuser|rpcpassword|rpcport)" || echo "Config not found"

# Show PEPE RPC settings
echo "=== PEPE RPC Settings ==="
cat ~/.pepecoin/pepecoin.conf 2>/dev/null | grep -E "(rpcuser|rpcpassword|rpcport)" || echo "Config not found"

# Show ADVC RPC settings
echo "=== ADVC RPC Settings ==="
cat ~/.adventurecoin/adventurecoin.conf 2>/dev/null | grep -E "(rpcuser|rpcpassword|rpcport)" || echo "Config not found"
```

---

## 🎯 What This Will Fix

Once you complete these steps:

✅ **AEGS balance will show correctly**  
✅ **Deposit notifications will work**  
✅ **All bot commands will function**  
✅ **Web dashboard will be accessible**  
✅ **Bot will say "Community TipBot"**  
✅ **Footer will display properly**  

**You're literally 5 minutes away from having everything working perfectly!**