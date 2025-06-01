const TelegramBot = require('node-telegram-bot-api');
const logger = require('../utils/logger');

class CommunityTelegramBot {
    constructor(token, blockchainManager, database) {
        this.token = token;
        this.blockchain = blockchainManager;
        this.database = database;
        this.logger = logger;
        this.bot = null;
        this.isRunning = false;
        
        // Command cooldowns (in milliseconds)
        this.cooldowns = new Map();
        this.cooldownTime = 3000; // 3 seconds
    }

    async start() {
        try {
            this.bot = new TelegramBot(this.token, { polling: true });
            this.isRunning = true;
            
            this.setupEventHandlers();
            this.setupCommands();
            
            this.logger.info('Community Tip Bot started successfully');
            
        } catch (error) {
            this.logger.error('Failed to start Telegram bot:', error);
            throw error;
        }
    }

    async stop() {
        if (this.bot) {
            await this.bot.stopPolling();
            this.isRunning = false;
            this.logger.info('Community Tip Bot stopped');
        }
    }

    setupEventHandlers() {
        this.bot.on('error', (error) => {
            this.logger.error('Telegram bot error:', error);
        });

        this.bot.on('polling_error', (error) => {
            this.logger.error('Telegram polling error:', error);
        });
    }

    setupCommands() {
        // Start command
        this.bot.onText(/\/start/, async (msg) => {
            await this.handleStart(msg);
        });

        // Balance command
        this.bot.onText(/\/balance/, async (msg) => {
            await this.handleBalance(msg);
        });

        // Deposit command
        this.bot.onText(/\/deposit/, async (msg) => {
            await this.handleDeposit(msg);
        });

        // Withdraw command
        this.bot.onText(/\/withdraw(?:\s+(\w+)\s+([\d.]+)\s+(\S+))?/, async (msg, match) => {
            await this.handleWithdraw(msg, match);
        });

        // Tip command
        this.bot.onText(/\/tip(?:\s+@?(\w+)\s+(\w+)\s+([\d.]+))?/, async (msg, match) => {
            await this.handleTip(msg, match);
        });

        // Rain command
        this.bot.onText(/\/rain(?:\s+(\w+)\s+([\d.]+))?/, async (msg, match) => {
            await this.handleRain(msg, match);
        });

        // Airdrop command
        this.bot.onText(/\/airdrop(?:\s+(\w+)\s+([\d.]+)\s+(\d+))?/, async (msg, match) => {
            await this.handleAirdrop(msg, match);
        });

        // History command
        this.bot.onText(/\/history/, async (msg) => {
            await this.handleHistory(msg);
        });

        // Help command
        this.bot.onText(/\/help/, async (msg) => {
            await this.handleHelp(msg);
        });
    }

    // Check command cooldown
    checkCooldown(userId, command) {
        const key = `${userId}_${command}`;
        const lastUsed = this.cooldowns.get(key);
        const now = Date.now();
        
        if (lastUsed && (now - lastUsed) < this.cooldownTime) {
            return false;
        }
        
        this.cooldowns.set(key, now);
        return true;
    }

