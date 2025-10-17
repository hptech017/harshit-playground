import { useState } from "react";
import CryptoJS from "crypto-js";

export default function Trade() {
  const [symbol, setSymbol] = useState("BNBUSDT");
  const [amount, setAmount] = useState("");
  const [logs, setLogs] = useState([]);

  // ⚠️ Demo ke liye API key/secret yaha likh raha hoon
  const API_KEY = "3Y7TUkZrC2OzYDuI4Y0QhoGhHmRJ0Eph1GagwkoscOZp9G9gXZLFtwRLFCSJ2hGQ";
  const API_SECRET = "JfrOSFX672ysRPBnjejUTW0EeHAuayKS8hvUHZqjGmGeWQpbNmez29WXUecS51JJ";
  const BASE_URL = "https://testnet.binance.vision/api";

  const signedRequest = async (method, endpoint, params) => {
    const timestamp = Date.now();
    const query = new URLSearchParams({ ...params, timestamp }).toString();
    const signature = CryptoJS.HmacSHA256(query, API_SECRET).toString();
    const url = `${BASE_URL}${endpoint}?${query}&signature=${signature}`;

    const res = await fetch(url, {
      method,
      headers: { "X-MBX-APIKEY": API_KEY },
    });
    return res.json();
  };

  const handleBuy = async () => {
    const res = await signedRequest("POST", "/v3/order", {
      symbol,
      side: "BUY",
      type: "MARKET",
      quoteOrderQty: amount,
    });
    setLogs((prev) => [...prev, { type: "BUY", res }]);
  };

  const handleSell = async () => {
    const res = await signedRequest("POST", "/v3/order", {
      symbol,
      side: "SELL",
      type: "MARKET",
      quantity: amount,
    });
    setLogs((prev) => [...prev, { type: "SELL", res }]);
  };

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-xl font-bold">Binance Trade (Testnet Demo)</h2>

      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        placeholder="Symbol (e.g. BNBUSDT)"
        className="border p-2 rounded w-full"
      />

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount (USDT for buy, qty for sell)"
        className="border p-2 rounded w-full"
      />

      <button
        onClick={handleBuy}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Buy
      </button>

      <button
        onClick={handleSell}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Sell
      </button>

      <div className="mt-4">
        <h3 className="font-semibold">Logs:</h3>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
          {JSON.stringify(logs, null, 2)}
        </pre>
      </div>
    </div>
  );
}
