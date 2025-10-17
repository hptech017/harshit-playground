// src/components/OrderForm.jsx
import { useState } from "react";
import { placeOrder } from "../api/binance";

export default function OrderForm({ onOrderPlaced }) {
  const [loading, setLoading] = useState(false);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [side, setSide] = useState("BUY");
  const [qty, setQty] = useState(0.001);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    const resp = await placeOrder({
      symbol,
      side,
      type: "MARKET",
      quantity: qty,
    });

    setLoading(false);

    if (!resp.success) {
      console.error("Place order error:", resp.error);
      setError(typeof resp.error === "object" ? JSON.stringify(resp.error) : String(resp.error));
      return;
    }

    // Binance returns order object. Parent should update UI/history.
    onOrderPlaced(resp.data);
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl mb-2">Place Order</h2>

      <div className="flex gap-2 items-center">
        <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="border p-2">
          <option>BTCUSDT</option>
          <option>ETHUSDT</option>
          <option>BNBUSDT</option>
        </select>

        <select value={side} onChange={(e) => setSide(e.target.value)} className="border p-2">
          <option>BUY</option>
          <option>SELL</option>
        </select>

        <input
          type="number"
          step="0.0001"
          value={qty}
          onChange={(e) => setQty(parseFloat(e.target.value))}
          className="border p-2 w-32"
        />

        <button disabled={loading} onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">
          {loading ? "Placing..." : "Place Market Order"}
        </button>
      </div>

      {error && <div className="mt-2 text-red-600">Error: {error}</div>}
    </div>
  );
}
