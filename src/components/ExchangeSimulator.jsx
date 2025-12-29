import React, { useEffect, useState } from "react";

/*
========================================================
 ADVANCED EXCHANGE SIMULATOR (UI + LOGIC)
 • Single Component
 • Exchange-like UI
 • Limit + Market Orders
 • Advanced Matching Engine
 • Live Random Chart (10–11 range)
========================================================
*/

export default function ExchangeSimulator() {

  /* ========================= WALLET ========================= */
  const [wallet, setWallet] = useState({
    usdt: 1000,
    token: 100,
  });

  /* ========================= ORDERBOOK ========================= */
  const [buyOrders, setBuyOrders] = useState([]);
  const [sellOrders, setSellOrders] = useState([]);
  const [trades, setTrades] = useState([]);

  /* ========================= MARKET PRICE + CHART ========================= */
  const [marketPrice, setMarketPrice] = useState(10.5);
  const [priceHistory, setPriceHistory] = useState([10.5]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarketPrice(prev => {
        const next = +(Math.min(11, Math.max(10, prev + (Math.random() - 0.5) * 0.1))).toFixed(4);
        setPriceHistory(h => [...h.slice(-50), next]);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* ========================= FORM ========================= */
  const [side, setSide] = useState("BUY");
  const [type, setType] = useState("LIMIT");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");

  /* ========================= PLACE ORDER ========================= */
  const placeOrder = () => {
    if (!qty) return;

    const order = {
      id: Date.now() + Math.random(),
      price: type === "MARKET" ? marketPrice : Number(price),
      quantity: Number(qty),
    };

    side === "BUY" ? matchBuy(order, type) : matchSell(order, type);
  };

  /* ========================= MATCH BUY ========================= */
  const matchBuy = (order, type) => {
    let remaining = order.quantity;
    let asks = [...sellOrders].sort((a, b) => a.price - b.price);
    let newAsks = [];

    for (let ask of asks) {
      if (remaining === 0) {
        newAsks.push(ask);
        continue;
      }

      if (type === "LIMIT" && ask.price > order.price) {
        newAsks.push(ask);
        continue;
      }

      const tradable = Math.min(remaining, ask.quantity);
      const cost = tradable * ask.price;
      if (wallet.usdt < cost) break;

      executeTrade(tradable, ask.price, "BUY");

      ask.quantity -= tradable;
      remaining -= tradable;

      if (ask.quantity > 0) newAsks.push(ask);
    }

    if (remaining > 0 && type === "LIMIT") {
      buyOrders.push({ ...order, quantity: remaining });
    }

    setSellOrders(newAsks);
    setBuyOrders([...buyOrders].sort((a, b) => b.price - a.price));
  };

  /* ========================= MATCH SELL ========================= */
  const matchSell = (order, type) => {
    let remaining = order.quantity;
    let bids = [...buyOrders].sort((a, b) => b.price - a.price);
    let newBids = [];

    for (let bid of bids) {
      if (remaining === 0) {
        newBids.push(bid);
        continue;
      }

      if (type === "LIMIT" && bid.price < order.price) {
        newBids.push(bid);
        continue;
      }

      const tradable = Math.min(remaining, bid.quantity);
      executeTrade(tradable, bid.price, "SELL");

      bid.quantity -= tradable;
      remaining -= tradable;

      if (bid.quantity > 0) newBids.push(bid);
    }

    if (remaining > 0 && type === "LIMIT") {
      sellOrders.push({ ...order, quantity: remaining });
    }

    setBuyOrders(newBids);
    setSellOrders([...sellOrders].sort((a, b) => a.price - b.price));
  };

  /* ========================= EXECUTE ========================= */
  const executeTrade = (qty, price, side) => {
    setWallet(w =>
      side === "BUY"
        ? { usdt: w.usdt - qty * price, token: w.token + qty }
        : { usdt: w.usdt + qty * price, token: w.token - qty }
    );

    setTrades(t => [
      { side, qty, price, time: new Date().toLocaleTimeString() },
      ...t,
    ]);
  };

  /* ========================= CHART SVG ========================= */
  const chartWidth = 600;
  const chartHeight = 200;

  const points = priceHistory
    .map((p, i) => {
      const x = (i / (priceHistory.length - 1 || 1)) * chartWidth;
      const y = chartHeight - ((p - 10) / 1) * chartHeight;
      return `${x},${y}`;
    })
    .join(" ");

  /* ========================= UI ========================= */
  return (
    <div style={{ background: "#0b0f14", color: "#fff", padding: 20, fontFamily: "Inter, Arial" }}>
      <h2>Exchange Simulator</h2>

      {/* WALLET */}
      <div style={{ display: "flex", gap: 20, marginBottom: 10 }}>
        <div>USDT: {wallet.usdt.toFixed(2)}</div>
        <div>TOKEN: {wallet.token.toFixed(2)}</div>
        <div style={{ color: "#22c55e" }}>MARKET: {marketPrice}</div>
      </div>

      {/* CHART */}
      <div style={{ background: "#020617", padding: 10, borderRadius: 8 }}>
        <svg width={chartWidth} height={chartHeight}>
          <polyline
            points={points}
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* BUY / SELL */}
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        {["BUY", "SELL"].map(s => (
          <div key={s} style={{ flex: 1, background: "#111827", padding: 15, borderRadius: 8 }}>
            <h3 style={{ color: s === "BUY" ? "#22c55e" : "#ef4444" }}>{s}</h3>

            <select onChange={e => setType(e.target.value)}>
              <option value="LIMIT">LIMIT</option>
              <option value="MARKET">MARKET</option>
            </select>

            {type === "LIMIT" && (
              <input
                placeholder="Price"
                type="number"
                onChange={e => setPrice(e.target.value)}
              />
            )}

            <input
              placeholder="Quantity"
              type="number"
              onChange={e => setQty(e.target.value)}
            />

            <button
              onClick={() => setSide(s) || placeOrder()}
              style={{
                width: "100%",
                marginTop: 10,
                background: s === "BUY" ? "#22c55e" : "#ef4444",
                color: "#000",
                fontWeight: "bold",
              }}
            >
              {s}
            </button>
          </div>
        ))}
      </div>

      {/* ORDER BOOK */}
      <div style={{ display: "flex", gap: 40, marginTop: 20 }}>
        <div>
          <h4 style={{ color: "#ef4444" }}>ASK</h4>
          {sellOrders.map(o => (
            <div key={o.id}>{o.price} | {o.quantity}</div>
          ))}
        </div>

        <div>
          <h4 style={{ color: "#22c55e" }}>BID</h4>
          {buyOrders.map(o => (
            <div key={o.id}>{o.price} | {o.quantity}</div>
          ))}
        </div>
      </div>

      {/* TRADES */}
      <div style={{ marginTop: 20 }}>
        <h3>Trade Book</h3>
        {trades.map((t, i) => (
          <div
            key={i}
            style={{ color: t.side === "BUY" ? "#22c55e" : "#ef4444" }}
          >
            [{t.time}] {t.side} {t.qty} @ {t.price}
          </div>
        ))}
      </div>
    </div>
  );
}
