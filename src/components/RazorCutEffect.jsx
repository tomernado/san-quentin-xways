import { motion } from 'framer-motion'

/**
 * Overlaid on a reel column when a Razor Split cuts through it.
 * Sequence: white flash → red blade sweeps top→bottom → overlay fades
 * just as the cells start splitting (blade finishes at ~280ms out of 500ms total).
 */
export default function RazorCutEffect() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl"
      style={{ zIndex: 30 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0, 0] }}
      transition={{ duration: 0.5, times: [0, 0.05, 0.56, 0.80, 1] }}
    >
      {/* White flash on entry */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
        style={{ backgroundColor: '#ffffff' }}
      />

      {/* Red blade line sweeping from top to bottom */}
      <motion.div
        className="absolute left-0 right-0"
        style={{
          height: '3px',
          background: 'linear-gradient(90deg, transparent 0%, #ef4444 20%, #fff 50%, #ef4444 80%, transparent 100%)',
          boxShadow: '0 0 8px #ef4444, 0 0 16px #ef4444',
        }}
        initial={{ top: '-2px' }}
        animate={{ top: 'calc(100% + 2px)' }}
        transition={{ duration: 0.28, ease: 'linear' }}
      />
    </motion.div>
  )
}
