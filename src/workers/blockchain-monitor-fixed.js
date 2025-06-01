const logger = require('../utils/logger');

class BlockchainMonitor {
    constructor(blockchainManager, database) {
        this.blockchain = blockchainManager;
        this.database = database;
        this.logger = logger;
        this.isRunning = false;
        this.syncIntervals = new Map();
        this.lastSyncedBlocks = new Map();
        this.supportedCoins = ['AEGS', 'SHIC', 'PEPE', 'ADVC'];
        
        // Initialize last synced blocks
        this.supportedCoins.forEach(coin => {
            this.lastSyncedBlocks.set(coin, 0);
        });
    }

    async start() {
        if (this.isRunning) {
            this.logger.warn('Blockchain monitor is already running');
            return;
        }

        this.isRunning = true;
        this.logger.info('Starting blockchain monitor...');

        // Start monitoring each supported coin
        for (const coin of this.supportedCoins) {
            this.startCoinMonitoring(coin);
        }

        this.logger.info('Blockchain monitor started successfully');
    }

    async stop() {
        if (!this.isRunning) {
            return;
        }

        this.isRunning = false;
        this.logger.info('Stopping blockchain monitor...');

        // Clear all intervals
        for (const [coin, interval] of this.syncIntervals) {
            clearInterval(interval);
            this.syncIntervals.delete(coin);
        }

        this.logger.info('Blockchain monitor stopped');
    }

    startCoinMonitoring(coinSymbol) {
        try {
            // Start with immediate sync
            this.syncCoinBlocks(coinSymbol);

            // Set up periodic sync (every 30 seconds)
            const interval = setInterval(() => {
                if (this.isRunning) {
                    this.syncCoinBlocks(coinSymbol);
                }
            }, 30000);

            this.syncIntervals.set(coinSymbol, interval);
            this.logger.info(`Started monitoring for ${coinSymbol}`);

        } catch (error) {
            this.logger.error(`Failed to start monitoring for ${coinSymbol}:`, error);
        }
    }

    async syncCoinBlocks(coinSymbol) {
        try {
            const currentHeight = await this.blockchain.getBlockHeight(coinSymbol);
            const lastSynced = this.lastSyncedBlocks.get(coinSymbol) || 0;
            
            if (currentHeight <= lastSynced) {
                return; // No new blocks
            }

            const startBlock = lastSynced + 1;
            const endBlock = Math.min(startBlock + 10, currentHeight); // Process 10 blocks at a time

            this.logger.info(`Syncing ${coinSymbol} blocks ${startBlock} to ${endBlock}`);

            // Process blocks
            for (let blockHeight = startBlock; blockHeight <= endBlock; blockHeight++) {
                await this.processBlock(coinSymbol, blockHeight);
            }

            // Update last synced block
            this.lastSyncedBlocks.set(coinSymbol, endBlock);

            if (endBlock < currentHeight) {
                this.logger.info(`Processed ${endBlock - startBlock + 1} blocks for ${coinSymbol}, continuing in next cycle`);
            }

        } catch (error) {
            this.logger.error(`Failed to sync blocks for ${coinSymbol}:`, error);
        }
    }

    async processBlock(coinSymbol, blockHeight) {
        try {
            const client = this.blockchain.getClient(coinSymbol);
            
            // Get block hash
            const blockHash = await client.getBlockHash(blockHeight);
            
            // Get block details
            const block = await client.getBlock(blockHash, 2); // Verbosity 2 for transaction details
            
            if (!block || !block.tx) {
                return;
            }

            // Process each transaction in the block
            for (const tx of block.tx) {
                await this.processTransaction(coinSymbol, tx);
            }

        } catch (error) {
            this.logger.error(`Failed to process block ${blockHeight} for ${coinSymbol}:`, error);
        }
    }

    // FIXED: Safe transaction processing to avoid 500 errors
    async processTransaction(coinSymbol, txData) {
        try {
            let txid;
            let transaction;

            // Handle different transaction data formats
            if (typeof txData === 'string') {
                txid = txData;
                transaction = await this.safeGetTransaction(coinSymbol, txid);
            } else if (txData.txid) {
                txid = txData.txid;
                transaction = txData;
            } else {
                return; // Skip invalid transaction data
            }

            if (!transaction) {
                return; // Skip if we can't get transaction details
            }

            // Check if this transaction involves any of our users
            await this.checkTransactionForUsers(coinSymbol, transaction);

        } catch (error) {
            this.logger.warn(`Failed to process transaction for ${coinSymbol}:`, error.message);
        }
    }

