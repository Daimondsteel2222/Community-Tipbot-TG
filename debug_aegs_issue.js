#!/usr/bin/env node

require('dotenv').config();

const Database = require('./src/database/database');
const BlockchainManager = require('./src/blockchain/blockchain-manager');
const WalletManager = require('./src/wallet/wallet-manager');
const logger = require('./src/utils/logger');

async function debugAEGSIssue() {
    console.log('🔍 Debugging AEGS Balance Issue...\n');
    
    try {
        // Check environment variables
        console.log('📋 Environment Variables:');
        console.log(`AEGS_RPC_HOST: ${process.env.AEGS_RPC_HOST || 'NOT SET'}`);
        console.log(`AEGS_RPC_PORT: ${process.env.AEGS_RPC_PORT || 'NOT SET'}`);
        console.log(`AEGS_RPC_USER: ${process.env.AEGS_RPC_USER || 'NOT SET'}`);
        console.log(`AEGS_RPC_PASS: ${process.env.AEGS_RPC_PASS ? '***SET***' : 'NOT SET'}`);
        console.log('');

        // Initialize components
        console.log('🔧 Initializing components...');
        const db = new Database();
        await db.connect();
        
        const blockchain = new BlockchainManager();
        const wallet = new WalletManager(db, blockchain);
        
        // Test blockchain connections
        console.log('🌐 Testing blockchain connections...');
        const connections = await blockchain.testConnections();
        
        for (const [coin, status] of Object.entries(connections)) {
            console.log(`${coin}: ${status.connected ? '✅ Connected' : '❌ Failed'}`);
            if (!status.connected && status.error) {
                console.log(`   Error: ${status.error}`);
            }
            if (status.connected && status.blockHeight) {
                console.log(`   Block Height: ${status.blockHeight}`);
            }
        }
        console.log('');
        
        // Check supported coins
        console.log('🪙 Supported coins:');
        const supportedCoins = blockchain.getSupportedCoins();
        console.log(`Available: ${supportedCoins.join(', ')}`);
        console.log(`AEGS supported: ${blockchain.isCoinSupported('AEGS') ? '✅ Yes' : '❌ No'}`);
        console.log('');
        
        // Test with a sample user ID (you can replace this with your actual Telegram ID)
        const testUserId = 123456789; // Replace with your actual Telegram ID
        
        console.log(`👤 Testing with user ID: ${testUserId}`);
        
        // Check if user has wallet
        const hasWallet = await wallet.hasWallet(testUserId);
        console.log(`Has wallet: ${hasWallet ? '✅ Yes' : '❌ No'}`);
        
        if (hasWallet) {
            // Get wallet addresses
            console.log('📍 Wallet addresses:');
            try {
                const addresses = await wallet.getWalletAddresses(testUserId);
                for (const [coin, address] of Object.entries(addresses)) {
                    console.log(`${coin}: ${address}`);
                }
            } catch (error) {
                console.log(`❌ Error getting addresses: ${error.message}`);
            }
            console.log('');
            
            // Get balances
            console.log('💰 User balances:');
            try {
                const balances = await wallet.getUserBalances(testUserId);
                for (const [coin, balance] of Object.entries(balances)) {
                    console.log(`${coin}: ${balance.confirmed} confirmed, ${balance.unconfirmed} unconfirmed`);
                }
            } catch (error) {
                console.log(`❌ Error getting balances: ${error.message}`);
            }
        }
        
        await db.close();
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}

if (require.main === module) {
    debugAEGSIssue().catch(console.error);
}

module.exports = debugAEGSIssue;