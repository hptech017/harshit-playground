import React, { useState, useEffect } from "react";
import axios from "axios";
// import {useNavigate} from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  Copy,
  Loader2,
  Sparkles,
  Shield,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
// import { backendConfig } from "../.././constants/content/MainContent";
// import { useNavigate } from "react-router-dom";

const Deposit = () => {
  const [amount, setAmount] = useState("");
  const [depositData, setDepositData] = useState(null);
  const [timer, setTimer] = useState(900);
  const [status, setStatus] = useState("idle");
  const [copied, setCopied] = useState(false);

  const ADMIN_WALLET = import.meta.env.VITE_ADMIN_WALLET_ADDRESS;
  const qrValue = `ethereum:${ADMIN_WALLET}`;
  // const API = "http://192.168.1.20:7003/api/users";
  const backendConfig = "http://192.168.1.20:7003/api/users";
  const API = backendConfig.base + "/users";

//   const navigate = useNavigate();

  // console.log(token ,"ye hia kya ")
  const startDeposit = async () => {
    // if (!amount || Number(amount) < 20) {
    //   alert("Minimum deposit 20 USDT");
    //   return;
    // }

    try {
      const res = await axios.post(
        `${API}/deposit`,
        { amount },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(res?.data);
      setDepositData(res.data);
      setStatus("pending");
      setTimer(900);
    } catch (err) {
      alert(err.response?.data?.message || "Error creating deposit");
    }
  };

  useEffect(() => {
    if (status !== "pending") return;
    if (timer <= 0) return;

    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, status]);

  useEffect(() => {
    if (!depositData || status !== "pending") return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/deposit/${depositData.depositId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const newStatus = res.data.deposit.status;

        if (newStatus === "confirmed") {
          setStatus("confirmed");
          clearInterval(interval);
        } else if (newStatus === "expired") {
          setStatus("expired");
          clearInterval(interval);
        }
      } catch {}
    }, 4000);

    return () => clearInterval(interval);
  }, [depositData, status]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-screen flex flex-col   items-center py-10 px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Idle State - Deposit Form */}
        {status === "idle" && (
          <div className=" backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-slate-700/50 space-y-8">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 mb-4">
                <TrendingUp className="w-12 h-12 text-white" />
              </div>
              <h2
                className="font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
                style={{ fontSize: "2.5rem" }}
              >
                Deposit USDT
              </h2>
              <p className="text-slate-400" style={{ fontSize: "1.5rem" }}>
                BEP20 Network - Secure & Fast
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <Shield className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-slate-300" style={{ fontSize: "1.3rem" }}>
                  Secure
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <Sparkles className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-slate-300" style={{ fontSize: "1.3rem" }}>
                  Instant
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-slate-300" style={{ fontSize: "1rem" }}>
                  Verified
                </p>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label
                className="font-medium text-slate-300"
                style={{ fontSize: "1.5rem" }}
              >
                Deposit Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full font-semibold bg-slate-800 border-2 border-slate-700 focus:border-emerald-500 p-4 rounded-2xl focus:outline-none text-white transition-all placeholder:text-slate-500"
                  style={{ fontSize: "1.5rem" }}
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <span
                  className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-emerald-400"
                  style={{ fontSize: "1.25rem" }}
                >
                  USDT
                </span>
              </div>
              <p className="text-slate-400" style={{ fontSize: "1.3rem" }}>
                Minimum deposit: 20 USDT
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={startDeposit}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontSize: "1.6rem" }}
            >
              Generate Deposit Address
            </button>
          </div>
        )}

        {/* Pending State - Payment Screen */}
        {status === "pending" && depositData && (
          <div className=" backdrop-blur-xl p-6  rounded-3xl shadow-2xl border border-slate-700/50 space-y-5">
            {/* Timer Badge */}
            <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 px-6 py-3 rounded-full w-fit mx-auto">
              <Clock className="w-5 h-5 text-red-400 animate-pulse" />
              <span
                className="font-bold text-red-400"
                style={{ fontSize: "1.5rem" }}
              >
                {formatTime(timer)}
              </span>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center space-y-4">
              <h3
                className="font-bold text-white "
                style={{ fontSize: "1.5rem" }}
              >
                Scan QR Code
              </h3>
              <h3
                className="font-bold text-red-600 mx-auto flex items-center gap-2"
                style={{ fontSize: "1.5rem" }}
              >
                <TriangleAlert
                  size={50}
                  className="text-red-400 animate-pulse drop-shadow-[0_0_6px_rgba(34,197,94,0.6)]"
                />
                Please do not refresh or close this page while your transaction
                is being processed.....
              </h3>

              <div className="bg-white p-6 rounded-2xl shadow-xl">
                {depositData.qrCode ? (
                  <img
                    src={depositData.qrCode}
                    alt="QR Code"
                    className="w-52 h-52 rounded-xl"
                  />
                ) : (
                  <div className="w-64 h-64 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center">
                    <p
                      className="text-slate-600 text-center px-4"
                      style={{ fontSize: "0.875rem" }}
                    >
                      Loading QR...
                    </p>
                  </div>
                )}
              </div>
              <p className="text-slate-400" style={{ fontSize: "1.4rem" }}>
                Use your crypto wallet to scan
              </p>
              <div className="flex items-center gap-2">
                <p className="text-white text-[1.6rem]">Pay Exact Amount:</p>

                <span
                  className="
      text-[1.4rem]
      font-semibold
      text-green-300
      bg-gradient-to-r from-green-700/30 via-green-500/20 to-green-700/30
      px-3 py-1
      rounded-md
      border border-green-500/40
      ring-2 ring-green-500/30
      animate-pulse
      shadow-md shadow-green-600/30
    "
                >
                  {depositData?.expectedAmount}
                </span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4">
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span
                    className="text-slate-400"
                    style={{ fontSize: "1.5rem" }}
                  >
                    Wallet Address
                  </span>
                  <button
                    onClick={() => copyToClipboard(depositData.depositAddress)}
                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Copy className="w-10 h-10" />
                  </button>
                </div>
                <p
                  className="text-white font-mono break-all"
                  style={{ fontSize: "2rem" }}
                >
                  {depositData.depositAddress}
                </p>
              </div>

              <div className=" content-center">
                <div className="bg-slate-800/50 p-2 py-4 flex gap-2 rounded-xl border border-slate-700/50">
                  <p
                    className="text-slate-400 mb-1 font-semibold"
                    style={{ fontSize: "1.5rem" }}
                  >
                    Amount :
                  </p>
                  <p className="text-white " style={{ fontSize: "1.5rem" }}>
                    {depositData.expectedAmount} USDT
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-center gap-3 text-slate-300">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
              <span style={{ fontSize: "1.3rem" }}>
                Waiting for Payment confirmation...
              </span>
            </div>
          </div>
        )}

        {/* Confirmed State - Success */}
        {status === "confirmed" && (
          <div className="bg-gradient-to-br from-emerald-900/90 to-teal-900/90 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-emerald-700/50 text-center space-y-6">
            {/* Success Animation */}
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <CheckCircle className="w-14 h-14 text-white" />
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-3">
              <h3
                className="font-bold text-white"
                style={{ fontSize: "2.5rem" }}
              >
                Payment Successful!
              </h3>
              <p className="text-emerald-200" style={{ fontSize: "1.5rem" }}>
                Your deposit has been confirmed
              </p>
            </div>

            {/* Transaction Details */}
            <div className="bg-emerald-800/30 border border-emerald-600/30 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span
                  className="text-emerald-200"
                  style={{ fontSize: "1.3rem" }}
                >
                  Amount Deposited
                </span>
                <span
                  className="font-bold text-white"
                  style={{ fontSize: "1.5rem" }}
                >
                  {depositData?.amount} USDT
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className="text-emerald-200"
                  style={{ fontSize: "1.3rem" }}
                >
                  Status
                </span>
                <span
                  className="px-4 py-3 bg-emerald-500 text-white rounded-full font-semibold"
                  style={{ fontSize: "1.3rem" }}
                >
                  Confirmed
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className="text-emerald-200"
                  style={{ fontSize: "1.3rem" }}
                >
                  Reference
                </span>
                <span
                  className="text-white font-mono"
                  style={{ fontSize: "1rem" }}
                >
                  {depositData?.ref_id}
                </span>
              </div>
            </div>

            {/* Investment Activated Badge */}
            <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                <span
                  className="font-bold text-yellow-400"
                  style={{ fontSize: "1.5rem" }}
                >
                  Investment Activated
                </span>
              </div>
              <p
                className="text-yellow-200/80 mt-2"
                style={{ fontSize: "1.3rem" }}
              >
                Start earning returns on your deposit
              </p>
            </div>

            {/* CTA */}
            <button
              className="w-full bg-white hover:bg-slate-100 text-emerald-900 font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              style={{ fontSize: "1.5rem" }}
              onClick={() => navigate("/dashboard")}
            >
              View Dashboard
            </button>
          </div>
        )}

        {/* Expired State */}
        {status === "expired" && (
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-red-700/50 text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
              <Clock className="w-14 h-14 text-white" />
            </div>

            <div className="space-y-3">
              <h3
                className="font-bold text-red-400"
                style={{ fontSize: "2.5rem" }}
              >
                Time Expired
              </h3>
              <p className="text-slate-300" style={{ fontSize: "1.125rem" }}>
                This deposit request has timed out
              </p>
            </div>

            <button
              onClick={() => {
                setStatus("idle");
                setAmount("");
                setDepositData(null);
              }}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ fontSize: "1.125rem" }}
            >
              Create New Deposit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Deposit;
