import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'

const BET_LEVELS  = [0.20, 0.40, 0.60, 1.00, 2.00, 5.00, 10.00]
const AUTO_OPTIONS = [10, 20, 30, 40, 50]

export default function UIControls() {
  const {
    balance, bet, spinPhase, spin, spinBonus, setBet,
    bonusMode, freeSpinsLeft, openBonusBuy,
    autoPlaying, autoPlaysLeft, startAutoPlay, stopAutoPlay,
  } = useGameStore()

  const [showAutoPicker, setShowAutoPicker] = useState(false)

  const isSpinning = spinPhase !== 'idle'
  const betIndex   = BET_LEVELS.indexOf(bet)

  const raiseBet = () => !isSpinning && !bonusMode && betIndex < BET_LEVELS.length - 1 && setBet(BET_LEVELS[betIndex + 1])
  const lowerBet = () => !isSpinning && !bonusMode && betIndex > 0 && setBet(BET_LEVELS[betIndex - 1])

  const canSpin      = !isSpinning && !bonusMode && balance >= bet
  const canBonusSpin = !isSpinning && bonusMode && freeSpinsLeft > 0

  const handleSpin = () => bonusMode ? spinBonus() : spin()

  const handleAutoClick = () => {
    if (autoPlaying) { stopAutoPlay(); return }
    if (isSpinning || bonusMode) return
    setShowAutoPicker(v => !v)
  }

  return (
    <div
      className="flex items-center justify-between gap-1.5 sm:gap-3 px-2 sm:px-6 py-3 sm:py-4 border-t rounded-b-xl transition-colors"
      style={{
        background:  bonusMode ? 'rgba(10,3,0,0.97)' : 'rgba(17,24,39,0.9)',
        borderColor: bonusMode ? 'rgba(127,29,29,0.5)' : 'rgba(234,179,8,0.2)',
      }}
    >
      {/* Auto-play button */}
      <div className="relative">
        <button
          onClick={handleAutoClick}
          disabled={isSpinning && !autoPlaying}
          className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border flex flex-col items-center justify-center transition-all"
          style={
            autoPlaying
              ? { borderColor: '#ef4444', backgroundColor: '#7f1d1d', color: '#fca5a5', cursor: 'pointer' }
              : isSpinning || bonusMode
                ? { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: '#1f2937', color: 'rgba(255,255,255,0.25)', cursor: 'not-allowed' }
                : { borderColor: 'rgba(255,255,255,0.2)', backgroundColor: '#1f2937', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }
          }
        >
          {autoPlaying ? (
            <>
              <span style={{ fontSize: '8px', fontWeight: 900, lineHeight: 1 }}>■ STOP</span>
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#fbbf24', lineHeight: 1.2 }}>{autoPlaysLeft}</span>
            </>
          ) : (
            <span style={{ fontSize: '10px', fontWeight: 700 }}>AUTO</span>
          )}
        </button>

        {/* Picker dropdown */}
        <AnimatePresence>
          {showAutoPicker && (
            <motion.div
              className="absolute bottom-full left-0 mb-2 flex flex-col gap-1 z-20"
              style={{
                background: '#111827',
                border: '1px solid rgba(234,179,8,0.3)',
                borderRadius: '10px',
                padding: '6px',
                minWidth: '84px',
              }}
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {AUTO_OPTIONS.map(n => (
                <button
                  key={n}
                  onClick={() => { startAutoPlay(n); setShowAutoPicker(false) }}
                  className="text-white text-xs font-bold py-1.5 px-3 rounded hover:bg-yellow-600/25 transition-colors text-left"
                >
                  {n} spins
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bet Selector — locked during bonus */}
      <div className="flex items-center gap-2">
        <button
          onClick={lowerBet}
          disabled={isSpinning || bonusMode || betIndex === 0}
          className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-colors text-xs sm:text-base"
        >
          ▼
        </button>
        <div className="flex flex-col items-center">
          <span className="text-gray-400 text-xs">BET</span>
          <span className="text-yellow-400 font-bold w-12 sm:w-16 text-center text-sm sm:text-base">${bet.toFixed(2)}</span>
        </div>
        <button
          onClick={raiseBet}
          disabled={isSpinning || bonusMode || betIndex === BET_LEVELS.length - 1}
          className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-colors text-xs sm:text-base"
        >
          ▲
        </button>
      </div>

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={bonusMode ? !canBonusSpin : !canSpin}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full font-bold text-sm border-4 transition-all shadow-lg"
        style={
          bonusMode
            ? (canBonusSpin
                ? { borderColor: '#dc2626', backgroundColor: '#991b1b', boxShadow: '0 0 20px #dc262666', color: '#fff', cursor: 'pointer' }
                : { borderColor: '#374151', backgroundColor: '#1f2937', color: '#6b7280', cursor: 'not-allowed' })
            : (canSpin
                ? { borderColor: '#eab308', backgroundColor: '#ca8a04', boxShadow: '0 8px 20px rgba(234,179,8,0.3)', color: '#fff', cursor: 'pointer' }
                : { borderColor: '#4b5563', backgroundColor: '#374151', color: '#6b7280', cursor: 'not-allowed' })
        }
      >
        {isSpinning ? (
          <span className="inline-block animate-spin text-xl">⟳</span>
        ) : bonusMode ? (
          <span style={{ fontSize: '11px', fontWeight: 900, lineHeight: 1.2 }}>FREE{'\n'}SPIN</span>
        ) : (
          'SPIN'
        )}
      </button>

      {/* Balance */}
      <div className="flex flex-col items-center">
        <span className="text-gray-400 text-xs">BALANCE</span>
        <span className="text-green-400 font-bold">${balance.toFixed(2)}</span>
      </div>

      {/* Feature Buy */}
      <button
        onClick={openBonusBuy}
        disabled={isSpinning || bonusMode}
        className="w-10 h-10 sm:w-14 sm:h-14 rounded-full font-bold text-xl sm:text-2xl flex items-center justify-center transition-all"
        style={{
          background:  isSpinning || bonusMode ? '#374151' : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          color:       isSpinning || bonusMode ? '#6b7280' : '#000',
          boxShadow:   isSpinning || bonusMode ? 'none' : '0 4px 20px rgba(251,191,36,0.4)',
          cursor:      isSpinning || bonusMode ? 'not-allowed' : 'pointer',
          opacity:     bonusMode ? 0.4 : 1,
        }}
      >
        ⚡
      </button>
    </div>
  )
}
