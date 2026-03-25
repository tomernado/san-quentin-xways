import { motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'

export default function LockdownScreen() {
  const { lockdownTriggered, bonusSoFar, dismissLockdown } = useGameStore()
  if (!lockdownTriggered) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Alarm flash background */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ backgroundColor: ['rgba(239,68,68,0)', 'rgba(239,68,68,0.18)', 'rgba(239,68,68,0)'] }}
        transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
      />

      <div className="relative text-center px-8">
        {/* Siren icon */}
        <motion.div
          className="text-7xl mb-4"
          animate={{ rotate: [-8, 8, -8] }}
          transition={{ repeat: Infinity, duration: 0.4 }}
        >
          🚨
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-5xl font-black tracking-tight mb-2 uppercase"
          style={{ color: '#ef4444', textShadow: '0 0 40px #ef4444, 0 0 80px #ef444488' }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ repeat: Infinity, duration: 0.7 }}
        >
          LOCKDOWN SPINS
        </motion.h1>
        <motion.h2
          className="text-3xl font-black tracking-widest mb-6"
          style={{ color: '#facc15', textShadow: '0 0 20px #facc15' }}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        >
          TRIGGERED!
        </motion.h2>

        <p className="text-white/60 text-lg mb-2">
          {bonusSoFar} BONUS {bonusSoFar === 1 ? 'symbol' : 'symbols'} landed
        </p>
        <p className="text-yellow-400 font-bold text-xl mb-10">
          Free spins feature — coming soon!
        </p>

        <button
          onClick={dismissLockdown}
          className="px-10 py-3 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-lg tracking-widest transition-all shadow-lg shadow-red-600/50"
        >
          CONTINUE
        </button>
      </div>
    </motion.div>
  )
}
