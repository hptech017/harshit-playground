// VotingComponent.jsx
import { useState } from "react";
import { ethers } from "ethers";
import VotingABI from "./VotingABI.json"; // ABI JSON yahan paste karo ya import karo

const CONTRACT_ADDRESS = "0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47";
const ABI =
[
  {
    "inputs": [
      { "internalType": "string", "name": "_voterName", "type": "string" },
      { "internalType": "string", "name": "_candidateName", "type": "string" }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_candidateName", "type": "string" }
    ],
    "name": "getVotes",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" }
    ],
    "name": "hasAlreadyVoted",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];


const VotingComponent = () => {
  const [voterName, setVoterName] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [votes, setVotes] = useState(null);
  const [error, setError] = useState("");
  const [wallet, setWallet] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWallet(accounts[0]);
    } else {
      alert("MetaMask not found!");
    }
  };

  const vote = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI, signer);

      const tx = await contract.vote(voterName, candidateName);
      await tx.wait();
      alert("✅ Vote casted successfully!");
    } catch (err) {
      console.error(err);
      setError("❌ " + (err?.reason || err?.message || "Transaction failed"));
    }
  };

  const checkVotes = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI, provider);

      const voteCount = await contract.getVotes(candidateName);
      setVotes(Number(voteCount));
    } catch (err) {
      console.error(err);
      setError("❌ Error fetching votes");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow space-y-4">
      <h1 className="text-xl font-bold">🗳️ Blockchain Voting System</h1>

      {!wallet && <button onClick={connectWallet} className="bg-blue-500 text-white px-4 py-2 rounded">Connect Wallet</button>}

      <input
        placeholder="Your Name"
        className="border w-full p-2"
        value={voterName}
        onChange={(e) => setVoterName(e.target.value)}
      />
      <input
        placeholder="Candidate Name"
        className="border w-full p-2"
        value={candidateName}
        onChange={(e) => setCandidateName(e.target.value)}
      />

      <button onClick={vote} className="bg-green-600 text-white px-4 py-2 rounded">Vote</button>
      <button onClick={checkVotes} className="bg-purple-600 text-white px-4 py-2 rounded">Check Votes</button>

      {votes !== null && <p>✅ Total votes for <b>{candidateName}</b>: {votes}</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default VotingComponent;
