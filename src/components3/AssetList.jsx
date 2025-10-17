import { useEffect, useState } from "react";
import { getPrice } from "../api/binance";

export default function AssetList() {
  const [price, setPrice] = useState(null);

  useEffect(() => {
    getPrice("BTCUSDT").then((res) => setPrice(res.price));
  }, []);

  return (
    <div>
      <h2>Asset Prices</h2>
      <p>BTC/USDT: {price}</p>
    </div>
  );
}
