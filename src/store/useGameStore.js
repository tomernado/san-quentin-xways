import { create } from 'zustand'
import { generateReel, generateBonusReel, generateECSymbol, generateECPair, generateBonusSpinEC, GOLDEN_WILD } from '../data/symbols'
import { calculateWins } from '../logic/calculateWins'

const REELS = 5
const ROWS  = 3
const BIG_WIN_MULTIPLIER  = 15
const RETRIGGER_SPINS     = 3

const makeGrid     = () => Array.from({ length: REELS }, () => generateReel(ROWS))
const makeEmptyECs = () => Array.from({ length: REELS }, () => ({ top: null, bottom: null }))

const REEL_STOP_DELAY      = 300
const ALARM_REEL_DELAY     = 850
const RAZOR_BLADE_DURATION = 280
const RAZOR_CUT_DURATION   = 500
const RAZOR_GAP            = 80
const POST_EFFECT_DELAY    = 250

// ── Helpers ────────────────────────────────────────────────────────────────

function makeGuaranteedGrid(scatterCount) {
  const indices = [0, 1, 2, 3, 4]
  for (let i = 4; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]]
  }
  const bonusCols = indices.slice(0, scatterCount)
  const bonusSet  = new Set(bonusCols)
  const bonusSym  = { id: 'bonus', name: 'BONUS', color: '#f59e0b' }
  // Use generateBonusReel (no bonus/wild symbols) to prevent natural scatter contamination.
  // Only the explicitly chosen bonusCols get a bonus symbol placed.
  const grid = Array.from({ length: REELS }, (_, ri) => {
    const reel = generateBonusReel(ROWS)
    if (bonusSet.has(ri)) reel[Math.floor(Math.random() * ROWS)] = bonusSym
    return reel
  })
  return { grid, bonusCols }
}

