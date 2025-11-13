// Utility functions
class Utils {
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    static formatPercentage(value) {
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    }

    static formatTime(date) {
        return date.toLocaleTimeString();
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    static calculateRiskLevel(balance, exposure) {
        const riskPercentage = (exposure / balance) * 100;
        if (riskPercentage < 10) return 'low';
        if (riskPercentage < 25) return 'medium';
        return 'high';
    }
}
