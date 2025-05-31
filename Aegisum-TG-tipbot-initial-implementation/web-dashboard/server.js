const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws');
const http = require('http');

// Import bot components
const Database = require('../src/database/database');
const BlockchainManager = require('../src/blockchain/blockchain-manager');
const WalletManager = require('../src/wallet/wallet-manager');
const logger = require('../src/utils/logger');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

class DashboardServer {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });
        this.port = process.env.DASHBOARD_PORT || 12000;
        this.adminPassword = process.env.DASHBOARD_PASSWORD || 'admin123';
        
        // Bot components
        this.db = null;
        this.blockchain = null;
        this.wallet = null;
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
    }

    async initialize() {
        try {
            // Initialize bot components
            this.db = new Database();
            await this.db.connect();
            
            this.blockchain = new BlockchainManager();
            this.wallet = new WalletManager(this.db, this.blockchain);
            
            logger.info('Dashboard server components initialized');
        } catch (error) {
            logger.error('Failed to initialize dashboard components:', error);
            throw error;
        }
    }

    setupMiddleware() {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "ws:", "wss:"]
                }
            }
        }));

        // CORS
        this.app.use(cors({
            origin: true,
            credentials: true
        }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        });
        this.app.use(limiter);

        // Body parsing
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        // Session management
        this.app.use(session({
            secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
            resave: false,
            saveUninitialized: false,
            cookie: { 
                secure: false, // Set to true if using HTTPS
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            }
        }));

        // Static files
        this.app.use(express.static(path.join(__dirname, 'public')));
    }

    setupRoutes() {
        // Authentication middleware
        const requireAuth = (req, res, next) => {
            if (req.session.authenticated) {
                next();
            } else {
                res.status(401).json({ error: 'Authentication required' });
            }
        };

        // Login page
        this.app.get('/', (req, res) => {
            if (req.session.authenticated) {
                res.redirect('/dashboard');
            } else {
                res.sendFile(path.join(__dirname, 'public', 'login.html'));
            }
        });

        // Login endpoint
        this.app.post('/api/login', async (req, res) => {
            try {
                const { password } = req.body;
                
                if (password === this.adminPassword) {
                    req.session.authenticated = true;
                    res.json({ success: true });
                } else {
                    res.status(401).json({ error: 'Invalid password' });
                }
            } catch (error) {
                res.status(500).json({ error: 'Login failed' });
            }
        });

        // Logout endpoint
        this.app.post('/api/logout', (req, res) => {
            req.session.destroy();
            res.json({ success: true });
        });

        // Dashboard page
        this.app.get('/dashboard', requireAuth, (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
        });

        // API Routes
        this.app.get('/api/status', requireAuth, async (req, res) => {
            try {
                const connections = await this.blockchain.testConnections();
                const supportedCoins = this.blockchain.getSupportedCoins();
                
                res.json({
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    blockchain: connections,
                    supportedCoins
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/users', requireAuth, async (req, res) => {
            try {
                const users = await this.db.all(`
                    SELECT u.*, COUNT(w.id) as wallet_count 
                    FROM users u 
                    LEFT JOIN wallets w ON u.id = w.user_id 
                    GROUP BY u.id 
                    ORDER BY u.created_at DESC 
                    LIMIT 100
                `);
                res.json(users);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/transactions', requireAuth, async (req, res) => {
            try {
                const transactions = await this.db.all(`
                    SELECT * FROM transactions 
                    ORDER BY created_at DESC 
                    LIMIT 100
                `);
                res.json(transactions);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/balances', requireAuth, async (req, res) => {
            try {
                const balances = await this.db.all(`
                    SELECT u.username, u.telegram_id, b.coin_symbol, 
                           b.confirmed_balance, b.unconfirmed_balance
                    FROM users u
                    JOIN balances b ON u.id = b.user_id
                    WHERE b.confirmed_balance > 0 OR b.unconfirmed_balance > 0
                    ORDER BY b.coin_symbol, b.confirmed_balance DESC
                `);
                res.json(balances);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/settings/fees', requireAuth, async (req, res) => {
            try {
                const { coin, withdrawalFee, tipFee } = req.body;
                
                // Update fees in database
                await this.db.run(`
                    INSERT OR REPLACE INTO admin_settings (key, value) 
                    VALUES (?, ?)
                `, [`${coin}_withdrawal_fee`, withdrawalFee]);
                
                await this.db.run(`
                    INSERT OR REPLACE INTO admin_settings (key, value) 
                    VALUES (?, ?)
                `, [`${coin}_tip_fee`, tipFee]);
                
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/settings/fees', requireAuth, async (req, res) => {
            try {
                const fees = {};
                const supportedCoins = this.blockchain.getSupportedCoins();
                
                for (const coin of supportedCoins) {
                    const withdrawalFee = await this.db.get(`
                        SELECT value FROM admin_settings WHERE key = ?
                    `, [`${coin}_withdrawal_fee`]);
                    
                    const tipFee = await this.db.get(`
                        SELECT value FROM admin_settings WHERE key = ?
                    `, [`${coin}_tip_fee`]);
                    
                    fees[coin] = {
                        withdrawal: withdrawalFee ? parseFloat(withdrawalFee.value) : 0,
                        tip: tipFee ? parseFloat(tipFee.value) : 0
                    };
                }
                
                res.json(fees);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Add new coin support
        this.app.post('/api/coins/add', requireAuth, async (req, res) => {
            try {
                const { symbol, name, rpcHost, rpcPort, rpcUser, rpcPass } = req.body;
                
                // This would require updating environment variables and restarting
                // For now, just return a message
                res.json({ 
                    success: false, 
                    message: 'Adding new coins requires server restart with updated environment variables' 
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Force balance refresh
        this.app.post('/api/users/:telegramId/refresh', requireAuth, async (req, res) => {
            try {
                const { telegramId } = req.params;
                const { coin } = req.body;
                
                if (coin) {
                    await this.wallet.updateUserBalance(telegramId, coin);
                } else {
                    // Refresh all coins
                    const supportedCoins = this.blockchain.getSupportedCoins();
                    for (const coinSymbol of supportedCoins) {
                        await this.wallet.updateUserBalance(telegramId, coinSymbol);
                    }
                }
                
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }

    setupWebSocket() {
        this.wss.on('connection', (ws) => {
            logger.info('Dashboard WebSocket client connected');
            
            // Send initial status
            this.sendStatusUpdate(ws);
            
            // Set up periodic status updates
            const interval = setInterval(async () => {
                if (ws.readyState === WebSocket.OPEN) {
                    await this.sendStatusUpdate(ws);
                }
            }, 30000); // Update every 30 seconds
            
            ws.on('close', () => {
                clearInterval(interval);
                logger.info('Dashboard WebSocket client disconnected');
            });
        });
    }

    async sendStatusUpdate(ws) {
        try {
            if (ws.readyState === WebSocket.OPEN) {
                const status = {
                    type: 'status_update',
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    blockchain: await this.blockchain.testConnections()
                };
                
                ws.send(JSON.stringify(status));
            }
        } catch (error) {
            logger.error('Failed to send status update:', error);
        }
    }

    async start() {
        try {
            await this.initialize();
            
            this.server.listen(this.port, '0.0.0.0', () => {
                logger.info(`Dashboard server running on port ${this.port}`);
                console.log(`🌐 Dashboard available at: http://localhost:${this.port}`);
                console.log(`🔑 Default password: ${this.adminPassword}`);
            });
        } catch (error) {
            logger.error('Failed to start dashboard server:', error);
            throw error;
        }
    }
}

// Start the dashboard server
if (require.main === module) {
    const dashboard = new DashboardServer();
    dashboard.start().catch(console.error);
}

module.exports = DashboardServer;