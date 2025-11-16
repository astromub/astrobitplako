// Main application initialization and event handling
class BinaryTradingApp {
    constructor() {
        this.platform = new BinaryTradingPlatform();
        this.currentSection = 'dashboard';
        this.isInitialized = false;
    }

    async init() {
        try {
            // Initialize platform
            const result = await this.platform.init();
            if (!result.success) {
                throw new Error(result.error);
            }

            // Load components
            await this.loadComponents();
            
            // Setup event listeners - MOVED THIS EARLIER
            this.setupEventListeners();
            
            // Setup platform event handlers
            this.setupPlatformHandlers();
            
            // Load initial data
            await this.loadInitialData();
            
            this.isInitialized = true;
            console.log('Binary Trading App initialized successfully');
            
            this.showToast('Platform initialized successfully', 'success');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showToast('Failed to initialize: ' + error.message, 'error');
        }
    }

    async loadComponents() {
        try {
            // Load header
            const headerContainer = document.getElementById('header-container');
            if (headerContainer) {
                const headerHtml = await this.fetchComponent('components/header.html');
                headerContainer.innerHTML = headerHtml;
            }

            // Load sidebar
            const sidebarContainer = document.getElementById('sidebar-container');
            if (sidebarContainer) {
                const sidebarHtml = await this.fetchComponent('components/sidebar.html');
                sidebarContainer.innerHTML = sidebarHtml;
                
                // Setup sidebar navigation AFTER sidebar is loaded
                this.setupSidebarNavigation();
            }

            // Load initial content
            await this.loadSection('dashboard');
        } catch (error) {
            console.error('Error loading components:', error);
        }
    }

