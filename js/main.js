// Main application initialization and event handling
class BinaryTradingApp {
    constructor() {
        this.platform = new BinaryTradingPlatform();
        this.currentSection = 'dashboard';
        this.isInitialized = false;
    }

    async init() {
        try {
            console.log('Starting app initialization...');
            
            // Load components first
            await this.loadComponents();
            
            // Initialize platform
            const result = await this.platform.init();
            if (!result.success) {
                throw new Error(result.error);
            }
            
            // Setup event listeners
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
            console.log('Loading components...');
            
            // Load header
            const headerContainer = document.getElementById('header-container');
            if (headerContainer) {
                console.log('Loading header...');
                const headerHtml = await this.fetchComponent('header.html');
                headerContainer.innerHTML = headerHtml;
            }

            // Load sidebar
            const sidebarContainer = document.getElementById('sidebar-container');
            if (sidebarContainer) {
                console.log('Loading sidebar...');
                const sidebarHtml = await this.fetchComponent('sidebar.html');
                sidebarContainer.innerHTML = sidebarHtml;
                
                // Setup sidebar navigation AFTER sidebar is loaded
                this.setupSidebarNavigation();
            }

            // Load initial content
            await this.loadSection('dashboard');
        } catch (error) {
            console.error('Error loading components:', error);
            this.showToast('Error loading components: ' + error.message, 'error');
        }
    }

    setupSidebarNavigation() {
        console.log('Setting up sidebar navigation...');
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                console.log('Navigation clicked:', section);
                if (section) {
                    this.loadSection(section);
                }
            });
        });
    }

    async fetchComponent(path) {
        try {
            console.log('Fetching component:', path);
            // Use correct path - components are in root /components/ directory
            const response = await fetch(`components/${path}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const text = await response.text();
            console.log('Component loaded successfully:', path);
            return text;
        } catch (error) {
            console.error('Error loading component:', path, error);
            return `<div class="error">Error loading component: ${path}<br>${error.message}</div>`;
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
                contentContainer.innerHTML = '<div class="loading">Loading ' + section + '...</div>';
                
                const sectionHtml = await this.fetchComponent(`${section}.html`);
                contentContainer.innerHTML = sectionHtml;
                
                // Initialize section-specific functionality - FIXED TYPO HERE
                this.initSection(section); // Fixed from "iniSection" to "initSection"
                
                console.log('Section loaded successfully:', section);
            }
        } catch (error) {
            console.error(`Error loading section ${section}:`, error);
            const contentContainer = document.getElementById('content-container');
            if (contentContainer) {
                contentContainer.innerHTML = `<div class="error">Error loading ${section} section: ${error.message}</div>`;
            }
        }
    }

    // Section initialization methods - ADDED MISSING METHOD
    initSection(section) {
        console.log('Initializing section:', section);
        switch (section) {
            case 'dashboard':
                this.initDashboard();
                break;
            case 'trading':
                this.initTrading();
                break;
            case 'positions':
                this.initPositions();
                break;
            case 'strategies':
                this.initStrategies();
                break;
            case 'analytics':
                this.initAnalytics();
                break;
            case 'history':
                this.initHistory();
                break;
            case 'settings':
                this.initSettings();
                break;
            default:
                console.warn('Unknown section:', section);
        }
    }

    setupEventListeners() {
        // Use event delegation for dynamic elements
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
            if (e.target.id === 'call-btn' || e.target.id === 'put-btn') {
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

    handleAmountButton(button) {
        const amountButtons = button.closest('.amount-buttons');
        if (amountButtons) {
            amountButtons.querySelectorAll('.amount-btn').forEach(btn => {
                btn.classList.remove('active');
            });
        }
        button.classList.add('active');
        
        const amount = button.getAttribute('data-amount');
        const tradeAmountInput = document.getElementById('trade-amount');
        if (tradeAmountInput) {
            tradeAmountInput.value = amount;
            this.updatePayout();
        }
    }

    handleAssetSelection(assetBadge) {
        const assetSelector = assetBadge.closest('.asset-selector');
        if (assetSelector) {
            assetSelector.querySelectorAll('.asset-badge').forEach(badge => {
                badge.classList.remove('active');
            });
        }
        assetBadge.classList.add('active');
        
        this.showToast(`Selected asset: ${assetBadge.textContent}`, 'success');
    }

    handleTradeTypeSelection(tradeType) {
        const tradeTypeSelector = tradeType.closest('.trade-type-selector');
        if (tradeTypeSelector) {
            tradeTypeSelector.querySelectorAll('.trade-type').forEach(type => {
                type.classList.remove('active');
            });
        }
        tradeType.classList.add('active');
    }

    handleTradeButton(button) {
        const direction = button.id === 'call-btn' ? 'call' : 'put';
        const amountInput = document.getElementById('trade-amount');
        const activeAsset = document.querySelector('.asset-badge.active');
        
        if (!amountInput || !activeAsset) {
            this.showToast('Please select asset and amount', 'error');
            return;
        }
        
        const amount = parseFloat(amountInput.value);
        const asset = activeAsset.textContent;
        
        if (amount < 10) {
            this.showToast('Minimum trade amount is $10', 'error');
            return;
        }
        
        this.showToast(`Placing ${direction.toUpperCase()} trade for $${amount} on ${asset}`, 'success');
        
        // Simulate trade execution
        setTimeout(() => {
            this.showToast(`Trade executed successfully!`, 'success');
            this.updateUI();
        }, 1000);
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
        if (this.platform && this.platform.state) {
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
    }

    updatePositionsTable() {
        const tbody = document.getElementById('positions-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.platform && this.platform.state) {
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
        }

        const hasTrades = this.platform && this.platform.state && this.platform.state.activeTrades.length > 0;
        if (!hasTrades) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="5" style="text-align: center; color: #94a3b8;">No active positions</td>`;
            tbody.appendChild(row);
        }
    }

    setupPlatformHandlers() {
        if (this.platform) {
            this.platform.onPriceUpdate = (priceData) => {
                this.handlePriceUpdate(priceData);
            };
        }
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
        console.log('Setting up dashboard charts...');
        // Chart initialization would go here
    }

    setupTradingEventListeners() {
        console.log('Setting up trading event listeners...');
        // Already handled by main event delegation
    }

    updateDashboardStats() {
        console.log('Updating dashboard stats...');
        // Stats update would go here
    }

    updateOpenPositionsTable() {
        console.log('Updating open positions table...');
        // Similar to updatePositionsTable but for positions section
    }

    setupStrategyEventListeners() {
        console.log('Setting up strategy event listeners...');
        // Setup strategy-related event listeners
    }

    setupAnalyticsCharts() {
        console.log('Setting up analytics charts...');
        // Setup analytics charts
    }

    updateTradeHistoryTable() {
        console.log('Updating trade history table...');
        // Update trade history table
    }

    setupSettingsEventListeners() {
        console.log('Setting up settings event listeners...');
        // Setup settings event listeners
    }

    async loadInitialData() {
        console.log('Loading initial data...');
        // Load initial market data
        try {
            // Initialize with current prices
            const assets = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'Gold'];
            for (const asset of assets) {
                if (this.platform && this.platform.broker) {
                    const priceData = await this.platform.broker.getCurrentPrice(asset);
                    this.handlePriceUpdate(priceData);
                }
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
            font-size: 1.1rem;
        }
        .error {
            text-align: center;
            padding: 2rem;
            color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
            border-radius: 8px;
            margin: 1rem 0;
        }
        .content-section {
            display: none;
        }
        .content-section.active {
            display: block;
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
