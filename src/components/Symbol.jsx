import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// ── Asset paths ──────────────────────────────────────────────────────────────
const A = `${import.meta.env.BASE_URL}assets`

// Main-grid images (keyed by symbol.id)
const SYMBOL_IMAGES = {
  beefyDick:   `${A}/beefy_dick.jpeg`,
  locoLuis:    `${A}/loco_luis.jpeg`,
  heinrich3rd: `${A}/heinrich_3rd.jpeg`,
  bikerCarl:   `${A}/biker_carl.jpeg`,
  crazyJoe:    `${A}/crazy_joe.jpeg`,
  goldenWild:  `${A}/wild_split.jpeg`,      // base-game SPLIT WILD badge
  bonus:       `${A}/bonus_scatter.jpg`,
  soap:        `${A}/soap.jpeg`,
  lighter:     `${A}/lighter.jpeg`,
  shank:       `${A}/shank.jpeg`,
  handcuffs:   `${A}/handcuffs.jpeg`,
  toiletPaper: `${A}/toilet_paper.jpeg`,
}

// Jumping wild (bonus mode) uses a distinct badge image
const JW_IMAGE = `${A}/jumping_wild_bonus.jpeg`

// Per-symbol crop settings — character faces fill cell top-center;
// items and specials fill full cell centered.
const SYMBOL_IMG_STYLE = {
  beefyDick:   { objectFit: 'cover', objectPosition: 'center 15%' },
  locoLuis:    { objectFit: 'cover', objectPosition: 'center 15%' },
  heinrich3rd: { objectFit: 'cover', objectPosition: 'center 15%' },
  bikerCarl:   { objectFit: 'cover', objectPosition: 'center 15%' },
  crazyJoe:    { objectFit: 'cover', objectPosition: 'center 15%' },
  goldenWild:  { objectFit: 'cover', objectPosition: 'center' },
  bonus:       { objectFit: 'cover', objectPosition: 'center top' },
  soap:        { objectFit: 'cover', objectPosition: 'center' },
  lighter:     { objectFit: 'cover', objectPosition: 'center' },
  shank:       { objectFit: 'cover', objectPosition: 'center' },
  handcuffs:   { objectFit: 'cover', objectPosition: 'center' },
  toiletPaper: { objectFit: 'cover', objectPosition: 'center' },
}

// Premium character IDs — get a distinct colored glow border
const PREMIUM_IDS = new Set(['beefyDick', 'locoLuis', 'heinrich3rd', 'bikerCarl', 'crazyJoe'])

// ── Component ────────────────────────────────────────────────────────────────

