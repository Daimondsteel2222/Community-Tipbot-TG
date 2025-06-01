const RPCClient = require('./rpc-client');
const logger = require('../utils/logger');
const ValidationUtils = require('../utils/validation');

class BlockchainManager {
    constructor() {
        this.clients = new Map();
        this.supportedCoins = ['AEGS', 'SHIC', 'PEPE', 'ADVC'];
        this.logger = logger;
        this.addressCache = new Map(); // Temporary in-memory cache for addresses
        this.initializeClients();
    }

    initializeClients() {
        this.supportedCoins.forEach(coin => {
            try {
                const config = {
                    host: process.env[`${coin}_RPC_HOST`] || '127.0.0.1',
                    port: process.env[`${coin}_RPC_PORT`],
                    username: process.env[`${coin}_RPC_USER`],
                    password: process.env[`${coin}_RPC_PASS`],
                    coinSymbol: coin,
                    timeout: 30000
                };

                if (!config.port || !config.username || !config.password) {
                    this.logger.warn(`Incomplete RPC configuration for ${coin}, skipping`);
                    return;
                }

                const client = new RPCClient(config);
                this.clients.set(coin, client);
                this.logger.info(`RPC client initialized for ${coin}`);
            } catch (error) {
                this.logger.error(`Failed to initialize RPC client for ${coin}:`, error);
            }
        });
    }

    getClient(coinSymbol) {
        const client = this.clients.get(coinSymbol.toUpperCase());
        if (!client) {
            throw new Error(`No RPC client available for ${coinSymbol}`);
        }
        return client;
    }

    async testConnections() {
        const results = {};
        
        for (const coin of this.supportedCoins) {
            try {
                const client = this.getClient(coin);
                
                // Test basic connection
                const blockCount = await client.getBlockCount();
                
                // Test wallet functionality
                let walletInfo = null;
                try {
                    walletInfo = await client.getWalletInfo();
                } catch (walletError) {
                    this.logger.warn(`Wallet info not available for ${coin}:`, walletError.message);
                }

                results[coin] = {
                    connected: true,
                    blockHeight: blockCount,
                    network: 'main',
                    error: null
                };

            } catch (error) {
                this.logger.error(`Connection test failed for ${coin}:`, error);
                results[coin] = {
                    connected: false,
                    error: error.message
                };
            }
        }
        
        return results;
    }

    // Address storage methods (using in-memory cache for now)
    async getUserAddressFromDB(telegramId, coinSymbol) {
        try {
            const cacheKey = `${telegramId}_${coinSymbol}`;
            const cachedAddress = this.addressCache.get(cacheKey);
            if (cachedAddress) {
                this.logger.info(`Found cached address for user ${telegramId} on ${coinSymbol}: ${cachedAddress}`);
                return cachedAddress;
            }
            return null;
        } catch (error) {
            this.logger.error(`Failed to get user address from cache:`, error);
            return null;
        }
    }

    async storeUserAddressInDB(telegramId, coinSymbol, address) {
        try {
            const cacheKey = `${telegramId}_${coinSymbol}`;
            this.addressCache.set(cacheKey, address);
            this.logger.info(`Stored address in cache: user ${telegramId}, ${coinSymbol}, ${address}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to store user address in cache:`, error);
            return false;
        }
    }

    // FIXED: Get user addresses - this is the core fix for AEGS balance
    async getUserAddresses(userId, coinSymbol) {
        try {
            const client = this.getClient(coinSymbol);
            
            // First try to get the cached address
            const cachedAddress = await this.getUserAddressFromDB(userId, coinSymbol);
            if (cachedAddress) {
                return [cachedAddress];
            }
            
            // Create a new address if none exists
            const newWallet = await this.createUserWallet(userId, coinSymbol);
            if (newWallet && newWallet.address) {
                return [newWallet.address];
            }
            
            return [];
        } catch (error) {
            this.logger.error(`Failed to get user addresses for ${userId} (${coinSymbol}):`, error);
            return [];
        }
    }

