import React, { useEffect, useMemo, useState } from "react";

// Value ko range ke andar rakhta hai
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Random next price generate karne ka function
function generateNextPrice(prevPrice, minPrice, maxPrice, maxStepFraction = 0.01) {
  const maxStep = (maxPrice - minPrice) * maxStepFraction; // range ka % jitna move
  const step = (Math.random() * 2 - 1) * maxStep; // -maxStep se +maxStep
  const raw = prevPrice + step;
  return clamp(Number(raw.toFixed(4)), minPrice, maxPrice);
}

// Order book banaane ka helper
function generateOrderBook(currentPrice, levels = 10) {
  const bids = [];
  const asks = [];

  for (let i = 1; i <= levels; i++) {
    const priceStep = currentPrice * 0.0015 * i; // 0.15% per level approx

    const bidPrice = Number((currentPrice - priceStep).toFixed(4));
    const askPrice = Number((currentPrice + priceStep).toFixed(4));

    bids.push({
      price: bidPrice,
      amount: Number((Math.random() * 500 + 50).toFixed(2)),
    });

    asks.push({
      price: askPrice,
      amount: Number((Math.random() * 500 + 50).toFixed(2)),
    });
  }

  // Best price upar dikhane ke liye reverse
  bids.reverse();

  return { bids, asks };
}