    setupSidebarNavigation() {
        // Add click event listeners to sidebar items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                if (section) {
                    this.loadSection(section);
                }
            });
        });
    }

    async fetchComponent(path) {
        try {
            // For GitHub Pages, adjust path if needed
            const actualPath = path.startsWith('components/') ? path : `components/${path}`;
            const response = await fetch(actualPath);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${path}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error loading component:', error);
            return `<div class="error">Error loading component: ${path}</div>`;
        }
    }

    async loadSection(section) {
        console.log('Loading section:', section);
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === section) {
                item.classList.add('active');
            }
        });

        this.currentSection = section;
        
        try {
            // Load section content
            const contentContainer = document.getElementById('content-container');
            if (contentContainer) {
                // Show loading state
                contentContainer.innerHTML = '<div class="loading">Loading...</div>';
                
                const sectionHtml = await this.fetchComponent(`${section}.html`);
                contentContainer.innerHTML = sectionHtml;
                
                // Initialize section-specific functionality
                this.initSection(section);
            }
        } catch (error) {
            console.error(`Error loading section ${section}:`, error);
            const contentContainer = document.getElementById('content-container');
            if (contentContainer) {
                contentContainer.innerHTML = `<div class="error">Error loading ${section} section</div>`;
            }
        }
    }

    setupEventListeners() {
        // Trading controls event delegation
        document.addEventListener('click', (e) => {
            // Handle amount buttons
            if (e.target.classList.contains('amount-btn')) {
                this.handleAmountButton(e.target);
            }
            
            // Handle asset badges
            if (e.target.classList.contains('asset-badge')) {
                this.handleAssetSelection(e.target);
            }
            
            // Handle trade types
            if (e.target.classList.contains('trade-type')) {
                this.handleTradeTypeSelection(e.target);
            }
            
            // Handle trade buttons
            if (e.target.classList.contains('btn-call') || e.target.classList.contains('btn-put')) {
                this.handleTradeButton(e.target);
            }
        });

        // Form inputs
        document.addEventListener('input', (e) => {
            if (e.target.id === 'trade-amount') {
                this.updatePayout();
            }
        });
    }

    // Add these missing methods that were in the original code
    handleAmountButton(button) {
        document.querySelectorAll('.amount-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        const amount = button.getAttribute('data-amount');
        document.getElementById('trade-amount').value = amount;
        this.updatePayout();
    }

    handleAssetSelection(assetBadge) {
        document.querySelectorAll('.asset-badge').forEach(badge => {
            badge.classList.remove('active');
        });
        assetBadge.classList.add('active');
        
        // In a real app, you would update the chart and prices here
        this.showToast(`Selected asset: ${assetBadge.textContent}`, 'success');
    }

    handleTradeTypeSelection(tradeType) {
        document.querySelectorAll('.trade-type').forEach(type => {
            type.classList.remove('active');
        });
        tradeType.classList.add('active');
    }

    handleTradeButton(button) {
        const direction = button.classList.contains('btn-call') ? 'call' : 'put';
        const amount = document.getElementById('trade-amount').value;
        const asset = document.querySelector('.asset-badge.active').textContent;
        
        this.platform.placeTrade(asset, direction, amount, '60s')
            .then(result => {
                if (result.success) {
                    this.showToast(`Trade placed successfully!`, 'success');
                    this.updateUI();
                } else {
                    this.showToast(`Trade failed: ${result.error}`, 'error');
                }
            })
            .catch(error => {
                this.showToast(`Trade error: ${error.message}`, 'error');
            });
    }

    updatePayout() {
        const amount = parseFloat(document.getElementById('trade-amount').value) || 0;
        const payout = (amount * 1.85).toFixed(2);
        const payoutElement = document.getElementById('payout-amount');
        if (payoutElement) {
            payoutElement.value = `$${payout}`;
        }
    }

    updateUI() {
        // Update balance display
        const balance = this.platform.state.balance;
        const balanceElements = document.querySelectorAll('#user-balance, #account-balance');
        balanceElements.forEach(element => {
            if (element) {
                element.textContent = `$${balance.toFixed(2)}`;
            }
        });

        // Update active trades count
        const activeTradesElement = document.getElementById('active-trades');
        if (activeTradesElement) {
            activeTradesElement.textContent = this.platform.state.activeTrades.length;
        }

        // Update positions table if we're on dashboard or positions section
        if (this.currentSection === 'dashboard' || this.currentSection === 'positions') {
            this.updatePositionsTable();
        }
    }

    updatePositionsTable() {
        const tbody = document.getElementById('positions-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.platform.state.activeTrades.forEach(trade => {
            const timeLeft = Math.max(0, Math.floor((new Date(trade.expiry) - new Date()) / 1000));
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${trade.asset}</td>
                <td>${trade.direction.toUpperCase()}</td>
                <td>$${trade.amount}</td>
                <td>${minutes}:${seconds.toString().padStart(2, '0')}</td>
                <td class="position-profit ${trade.potentialProfit > 0 ? 'positive' : 'negative'}">
                    ${trade.potentialProfit > 0 ? '+' : ''}$${trade.potentialProfit?.toFixed(2) || '0.00'}
                </td>
            `;
            tbody.appendChild(row);
        });

        if (this.platform.state.activeTrades.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="5" style="text-align: center; color: #94a3b8;">No active positions</td>`;
            tbody.appendChild(row);
        }
    }

    // Rest of your existing methods remain the same...
    setupPlatformHandlers() {
        this.platform.onPriceUpdate = (priceData) => {
            this.handlePriceUpdate(priceData);
        };
    }

    handlePriceUpdate(priceData) {
        this.updatePriceDisplays(priceData);
        this.updateActiveTradesDisplay();
    }

    updatePriceDisplays(priceData) {
        const activeAsset = document.querySelector('.asset-badge.active');
        if (activeAsset && priceData.symbol === activeAsset.textContent) {
            const priceElement = document.getElementById('current-price');
            if (priceElement) {
                priceElement.value = priceData.bid.toFixed(5);
            }
        }
        this.updateMarketOverview(priceData);
    }

    updateMarketOverview(priceData) {
        // Implementation from original code
        const marketItems = document.querySelectorAll('.market-item');
        marketItems.forEach(item => {
            const symbolElement = item.querySelector('div:first-child');
            if (symbolElement && symbolElement.textContent === priceData.symbol) {
                const priceElement = item.querySelector('div:nth-child(2)');
                const changeElement = item.querySelector('div:last-child');
                
                if (priceElement && changeElement) {
                    const oldPrice = parseFloat(priceElement.textContent.replace(',', ''));
                    const change = ((priceData.bid - oldPrice) / oldPrice) * 100;
                    
                    priceElement.textContent = priceData.bid.toFixed(
                        priceData.symbol.includes('JPY') ? 2 : 
                        priceData.symbol.includes('Gold') ? 2 : 4
                    );
                    
                    if (priceData.symbol === 'Gold' || priceData.symbol === 'BTC/USD') {
                        priceElement.textContent = parseFloat(priceElement.textContent).toLocaleString();
                    }
                    
                    changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
                    changeElement.className = change >= 0 ? 'positive' : 'negative';
                }
            }
        });
    }

    updateActiveTradesDisplay() {
        if (this.currentSection === 'positions' || this.currentSection === 'dashboard') {
            this.updatePositionsTable();
        }
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.classList.add('show');
            }, 100);
            
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (container.contains(toast)) {
                        container.removeChild(toast);
                    }
                }, 300);
            }, 4000);
        }
    }

    // Section initialization methods
    initDashboard() {
        console.log('Initializing dashboard...');
        this.setupDashboardCharts();
        this.updateDashboardStats();
        this.updatePositionsTable();
        this.setupTradingEventListeners();
    }

    initTrading() {
        console.log('Initializing trading...');
        this.setupTradingEventListeners();
    }

    initPositions() {
        console.log('Initializing positions...');
        this.updateOpenPositionsTable();
    }

    initStrategies() {
        console.log('Initializing strategies...');
        this.setupStrategyEventListeners();
    }

    initAnalytics() {
        console.log('Initializing analytics...');
        this.setupAnalyticsCharts();
    }

    initHistory() {
        console.log('Initializing history...');
        this.updateTradeHistoryTable();
    }

    initSettings() {
        console.log('Initializing settings...');
        this.setupSettingsEventListeners();
    }

    // Placeholder methods for section-specific functionality
    setupDashboardCharts() {
        // Initialize charts for dashboard
        if (typeof this.platform.chartManager !== 'undefined') {
            // Generate sample data for charts
            const priceData = Array.from({length: 50}, (_, i) => 1.0850 + (Math.random() - 0.5) * 0.002);
            this.platform.chartManager.createPriceChart('price-chart', 'EUR/USD', priceData);
            
            const performanceData = {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                values: [150, -80, 220, 180, 320]
            };
            this.platform.chartManager.createPerformanceChart('performance-chart', performanceData);
        }
    }

    setupTradingEventListeners() {
        // Already handled by the main event listener
    }

    updateDashboardStats() {
        // Update dashboard statistics
    }

    updateOpenPositionsTable() {
        // Similar to updatePositionsTable but for positions section
    }

    setupStrategyEventListeners() {
        // Setup strategy-related event listeners
    }

    setupAnalyticsCharts() {
        // Setup analytics charts
    }

    updateTradeHistoryTable() {
        // Update trade history table
    }

    setupSettingsEventListeners() {
        // Setup settings event listeners
    }

    async loadInitialData() {
        // Load initial market data
        try {
            // Initialize with current prices
            const assets = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'Gold'];
            for (const asset of assets) {
                const priceData = await this.platform.broker.getCurrentPrice(asset);
                this.handlePriceUpdate(priceData);
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Add loading styles
    const style = document.createElement('style');
    style.textContent = `
        .loading {
            text-align: center;
            padding: 2rem;
            color: #94a3b8;
        }
        .error {
            text-align: center;
            padding: 2rem;
            color: #ef4444;
        }
    `;
    document.head.appendChild(style);

    window.tradingApp = new BinaryTradingApp();
    await window.tradingApp.init();
    
    // Update current time
    setInterval(() => {
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = new Date().toLocaleTimeString();
        }
    }, 1000);
});