    // FIXED: Get user wallet balance - this fixes AEGS balance display
    async getUserWalletBalance(userId, coinSymbol, confirmations = 1) {
        try {
            const client = this.getClient(coinSymbol);
            const accountName = `user_${userId}`;
            
            // For AEGS, use address-based balance checking
            if (coinSymbol === 'AEGS') {
                const userAddresses = await this.getUserAddresses(userId, coinSymbol);
                if (!userAddresses || userAddresses.length === 0) {
                    return 0;
                }
                
                let totalBalance = 0;
                for (const address of userAddresses) {
                    try {
                        const addressBalance = await client.call('getreceivedbyaddress', [address, confirmations]);
                        totalBalance += parseFloat(addressBalance) || 0;
                        this.logger.info(`AEGS balance for address ${address}: ${addressBalance}`);
                    } catch (error) {
                        this.logger.warn(`Could not get AEGS balance for address ${address}: ${error.message}`);
                    }
                }
                
                this.logger.info(`Total AEGS balance for user ${userId}: ${totalBalance}`);
                return totalBalance;
            }
            
            // For other coins, use account-based balance
            try {
                const balance = await client.call('getbalance', [accountName, confirmations]);
                return parseFloat(balance) || 0;
            } catch (error) {
                this.logger.warn(`Account balance failed for ${accountName}: ${error.message}`);
                return 0;
            }
            
        } catch (error) {
            this.logger.error('Failed to get wallet balance', {
                userId,
                coinSymbol,
                error: error.message,
                service: 'community-tipbot'
            });
            return 0;
        }
    }

    // Wallet management methods
    async createUserWallet(telegramId, coinSymbol) {
        try {
            const client = this.getClient(coinSymbol);
            const labelName = `user_${telegramId}`;
            
            // Check if we already have an address for this user in database
            const existingAddress = await this.getUserAddressFromDB(telegramId, coinSymbol);
            if (existingAddress) {
                // Verify it's still owned by our wallet
                let addressInfo;
                try {
                    // Try getAddressInfo first (newer coins like AEGS)
                    addressInfo = await client.getAddressInfo(existingAddress);
                } catch (error) {
                    // Fallback to validateAddress for older coins (SHIC, PEPE, ADVC)
                    addressInfo = await client.validateAddress(existingAddress);
                }
                
                if (addressInfo.ismine) {
                    this.logger.info(`Using existing wallet for user ${telegramId} on ${coinSymbol}: ${existingAddress}`);
                    return {
                        address: existingAddress,
                        coinSymbol,
                        telegramId,
                        labelName,
                        ismine: addressInfo.ismine
                    };
                }
            }
            
            // Generate new address with label
            const address = await client.getNewAddress(labelName);
            
            // Verify the address is owned by our wallet
            let addressInfo;
            try {
                // Try getAddressInfo first (newer coins like AEGS)
                addressInfo = await client.getAddressInfo(address);
            } catch (error) {
                // Fallback to validateAddress for older coins (SHIC, PEPE, ADVC)
                addressInfo = await client.validateAddress(address);
            }
            
            if (!addressInfo.ismine) {
                throw new Error(`Generated address ${address} is not owned by wallet`);
            }
            
            // Import address for monitoring (ensures it's tracked for transactions)
            try {
                await client.importAddress(address, labelName, false);
                this.logger.info(`Address imported for monitoring: ${address}`);
            } catch (importError) {
                // Address might already be imported, that's okay
                this.logger.warn(`Address import warning (likely already imported): ${importError.message}`);
            }
            
            // Store address in database for future retrieval
            await this.storeUserAddressInDB(telegramId, coinSymbol, address);
            
            this.logger.info(`Created wallet for user ${telegramId} on ${coinSymbol}: ${address}`);
            
            return {
                address,
                coinSymbol,
                telegramId,
                labelName,
                ismine: addressInfo.ismine
            };
            
        } catch (error) {
            this.logger.error(`Failed to create wallet for user ${telegramId} on ${coinSymbol}:`, error);
            throw error;
        }
    }

