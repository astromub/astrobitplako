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
        // Load header
        const headerContainer = document.getElementById('header-container');
        if (headerContainer) {
            headerContainer.innerHTML = await this.fetchComponent('components/header.html');
        }

        // Load sidebar
        const sidebarContainer = document.getElementById('sidebar-container');
        if (sidebarContainer) {
            sidebarContainer.innerHTML = await this.fetchComponent('components/sidebar.html');
        }

        // Load initial content
        await this.loadSection('dashboard');
    }

    async fetchComponent(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${path}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error loading component:', error);
            return `<div>Error loading component: ${path}</div>`;
        }
    }

    async loadSection(section) {
        this.currentSection = section;
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Load section content
        const contentContainer = document.getElementById('content-container');
        if (contentContainer) {
            contentContainer.innerHTML = await this.fetchComponent(`components/${section}.html`);
            
            // Initialize section-specific functionality
            this.initSection(section);
        }
    }

    initSection(section) {
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
        }
    }

    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                const section = navItem.dataset.section;
                this.loadSection(section);
            }
        });

        // Trading controls will be set up in initTrading()
        // Strategy controls will be set up in initStrategies()
        // Settings controls will be set up in initSettings()
    }

    setupPlatformHandlers() {
        // Handle price updates
        this.platform.onPriceUpdate = (priceData) => {
            this.handlePriceUpdate(priceData);
        };
    }

    handlePriceUpdate(priceData) {
        // Update UI elements with new price data
        this.updatePriceDisplays(priceData);
        this.updateActiveTradesDisplay();
    }

    updatePriceDisplays(priceData) {
        // Update current price displays for active trading panel
        const activeAsset = document.querySelector('.asset-badge.active');
        if (activeAsset && priceData.symbol === activeAsset.textContent) {
            const priceElement = document.getElementById('current-price');
            if (priceElement) {
                priceElement.value = priceData.bid.toFixed(5);
            }
        }

        // Update market overview
        this.updateMarketOverview(priceData);
    }

    updateMarketOverview(priceData) {
        const marketItems = document.querySelectorAll('.market-item');
        marketItems.forEach(item => {
            const symbolElement = item.querySelector('div:first-child');
            if (symbolElement.textContent === priceData.symbol) {
                const priceElement = item.querySelector('div:nth-child(2)');
                const changeElement = item.querySelector('div:last-child');
                
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
        });
    }

    updateActiveTradesDisplay() {
        // This will be implemented in each section's init function
        if (this.currentSection === 'positions' || this.currentSection === 'dashboard') {
            this.updatePositionsTable();
        }
    }

    async loadInitialData() {
        // Load initial market data
        // Load user preferences
        // Load trade history
        // This would typically involve API calls to get initial data
    }

    // Section initialization methods will be implemented here
    initDashboard() {
        console.log('Initializing dashboard...');
        // Setup dashboard charts and data
        this.setupDashboardCharts();
        this.updateDashboardStats();
        this.updatePositionsTable();
    }

    initTrading() {
        console.log('Initializing trading...');
        // Setup trading event listeners
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

    // Additional methods for each section will be implemented here...

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toast-container');
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                container.removeChild(toast);
            }, 300);
        }, 4000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    window.tradingApp = new BinaryTradingApp();
    await window.tradingApp.init();
    
    // Update current time
    setInterval(() => {
        document.getElementById('current-time').textContent = new Date().toLocaleTimeString();
    }, 1000);
});
