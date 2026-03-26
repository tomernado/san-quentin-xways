import { useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import Reel from './Reel'
import WinDisplay from './WinDisplay'

export default function Board() {
  const { grid, alarmMode, bonusMode, bigWinHype } = useGameStore()
  const shakeControls = useAnimation()
  const prevAlarm = useRef(false)
  const prevHype  = useRef(false)

  // Screen shake when 2 bonus symbols land (alarm)
  useEffect(() => {
    if (alarmMode && !prevAlarm.current) {
      shakeControls.start({
        x: [0, -8, 8, -6, 6, -4, 4, -2, 2, 0],
        transition: { duration: 0.55, ease: 'easeOut' },
      }).then(() => {
        // Keep gentle repeating nudge while alarm is active
        shakeControls.start({
          x: [0, -4, 4, -2, 2, 0],
          transition: { duration: 0.5, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' },
        })
      })
    } else if (!alarmMode && prevAlarm.current) {
      shakeControls.stop()
      shakeControls.set({ x: 0 })
    }
    prevAlarm.current = alarmMode
  }, [alarmMode])

  // Heavy shake when big win hype triggers
  useEffect(() => {
    if (bigWinHype && !prevHype.current) {
      shakeControls.stop()
      shakeControls.start({
        x: [0, -14, 14, -11, 11, -7, 7, -4, 4, -2, 2, 0],
        transition: { duration: 0.7, ease: 'easeOut' },
      })
    }
    prevHype.current = bigWinHype
  }, [bigWinHype])

  return (
    <motion.div
      animate={shakeControls}
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

      {/* Big win hype gold glow ring */}
      {bigWinHype && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.5, 1, 0] }}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
          style={{ boxShadow: 'inset 0 0 50px #fbbf24cc' }}
        />
      )}
    </motion.div>
  )
}
