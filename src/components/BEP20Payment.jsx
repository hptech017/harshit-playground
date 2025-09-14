// BEP20Payment.jsx
import React, { useState } from "react";
import { ethers } from "ethers";

const ERC20_ABI = [
  "function transfer(address to, uint amount) public returns (bool)",
  "function decimals() view returns (uint8)"
];

const BEP20Payment = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');

  // 👇 Replace this with your actual token contract address (BSC)
  const TOKEN_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // like BUSD or your own

  const connectWallet = async () => {
    if (!window.ethereum) {
      return alert("MetaMask ya Trust Wallet install karo!");
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWalletAddress(accounts[0]);
      setStatus("✅ Wallet connected!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Wallet connection failed");
    }
  };

  const sendToken = async () => {
    if (!recipient || !amount) {
      return alert("Recipient aur amount bhar bhai");
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
      
      const decimals = await tokenContract.decimals();
      const amountInWei = ethers.utils.parseUnits(amount, decimals);

      const tx = await tokenContract.transfer(recipient, amountInWei);
      setStatus("⏳ Token transfer in progress...");
      await tx.wait();
      setStatus("✅ Token sent successfully!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Transfer failed");
    }
  };

  return (
    <div style={styles.container}>
      <h2>💸 BEP-20 Token Payment</h2>
      <button onClick={connectWallet} style={styles.button}>
        {walletAddress ? "✅ Wallet Connected" : "🔌 Connect Wallet"}
      </button>
      <input
        type="text"
        placeholder="Recipient Address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        style={styles.input}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={styles.input}
      />
      <button onClick={sendToken} style={styles.payButton}>
        🚀 Send BEP-20 Token
      </button>
      <p>{status}</p>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 400,
    margin: "50px auto",
    padding: 20,
    border: "2px solid #ddd",
    borderRadius: 10,
    textAlign: "center",
    fontFamily: "Arial",
  },
  button: {
    padding: 10,
    marginBottom: 20,
    cursor: "pointer",
  },
  input: {
    width: "100%",
    padding: 10,
    margin: "10px 0",
    borderRadius: 5,
    border: "1px solid #ccc",
  },
  payButton: {
    padding: 10,
    backgroundColor: "#f39c12",
    color: "white",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
};

export default BEP20Payment;
