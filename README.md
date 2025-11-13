# Binary Trading Platform

A professional binary options trading platform with demo broker integration, real-time charts, and automated trading strategies.

## Features

- **Real-time Trading**: Place CALL/PUT trades with various expiry times
- **Demo Broker Integration**: Simulated trading environment
- **Advanced Charts**: Interactive price charts with technical indicators
- **Trading Strategies**: Automated trading bots (Trend Following, Mean Reversion, Breakout)
- **Risk Management**: Position sizing, exposure tracking, and loss limits
- **Performance Analytics**: Comprehensive trading analytics and reporting
- **Responsive Design**: Works on desktop and mobile devices

Binary-Trading-Platform/
├── index.html
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   ├── header.css
│   │   ├── sidebar.css
│   │   ├── components.css
│   │   └── responsive.css
│   └── js/
│       ├── main.js
│       ├── broker-api.js
│       ├── trading-platform.js
│       ├── charts.js
│       ├── strategies.js
│       └── utils.js
├── components/
│   ├── header.html
│   ├── sidebar.html
│   ├── dashboard.html
│   ├── trading.html
│   ├── positions.html
│   ├── strategies.html
│   ├── analytics.html
│   ├── history.html
│   └── settings.html
└── README.md


## Setup Instructions

1. Clone or download the project files
2. Open `index.html` in a web browser
3. The platform will automatically connect to the demo broker

## Usage

### Placing Trades
1. Navigate to the "Quick Trade" section
2. Select an asset (EUR/USD, GBP/USD, etc.)
3. Choose expiry time (60 seconds, 5 minutes, etc.)
4. Set investment amount
5. Click CALL (price up) or PUT (price down)

### Automated Trading
1. Go to "Strategies" section
2. Activate desired trading strategies
3. Configure risk parameters
4. The platform will automatically execute trades based on strategy signals

### Monitoring Performance
- **Dashboard**: Overview of account balance, active trades, and performance
- **Positions**: Detailed view of open positions and risk exposure
- **Analytics**: Comprehensive performance metrics and charts
- **History**: Complete trade history with filtering options

## Technical Details

### Architecture
- **Frontend**: Vanilla JavaScript with modular architecture
- **Charts**: Chart.js for real-time price visualization
- **Styling**: CSS3 with CSS Grid and Flexbox
- **Data**: Simulated real-time market data

### Key Components
- `BinaryTradingPlatform`: Main application logic
- `DemoBrokerAPI`: Simulated broker integration
- `ChartManager`: Chart creation and management
- `StrategyManager`: Automated trading strategies

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## License

This project is for educational and demonstration purposes.

## Disclaimer

This is a demonstration platform using simulated trading. No real money is involved. Trading binary options involves significant risk and may not be suitable for all investors.
