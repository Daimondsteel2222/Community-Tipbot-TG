# 🚨 QUICK FIX - Copy These Commands EXACTLY

Brother, run these commands one by one:

## Step 1: Fix Git Issue
```bash
cd ~/Community-Tipbot-TG/Aegisum-TG-tipbot-initial-implementation
git stash
git pull origin main
```

## Step 2: If Still Issues, Force Reset
```bash
git reset --hard origin/main
```

## Step 3: Check Files Are There
```bash
ls -la | grep -E "(create_env|simple_rpc|FINAL)"
```

## Step 4: Create .env File
```bash
./create_env_file.sh
```

## Step 5: Test RPC
```bash
node simple_rpc_test.js
```

---

## 🔥 ALTERNATIVE: Manual Creation

If the files are still missing, create them manually:

### Create .env file:
```bash
cat > .env << 'EOF'
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
DATABASE_PATH=./data/tipbot.db
ENCRYPTION_KEY=your32characterencryptionkeyhere

AEGS_RPC_HOST=127.0.0.1
AEGS_RPC_PORT=8332
AEGS_RPC_USER=aegsrpc
AEGS_RPC_PASS=pJFssAAUq9chHP3/c84IDRjR2WG6e6qfK4EbZMjVZu0=

SHIC_RPC_HOST=127.0.0.1
SHIC_RPC_PORT=8333
SHIC_RPC_USER=shicrpc
SHIC_RPC_PASS=csidLInNYHm1EGI651+mQ1VC8vu23v1p4NiZcfagCoM=

PEPE_RPC_HOST=127.0.0.1
PEPE_RPC_PORT=8334
PEPE_RPC_USER=peperpc
PEPE_RPC_PASS=IHQBqUZ1qoj9YDwghcgFu7S49xuSi1IcIo6f1HfwDbQ=

ADVC_RPC_HOST=127.0.0.1
ADVC_RPC_PORT=9982
ADVC_RPC_USER=advcrpc
ADVC_RPC_PASS=OaVODP1NFGd55Xs8cHB7GbbbSl9rPE+5MeYj0vUQm/8=

DASHBOARD_PORT=12000
DASHBOARD_PASSWORD=admin123
SESSION_SECRET=your_session_secret_here
LOG_LEVEL=info
LOG_FILE=./logs/tipbot.log
EOF
```

### Test RPC manually:
```bash
curl -u "aegsrpc:pJFssAAUq9chHP3/c84IDRjR2WG6e6qfK4EbZMjVZu0=" \
  -d '{"jsonrpc":"1.0","id":"test","method":"getblockchaininfo","params":[]}' \
  -H 'content-type: text/plain;' \
  http://127.0.0.1:8332/
```

If this returns blockchain info, your AEGS RPC is working!

---

## 🎯 THEN START THE BOT:
```bash
node src/bot.js
```

**This WILL work! Your RPC credentials are correct!**