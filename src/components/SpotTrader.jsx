import { useState } from "react";

export default function SpotTrader() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [side, setSide] = useState("BUY");
  const [orderType, setOrderType] = useState("LIMIT");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock API call for demonstration
  const mockApiCall = async (endpoint, data = null) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (Math.random() > 0.8) {
      throw new Error("Network error or API limit reached");
    }

    if (endpoint === "order") {
      return {
        orderId: Math.floor(Math.random() * 1000000),
        symbol: data.symbol,
        side: data.side,
        type: data.type,
        quantity: data.quantity,
        price: data.price,
        status: "FILLED",
        executedQty: data.quantity,
        timestamp: Date.now()
      };
    } else if (endpoint === "account") {
      return {
        accountType: "SPOT",
        balances: [
          { asset: "BTC", free: "0.12345678", locked: "0.00000000" },
          { asset: "USDT", free: "1250.50", locked: "100.00" },
          { asset: "ETH", free: "2.45678901", locked: "0.00000000" }
        ],
        permissions: ["SPOT"]
      };
    }
  };

  // Place Spot Order
  const placeOrder = async () => {
    if (!quantity || (orderType === "LIMIT" && !price)) {
      setResult({ error: true, data: { message: "Please fill in all required fields" } });
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        symbol: symbol.toUpperCase(),
        side,
        type: orderType,
        quantity: parseFloat(quantity),
      };

      if (orderType === "LIMIT") {
        orderData.price = parseFloat(price);
      }

      const data = await mockApiCall("order", orderData);
      setResult({ success: true, data });
    } catch (err) {
      setResult({ 
        error: true, 
        data: { message: err.message }
      });
    } finally {
      setLoading(false);
    }
  };

  // Get Account Info
  const getAccountInfo = async () => {
    setLoading(true);
    try {
      const data = await mockApiCall("account");
      setResult({ success: true, data });
    } catch (err) {
      setResult({ 
        error: true, 
        data: { message: err.message }
      });
    } finally {
      setLoading(false);
    }
  };

  // Clear results
  const clearResults = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🚀 Binance Spot Trader
          </h1>
          <p className="text-gray-300">Trade cryptocurrencies with ease</p>
        </div>

        {/* Main Trading Panel */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Symbol Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Trading Symbol
              </label>
              <input
                type="text"
                placeholder="BTCUSDT"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Order Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Order Type
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="LIMIT">LIMIT</option>
                <option value="MARKET">MARKET</option>
              </select>
            </div>

            {/* Side Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Order Side
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSide("BUY")}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    side === "BUY"
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  BUY
                </button>
                <button
                  onClick={() => setSide("SELL")}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    side === "SELL"
                      ? "bg-red-600 text-white shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  SELL
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Quantity
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                step="0.00001"
                min="0"
              />
            </div>

            {/* Price (only for LIMIT orders) */}
            {orderType === "LIMIT" && (
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-300">
                  Price
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  step="0.01"
                  min="0"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={placeOrder}
              disabled={loading}
              className={`flex-1 ${
                side === "BUY" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              } text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl`}
            >
              {loading ? "Processing..." : `${side} ${symbol}`}
            </button>
            
            <button
              onClick={getAccountInfo}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? "Loading..." : "Account Info"}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        {result && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {result.success ? (
                  <>
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    Success
                  </>
                ) : (
                  <>
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    Error
                  </>
                )}
              </h3>
              <button
                onClick={clearResults}
                className="text-gray-400 hover:text-white text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors duration-200"
              >
                Clear
              </button>
            </div>
            
            <div className={`p-4 rounded-lg ${
              result.success 
                ? "bg-green-900/20 border border-green-800" 
                : "bg-red-900/20 border border-red-800"
            }`}>
              <pre className="text-sm text-gray-300 overflow-auto max-h-96 whitespace-pre-wrap">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            ⚠️ Demo version with mock API - Replace mockApiCall with actual axios calls
          </p>
        </div>
      </div>
    </div>
  );
}