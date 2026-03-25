import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'

export default function WinDisplay() {
  const { winAmount, showWin, clearWin } = useGameStore()

  // Auto-clear win display after 2 seconds
  useEffect(() => {
    if (!showWin) return
    const timer = setTimeout(clearWin, 2000)
    return () => clearTimeout(timer)
  }, [showWin, clearWin])

  return (
    <AnimatePresence>
      {showWin && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.3 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="text-center">
            <motion.div
              className="text-5xl font-black drop-shadow-lg"
              style={{ color: '#facc15', textShadow: '0 0 30px #facc15, 0 0 60px #f97316' }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 0.7, ease: 'easeInOut' }}
            >
              WIN!
            </motion.div>
            <div
              className="text-3xl font-bold mt-1"
              style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
            >
              ${winAmount.toFixed(2)}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
