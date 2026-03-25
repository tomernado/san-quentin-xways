import { PAYTABLE, SYMBOL_KEYS } from '../data/symbols'

const WILD_ID  = 'goldenWild'
const BONUS_ID = 'bonus'
const RAZOR_ID = 'razorSplit'

const SCORABLE = SYMBOL_KEYS.filter(id => id !== BONUS_ID)

/**
 * Returns the Razor Split multiplier for a reel's Enhancer Cells.
 *   0 razors → ×1  |  1 razor → ×2  |  2 razors → ×4
 */
function razorMult(ec) {
  if (!ec) return 1
  const n = (ec.top?.id === RAZOR_ID ? 1 : 0) + (ec.bottom?.id === RAZOR_ID ? 1 : 0)
  return n === 2 ? 4 : n === 1 ? 2 : 1
}

/**
 * 243 Ways to Win — with Golden Wild and Razor Split / Enhancer Cell support.
 *
 * Grid: column-major — grid[reelIndex][rowIndex]
 * enhancerCells: [{ top: symbol|null, bottom: symbol|null }, …] (one per reel)
 *
 * Per reel, effective count for a symbol =
 *   (regular matches + EC premium matches + wild count) × razorMult
 */
export function calculateWins(grid, bet, enhancerCells = []) {
  const wins        = []
  const winningCells = new Set()

  for (const id of SCORABLE) {
    const data = PAYTABLE[id]

    const effectiveCounts = grid.map((reel, ri) => {
      const ec = enhancerCells[ri] || { top: null, bottom: null }

      // Count the symbol itself (regular + EC premium slots)
      const symCount =
        reel.filter(s => s.id === id).length +
        (ec.top?.id === id    ? 1 : 0) +
        (ec.bottom?.id === id ? 1 : 0)

      // Count wilds — a wild with jwMult M contributes M symbols
      const wildCount =
        reel.reduce((sum, s) => s.id === WILD_ID ? sum + (s.jwMult || 1) : sum, 0) +
        (ec.top?.id === WILD_ID    ? (ec.top.jwMult    || 1) : 0) +
        (ec.bottom?.id === WILD_ID ? (ec.bottom.jwMult || 1) : 0)

      // Razor Split doubles/quadruples the effective count
      return (symCount + wildCount) * razorMult(ec)
    })

    // Chain: consecutive reels from reel 0 where effective count > 0
    let chainLength = 0
    for (let i = 0; i < effectiveCounts.length; i++) {
      if (effectiveCounts[i] === 0) break
      chainLength++
    }
    if (chainLength < 3) continue

    // Ways = product of effective counts across the chain
    let ways = 1
    for (let i = 0; i < chainLength; i++) ways *= effectiveCounts[i]

    const multiplier = data.payouts[chainLength]
    if (!multiplier) continue

    const winAmount = +(ways * multiplier * bet).toFixed(2)

    // Mark winning cells: regular grid cells + EC cells that contributed
    for (let ri = 0; ri < chainLength; ri++) {
      const ec = enhancerCells[ri] || { top: null, bottom: null }
      grid[ri].forEach((sym, rowIdx) => {
        if (sym.id === id || sym.id === WILD_ID)
          winningCells.add(`${ri}-${rowIdx}`)
      })
      if (ec.top?.id    === id || ec.top?.id    === WILD_ID) winningCells.add(`${ri}-ec-top`)
      if (ec.bottom?.id === id || ec.bottom?.id === WILD_ID) winningCells.add(`${ri}-ec-bottom`)
    }

    wins.push({ id, name: data.name, chainLength, ways, multiplier, winAmount })
  }

  const totalWin = +(wins.reduce((sum, w) => sum + w.winAmount, 0)).toFixed(2)
  return { wins, totalWin, winningCells }
}