function moveJumpingWilds(wilds) {
  const occupied = new Set()
  return wilds.map(jw => {
    let ri, row, attempts = 0
    do {
      ri  = Math.floor(Math.random() * REELS)
      row = Math.floor(Math.random() * ROWS)
      attempts++
    } while (occupied.has(`${ri}-${row}`) && attempts < 30)
    occupied.add(`${ri}-${row}`)
    return { ...jw, reelIndex: ri, rowIndex: row }
  })
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useGameStore = create((set, get) => ({
  balance: 1000,
  bet: 0.20,

  grid:          makeGrid(),
  enhancerCells: makeEmptyECs(),

  spinPhase:   'idle',
  reelSymbols: null,
  bonusSoFar:  0,
  bonusReels:  [],
  alarmMode:   false,

  // Razor cut animation
  razorCutReel: -1,
  splitReels:   [],

  // Win display
  winAmount:    0,
  winningCells: new Set(),
  showWin:      false,
  showBigWin:   false,

  // ── Bonus / Free Spins ───────────────────────────────────────────────────
  bonusMode:          false,
  bonusActiveReels:   [],   // reel indices that were opened in setup phase
  freeSpinsLeft:      0,
  freeSpinsTotalAdded: 0,
  totalBonusWin:      0,
  jumpingWilds:       [],   // [{ reelIndex, rowIndex, multiplier }]
  showTransition:     false,
  showBonusBuy:       false,
  showBonusEnd:       false,

  // Auto-play
  autoPlaying:   false,
  autoPlaysLeft: 0,

  // Big-win hype (win >= $50)
  bigWinHype: false,

  // ── Actions ────────────────────────────────────────────────────────────

  spin() {
    const { balance, bet, spinPhase, bonusMode } = get()
    if (spinPhase !== 'idle' || bonusMode) return
    if (balance < bet) {
      set({ autoPlaying: false, autoPlaysLeft: 0 })
      return
    }
    set({
      spinPhase:    'spinning',
      balance:      +(balance - bet).toFixed(2),
      reelSymbols:  Array(REELS).fill(null),
      bonusSoFar:   0,
      bonusReels:   [],
      alarmMode:    false,
      enhancerCells: makeEmptyECs(),
      razorCutReel:  -1,
      splitReels:    [],
      winAmount:    0,
      winningCells: new Set(),
      showWin:      false,
      showBigWin:   false,
      bigWinHype:   false,
    })
    setTimeout(() => get()._landReel(0), 400)
  },

  _landReel(reelIndex) {
    if (get().spinPhase !== 'spinning') return
    const newSymbols = generateReel(ROWS)
    const hasBonus   = newSymbols.some(s => s.id === 'bonus')

    set(state => {
      const rs = [...state.reelSymbols]
      rs[reelIndex] = newSymbols
      const newBonusReels = hasBonus ? [...state.bonusReels, reelIndex] : state.bonusReels
      return {
        reelSymbols: rs,
        bonusReels:  newBonusReels,
        bonusSoFar:  newBonusReels.length,
        alarmMode:   newBonusReels.length >= 2,
      }
    })

    if (reelIndex < REELS - 1) {
      const delay = get().alarmMode ? ALARM_REEL_DELAY : REEL_STOP_DELAY
      setTimeout(() => get()._landReel(reelIndex + 1), delay)
    } else {
      setTimeout(() => get()._evaluate(), 150)
    }
  },

  _evaluate() {
    const { reelSymbols, bonusReels, bonusSoFar, bet, balance } = get()

    // ── 3+ bonuses → Lockdown Spins ───────────────────────────────────────
    if (bonusSoFar >= 3) {
      get()._triggerBonusMode(reelSymbols, bonusReels, Math.min(bonusSoFar - 2, 3))
      return
    }

    // ── < 3 bonuses → normal win flow ────────────────────────────────────
    const newECs = makeEmptyECs()
    bonusReels.forEach(i => { newECs[i] = generateECPair() })

    // bonus → Golden Wild
    const finalGrid = reelSymbols.map(col =>
      col.map(sym => sym.id === 'bonus' ? { ...GOLDEN_WILD } : sym)
    )

    const { totalWin, winningCells } = calculateWins(finalGrid, bet, newECs)
    const isBigWin = totalWin >= bet * BIG_WIN_MULTIPLIER

    set({
      grid:          finalGrid,
      enhancerCells: newECs,
      reelSymbols:   null,
      spinPhase:     'idle',
      alarmMode:     false,
      winAmount:     totalWin,
      winningCells,
      showWin:       false,
      showBigWin:    false,
      _pendingIsBigWin: isBigWin,
      _pendingTotalWin: totalWin,
    })

    const razorReels = newECs
      .map((ec, i) => ({ i, r: (ec.top?.id === 'razorSplit' ? 1 : 0) + (ec.bottom?.id === 'razorSplit' ? 1 : 0) }))
      .filter(x => x.r > 0).map(x => x.i)

    const ecDelay = bonusReels.length > 0 ? 450 : 100
    if (razorReels.length > 0) {
      setTimeout(() => get()._playRazorChain(razorReels, 0), ecDelay)
    } else {
      setTimeout(() => get()._showWins(), ecDelay)
    }
  },

  // ── Bonus trigger (from natural 3+ scatters OR Feature Buy) ──────────────

  _triggerBonusMode(grid, bonusReelsList, jwCount = 1) {
    // Setup phase: both top and bottom ECs on active reels show free spin count
    const newECs = makeEmptyECs()
    bonusReelsList.forEach(i => {
      newECs[i] = { top: generateBonusSpinEC(), bottom: generateBonusSpinEC() }
    })

    const finalGrid = grid.map(col =>
      col.map(sym => sym.id === 'bonus' ? { ...GOLDEN_WILD } : sym)
    )

    // Free spins = sum of BOTH top and bottom spinCounts across all active reels
    const freeSpins = bonusReelsList.reduce(
      (s, i) => s + (newECs[i].top.spinCount || 0) + (newECs[i].bottom.spinCount || 0),
      0
    )

    // Create jwCount unique Jumping Wilds at random positions
    const occupied = new Set()
    const initialJWs = []
    for (let k = 0; k < jwCount; k++) {
      let ri, row, attempts = 0
      do {
        ri  = Math.floor(Math.random() * REELS)
        row = Math.floor(Math.random() * ROWS)
        attempts++
      } while (occupied.has(`${ri}-${row}`) && attempts < 30)
      occupied.add(`${ri}-${row}`)
      initialJWs.push({ reelIndex: ri, rowIndex: row, multiplier: 1 })
    }

    set({
      grid:              finalGrid,
      enhancerCells:     newECs,
      reelSymbols:       null,
      spinPhase:         'idle',
      alarmMode:         false,
      bonusMode:         true,
      bonusActiveReels:  bonusReelsList,
      freeSpinsLeft:     freeSpins,
      freeSpinsTotalAdded: freeSpins,
      jumpingWilds:      initialJWs,
      totalBonusWin:     0,
      showTransition:    true,
      razorCutReel:      -1,
      splitReels:        [],
      winAmount:         0,
      winningCells:      new Set(),
      showWin:           false,
      showBigWin:        false,
      bigWinHype:        false,
      autoPlaying:       false,
      autoPlaysLeft:     0,
    })
  },

  // ── Feature Buy ──────────────────────────────────────────────────────────

  openBonusBuy:  () => set({ showBonusBuy: true }),
  closeBonusBuy: () => set({ showBonusBuy: false }),

  buyBonus(scatterCount) {
    const costs = { 3: 20, 4: 80, 5: 400 }
    const { balance, spinPhase, bonusMode } = get()
    const cost = costs[scatterCount]
    if (spinPhase !== 'idle' || bonusMode || balance < cost) return

    const { grid, bonusCols } = makeGuaranteedGrid(scatterCount)

    set({ balance: +(balance - cost).toFixed(2), showBonusBuy: false })
    get()._triggerBonusMode(grid, bonusCols, scatterCount - 2)
  },

  dismissTransition: () => set({ showTransition: false }),

  // ── Bonus Spin ───────────────────────────────────────────────────────────

  spinBonus() {
    const { bonusMode, freeSpinsLeft, spinPhase, jumpingWilds, bonusActiveReels } = get()
    if (!bonusMode || freeSpinsLeft <= 0 || spinPhase !== 'idle') return

    // ── Timing constants ──────────────────────────────────────────────────
    const STAGGER   = 80    // ms between each reel column reveal
    const TOP_AT    = 220   // ms: first top EC reveals
    const BOT_AT    = TOP_AT  + REELS * STAGGER + 100   // = 720ms
    const MULT_AT   = BOT_AT  + REELS * STAGGER + 90    // = 1210ms

    // Pre-generate all new EC content for this spin
    const allNewECs = makeEmptyECs()
    bonusActiveReels.forEach(i => { allNewECs[i] = generateECPair() })

    // ── t=0: Board dark, JW jumps ─────────────────────────────────────────
    const movedWilds = moveJumpingWilds(jumpingWilds)
    set({
      spinPhase:     'bonusPhase',
      freeSpinsLeft: freeSpinsLeft - 1,
      jumpingWilds:  movedWilds,
      grid:          makeGrid(),
      enhancerCells: makeEmptyECs(),
      razorCutReel:  -1,
      splitReels:    [],
      winAmount:     0,
      winningCells:  new Set(),
      showWin:       false,
      showBigWin:    false,
      bigWinHype:    false,
    })

    // ── Top ECs reveal L→R (active reels only) ────────────────────────────
    for (let r = 0; r < REELS; r++) {
      if (!bonusActiveReels.includes(r)) continue
      setTimeout(() => {
        set(state => {
          const ecs = state.enhancerCells.map((ec, i) =>
            i === r ? { top: allNewECs[r].top, bottom: ec.bottom } : ec
          )
          return { enhancerCells: ecs }
        })
      }, TOP_AT + r * STAGGER)
    }

    // ── Bottom ECs reveal L→R (active reels only) ─────────────────────────
    for (let r = 0; r < REELS; r++) {
      if (!bonusActiveReels.includes(r)) continue
      setTimeout(() => {
        set(state => {
          const ecs = state.enhancerCells.map((ec, i) =>
            i === r ? { top: ec.top, bottom: allNewECs[r].bottom } : ec
          )
          return { enhancerCells: ecs }
        })
      }, BOT_AT + r * STAGGER)
    }

    // ── JW multiplier update (after ECs visible) ──────────────────────────
    setTimeout(() => {
      const updatedWilds = movedWilds.map(jw => {
        const ec = allNewECs[jw.reelIndex]
        const hasRazor = ec?.top?.id === 'razorSplit' || ec?.bottom?.id === 'razorSplit'
        return hasRazor ? { ...jw, multiplier: jw.multiplier * 2 } : jw
      })
      const anyUpdated = updatedWilds.some((w, i) => w.multiplier !== movedWilds[i].multiplier)
      if (anyUpdated) set({ jumpingWilds: updatedWilds })

      // ── Grid reveals L→R ──────────────────────────────────────────────
      setTimeout(() => {
        set({ spinPhase: 'spinning', reelSymbols: Array(REELS).fill(null) })
        setTimeout(() => get()._landBonusReel(0), 250)
      }, 150)
    }, MULT_AT)
  },

  _landBonusReel(reelIndex) {
    if (get().spinPhase !== 'spinning') return
    const newSymbols = generateBonusReel(ROWS)
    set(state => {
      const rs = [...state.reelSymbols]
      rs[reelIndex] = newSymbols
      return { reelSymbols: rs }
    })
    if (reelIndex < REELS - 1) {
      setTimeout(() => get()._landBonusReel(reelIndex + 1), REEL_STOP_DELAY)
    } else {
      setTimeout(() => get()._evaluateBonus(), 150)
    }
  },

  _evaluateBonus() {
    const { reelSymbols, bet, enhancerCells, jumpingWilds, freeSpinsLeft } = get()

    // Build JW-overlaid grid for win calculation (jwMult embedded for effectiveCount)
    const calcGrid = reelSymbols.map((col, ri) =>
      col.map((sym, row) => {
        const jw = jumpingWilds.find(w => w.reelIndex === ri && w.rowIndex === row)
        if (jw) return { ...GOLDEN_WILD, jwMult: jw.multiplier }
        return sym.id === 'bonus' ? { ...GOLDEN_WILD } : sym
      })
    )

    // Display grid: raw landed symbols only — JWs remain as overlays via jumpingWilds
    const displayGrid = reelSymbols.map(col =>
      col.map(sym => sym.id === 'bonus' ? { ...GOLDEN_WILD } : sym)
    )

    // Detect retrigger (bonus symbol not covered by a JW)
    const hasRetrigger = reelSymbols.some((col, ri) =>
      col.some((sym, row) =>
        sym.id === 'bonus' && !jumpingWilds.some(w => w.reelIndex === ri && w.rowIndex === row)
      )
    )

    let newJWs = [...jumpingWilds]
    let newFreeSpinsLeft = freeSpinsLeft
    if (hasRetrigger) {
      newFreeSpinsLeft += RETRIGGER_SPINS
      const occupied = new Set(newJWs.map(w => `${w.reelIndex}-${w.rowIndex}`))
      let ri, row, attempts = 0
      do {
        ri  = Math.floor(Math.random() * REELS)
        row = Math.floor(Math.random() * ROWS)
        attempts++
      } while (occupied.has(`${ri}-${row}`) && attempts < 30)
      newJWs = [...newJWs, { reelIndex: ri, rowIndex: row, multiplier: 1 }]
    }

    const { totalWin, winningCells } = calculateWins(calcGrid, bet, enhancerCells)
    const isBigWin = totalWin >= bet * BIG_WIN_MULTIPLIER

    set({
      grid:          displayGrid,   // raw grid; JWs displayed as overlays via jumpingWilds
      reelSymbols:   null,
      spinPhase:     'idle',
      alarmMode:     false,
      winAmount:     totalWin,
      winningCells,
      showWin:       false,
      showBigWin:    false,
      jumpingWilds:  newJWs,
      freeSpinsLeft: newFreeSpinsLeft,
      _pendingIsBigWin: isBigWin,
      _pendingTotalWin: totalWin,
    })

    const razorReels = enhancerCells
      .map((ec, i) => ({
        i,
        r: (ec?.top?.id === 'razorSplit' ? 1 : 0) + (ec?.bottom?.id === 'razorSplit' ? 1 : 0),
      }))
      .filter(x => x.r > 0).map(x => x.i)

    if (razorReels.length > 0) {
      setTimeout(() => get()._playRazorChain(razorReels, 0), 300)
    } else {
      setTimeout(() => get()._showWins(), 100)
    }
  },

  _endBonus() {
    set({ showBonusEnd: true, bonusMode: false })
  },

  dismissBonusEnd() {
    set({
      showBonusEnd:        false,
      freeSpinsLeft:       0,
      freeSpinsTotalAdded: 0,
      jumpingWilds:        [],
      bonusActiveReels:    [],
      totalBonusWin:       0,
      splitReels:          [],
      enhancerCells:       makeEmptyECs(),
      winningCells:        new Set(),
      grid:                makeGrid(),
    })
  },

  // ── Razor cut chain (shared between base game and bonus) ──────────────────

  _playRazorChain(seq, idx) {
    const reel = seq[idx]
    set({ razorCutReel: reel })
    setTimeout(() => {
      set(state => ({ splitReels: [...state.splitReels, reel] }))
    }, RAZOR_BLADE_DURATION)
    setTimeout(() => {
      set({ razorCutReel: -1 })
      if (idx + 1 < seq.length) {
        setTimeout(() => get()._playRazorChain(seq, idx + 1), RAZOR_GAP)
      } else {
        setTimeout(() => get()._showWins(), POST_EFFECT_DELAY)
      }
    }, RAZOR_CUT_DURATION)
  },

  // ── Win reveal (shared; handles bonus accumulation) ────────────────────

  _showWins() {
    const state    = get()
    const totalWin = state._pendingTotalWin || 0
    const isBig    = !!state._pendingIsBigWin && state.winAmount > 0
    const hasWin   = state.winAmount > 0
    const isHype   = totalWin >= 50   // $50+ triggers board shake + slow count-up

    const updates = {
      balance:    totalWin > 0 ? +(state.balance + totalWin).toFixed(2) : state.balance,
      showWin:    false,   // always delayed — let cells flash ~3 cycles first
      showBigWin: false,
      bigWinHype: isHype,
    }
    if (state.bonusMode) {
      updates.totalBonusWin = +((state.totalBonusWin || 0) + totalWin).toFixed(2)
    }
    set(updates)

    if (hasWin) {
      // ~3 flash cycles (3 × 0.65 s ≈ 1950 ms) before the popup.
      // Guard: only show if we haven't started a new spin by then.
      const snapWin = state.winAmount
      setTimeout(() => {
        const s = get()
        if (s.spinPhase !== 'idle' || s.winAmount !== snapWin) return
        if (isBig) set({ showBigWin: true })
        else       set({ showWin: true })
      }, 1900)
    }

    // End bonus if last spin and no win at all
    if (state.bonusMode && state.freeSpinsLeft <= 0 && !hasWin) {
      setTimeout(() => get()._endBonus(), 800)
    }

    // Auto-play: only advance immediately when there is no win to display
    if (!hasWin && !state.bonusMode) {
      get()._advanceAutoPlay()
    }
  },

  // ── Auto-play ────────────────────────────────────────────────────────────

  _advanceAutoPlay() {
    const { autoPlaying, autoPlaysLeft, bonusMode, spinPhase } = get()
    if (!autoPlaying || bonusMode || spinPhase !== 'idle') return
    const newLeft = autoPlaysLeft - 1
    if (newLeft <= 0) {
      set({ autoPlaying: false, autoPlaysLeft: 0 })
      return
    }
    set({ autoPlaysLeft: newLeft })
    setTimeout(() => { if (get().autoPlaying) get().spin() }, 1300)
  },

  startAutoPlay(count) {
    if (get().spinPhase !== 'idle' || get().bonusMode) return
    set({ autoPlaying: true, autoPlaysLeft: count })
    get().spin()
  },

  stopAutoPlay() {
    set({ autoPlaying: false, autoPlaysLeft: 0 })
  },

  // ── Dismiss actions ────────────────────────────────────────────────────

  clearWin() {
    const { bonusMode, freeSpinsLeft } = get()
    set({ showWin: false, winningCells: new Set() })
    if (bonusMode && freeSpinsLeft <= 0) {
      setTimeout(() => get()._endBonus(), 500)
    } else {
      get()._advanceAutoPlay()
    }
  },

  closeBigWin() {
    const { bonusMode, freeSpinsLeft } = get()
    set({ showBigWin: false, winningCells: new Set(), bigWinHype: false })
    if (bonusMode && freeSpinsLeft <= 0) {
      setTimeout(() => get()._endBonus(), 500)
    } else {
      get()._advanceAutoPlay()
    }
  },

  setBet: (amount) => set({ bet: amount }),
}))
