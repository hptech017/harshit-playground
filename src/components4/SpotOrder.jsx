// import React, { useState, useEffect } from "react";
// import { TrendingUp, TrendingDown, DollarSign, BarChart3, Clock, Target, AlertCircle, CheckCircle, Activity } from "lucide-react";

// const SpotTrader = () => {
//   const [formData, setFormData] = useState({
//     symbol: "",
//     side: "BUY",
//     type: "LIMIT",
//     quantity: 0,
//     price: 0,
//     stopPrice: 0,
//     callbackRate: 0,
//     activationPrice: 0,
//   });

//   const [marketData, setMarketData] = useState({
//     currentPrice: 45231.50,
//     change24h: 2.45,
//     volume24h: 28453.67,
//     high24h: 46521.30,
//     low24h: 44120.80
//   });

//   const [orderHistory, setOrderHistory] = useState([
//     { id: 1, symbol: 'BTCUSDT', side: 'BUY', quantity: 0.1, price: 45000, status: 'FILLED', time: '14:30' },
//     { id: 2, symbol: 'ETHUSDT', side: 'SELL', quantity: 2.5, price: 2340, status: 'PENDING', time: '14:25' },
//     { id: 3, symbol: 'ADAUSDT', side: 'BUY', quantity: 100, price: 0.48, status: 'CANCELLED', time: '14:20' }
//   ]);

//   const [portfolio, setPortfolio] = useState({
//     totalValue: 12450.67,
//     pnl: 234.89,
//     pnlPercent: 1.92,
//     availableBalance: 5670.23
//   });

//   const [showAdvanced, setShowAdvanced] = useState(false);

