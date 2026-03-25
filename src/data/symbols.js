export const PAYTABLE = {
  beefyDick:   { name: 'Beefy Dick',   payouts: { 3: 0.50, 4: 1.50, 5: 5.00 }, color: '#ef4444' },
  locoLuis:    { name: 'Loco Luis',    payouts: { 3: 0.40, 4: 1.25, 5: 4.00 }, color: '#f97316' },
  heinrich3rd: { name: 'Heinrich 3rd', payouts: { 3: 0.35, 4: 1.10, 5: 3.50 }, color: '#2563eb' },
  bikerCarl:   { name: 'Biker Carl',   payouts: { 3: 0.30, 4: 1.00, 5: 3.00 }, color: '#16a34a' },
  crazyJoe:    { name: 'Crazy Joe',    payouts: { 3: 0.25, 4: 0.90, 5: 2.50 }, color: '#eab308' },
  soap:        { name: 'Soap',         payouts: { 3: 0.20, 4: 0.75, 5: 2.00 }, color: '#f472b6' },
  lighter:     { name: 'Lighter',      payouts: { 3: 0.20, 4: 0.75, 5: 2.00 }, color: '#9ca3af' },
  shank:       { name: 'Shank',        payouts: { 3: 0.15, 4: 0.60, 5: 1.50 }, color: '#a855f7' },
  handcuffs:   { name: 'Handcuffs',    payouts: { 3: 0.15, 4: 0.60, 5: 1.50 }, color: '#60a5fa' },
  toiletPaper: { name: 'Toilet Paper', payouts: { 3: 0.15, 4: 0.60, 5: 1.50 }, color: '#d6d3d1' },
  bonus:       { name: 'BONUS',        payouts: {},                             color: '#f59e0b' },
}

export const SYMBOL_KEYS = Object.keys(PAYTABLE)

// Special symbols injected by the game engine (not in PAYTABLE)
export const GOLDEN_WILD  = { id: 'goldenWild',  name: 'WILD',         color: '#fbbf24' }
export const RAZOR_SPLIT  = { id: 'razorSplit',  name: '✂ RAZOR',      color: '#0f172a' }

// Premium symbols eligible to appear in Enhancer Cells
const PREMIUM_IDS = ['beefyDick', 'locoLuis', 'heinrich3rd', 'bikerCarl', 'crazyJoe']

// Weighted RNG for main reel symbols — premium symbols are rarer
// Keys order: beefyDick, locoLuis, heinrich3rd, bikerCarl, crazyJoe, soap, lighter, shank, handcuffs, toiletPaper, bonus
const WEIGHTS = [3, 4, 6, 8, 9, 16, 16, 14, 12, 7, 5] // total = 100
const TOTAL_WEIGHT = WEIGHTS.reduce((a, b) => a + b, 0)

// ~2% chance any reel cell is a natural Wild
const NATURAL_WILD_CHANCE = 0.02

export const getRandomSymbol = () => {
  if (Math.random() < NATURAL_WILD_CHANCE) return { ...GOLDEN_WILD }
  let r = Math.random() * TOTAL_WEIGHT
  for (let i = 0; i < SYMBOL_KEYS.length; i++) {
    r -= WEIGHTS[i]
    if (r <= 0) {
      const id = SYMBOL_KEYS[i]
      return { id, name: PAYTABLE[id].name, color: PAYTABLE[id].color }
    }
  }
  const id = SYMBOL_KEYS[SYMBOL_KEYS.length - 1]
  return { id, name: PAYTABLE[id].name, color: PAYTABLE[id].color }
}

// Each slot in a reel is fully independent — no stacking
export const generateReel = (rows = 3) =>
  Array.from({ length: rows }, () => getRandomSymbol())

// Bonus reel strip — only the 10 paytable symbols (no wilds, no bonus scatter)
const BONUS_REEL_KEYS    = SYMBOL_KEYS.filter(id => id !== 'bonus')
const BONUS_REEL_WEIGHTS = [3, 4, 6, 8, 9, 16, 16, 14, 12, 7] // same ratios minus bonus entry
const BONUS_REEL_TOTAL   = BONUS_REEL_WEIGHTS.reduce((a, b) => a + b, 0)

const getBonusReelSymbol = () => {
  let r = Math.random() * BONUS_REEL_TOTAL
  for (let i = 0; i < BONUS_REEL_KEYS.length; i++) {
    r -= BONUS_REEL_WEIGHTS[i]
    if (r <= 0) {
      const id = BONUS_REEL_KEYS[i]
      return { id, name: PAYTABLE[id].name, color: PAYTABLE[id].color }
    }
  }
  const id = BONUS_REEL_KEYS[BONUS_REEL_KEYS.length - 1]
  return { id, name: PAYTABLE[id].name, color: PAYTABLE[id].color }
}

export const generateBonusReel = (rows = 3) =>
  Array.from({ length: rows }, () => getBonusReelSymbol())

// Enhancer Cell content: 15% Razor Split, 10% Wild, 75% premium symbol (weighted by tier)
// Premium weights: beefyDick(1), locoLuis(2), heinrich3rd(3), bikerCarl(5), crazyJoe(7) = 18
const PREMIUM_WEIGHTS = [1, 2, 3, 5, 7]
const PREMIUM_TOTAL   = PREMIUM_WEIGHTS.reduce((a, b) => a + b, 0)

export const generateECSymbol = () => {
  const r = Math.random()
  if (r < 0.15) return { ...RAZOR_SPLIT }
  if (r < 0.25) return { ...GOLDEN_WILD }
  let p = Math.random() * PREMIUM_TOTAL
  for (let i = 0; i < PREMIUM_IDS.length; i++) {
    p -= PREMIUM_WEIGHTS[i]
    if (p <= 0) {
      const id = PREMIUM_IDS[i]
      return { id, name: PAYTABLE[id].name, color: PAYTABLE[id].color }
    }
  }
  const id = PREMIUM_IDS[PREMIUM_IDS.length - 1]
  return { id, name: PAYTABLE[id].name, color: PAYTABLE[id].color }
}

// Top EC during Lockdown Spins — shows free spin contribution (1–3)
export const generateBonusSpinEC = () => {
  const count = 1 + Math.floor(Math.random() * 3)
  return { id: 'spinCount', name: `+${count}`, spinCount: count, color: '#1e3a8a' }
}
