import React, { useState } from "react";
import { ethers } from "ethers";
import EthereumProvider from "@walletconnect/ethereum-provider";

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
  },
  ETH: {
    symbol: "ETH",
    type: "native"
  }
};

const RECEIVER_ADDRESS = "0xAc38696b3F30Ccb47BB598B0F79951B5D8c21938";
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const MultiTokenDeposit = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connected, setConnected] = useState(false);
  const [selectedToken, setSelectedToken] = useState("USDT");
  const [selectedCoinName, setSelectedCoinName] = useState("UNSD");
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    try {
      const wcProvider = await EthereumProvider.init({
        projectId: "9793747aa8e83450db47ad2ffe05f4c3",
        chains: [56],
        showQrModal: true,
      });

      await wcProvider.enable();

      const ethersProvider = new ethers.BrowserProvider(wcProvider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();

      setProvider(ethersProvider);
      setSigner(signer);
      setWalletAddress(address);
      setConnected(true);

      await fetchBalance(signer, selectedToken);

      alert(`✅ Wallet Connected: ${address.slice(0, 6)}...${address.slice(-4)}\n🔢 Balance: ${balance} ${TOKENS[selectedToken].symbol}`);
    } catch (err) {
      console.error("Wallet connect failed", err);
    }
  };

  const fetchBalance = async (signer, token) => {
    try {
      if (TOKENS[token].type === "native") {
        const balance = await signer.provider.getBalance(await signer.getAddress());
        setBalance(ethers.formatEther(balance));
      } else {
        const contract = new ethers.Contract(TOKENS[token].address, ERC20_ABI, signer);
        const raw = await contract.balanceOf(await signer.getAddress());
        const decimals = await contract.decimals();
        setBalance(ethers.formatUnits(raw, decimals));
      }
    } catch (err) {
      console.error("Error fetching balance", err);
      setBalance("0");
    }
  };

  const handleDeposit = async () => {
    if (!signer || !selectedToken) return alert("Connect wallet and select token");

    const token = TOKENS[selectedToken];
    setLoading(true);

    try {
      const fixedAmount = "0.0001"; // For testing

      if (token.type === "native") {
        const tx = await signer.sendTransaction({
          to: RECEIVER_ADDRESS,
          value: ethers.parseEther(fixedAmount),
        });
        await tx.wait();
        alert(`✅ Sent ${fixedAmount} ${token.symbol} to ${RECEIVER_ADDRESS}`);
      } else {
        const contract = new ethers.Contract(token.address, ERC20_ABI, signer);
        const decimals = await contract.decimals();
        const parsedAmount = ethers.parseUnits(fixedAmount, decimals);
        const tx = await contract.transfer(RECEIVER_ADDRESS, parsedAmount);
        await tx.wait();
        alert(`✅ Sent ${fixedAmount} ${token.symbol} to ${RECEIVER_ADDRESS}`);
      }
    } catch (err) {
      console.error("Transaction failed", err);
      alert("❌ Transaction Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-black text-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Deposit Coins to Buy Token</h2>

      {!connected ? (
        <button onClick={connectWallet} className="bg-orange-600 px-4 py-2 rounded">
          Connect Wallet
        </button>
      ) : (
        <div>
          <p className="mb-2 text-green-400">
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
          <p className="mb-4">Balance: {balance} {TOKENS[selectedToken].symbol}</p>

          <label className="block mb-1">Select Coin to Purchase (e.g. $UNSD)</label>
          <select
            value={selectedCoinName}
            onChange={(e) => setSelectedCoinName(e.target.value)}
            className="p-2 mb-3 text-black rounded w-full"
          >
            <option value="UNSD">$UNSD</option>
            <option value="XYZ">$XYZ</option>
          </select>

          <label className="block mb-1">Select Payment Token</label>
          <select
            value={selectedToken}
            onChange={(e) => {
              setSelectedToken(e.target.value);
              fetchBalance(signer, e.target.value);
            }}
            className="p-2 mb-3 text-black rounded w-full"
          >
            {Object.keys(TOKENS).map((key) => (
              <option key={key} value={key}>
                {TOKENS[key].symbol}
              </option>
            ))}
          </select>

          <button
            onClick={handleDeposit}
            disabled={loading}
            className="bg-green-600 px-4 py-2 rounded w-full"
          >
            {loading ? "Processing..." : `Deposit 0.0001 ${TOKENS[selectedToken].symbol}`}
          </button>
        </div>
      )}
    </div>
  );
};

export default MultiTokenDeposit;
