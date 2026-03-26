import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const A = `${import.meta.env.BASE_URL}assets`

const SYMBOL_IMAGES = {
  beefyDick:   `${A}/beefy_dick.jpeg`,
  locoLuis:    `${A}/loco_luis.jpeg`,
  heinrich3rd: `${A}/heinrich_3rd.jpeg`,
  bikerCarl:   `${A}/biker_carl.jpeg`,
  crazyJoe:    `${A}/crazy_joe.jpeg`,
  goldenWild:  `${A}/wild_ec.jpeg`,
  bonus:       `${A}/Bonus2.jpeg`,
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
  bonus:       { objectFit: 'cover', objectPosition: 'center center' },
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
    : isWinning     ? '3px solid #facc15'
    : isBonus       ? '2px solid #f59e0b'
    : isPremiumChar ? `2px solid ${symbol.color}`
    :                 '1px solid rgba(255,255,255,0.18)'

  const shadowStyle = multiplierJustBoosted
    ? '0 0 28px #ef4444cc, inset 0 0 12px rgba(239,68,68,0.3)'
    : isWild
      ? '0 0 18px #fbbf24bb, inset 0 0 8px rgba(255,220,80,0.3)'
      : isWinning
        ? '0 0 22px #facc15ff, 0 0 44px #f97316bb, inset 0 0 12px rgba(250,204,21,0.25)'
        : isPremiumChar ? `0 0 8px 2px ${symbol.color}66`
        : undefined

  // ── Animations ─────────────────────────────────────────────────────────
  const animateProps = (() => {
    if (multiplierJustBoosted) return { scale: [1, 1.18, 0.96, 1.05, 1] }
    if (isNewWild)             return { scale: [0.5, 1.2, 1], opacity: [0, 1, 1] }
    if (isWild && isWinning)   return { scale: [1, 1.07, 1], boxShadow: ['0 0 10px #fbbf24', '0 0 28px #fbbf24', '0 0 10px #fbbf24'] }
    if (isWild)                return { boxShadow: ['0 0 8px #fbbf2466', '0 0 20px #fbbf24cc', '0 0 8px #fbbf2466'] }
    if (isBonus && alarmMode)  return { scale: [1, 1.12, 1], opacity: [1, 0.5, 1] }
    if (isWinning)             return { scale: [1, 1.09, 1], boxShadow: ['0 0 14px #facc15', '0 0 38px #facc15', '0 0 14px #facc15'] }
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
      {/* Text fallback (zIndex 1) */}
      {isWild ? (
        <>
          <span style={{ position: 'relative', zIndex: 1, fontSize: '16px', lineHeight: 1 }}>★</span>
          <span style={{ position: 'relative', zIndex: 1 }}>WILD</span>
        </>
      ) : (
        <span style={{ position: 'relative', zIndex: 1 }}>{symbol.name}</span>
      )}

      {/* Symbol image — zIndex 3 */}
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

      {/* Premium colour tint — radiates border colour into the image (zIndex 4) */}
      {isPremiumChar && (
        <div
          style={{
            position: 'absolute', inset: 0,
            zIndex: 4,
            borderRadius: '5px',
            pointerEvents: 'none',
            background: `radial-gradient(ellipse at 50% 35%, ${symbol.color}18 0%, ${symbol.color}38 60%, ${symbol.color}60 100%)`,
          }}
        />
      )}

      {/* Close symbol placeholder — shown during spin (isDark), fades out on land */}
      <img
        src={`${A}/CloseSimbol.jpeg`}
        alt=""
        style={{
          position:   'absolute', inset: 0,
          width:      '100%', height: '100%',
          objectFit:  'cover', objectPosition: 'center',
          pointerEvents: 'none',
          zIndex:     6,
          borderRadius: '5px',
          opacity:    isDark ? 1 : 0,
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* JW multiplier badge — centered, golden, above everything */}
      {isJW && (
        <motion.div
          key={jwMultiplier}
          style={{
            position:  'absolute',
            bottom:    '6px',
            left:      '50%',
            transform: 'translateX(-50%)',
            zIndex:    10,
            background: multiplierJustBoosted
              ? 'linear-gradient(135deg, #b91c1c, #ef4444, #fca5a5)'
              : 'linear-gradient(135deg, #78350f, #b45309, #fbbf24, #b45309)',
            borderRadius: '6px',
            padding:    '3px 9px',
            border:     multiplierJustBoosted ? '1.5px solid #fca5a5' : '1.5px solid #fef08a',
            boxShadow:  multiplierJustBoosted
              ? '0 0 16px #ef4444cc, 0 2px 4px rgba(0,0,0,0.6)'
              : '0 0 14px #fbbf24bb, 0 2px 4px rgba(0,0,0,0.6)',
            whiteSpace: 'nowrap',
          }}
          initial={{ scale: 1.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25, ease: 'backOut' }}
        >
          <span style={{
            fontSize:   '13px',
            fontWeight: 900,
            color:      multiplierJustBoosted ? '#fff' : '#000',
            letterSpacing: '0.02em',
          }}>
            ×{jwMultiplier}
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}
