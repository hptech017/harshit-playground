import React, { useState } from "react";

// Import all components
import RideTracking from "./components/RideTracking";
import SpotTrader from "./components/SpotTrader";
import MarginTrader from "./components/MarginTrader";
import PayWithTUFT from "./components/PayWithTUFT";
import USDTDepositCard from "./components/USDTDepositCard";
import KycVerfication from "./components/KycVerifcation";
// ... jitne bhi components chahiye import kar le

const HarshitPage = () => {
  const [activeComponent, setActiveComponent] = useState(null);

  const renderComponent = () => {
    switch (activeComponent) {
      case "ride":
        return <RideTracking />;
      case "spot":
        return <SpotTrader />;
      case "margin":
        return <MarginTrader />;
      case "tuft":
        return <PayWithTUFT />;
      case "usdt":
        return <USDTDepositCard />;
      case "kyc":
        return <KycVerfication />;
      default:
        return <p>Select a component from above buttons 👆</p>;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Harshit’s Playground</h1>

      {/* Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setActiveComponent("ride")}>Ride Tracking</button>
        <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => setActiveComponent("spot")}>Spot Trader</button>
        <button className="bg-yellow-500 text-white px-4 py-2 rounded" onClick={() => setActiveComponent("margin")}>Margin Trader</button>
        <button className="bg-purple-500 text-white px-4 py-2 rounded" onClick={() => setActiveComponent("tuft")}>Pay With TUFT</button>
        <button className="bg-pink-500 text-white px-4 py-2 rounded" onClick={() => setActiveComponent("usdt")}>USDT Deposit</button>
        <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => setActiveComponent("kyc")}>KYC Verification</button>
      </div>

      {/* Render Selected Component */}
      <div className="border p-4 rounded-lg shadow">
        {renderComponent()}
      </div>
    </div>
  );
};

export default HarshitPage;
