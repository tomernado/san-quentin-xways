import { motion } from 'framer-motion'
import { useGameStore } from './store/useGameStore'
import Board from './components/Board'
import UIControls from './components/UIControls'
import BigWinDisplay from './components/BigWinDisplay'
import FeatureBuyModal from './components/FeatureBuyModal'
import TransitionScreen from './components/TransitionScreen'
import BonusStatusBar from './components/BonusStatusBar'
import BonusTotalWinScreen from './components/BonusTotalWinScreen'

export default function App() {
  const { alarmMode, bonusMode } = useGameStore()

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden"
      style={{
        backgroundImage:    `url(${import.meta.env.BASE_URL}assets/general_background.jpeg)`,
        backgroundSize:     'cover',
        backgroundPosition: 'center',
        backgroundColor:    '#030712',   // fallback while image loads
      }}
    >
      {/* Alarm flash (base game) */}
      {alarmMode && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-0"
          animate={{ backgroundColor: ['rgba(239,68,68,0)', 'rgba(239,68,68,0.12)', 'rgba(239,68,68,0)'] }}
          transition={{ repeat: Infinity, duration: 0.55, ease: 'easeInOut' }}
        />
      )}

      {/* Bonus ambient red pulse */}
      {bonusMode && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-0"
          animate={{ backgroundColor: ['rgba(127,29,29,0)', 'rgba(127,29,29,0.08)', 'rgba(127,29,29,0)'] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
        />
      )}

      {/* Header */}
      <div className="relative z-10 mb-4 text-center">
        <h1 className="text-3xl font-black tracking-widest text-yellow-400 uppercase">
          San Quentin <span className="text-white">xWays</span>
        </h1>
        <p className="text-yellow-600 text-xs tracking-widest mt-1">WIN UP TO 150,000X</p>
      </div>

      {/* Game container */}
      <div
        className="relative z-10 w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl"
        style={{
          boxShadow:   bonusMode ? '0 0 60px rgba(239,68,68,0.15), 0 25px 50px rgba(0,0,0,0.8)' : '0 0 40px rgba(0,0,0,0.6)',
          border:      bonusMode ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(234,179,8,0.2)',
          transition:  'box-shadow 0.6s, border-color 0.6s',
        }}
      >
        <BonusStatusBar />
        <Board />
        <UIControls />
      </div>

      {/* Overlays */}
      <BigWinDisplay />
      <FeatureBuyModal />
      <TransitionScreen />
      <BonusTotalWinScreen />
    </div>
  )
}
