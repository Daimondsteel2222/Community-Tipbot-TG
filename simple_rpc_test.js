#!/usr/bin/env node

const axios = require('axios');

// RPC credentials from your daemon configs
const rpcConfigs = {
    AEGS: {
        host: '127.0.0.1',
        port: 8332,
        user: 'aegsrpc',
        pass: 'pJFssAAUq9chHP3/c84IDRjR2WG6e6qfK4EbZMjVZu0='
    },
    SHIC: {
        host: '127.0.0.1',
        port: 8333,
        user: 'shicrpc',
        pass: 'csidLInNYHm1EGI651+mQ1VC8vu23v1p4NiZcfagCoM='
    },
    PEPE: {
        host: '127.0.0.1',
        port: 8334,
        user: 'peperpc',
        pass: 'IHQBqUZ1qoj9YDwghcgFu7S49xuSi1IcIo6f1HfwDbQ='
    },
    ADVC: {
        host: '127.0.0.1',
        port: 9982,
        user: 'advcrpc',
        pass: 'OaVODP1NFGd55Xs8cHB7GbbbSl9rPE+5MeYj0vUQm/8='
    }
};

async function testRPC(coin, config) {
    try {
        console.log(`🔍 Testing ${coin} RPC connection...`);
        
        const response = await axios.post(`http://${config.host}:${config.port}`, {
            jsonrpc: '1.0',
            id: Date.now(),
            method: 'getblockchaininfo',
            params: []
        }, {
            auth: {
                username: config.user,
                password: config.pass
            },
            timeout: 5000
        });
        
        if (response.data && response.data.result) {
            console.log(`✅ ${coin}: Connected successfully! Block height: ${response.data.result.blocks || 'N/A'}`);
            return true;
        } else {
            console.log(`❌ ${coin}: Unexpected response format`);
            return false;
        }
        
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log(`❌ ${coin}: Authentication failed (401) - Wrong RPC credentials`);
        } else if (error.code === 'ECONNREFUSED') {
            console.log(`❌ ${coin}: Connection refused - Daemon not running or wrong port`);
        } else {
            console.log(`❌ ${coin}: ${error.message}`);
        }
        return false;
    }
}

async function testAllRPC() {
    console.log('🔌 TESTING RPC CONNECTIONS');
    console.log('===========================\n');
    
    let successCount = 0;
    const totalCount = Object.keys(rpcConfigs).length;
    
    for (const [coin, config] of Object.entries(rpcConfigs)) {
        const success = await testRPC(coin, config);
        if (success) successCount++;
        console.log('');
    }
    
    console.log('📊 SUMMARY:');
    console.log(`✅ Successful connections: ${successCount}/${totalCount}`);
    console.log(`❌ Failed connections: ${totalCount - successCount}/${totalCount}`);
    
    if (successCount === totalCount) {
        console.log('\n🎉 ALL RPC CONNECTIONS WORKING!');
        console.log('Your bot should work perfectly now!');
    } else {
        console.log('\n🚨 SOME RPC CONNECTIONS FAILED!');
        console.log('Check the errors above and fix the issues.');
    }
}

// Run the test
testAllRPC().catch(console.error);