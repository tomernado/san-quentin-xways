import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { GOLDEN_WILD } from '../data/symbols'
import Symbol from './Symbol'
import EnhancerCell from './EnhancerCell'
import RazorCutEffect from './RazorCutEffect'

const SPLIT_IMMUNE = id => id === 'bonus' || id === 'goldenWild'

export default function Reel({ reelIndex, symbols }) {
  const {
    spinPhase, reelSymbols, enhancerCells, winningCells,
    alarmMode, razorCutReel, splitReels,
    jumpingWilds, bonusMode,
  } = useGameStore()

  const myLanded   = reelSymbols ? reelSymbols[reelIndex] : null
  const ec         = enhancerCells[reelIndex] || { top: null, bottom: null }
  const isBeingCut = razorCutReel === reelIndex
  const isSplit    = splitReels.includes(reelIndex)

  // Cells are dark until this reel has landed
  const isDark = spinPhase === 'bonusPhase' || (spinPhase === 'spinning' && myLanded === null)

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

  // No whole-reel opacity animation — cell-level dark overlay in Symbol handles darkness.
  const animateValue = justLanded
    ? { y: [-16, 4, 0], opacity: 1 }
    : { y: 0, opacity: 1 }

  const transitionValue = justLanded
    ? { duration: 0.3, ease: [0.22, 1.8, 0.36, 1] }
    : { duration: 0 }

  // Build cell list — isJW marks JW overlay cells (exempt from dark overlay)
  const cells = isSplit
    ? displaySymbols.flatMap((rawSym, rowIndex) => {
        const jw     = bonusMode ? jumpingWilds.find(w => w.reelIndex === reelIndex && w.rowIndex === rowIndex) : null
        const symbol = jw ? { ...GOLDEN_WILD } : rawSym
        const jwMult = jw?.multiplier ?? null
        const isJW   = !!jw
        if (SPLIT_IMMUNE(symbol.id)) {
          return [{ symbol, rowIndex, clone: false, key: `${rowIndex}-a`, flex: 2, jwMult, isJW }]
        }
        return [
          { symbol, rowIndex, clone: false, key: `${rowIndex}-a`, flex: 1, jwMult, isJW },
          { symbol, rowIndex, clone: true,  key: `${rowIndex}-b`, flex: 1, jwMult: null, isJW: false },
        ]
      })
    : displaySymbols.map((rawSym, rowIndex) => {
        const jw     = bonusMode ? jumpingWilds.find(w => w.reelIndex === reelIndex && w.rowIndex === rowIndex) : null
        const symbol = jw ? { ...GOLDEN_WILD } : rawSym
        const jwMult = jw?.multiplier ?? null
        const isJW   = !!jw
        return { symbol, rowIndex, clone: false, key: `${rowIndex}-a`, flex: 1, jwMult, isJW }
      })

  return (
    <div className="flex flex-col gap-1">
      <EnhancerCell
        symbol={ec.top}
        isWinning={winningCells.has(`${reelIndex}-ec-top`)}
      />

      <div className="relative" style={{ height: 'min(370px, calc((100vw - 48px) / 5 * 3 + 8px))' }}>
        <motion.div
          className="flex flex-col gap-1 h-full"
          animate={animateValue}
          transition={transitionValue}
        >
          {cells.map(({ symbol, rowIndex, clone, key, flex, jwMult, isJW }) => {
            const jwMultiplier = jwMult ?? null
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
                  isWinning={!isDark && winningCells.has(`${reelIndex}-${rowIndex}`)}
                  alarmMode={alarmMode}
                  jwMultiplier={jwMultiplier}
                  isDark={isDark && !isJW}
                />
              </motion.div>
            )
          })}
        </motion.div>

        <AnimatePresence>
          {isBeingCut && <RazorCutEffect key="razor" />}
        </AnimatePresence>
      </div>

      <EnhancerCell
        symbol={ec.bottom}
        isWinning={winningCells.has(`${reelIndex}-ec-bottom`)}
      />
    </div>
  )
}
