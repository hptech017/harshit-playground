import { useState } from "react";
import { v4 as uuid } from "uuid";

export function useMatchingEngine(wallet, updateWallet) {
  const [buyOrders, setBuyOrders] = useState([]);
  const [sellOrders, setSellOrders] = useState([]);
  const [trades, setTrades] = useState([]);

  // 🔹 Helper: sort orderbook
  const sortBooks = (buys, sells) => {
    buys.sort((a, b) => b.price - a.price);
    sells.sort((a, b) => a.price - b.price);
  };

  // 🔹 Place Order
  const placeOrder = ({ side, price, quantity }) => {
    const order = { id: uuid(), side, price, quantity };

    if (side === "BUY") {
      matchBuy(order);
    } else {
      matchSell(order);
    }
  };

  // 🟢 BUY matching
  const matchBuy = (order) => {
    let remainingQty = order.quantity;
    let newSellOrders = [...sellOrders];

    for (let sell of newSellOrders) {
      if (remainingQty === 0 || sell.price > order.price) break;

      const tradedQty = Math.min(remainingQty, sell.quantity);
      const cost = tradedQty * sell.price;

      if (wallet.usdt < cost) break;

      executeTrade(tradedQty, sell.price, "BUY");

      sell.quantity -= tradedQty;
      remainingQty -= tradedQty;
    }

    newSellOrders = newSellOrders.filter(o => o.quantity > 0);

    if (remainingQty > 0) {
      setBuyOrders(prev => [...prev, { ...order, quantity: remainingQty }]);
    }

    sortBooks(buyOrders, newSellOrders);
    setSellOrders(newSellOrders);
  };

  // 🔴 SELL matching
  const matchSell = (order) => {
    let remainingQty = order.quantity;
    let newBuyOrders = [...buyOrders];

    for (let buy of newBuyOrders) {
      if (remainingQty === 0 || buy.price < order.price) break;

      const tradedQty = Math.min(remainingQty, buy.quantity);

      executeTrade(tradedQty, buy.price, "SELL");

      buy.quantity -= tradedQty;
      remainingQty -= tradedQty;
    }

    newBuyOrders = newBuyOrders.filter(o => o.quantity > 0);

    if (remainingQty > 0) {
      setSellOrders(prev => [...prev, { ...order, quantity: remainingQty }]);
    }

    sortBooks(newBuyOrders, sellOrders);
    setBuyOrders(newBuyOrders);
  };

  // 💥 Actual trade execution
  const executeTrade = (qty, price, side) => {
    if (side === "BUY") {
      updateWallet({
        usdt: wallet.usdt - qty * price,
        token: wallet.token + qty
      });
    } else {
      updateWallet({
        usdt: wallet.usdt + qty * price,
        token: wallet.token - qty
      });
    }

    setTrades(prev => [
      { qty, price, side, time: Date.now() },
      ...prev
    ]);
  };

  return {
    buyOrders,
    sellOrders,
    trades,
    placeOrder
  };
}
