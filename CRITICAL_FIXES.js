#!/usr/bin/env node

/**
 * CRITICAL FIXES FOR COMMUNITY TIPBOT
 * 
 * Issues Fixed:
 * 1. AEGS balance not showing (RPC getbalance issue)
 * 2. Missing deposit notifications (pending/confirmed)
 * 3. History command not working
 * 4. Deposit detection improvements
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🚨 APPLYING CRITICAL FIXES...\n');

// Fix 1: AEGS Balance Issue - Update blockchain manager
const blockchainManagerPath = './src/blockchain/blockchain-manager.js';
console.log('1. Fixing AEGS balance issue...');

let blockchainManager = fs.readFileSync(blockchainManagerPath, 'utf8');

// Fix AEGS getbalance call - use "*" instead of account name
const aegsBalanceFix = `
    async getUserWalletBalance(userId, coinSymbol, confirmations = 1) {
        try {
            const client = this.getClient(coinSymbol);
            
            // Special handling for AEGS - use "*" for all accounts
            if (coinSymbol === 'AEGS') {
                const totalBalance = await client.call('getbalance', ['*', confirmations]);
                
                // Get user's specific addresses to calculate their balance
                const userAddresses = await this.getUserAddresses(userId, coinSymbol);
                if (!userAddresses || userAddresses.length === 0) {
                    return 0;
                }
                
                let userBalance = 0;
                for (const address of userAddresses) {
                    try {
                        const addressBalance = await client.call('getreceivedbyaddress', [address, confirmations]);
                        userBalance += parseFloat(addressBalance) || 0;
                    } catch (error) {
                        this.logger.warn(\`Could not get balance for address \${address}: \${error.message}\`);
                    }
                }
                
                return userBalance;
            }
            
            // For other coins, use account-based balance
            const accountName = \`user_\${userId}\`;
            return await client.call('getbalance', [accountName, confirmations]);
            
        } catch (error) {
            this.logger.error('Failed to get wallet balance', {
                userId,
                coinSymbol,
                error: error.message,
                service: 'aegisum-tipbot'
            });
            return 0;
        }
    }`;

// Replace the existing getUserWalletBalance method
blockchainManager = blockchainManager.replace(
    /async getUserWalletBalance\([\s\S]*?^\s{4}}/m,
    aegsBalanceFix.trim()
);

fs.writeFileSync(blockchainManagerPath, blockchainManager);
console.log('✅ Fixed AEGS balance issue');

// Fix 2: Add deposit notifications
console.log('2. Adding deposit notification system...');

const depositNotificationCode = `
    async processTransaction(transaction, coinSymbol, blockHeight) {
        try {
            // Check if this is a deposit to a user address
            if (transaction.category === 'receive' && transaction.amount > 0) {
                const userId = await this.getUserIdByAddress(transaction.address, coinSymbol);
                if (userId) {
                    // Send pending notification (0 confirmations)
                    if (transaction.confirmations === 0) {
                        await this.sendDepositNotification(userId, coinSymbol, transaction.amount, 'pending', transaction.txid);
                    }
                    // Send confirmed notification (1+ confirmations)
                    else if (transaction.confirmations >= 1) {
                        await this.sendDepositNotification(userId, coinSymbol, transaction.amount, 'confirmed', transaction.txid);
                    }
                    
                    // Store transaction in database
                    await this.storeTransaction(userId, coinSymbol, transaction);
                }
            }
        } catch (error) {
            this.logger.error('Error processing transaction', {
                error: error.message,
                transaction: transaction.txid,
                coinSymbol,
                service: 'aegisum-tipbot'
            });
        }
    }

    async sendDepositNotification(userId, coinSymbol, amount, status, txid) {
        try {
            const bot = require('../bot/telegram-bot');
            const statusEmoji = status === 'pending' ? '⏳' : '✅';
            const statusText = status === 'pending' ? 'Pending' : 'Confirmed';
            
            const message = \`\${statusEmoji} **Deposit \${statusText}**

💰 **Amount:** \${amount} \${coinSymbol}
🔗 **Transaction:** \${txid.substring(0, 16)}...
⏰ **Status:** \${statusText}

\${status === 'pending' ? 'Your deposit is being processed...' : 'Your deposit has been confirmed and is now available!'}\`;

            await bot.sendMessage(userId, message, { parse_mode: 'Markdown' });
            
        } catch (error) {
            this.logger.error('Failed to send deposit notification', {
                userId,
                coinSymbol,
                amount,
                status,
                error: error.message,
                service: 'aegisum-tipbot'
            });
        }
    }

    async storeTransaction(userId, coinSymbol, transaction) {
        try {
            const db = require('../database/database');
            await db.run(\`
                INSERT OR REPLACE INTO transactions 
                (user_id, coin_symbol, txid, amount, type, confirmations, block_height, created_at)
                VALUES (?, ?, ?, ?, 'deposit', ?, ?, datetime('now'))
            \`, [userId, coinSymbol, transaction.txid, transaction.amount, transaction.confirmations, transaction.blockheight || 0]);
            
        } catch (error) {
            this.logger.error('Failed to store transaction', {
                error: error.message,
                service: 'aegisum-tipbot'
            });
        }
    }

    async getUserIdByAddress(address, coinSymbol) {
        try {
            const db = require('../database/database');
            const result = await db.get(\`
                SELECT user_id FROM wallets 
                WHERE address = ? AND coin_symbol = ?
            \`, [address, coinSymbol]);
            
            return result ? result.user_id : null;
        } catch (error) {
            this.logger.error('Failed to get user by address', {
                address,
                coinSymbol,
                error: error.message,
                service: 'aegisum-tipbot'
            });
            return null;
        }
    }`;

// Add the new methods to blockchain manager
blockchainManager += '\n' + depositNotificationCode;
fs.writeFileSync(blockchainManagerPath, blockchainManager);
console.log('✅ Added deposit notification system');

// Fix 3: Add history command to telegram bot
console.log('3. Adding history command...');

const telegramBotPath = './src/bot/telegram-bot.js';
let telegramBot = fs.readFileSync(telegramBotPath, 'utf8');

const historyCommandCode = `
        // History command
        this.bot.onText(/\/history/, async (msg) => {
            await this.handleHistory(msg);
        });`;

// Add history command to the bot setup
telegramBot = telegramBot.replace(
    /(\/\/.*Help command[\s\S]*?}\);)/,
    '$1\n' + historyCommandCode
);

const historyHandlerCode = `
    async handleHistory(msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        try {
            await this.bot.sendChatAction(chatId, 'typing');

            // Get user's transaction history
            const transactions = await this.getTransactionHistory(userId);

            if (!transactions || transactions.length === 0) {
                await this.bot.sendMessage(chatId, 
                    '📋 **Transaction History**\\n\\n' +
                    'No transactions found.\\n\\n' +
                    '💡 Use /deposit to get your deposit addresses',
                    { parse_mode: 'Markdown' }
                );
                return;
            }

            // Format transaction history
            let historyText = '📋 **Transaction History**\\n\\n';
            
            transactions.slice(0, 10).forEach((tx, index) => {
                const date = new Date(tx.created_at).toLocaleDateString();
                const typeEmoji = tx.type === 'deposit' ? '📥' : tx.type === 'withdraw' ? '📤' : '💸';
                const statusEmoji = tx.confirmations >= 1 ? '✅' : '⏳';
                
                historyText += \`\${typeEmoji} **\${tx.type.toUpperCase()}** \${statusEmoji}\\n\`;
                historyText += \`💰 \${tx.amount} \${tx.coin_symbol}\\n\`;
                historyText += \`📅 \${date}\\n\`;
                historyText += \`🔗 \${tx.txid.substring(0, 16)}...\\n\\n\`;
            });

            if (transactions.length > 10) {
                historyText += \`_Showing last 10 transactions (total: \${transactions.length})_\\n\\n\`;
            }

            historyText += this.addFooter();

            await this.bot.sendMessage(chatId, historyText, { parse_mode: 'Markdown' });

        } catch (error) {
            this.logger.error('Error handling history command', {
                error: error.message,
                userId,
                service: 'aegisum-tipbot'
            });

            await this.bot.sendMessage(chatId, 
                '❌ Error retrieving transaction history. Please try again later.'
            );
        }
    }

    async getTransactionHistory(userId) {
        try {
            const db = require('../database/database');
            const transactions = await db.all(\`
                SELECT * FROM transactions 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 50
            \`, [userId]);
            
            return transactions;
        } catch (error) {
            this.logger.error('Failed to get transaction history', {
                userId,
                error: error.message,
                service: 'aegisum-tipbot'
            });
            return [];
        }
    }`;

// Add the history handler method
telegramBot = telegramBot.replace(
    /(addFooter\(\)[\s\S]*?})/,
    '$1\n' + historyHandlerCode
);

fs.writeFileSync(telegramBotPath, telegramBot);
console.log('✅ Added history command');

// Fix 4: Update database schema for transactions
console.log('4. Updating database schema...');

const databasePath = './src/database/database.js';
let database = fs.readFileSync(databasePath, 'utf8');

const transactionTableSchema = `
            // Create transactions table
            await this.db.run(\`
                CREATE TABLE IF NOT EXISTS transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    coin_symbol TEXT NOT NULL,
                    txid TEXT NOT NULL,
                    amount REAL NOT NULL,
                    type TEXT NOT NULL, -- 'deposit', 'withdraw', 'tip', 'rain'
                    confirmations INTEGER DEFAULT 0,
                    block_height INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(txid, user_id, coin_symbol)
                )
            \`);`;

// Add transaction table to schema initialization
database = database.replace(
    /(CREATE TABLE IF NOT EXISTS wallets[\s\S]*?\);)/,
    '$1\n' + transactionTableSchema
);

fs.writeFileSync(databasePath, database);
console.log('✅ Updated database schema');

// Fix 5: Improve block monitoring for deposits
console.log('5. Improving deposit detection...');

const workerPath = './src/workers/blockchain-monitor.js';
if (fs.existsSync(workerPath)) {
    let worker = fs.readFileSync(workerPath, 'utf8');
    
    const improvedMonitoring = `
    async processBlock(coinSymbol, blockHeight) {
        try {
            const client = this.blockchain.getClient(coinSymbol);
            const blockHash = await client.call('getblockhash', [blockHeight]);
            const block = await client.call('getblock', [blockHash, true]);
            
            // Process each transaction in the block
            for (const txid of block.tx) {
                try {
                    const transaction = await client.call('gettransaction', [txid]);
                    
                    // Check if this transaction involves any of our addresses
                    if (transaction.details) {
                        for (const detail of transaction.details) {
                            if (detail.category === 'receive' && detail.amount > 0) {
                                await this.blockchain.processTransaction(detail, coinSymbol, blockHeight);
                            }
                        }
                    }
                } catch (txError) {
                    // Transaction might not be in wallet, skip
                    continue;
                }
            }
            
        } catch (error) {
            this.logger.error('Error processing block', {
                coinSymbol,
                blockHeight,
                error: error.message,
                service: 'aegisum-tipbot'
            });
        }
    }`;
    
    // Update the block processing method
    worker = worker.replace(
        /async processBlock\([\s\S]*?^\s{4}}/m,
        improvedMonitoring.trim()
    );
    
    fs.writeFileSync(workerPath, worker);
    console.log('✅ Improved deposit detection');
}

console.log('\n🎉 ALL CRITICAL FIXES APPLIED!');
console.log('\nNext steps:');
console.log('1. Restart the bot: pm2 restart tipbot');
console.log('2. Test /balance command');
console.log('3. Test /history command');
console.log('4. Send a test deposit to verify notifications');
