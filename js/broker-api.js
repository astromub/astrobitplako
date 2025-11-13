// Demo Broker API Integration
class DemoBrokerAPI {
    constructor() {
        this.baseUrl = 'https://demo-broker-api.example.com';
        this.apiKey = 'demo_key_' + Date.now();
        this.connected = false;
        this.sessionId = null;
        this.priceCallbacks = new Map();
    }

    async connect() {
        try {
            // Simulate API connection
            await this.simulateAPICall(1000);
            
            this.connected = true;
            this.sessionId = 'session_' + Date.now();
            
            console.log('Demo Broker: Connected successfully');
            return { success: true, sessionId: this.sessionId };
        } catch (error) {
            console.error('Demo Broker: Connection failed', error);
            return { success: false, error: error.message };
        }
    }

    async getAssets() {
        if (!this.connected) {
            throw new Error('Not connected to broker');
        }

        await this.simulateAPICall(500);
        
        return {
            success: true,
            assets: [
                { symbol: 'EUR/USD', name: 'Euro vs US Dollar', type: 'forex', volatility: 0.0002 },
                { symbol: 'GBP/USD', name: 'British Pound vs US Dollar', type: 'forex', volatility: 0.0003 },
                { symbol: 'USD/JPY', name: 'US Dollar vs Japanese Yen', type: 'forex', volatility: 0.05 },
                { symbol: 'Gold', name: 'Gold', type: 'commodity', volatility: 1.2 },
                { symbol: 'BTC/USD', name: 'Bitcoin', type: 'crypto', volatility: 150 }
            ]
        };
    }

    async getCurrentPrice(symbol) {
        if (!this.connected) {
            throw new Error('Not connected to broker');
        }

        await this.simulateAPICall(200);
        
        const basePrices = {
            'EUR/USD': 1.0854,
            'GBP/USD': 1.2658,
            'USD/JPY': 151.25,
            'Gold': 2185.40,
            'BTC/USD': 61520
        };
        
        const volatilities = {
            'EUR/USD': 0.0002,
            'GBP/USD': 0.0003,
            'USD/JPY': 0.05,
            'Gold': 1.2,
            'BTC/USD': 150
        };
        
        const change = (Math.random() - 0.5) * 2 * volatilities[symbol];
        const price = basePrices[symbol] + change;
        
        return {
            success: true,
            symbol,
            bid: price - 0.0001,
            ask: price + 0.0001,
            timestamp: new Date().toISOString()
        };
    }

    async placeBinaryOrder(order) {
        if (!this.connected) {
            throw new Error('Not connected to broker');
        }

        // Validate order
        if (order.amount < 10) {
            throw new Error('Minimum trade amount is $10');
        }

        if (order.amount > 5000) {
            throw new Error('Maximum trade amount is $5000');
        }

        await this.simulateAPICall(800);
        
        const orderId = 'BIN_' + Date.now();
        
        console.log('Demo Broker: Binary order placed', {
            orderId,
            symbol: order.symbol,
            direction: order.direction,
            amount: order.amount,
            expiry: order.expiry
        });
        
        return {
            success: true,
            orderId,
            status: 'open',
            filledPrice: await this.getCurrentPrice(order.symbol).then(data => data.bid)
        };
    }

    async getAccountInfo() {
        if (!this.connected) {
            throw new Error('Not connected to broker');
        }

        await this.simulateAPICall(300);
        
        return {
            success: true,
            balance: 10000,
            currency: 'USD',
            leverage: 1,
            openTrades: 5
        };
    }

    async simulateAPICall(delay) {
        return new Promise((resolve) => {
            setTimeout(resolve, delay);
        });
    }

    // WebSocket simulation for real-time data
    subscribeToPrice(symbol, callback) {
        if (!this.priceCallbacks.has(symbol)) {
            this.priceCallbacks.set(symbol, []);
        }
        this.priceCallbacks.get(symbol).push(callback);
        
        console.log('Demo Broker: Subscribed to price', symbol);
        
        // Start price updates for this symbol if not already running
        if (!this.priceIntervals) {
            this.priceIntervals = new Map();
        }
        
        if (!this.priceIntervals.has(symbol)) {
            const interval = setInterval(async () => {
                const priceData = await this.getCurrentPrice(symbol);
                const callbacks = this.priceCallbacks.get(symbol) || [];
                callbacks.forEach(cb => cb(priceData));
            }, 1000);
            
            this.priceIntervals.set(symbol, interval);
        }
    }

    unsubscribeFromPrice(symbol, callback) {
        const callbacks = this.priceCallbacks.get(symbol);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
            
            if (callbacks.length === 0) {
                this.priceCallbacks.delete(symbol);
                const interval = this.priceIntervals.get(symbol);
                if (interval) {
                    clearInterval(interval);
                    this.priceIntervals.delete(symbol);
                }
            }
        }
    }

    disconnect() {
        if (this.priceIntervals) {
            this.priceIntervals.forEach(interval => clearInterval(interval));
            this.priceIntervals.clear();
        }
        this.priceCallbacks.clear();
        this.connected = false;
        console.log('Demo Broker: Disconnected');
    }
}
