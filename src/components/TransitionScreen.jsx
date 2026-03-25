import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'

export default function TransitionScreen() {
  const { showTransition, dismissTransition, freeSpinsLeft, freeSpinsTotalAdded } = useGameStore()

  return (
    <AnimatePresence>
      {showTransition && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          style={{
            backgroundImage:    `url(${import.meta.env.BASE_URL}assets/bonus_entry_background.jpg)`,
            backgroundSize:     'cover',
            backgroundPosition: 'center',
            backgroundColor:    '#000',
          }}
        >
          {/* Pulsing red darkening overlay over the entry background */}
          <motion.div
            className="absolute inset-0"
            animate={{ backgroundColor: ['rgba(0,0,0,0)', 'rgba(26,0,0,0.55)', 'rgba(0,0,0,0)'] }}
            transition={{ repeat: Infinity, duration: 0.75, ease: 'easeInOut' }}
          />

          {/* Red scanlines overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(239,68,68,0.03) 3px, rgba(239,68,68,0.03) 4px)',
            }}
          />

          {/* Prison bars top */}
          <div className="relative z-10 flex justify-center gap-5 mb-8">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                className="w-3 rounded-sm"
                style={{ height: '72px', backgroundColor: '#374151' }}
                animate={{ scaleY: [1, 0.65, 1] }}
                transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.09, ease: 'easeInOut' }}
              />
            ))}
          </div>

          {/* Main text */}
          <div className="relative z-10 text-center px-6">
            <motion.div
              className="font-black tracking-widest uppercase mb-2"
              style={{ fontSize: '13px', color: '#dc2626', letterSpacing: '0.4em' }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 0.4 }}
            >
              ⚠ ALERT ⚠
            </motion.div>

            <motion.h1
              className="font-black uppercase text-yellow-400 mb-3"
              style={{ fontSize: '32px', letterSpacing: '0.12em', textShadow: '0 0 30px #fbbf24' }}
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
            >
              LOCKDOWN SPINS
            </motion.h1>

            <motion.p
              className="text-white font-bold tracking-wide mb-2"
              style={{ fontSize: '15px' }}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
            >
              GOOD LUCK WITH YOUR PRISON BREAK!
            </motion.p>

            <div className="text-yellow-600 text-sm mt-4 mb-8">
              <span className="font-black text-yellow-400 text-2xl">{freeSpinsLeft}</span>
              <span className="ml-2">FREE SPINS AWARDED</span>
            </div>
          </div>

          {/* Prison bars bottom (mirrored) */}
          <div className="relative z-10 flex justify-center gap-5 mt-8 mb-8">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                className="w-3 rounded-sm"
                style={{ height: '72px', backgroundColor: '#374151' }}
                animate={{ scaleY: [1, 0.65, 1] }}
                transition={{ repeat: Infinity, duration: 0.5, delay: (4 - i) * 0.09, ease: 'easeInOut' }}
              />
            ))}
          </div>

          {/* Play button */}
          <motion.button
            className="relative z-10 font-black text-black tracking-widest uppercase rounded-xl px-14 py-4"
            style={{ fontSize: '18px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', boxShadow: '0 0 32px #fbbf2488' }}
            onClick={dismissTransition}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            PLAY
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
