# 🔧 COMMUNITY TIPBOT TROUBLESHOOTING GUIDE

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue: "AEGS Balance shows 0"
**Cause:** RPC connection to AEGS daemon failed
**Solution:**
1. Check if aegisumd is running: `ps aux | grep aegisum`
2. Check RPC port: `netstat -tlnp | grep 8332`
3. Verify RPC credentials in ~/.aegisum/aegisum.conf
4. Test connection: `node test_rpc_connections.js`

### Issue: "No deposit notifications"
**Cause:** Blockchain monitoring not working due to RPC failures
**Solution:**
1. Fix RPC connections first (see above)
2. Restart bot: `pm2 restart tipbot`
3. Check logs: `pm2 logs tipbot`

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

```bash
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
```

## 🎯 STEP-BY-STEP DEBUGGING

1. **Run diagnosis:** `node diagnose_issues.js`
2. **Fix RPC issues:** Update .env with real credentials
3. **Test connections:** `node test_rpc_connections.js`
4. **Restart bot:** `pm2 restart tipbot`
5. **Test commands:** Send /start to your bot
6. **Check logs:** `pm2 logs tipbot`

## 📞 GETTING HELP

If you're still having issues:
1. Run `node diagnose_issues.js`
2. Send the complete output
3. Include your daemon config files (hide passwords)
4. Mention which specific commands aren't working