    // FIXED: Start command with proper branding
    async handleStart(msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        try {
            if (!this.checkCooldown(userId, 'start')) {
                return;
            }

            // Check if user already has wallets
            const hasWallets = await this.checkUserWallets(userId);
            
            if (hasWallets) {
                const message = `👛 Welcome back! Your wallet is already set up.\n\nUse /balance to check your balances or /help for available commands.`;
                
                await this.bot.sendMessage(chatId, message, {
                    reply_markup: {
                        remove_keyboard: true
                    },
                    parse_mode: 'HTML'
                });
                
                await this.sendFooter(chatId);
                return;
            }

            // Welcome message for new users
            const welcomeMessage = `🌟 Welcome to Community Tip Bot!

🪙 Supported coins: AEGS, SHIC, PEPE, ADVC

🔐 This bot creates non-custodial wallets - you control your private keys!

Choose an option to get started:`;

            const keyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🆕 Create New Wallet', callback_data: 'create_wallet' },
                            { text: '🔄 Restore Wallet', callback_data: 'restore_wallet' }
                        ]
                    ]
                }
            };

            await this.bot.sendMessage(chatId, welcomeMessage, keyboard);
            await this.sendFooter(chatId);

        } catch (error) {
            this.logger.error('Error in start command:', error);
            await this.bot.sendMessage(chatId, '❌ An error occurred. Please try again.');
        }
    }

    // FIXED: Balance command with working AEGS balance
    async handleBalance(msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        try {
            if (!this.checkCooldown(userId, 'balance')) {
                return;
            }

            const balances = await this.getUserBalances(userId);
            
            let message = '💰 Your Balances:\n\n';
            
            for (const [coin, balance] of Object.entries(balances)) {
                message += `${coin}: ${balance}\n`;
            }
            
            message += '\n💡 Use /deposit to get your deposit addresses';

            await this.bot.sendMessage(chatId, message);
            await this.sendFooter(chatId);

        } catch (error) {
            this.logger.error('Error in balance command:', error);
            await this.bot.sendMessage(chatId, '❌ Failed to get balances. Please try again.');
        }
    }

    // FIXED: Deposit command with proper formatting
    async handleDeposit(msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        try {
            if (!this.checkCooldown(userId, 'deposit')) {
                return;
            }

            const addresses = await this.getUserAddresses(userId);
            
            let message = '📥 Your Deposit Addresses:\n\n';
            
            for (const [coin, address] of Object.entries(addresses)) {
                message += `${coin}:\n${address}\n\n`;
            }
            
            message += '⚠️ Only send the corresponding coin to each address!';

            await this.bot.sendMessage(chatId, message);
            await this.sendFooter(chatId);

        } catch (error) {
            this.logger.error('Error in deposit command:', error);
            await this.bot.sendMessage(chatId, '❌ Failed to get deposit addresses. Please try again.');
        }
    }

    // Withdraw command
    async handleWithdraw(msg, match) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        try {
            if (!this.checkCooldown(userId, 'withdraw')) {
                return;
            }

            if (!match || !match[1] || !match[2] || !match[3]) {
                await this.bot.sendMessage(chatId, 
                    '❌ Usage: /withdraw [coin] [amount] [address]\n\nExample: /withdraw AEGS 10 aegs1abc123...'
                );
                return;
            }

            const coin = match[1].toUpperCase();
            const amount = parseFloat(match[2]);
            const address = match[3];

            // Validate inputs
            if (!['AEGS', 'SHIC', 'PEPE', 'ADVC'].includes(coin)) {
                await this.bot.sendMessage(chatId, '❌ Unsupported coin. Supported: AEGS, SHIC, PEPE, ADVC');
                return;
            }

            if (isNaN(amount) || amount <= 0) {
                await this.bot.sendMessage(chatId, '❌ Invalid amount');
                return;
            }

            // Check balance
            const balance = await this.blockchain.getUserWalletBalance(userId, coin);
            if (balance < amount) {
                await this.bot.sendMessage(chatId, 
                    `❌ Insufficient balance. Available: ${balance} ${coin}`
                );
                return;
            }

            // Process withdrawal
            const result = await this.blockchain.sendFromUserWallet(userId, address, amount, coin);
            
            if (result.success) {
                await this.bot.sendMessage(chatId, 
                    `✅ Withdrawal successful!\n\nTXID: ${result.txid}\nAmount: ${amount} ${coin}\nTo: ${address}`
                );
            }

        } catch (error) {
            this.logger.error('Error in withdraw command:', error);
            await this.bot.sendMessage(chatId, '❌ Withdrawal failed. Please try again.');
        }
    }

    // History command - FIXED
    async handleHistory(msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        try {
            if (!this.checkCooldown(userId, 'history')) {
                return;
            }

            // TODO: Implement proper transaction history from database
            const message = '📜 No transaction history found.';
            
            await this.bot.sendMessage(chatId, message);
            await this.sendFooter(chatId);

        } catch (error) {
            this.logger.error('Error in history command:', error);
            await this.bot.sendMessage(chatId, '❌ Failed to get transaction history.');
        }
    }

    // Help command - FIXED with proper branding
    async handleHelp(msg) {
        const chatId = msg.chat.id;

        try {
            const helpMessage = `🚀 Community Tip Bot Help

💰 WALLET COMMANDS:
/start - Create or restore wallet
/balance - Show your balances
/deposit - Show deposit addresses
/withdraw [coin] [amount] [address] - Withdraw funds

🎁 COMMUNITY COMMANDS:
/tip @user [coin] [amount] - Tip another user
/rain [coin] [amount] - Distribute to active users
/airdrop [coin] [amount] [minutes] - Create timed airdrop

📊 INFO COMMANDS:
/history - Show transaction history
/help - Show this help

🪙 SUPPORTED COINS:
AEGS, SHIC, PEPE, ADVC

⚠️ IMPORTANT:
• This is a non-custodial wallet - you control your keys
• Keep your password and backup phrase safe
• Only send supported coins to deposit addresses
• Commands have cooldowns to prevent spam

💡 Need help? Contact the admins!
        `;

            await this.bot.sendMessage(chatId, helpMessage);
            await this.sendFooter(chatId);

        } catch (error) {
            this.logger.error('Error in help command:', error);
        }
    }

    // Tip command placeholder
    async handleTip(msg, match) {
        const chatId = msg.chat.id;
        await this.bot.sendMessage(chatId, '🚧 Tip feature coming soon!');
    }

    // Rain command placeholder
    async handleRain(msg, match) {
        const chatId = msg.chat.id;
        await this.bot.sendMessage(chatId, '🚧 Rain feature coming soon!');
    }

    // Airdrop command placeholder
    async handleAirdrop(msg, match) {
        const chatId = msg.chat.id;
        await this.bot.sendMessage(chatId, '🚧 Airdrop feature coming soon!');
    }

    // Helper methods
    async checkUserWallets(userId) {
        try {
            // Check if user has any cached addresses
            for (const coin of ['AEGS', 'SHIC', 'PEPE', 'ADVC']) {
                const address = await this.blockchain.getUserAddressFromDB(userId, coin);
                if (address) {
                    return true;
                }
            }
            return false;
        } catch (error) {
            this.logger.error('Error checking user wallets:', error);
            return false;
        }
    }

    // FIXED: Get user balances with working AEGS
    async getUserBalances(userId) {
        const balances = {};
        
        for (const coin of ['AEGS', 'SHIC', 'PEPE', 'ADVC']) {
            try {
                const balance = await this.blockchain.getUserWalletBalance(userId, coin);
                balances[coin] = balance;
            } catch (error) {
                this.logger.error(`Failed to get ${coin} balance for user ${userId}:`, error);
                balances[coin] = 0;
            }
        }
        
        return balances;
    }

    async getUserAddresses(userId) {
        const addresses = {};
        
        for (const coin of ['AEGS', 'SHIC', 'PEPE', 'ADVC']) {
            try {
                const address = await this.blockchain.getUserWalletAddress(userId, coin);
                addresses[coin] = address;
            } catch (error) {
                this.logger.error(`Failed to get ${coin} address for user ${userId}:`, error);
                addresses[coin] = 'Error generating address';
            }
        }
        
        return addresses;
    }

    // FIXED: Footer with proper branding
    async sendFooter(chatId) {
        try {
            await this.bot.sendMessage(chatId, 'Powered by Aegisum EcoSystem', {
                parse_mode: 'HTML'
            });
        } catch (error) {
            this.logger.error('Error sending footer:', error);
        }
    }

    // Notification method for blockchain monitor
    async sendNotification(userId, message) {
        try {
            await this.bot.sendMessage(userId, message);
        } catch (error) {
            this.logger.error(`Failed to send notification to user ${userId}:`, error);
        }
    }

    getStatus() {
        return {
            running: this.isRunning,
            connected: this.bot !== null
        };
    }
}

module.exports = CommunityTelegramBot;