    // FIXED: Safe transaction retrieval
    async safeGetTransaction(coinSymbol, txid) {
        try {
            const client = this.blockchain.getClient(coinSymbol);
            return await client.getTransaction(txid);
        } catch (error) {
            // If transaction not found in wallet, try raw transaction
            try {
                const client = this.blockchain.getClient(coinSymbol);
                return await client.getRawTransaction(txid, true);
            } catch (rawError) {
                this.logger.warn(`Transaction ${txid} not found in wallet or mempool for ${coinSymbol}`);
                return null;
            }
        }
    }

    async checkTransactionForUsers(coinSymbol, transaction) {
        try {
            if (!transaction.vout) {
                return;
            }

            // Check each output for addresses we're monitoring
            for (const vout of transaction.vout) {
                if (vout.scriptPubKey && vout.scriptPubKey.addresses) {
                    for (const address of vout.scriptPubKey.addresses) {
                        await this.handleAddressTransaction(coinSymbol, address, transaction, vout);
                    }
                }
            }

        } catch (error) {
            this.logger.error(`Failed to check transaction for users:`, error);
        }
    }

    async handleAddressTransaction(coinSymbol, address, transaction, vout) {
        try {
            // Check if this address belongs to any of our users
            const userId = await this.findUserByAddress(address, coinSymbol);
            
            if (userId) {
                const amount = vout.value;
                const confirmations = transaction.confirmations || 0;
                
                this.logger.info(`Detected ${coinSymbol} transaction for user ${userId}:`, {
                    txid: transaction.txid,
                    address,
                    amount,
                    confirmations
                });

                // Send notification to user
                await this.notifyUser(userId, coinSymbol, {
                    txid: transaction.txid,
                    address,
                    amount,
                    confirmations,
                    type: 'deposit'
                });
            }

        } catch (error) {
            this.logger.error(`Failed to handle address transaction:`, error);
        }
    }

    async findUserByAddress(address, coinSymbol) {
        try {
            // This would normally query the database
            // For now, we'll check the address cache in blockchain manager
            for (const [cacheKey, cachedAddress] of this.blockchain.addressCache) {
                if (cachedAddress === address && cacheKey.includes(coinSymbol)) {
                    const userId = cacheKey.split('_')[0];
                    return userId;
                }
            }
            return null;
        } catch (error) {
            this.logger.error(`Failed to find user by address:`, error);
            return null;
        }
    }

    async notifyUser(userId, coinSymbol, transactionData) {
        try {
            const { txid, address, amount, confirmations } = transactionData;
            
            // This would send a Telegram notification
            this.logger.info(`NOTIFICATION: User ${userId} received ${amount} ${coinSymbol}`, {
                txid,
                address,
                confirmations,
                status: confirmations >= 1 ? 'confirmed' : 'pending'
            });

            // TODO: Implement actual Telegram notification
            // await this.telegramBot.sendMessage(userId, notificationMessage);

        } catch (error) {
            this.logger.error(`Failed to notify user:`, error);
        }
    }

    async getStatus() {
        const status = {
            running: this.isRunning,
            stats: {}
        };

        for (const coin of this.supportedCoins) {
            try {
                const currentHeight = await this.blockchain.getBlockHeight(coin);
                const lastSynced = this.lastSyncedBlocks.get(coin) || 0;
                
                status.stats[coin] = {
                    available: true,
                    currentHeight,
                    lastSyncedHeight: lastSynced,
                    blocksBehind: Math.max(0, currentHeight - lastSynced),
                    synced: currentHeight <= lastSynced,
                    lastSyncTime: new Date().toISOString()
                };
            } catch (error) {
                status.stats[coin] = {
                    available: false,
                    error: error.message,
                    lastSyncTime: new Date().toISOString()
                };
            }
        }

        return status;
    }

    async healthCheck() {
        try {
            if (!this.isRunning) {
                return { healthy: false, reason: 'Monitor not running' };
            }

            // Check if all coins are being monitored
            for (const coin of this.supportedCoins) {
                if (!this.syncIntervals.has(coin)) {
                    return { healthy: false, reason: `${coin} monitoring not active` };
                }
            }

            return { healthy: true };

        } catch (error) {
            return { healthy: false, reason: error.message };
        }
    }
}

module.exports = BlockchainMonitor;