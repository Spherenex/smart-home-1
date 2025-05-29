import { useState } from 'react'
import Vibration from '../src/components/vibration'
import './App.css'
import LineFallDetectionDashboard from './components/Linefall'
import SingleAxis from './components/SingleAxis'
import TransformerPrediction from './components/TranformerPrediction'
import TransformerService from './components/TransformerService'
import JetEngineMonitor from './components/Jetdatalog'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <Vibration/> */}
      {/* <LineFallDetectionDashboard /> */}
      {/* <SingleAxis/> */}
      <TransformerPrediction />
      {/* <TransformerService /> */}
      {/* <JetEngineMonitor /> */}
    </>
  )
}

export default App