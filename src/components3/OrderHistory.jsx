// src/components/OrderHistory.jsx
import { useEffect, useState } from "react";
import { getOrders } from "../api/binance";

export default function OrderHistory({ symbol = "BTCUSDT" }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setError(null);
    setLoading(true);
    const resp = await getOrders(symbol, 50);
    setLoading(false);
    if (!resp.success) {
      setError(typeof resp.error === "object" ? JSON.stringify(resp.error) : String(resp.error));
      setOrders([]);
      return;
    }
    setOrders(resp.data || []);
  };

  useEffect(() => {
    load();
    // optional auto-refresh every 8s
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, [symbol]);

  return (
    <div>
      <h2 className="text-xl mb-2">Order History ({symbol})</h2>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">Error: {error}</div>}

      {!loading && !error && orders.length === 0 && <div>No orders found.</div>}

      {!loading && orders.length > 0 && (
        <table className="border w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Order ID</th>
              <th className="border p-2">Symbol</th>
              <th className="border p-2">Side</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.orderId}>
                <td className="border p-2">{o.orderId}</td>
                <td className="border p-2">{o.symbol}</td>
                <td className="border p-2">{o.side}</td>
                <td className="border p-2">{o.origQty}</td>
                <td className="border p-2">{o.price || o.executedQty ? o.price || o.avgPrice : "-"}</td>
                <td className="border p-2">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
