import React, { useState } from "react";
import { ethers } from "ethers";

// ERC20 ABI (for balanceOf, decimals, symbol, etc.)
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

// Add the tokens you want to track
const TOKEN_LIST = [
  {
    name: "BNB / ETH (Native)", // This will fetch provider.getBalance
    address: null, // null = native
  },
  {
    name: "USDT",
    address: "0x55d398326f99059fF775485246999027B3197955", // Example BEP20 USDT on BSC
  },
  {
    name: "H2 Token",
    address: "0xE6Bc04AD8892c2902dEe74D8E0Ac6aF4C4690794", // Replace with your token
  },
];

export default function WalletDashboard() {
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState("");
  const [balances, setBalances] = useState([]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Install MetaMask first!");
      return;
    }
    try {
      const prov = new ethers.BrowserProvider(window.ethereum);
      await prov.send("eth_requestAccounts", []);
      const signer = await prov.getSigner();
      const addr = await signer.getAddress();
      setProvider(prov);
      setAddress(addr);

      // fetch balances
      fetchBalances(prov, addr);
    } catch (err) {
      console.error("Wallet connection error:", err);
    }
  };

  const fetchBalances = async (prov, addr) => {
    const results = [];

    for (let token of TOKEN_LIST) {
      try {
        if (token.address === null) {
          // Native coin balance
          const balance = await prov.getBalance(addr);
          results.push({
            name: token.name,
            balance: ethers.formatEther(balance),
            symbol: "BNB/ETH",
          });
        } else {
          const contract = new ethers.Contract(token.address, ERC20_ABI, prov);
          const [bal, decimals, symbol] = await Promise.all([
            contract.balanceOf(addr),
            contract.decimals(),
            contract.symbol(),
          ]);
          results.push({
            name: token.name,
            balance: Number(ethers.formatUnits(bal, decimals)).toFixed(4),
            symbol,
          });
        }
      } catch (err) {
        console.error(`Error fetching ${token.name}:`, err);
      }
    }

    setBalances(results);
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-gray-900 text-white rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Wallet Dashboard</h1>

      {!address ? (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Connect Wallet
        </button>
      ) : (
        <>
          <p className="mb-4">Connected: {address}</p>

          <div className="space-y-3">
            {balances.length > 0 ? (
              balances.map((t, i) => (
                <div
                  key={i}
                  className="flex justify-between bg-gray-800 p-3 rounded-lg"
                >
                  <span>{t.name} ({t.symbol})</span>
                  <span>{t.balance}</span>
                </div>
              ))
            ) : (
              <p>Fetching balances...</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
