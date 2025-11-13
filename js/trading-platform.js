// Main trading platform class
class BinaryTradingPlatform {
    constructor() {
        this.broker = new DemoBrokerAPI();
        this.chartManager = new ChartManager();
        this.strategyManager = new StrategyManager();
        
        this.state = {
            balance: 10000,
            activeTrades: [],
            tradeHistory: [],
            userSettings: {
                riskLevel: 'medium',
                autoTrade: false,
                soundEnabled: true,
                maxTradeSize: 1000,
                dailyLossLimit: 500
            }
        };
        
        this.setupStrategies();
    }
    
    setupStrategies() {
        // Register trading strategies
        this.strategyManager.registerStrategy('Trend Following', 
            new TrendFollowingStrategy('Trend Following', { 
                period: 20, 
                threshold: 0.001 
            })
        );
        
        this.strategyManager.registerStrategy('Mean Reversion', 
            new MeanReversionStrategy('Mean Reversion', { 
                period: 14, 
                threshold: 0.002 
            })
        );
        
        this.strategyManager.registerStrategy('Breakout', 
            new BreakoutStrategy('Breakout', { 
                period: 10, 
                breakoutThreshold: 0.0015 
            })
        );
    }
    
    async init() {
        try {
            // Connect to broker
            const connectionResult = await this.broker.connect();
            
            if (!connectionResult.success) {
                throw new Error('Failed to connect to broker');
            }
            
            // Get account info
            const accountInfo = await this.broker.getAccountInfo();
            this.state.balance = accountInfo.balance;
            
            console.log('Trading platform initialized successfully');
            return { success: true };
        } catch (error) {
            console.error('Failed to initialize platform:', error);
            return { success: false, error: error.message };
        }
    }
    
    async placeTrade(asset, direction, amount, expiry) {
        // Risk management check
        if (amount > this.state.balance) {
            throw new Error('Insufficient balance');
        }
        
        if (amount < 10) {
            throw new Error('Minimum trade amount is $10');
        }
        
        if (amount > this.state.userSettings.maxTradeSize) {
            throw new Error(`Trade amount exceeds maximum allowed ($${this.state.userSettings.maxTradeSize})`);
        }
        
        try {
            const order = {
                symbol: asset,
                direction: direction,
                amount: amount,
                expiry: expiry
            };
            
            const result = await this.broker.placeBinaryOrder(order);
            
            if (result.success) {
                // Calculate expiry time
                const expiryTime = this.calculateExpiryTime(expiry);
                
                const trade = {
                    id: result.orderId,
                    asset,
                    direction,
                    amount,
                    entryPrice: result.filledPrice.bid,
                    expiry: expiryTime,
                    payout: amount * 1.85,
                    status: 'active',
                    timestamp: new Date()
                };
                
                this.state.activeTrades.push(trade);
                this.state.balance -= amount;
                
                // Subscribe to price updates for this asset
                this.broker.subscribeToPrice(asset, (priceData) => {
                    this.handlePriceUpdate(priceData);
                });
                
                // Set up trade settlement
                setTimeout(() => {
                    this.settleTrade(trade.id);
                }, this.getExpiryDuration(expiry) * 1000);
                
                return { success: true, trade };
            }
        } catch (error) {
            throw new Error('Trade execution failed: ' + error.message);
        }
    }
    
    calculateExpiryTime(expiryText) {
        const now = new Date();
        let minutes = 1; // Default 1 minute
        
        if (expiryText.includes('5')) minutes = 5;
        else if (expiryText.includes('15')) minutes = 15;
        else if (expiryText.includes('30')) minutes = 0.5;
        else if (expiryText.includes('Hour')) minutes = 60;
        
        return new Date(now.getTime() + minutes * 60 * 1000);
    }
    
    getExpiryDuration(expiryText) {
        if (expiryText.includes('5')) return 5;
        else if (expiryText.includes('15')) return 15;
        else if (expiryText.includes('30')) return 0.5;
        else if (expiryText.includes('Hour')) return 60;
        return 1; // Default 1 minute
    }
    
