import { useState, useEffect, useRef } from "react";

// TradingView Chart Component
function TradingViewChart({ symbol = "BTCUSDT" }) {
  const containerRef = useRef();

  useEffect(() => {
    // Clear previous chart
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: `BINANCE:${symbol}`,
      interval: "15",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com"
    });

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }
  }, [symbol]);

  return (
    <div 
      className="tradingview-widget-container h-full w-full" 
      ref={containerRef}
    >
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
}

export default function CompleteCryptoExchange() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [side, setSide] = useState("BUY");
  const [orderType, setOrderType] = useState("LIMIT");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Market Data
  const [marketData, setMarketData] = useState({
    price: "43250.85",
    change: "+1250.35",
    changePercent: "+2.98%",
    high: "44100.00",
    low: "41800.00",
    volume: "125,432.15"
  });

  // Account Balance
  const [balance, setBalance] = useState({
    USDT: 2847.83,
    BTC: 0.08765432,
    ETH: 2.45678901,
    ADA: 1250.50,
    BNB: 15.25,
    DOGE: 5000.75
  });

  // Trading History with PnL
  const [tradeHistory, setTradeHistory] = useState([
    {
      id: 1,
      symbol: "BTCUSDT",
      side: "BUY",
      type: "LIMIT",
      quantity: 0.00234,
      price: 42800.50,
      total: 100.15,
      status: "FILLED",
      time: "2024-03-15 14:32:15",
      pnl: +15.75,
      pnlPercent: +15.7
    },
    {
      id: 2,
      symbol: "ETHUSDT", 
      side: "SELL",
      type: "MARKET",
      quantity: 0.045,
      price: 2650.30,
      total: 119.26,
      status: "FILLED",
      time: "2024-03-15 13:45:22",
      pnl: -8.45,
      pnlPercent: -7.1
    },
    {
      id: 3,
      symbol: "BTCUSDT",
      side: "BUY", 
      type: "LIMIT",
      quantity: 0.00156,
      price: 41950.00,
      total: 65.44,
      status: "FILLED",
      time: "2024-03-15 12:18:45",
      pnl: +22.10,
      pnlPercent: +33.8
    }
  ]);

  // Order Book Data
  const [orderBook, setOrderBook] = useState({
    bids: [
      [43245.50, 0.024],
      [43240.20, 0.156],
      [43235.85, 0.089],
      [43230.15, 0.234],
      [43225.90, 0.067],
      [43220.45, 0.123],
      [43215.20, 0.345],
      [43210.85, 0.078]
    ],
    asks: [
      [43255.75, 0.034],
      [43260.20, 0.167],
      [43265.45, 0.098],
      [43270.80, 0.245],
      [43275.15, 0.076],
      [43280.50, 0.134],
      [43285.85, 0.356],
      [43290.20, 0.087]
    ]
  });

  // Real price data fetching
  const fetchRealPrice = async () => {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
      const data = await response.json();
      
      setMarketData({
        price: parseFloat(data.lastPrice).toFixed(2),
        change: parseFloat(data.priceChange).toFixed(2),
        changePercent: parseFloat(data.priceChangePercent).toFixed(2) + "%",
        high: parseFloat(data.highPrice).toFixed(2),
        low: parseFloat(data.lowPrice).toFixed(2),
        volume: parseFloat(data.volume).toFixed(2)
      });
    } catch (error) {
      console.log("Using demo data - API might be limited");
    }
  };

  // Fetch order book data
  const fetchOrderBook = async () => {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=10`);
      const data = await response.json();
      
      setOrderBook({
        bids: data.bids.map(([price, qty]) => [parseFloat(price), parseFloat(qty)]),
        asks: data.asks.map(([price, qty]) => [parseFloat(price), parseFloat(qty)])
      });
    } catch (error) {
      console.log("Using demo order book data");
    }
  };

  // Update data every 5 seconds
  useEffect(() => {
    fetchRealPrice();
    fetchOrderBook();
    
    const interval = setInterval(() => {
      fetchRealPrice();
      fetchOrderBook();
    }, 5000);

    return () => clearInterval(interval);
  }, [symbol]);

  // Place Order
  const placeOrder = async () => {
    if (!quantity || (orderType === "LIMIT" && !price)) {
      setResult({ 
        error: true, 
        data: { message: "Please fill in all required fields" }
      });
      return;
    }

    setLoading(true);
    
    // Simulate order placement
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const orderPrice = orderType === "LIMIT" ? parseFloat(price) : parseFloat(marketData.price);
      const total = parseFloat(quantity) * orderPrice;
      
      // Check balance
      const requiredAsset = side === "BUY" ? "USDT" : symbol.replace("USDT", "");
      const requiredAmount = side === "BUY" ? total : parseFloat(quantity);
      
      if (balance[requiredAsset] < requiredAmount) {
        throw new Error("Insufficient balance");
      }

      // Create new trade
      const newTrade = {
        id: tradeHistory.length + 1,
        symbol,
        side,
        type: orderType,
        quantity: parseFloat(quantity),
        price: orderPrice,
        total,
        status: "FILLED",
        time: new Date().toLocaleString(),
        pnl: (Math.random() - 0.3) * total * 0.1, // Random PnL
        pnlPercent: (Math.random() - 0.3) * 20
      };

      // Update balance
      setBalance(prev => ({
        ...prev,
        [requiredAsset]: prev[requiredAsset] - requiredAmount,
        [side === "BUY" ? symbol.replace("USDT", "") : "USDT"]: 
          prev[side === "BUY" ? symbol.replace("USDT", "") : "USDT"] + 
          (side === "BUY" ? parseFloat(quantity) : total)
      }));

      // Add to history
      setTradeHistory(prev => [newTrade, ...prev]);
      
      setResult({ 
        success: true, 
        data: newTrade
      });

      // Clear form
      setQuantity("");
      setPrice("");
      
    } catch (err) {
      setResult({ 
        error: true, 
        data: { message: err.message }
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (quantity && price && orderType === "LIMIT") {
      return (parseFloat(quantity) * parseFloat(price)).toFixed(2);
    }
    if (quantity && orderType === "MARKET") {
      return (parseFloat(quantity) * parseFloat(marketData.price)).toFixed(2);
    }
    return "0.00";
  };

  const totalPnL = tradeHistory.reduce((sum, trade) => sum + trade.pnl, 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-yellow-400">Bit Blockins</h1>
            <div className="text-gray-400">|</div>
            <h2 className="text-xl font-semibold">{symbol}</h2>
            <div className="flex items-center gap-4 ml-8">
              <div className="text-2xl font-bold">${marketData.price}</div>
              <div className={`text-sm font-medium ${
                marketData.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
              }`}>
                {marketData.change} ({marketData.changePercent})
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div>24h High: <span className="text-green-400">${marketData.high}</span></div>
            <div>24h Low: <span className="text-red-400">${marketData.low}</span></div>
            <div>Volume: <span className="text-blue-400">{marketData.volume}</span></div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar - Trading Panel */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 p-6">
          {/* Symbol Selection */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Trading Pair</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-yellow-400"
            >
              <option value="BTCUSDT">BTC/USDT</option>
              <option value="ETHUSDT">ETH/USDT</option>
              <option value="ADAUSDT">ADA/USDT</option>
              <option value="BNBUSDT">BNB/USDT</option>
              <option value="DOGEUSDT">DOGE/USDT</option>
            </select>
          </div>

          {/* Balance */}
          <div className="mb-6 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-sm font-medium mb-3 text-gray-300">💰 Available Balance</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>USDT:</span>
                <span className="font-mono text-green-400">{balance.USDT.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>BTC:</span>
                <span className="font-mono text-orange-400">{balance.BTC.toFixed(8)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>ETH:</span>
                <span className="font-mono text-blue-400">{balance.ETH.toFixed(6)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>ADA:</span>
                <span className="font-mono text-purple-400">{balance.ADA.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div className="space-y-4">
            {/* Buy/Sell Tabs */}
            <div className="grid grid-cols-2 bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setSide("BUY")}
                className={`py-2 px-4 rounded font-medium transition-colors ${
                  side === "BUY"
                    ? "bg-green-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                🟢 Buy
              </button>
              <button
                onClick={() => setSide("SELL")}
                className={`py-2 px-4 rounded font-medium transition-colors ${
                  side === "SELL"
                    ? "bg-red-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                🔴 Sell
              </button>
            </div>

            {/* Order Type */}
            <div className="grid grid-cols-2 bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setOrderType("LIMIT")}
                className={`py-2 px-4 rounded text-sm font-medium transition-colors ${
                  orderType === "LIMIT"
                    ? "bg-gray-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                📊 Limit
              </button>
              <button
                onClick={() => setOrderType("MARKET")}
                className={`py-2 px-4 rounded text-sm font-medium transition-colors ${
                  orderType === "MARKET"
                    ? "bg-gray-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                ⚡ Market
              </button>
            </div>

            {/* Price Input */}
            {orderType === "LIMIT" && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">💲 Price</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 pr-16 rounded-lg focus:ring-2 focus:ring-yellow-400"
                    step="0.01"
                  />
                  <span className="absolute right-4 top-3 text-gray-400 text-sm">USDT</span>
                </div>
              </div>
            )}

            {/* Quantity Input */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">📦 Amount</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.00"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 pr-16 rounded-lg focus:ring-2 focus:ring-yellow-400"
                  step="0.00001"
                />
                <span className="absolute right-4 top-3 text-gray-400 text-sm">
                  {symbol.replace("USDT", "")}
                </span>
              </div>
            </div>

            {/* Percentage Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map(percent => (
                <button
                  key={percent}
                  onClick={() => {
                    const available = side === "BUY" ? balance.USDT : balance[symbol.replace("USDT", "")];
                    const maxQuantity = side === "BUY" 
                      ? (available * percent / 100) / parseFloat(price || marketData.price)
                      : available * percent / 100;
                    setQuantity(maxQuantity.toFixed(6));
                  }}
                  className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded text-xs font-medium transition-colors"
                >
                  {percent}%
                </button>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center py-2 border-t border-gray-700">
              <span className="text-gray-400">💳 Total</span>
              <span className="font-semibold text-yellow-400">{calculateTotal()} USDT</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={placeOrder}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition-all disabled:opacity-50 shadow-lg ${
                side === "BUY"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {loading ? "🔄 Processing..." : `${side === "BUY" ? "🚀" : "💰"} ${side} ${symbol.replace("USDT", "")}`}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="mt-6 p-4 rounded-lg border border-gray-600 bg-gray-750">
              <div className={`text-sm font-semibold ${result.success ? "text-green-400" : "text-red-400"}`}>
                {result.success ? "✅ Order Successfully Filled!" : "❌ Order Failed"}
              </div>
              <div className="text-xs text-gray-400 mt-2 bg-gray-800 p-2 rounded">
                <pre>{JSON.stringify(result.data, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Chart Area */}
          <div className="h-96 bg-gray-800 border-b border-gray-700 p-4">
            <div className="h-full bg-gray-900 rounded-lg">
              <TradingViewChart symbol={symbol} />
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex-1 flex">
            {/* Order Book */}
            <div className="w-80 bg-gray-800 border-r border-gray-700 p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                📊 Order Book
              </h3>
              <div className="space-y-1">
                {/* Header */}
                <div className="grid grid-cols-2 text-xs text-gray-400 mb-2 pb-2 border-b border-gray-700">
                  <div>Price (USDT)</div>
                  <div className="text-right">Amount ({symbol.replace("USDT", "")})</div>
                </div>
                
                {/* Asks (Sell Orders) */}
                {orderBook.asks.reverse().map(([price, qty], i) => (
                  <div key={`ask-${i}`} className="grid grid-cols-2 text-sm hover:bg-red-900/20 p-1 rounded">
                    <span className="text-red-400 font-mono">{parseFloat(price).toFixed(2)}</span>
                    <span className="text-gray-300 font-mono text-right">{parseFloat(qty).toFixed(6)}</span>
                  </div>
                ))}
                
                {/* Current Price Spread */}
                <div className="text-center py-3 my-2 bg-yellow-500/10 rounded border border-yellow-500/30">
                  <span className="text-yellow-400 font-bold text-lg">${marketData.price}</span>
                  <div className="text-xs text-gray-400">Current Price</div>
                </div>

                {/* Bids (Buy Orders) */}
                {orderBook.bids.map(([price, qty], i) => (
                  <div key={`bid-${i}`} className="grid grid-cols-2 text-sm hover:bg-green-900/20 p-1 rounded">
                    <span className="text-green-400 font-mono">{parseFloat(price).toFixed(2)}</span>
                    <span className="text-gray-300 font-mono text-right">{parseFloat(qty).toFixed(6)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trading History */}
            <div className="flex-1 bg-gray-800 p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  📈 Trade History
                </h3>
                <div className={`text-sm font-bold px-3 py-1 rounded ${
                  totalPnL >= 0 ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20'
                }`}>
                  Total P&L: {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="text-left py-3 px-2">Time</th>
                      <th className="text-left py-3 px-2">Symbol</th>
                      <th className="text-left py-3 px-2">Side</th>
                      <th className="text-left py-3 px-2">Type</th>
                      <th className="text-right py-3 px-2">Amount</th>
                      <th className="text-right py-3 px-2">Price</th>
                      <th className="text-right py-3 px-2">Total</th>
                      <th className="text-right py-3 px-2">P&L</th>
                      <th className="text-right py-3 px-2">P&L %</th>
                      <th className="text-center py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tradeHistory.map((trade) => (
                      <tr key={trade.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                        <td className="py-3 px-2 font-mono text-xs text-gray-400">{trade.time}</td>
                        <td className="py-3 px-2 font-semibold">{trade.symbol}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            trade.side === "BUY" 
                              ? "bg-green-600/20 text-green-400" 
                              : "bg-red-600/20 text-red-400"
                          }`}>
                            {trade.side === "BUY" ? "🟢 BUY" : "🔴 SELL"}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-400">{trade.type}</td>
                        <td className="py-3 px-2 text-right font-mono">{trade.quantity.toFixed(6)}</td>
                        <td className="py-3 px-2 text-right font-mono">${trade.price.toFixed(2)}</td>
                        <td className="py-3 px-2 text-right font-mono">${trade.total.toFixed(2)}</td>
                        <td className={`py-3 px-2 text-right font-mono font-bold ${
                          trade.pnl >= 0 ? "text-green-400" : "text-red-400"
                        }`}>
                          {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                        </td>
                        <td className={`py-3 px-2 text-right font-mono font-bold ${
                          trade.pnlPercent >= 0 ? "text-green-400" : "text-red-400"
                        }`}>
                          {trade.pnlPercent >= 0 ? "+" : ""}{trade.pnlPercent.toFixed(1)}%
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs font-semibold">
                            ✅ {trade.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}