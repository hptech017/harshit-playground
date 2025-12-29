import React, { useState } from "react";
import { ethers } from "ethers";
import EthereumProvider from "@walletconnect/ethereum-provider";
import { Zap, X, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"; // Importing icons

// --- CONSTANTS (UNCHANGED) ---
const PROJECT_ID = "04d0a21b7d0bda802ebee634601b695a";
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const RECEIVER = "0x00b17fcd69c354fd7ddc0660e60a67fe4bd53ff1";
const USDT_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)"
];
// -----------------------------

// --- Custom Modal Component ---
const CustomModal = ({ isOpen, type, title, message, onClose }) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const colorClass = isSuccess ? 'bg-emerald-50 border-emerald-500' : 'bg-red-50 border-red-500';
  const icon = isSuccess 
    ? <CheckCircle className="w-6 h-6 text-emerald-600" /> 
    : <AlertTriangle className="w-6 h-6 text-red-600" />;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className={`w-full max-w-sm p-5 border-l-4 rounded-xl shadow-2xl ${colorClass} bg-white transform transition-transform duration-300 scale-100`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {icon}
            <div className="ml-3">
              <h3 className={`text-lg font-semibold ${isSuccess ? 'text-emerald-800' : 'text-red-800'}`}>
                {title}
              </h3>
              <p className="mt-1 text-sm text-gray-700">{message}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
// -----------------------------

export default function WalletConnectDeposit() {
  const [provider, setProvider] = useState(null);
  const [amount, setAmount] = useState("10");
  const [loading, setLoading] = useState(false);
  
  // State for the custom modal
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'success', // or 'error'
    title: '',
    message: ''
  });

  const showModal = (type, title, message) => {
    setModalState({ isOpen: true, type, title, message });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const connectWallet = async () => {
    try {
      const wcProvider = await EthereumProvider.init({
        projectId: PROJECT_ID,
        chains: [56],
        showQrModal: true
      });

      await wcProvider.connect();
      const ethersProvider = new ethers.BrowserProvider(wcProvider);
      setProvider(ethersProvider);
    } catch (error) {
       showModal('error', 'Connection Failed', error.message || "Could not connect to wallet.");
    }
  };

  const sendPayment = async () => {
    if (!provider) return;

    try {
      setLoading(true);
      const signer = await provider.getSigner();
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);

      const tx = await usdtContract.transfer(
        RECEIVER,
        ethers.parseUnits(amount, 18)
      );

      await tx.wait(); 

      showModal(
        'success', 
        'Deposit Confirmed', 
        `${amount} USDT transferred successfully on BSC.`
      );
      
    } catch (err) {
      console.error("Transaction error:", err);
      let errorMessage = "Transaction failed or was rejected by the wallet.";
      if (err.message && err.message.length < 150) {
        errorMessage = err.message;
      }

      showModal('error', 'Transaction Failed', errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  const isAmountValid = amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50  p-8 font-sans">
      
      {/* Custom Modal */}
      <CustomModal 
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onClose={closeModal}
      />

      {/* Main Card (Minimalist) */}
      <div className="w-full max-w-sm bg-white border border-gray-100 rounded-lg shadow-xl p-8 transition-all duration-300">

        {/* Header */}
        <div className="mb-6 border-b pb-4 border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-indigo-500" />
            Quick Deposit
          </h2>
          <p className="text-sm mt-1 text-gray-500">
            USDT payment via WalletConnect (BEP-20).
          </p>
        </div>

        {/* Amount Input */}
        <div className="mb-5">
          <label htmlFor="deposit-amount" className="block text-sm font-medium text-gray-600 mb-2">
            Amount (USDT)
          </label>
          <div className="relative">
            <input
              type="number"
              id="deposit-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="any"
              className="block w-full border-gray-300 rounded-md pl-4 pr-12 py-3 text-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 text-sm font-medium">
              USDT
            </span>
          </div>
        </div>

        {/* Quick Amounts */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {[10, 50, 100, 500].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(String(v))}
              className={`py-2 rounded-md text-sm font-medium transition duration-150 border ${
                  parseFloat(amount) === v
                      ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
              }`}
            >
              ${v}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <div>
          {!provider ? (
            <button
              onClick={connectWallet}
              className="w-full py-3 rounded-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300 flex items-center justify-center"
            >
              Connect Wallet
            </button>
          ) : (
            <button
              onClick={sendPayment}
              disabled={loading || !isAmountValid}
              className={`w-full py-3 rounded-md font-semibold text-white transition duration-300 flex items-center justify-center ${
                loading || !isAmountValid
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing Transaction...
                </>
              ) : (
                `Pay ${amount || '0'} USDT`
              )}
            </button>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-center text-gray-500">
            <p>Receiver: ${RECEIVER}</p>
            <p className="mt-1">Powered by WalletConnect</p>
        </div>
      </div>
    </div>
  );
}