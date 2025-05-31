#!/usr/bin/env node

require('dotenv').config();

const DashboardServer = require('./web-dashboard/server');

async function startDashboard() {
    try {
        console.log('🚀 Starting Community TipBot Dashboard...');
        
        const dashboard = new DashboardServer();
        await dashboard.start();
        
        console.log('✅ Dashboard started successfully!');
        console.log('📊 Access your dashboard at: http://localhost:' + (process.env.DASHBOARD_PORT || 12000));
        console.log('🔑 Default password: ' + (process.env.DASHBOARD_PASSWORD || 'admin123'));
        console.log('');
        console.log('💡 To change the password, set DASHBOARD_PASSWORD in your .env file');
        console.log('💡 To change the port, set DASHBOARD_PORT in your .env file');
        
    } catch (error) {
        console.error('❌ Failed to start dashboard:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    startDashboard();
}

module.exports = startDashboard;