//   // Simulate real-time price updates
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setMarketData(prev => ({
//         ...prev,
//         currentPrice: prev.currentPrice + (Math.random() - 0.5) * 100,
//         change24h: prev.change24h + (Math.random() - 0.5) * 0.5
//       }));
//     }, 3000);

//     return () => clearInterval(interval);
//   }, []);

//   const handleChange = (e) => {
//     const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
//     setFormData({ ...formData, [e.target.name]: value });
//   };

//   const calculateTotal = () => {
//     return (formData.quantity * (formData.price || marketData.currentPrice)).toFixed(2);
//   };

//   const getOrderTypeDescription = () => {
//     const descriptions = {
//       LIMIT: "Order executes at specified price or better",
//       MARKET: "Order executes immediately at current market price",
//       STOP_LOSS: "Market order triggers when stop price is reached",
//       STOP_LOSS_LIMIT: "Limit order triggers when stop price is reached",
//       TAKE_PROFIT: "Market order triggers when target price is reached",
//       TAKE_PROFIT_LIMIT: "Limit order triggers when target price is reached",
//       TRAILING_STOP_MARKET: "Stop price follows market price by callback rate"
//     };
//     return descriptions[formData.type] || "";
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const { type, symbol, quantity, price, stopPrice, callbackRate, activationPrice } = formData;

//     // Validation logic remains same...
//     if (!symbol || !quantity) {
//       alert("⚠️ Symbol and Quantity are required");
//       return;
//     }

//     if (type === "LIMIT" && !price) {
//       alert("⚠️ LIMIT orders require a price");
//       return;
//     }

//     if (
//       ["STOP_LOSS", "STOP_LOSS_LIMIT", "TAKE_PROFIT", "TAKE_PROFIT_LIMIT"].includes(type) &&
//       !stopPrice
//     ) {
//       alert(`⚠️ ${type} orders require a stop price`);
//       return;
//     }

//     if (type === "TRAILING_STOP_MARKET" && (!callbackRate || !activationPrice)) {
//       alert("⚠️ TRAILING_STOP_MARKET orders require callbackRate and activationPrice");
//       return;
//     }

//     try {
//       // Your API call would go here
//       // const res = await placeOrder(formData);
      
//       // Simulated success response
//       const newOrder = {
//         id: orderHistory.length + 1,
//         symbol: formData.symbol,
//         side: formData.side,
//         quantity: formData.quantity,
//         price: formData.price || marketData.currentPrice,
//         status: 'PENDING',
//         time: new Date().toLocaleTimeString().slice(0, 5)
//       };
      
//       setOrderHistory(prev => [newOrder, ...prev]);
//       alert("✅ Order placed successfully!");
      
//       // Reset form
//       setFormData({
//         symbol: "",
//         side: "BUY",
//         type: "LIMIT",
//         quantity: 0,
//         price: 0,
//         stopPrice: 0,
//         callbackRate: 0,
//         activationPrice: 0,
//       });
//     } catch (err) {
//       alert("❌ Error: " + err.message);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold text-white mb-2">
//             <Activity className="inline-block mr-3 text-purple-400" />
//             Advanced Spot Trader
//           </h1>
//           <p className="text-gray-300">Professional trading interface with real-time data</p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left Column - Market Overview */}
//           <div className="lg:col-span-1 space-y-6">
//             {/* Market Data Card */}
//             <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
//               <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
//                 <BarChart3 className="mr-2 text-blue-400" />
//                 Market Overview
//               </h3>
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-300">Current Price</span>
//                   <span className="text-2xl font-bold text-white">${marketData.currentPrice.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-300">24h Change</span>
//                   <span className={`flex items-center font-semibold ${marketData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//                     {marketData.change24h >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
//                     {marketData.change24h.toFixed(2)}%
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-300">24h Volume</span>
//                   <span className="text-white font-semibold">${marketData.volume24h.toFixed(2)}K</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-300">24h High</span>
//                   <span className="text-green-400 font-semibold">${marketData.high24h.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-300">24h Low</span>
//                   <span className="text-red-400 font-semibold">${marketData.low24h.toFixed(2)}</span>
//                 </div>
//               </div>
//             </div>

//             {/* Portfolio Card */}
//             <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
//               <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
//                 <DollarSign className="mr-2 text-green-400" />
//                 Portfolio
//               </h3>
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-300">Total Value</span>
//                   <span className="text-2xl font-bold text-white">${portfolio.totalValue.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-300">P&L</span>
//                   <span className={`font-semibold ${portfolio.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
//                     ${portfolio.pnl.toFixed(2)} ({portfolio.pnlPercent.toFixed(2)}%)
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-300">Available Balance</span>
//                   <span className="text-white font-semibold">${portfolio.availableBalance.toFixed(2)}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Middle Column - Trading Form */}
//           <div className="lg:col-span-1">
//             <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
//               <h2 className="text-2xl font-bold mb-6 text-white text-center flex items-center justify-center">
//                 <Target className="mr-2 text-purple-400" />
//                 Place Order
//               </h2>
              
//               <div className="space-y-4">
//                 {/* Symbol */}
//                 <div>
//                   <label className="block font-medium mb-2 text-white">Symbol</label>
//                   <input
//                     type="text"
//                     name="symbol"
//                     value={formData.symbol}
//                     onChange={handleChange}
//                     placeholder="e.g. BTCUSDT"
//                     className="w-full bg-white/20 border border-white/30 p-3 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
//                     required
//                   />
//                 </div>

//                 {/* Side & Type Row */}
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block font-medium mb-2 text-white">Side</label>
//                     <select
//                       name="side"
//                       value={formData.side}
//                       onChange={handleChange}
//                       className="w-full bg-white/20 border border-white/30 p-3 rounded-lg text-white focus:border-purple-400 focus:outline-none"
//                     >
//                       <option value="BUY" className="bg-gray-800">BUY</option>
//                       <option value="SELL" className="bg-gray-800">SELL</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block font-medium mb-2 text-white">Order Type</label>
//                     <select
//                       name="type"
//                       value={formData.type}
//                       onChange={handleChange}
//                       className="w-full bg-white/20 border border-white/30 p-3 rounded-lg text-white focus:border-purple-400 focus:outline-none"
//                     >
//                       <option value="LIMIT" className="bg-gray-800">LIMIT</option>
//                       <option value="MARKET" className="bg-gray-800">MARKET</option>
//                       <option value="STOP_LOSS" className="bg-gray-800">STOP_LOSS</option>
//                       <option value="STOP_LOSS_LIMIT" className="bg-gray-800">STOP_LOSS_LIMIT</option>
//                       <option value="TAKE_PROFIT" className="bg-gray-800">TAKE_PROFIT</option>
//                       <option value="TAKE_PROFIT_LIMIT" className="bg-gray-800">TAKE_PROFIT_LIMIT</option>
//                       <option value="TRAILING_STOP_MARKET" className="bg-gray-800">TRAILING_STOP_MARKET</option>
//                     </select>
//                   </div>
//                 </div>

//                 {/* Order Type Description */}
//                 {getOrderTypeDescription() && (
//                   <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
//                     <p className="text-blue-200 text-sm flex items-start">
//                       <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
//                       {getOrderTypeDescription()}
//                     </p>
//                   </div>
//                 )}

//                 {/* Quantity */}
//                 <div>
//                   <label className="block font-medium mb-2 text-white">Quantity</label>
//                   <input
//                     type="number"
//                     name="quantity"
//                     value={formData.quantity}
//                     onChange={handleChange}
//                     placeholder="Enter quantity"
//                     step="0.00000001"
//                     className="w-full bg-white/20 border border-white/30 p-3 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
//                     required
//                   />
//                 </div>

//                 {/* Price */}
//                 {(formData.type === "LIMIT" || formData.type.includes("LIMIT")) && (
//                   <div>
//                     <label className="block font-medium mb-2 text-white">Price</label>
//                     <div className="relative">
//                       <input
//                         type="number"
//                         name="price"
//                         value={formData.price}
//                         onChange={handleChange}
//                         placeholder="Enter price"
//                         step="0.01"
//                         className="w-full bg-white/20 border border-white/30 p-3 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none pr-20"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setFormData({...formData, price: marketData.currentPrice})}
//                         className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-white"
//                       >
//                         Market
//                       </button>
//                     </div>
//                   </div>
//                 )}

//                 {/* Stop Price */}
//                 {["STOP_LOSS", "STOP_LOSS_LIMIT", "TAKE_PROFIT", "TAKE_PROFIT_LIMIT"].includes(formData.type) && (
//                   <div>
//                     <label className="block font-medium mb-2 text-white">Stop Price</label>
//                     <input
//                       type="number"
//                       name="stopPrice"
//                       value={formData.stopPrice}
//                       onChange={handleChange}
//                       placeholder="Enter stop price"
//                       step="0.01"
//                       className="w-full bg-white/20 border border-white/30 p-3 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
//                     />
//                   </div>
//                 )}

//                 {/* Trailing Stop fields */}
//                 {formData.type === "TRAILING_STOP_MARKET" && (
//                   <>
//                     <div>
//                       <label className="block font-medium mb-2 text-white">Callback Rate (%)</label>
//                       <input
//                         type="number"
//                         name="callbackRate"
//                         value={formData.callbackRate}
//                         onChange={handleChange}
//                         placeholder="Enter callback rate"
//                         step="0.01"
//                         className="w-full bg-white/20 border border-white/30 p-3 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
//                       />
//                     </div>
//                     <div>
//                       <label className="block font-medium mb-2 text-white">Activation Price</label>
//                       <input
//                         type="number"
//                         name="activationPrice"
//                         value={formData.activationPrice}
//                         onChange={handleChange}
//                         placeholder="Enter activation price"
//                         step="0.01"
//                         className="w-full bg-white/20 border border-white/30 p-3 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
//                       />
//                     </div>
//                   </>
//                 )}

//                 {/* Order Summary */}
//                 {formData.quantity > 0 && (formData.price > 0 || formData.type === "MARKET") && (
//                   <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
//                     <h4 className="text-white font-semibold mb-2">Order Summary</h4>
//                     <div className="space-y-1 text-sm">
//                       <div className="flex justify-between">
//                         <span className="text-gray-300">Quantity:</span>
//                         <span className="text-white">{formData.quantity}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-300">Price:</span>
//                         <span className="text-white">
//                           ${formData.type === "MARKET" ? marketData.currentPrice.toFixed(2) : formData.price.toFixed(2)}
//                         </span>
//                       </div>
//                       <div className="flex justify-between font-semibold">
//                         <span className="text-gray-300">Total:</span>
//                         <span className="text-white">${calculateTotal()}</span>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 <button
//                   type="button"
//                   onClick={handleSubmit}
//                   className={`w-full p-4 rounded-lg font-semibold text-white transition-all ${
//                     formData.side === 'BUY' 
//                       ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' 
//                       : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
//                   }`}
//                 >
//                   {formData.side === 'BUY' ? '🚀 Buy' : '📉 Sell'} {formData.symbol || 'Asset'}
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Order History */}
//           <div className="lg:col-span-1">
//             <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
//               <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
//                 <Clock className="mr-2 text-yellow-400" />
//                 Recent Orders
//               </h3>
//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {orderHistory.map((order) => (
//                   <div key={order.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
//                     <div className="flex justify-between items-start mb-2">
//                       <div>
//                         <span className="text-white font-semibold">{order.symbol}</span>
//                         <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
//                           order.side === 'BUY' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
//                         }`}>
//                           {order.side}
//                         </span>
//                       </div>
//                       <span className="text-gray-400 text-sm">{order.time}</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <div className="text-sm text-gray-300">
//                         <div>Qty: {order.quantity}</div>
//                         <div>Price: ${order.price}</div>
//                       </div>
//                       <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center ${
//                         order.status === 'FILLED' ? 'bg-green-500/20 text-green-300' :
//                         order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' :
//                         'bg-red-500/20 text-red-300'
//                       }`}>
//                         {order.status === 'FILLED' && <CheckCircle className="w-3 h-3 mr-1" />}
//                         {order.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
//                         {order.status === 'CANCELLED' && <AlertCircle className="w-3 h-3 mr-1" />}
//                         {order.status}
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SpotTrader;


import React, { useState } from "react";
import Swal from "sweetalert2";
import { placeOrder } from "../api/order-api";

const SpotTrader = () => {
  const [formData, setFormData] = useState({
    symbol: "",
    side: "BUY",
    type: "LIMIT",
    quantity: 0,
    price: 0,
    stopPrice: 0,
    callbackRate: 0,
    activationPrice: 0,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { type, symbol, quantity, price, stopPrice, callbackRate, activationPrice } = formData;

    // Common validations
    if (!symbol || !quantity) {
      return Swal.fire("⚠️ Missing Fields", "Symbol and Quantity are required", "warning");
    }

    // Type-specific validations
    if (type === "LIMIT" && !price) {
      return Swal.fire("⚠️ Price Required", "LIMIT orders require a price", "warning");
    }

    if (
      ["STOP_LOSS", "STOP_LOSS_LIMIT", "TAKE_PROFIT", "TAKE_PROFIT_LIMIT"].includes(type) &&
      !stopPrice
    ) {
      return Swal.fire("⚠️ Stop Price Required", `${type} orders require a stop price`, "warning");
    }

    if (type === "TRAILING_STOP_MARKET" && (!callbackRate || !activationPrice)) {
      return Swal.fire(
        "⚠️ Required Fields",
        "TRAILING_STOP_MARKET orders require callbackRate and activationPrice",
        "warning"
      );
    }

    try {
      const res = await placeOrder(formData);
      if (res.success) {
        Swal.fire({
          title: "✅ Order Placed!",
          html: `
            <b>Order ID:</b> ${res.order.orderId}<br/>
            <b>Status:</b> ${res.order.status}<br/>
            <b>Symbol:</b> ${res.order.symbol}<br/>
            <b>Quantity:</b> ${res.order.origQty}<br/>
            <b>Price:</b> ${res.order.price || "Market"}<br/>
            <b>Stop Price:</b> ${res.order.stopPrice || "-"}<br/>
            <b>Type:</b> ${res.order.type}<br/>
            <b>Side:</b> ${res.order.side}
          `,
          icon: "success",
        });
      } else {
        Swal.fire("⚠️ Failed", res.message || "Order not placed", "error");
      }
    } catch (err) {
      Swal.fire("❌ Error", err.message || "Something went wrong", "error");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-xl p-6 mt-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Spot Trader</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Symbol */}
        <div>
          <label className="block font-medium mb-1">Symbol</label>
          <input
            type="text"
            name="symbol"
            value={formData.symbol}
            onChange={handleChange}
            placeholder="e.g. BTCUSDT"
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Side */}
        <div>
          <label className="block font-medium mb-1">Side</label>
          <select
            name="side"
            value={formData.side}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block font-medium mb-1">Order Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="LIMIT">LIMIT</option>
            <option value="MARKET">MARKET</option>
            <option value="STOP_LOSS">STOP_LOSS</option>
            <option value="STOP_LOSS_LIMIT">STOP_LOSS_LIMIT</option>
            <option value="TAKE_PROFIT">TAKE_PROFIT</option>
            <option value="TAKE_PROFIT_LIMIT">TAKE_PROFIT_LIMIT</option>
            <option value="TRAILING_STOP_MARKET">TRAILING_STOP_MARKET</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block font-medium mb-1">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Enter quantity"
            className="w-full border p-2 rounded"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block font-medium mb-1">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Required for LIMIT / STOP orders"
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Stop Price */}
        <div>
          <label className="block font-medium mb-1">Stop Price</label>
          <input
            type="number"
            name="stopPrice"
            value={formData.stopPrice}
            onChange={handleChange}
            placeholder="Required for STOP/TAKE_PROFIT"
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Trailing Stop fields */}
        {formData.type === "TRAILING_STOP_MARKET" && (
          <>
            <div>
              <label className="block font-medium mb-1">Callback Rate</label>
              <input
                type="number"
                name="callbackRate"
                value={formData.callbackRate}
                onChange={handleChange}
                placeholder="Enter callback rate"
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Activation Price</label>
              <input
                type="number"
                name="activationPrice"
                value={formData.activationPrice}
                onChange={handleChange}
                placeholder="Enter activation price"
                className="w-full border p-2 rounded"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mt-2"
        >
          Place Order
        </button>
      </form>
    </div>
  );
};

export default SpotTrader;