export default function Symbol({ symbol, isWinning, alarmMode, jwMultiplier }) {
  const isBonus       = symbol.id === 'bonus'
  const isWild        = symbol.id === 'goldenWild'
  const isJW          = isWild && jwMultiplier != null
  const isPremiumChar = PREMIUM_IDS.has(symbol.id)

  const imageUrl = isJW ? JW_IMAGE : (SYMBOL_IMAGES[symbol.id] ?? null)
  const imgStyle = isJW
    ? { objectFit: 'cover', objectPosition: 'center' }
    : (SYMBOL_IMG_STYLE[symbol.id] ?? { objectFit: 'cover', objectPosition: 'center' })

  // Detect this cell just became a wild (entrance pop)
  const prevIdRef  = useRef(symbol.id)
  const [isNewWild, setIsNewWild] = useState(false)
  useEffect(() => {
    if (symbol.id === 'goldenWild' && prevIdRef.current !== 'goldenWild') {
      setIsNewWild(true)
      const t = setTimeout(() => setIsNewWild(false), 700)
      return () => clearTimeout(t)
    }
    prevIdRef.current = symbol.id
  }, [symbol.id])

  // Detect JW multiplier boost — triggers red pulse
  const prevMultRef = useRef(jwMultiplier)
  const [multiplierJustBoosted, setMultiplierJustBoosted] = useState(false)
  useEffect(() => {
    const prev = prevMultRef.current
    if (jwMultiplier != null && prev != null && jwMultiplier > prev) {
      setMultiplierJustBoosted(true)
      const t = setTimeout(() => setMultiplierJustBoosted(false), 700)
      return () => clearTimeout(t)
    }
    prevMultRef.current = jwMultiplier
  }, [jwMultiplier])

  // ── Styles ──────────────────────────────────────────────────────────────────
  const bgStyle = isWild
    ? { background: 'linear-gradient(135deg, #92400e 0%, #d97706 35%, #fbbf24 60%, #d97706 100%)' }
    : { backgroundColor: symbol.color }

  // Premium characters get a thick, bright colored border; specials get their own treatment
  const borderStyle = isWild
    ? multiplierJustBoosted ? '2px solid #ef4444' : '2px solid #fef08a'
    : isWinning     ? '2px solid #facc15'
    : isBonus       ? '2px solid #f59e0b'
    : isPremiumChar ? `2px solid ${symbol.color}`
    :                 '1px solid rgba(255,255,255,0.2)'

  const shadowStyle = multiplierJustBoosted
    ? '0 0 28px #ef4444cc, inset 0 0 12px rgba(239,68,68,0.3)'
    : isWild
      ? '0 0 18px #fbbf24bb, inset 0 0 8px rgba(255,220,80,0.3)'
      : isWinning     ? '0 0 14px #facc15cc'
      : isPremiumChar ? `0 0 10px 2px ${symbol.color}88`
      : undefined

  // ── Animations ──────────────────────────────────────────────────────────────
  const animateProps = (() => {
    if (multiplierJustBoosted) return { scale: [1, 1.18, 0.96, 1.05, 1] }
    if (isNewWild)             return { scale: [0.5, 1.2, 1], opacity: [0, 1, 1] }
    if (isWild && isWinning)   return { scale: [1, 1.07, 1], boxShadow: ['0 0 10px #fbbf24', '0 0 28px #fbbf24', '0 0 10px #fbbf24'] }
    if (isWild)                return { boxShadow: ['0 0 8px #fbbf2466', '0 0 20px #fbbf24cc', '0 0 8px #fbbf2466'] }
    if (isBonus && alarmMode)  return { scale: [1, 1.12, 1], opacity: [1, 0.5, 1] }
    if (isWinning)             return { scale: [1, 1.06, 1] }
    return {}
  })()

  const transitionProps = (() => {
    if (multiplierJustBoosted) return { duration: 0.45, ease: 'easeOut' }
    if (isNewWild)             return { duration: 0.35, ease: 'backOut' }
    if (isWild)                return { repeat: Infinity, duration: 1.2, ease: 'easeInOut' }
    if (isBonus && alarmMode)  return { repeat: Infinity, duration: 0.4, ease: 'easeInOut' }
    if (isWinning)             return { repeat: Infinity, duration: 0.65, ease: 'easeInOut' }
    return {}
  })()

  return (
    <motion.div
      className="w-full h-full rounded-md flex flex-col items-center justify-center font-black text-center select-none relative overflow-hidden"
      style={{
        ...bgStyle,
        border:    borderStyle,
        boxShadow: shadowStyle,
        fontSize:  isWild ? '13px' : isBonus ? '11px' : '10px',
        color:     isWild ? '#000' : '#fff',
      }}
      animate={animateProps}
      transition={transitionProps}
    >
      {/* Fallback text at z-index 1 — image covers it at z-index 3 */}
      {isWild ? (
        <>
          <span style={{ position: 'relative', zIndex: 1, fontSize: '18px', lineHeight: 1 }}>★</span>
          <span style={{ position: 'relative', zIndex: 1 }}>WILD</span>
        </>
      ) : (
        <span style={{ position: 'relative', zIndex: 1 }}>{symbol.name}</span>
      )}

      {/* Symbol image — covers fallback at z-index 3 */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          onError={e => { e.currentTarget.style.display = 'none' }}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            pointerEvents: 'none',
            zIndex: 3,
            ...imgStyle,
          }}
        />
      )}

      {/* JW multiplier badge — always above image at z-index 10 */}
      {isJW && (
        <motion.span
          key={jwMultiplier}
          style={{
            position:        'absolute', bottom: '4px', right: '4px',
            zIndex:          10,
            fontSize:        '13px', fontWeight: 900, lineHeight: 1.4,
            color:           multiplierJustBoosted ? '#fff' : '#ef4444',
            backgroundColor: multiplierJustBoosted ? '#dc2626' : 'rgba(0,0,0,0.75)',
            borderRadius:    '4px', padding: '0 5px',
            border:          multiplierJustBoosted ? '1px solid #fca5a5' : '1px solid #ef444466',
          }}
          initial={{ scale: 1.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25, ease: 'backOut' }}
        >
          ×{jwMultiplier}
        </motion.span>
      )}
    </motion.div>
  )
}
