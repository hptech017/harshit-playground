import React, { useState, useEffect } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { motion } from "framer-motion";

export default function UpDownGame() {
  const [data, setData] = useState([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [bet, setBet] = useState(null); // "up" | "down"
  const [result, setResult] = useState(null);

  // Initial random data
  useEffect(() => {
    const initData = Array.from({ length: 20 }, (_, i) => ({
      name: i,
      value: 100 + Math.random() * 10,
    }));
    setData(initData);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      checkResult();
      setTimeLeft(15);
      updateGraph();
    }
  }, [timeLeft]);

  // Update graph every 15 sec
  const updateGraph = () => {
    setData((prev) => {
      const newValue = prev[prev.length - 1].value + (Math.random() > 0.5 ? 2 : -2);
      return [...prev.slice(1), { name: prev.length, value: newValue }];
    });
  };

  // Decide winner
  const checkResult = () => {
    const last = data[data.length - 1].value;
    const prev = data[data.length - 2].value;

    if (bet === "up" && last > prev) {
      setResult("win");
    } else if (bet === "down" && last < prev) {
      setResult("win");
    } else {
      setResult("lose");
    }
    setBet(null);
  };

  return (
    <div className="p-6 bg-gray-900 text-white h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">⚡ Up-Down Game</h1>

      <LineChart width={500} height={250} data={data}>
        <Line type="monotone" dataKey="value" stroke="#3b82f6" />
        <CartesianGrid stroke="#444" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
      </LineChart>

      <p className="mt-3 text-lg">⏳ Time Left: {timeLeft}s</p>

      <div className="flex gap-4 mt-4">
        <button
          className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-xl font-bold"
          onClick={() => setBet("up")}
          disabled={!!bet}
        >
          Up
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-xl font-bold"
          onClick={() => setBet("down")}
          disabled={!!bet}
        >
          Down
        </button>
      </div>

      {/* Win Animation */}
      {result === "win" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 text-3xl text-yellow-400 font-bold"
        >
          🎉 You Win! 🎆
        </motion.div>
      )}

      {/* Lose Animation */}
      {result === "lose" && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-6 text-xl text-gray-300 italic"
        >
          ❤️ Better Luck Next Time!
        </motion.div>
      )}
    </div>
  );
}
