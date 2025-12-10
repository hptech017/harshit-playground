import React from 'react'
import TradingSimulator from './components/TradingSimulator'
import PhoneAuth from './components/PhoneAuth'
import RideTracking from './components/RideTracking'
import KycVerification from './components/KycVerifcation'
import UrlSafetyChecker from './components/UrlSafetyChecker'
import TanmayChatBot from './components/TanmayChatBot'
import BEP20Payment from './components/BEP20Payment'
import USDTDepositCard from './components/USDTDepositCard'
import StarChainLabs from './components/StarChainLabs'
import TokenCandleSimulation from './components/TokenSimulationChart'
const App = () => {
  return (
    <div>
      {/* <RideTracking /> */}
      {/* <KycVerification />  */}
      {/* <UrlSafetyChecker /> */}
      {/* <TanmayChatBot /> */}
      {/* <BEP20Payment/> */}
      {/* <USDTDepositCard/>  */}
      {/* <StarChainLabs /> */}
      <div style={{ padding: 20, background: "#020617", minHeight: "100vh" }}>
      <TokenCandleSimulation
        tokenSymbol="RBM"
        minPrice={9}
        maxPrice={10}
        initialPrice={9.1}
        updateIntervalMs={1000} // har 1 sec naya candle
        maxCandles={200}         // last 80 candles show
      />
    </div>
    </div>
  )
}

export default App