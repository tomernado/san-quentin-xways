import { motion, AnimatePresence } from 'framer-motion'

const A = `${import.meta.env.BASE_URL}assets`

const EC_IMAGES = {
  goldenWild:  `${A}/wild_ec.jpeg`,         // "WILD" shield badge for EC slots
  razorSplit:  `${A}/cutup_or_down.jpeg`,   // teal razor blade for EC slots
  beefyDick:   `${A}/beefy_dick.jpeg`,
  locoLuis:    `${A}/loco_luis.jpeg`,
  heinrich3rd: `${A}/heinrich_3rd.jpeg`,
  bikerCarl:   `${A}/biker_carl.jpeg`,
  crazyJoe:    `${A}/crazy_joe.jpeg`,
}

// Per-symbol crop settings for EC images
const EC_IMG_STYLE = {
  beefyDick:   { objectFit: 'cover', objectPosition: 'center 15%' },
  locoLuis:    { objectFit: 'cover', objectPosition: 'center 15%' },
  heinrich3rd: { objectFit: 'cover', objectPosition: 'center 15%' },
  bikerCarl:   { objectFit: 'cover', objectPosition: 'center 15%' },
  crazyJoe:    { objectFit: 'cover', objectPosition: 'center 15%' },
  goldenWild:  { objectFit: 'cover', objectPosition: 'center' },
  razorSplit:  { objectFit: 'cover', objectPosition: 'center' },
}

const RAZOR_COLOR  = '#0f172a'
const RAZOR_BORDER = '#dc2626'

export default function EnhancerCell({ symbol, isWinning }) {
  const isOpen      = symbol !== null
  const isRazor     = symbol?.id === 'razorSplit'
  const isWild      = symbol?.id === 'goldenWild'
  const isSpinCount = symbol?.id === 'spinCount'
  const imgSrc      = symbol ? EC_IMAGES[symbol.id] ?? null : null

  return (
    <div className="h-8 w-full">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* Locked EC — shows prison-bars image as background */
          <motion.div
            key="locked"
            className="h-full rounded overflow-hidden relative"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <img
              src={`${A}/close_tab.jpeg`}
              alt=""
              onError={e => { e.currentTarget.style.display = 'none' }}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center',
                pointerEvents: 'none',
              }}
            />
          </motion.div>

        ) : isSpinCount ? (
          <motion.div
            key="spincount"
            className="h-full rounded flex items-center justify-center font-black text-sm select-none gap-1"
            style={{
              background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
              border:     '2px solid #3b82f6',
              color:      '#93c5fd',
              boxShadow:  '0 0 10px #3b82f666',
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          >
            <span style={{ color: '#fff', fontSize: '15px' }}>{symbol.name}</span>
            <span style={{ fontSize: '9px', color: '#93c5fd' }}>SPINS</span>
          </motion.div>

        ) : (
          /* Standard EC — razor, wild, or premium character */
          <motion.div
            key={`open-${symbol.id}`}
            className="h-full rounded flex items-center justify-center font-bold text-xs select-none overflow-hidden relative"
            style={{
              backgroundColor: isRazor ? RAZOR_COLOR : symbol.color ?? '#1a1a1a',
              border: isWinning
                ? '2px solid #facc15'
                : isRazor
                  ? `2px solid ${RAZOR_BORDER}`
                  : `2px solid ${symbol.color}`,
              color:     isRazor ? '#ef4444' : isWild ? '#000' : '#fff',
              boxShadow: isRazor
                ? '0 0 8px #ef4444aa'
                : isWinning ? '0 0 8px #facc1566'
                : `0 0 6px ${symbol.color}88`,
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={
              isRazor
                ? { scaleY: 1, opacity: 1, x: [0, -2, 2, -1, 0] }
                : { scaleY: 1, opacity: 1 }
            }
            transition={
              isRazor
                ? { duration: 0.35, x: { delay: 0.35, duration: 0.25 } }
                : { type: 'spring', stiffness: 600, damping: 28 }
            }
          >
            {/* Fallback text at z-index 1 — image covers it at z-index 3 */}
            <span style={{ position: 'relative', zIndex: 1, fontSize: '9px' }}>
              {isRazor ? '✂ RAZOR' : symbol.name}
            </span>

            {/* Image overlay */}
            {imgSrc && (
              <img
                src={imgSrc}
                alt=""
                onError={e => { e.currentTarget.style.display = 'none' }}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  pointerEvents: 'none',
                  zIndex: 3,
                  ...EC_IMG_STYLE[symbol.id],
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
