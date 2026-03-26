import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const A = `${import.meta.env.BASE_URL}assets`

const SYMBOL_IMAGES = {
  beefyDick:   `${A}/beefy_dick.jpeg`,
  locoLuis:    `${A}/loco_luis.jpeg`,
  heinrich3rd: `${A}/heinrich_3rd.jpeg`,
  bikerCarl:   `${A}/biker_carl.jpeg`,
  crazyJoe:    `${A}/crazy_joe.jpeg`,
  goldenWild:  `${A}/wild_ec.jpeg`,       // clean WILD badge (no "SPLIT" text)
  bonus:       `${A}/bonus_scatter.jpg`,
  soap:        `${A}/soap.jpeg`,
  lighter:     `${A}/lighter.jpeg`,
  shank:       `${A}/shank.jpeg`,
  handcuffs:   `${A}/handcuffs.jpeg`,
  toiletPaper: `${A}/toilet_paper.jpeg`,
}

const JW_IMAGE = `${A}/jumping_wild_bonus.jpeg`

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

const PREMIUM_IDS = new Set(['beefyDick', 'locoLuis', 'heinrich3rd', 'bikerCarl', 'crazyJoe'])

export default function Symbol({ symbol, isWinning, alarmMode, jwMultiplier, isDark = false }) {
  const isBonus       = symbol.id === 'bonus'
  const isWild        = symbol.id === 'goldenWild'
  const isJW          = isWild && jwMultiplier != null
  const isPremiumChar = PREMIUM_IDS.has(symbol.id)

  // isJW → use jumping-wild badge; otherwise normal image
  const imageUrl = isJW ? JW_IMAGE : (SYMBOL_IMAGES[symbol.id] ?? null)
  const imgStyle = isJW
    ? { objectFit: 'cover', objectPosition: 'center' }
    : (SYMBOL_IMG_STYLE[symbol.id] ?? { objectFit: 'cover', objectPosition: 'center' })

  // Wild entrance pop
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

  // JW multiplier boost pulse
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

  // ── Styles ─────────────────────────────────────────────────────────────
  const bgStyle = isWild
    ? { background: 'linear-gradient(135deg, #92400e 0%, #d97706 35%, #fbbf24 60%, #d97706 100%)' }
    : { backgroundColor: symbol.color }

  const borderStyle = isWild
    ? multiplierJustBoosted ? '2px solid #ef4444' : '2px solid #fef08a'
    : isWinning     ? '2px solid #facc15'
    : isBonus       ? '2px solid #f59e0b'
    : isPremiumChar ? `2px solid ${symbol.color}`
    :                 '1px solid rgba(255,255,255,0.18)'

  const shadowStyle = multiplierJustBoosted
    ? '0 0 28px #ef4444cc, inset 0 0 12px rgba(239,68,68,0.3)'
    : isWild
      ? '0 0 18px #fbbf24bb, inset 0 0 8px rgba(255,220,80,0.3)'
      : isWinning     ? '0 0 14px #facc15cc'
      : isPremiumChar ? `0 0 8px 2px ${symbol.color}66`
      : undefined

  // ── Animations ─────────────────────────────────────────────────────────
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
        fontSize:  '10px',
        color:     isWild ? '#000' : '#fff',
      }}
      animate={animateProps}
      transition={transitionProps}
    >
      {/* Text fallback (zIndex 1) — image covers it at zIndex 3 */}
      {isWild ? (
        <>
          <span style={{ position: 'relative', zIndex: 1, fontSize: '16px', lineHeight: 1 }}>★</span>
          <span style={{ position: 'relative', zIndex: 1 }}>WILD</span>
        </>
      ) : (
        <span style={{ position: 'relative', zIndex: 1 }}>{symbol.name}</span>
      )}

      {/* Symbol image — zIndex 3, covers text fallback */}
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

      {/* Dark overlay — covers ALL cells (including wilds) during spin.
          JWs stay bright because Reel.jsx passes isDark=false when isJW. */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 6,
          backgroundColor: 'rgba(0,0,0,0.88)',
          borderRadius: '5px',
          opacity: isDark ? 1 : 0,
          transition: 'opacity 0.25s ease',
          pointerEvents: 'none',
        }}
      />

      {/* JW multiplier badge — above everything at zIndex 10 */}
      {isJW && (
        <motion.span
          key={jwMultiplier}
          style={{
            position:        'absolute', bottom: '3px', right: '3px',
            zIndex:          10,
            fontSize:        '11px', fontWeight: 900, lineHeight: 1.4,
            color:           multiplierJustBoosted ? '#fff' : '#ef4444',
            backgroundColor: multiplierJustBoosted ? '#dc2626' : 'rgba(0,0,0,0.8)',
            borderRadius:    '3px', padding: '0 4px',
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
