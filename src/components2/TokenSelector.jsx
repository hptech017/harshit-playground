import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";

const TOKENS = {
  USDT: {
    address: "0x55d398326f99059fF775485246999027B3197955",
    symbol: "USDT",
    decimals: 18,
    type: "erc20"
  },
  BNB: {
    symbol: "BNB",
    type: "native"
  }
};

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

export default function TokenSelector({ signer, address, onTokenSelected }) {
  const [selectedToken, setSelectedToken] = useState("USDT");
  const [balance, setBalance] = useState("0");
const fetchBalance = async (tokenKey) => {
  const tk = TOKENS[tokenKey];
  let fetchedBalance = "0";
  
  if (tk.type === "native") {
    const bal = await signer.provider.getBalance(address);
    fetchedBalance = ethers.formatEther(bal);
  } else {
    const contract = new ethers.Contract(tk.address, ERC20_ABI, signer);
    const raw = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    fetchedBalance = ethers.formatUnits(raw, decimals);
  }

  setBalance(fetchedBalance);
  onTokenSelected(tokenKey); // ✅ Just pass token key (no balance)
};


  useEffect(() => {
    if (signer && address) {
      fetchBalance(selectedToken);
    }
  }, [selectedToken, signer, address]);

  return (
    <div className="space-y-2">
      <label>Select Payment Token:</label>
      <select
        value={selectedToken}
        onChange={(e) => setSelectedToken(e.target.value)}
        className="p-2 rounded text-black w-full"
      >
        {Object.keys(TOKENS).map(k => (
          <option key={k} value={k}>{TOKENS[k].symbol}</option>
        ))}
      </select>
      <p>Balance: {balance} {TOKENS[selectedToken].symbol}</p>
    </div>
  );
}
