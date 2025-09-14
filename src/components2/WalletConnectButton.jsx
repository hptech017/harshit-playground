import React from 'react';
    import Swal from "sweetalert2"; 
import EthereumProvider from "@walletconnect/ethereum-provider";
import { ethers } from "ethers";

export default function WalletConnectButton({ onConnected }) {
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
  // 📦 Add this import on top

Swal.fire({
  icon: 'success',
  title: 'Wallet Connected',
  html: `<b>Connected:</b><br/>${address}`
});

      onConnected({ signer, provider: ethersProvider, address });
    } catch (err) {
      console.error("Wallet connect failed", err);
    }
  };

  return (
    <button
      onClick={connectWallet}
      className="bg-orange-600 px-4 py-2 rounded text-white"
    >
      Connect Wallet
    </button>
  );
}
