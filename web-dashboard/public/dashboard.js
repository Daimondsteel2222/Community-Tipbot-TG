// Dashboard JavaScript functionality

let ws = null;
let currentSection = 'overview';

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    connectWebSocket();
    loadInitialData();
    
    // Auto-refresh data every 30 seconds
    setInterval(loadCurrentSectionData, 30000);
});

// Navigation setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active nav
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide sections
            const sections = document.querySelectorAll('.content-section');
            sections.forEach(s => s.classList.remove('active'));
            
            const targetSection = this.getAttribute('data-section');
            document.getElementById(targetSection).classList.add('active');
            
            currentSection = targetSection;
            loadCurrentSectionData();
        });
    });
}

// WebSocket connection
function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = function() {
        console.log('WebSocket connected');
    };
    
    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        
        if (data.type === 'status_update') {
            updateOverviewMetrics(data);
        }
    };
    
    ws.onclose = function() {
        console.log('WebSocket disconnected, attempting to reconnect...');
        setTimeout(connectWebSocket, 5000);
    };
    
    ws.onerror = function(error) {
        console.error('WebSocket error:', error);
    };
}

// Load initial data
async function loadInitialData() {
    await loadStatus();
    await loadCurrentSectionData();
}

// Load current section data
async function loadCurrentSectionData() {
    switch(currentSection) {
        case 'overview':
            await loadStatus();
            break;
        case 'users':
            await loadUsers();
            break;
        case 'transactions':
            await loadTransactions();
            break;
        case 'balances':
            await loadBalances();
            break;
        case 'settings':
            await loadSettings();
            break;
    }
}

// API helper function
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`/api${endpoint}`, {
            credentials: 'include',
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`API call failed for ${endpoint}:`, error);
        throw error;
    }
}

// Load status data
async function loadStatus() {
    try {
        const data = await apiCall('/status');
        updateOverviewMetrics(data);
        updateBlockchainStatus(data.blockchain);
    } catch (error) {
        console.error('Failed to load status:', error);
    }
}

// Update overview metrics
function updateOverviewMetrics(data) {
    // Uptime
    const uptimeHours = Math.floor(data.uptime / 3600);
    const uptimeMinutes = Math.floor((data.uptime % 3600) / 60);
    document.getElementById('uptime').textContent = `${uptimeHours}h ${uptimeMinutes}m`;
    
    // Memory usage
    const memoryMB = Math.round(data.memory.heapUsed / 1024 / 1024);
    document.getElementById('memory').textContent = `${memoryMB} MB`;
    
    // Supported coins
    if (data.supportedCoins) {
        document.getElementById('supportedCoins').textContent = data.supportedCoins.length;
    }
}

// Update blockchain status
function updateBlockchainStatus(blockchainData) {
    const container = document.getElementById('blockchainStatus');
    
    if (!blockchainData) {
        container.innerHTML = '<div class="text-center text-muted">No blockchain data available</div>';
        return;
    }
    
    let html = '<div class="row">';
    
    for (const [coin, status] of Object.entries(blockchainData)) {
        const statusClass = status.connected ? 'status-online' : 'status-offline';
        const statusText = status.connected ? 'Connected' : 'Disconnected';
        
        html += `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title">
                            <span class="status-indicator ${statusClass}"></span>
                            ${coin}
                        </h6>
                        <p class="card-text">
                            Status: ${statusText}<br>
                            ${status.connected && status.blockHeight ? `Block: ${status.blockHeight}` : ''}
                            ${status.error ? `<small class="text-danger">Error: ${status.error}</small>` : ''}
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Load users data
async function loadUsers() {
    try {
        const users = await apiCall('/users');
        updateUsersTable(users);
    } catch (error) {
        console.error('Failed to load users:', error);
        document.querySelector('#usersTable tbody').innerHTML = 
            '<tr><td colspan="6" class="text-center text-danger">Failed to load users</td></tr>';
    }
}

// Update users table
function updateUsersTable(users) {
    const tbody = document.querySelector('#usersTable tbody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.telegram_id}</td>
            <td>${user.username || '-'}</td>
            <td>${user.first_name || ''} ${user.last_name || ''}</td>
            <td>${user.wallet_count}</td>
            <td>${new Date(user.created_at).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="refreshUserBalance(${user.telegram_id})">
                    Refresh Balance
                </button>
            </td>
        </tr>
    `).join('');
}

// Load transactions data
async function loadTransactions() {
    try {
        const transactions = await apiCall('/transactions');
        updateTransactionsTable(transactions);
    } catch (error) {
        console.error('Failed to load transactions:', error);
        document.querySelector('#transactionsTable tbody').innerHTML = 
            '<tr><td colspan="7" class="text-center text-danger">Failed to load transactions</td></tr>';
    }
}