const TokenCandleSimulationTV = ({
  tokenSymbol = "JED",
  minPrice = 0.1,
  maxPrice = 0.5,
  initialPrice = 0.3,
  updateIntervalMs = 1000,
  maxCandles = 60,
  exchangeName = "SIMULATED"
}) => {
  const [candles, setCandles] = useState(() => [
    {
      time: Date.now(),
      open: initialPrice,
      high: initialPrice,
      low: initialPrice,
      close: initialPrice,
    },
  ]);

  const [orderBook, setOrderBook] = useState(() =>
    generateOrderBook(initialPrice)
  );

  const currentPrice = candles[candles.length - 1]?.close ?? initialPrice;

  useEffect(() => {
    const timer = setInterval(() => {
      setCandles((prev) => {
        const last = prev[prev.length - 1];
        const previousClose = last.close;

        // naya close price generate karo
        const close = generateNextPrice(
          previousClose,
          minPrice,
          maxPrice,
          0.02 // 2% of range max movement
        );

        // high/low ko open & close ke around thoda move kara dete hain
        const baseHigh = Math.max(previousClose, close);
        const baseLow = Math.min(previousClose, close);

        const extraHigh =
          (Math.random() * (maxPrice - minPrice)) * 0.003; // 0–0.3% extra
        const extraLow =
          (Math.random() * (maxPrice - minPrice)) * 0.003; // 0–0.3% extra

        const high = clamp(baseHigh + extraHigh, minPrice, maxPrice);
        const low = clamp(baseLow - extraLow, minPrice, maxPrice);

        const nextCandle = {
          time: Date.now(),
          open: previousClose,
          high: Number(high.toFixed(4)),
          low: Number(low.toFixed(4)),
          close: Number(close.toFixed(4)),
        };

        let updated = [...prev, nextCandle];
        if (updated.length > maxCandles) {
          updated = updated.slice(updated.length - maxCandles);
        }

        // order book update
        setOrderBook(generateOrderBook(nextCandle.close));

        return updated;
      });
    }, updateIntervalMs);

    return () => clearInterval(timer);
  }, [minPrice, maxPrice, updateIntervalMs, maxCandles]);

  const chartWidth = 640;
  const chartHeight = 320;
  const paddingLeft = 50; // y-axis ke liye space
  const paddingRight = 80; // price label ke liye space
  const paddingTop = 10;
  const paddingBottom = 20;

  const { minY, maxY } = useMemo(() => {
    const allPrices = candles.flatMap((c) => [c.high, c.low]);
    const minVal = allPrices.length ? Math.min(...allPrices) : minPrice;
    const maxVal = allPrices.length ? Math.max(...allPrices) : maxPrice;
    // thoda margin
    const margin = (maxVal - minVal || 1) * 0.05;
    return {
      minY: minVal - margin,
      maxY: maxVal + margin,
    };
  }, [candles, minPrice, maxPrice]);

  const priceRange = maxY - minY || 1;

  const scaleY = (price) =>
    chartHeight -
    paddingBottom -
    ((price - minY) / priceRange) * (chartHeight - paddingTop - paddingBottom);

  const candleVisuals = useMemo(() => {
    if (!candles.length) return [];

    const total = candles.length;
    const slotWidth =
      total > 0
        ? (chartWidth - paddingLeft - paddingRight) / total
        : chartWidth - paddingLeft - paddingRight;
    const bodyWidth = Math.max(slotWidth * 0.6, 3);

    return candles.map((candle, index) => {
      const xCenter =
        paddingLeft + slotWidth * index + slotWidth / 2;

      const yOpen = scaleY(candle.open);
      const yClose = scaleY(candle.close);
      const yHigh = scaleY(candle.high);
      const yLow = scaleY(candle.low);

      const isBullish = candle.close >= candle.open;
      const top = Math.min(yOpen, yClose);
      const bottom = Math.max(yOpen, yClose);
      const bodyHeight = Math.max(bottom - top, 1); // at least 1px

      return {
        xCenter,
        yHigh,
        yLow,
        bodyX: xCenter - bodyWidth / 2,
        bodyY: top,
        bodyWidth,
        bodyHeight,
        isBullish,
      };
    });
  }, [
    candles,
    chartWidth,
    chartHeight,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    scaleY,
  ]);

  const lastCandle = candles[candles.length - 1];

  // Y-axis ke ticks
  const yTicks = useMemo(() => {
    const levels = 6; // kitne price levels dikhaane hain
    const arr = [];
    for (let i = 0; i <= levels; i++) {
      const t = i / levels;
      const price = maxY - priceRange * t;
      arr.push({
        price,
        y: scaleY(price),
      });
    }
    return arr;
  }, [maxY, priceRange, scaleY]);

  const lastPriceY = scaleY(currentPrice);
  const lastPriceStr = currentPrice.toFixed(4);

  return (
    <div
      style={{
        background: "#020617",
        color: "#e5e7eb",
        padding: "16px",
        borderRadius: "16px",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        display: "flex",
        gap: "16px",
        border: "1px solid #1f2937",
      }}
    >
      {/* Left: TradingView style chart */}
      <div
        style={{
          flex: 2.3,
          minWidth: 0,
          background: "#020617",
          borderRadius: "12px",
          border: "1px solid #111827",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top header bar (symbol, exchange, O/H/L/C) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "6px 10px",
            borderBottom: "1px solid #111827",
            alignItems: "center",
            background: "#030712",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {tokenSymbol}/USDT
            </span>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>
              {exchangeName}
            </span>
            <span style={{ fontSize: 11, color: "#6b7280" }}>
              Simulated
            </span>
          </div>

          {lastCandle && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                fontSize: 11,
                color: "#9ca3af",
              }}
            >
              <span>
                O{" "}
                <strong style={{ color: "#e5e7eb" }}>
                  {lastCandle.open.toFixed(4)}
                </strong>
              </span>
              <span>
                H{" "}
                <strong style={{ color: "#e5e7eb" }}>
                  {lastCandle.high.toFixed(4)}
                </strong>
              </span>
              <span>
                L{" "}
                <strong style={{ color: "#e5e7eb" }}>
                  {lastCandle.low.toFixed(4)}
                </strong>
              </span>
              <span>
                C{" "}
                <strong
                  style={{
                    color:
                      lastCandle.close >= lastCandle.open
                        ? "#22c55e"
                        : "#f97373",
                  }}
                >
                  {lastCandle.close.toFixed(4)}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Timeframe buttons bar (just UI) */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            padding: "6px 10px",
            borderBottom: "1px solid #111827",
            fontSize: 11,
            color: "#9ca3af",
          }}
        >
          {["1s", "5s", "15s", "1m", "5m", "15m", "1h"].map((t, idx) => (
            <button
              key={t}
              style={{
                padding: "2px 8px",
                borderRadius: "6px",
                border:
                  idx === 0 ? "1px solid #4b5563" : "1px solid transparent",
                background: idx === 0 ? "#111827" : "transparent",
                color: "#e5e7eb",
                cursor: "default",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Main candlestick chart */}
        <div style={{ padding: "4px 4px 8px 4px", flex: 1 }}>
          <svg
            width="100%"
            height={chartHeight}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="none"
            style={{
              background: "#020617",
              borderRadius: "8px",
            }}
          >
            {/* Grid + y-axis prices */}
            {yTicks.map((tick, idx) => (
              <g key={idx}>
                {/* Horizontal grid line */}
                <line
                  x1={paddingLeft}
                  x2={chartWidth - paddingRight}
                  y1={tick.y}
                  y2={tick.y}
                  stroke="#111827"
                  strokeWidth="1"
                />
                {/* Price text left */}
                <text
                  x={paddingLeft - 4}
                  y={tick.y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#6b7280"
                >
                  {tick.price.toFixed(4)}
                </text>
              </g>
            ))}

            {/* Candles */}
            {candleVisuals.map((c, idx) => (
              <g key={idx}>
                {/* Wick */}
                <line
                  x1={c.xCenter}
                  x2={c.xCenter}
                  y1={c.yHigh}
                  y2={c.yLow}
                  stroke={c.isBullish ? "#22c55e" : "#f97373"}
                  strokeWidth="1"
                />
                {/* Body */}
                <rect
                  x={c.bodyX}
                  y={c.bodyY}
                  width={c.bodyWidth}
                  height={c.bodyHeight}
                  fill={c.isBullish ? "#22c55e" : "#f97373"}
                />
              </g>
            ))}

            {/* Last price line + label (TradingView style) */}
            <line
              x1={paddingLeft}
              x2={chartWidth - paddingRight}
              y1={lastPriceY}
              y2={lastPriceY}
              stroke="#4b5563"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            {/* Right side price label box */}
            <rect
              x={chartWidth - paddingRight + 4}
              y={lastPriceY - 9}
              width="60"
              height="18"
              rx="4"
              fill="#111827"
              stroke="#4b5563"
              strokeWidth="1"
            />
            <text
              x={chartWidth - paddingRight + 34}
              y={lastPriceY + 4}
              textAnchor="middle"
              fontSize="11"
              fill="#e5e7eb"
            >
              {lastPriceStr}
            </text>
          </svg>
        </div>
      </div>

      {/* Right: Order Book (same as before) */}
      <div
        style={{
          flex: 1,
          minWidth: "260px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "4px",
          }}
        >
          Order Book
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            fontSize: "12px",
          }}
        >
          {/* Asks */}
          <div
            style={{
              background: "#020617",
              borderRadius: "12px",
              padding: "8px",
              border: "1px solid #111827",
              maxHeight: "260px",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px",
                fontWeight: 600,
                color: "#f87171",
              }}
            >
              <span>Ask Price</span>
              <span>Amount</span>
            </div>
            {orderBook.asks.map((ask, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "2px 0",
                }}
              >
                <span>{ask.price.toFixed(4)}</span>
                <span>{ask.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Bids */}
          <div
            style={{
              background: "#020617",
              borderRadius: "12px",
              padding: "8px",
              border: "1px solid #111827",
              maxHeight: "260px",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px",
                fontWeight: 600,
                color: "#4ade80",
              }}
            >
              <span>Bid Price</span>
              <span>Amount</span>
            </div>
            {orderBook.bids.map((bid, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "2px 0",
                }}
              >
                <span>{bid.price.toFixed(4)}</span>
                <span>{bid.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>
          Front-end only simulated candlestick & order book. No real trades.
        </div>
      </div>
    </div>
  );
};

export default TokenCandleSimulationTV;
