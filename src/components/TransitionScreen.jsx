import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'

const BASE    = import.meta.env.BASE_URL
const REELS   = 5
const STAGGER = 220   // ms between each EC in a row
const TOP_START = 650 // ms before the first top-EC pops in

export default function TransitionScreen() {
  const {
    showTransition, dismissTransition,
    freeSpinsLeft, enhancerCells, bonusActiveReels,
  } = useGameStore()

  const [revealedTop,    setRevealedTop]    = useState(new Set())
  const [revealedBottom, setRevealedBottom] = useState(new Set())
  const [showTotal, setShowTotal] = useState(false)
  const [showPlay,  setShowPlay]  = useState(false)
  const timers = useRef([])

  useEffect(() => {
    // Clear everything when screen closes
    if (!showTransition) {
      timers.current.forEach(clearTimeout)
      timers.current = []
      setRevealedTop(new Set())
      setRevealedBottom(new Set())
      setShowTotal(false)
      setShowPlay(false)
      return
    }

    const sorted = [...bonusActiveReels].sort((a, b) => a - b)
    const n = sorted.length

    // Top ECs — left to right
    sorted.forEach((ri, i) => {
      timers.current.push(
        setTimeout(() => setRevealedTop(prev => { const s = new Set(prev); s.add(ri); return s }),
          TOP_START + i * STAGGER)
      )
    })

    // Bottom ECs — left to right
    const botStart = TOP_START + n * STAGGER + 300
    sorted.forEach((ri, i) => {
      timers.current.push(
        setTimeout(() => setRevealedBottom(prev => { const s = new Set(prev); s.add(ri); return s }),
          botStart + i * STAGGER)
      )
    })

    // Big total + play button
    const totalAt = botStart + n * STAGGER + 420
    timers.current.push(setTimeout(() => setShowTotal(true), totalAt))
    timers.current.push(setTimeout(() => setShowPlay(true),  totalAt + 650))

    return () => { timers.current.forEach(clearTimeout); timers.current = [] }
  }, [showTransition])

  // Running tally updates as each EC pops in
  let runningTotal = 0
  revealedTop.forEach(ri    => { runningTotal += enhancerCells[ri]?.top?.spinCount    || 0 })
  revealedBottom.forEach(ri => { runningTotal += enhancerCells[ri]?.bottom?.spinCount || 0 })

  const activeSet = new Set(bonusActiveReels)

  return (
    <AnimatePresence>
      {showTransition && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          style={{ backgroundColor: 'rgba(0,0,0,0.88)' }}
        >
          {/* Full bonus entry image — contain so both characters are visible */}
          <img
            src={`${BASE}assets/bonus_entry_background.jpg`}
            alt=""
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'contain', objectPosition: 'center',
              pointerEvents: 'none',
            }}
          />

          {/* Pulsing red darkening overlay */}
          <motion.div
            className="absolute inset-0"
            animate={{ backgroundColor: ['rgba(0,0,0,0)', 'rgba(26,0,0,0.55)', 'rgba(0,0,0,0)'] }}
            transition={{ repeat: Infinity, duration: 0.75, ease: 'easeInOut' }}
          />

          {/* Scanlines */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(239,68,68,0.03) 3px, rgba(239,68,68,0.03) 4px)',
            }}
          />

          {/* Prison bars top */}
          <div className="relative z-10 flex justify-center gap-5 mb-5">
            {[0,1,2,3,4].map(i => (
              <motion.div
                key={i}
                className="w-3 rounded-sm"
                style={{ height: '56px', backgroundColor: '#374151' }}
                animate={{ scaleY: [1, 0.65, 1] }}
                transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.09, ease: 'easeInOut' }}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="relative z-10 text-center px-4 w-full max-w-sm">

            {/* ALERT */}
            <motion.div
              className="font-black tracking-widest uppercase mb-1"
              style={{ fontSize: '11px', color: '#dc2626', letterSpacing: '0.4em' }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 0.4 }}
            >
              ⚠ ALERT ⚠
            </motion.div>

            {/* LOCKDOWN SPINS */}
            <motion.h1
              className="font-black uppercase text-yellow-400 mb-5"
              style={{ fontSize: 'clamp(20px, 6vw, 30px)', letterSpacing: '0.1em', textShadow: '0 0 30px #fbbf24' }}
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
            >
              LOCKDOWN SPINS
            </motion.h1>

            {/* ── EC grid: top row then bottom row ── */}
            <div className="flex justify-center gap-1.5 mb-1">
              {Array.from({ length: REELS }, (_, ri) => (
                <div key={ri} style={{ width: '46px', height: '28px', opacity: activeSet.has(ri) ? 1 : 0.15 }}>
                  <AnimatePresence mode="wait">
                    {activeSet.has(ri) && revealedTop.has(ri) ? (
                      <motion.div
                        key="open"
                        className="w-full h-full rounded flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
                          border: '2px solid #3b82f6',
                          boxShadow: '0 0 10px #3b82f666',
                        }}
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                      >
                        <span style={{ color: '#fff', fontSize: '13px', fontWeight: 900, lineHeight: 1 }}>
                          {enhancerCells[ri]?.top?.name}
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="locked"
                        className="w-full h-full rounded overflow-hidden"
                        style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                      >
                        <img src={`${BASE}assets/close_tab.jpeg`} alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-1.5 mb-4">
              {Array.from({ length: REELS }, (_, ri) => (
                <div key={ri} style={{ width: '46px', height: '28px', opacity: activeSet.has(ri) ? 1 : 0.15 }}>
                  <AnimatePresence mode="wait">
                    {activeSet.has(ri) && revealedBottom.has(ri) ? (
                      <motion.div
                        key="open"
                        className="w-full h-full rounded flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
                          border: '2px solid #3b82f6',
                          boxShadow: '0 0 10px #3b82f666',
                        }}
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                      >
                        <span style={{ color: '#fff', fontSize: '13px', fontWeight: 900, lineHeight: 1 }}>
                          {enhancerCells[ri]?.bottom?.name}
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="locked"
                        className="w-full h-full rounded overflow-hidden"
                        style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                      >
                        <img src={`${BASE}assets/close_tab.jpeg`} alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Running tally → big final reveal */}
            {runningTotal > 0 && (
              <div className="text-center mb-3">
                <AnimatePresence mode="wait">
                  {showTotal ? (
                    <motion.div
                      key="final"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 16 }}
                    >
                      <div
                        className="font-black text-yellow-400"
                        style={{ fontSize: 'clamp(44px, 12vw, 60px)', lineHeight: 1, textShadow: '0 0 40px #fbbf24, 0 0 80px #f97316' }}
                      >
                        {freeSpinsLeft}
                      </div>
                      <div className="text-yellow-500 font-bold tracking-widest mt-1" style={{ fontSize: '13px' }}>
                        FREE SPINS AWARDED
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={runningTotal}
                      initial={{ scale: 1.35, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.18 }}
                    >
                      <span className="font-black text-yellow-400" style={{ fontSize: '30px', lineHeight: 1 }}>
                        {runningTotal}
                      </span>
                      <span className="text-yellow-600 text-sm ml-2 font-bold">SPINS</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Play button */}
          <AnimatePresence>
            {showPlay && (
              <motion.button
                className="relative z-10 font-black text-black tracking-widest uppercase rounded-xl px-12 py-4"
                style={{ fontSize: '18px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', boxShadow: '0 0 32px #fbbf2488' }}
                onClick={dismissTransition}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                PLAY
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
