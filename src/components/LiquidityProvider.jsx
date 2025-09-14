import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import EthereumProvider from "@walletconnect/ethereum-provider"; // npm install @walletconnect/ethereum-provider
import Swal from "sweetalert2"; // Added for the select dialog

// --- FIXED CONFIG ---
const DEFAULT_TOKEN_A_ADDRESS = "0xE6Bc04AD8892c2902dEe74D8E0Ac6aF4C4690794"; // Default Token A
const DEFAULT_TOKEN_B_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // Default USDT
const POOL_ADDRESS = "0xB120DD0e0789B8B03689B5e4e5bb9C1d2142E117"; // Pool address
const WALLET_CONNECT_PROJECT_ID = "9793747aa8e83450db47ad2ffe05f4c3"; // Provided Project ID
const CHAIN_ID = 56; // BNB Chain
const MORALIS_API_KEY = "QN_85de20e45f994241aa52096593dc5b0c"; // Your Moralis API key

// --- ERC20 ABI ---
const erc20ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

const LiquidityComponent = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [balances, setBalances] = useState({});
  const [pools, setPools] = useState([]);
  const [tokenA, setTokenA] = useState({ address: DEFAULT_TOKEN_A_ADDRESS, name: "", symbol: "", decimals: 18, logo: null });
  const [tokenB, setTokenB] = useState({ address: DEFAULT_TOKEN_B_ADDRESS, name: "", symbol: "", decimals: 18, logo: null });
  const [totalA, setTotalA] = useState(0);
  const [totalB, setTotalB] = useState(0);
  const [priceRatio, setPriceRatio] = useState(0);
  const [slippage, setSlippage] = useState(0.5);
  const [feeLevel, setFeeLevel] = useState(0.25);
  const [startingPrice, setStartingPrice] = useState("");
  const [error, setError] = useState(null);

  // Load pools from localStorage
  useEffect(() => {
    const savedPools = JSON.parse(localStorage.getItem("liquidityPools")) || [];
    setPools(savedPools);
  }, []);

  // Calculate totals and price ratio when pools change
  useEffect(() => {
    const calcTotals = pools.reduce(
      (acc, pool) => {
        acc.totalA += Number(pool.amountA || 0);
        acc.totalB += Number(pool.amountB || 0);
        return acc;
      },
      { totalA: 0, totalB: 0 }
    );
    setTotalA(calcTotals.totalA);
    setTotalB(calcTotals.totalB);
    setPriceRatio(calcTotals.totalA > 0 ? calcTotals.totalB / calcTotals.totalA : 0);
  }, [pools]);

  // Fetch token metadata when provider or address changes
  useEffect(() => {
    if (provider && tokenA.address) fetchTokenMetadata(tokenA.address, setTokenA);
  }, [provider, tokenA.address]);

  useEffect(() => {
    if (provider && tokenB.address) fetchTokenMetadata(tokenB.address, setTokenB);
  }, [provider, tokenB.address]);

  // --- Connect Wallet with WalletConnect ---
  const connectWallet = async () => {
    if (!WALLET_CONNECT_PROJECT_ID) {
      setError("WalletConnect Project ID is not set!");
      return;
    }
    setIsConnecting(true);
    setError(null);

    try {
      const wcProvider = await EthereumProvider.init({
        projectId: WALLET_CONNECT_PROJECT_ID,
        chains: [CHAIN_ID],
        showQrModal: true,
        optionalChains: [CHAIN_ID],
      });

      await wcProvider.enable();
      const web3Provider = new ethers.BrowserProvider(wcProvider);
      const accounts = await web3Provider.listAccounts();
      if (!accounts.length) throw new Error("No accounts found");

      const address = accounts[0].address;
      setWalletAddress(address);
      setProvider(web3Provider);
      setSigner(await web3Provider.getSigner());
      setError(null);
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError(`Failed to connect wallet: ${err.message || "Unknown error"}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // --- Fetch Token Metadata ---
  const fetchTokenMetadata = async (address, setter) => {
    try {
      const contract = new ethers.Contract(address, erc20ABI, provider);
      const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
      ]);
      setter(prev => ({ ...prev, name, symbol, decimals: Number(decimals) }));
    } catch (err) {
      console.error(`Metadata fetch error for ${address}:`, err);
      setter(prev => ({ ...prev, name: "Unknown", symbol: "UNK", decimals: 18 }));
      setError(`Failed to fetch metadata for ${address}: ${err.message}`);
    }
  };

  // --- Fetch Wallet Tokens using Moralis (BEP20 on BSC) ---
  const fetchWalletTokens = async () => {
    if (!MORALIS_API_KEY) {
      setError("Moralis API Key is not set! Get one from moralis.io");
      return [];
    }
    if (!walletAddress) {
      setError("Connect wallet first to fetch tokens!");
      return [];
    }

    try {
      const response = await fetch(`https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/tokens?chain=bsc&exclude_spam=true`, {
        headers: {
          'accept': 'application/json',
          'X-API-Key': MORALIS_API_KEY,
        },
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      return data.result
        .filter(token => Number(token.balance) > 0) // Only tokens with balance
        .map(token => ({
          address: token.token_address,
          name: token.name,
          symbol: token.symbol,
          decimals: Number(token.decimals),
          logo: token.thumbnail || null,
          balance: token.balance_formatted,
        }));
    } catch (err) {
      console.error("Token fetch error:", err);
      setError(`Failed to fetch BEP20 tokens: ${err.message}`);
      return [];
    }
  };

  // --- Import Token (Dynamic Select from Wallet BEP20 Tokens) ---
  const importToken = async (isTokenA) => {
    if (!provider || !walletAddress) {
      setError("Connect wallet first to import tokens!");
      return;
    }

    const tokens = await fetchWalletTokens();
    if (tokens.length === 0) {
      setError("No BEP20 tokens with balance found in your wallet.");
      return;
    }

    const options = tokens.reduce((acc, token) => {
      acc[token.address] = `${token.symbol} (${token.name}) - Balance: ${token.balance}`;
      return acc;
    }, {});

    const { value: selectedAddress } = await Swal.fire({
      title: `Select Token ${isTokenA ? 'A' : 'B'}`,
      input: 'select',
      inputOptions: options,
      inputPlaceholder: 'Select a BEP20 token',
      showCancelButton: true,
      confirmButtonText: 'Select',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-gray-800 text-white',
        confirmButton: 'bg-teal-500 hover:bg-teal-600',
        cancelButton: 'bg-gray-600 hover:bg-gray-700',
      },
    });

    if (selectedAddress) {
      const selectedToken = tokens.find(t => t.address.toLowerCase() === selectedAddress.toLowerCase());
      const setter = isTokenA ? setTokenA : setTokenB;
      setter(selectedToken);
      setError(null);
    }
  };

  // --- Approve Token ---
  const approveToken = async (token, amount) => {
    if (!signer) {
      setError("Connect wallet first!");
      return;
    }

    try {
      const contract = new ethers.Contract(token.address, erc20ABI, signer);
      const amountToApprove = amount ? ethers.parseUnits(amount, token.decimals) : ethers.MaxUint256;
      const tx = await contract.approve(POOL_ADDRESS, amountToApprove);
      await tx.wait();
      setError(null);
    } catch (err) {
      console.error("Approval error:", err);
      setError(`Approval failed: ${err.message || "Unknown error"}`);
    }
  };

  // --- Add Liquidity ---
  const addLiquidity = async () => {
    if (!walletAddress || !signer) {
      setError("Connect wallet first!");
      return;
    }
    if (!amountA || !amountB) {
      setError("Enter both amounts!");
      return;
    }
    if (isNaN(amountA) || isNaN(amountB) || Number(amountA) <= 0 || Number(amountB) <= 0) {
      setError("Enter valid positive numbers!");
      return;
    }
    if (Number(amountA) > Number(balances.tokenA) || Number(amountB) > Number(balances.tokenB)) {
      setError("Insufficient balance!");
      return;
    }

    let loading = false;
    try {
      loading = true;
      const amountAWei = ethers.parseUnits(amountA, tokenA.decimals);
      const amountBWei = ethers.parseUnits(amountB, tokenB.decimals);

      // Check and handle approvals
      const [allowanceA, allowanceB] = await Promise.all([
        new ethers.Contract(tokenA.address, erc20ABI, provider).allowance(walletAddress, POOL_ADDRESS),
        new ethers.Contract(tokenB.address, erc20ABI, provider).allowance(walletAddress, POOL_ADDRESS),
      ]);

      if (allowanceA < amountAWei) await approveToken(tokenA, amountA);
      if (allowanceB < amountBWei) await approveToken(tokenB, amountB);

      // Transfer Token A
      const txA = await new ethers.Contract(tokenA.address, erc20ABI, signer).transfer(POOL_ADDRESS, amountAWei);
      await txA.wait();

      // Transfer Token B
      const txB = await new ethers.Contract(tokenB.address, erc20ABI, signer).transfer(POOL_ADDRESS, amountBWei);
      await txB.wait();

      const newPool = {
        tokenA: tokenA.address,
        tokenB: tokenB.address,
        amountA,
        amountB,
        wallet: walletAddress,
        timestamp: new Date().toLocaleString(),
        fee: feeLevel,
        price: priceRatio,
      };

      const updatedPools = [...pools, newPool];
      setPools(updatedPools);
      localStorage.setItem("liquidityPools", JSON.stringify(updatedPools));
      setAmountA("");
      setAmountB("");
      setError(null);
    } catch (err) {
      console.error("Liquidity addition error:", err);
      setError(`Failed to add liquidity: ${err.message || "Transaction failed"}`);
    } finally {
      loading = false;
    }
  };

  // --- Check Balances ---
  const checkBalances = async () => {
    if (!walletAddress || !provider) {
      setError("Connect wallet first!");
      return;
    }

    try {
      const [balA, balB] = await Promise.all([
        new ethers.Contract(tokenA.address, erc20ABI, provider).balanceOf(walletAddress),
        new ethers.Contract(tokenB.address, erc20ABI, provider).balanceOf(walletAddress),
      ]);

      setBalances({
        tokenA: ethers.formatUnits(balA, tokenA.decimals),
        tokenB: ethers.formatUnits(balB, tokenB.decimals),
      });
      setError(null);
    } catch (err) {
      console.error("Balance check error:", err);
      setError(`Failed to fetch balances: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-md mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-center">Create Liquidity Pool</h2>

        {/* Connection Status */}
        <div className="bg-gray-800 rounded-2xl p-4 text-center">
          {isConnecting ? (
            <p className="text-teal-400">Connecting...</p>
          ) : walletAddress ? (
            <p>Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
          ) : (
            <button
              onClick={connectWallet}
              className="w-full bg-teal-500 text-white py-3 rounded-lg font-bold hover:bg-teal-600"
            >
              Connect Wallet
            </button>
          )}
          {error && <p className="text-red-400 mt-2">{error}</p>}
        </div>

        {/* Token Pair Selector */}
        <div className="bg-gray-800 rounded-2xl p-4 space-y-4">
          <h3 className="text-lg font-semibold">Select Token Pair</h3>
          <div className="flex justify-between items-center">
            <button
              onClick={() => importToken(true)}
              className="bg-gray-700 rounded-full px-4 py-2 flex items-center space-x-2 hover:bg-gray-600 transition-colors"
              disabled={!walletAddress}
            >
              {tokenA.logo ? <img src={tokenA.logo} alt={tokenA.symbol} className="w-6 h-6 rounded-full" /> : <span className="w-6 h-6 bg-yellow-500 rounded-full"></span>}
              <span>{tokenA.symbol || "Select Token A"}</span>
              <span>▼</span>
            </button>
            <span className="text-2xl">+</span>
            <button
              onClick={() => importToken(false)}
              className="bg-gray-700 rounded-full px-4 py-2 flex items-center space-x-2 hover:bg-gray-600 transition-colors"
              disabled={!walletAddress}
            >
              {tokenB.logo ? <img src={tokenB.logo} alt={tokenB.symbol} className="w-6 h-6 rounded-full" /> : <span className="w-6 h-6 bg-green-500 rounded-full"></span>}
              <span>{tokenB.symbol || "Select Token B"}</span>
              <span>▼</span>
            </button>
          </div>
        </div>

        {/* Fee Level and Starting Price */}
        <div className="bg-gray-800 rounded-2xl p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span>Fee Level</span>
            <select
              value={feeLevel}
              onChange={(e) => setFeeLevel(Number(e.target.value))}
              className="bg-teal-600 rounded-full px-3 py-1 text-white focus:outline-none"
            >
              <option value={0.25}>0.25%</option>
              <option value={0.5}>0.5%</option>
              <option value={1}>1%</option>
            </select>
          </div>
          <div className="flex justify-between items-center">
            <span>Starting Price</span>
            <input
              type="number"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              className="bg-gray-700 rounded px-2 py-1 w-32 text-right text-white focus:outline-none"
              placeholder="0.00"
              step="0.01"
            />
            <button
              onClick={() => setStartingPrice(priceRatio.toFixed(6))}
              className="text-teal-400 hover:underline"
            >
              Use Market Price
            </button>
          </div>
        </div>

        {/* Deposit Amounts */}
        <div className="bg-gray-800 rounded-2xl p-4 space-y-4">
          <h3 className="text-lg font-semibold">Deposit Amounts</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-gray-700 rounded-lg p-2">
              <div className="flex items-center space-x-2">
                {tokenA.logo ? <img src={tokenA.logo} alt={tokenA.symbol} className="w-6 h-6 rounded-full" /> : <span className="w-6 h-6 bg-yellow-500 rounded-full"></span>}
                <span>{tokenA.symbol || "Token A"}</span>
              </div>
              <input
                type="number"
                value={amountA}
                onChange={(e) => setAmountA(e.target.value)}
                className="bg-transparent text-right focus:outline-none w-32 text-white"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <button
                onClick={() => setAmountA(balances.tokenA || "0")}
                className="text-teal-400 hover:underline text-sm"
              >
                Max
              </button>
            </div>
            <p className="text-sm text-gray-400">Balance: {balances.tokenA || "0.00"}</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-gray-700 rounded-lg p-2">
              <div className="flex items-center space-x-2">
                {tokenB.logo ? <img src={tokenB.logo} alt={tokenB.symbol} className="w-6 h-6 rounded-full" /> : <span className="w-6 h-6 bg-green-500 rounded-full"></span>}
                <span>{tokenB.symbol || "Token B"}</span>
              </div>
              <input
                type="number"
                value={amountB}
                onChange={(e) => setAmountB(e.target.value)}
                className="bg-transparent text-right focus:outline-none w-32 text-white"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <button
                onClick={() => setAmountB(balances.tokenB || "0")}
                className="text-teal-400 hover:underline text-sm"
              >
                Max
              </button>
            </div>
            <p className="text-sm text-gray-400">Balance: {balances.tokenB || "0.00"}</p>
          </div>
        </div>

        {/* Slippage Tolerance */}
        <div className="bg-gray-800 rounded-2xl p-4 flex justify-between items-center">
          <span>Slippage Tolerance</span>
          <input
            type="number"
            value={slippage}
            onChange={(e) => setSlippage(Math.max(0, Math.min(10, Number(e.target.value))))}
            className="bg-gray-700 rounded px-2 py-1 w-20 text-right text-white focus:outline-none"
            step="0.1"
            min="0"
            max="10"
          />
          <span>%</span>
        </div>

        {/* Action Buttons */}
        {walletAddress && (
          <button
            onClick={addLiquidity}
            className="w-full bg-teal-500 text-white py-3 rounded-lg font-bold hover:bg-teal-600 transition-colors disabled:bg-gray-500"
            disabled={!amountA || !amountB || Number(amountA) <= 0 || Number(amountB) <= 0 || error}
          >
            Add Liquidity
          </button>
        )}

        <button
          onClick={checkBalances}
          className="w-full bg-gray-600 text-white py-3 rounded-lg font-bold hover:bg-gray-700 transition-colors"
          disabled={!walletAddress}
        >
          Refresh Balances
        </button>

        {/* Price Ratio */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <h3 className="text-lg font-semibold">Price Info</h3>
          <p>Price of {tokenA.symbol || "Token A"} in {tokenB.symbol || "Token B"}: {priceRatio.toFixed(6)}</p>
          <p>Total {tokenA.symbol || "Token A"}: {totalA.toFixed(6)}</p>
          <p>Total {tokenB.symbol || "Token B"}: {totalB.toFixed(6)}</p>
        </div>

        {/* Pools List */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <h3 className="text-lg font-semibold mb-4">Liquidity Pools</h3>
          {pools.length === 0 ? (
            <p className="text-gray-400">No pools yet.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400">
                  <th>Pair</th>
                  <th>Fee</th>
                  <th>TVL (USD)</th>
                  <th>Volume 24h (USD)</th>
                </tr>
              </thead>
              <tbody>
                {pools.map((pool, index) => (
                  <tr key={index} className="border-t border-gray-700">
                    <td>{tokenA.symbol}/{tokenB.symbol}</td>
                    <td>{pool.fee || 0.25}%</td>
                    <td>${(Number(pool.amountA) + Number(pool.amountB)).toFixed(2)}</td>
                    <td>${(Math.random() * 10000).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiquidityComponent;