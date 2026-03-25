import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { GOLDEN_WILD } from '../data/symbols'
import Symbol from './Symbol'
import EnhancerCell from './EnhancerCell'
import RazorCutEffect from './RazorCutEffect'

// Bonus/wild symbols are immune to razor-split visual doubling
const SPLIT_IMMUNE = id => id === 'bonus' || id === 'goldenWild'

export default function Reel({ reelIndex, symbols }) {
  const {
    spinPhase, reelSymbols, enhancerCells, winningCells,
    alarmMode, razorCutReel, splitReels,
    jumpingWilds, bonusMode,
  } = useGameStore()

  const myLanded   = reelSymbols ? reelSymbols[reelIndex] : null
  const isSpinning = spinPhase === 'spinning' && myLanded === null
  const ec         = enhancerCells[reelIndex] || { top: null, bottom: null }
  const isBeingCut = razorCutReel === reelIndex
  const isSplit    = splitReels.includes(reelIndex)

  // Snap/bounce when this reel lands
  const prevLandedRef = useRef(myLanded)
  const [justLanded, setJustLanded] = useState(false)
  useEffect(() => {
    if (myLanded !== null && prevLandedRef.current === null) {
      setJustLanded(true)
      const t = setTimeout(() => setJustLanded(false), 380)
      return () => clearTimeout(t)
    }
    prevLandedRef.current = myLanded
  }, [myLanded])

  const displaySymbols = myLanded ?? symbols

  const animateValue = isSpinning
    ? { opacity: 0.65 }
    : justLanded
      ? { y: [-16, 4, 0], opacity: 1 }
      : { y: 0, opacity: 1 }

  const transitionValue = isSpinning
    ? { duration: 0.12 }
    : justLanded
      ? { duration: 0.3, ease: [0.22, 1.8, 0.36, 1] }
      : { duration: 0 }

  // Build cell list.
  // In bonus mode, JWs are overlays from jumpingWilds — the underlying grid symbol
  // is replaced for display purposes; split-immunity is checked against display symbol.
  const cells = isSplit
    ? displaySymbols.flatMap((rawSym, rowIndex) => {
        const jw        = bonusMode ? jumpingWilds.find(w => w.reelIndex === reelIndex && w.rowIndex === rowIndex) : null
        const symbol    = jw ? { ...GOLDEN_WILD } : rawSym
        const jwMult    = jw?.multiplier ?? null
        if (SPLIT_IMMUNE(symbol.id)) {
          return [{ symbol, rowIndex, clone: false, key: `${rowIndex}-a`, flex: 2, jwMult }]
        }
        return [
          { symbol, rowIndex, clone: false, key: `${rowIndex}-a`, flex: 1, jwMult },
          { symbol, rowIndex, clone: true,  key: `${rowIndex}-b`, flex: 1, jwMult: null },
        ]
      })
    : displaySymbols.map((rawSym, rowIndex) => {
        const jw     = bonusMode ? jumpingWilds.find(w => w.reelIndex === reelIndex && w.rowIndex === rowIndex) : null
        const symbol = jw ? { ...GOLDEN_WILD } : rawSym
        const jwMult = jw?.multiplier ?? null
        return { symbol, rowIndex, clone: false, key: `${rowIndex}-a`, flex: 1, jwMult }
      })

  return (
    <div className="flex flex-col gap-1">
      {/* Top Enhancer Cell */}
      <EnhancerCell
        symbol={ec.top}
        isWinning={winningCells.has(`${reelIndex}-ec-top`)}
      />

      {/* Reel symbols */}
      <div className="relative" style={{ height: 'min(370px, calc((100vw - 96px) / 5 * 3 + 8px))' }}>
        <motion.div
          className="flex flex-col gap-1 h-full"
          animate={animateValue}
          transition={transitionValue}
        >
          {cells.map(({ symbol, rowIndex, clone, key, flex, jwMult }) => {
            // jwMultiplier shown only when > 1 (shows ×N badge)
            const jwMultiplier = jwMult > 1 ? jwMult : null

            return (
              <motion.div
                key={key}
                layout
                className="min-h-0"
                style={{ flex, ...(clone ? { transformOrigin: 'top' } : {}) }}
                initial={clone ? { scaleY: 0, opacity: 0 } : false}
                animate={clone ? { scaleY: 1, opacity: 1 } : undefined}
                transition={
                  clone
                    ? { duration: 0.2, ease: 'easeOut' }
                    : { layout: { type: 'tween', duration: 0.18 } }
                }
              >
                <Symbol
                  symbol={symbol}
                  isWinning={!isSpinning && winningCells.has(`${reelIndex}-${rowIndex}`)}
                  alarmMode={alarmMode}
                  jwMultiplier={jwMultiplier}
                />
              </motion.div>
            )
          })}
        </motion.div>

        {/* Razor cut effect */}
        <AnimatePresence>
          {isBeingCut && <RazorCutEffect key="razor" />}
        </AnimatePresence>
      </div>

      {/* Bottom Enhancer Cell */}
      <EnhancerCell
        symbol={ec.bottom}
        isWinning={winningCells.has(`${reelIndex}-ec-bottom`)}
      />
    </div>
  )
}