    async settleTrade(tradeId) {
        const trade = this.state.activeTrades.find(t => t.id === tradeId);
        if (!trade) return;
        
        // Get current price to determine outcome
        const priceData = await this.broker.getCurrentPrice(trade.asset);
        const currentPrice = priceData.bid;
        const priceChange = currentPrice - trade.entryPrice;
        
        let result = 'lost';
        if ((trade.direction === 'call' && priceChange > 0) || 
            (trade.direction === 'put' && priceChange < 0)) {
            result = 'won';
            this.state.balance += trade.payout;
        }
        
        trade.status = result;
        trade.exitPrice = currentPrice;
        trade.profit = result === 'won' ? trade.payout - trade.amount : -trade.amount;
        trade.exitTime = new Date();
        
        this.state.tradeHistory.push({...trade});
        this.state.activeTrades = this.state.activeTrades.filter(t => t.id !== tradeId);
        
        // Update strategy performance if this was an automated trade
        if (trade.strategy) {
            const strategy = this.strategyManager.strategies.get(trade.strategy);
            if (strategy) {
                strategy.updatePerformance(trade);
            }
        }
        
        // Unsubscribe from price updates if no more trades for this asset
        const hasOtherTrades = this.state.activeTrades.some(t => t.asset === trade.asset);
        if (!hasOtherTrades) {
            this.broker.unsubscribeFromPrice(trade.asset, this.handlePriceUpdate.bind(this));
        }
    }
    
    handlePriceUpdate(priceData) {
        // Update active trades with current prices
        this.state.activeTrades.forEach(trade => {
            if (trade.asset === priceData.symbol) {
                trade.currentPrice = priceData.bid;
                
                // Calculate potential P/L
                if (trade.direction === 'call') {
                    trade.potentialProfit = trade.currentPrice > trade.entryPrice ? 
                        trade.payout - trade.amount : -trade.amount;
                } else {
                    trade.potentialProfit = trade.currentPrice < trade.entryPrice ? 
                        trade.payout - trade.amount : -trade.amount;
                }
            }
        });
        
        // Emit price update event
        if (this.onPriceUpdate) {
            this.onPriceUpdate(priceData);
        }
    }
    
    getPerformanceStats() {
        const totalTrades = this.state.tradeHistory.length;
        const winningTrades = this.state.tradeHistory.filter(t => t.status === 'won').length;
        const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
        
        const totalProfit = this.state.tradeHistory.reduce((sum, trade) => sum + trade.profit, 0);
        
        const winningTradesProfit = this.state.tradeHistory
            .filter(t => t.status === 'won')
            .reduce((sum, trade) => sum + trade.profit, 0);
            
        const losingTradesLoss = Math.abs(this.state.tradeHistory
            .filter(t => t.status === 'lost')
            .reduce((sum, trade) => sum + trade.profit, 0));
            
        const avgWin = winningTrades > 0 ? winningTradesProfit / winningTrades : 0;
        const avgLoss = losingTradesLoss > 0 ? losingTradesLoss / (totalTrades - winningTrades) : 0;
        const profitFactor = avgLoss > 0 ? (avgWin * winningTrades) / (avgLoss * (totalTrades - winningTrades)) : 0;
        
        return {
            totalTrades,
            winningTrades,
            winRate,
            totalProfit,
            avgWin,
            avgLoss,
            profitFactor
        };
    }
    
    getRiskMetrics() {
        const totalExposure = this.state.activeTrades.reduce((sum, trade) => sum + trade.amount, 0);
        const potentialProfit = this.state.activeTrades
            .filter(t => t.potentialProfit > 0)
            .reduce((sum, trade) => sum + trade.potentialProfit, 0);
            
        const potentialLoss = Math.abs(this.state.activeTrades
            .filter(t => t.potentialProfit < 0)
            .reduce((sum, trade) => sum + trade.potentialProfit, 0));
            
        const riskLevel = Utils.calculateRiskLevel(this.state.balance, totalExposure);
        
        return {
            totalExposure,
            potentialProfit,
            potentialLoss,
            riskLevel,
            portfolioAtRisk: (totalExposure / this.state.balance) * 100
        };
    }
    
    updateUserSettings(newSettings) {
        this.state.userSettings = { ...this.state.userSettings, ...newSettings };
    }
    
    getState() {
        return {
            ...this.state,
            performance: this.getPerformanceStats(),
            risk: this.getRiskMetrics(),
            strategyPerformance: this.strategyManager.getAllPerformance()
        };
    }
    
    disconnect() {
        this.broker.disconnect();
        this.chartManager.destroyAllCharts();
    }
}
