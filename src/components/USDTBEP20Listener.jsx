// import { useEffect, useState } from "react";
// import { Alchemy, Network } from "alchemy-sdk";
// import { ethers } from "ethers";

// /* ================= CONFIG ================= */

// const ALCHEMY_KEY = "XaT7MsSRABulU9QC_Q7Su";

// // USDT BEP20 on BSC
// const USDT_BEP20 = "0x55d398326f99059fF775485246999027B3197955";

// // ERC20 Transfer event topic
// const TRANSFER_TOPIC =
//   "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// // wallets to monitor
// const WALLETS = [
//   "0xac38696b3f30ccb47bb598b0f79951b5d8c21938",
//   "0xb120dd0e0789b8b03689b5e4e5bb9c1d2142e117",
//   "0xf367f5e6e2c73cba3b17200ad2cfa65de9c03ce2",
//   "0x00b17fcd69c354fd7ddc0660e60a67fe4bd53ff1",
// ];

// // Alchemy BSC provider
// const alchemy = new Alchemy({
//   apiKey: ALCHEMY_KEY,
//   network: Network.BSC_MAINNET,
// });

// /* ================= COMPONENT ================= */

// export default function USDTBEP20Listener() {
//   const [data, setData] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [lastUpdate, setLastUpdate] = useState(null);

//   const loadData = async () => {
//     setLoading(true);
//     const result = {};

//     for (const wallet of WALLETS) {
//       const res = await fetchUSDTForWallet(wallet);
//       result[wallet] = {
//         count: res.count,
//         amount: res.amount.toFixed(2),
//       };
//     }

//     setData(result);
//     setLastUpdate(new Date().toLocaleTimeString());
//     setLoading(false);
//   };

//   useEffect(() => {
//     loadData();
//     const interval = setInterval(loadData, 10000); // 10 sec
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div style={styles.page}>
//       <h2 style={styles.title}>USDT BEP20 Payment Monitor</h2>
//       <p style={styles.sub}>
//         {loading ? "Scanning blockchain..." : `Last checked: ${lastUpdate}`}
//       </p>

//       <table style={styles.table}>
//         <thead>
//           <tr>
//             <th style={styles.th}>Wallet Address</th>
//             <th style={styles.th}>Total USDT</th>
//             <th style={styles.th}>Tx Count</th>
//           </tr>
//         </thead>
//         <tbody>
//           {WALLETS.map(wallet => (
//             <tr key={wallet}>
//               <td style={styles.wallet}>{wallet}</td>
//               <td style={styles.amount}>
//                 {data[wallet]?.amount || "0.00"}
//               </td>
//               <td style={styles.count}>
//                 {data[wallet]?.count || 0}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// /* ================= CORE LOGIC ================= */

// async function fetchUSDTForWallet(wallet) {
//   const provider = await alchemy.config.getProvider();

//   const logs = await provider.getLogs({
//     address: USDT_BEP20,
//     fromBlock: 0,
//     toBlock: "latest",
//     topics: [
//       TRANSFER_TOPIC,
//       null,
//       ethers.zeroPadValue(wallet, 32), // indexed "to"
//     ],
//   });

//   let total = 0;

//   logs.forEach(log => {
//     const raw = BigInt(log.data); // uint256
//     total += Number(raw) / 1e18; // USDT decimals
//   });

//   return {
//     count: logs.length,
//     amount: total,
//   };
// }

// /* ================= SIMPLE STYLES ================= */

// const styles = {
//   page: {
//     minHeight: "100vh",
//     background: "#0b0f1a",
//     color: "#fff",
//     padding: 20,
//     fontFamily: "monospace",
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//   },
//   sub: {
//     color: "#aaa",
//     marginBottom: 16,
//   },
//   table: {
//     width: "100%",
//     borderCollapse: "collapse",
//     border: "1px solid #333",
//   },
//   th: {
//     borderBottom: "1px solid #333",
//     padding: 10,
//     textAlign: "left",
//     background: "#11162a",
//   },
//   wallet: {
//     padding: 10,
//     fontSize: 12,
//     color: "#ccc",
//     borderBottom: "1px solid #222",
//   },
//   amount: {
//     padding: 10,
//     textAlign: "right",
//     color: "#4ade80",
//     borderBottom: "1px solid #222",
//   },
//   count: {
//     padding: 10,
//     textAlign: "center",
//     borderBottom: "1px solid #222",
//   },
// };

import { useEffect, useState } from "react";
import { ethers } from "ethers";

/* ================= CONFIG ================= */

// FREE BSC RPC (no key)
const provider = new ethers.JsonRpcProvider(
  "https://bsc-dataseed.binance.org/"
);

// USDT BEP20 contract
const USDT_BEP20 = "0x55d398326f99059fF775485246999027B3197955";

// ERC20 Transfer topic
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// Wallets to monitor
const WALLETS = [
  "0xac38696b3f30ccb47bb598b0f79951b5d8c21938",
  "0xb120dd0e0789b8b03689b5e4e5bb9c1d2142e117",
  "0xf367f5e6e2c73cba3b17200ad2cfa65de9c03ce2",
  "0x00b17fcd69c354fd7ddc0660e60a67fe4bd53ff1",
];

/* ================= COMPONENT ================= */

export default function USDTBEP20Listener() {
  const [data, setData] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const result = {};

    for (const wallet of WALLETS) {
      const res = await fetchUSDTForWallet(wallet);
      result[wallet] = {
        count: res.count,
        amount: res.amount.toFixed(2),
      };
    }

    setData(result);
    setLastUpdate(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 1000); // 10 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 20, background: "#0b0f1a", minHeight: "100vh", color: "#fff" }}>
      <h2>USDT BEP20 Payment Monitor (FREE RPC)</h2>
      <p style={{ color: "#aaa" }}>
        {loading ? "Scanning blockchain..." : `Last checked: ${lastUpdate}`}
      </p>

      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>Wallet</th>
            <th>Total USDT</th>
            <th>Tx Count</th>
          </tr>
        </thead>
        <tbody>
          {WALLETS.map(w => (
            <tr key={w}>
              <td style={{ fontSize: 12 }}>{w}</td>
              <td style={{ color: "#4ade80", textAlign: "right" }}>
                {data[w]?.amount || "0.00"}
              </td>
              <td style={{ textAlign: "center" }}>
                {data[w]?.count || 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================= CORE LOGIC ================= */

async function fetchUSDTForWallet(wallet) {
  const logs = await provider.getLogs({
    address: USDT_BEP20,
    fromBlock: 0,
    toBlock: "latest",
    topics: [
      TRANSFER_TOPIC,
      null,
      ethers.zeroPadValue(wallet, 32),
    ],
  });

  let total = 0;
  logs.forEach(log => {
    total += Number(BigInt(log.data)) / 1e18;
  });

  return {
    count: logs.length,
    amount: total,
  };
}
