import React, { useEffect, useState, useRef } from "react";
import { ethers } from "ethers";

// --- FIXED CONFIG ---
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BEP20 USDT
const RECEIVER_ADDRESS = "0xAc38696b3F30Ccb47BB598B0F79951B5D8c21938"; // Replace with your wallet
const CHAIN_RPC = "https://bsc-dataseed.binance.org/";

// --- USDT ABI ---
const USDT_ABI = [
  "event Transfer(address indexed from, address indexed to, uint value)",
];

const USDTDepositCard = () => {
  const [txDetected, setTxDetected] = useState(false);
  const [latestTxHash, setLatestTxHash] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const debounceTimer = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(CHAIN_RPC);
    const tokenContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider);

    const handleTransfer = async (from, to, value, event) => {
      console.log("Transfer event received:", {
        from: from ? from.toString() : "undefined",
        to: to ? to.toString() : "undefined",
        value: value ? value.toString() : "undefined",
        txHash: event.transactionHash,
      }); // Detailed debug log

      const txHash = event.transactionHash;

      // Validate event parameters
      if (!to || !ethers.isAddress(to) || !from || !ethers.isAddress(from)) {
        console.error("Invalid event data:", { from, to });
        setError("Invalid transaction data detected. Check console for details.");
        return;
      }

      if (to.toLowerCase() === RECEIVER_ADDRESS.toLowerCase() && txHash !== latestTxHash) {
        const formattedAmount = value ? parseFloat(ethers.formatUnits(value, 18)) : 0;
        console.log(`New USDT transfer: ${formattedAmount} from ${from}, Tx: ${txHash}`);

        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(async () => {
          try {
            setLatestTxHash(txHash);
            setTxDetected(true);

            const newPayment = {
              from: from || "Unknown",
              amount: formattedAmount || 0,
              txHash: txHash || "Unknown",
              timestamp: new Date().toISOString(),
            };
            setPaymentDetails(prev => [...prev, newPayment]);

            // Notify backend
            await fetch("/api/usdt-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newPayment),
            });
            console.log("Backend notified for Tx:", txHash);
          } catch (error) {
            console.error("Payment processing error:", error);
            setError(`Failed to process payment: ${error.message}`);
          } finally {
            setTxDetected(false);
          }
        }, 2000); // 2-second debounce
      }
    };

    tokenContract.on("Transfer", handleTransfer);

    return () => {
      tokenContract.off("Transfer", handleTransfer);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [latestTxHash]);

  return (
    <div className="flex flex-col items-center p-4 bg-[#101010] text-white rounded-2xl shadow-lg max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">USDT (BEP20) Deposit</h2>

      {/* ✅ QR Code using API */}
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${RECEIVER_ADDRESS}`}
        alt="QR Code"
        className="rounded-md"
      />

      <p className="mt-4 text-sm break-all bg-[#1d1d1d] p-2 rounded-md">
        {RECEIVER_ADDRESS}
      </p>
      <p className="mt-2 text-yellow-400">
        Accept Any USDT Payment
      </p>
      {!txDetected && !error && (
        <p className="mt-2 text-green-400 animate-pulse">
          Waiting for payment...
        </p>
      )}
      {txDetected && (
        <p className="mt-2 text-teal-400">
          Processing new payment...
        </p>
      )}
      {error && <p className="mt-2 text-red-400">{error}</p>}
      {paymentDetails.length > 0 && (
        <div className="mt-4 w-full">
          <h3 className="text-lg font-semibold">Recent Payments</h3>
          <ul className="list-disc pl-5">
            {paymentDetails.map((payment, index) => (
              <li key={index}>
                {payment.amount} USDT from{" "}
                {payment.from && typeof payment.from === "string" && payment.from.length >= 6
                  ? `${payment.from.slice(0, 6)}...${payment.from.slice(-4)}`
                  : "Unknown Sender"}{" "}
                (Tx: {payment.txHash && typeof payment.txHash === "string" && payment.txHash.length >= 10
                  ? payment.txHash.slice(0, 10) + "..."
                  : "Unknown Tx"})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default USDTDepositCard;