    async getUserWalletAddress(telegramId, coinSymbol) {
        try {
            // Simply use createUserWallet which now handles caching and consistency
            const walletResult = await this.createUserWallet(telegramId, coinSymbol);
            return walletResult.address;
            
        } catch (error) {
            this.logger.error(`Failed to get wallet address for user ${telegramId} on ${coinSymbol}:`, error);
            throw error;
        }
    }

    async sendFromUserWallet(telegramId, toAddress, amount, coinSymbol) {
        try {
            const client = this.getClient(coinSymbol);
            const accountName = `user_${telegramId}`;
            
            // Check balance first
            const balance = await this.getUserWalletBalance(telegramId, coinSymbol);
            if (balance < amount) {
                throw new Error(`Insufficient balance. Available: ${balance}, Required: ${amount}`);
            }
            
            // Send from this specific account
            const txid = await client.sendFrom(accountName, toAddress, amount);
            
            this.logger.info(`Sent ${amount} ${coinSymbol} from user ${telegramId} to ${toAddress}:`, txid);
            
            return {
                txid,
                amount,
                success: true
            };

        } catch (error) {
            this.logger.error(`Transaction failed for ${coinSymbol}:`, error);
            throw error;
        }
    }

    // Get transaction details
    async getTransaction(txid, coinSymbol) {
        try {
            const client = this.getClient(coinSymbol);
            const tx = await client.getTransaction(txid);
            return tx;
        } catch (error) {
            this.logger.error(`Failed to get transaction ${txid} for ${coinSymbol}:`, error);
            return null;
        }
    }

    // Get current block height
    async getBlockHeight(coinSymbol) {
        try {
            const client = this.getClient(coinSymbol);
            return await client.getBlockCount();
        } catch (error) {
            this.logger.error(`Failed to get block height for ${coinSymbol}:`, error);
            return 0;
        }
    }

    // Monitor address for new transactions
    async getAddressTransactions(address, coinSymbol, limit = 10) {
        try {
            const client = this.getClient(coinSymbol);
            
            // Try to get address-specific transactions if supported
            try {
                return await client.getAddressTransactions(address, limit);
            } catch (error) {
                // Fallback: get all wallet transactions and filter
                const allTxs = await client.listTransactions('*', limit * 2);
                return allTxs.filter(tx => 
                    tx.address === address || 
                    (tx.details && tx.details.some(detail => detail.address === address))
                ).slice(0, limit);
            }
        } catch (error) {
            this.logger.error(`Failed to get transactions for ${address} (${coinSymbol}):`, error);
            return [];
        }
    }

    // Import address for monitoring
    async importAddress(address, coinSymbol, label = 'tipbot') {
        try {
            const client = this.getClient(coinSymbol);
            await client.importAddress(address, label, false); // Don't rescan for performance
            this.logger.info(`Address imported for monitoring:`, { address, coinSymbol });
            return true;
        } catch (error) {
            this.logger.error(`Failed to import address ${address} for ${coinSymbol}:`, error);
            return false;
        }
    }

    // Get network fee estimate
    async getFeeEstimate(coinSymbol, blocks = 6) {
        try {
            const client = this.getClient(coinSymbol);
            return await client.estimateSmartFee(blocks);
        } catch (error) {
            this.logger.warn(`Fee estimation failed for ${coinSymbol}, using default`);
            return 0.001;
        }
    }

    // Check if transaction is confirmed
    async isTransactionConfirmed(txid, coinSymbol, requiredConfirmations = 1) {
        try {
            const tx = await this.getTransaction(txid, coinSymbol);
            return tx && tx.confirmations >= requiredConfirmations;
        } catch (error) {
            this.logger.error(`Failed to check confirmation for ${txid} (${coinSymbol}):`, error);
            return false;
        }
    }
}

module.exports = BlockchainManager;