# 🚀 UPDATE GUIDE - Critical Fixes Applied

## 🎉 Issues Fixed

✅ **AEGS Balance Issue**: Fixed RPC getbalance error  
✅ **Deposit Notifications**: Added pending/confirmed messages  
✅ **History Command**: Added `/history` functionality  
✅ **Deposit Detection**: Improved transaction monitoring  

---

## 📋 Step-by-Step Update Instructions

### Step 1: Pull Latest Updates
```bash
# Go to your bot directory
cd ~/Community-Tipbot-TG/Aegisum-TG-tipbot-initial-implementation

# Pull the latest fixes from GitHub
git pull origin main
```

### Step 2: Stop Current Bot
```bash
# Stop the running bot
pm2 stop tipbot
```

### Step 3: Apply Database Updates
```bash
# Run the database migration (this will add the transactions table)
node -e "
const Database = require('./src/database/database');
const db = new Database();
db.initialize().then(() => {
    console.log('✅ Database updated successfully');
    process.exit(0);
}).catch(err => {
    console.error('❌ Database update failed:', err);
    process.exit(1);
});
"
```

### Step 4: Restart Bot with Updates
```bash
# Start the bot with the new fixes
pm2 start src/index.js --name tipbot --update-env

# Check status
pm2 status

# Check logs
pm2 logs tipbot --lines 10
```

### Step 5: Test the Fixes

#### Test 1: Check Balance (should now show AEGS)
In Telegram: `/balance`
**Expected**: Should now show your 10 AEGS balance

#### Test 2: Check History
In Telegram: `/history`
**Expected**: Should show your transaction history

#### Test 3: Test Deposit Notifications
Send a small test deposit to any of your addresses
**Expected**: You should receive:
- ⏳ Pending notification (0 confirmations)
- ✅ Confirmed notification (1+ confirmations)

---

## 🔍 Verification Commands

### Check Bot Status
```bash
pm2 status
pm2 logs tipbot --lines 20
```

### Check Database
```bash
# Check if transactions table was created
sqlite3 data/tipbot.db "SELECT name FROM sqlite_master WHERE type='table';"

# Check your current balances in database
sqlite3 data/tipbot.db "SELECT * FROM wallets WHERE user_id = 1651155083;"
```

### Test RPC Connections
```bash
# Test AEGS balance specifically
node -e "
require('dotenv').config();
const BlockchainManager = require('./src/blockchain/blockchain-manager');
const bm = new BlockchainManager();
bm.getUserWalletBalance(1651155083, 'AEGS').then(balance => {
    console.log('AEGS Balance:', balance);
    process.exit(0);
}).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
"
```

---

## 🎯 What's New

### 1. Fixed AEGS Balance
- **Problem**: AEGS daemon requires `"*"` parameter for getbalance
- **Solution**: Updated to use `getreceivedbyaddress` for user-specific balances

### 2. Deposit Notifications
- **Pending**: ⏳ Sent when transaction has 0 confirmations
- **Confirmed**: ✅ Sent when transaction has 1+ confirmations
- **Format**: Shows amount, coin, transaction ID, and status

### 3. History Command
- **Usage**: `/history`
- **Shows**: Last 10 transactions with dates, amounts, and status
- **Types**: Deposits, withdrawals, tips, rain

### 4. Enhanced Monitoring
- **Real-time**: Monitors all blocks for deposits
- **Automatic**: Detects deposits and sends notifications
- **Database**: Stores all transactions for history

---

## 🚨 Troubleshooting

### If AEGS Balance Still Shows 0:
```bash
# Check if your address received the deposit
node -e "
require('dotenv').config();
const axios = require('axios');
const auth = { username: process.env.AEGS_RPC_USER, password: process.env.AEGS_RPC_PASS };
axios.post('http://127.0.0.1:8332', {
    jsonrpc: '1.0',
    id: 'test',
    method: 'getreceivedbyaddress',
    params: ['aegs1q47w4j584v40nketsdqrae6qjaqtf6csx3vsja5', 1]
}, { auth }).then(res => {
    console.log('Address Balance:', res.data.result);
}).catch(err => {
    console.error('Error:', err.response?.data || err.message);
});
"
```

### If Notifications Don't Work:
```bash
# Check if bot can send messages
pm2 logs tipbot | grep -i "notification\|deposit"
```

### If History is Empty:
```bash
# Check transactions table
sqlite3 data/tipbot.db "SELECT COUNT(*) FROM transactions;"
```

---

## 🎉 Success Indicators

✅ **AEGS Balance**: Shows 10 AEGS in `/balance`  
✅ **History Works**: `/history` shows transactions  
✅ **Notifications**: Receive deposit messages  
✅ **No Errors**: Clean PM2 logs  

---

## 📞 Next Steps

After confirming everything works:

1. **Test Dashboard**: `./start_dashboard.sh`
2. **Test Other Commands**: `/tip`, `/rain`, `/withdraw`
3. **Monitor Logs**: `pm2 logs tipbot --follow`

**All fixes have been pushed to GitHub and are ready for deployment!** 🚀