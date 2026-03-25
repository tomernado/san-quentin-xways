import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'

export default function BonusTotalWinScreen() {
  const { showBonusEnd, totalBonusWin, freeSpinsTotalAdded, dismissBonusEnd } = useGameStore()

  return (
    <AnimatePresence>
      {showBonusEnd && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: 'rgba(0,0,0,0.92)' }}
        >
          <motion.div
            className="text-center px-8"
            initial={{ scale: 0.7, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          >
            <div className="text-red-500 font-black tracking-widest uppercase mb-2" style={{ fontSize: '12px', letterSpacing: '0.4em' }}>
              LOCKDOWN SPINS COMPLETE
            </div>

            <div className="text-yellow-400 font-black uppercase tracking-wide mb-6" style={{ fontSize: '28px' }}>
              PRISON BREAK {totalBonusWin > 0 ? 'SUCCESS' : 'FAILED'}!
            </div>

            <div className="text-gray-400 text-sm mb-2">TOTAL BONUS WIN</div>
            <motion.div
              className="font-black text-green-400 mb-8"
              style={{ fontSize: '56px', lineHeight: 1, textShadow: '0 0 40px #4ade80' }}
              animate={{ textShadow: ['0 0 20px #4ade8088', '0 0 60px #4ade80cc', '0 0 20px #4ade8088'] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              ${totalBonusWin.toFixed(2)}
            </motion.div>

            <div className="text-gray-600 text-xs mb-8">
              {freeSpinsTotalAdded} free spins played
            </div>

            <motion.button
              className="font-black text-black uppercase tracking-widest rounded-xl px-16 py-4"
              style={{ fontSize: '18px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', boxShadow: '0 0 32px #fbbf2466' }}
              onClick={dismissBonusEnd}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              COLLECT
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
