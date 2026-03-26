import { motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import Reel from './Reel'
import WinDisplay from './WinDisplay'

export default function Board() {
  const { grid, alarmMode, bonusMode } = useGameStore()

  return (
    <div
      className="relative flex gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl backdrop-blur-sm overflow-hidden"
      style={{
        background:  bonusMode ? 'rgba(10,3,0,0.95)' : 'rgba(0,0,0,0.4)',
        border:      bonusMode ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(234,179,8,0.3)',
        transition:  'background 0.6s, border-color 0.6s',
      }}
    >
      {grid.map((reelSymbols, reelIndex) => (
        <div key={reelIndex} className="flex-1">
          <Reel reelIndex={reelIndex} symbols={reelSymbols} />
        </div>
      ))}

      <WinDisplay />

      {/* Alarm glow ring */}
      {alarmMode && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            boxShadow: [
              'inset 0 0 0px #ef4444',
              'inset 0 0 40px #ef4444cc',
              'inset 0 0 0px #ef4444',
            ],
          }}
          transition={{ repeat: Infinity, duration: 0.55, ease: 'easeInOut' }}
        />
      )}

      {/* Bonus mode red glow ring (persistent) */}
      {bonusMode && !alarmMode && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            boxShadow: [
              'inset 0 0 8px #7f1d1d',
              'inset 0 0 24px #991b1b',
              'inset 0 0 8px #7f1d1d',
            ],
          }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
        />
      )}
    </div>
  )
}
