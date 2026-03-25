import { motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'

export default function BonusStatusBar() {
  const { bonusMode, freeSpinsLeft, freeSpinsTotalAdded, totalBonusWin } = useGameStore()
  if (!bonusMode) return null

  return (
    <motion.div
      className="w-full flex items-center justify-between px-5 py-2"
      style={{
        background: 'linear-gradient(90deg, #0f0a02, #1a0a00, #0f0a02)',
        borderBottom: '1px solid #7f1d1d55',
      }}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Spins left */}
      <div className="flex flex-col items-center">
        <span className="text-gray-500 text-xs uppercase tracking-wider">Spins Left</span>
        <motion.span
          className="font-black text-yellow-400"
          style={{ fontSize: '26px', lineHeight: 1 }}
          key={freeSpinsLeft}
          initial={{ scale: 1.4, color: '#ef4444' }}
          animate={{ scale: 1, color: '#facc15' }}
          transition={{ duration: 0.25 }}
        >
          {freeSpinsLeft}
        </motion.span>
      </div>

      {/* Center label */}
      <motion.div
        className="font-black tracking-widest text-red-500 uppercase"
        style={{ fontSize: '11px', letterSpacing: '0.3em' }}
        animate={{ opacity: [1, 0.35, 1] }}
        transition={{ repeat: Infinity, duration: 0.6 }}
      >
        🔒 LOCKDOWN SPINS
      </motion.div>

      {/* Total bonus win */}
      <div className="flex flex-col items-end">
        <span className="text-gray-500 text-xs uppercase tracking-wider">Bonus Win</span>
        <motion.span
          className="font-black text-green-400"
          style={{ fontSize: '20px', lineHeight: 1 }}
          key={totalBonusWin}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          ${totalBonusWin.toFixed(2)}
        </motion.span>
      </div>
    </motion.div>
  )
}
