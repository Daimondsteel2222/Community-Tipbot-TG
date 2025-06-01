#!/usr/bin/env node

const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

console.log('🔍 COMMUNITY TIPBOT - ISSUE DIAGNOSIS');
console.log('=====================================\n');

async function runCommand(command, description) {
    try {
        console.log(`📋 ${description}:`);
        const { stdout, stderr } = await execAsync(command);
        if (stdout.trim()) {
            console.log(stdout.trim());
        }
        if (stderr.trim()) {
            console.log(`⚠️  ${stderr.trim()}`);
        }
        console.log('');
    } catch (error) {
        console.log(`❌ Error: ${error.message}\n`);
    }
}

async function checkFile(filePath, description) {
    try {
        console.log(`📄 ${description}:`);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            console.log(content);
        } else {
            console.log(`❌ File not found: ${filePath}`);
        }
        console.log('');
    } catch (error) {
        console.log(`❌ Error reading ${filePath}: ${error.message}\n`);
    }
}

async function main() {
    // Check running processes
    await runCommand(
        'ps aux | grep -E "(aegisum|shiba|pepe|adventure)" | grep -v grep',
        'Checking for running coin daemons'
    );

    // Check listening ports
    await runCommand(
        'netstat -tlnp 2>/dev/null | grep -E "(8332|8333|8334|8335)" || ss -tlnp | grep -E "(8332|8333|8334|8335)"',
        'Checking RPC ports'
    );

    // Check PM2 processes
    await runCommand(
        'pm2 list',
        'Checking PM2 processes'
    );

    // Check .env file
    console.log('📄 Current .env configuration:');
    try {
        const envContent = fs.readFileSync('.env', 'utf8');
        // Hide sensitive values
        const safeContent = envContent
            .replace(/TELEGRAM_BOT_TOKEN=.*/g, 'TELEGRAM_BOT_TOKEN=***HIDDEN***')
            .replace(/RPC_PASS=.*/g, 'RPC_PASS=***HIDDEN***');
        console.log(safeContent);
    } catch (error) {
        console.log(`❌ Error reading .env: ${error.message}`);
    }
    console.log('');

    // Check coin config files
    const configPaths = [
        ['~/.aegisum/aegisum.conf', 'AEGS daemon config'],
        ['~/.shibacoin/shibacoin.conf', 'SHIC daemon config'],
        ['~/.pepecoin/pepecoin.conf', 'PEPE daemon config'],
        ['~/.adventurecoin/adventurecoin.conf', 'ADVC daemon config']
    ];

    for (const [path, description] of configPaths) {
        await runCommand(
            `cat ${path} 2>/dev/null || echo "Config file not found: ${path}"`,
            description
        );
    }

    // Check recent bot logs
    console.log('📋 Recent bot errors (last 10 lines):');
    try {
        const errorLog = fs.readFileSync('./logs/error.log', 'utf8');
        const lines = errorLog.split('\n').filter(line => line.trim()).slice(-10);
        lines.forEach(line => {
            try {
                const logEntry = JSON.parse(line);
                console.log(`${logEntry.timestamp}: ${logEntry.message} ${logEntry.error || ''}`);
            } catch {
                console.log(line);
            }
        });
    } catch (error) {
        console.log(`❌ Error reading logs: ${error.message}`);
    }
    console.log('');

    // Test RPC connections
    console.log('🔌 Testing RPC connections:');
    const coins = ['AEGS', 'SHIC', 'PEPE', 'ADVC'];
    const ports = [8332, 8333, 8334, 8335];
    
    for (let i = 0; i < coins.length; i++) {
        await runCommand(
            `timeout 5 nc -z 127.0.0.1 ${ports[i]} && echo "${coins[i]} port ${ports[i]}: OPEN" || echo "${coins[i]} port ${ports[i]}: CLOSED"`,
            `Testing ${coins[i]} connection`
        );
    }

    console.log('\n🎯 DIAGNOSIS SUMMARY:');
    console.log('====================');
    console.log('1. Check if your coin daemons are running (look for processes above)');
    console.log('2. Check if RPC ports are open (look for OPEN/CLOSED status above)');
    console.log('3. Verify your .env file has real values (not placeholders)');
    console.log('4. Check daemon config files for RPC settings');
    console.log('\n📞 Send this output to get specific help with your setup!');
}

main().catch(console.error);