// Update transactions table
function updateTransactionsTable(transactions) {
    const tbody = document.querySelector('#transactionsTable tbody');
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No transactions found</td></tr>';
        return;
    }
    
    tbody.innerHTML = transactions.map(tx => `
        <tr>
            <td><span class="badge bg-primary">${tx.transaction_type}</span></td>
            <td>${tx.from_user_id || '-'}</td>
            <td>${tx.to_user_id || '-'}</td>
            <td>${tx.amount} ${tx.coin_symbol}</td>
            <td>${tx.coin_symbol}</td>
            <td><span class="badge bg-${tx.status === 'completed' ? 'success' : 'warning'}">${tx.status}</span></td>
            <td>${new Date(tx.created_at).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

// Load balances data
async function loadBalances() {
    try {
        const balances = await apiCall('/balances');
        updateBalancesTable(balances);
    } catch (error) {
        console.error('Failed to load balances:', error);
        document.querySelector('#balancesTable tbody').innerHTML = 
            '<tr><td colspan="6" class="text-center text-danger">Failed to load balances</td></tr>';
    }
}

// Update balances table
function updateBalancesTable(balances) {
    const tbody = document.querySelector('#balancesTable tbody');
    
    if (balances.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No balances found</td></tr>';
        return;
    }
    
    tbody.innerHTML = balances.map(balance => `
        <tr>
            <td>${balance.username || 'Unknown'}</td>
            <td>${balance.telegram_id}</td>
            <td>${balance.coin_symbol}</td>
            <td>${balance.confirmed_balance}</td>
            <td>${balance.unconfirmed_balance}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="refreshUserBalance(${balance.telegram_id}, '${balance.coin_symbol}')">
                    Refresh
                </button>
            </td>
        </tr>
    `).join('');
}

// Load settings data
async function loadSettings() {
    try {
        const fees = await apiCall('/settings/fees');
        updateFeeSettings(fees);
    } catch (error) {
        console.error('Failed to load settings:', error);
        document.getElementById('feeSettings').innerHTML = 
            '<div class="text-center text-danger">Failed to load fee settings</div>';
    }
}

// Update fee settings
function updateFeeSettings(fees) {
    const container = document.getElementById('feeSettings');
    
    let html = '<div class="row">';
    
    for (const [coin, feeData] of Object.entries(fees)) {
        html += `
            <div class="col-md-6 mb-3">
                <div class="card">
                    <div class="card-header">
                        <h6>${coin} Fees</h6>
                    </div>
                    <div class="card-body">
                        <div class="mb-2">
                            <label class="form-label">Withdrawal Fee</label>
                            <input type="number" class="form-control" 
                                   value="${feeData.withdrawal}" 
                                   step="0.00000001"
                                   onchange="updateFee('${coin}', 'withdrawal', this.value)">
                        </div>
                        <div class="mb-2">
                            <label class="form-label">Tip Fee</label>
                            <input type="number" class="form-control" 
                                   value="${feeData.tip}" 
                                   step="0.00000001"
                                   onchange="updateFee('${coin}', 'tip', this.value)">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Update fee
async function updateFee(coin, feeType, value) {
    try {
        const feeData = {};
        feeData[feeType + 'Fee'] = parseFloat(value);
        
        await apiCall('/settings/fees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                coin: coin,
                ...feeData
            })
        });
        
        showAlert('Fee updated successfully', 'success');
    } catch (error) {
        console.error('Failed to update fee:', error);
        showAlert('Failed to update fee', 'danger');
    }
}

// Refresh user balance
async function refreshUserBalance(telegramId, coin = null) {
    try {
        const body = coin ? { coin } : {};
        
        await apiCall(`/users/${telegramId}/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });
        
        showAlert('Balance refresh initiated', 'success');
        
        // Reload current section data
        setTimeout(loadCurrentSectionData, 2000);
    } catch (error) {
        console.error('Failed to refresh balance:', error);
        showAlert('Failed to refresh balance', 'danger');
    }
}

// Show alert
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Logout function
async function logout() {
    try {
        await apiCall('/logout', { method: 'POST' });
        window.location.href = '/';
    } catch (error) {
        console.error('Logout failed:', error);
        window.location.href = '/';
    }
}

// Add coin form handler
document.addEventListener('DOMContentLoaded', function() {
    const addCoinForm = document.getElementById('addCoinForm');
    if (addCoinForm) {
        addCoinForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const coinData = Object.fromEntries(formData);
            
            try {
                const result = await apiCall('/coins/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(coinData)
                });
                
                if (result.success) {
                    showAlert('Coin added successfully', 'success');
                    this.reset();
                } else {
                    showAlert(result.message || 'Failed to add coin', 'warning');
                }
            } catch (error) {
                console.error('Failed to add coin:', error);
                showAlert('Failed to add coin', 'danger');
            }
        });
    }
});