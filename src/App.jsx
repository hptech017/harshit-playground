import React from 'react'
import TradingSimulator from './components/TradingSimulator'
import PhoneAuth from './components/PhoneAuth'
import RideTracking from './components/RideTracking'
import KycVerification from './components/KycVerifcation'
import UrlSafetyChecker from './components/UrlSafetyChecker'

const App = () => {
  return (
    <div>
      {/* <RideTracking /> */}
      {/* <KycVerification />  */}
      <UrlSafetyChecker />
    </div>
  )
}

export default App