# Community TipBot

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
   ```bash
   ./install.sh
   ```

2. **Configure your bot:**
   - Edit `.env` file with your settings
   - Set up your coin daemon RPC credentials
   - Add your Telegram bot token

3. **Start the bot:**
   ```bash
   ./start_bot.sh
   ```

4. **Start the dashboard (optional):**
   ```bash
   ./start_dashboard.sh
   ```

## Configuration

### Required Environment Variables

```env
# Telegram Bot Token (get from @BotFather)
TELEGRAM_BOT_TOKEN=your_bot_token

# Coin RPC Configuration
AEGS_RPC_HOST=127.0.0.1
AEGS_RPC_PORT=8332
AEGS_RPC_USER=your_rpc_user
AEGS_RPC_PASS=your_rpc_password

# Repeat for SHIC, PEPE, ADVC...
```

### Coin Daemon Setup

Make sure your coin daemons are running with RPC enabled:

```conf
# In your coin's .conf file
rpcuser=your_rpc_user
rpcpassword=your_rpc_password
rpcport=8332
rpcallowip=127.0.0.1
server=1
daemon=1
```

## Web Dashboard

Access the admin dashboard at: `http://localhost:12000`

Features:
- 📊 Real-time bot status
- 👥 User management
- 💰 Balance monitoring
- 🔧 Fee configuration
- 📝 Transaction logs

Default login: `admin123` (change in .env)

## Bot Commands

- `/start` - Initialize wallet
- `/balance` - Check your balances
- `/deposit` - Get deposit addresses
- `/tip <amount> <coin> <@user>` - Tip another user
- `/withdraw <amount> <coin> <address>` - Withdraw to external address
- `/rain <amount> <coin>` - Rain coins to active users

## Troubleshooting

### AEGS Balance Not Showing

1. Check AEGS daemon is running
2. Verify RPC credentials in .env
3. Run debug script: `node debug_aegs_issue.js`

### Connection Issues

1. Check coin daemon logs
2. Verify RPC ports are open
3. Check firewall settings

### Dashboard Not Loading

1. Check port 12000 is available
2. Verify dashboard dependencies: `cd web-dashboard && npm install`

## Support

For support, please check:
1. Bot logs in `./logs/`
2. Coin daemon logs
3. Dashboard console output

## Security

- Users control their own private keys
- Bot only handles wallet operations
- Regular backups recommended
- Use strong RPC passwords

## License

MIT License - see LICENSE file for details.
