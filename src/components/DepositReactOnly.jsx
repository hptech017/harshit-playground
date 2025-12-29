import { useEffect, useState } from "react";
import { Wallet } from "ethers";
import QRCode from "react-qr-code";

const ALCHEMY_KEY = "XaT7MsSRABulU9QC_Q7Su";
const ALCHEMY_URL =
  `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`;

export default function DepositReactOnly() {
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("WAITING");
  const [tx, setTx] = useState(null);

  // 1️⃣ generate wallet once
  useEffect(() => {
    let stored = localStorage.getItem("deposit_wallet");

    if (!stored) {
      const wallet = Wallet.createRandom();
      localStorage.setItem(
        "deposit_wallet",
        JSON.stringify({
          address: wallet.address
        })
      );
      stored = JSON.stringify({ address: wallet.address });
    }

    setAddress(JSON.parse(stored).address);
  }, []);

  // 2️⃣ poll Alchemy for incoming tx
  useEffect(() => {
    if (!address) return;

    const interval = setInterval(async () => {
      const res = await fetch(
        "https://eth-mainnet.g.alchemy.com/v2/" + ALCHEMY_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "alchemy_getAssetTransfers",
            params: [
              {
                toAddress: address,
                category: ["external", "erc20"],
                withMetadata: true,
                maxCount: "0x1"
              }
            ]
          })
        }
      );

      const data = await res.json();
      const transfer = data?.result?.transfers?.[0];

      if (transfer) {
        setTx(transfer);
        setStatus("DETECTED");

        localStorage.setItem(
          "last_tx",
          JSON.stringify(transfer)
        );

        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [address]);

  return (
    <div style={styles.box}>
      <h2>Deposit (React Only)</h2>

      {address && (
        <>
          <QRCode value={address} size={160} />
          <p style={styles.addr}>{address}</p>
        </>
      )}

      {status === "WAITING" && (
        <p style={styles.wait}>Waiting for payment...</p>
      )}

      {status === "DETECTED" && tx && (
        <div style={styles.success}>
          <p>✅ Payment Detected</p>
          <p>From: {tx.from}</p>
          <p>Amount: {tx.value} {tx.asset}</p>
          <p style={styles.hash}>{tx.hash}</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  box: {
    maxWidth: 420,
    margin: "40px auto",
    padding: 24,
    background: "#020617",
    color: "#fff",
    borderRadius: 14,
    textAlign: "center"
  },
  addr: {
    wordBreak: "break-all",
    fontSize: 12,
    marginTop: 10,
    color: "#38bdf8"
  },
  wait: {
    marginTop: 20,
    color: "#facc15"
  },
  success: {
    marginTop: 20,
    color: "#4ade80"
  },
  hash: {
    fontSize: 11,
    opacity: 0.7,
    wordBreak: "break-all"
  }
};
