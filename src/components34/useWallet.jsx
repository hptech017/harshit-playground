import { useState } from "react";

export function useWallet() {
  const [wallet, setWallet] = useState({
    usdt: 1000,
    token: 50
  });

  const updateWallet = (updates) => {
    setWallet((prev) => ({ ...prev, ...updates }));
  };

  return { wallet, updateWallet };
}
