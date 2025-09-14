import React, { useEffect, useState, useRef, useMemo } from "react";
import { AdvancedChart } from "react-tradingview-embed";
import '../styles/TradingSimulator.css'; // Custom styles for animations

// Memoize AdvancedChart to prevent re-renders
const MemoizedAdvancedChart = React.memo(AdvancedChart);

const SYMBOL = "BINANCE:BTCUSDT";
const BALANCE_KEY = "user_balance";
const POSITIONS_KEY = "user_positions";

// Live price fetch from Binance with bid/ask
const getLivePrice = async () => {
  try {
    const res = await fetch("https://api.binance.com/api/v3/ticker/bookTicker?symbol=BTCUSDT");
    const data = await res.json();
    return {
      price: parseFloat(data.lastPrice || data.bidPrice),
      bid: parseFloat(data.bidPrice),
      ask: parseFloat(data.askPrice),
    };
  } catch (err) {
    console.error("Price fetch error:", err);
    return { price: 0, bid: 0, ask: 0 };
  }
};

const TradingSimulator = () => {
  const [positions, setPositions] = useState([]);
  const [balance, setBalance] = useState(1000);
  const [leverage, setLeverage] = useState(1);
  const [livePrice, setLivePrice] = useState({ price: 0, bid: 0, ask: 0 });

  const intervalRef = useRef(null);

  // Load from localStorage once
  useEffect(() => {
    const savedBalance = localStorage.getItem(BALANCE_KEY);
    const savedPositions = localStorage.getItem(POSITIONS_KEY);
    if (savedBalance) setBalance(parseFloat(savedBalance));
    if (savedPositions) setPositions(JSON.parse(savedPositions));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(BALANCE_KEY, balance.toFixed(2));
    localStorage.setItem(POSITIONS_KEY, JSON.stringify(positions));
  }, [balance, positions]);

  // Real-time price update (every 1s)
  useEffect(() => {
    const fetchPrice = async () => {
      const priceData = await getLivePrice();
      if (priceData.price) {
        setLivePrice((prev) => {
          // Avoid unnecessary updates if price hasn't changed significantly
          if (Math.abs(prev.price - priceData.price) < 0.01) return prev;
          return priceData;
        });
      }
    };
    fetchPrice();
    intervalRef.current = setInterval(fetchPrice, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const openPosition = (type) => {
    if (balance <= 0) return alert("Insufficient balance!");
    const newPosition = {
      id: Date.now(),
      type,
      entryPrice: livePrice.price,
      leverage,
    };
    setPositions((prev) => [...prev, newPosition]);
  };

  const closePosition = (id) => {
    const updated = positions.filter((pos) => pos.id !== id);
    const closing = positions.find((pos) => pos.id === id);
    if (!closing) return;

    let pnl = 0;
    if (closing.type === "Buy") {
      pnl = (livePrice.price - closing.entryPrice) * closing.leverage;
    } else {
      pnl = (closing.entryPrice - livePrice.price) * closing.leverage;
    }

    setBalance((prev) => prev + pnl);
    setPositions(updated);
  };

  // Memoize widgetProps to prevent chart re-renders
  const widgetProps = useMemo(
    () => ({
      symbol: SYMBOL,
      theme: "dark",
      autosize: true,
      interval: "1", // 1-minute candles for smooth updates
      style: "1", // Candlestick chart
      timezone: "Etc/UTC",
      locale: "en",
      toolbar_bg: "#1a1a1a",
      enable_publishing: false,
      allow_symbol_change: false, // Prevent symbol change to avoid refreshes
      container_id: "tradingview_chart",
      enable_realtime: true, // Ensure real-time updates
      width: "100%",
      height: "100%",
    }),
    []
  );

  return (
    <div className="trading-simulator bg-gray-900 text-white min-h-screen p-4 font-mono">
      <div className="max-w-7xl mx-auto space-y-4">
        <h2 className="text-3xl font-bold text-center text-neon-blue animate-pulse">
          🚀 BTC/USDT Trading Simulator
        </h2>

        {/* Top Bar: Balance, Bid/Ask, Live Price */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg bg-gray-800 p-4 rounded-lg shadow-neon">
          <div className="flex items-center justify-center">
            <span className="text-neon-green">
              💰 Balance: <strong>${balance.toFixed(2)}</strong>
            </span>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <span className="text-neon-green">
              Bid: <strong>${livePrice.bid.toFixed(2)}</strong>
            </span>
            <span className="text-neon-red">
              Ask: <strong>${livePrice.ask.toFixed(2)}</strong>
            </span>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-neon-blue animate-price">
              📈 Live Price: <strong>${livePrice.price.toFixed(2)}</strong>
            </span>
          </div>
        </div>

        {/* Trading Controls */}
        <div className="flex gap-4 items-center flex-wrap bg-gray-800 p-4 rounded-lg shadow-neon">
          <label className="font-semibold text-neon-blue">Leverage:</label>
          <select
            value={leverage}
            onChange={(e) => setLeverage(parseInt(e.target.value))}
            className="border border-neon-blue bg-gray-900 text-white px-3 py-2 rounded hover:bg-neon-blue hover:text-black transition"
          >
            {[1, 2, 3, 5, 10].map((l) => (
              <option key={l} value={l}>
                {l}x
              </option>
            ))}
          </select>

          <button
            onClick={() => openPosition("Buy")}
            className="bg-neon-green text-black px-6 py-2 rounded-lg font-bold hover:scale-105 transform transition animate-glow-green"
          >
            Long (Buy)
          </button>
          <button
            onClick={() => openPosition("Sell")}
            className="bg-neon-red text-black px-6 py-2 rounded-lg font-bold hover:scale-105 transform transition animate-glow-red"
          >
            Short (Sell)
          </button>
        </div>

        {/* Chart */}
        <div className=" bg-gray-800 rounded-lg shadow-neon overflow-hidden">
          <MemoizedAdvancedChart
            widgetProps={widgetProps}
            widgetPropsAny={{
              // height: 100,
              // width: "100%",
            }}
          />
        </div>

        {/* Open Positions */}
        <h3 className="text-2xl font-semibold text-neon-blue">📊 Open Positions</h3>
        {positions.length === 0 && (
          <p className="text-gray-400 animate-fade-in">No open positions.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {positions.map((pos) => {
            const pnl =
              pos.type === "Buy"
                ? (livePrice.price - pos.entryPrice) * pos.leverage
                : (pos.entryPrice - livePrice.price) * pos.leverage;

            return (
              <div
                key={pos.id}
                className="border border-gray-700 bg-gray-800 p-4 rounded-lg shadow-neon animate-slide-in"
              >
                <p className="text-neon-blue">
                  Type: <strong>{pos.type}</strong>
                </p>
                <p>Entry Price: ${pos.entryPrice.toFixed(2)}</p>
                <p>Leverage: {pos.leverage}x</p>
                <p
                  className={`font-semibold ${
                    pnl >= 0 ? "text-neon-green" : "text-neon-red"
                  } animate-pulse`}
                >
                  PNL: {pnl.toFixed(2)} USD
                </p>
                <button
                  onClick={() => closePosition(pos.id)}
                  className="mt-3 bg-neon-blue text-black px-4 py-2 rounded-lg font-bold hover:scale-105 transform transition animate-glow-blue"
                >
                  Close Position
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TradingSimulator;