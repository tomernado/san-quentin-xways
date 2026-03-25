import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'

const OPTIONS = [
  { scatters: 3, cost: 20,  label: '3 SCATTERS', sub: 'Guaranteed Bonus Entry',   color: '#ca8a04' },
  { scatters: 4, cost: 80,  label: '4 SCATTERS', sub: 'Enhanced Jumping Wilds',   color: '#d97706' },
  { scatters: 5, cost: 400, label: '5 SCATTERS', sub: 'Maximum Prison Break',      color: '#ef4444' },
]

export default function FeatureBuyModal() {
  const { showBonusBuy, balance, closeBonusBuy, buyBonus } = useGameStore()

  return (
    <AnimatePresence>
      {showBonusBuy && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={closeBonusBuy} />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-sm mx-4"
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 30 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '2px solid #78350f', background: 'linear-gradient(180deg, #1c1407 0%, #0f0a02 100%)' }}
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 text-center border-b border-yellow-900/40">
                <div className="text-yellow-400 font-black text-2xl tracking-widest">⚡ FEATURE BUY</div>
                <div className="text-yellow-700 text-xs mt-1 tracking-wide">NOLIMIT BONUS — GUARANTEED ENTRY</div>
              </div>

              {/* Options */}
              <div className="p-4 flex flex-col gap-3">
                {OPTIONS.map(opt => {
                  const canAfford = balance >= opt.cost
                  return (
                    <button
                      key={opt.scatters}
                      onClick={() => buyBonus(opt.scatters)}
                      disabled={!canAfford}
                      className="rounded-xl p-4 text-left transition-all active:scale-98 disabled:opacity-35 disabled:cursor-not-allowed"
                      style={{
                        border: `2px solid ${opt.color}55`,
                        background: canAfford ? `${opt.color}12` : 'transparent',
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-black text-white tracking-wider">{opt.label}</span>
                        <span className="font-black text-lg" style={{ color: opt.color }}>${opt.cost}</span>
                      </div>
                      <div className="text-gray-400 text-xs mt-1">{opt.sub}</div>
                    </button>
                  )
                })}
              </div>

              {/* Balance + cancel */}
              <div className="px-6 pb-6 flex justify-between items-center">
                <span className="text-gray-500 text-xs">Balance: <span className="text-green-400 font-bold">${balance.toFixed(2)}</span></span>
                <button
                  onClick={closeBonusBuy}
                  className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
