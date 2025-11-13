// Trading strategies and algorithms
class TradingStrategy {
    constructor(name, config) {
        this.name = name;
        this.config = config;
        this.active = false;
        this.trades = [];
        this.performance = {
            totalTrades: 0,
            winningTrades: 0,
            totalProfit: 0,
            winRate: 0
        };
    }

    analyze(marketData) {
        throw new Error('analyze method must be implemented by subclass');
    }

    execute(symbol, amount, broker) {
        if (!this.active) return null;

        const signal = this.analyze(marketData);
        if (signal !== 'HOLD') {
            const order = {
                symbol: symbol,
                direction: signal.toLowerCase(),
                amount: amount,
                expiry: '5m'
            };
            
            return broker.placeBinaryOrder(order);
        }
        return null;
    }

    updatePerformance(trade) {
        this.trades.push(trade);
        this.performance.totalTrades++;
        
        if (trade.status === 'won') {
            this.performance.winningTrades++;
            this.performance.totalProfit += trade.profit;
        } else {
            this.performance.totalProfit += trade.profit;
        }
        
        this.performance.winRate = (this.performance.winningTrades / this.performance.totalTrades) * 100;
    }

    getPerformance() {
        return {
            ...this.performance,
            avgProfit: this.performance.totalTrades > 0 ? 
                this.performance.totalProfit / this.performance.totalTrades : 0
        };
    }
}

class TrendFollowingStrategy extends TradingStrategy {
    analyze(marketData) {
        // Simple moving average strategy
        if (marketData.length < this.config.period) return 'HOLD';
        
        const prices = marketData.slice(-this.config.period);
        const sma = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const currentPrice = marketData[marketData.length - 1];
        
        if (currentPrice > sma * (1 + this.config.threshold)) {
            return 'CALL';
        } else if (currentPrice < sma * (1 - this.config.threshold)) {
            return 'PUT';
        }
        
        return 'HOLD';
    }
}

class MeanReversionStrategy extends TradingStrategy {
    analyze(marketData) {
        // Mean reversion based on RSI
        if (marketData.length < this.config.period) return 'HOLD';
        
        const rsi = this.calculateRSI(marketData, this.config.period);
        
        if (rsi < 30) {
            return 'CALL'; // Oversold - expect bounce up
        } else if (rsi > 70) {
            return 'PUT'; // Overbought - expect pullback
        }
        
        return 'HOLD';
    }

    calculateRSI(prices, period) {
        let gains = 0;
        let losses = 0;
        
        for (let i = 1; i <= period; i++) {
            const change = prices[prices.length - i] - prices[prices.length - i - 1];
            if (change > 0) {
                gains += change;
            } else {
                losses += Math.abs(change);
            }
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        
        if (avgLoss === 0) return 100;
        
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }
}

class BreakoutStrategy extends TradingStrategy {
    analyze(marketData) {
        // Breakout from consolidation
        if (marketData.length < this.config.period * 2) return 'HOLD';
        
        const recentPrices = marketData.slice(-this.config.period);
        const previousPrices = marketData.slice(-this.config.period * 2, -this.config.period);
        
        const recentHigh = Math.max(...recentPrices);
        const recentLow = Math.min(...recentPrices);
        const previousHigh = Math.max(...previousPrices);
        const previousLow = Math.min(...previousPrices);
        
        const currentPrice = marketData[marketData.length - 1];
        
        if (currentPrice > previousHigh * (1 + this.config.breakoutThreshold)) {
            return 'CALL';
        } else if (currentPrice < previousLow * (1 - this.config.breakoutThreshold)) {
            return 'PUT';
        }
        
        return 'HOLD';
    }
}

class StrategyManager {
    constructor() {
        this.strategies = new Map();
        this.activeStrategies = new Set();
    }

    registerStrategy(name, strategy) {
        this.strategies.set(name, strategy);
    }

    activateStrategy(name) {
        const strategy = this.strategies.get(name);
        if (strategy) {
            strategy.active = true;
            this.activeStrategies.add(name);
        }
    }

    deactivateStrategy(name) {
        const strategy = this.strategies.get(name);
        if (strategy) {
            strategy.active = false;
            this.activeStrategies.delete(name);
        }
    }

    executeStrategies(marketData, broker) {
        this.activeStrategies.forEach(strategyName => {
            const strategy = this.strategies.get(strategyName);
            if (strategy) {
                strategy.execute(marketData, broker);
            }
        });
    }

    getStrategyPerformance(name) {
        const strategy = this.strategies.get(name);
        return strategy ? strategy.getPerformance() : null;
    }

    getAllPerformance() {
        const performance = {};
        this.strategies.forEach((strategy, name) => {
            performance[name] = strategy.getPerformance();
        });
        return performance;
    }
}
