import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { ethers } from 'ethers';

const RECEIVER_ADDRESS = "0xAc38696b3F30Ccb47BB598B0F79951B5D8c21938";
const TOKENS = {
  USDT: { address: "0x55d398326f99059fF775485246999027B3197955", type: "erc20", decimals: 18, symbol: "USDT" },
  BNB: { type: "native", symbol: "BNB" }
};

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) public returns (bool)"
];

export default function DepositCard({ signer, selectedTokenKey }) {
  const [amount, setAmount] = useState("0.0001");
  const [qrData, setQrData] = useState("");

  useEffect(() => {
    // Generate QR data based on coin and amount
    const tk = TOKENS[selectedTokenKey];
    const data = `${RECEIVER_ADDRESS}?amount=${amount}&token=${selectedTokenKey}`;
    setQrData(data);
  }, [amount, selectedTokenKey]);

  const handlePay = async () => {
    const tk = TOKENS[selectedTokenKey];
    try {
      if (tk.type === "native") {
        const tx = await signer.sendTransaction({
          to: RECEIVER_ADDRESS,
          value: ethers.parseEther(amount)
        });
        await tx.wait();
      } else {
        const contract = new ethers.Contract(tk.address, ERC20_ABI, signer);
        const parsed = ethers.parseUnits(amount, tk.decimals);
        const tx = await contract.transfer(RECEIVER_ADDRESS, parsed);
        await tx.wait();
      }
      Swal.fire({
        icon: 'success',
        title: 'Payment Successful',
        html: `✅ You sent ${amount} ${tk.symbol}`
      });
      const total = parseFloat(localStorage.getItem('totalInvestment') || "0") + parseFloat(amount);
      localStorage.setItem('totalInvestment', total.toString());
    } catch (err) {
      Swal.fire('Error', 'Transaction failed', 'error');
    }
  };

  return (
    <div className="p-4 bg-[#101010] text-white rounded-lg shadow-lg space-y-4">
      <h3>Deposit {selectedTokenKey}</h3>
      <input
        type="number"
        step="0.0001"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="p-2 rounded text-black w-full"
      />
      <div>
        <label>Scan to Pay:</label>
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`}
          alt="QR Code"
          className="mx-auto"
        />
      </div>
      <button onClick={handlePay}
        className="bg-green-600 px-4 py-2 rounded w-full">
        Pay {amount} {TOKENS[selectedTokenKey].symbol}
      </button>
      <p>Total Invested: {localStorage.getItem('totalInvestment') || "0"}</p>
    </div>
  );
}
