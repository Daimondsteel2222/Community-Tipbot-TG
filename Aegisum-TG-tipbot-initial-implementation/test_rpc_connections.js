#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');

console.log('🔌 TESTING RPC CONNECTIONS');
console.log('===========================\n');

const coins = [
    {
        name: 'AEGS',
        host: process.env.AEGS_RPC_HOST || '127.0.0.1',
        port: process.env.AEGS_RPC_PORT || 8332,
        user: process.env.AEGS_RPC_USER,
        pass: process.env.AEGS_RPC_PASS
    },
    {
        name: 'SHIC',
        host: process.env.SHIC_RPC_HOST || '127.0.0.1',
        port: process.env.SHIC_RPC_PORT || 8333,
        user: process.env.SHIC_RPC_USER,
        pass: process.env.SHIC_RPC_PASS
    },
    {
        name: 'PEPE',
        host: process.env.PEPE_RPC_HOST || '127.0.0.1',
        port: process.env.PEPE_RPC_PORT || 8334,
        user: process.env.PEPE_RPC_USER,
        pass: process.env.PEPE_RPC_PASS
    },
    {
        name: 'ADVC',
        host: process.env.ADVC_RPC_HOST || '127.0.0.1',
        port: process.env.ADVC_RPC_PORT || 8335,
        user: process.env.ADVC_RPC_USER,
        pass: process.env.ADVC_RPC_PASS
    }
];

async function testRPCConnection(coin) {
    console.log(`🔍 Testing ${coin.name}:`);
    console.log(`   Host: ${coin.host}:${coin.port}`);
    console.log(`   User: ${coin.user || 'NOT SET'}`);
    console.log(`   Pass: ${coin.pass ? '***SET***' : 'NOT SET'}`);

    if (!coin.user || !coin.pass) {
        console.log(`   ❌ FAILED: RPC credentials not configured\n`);
        return false;
    }

    try {
        const auth = Buffer.from(`${coin.user}:${coin.pass}`).toString('base64');
        
        // Test with getblockcount for AEGS/ADVC, getinfo for SHIC/PEPE
        const method = (coin.name === 'AEGS' || coin.name === 'ADVC') ? 'getblockcount' : 'getinfo';
        
        const response = await axios.post(
            `http://${coin.host}:${coin.port}`,
            {
                jsonrpc: '1.0',
                id: 'test',
                method: method,
                params: []
            },
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            }
        );

        if (response.data && response.data.result !== undefined) {
            console.log(`   ✅ SUCCESS: Connected successfully`);
            console.log(`   📊 Result: ${JSON.stringify(response.data.result)}\n`);
            return true;
        } else {
            console.log(`   ❌ FAILED: Invalid response format\n`);
            return false;
        }
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log(`   ❌ FAILED: Connection refused - daemon not running or wrong port\n`);
        } else if (error.response && error.response.status === 401) {
            console.log(`   ❌ FAILED: 401 Unauthorized - wrong username/password\n`);
        } else if (error.code === 'ENOTFOUND') {
            console.log(`   ❌ FAILED: Host not found\n`);
        } else if (error.code === 'ETIMEDOUT') {
            console.log(`   ❌ FAILED: Connection timeout\n`);
        } else {
            console.log(`   ❌ FAILED: ${error.message}\n`);
        }
        return false;
    }
}

async function main() {
    console.log('Testing all RPC connections...\n');
    
    let successCount = 0;
    
    for (const coin of coins) {
        const success = await testRPCConnection(coin);
        if (success) successCount++;
    }
    
    console.log('📊 SUMMARY:');
    console.log(`✅ Successful connections: ${successCount}/${coins.length}`);
    console.log(`❌ Failed connections: ${coins.length - successCount}/${coins.length}\n`);
    
    if (successCount === 0) {
        console.log('🚨 NO RPC CONNECTIONS WORKING!');
        console.log('');
        console.log('🔧 TROUBLESHOOTING STEPS:');
        console.log('1. Check if your coin daemons are running:');
        console.log('   ps aux | grep -E "(aegisum|shiba|pepe|adventure)"');
        console.log('');
        console.log('2. Check if RPC ports are listening:');
        console.log('   netstat -tlnp | grep -E "(8332|8333|8334|8335)"');
        console.log('');
        console.log('3. Check your daemon config files for RPC settings:');
        console.log('   cat ~/.aegisum/aegisum.conf');
        console.log('   cat ~/.shibacoin/shibacoin.conf');
        console.log('   cat ~/.pepecoin/pepecoin.conf');
        console.log('   cat ~/.adventurecoin/adventurecoin.conf');
        console.log('');
        console.log('4. Update your .env file with the correct RPC credentials');
        console.log('');
    } else if (successCount < coins.length) {
        console.log('⚠️  PARTIAL SUCCESS - Some connections failed');
        console.log('Check the failed connections above and fix their configuration');
        console.log('');
    } else {
        console.log('🎉 ALL RPC CONNECTIONS WORKING!');
        console.log('Your bot should now work properly for balance checks and deposits');
        console.log('');
    }
    
    console.log('💡 TIP: Run this script after making any RPC configuration changes');
}

main().catch(console.error);