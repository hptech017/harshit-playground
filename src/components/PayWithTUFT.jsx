import React, { useState } from "react";
import { ethers } from "ethers";
import Swal from "sweetalert2";

const PayWithTUFT = () => {
  const [account, setAccount] = useState(null);

  // TUFT Token contract address
  const tokenAddress = "0x0513d55289Dc7b95ae8FD45f4095c17F125FE784";

  // Wallet connect
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        return Swal.fire("Error", "MetaMask not found!", "error");
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      Swal.fire("Connected", `Wallet: ${accounts[0]}`, "success");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // Payment (token transfer)
  const handlePayment = async () => {
    try {
      if (!window.ethereum) {
        return Swal.fire("Error", "MetaMask not found!", "error");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Contract instance
      const tokenContract = new ethers.Contract(tokenAddress, [
        "function transfer(address to, uint256 amount) public returns (bool)"
      ], signer);

      // Example: 10 TUFT send (agar TUFT ka decimal 18 hai)
      const decimals = 18; 
      const amount = ethers.parseUnits("10", decimals);

      const recipient = "0xAc38696b3F30Ccb47BB598B0F79951B5D8c21938"; // yaha apna receive address dal

      const tx = await tokenContract.transfer(recipient, amount);

      Swal.fire("Pending", "Transaction is being processed...", "info");

      await tx.wait();

      Swal.fire("Success", "TUFT Token payment successful!", "success");
    } catch (err) {
      Swal.fire("Failed", err.message, "error");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gray-100 rounded-2xl shadow-md">
      <h2 className="text-xl font-bold">Pay with TUFT Token</h2>

      {account ? (
        <p className="text-sm">Connected: {account}</p>
      ) : (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Connect Wallet
        </button>
      )}

      <button
        onClick={handlePayment}
        className="px-4 py-2 bg-green-600 text-white rounded-lg"
      >
        Pay 10 TUFT
      </button>
    </div>
  );
};

export default PayWithTUFT;
