import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'

// Dollar thresholds for milestone skips on click
const MILESTONES = [10, 20, 50, 100, 200, 300, 400, 500, 1000]

function useCountUp(target, onDone) {
  const [display, setDisplay] = useState(0)
  const displayRef  = useRef(0)   // live value readable by click handler
  const rafRef      = useRef(null)
  const fromRef     = useRef(0)
  const targetRef   = useRef(target)
  const startRef    = useRef(null)

  const startCount = (from, to, onReach) => {
    cancelAnimationFrame(rafRef.current)
    fromRef.current  = from
    targetRef.current = to
    startRef.current  = performance.now()
    const range = to - from
    const duration = Math.max(600, Math.min(2800, range * 180))

    const tick = (now) => {
      const t = Math.min((now - startRef.current) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)   // ease-out cubic
      const value = from + eased * range
      displayRef.current = value
      setDisplay(value)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        displayRef.current = to
        setDisplay(to)
        onReach?.()
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  // Start counting to final on mount
  useEffect(() => {
    startCount(0, target, onDone)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target])

  const skip = () => {
    const current = displayRef.current
    const nextMs  = MILESTONES.find(m => m > current && m < target)
    if (nextMs) {
      cancelAnimationFrame(rafRef.current)
      displayRef.current = nextMs
      setDisplay(nextMs)
      startCount(nextMs, target, onDone)
    } else {
      cancelAnimationFrame(rafRef.current)
      displayRef.current = target
      setDisplay(target)
      onDone?.()
    }
  }

  return { display, skip }
}

const BASE = import.meta.env.BASE_URL
const WIN_BACKGROUNDS = [
  `${BASE}assets/win_background_1.jpeg`,
  `${BASE}assets/win_background_2.jpeg`,
]

function BigWinScene({ winAmount, onDismiss }) {
  const [done, setDone] = useState(false)
  const { display, skip } = useCountUp(winAmount, () => setDone(true))

  // Randomly cycle between win backgrounds every 600 ms
  const [bgIndex, setBgIndex] = useState(() => Math.floor(Math.random() * WIN_BACKGROUNDS.length))
  useEffect(() => {
    const t = setInterval(
      () => setBgIndex(i => (i + 1) % WIN_BACKGROUNDS.length),
      600
    )
    return () => clearInterval(t)
  }, [])

  // Auto-dismiss 2 s after count finishes
  useEffect(() => {
    if (!done) return
    const t = setTimeout(onDismiss, 2000)
    return () => clearTimeout(t)
  }, [done, onDismiss])

  const handleClick = () => {
    if (done) { onDismiss(); return }
    skip()
  }

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center cursor-pointer"
      style={{
        backgroundImage:    `url(${WIN_BACKGROUNDS[bgIndex]})`,
        backgroundSize:     'cover',
        backgroundPosition: 'center',
        backgroundColor:    '#0a0500',   // fallback
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleClick}
    >
      {/* Sparkle ring */}
      <motion.div
        className="absolute rounded-full border-4 border-yellow-400/30"
        style={{ width: 340, height: 340 }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.4 }}
      />

      {/* BIG WIN label */}
      <motion.div
        className="text-6xl font-black tracking-tight mb-2 uppercase"
        style={{ color: '#facc15', textShadow: '0 0 40px #facc15, 0 0 80px #f97316' }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 0.9 }}
      >
        BIG WIN!
      </motion.div>

      {/* Count-up amount */}
      <motion.div
        className="text-5xl font-black"
        style={{ color: '#fff', textShadow: '0 0 20px #facc15aa' }}
        animate={done ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.4 }}
      >
        ${display.toFixed(2)}
      </motion.div>

      {/* Prompt */}
      <motion.p
        className="mt-8 text-white/50 text-sm tracking-widest"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        {done ? 'CLICK TO COLLECT' : 'CLICK TO SKIP'}
      </motion.p>
    </motion.div>
  )
}

export default function BigWinDisplay() {
  const { winAmount, showBigWin, closeBigWin } = useGameStore()

  return (
    <AnimatePresence>
      {showBigWin && (
        <BigWinScene key={winAmount} winAmount={winAmount} onDismiss={closeBigWin} />
      )}
    </AnimatePresence>
  )
}
