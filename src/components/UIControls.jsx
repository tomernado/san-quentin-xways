import { useGameStore } from '../store/useGameStore'

const BET_LEVELS = [0.20, 0.40, 0.60, 1.00, 2.00, 5.00, 10.00]

export default function UIControls() {
  const {
    balance, bet, spinPhase, spin, spinBonus, setBet,
    bonusMode, freeSpinsLeft, openBonusBuy,
  } = useGameStore()

  const isSpinning = spinPhase !== 'idle'
  const betIndex   = BET_LEVELS.indexOf(bet)

  const raiseBet = () => !isSpinning && !bonusMode && betIndex < BET_LEVELS.length - 1 && setBet(BET_LEVELS[betIndex + 1])
  const lowerBet = () => !isSpinning && !bonusMode && betIndex > 0 && setBet(BET_LEVELS[betIndex - 1])

  const canSpin      = !isSpinning && !bonusMode && balance >= bet
  const canBonusSpin = !isSpinning && bonusMode && freeSpinsLeft > 0

  const handleSpin = () => bonusMode ? spinBonus() : spin()

  return (
    <div
      className="flex items-center justify-between gap-1.5 sm:gap-3 px-2 sm:px-6 py-3 sm:py-4 border-t rounded-b-xl transition-colors"
      style={{
        background:   bonusMode ? 'rgba(10,3,0,0.97)' : 'rgba(17,24,39,0.9)',
        borderColor:  bonusMode ? 'rgba(127,29,29,0.5)' : 'rgba(234,179,8,0.2)',
      }}
    >
      {/* Auto (disabled placeholder) */}
      <button
        disabled
        className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gray-800 border border-white/10 text-white/40 text-xs flex items-center justify-center cursor-not-allowed"
      >
        AUTO
      </button>

      {/* Bet Selector — locked during bonus */}
      <div className="flex items-center gap-2">
        <button
          onClick={lowerBet}
          disabled={isSpinning || bonusMode || betIndex === 0}
          className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-colors text-xs sm:text-base"
        >
          ▼
        </button>
        <div className="flex flex-col items-center">
          <span className="text-gray-400 text-xs">BET</span>
          <span className="text-yellow-400 font-bold w-12 sm:w-16 text-center text-sm sm:text-base">${bet.toFixed(2)}</span>
        </div>
        <button
          onClick={raiseBet}
          disabled={isSpinning || bonusMode || betIndex === BET_LEVELS.length - 1}
          className="w-6 h-6 sm:w-8 sm:h-8 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-colors text-xs sm:text-base"
        >
          ▲
        </button>
      </div>

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={bonusMode ? !canBonusSpin : !canSpin}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full font-bold text-sm border-4 transition-all shadow-lg"
        style={
          bonusMode
            ? (canBonusSpin
                ? { borderColor: '#dc2626', backgroundColor: '#991b1b', boxShadow: '0 0 20px #dc262666', color: '#fff', cursor: 'pointer' }
                : { borderColor: '#374151', backgroundColor: '#1f2937', color: '#6b7280', cursor: 'not-allowed' })
            : (canSpin
                ? { borderColor: '#eab308', backgroundColor: '#ca8a04', boxShadow: '0 8px 20px rgba(234,179,8,0.3)', color: '#fff', cursor: 'pointer' }
                : { borderColor: '#4b5563', backgroundColor: '#374151', color: '#6b7280', cursor: 'not-allowed' })
        }
      >
        {isSpinning ? (
          <span className="inline-block animate-spin text-xl">⟳</span>
        ) : bonusMode ? (
          <span style={{ fontSize: '11px', fontWeight: 900, lineHeight: 1.2 }}>FREE{'\n'}SPIN</span>
        ) : (
          'SPIN'
        )}
      </button>

      {/* Balance */}
      <div className="flex flex-col items-center">
        <span className="text-gray-400 text-xs">BALANCE</span>
        <span className="text-green-400 font-bold">${balance.toFixed(2)}</span>
      </div>

      {/* Feature Buy / Nolimit Bonus */}
      <button
        onClick={openBonusBuy}
        disabled={isSpinning || bonusMode}
        className="w-10 h-10 sm:w-14 sm:h-14 rounded-full font-bold text-xl sm:text-2xl flex items-center justify-center transition-all"
        style={{
          background:  isSpinning || bonusMode ? '#374151' : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          color:       isSpinning || bonusMode ? '#6b7280' : '#000',
          boxShadow:   isSpinning || bonusMode ? 'none' : '0 4px 20px rgba(251,191,36,0.4)',
          cursor:      isSpinning || bonusMode ? 'not-allowed' : 'pointer',
          opacity:     bonusMode ? 0.4 : 1,
        }}
      >
        ⚡
      </button>
    </div>
  )
}
