import { motion } from 'framer-motion'

export function LiveBadge({ live }: { live: boolean }) {
  return (
    <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5">
      <span className="relative flex h-2 w-2">
        {live && (
          <motion.span
            className="absolute inline-flex h-full w-full rounded-full"
            style={{ background: 'var(--accent-3)' }}
            animate={{ opacity: [0.35, 0.9, 0.35], scale: [1, 1.6, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <span
          className="relative inline-flex h-2 w-2 rounded-full"
          style={{ background: live ? 'var(--accent-3)' : 'var(--text-tertiary)' }}
        />
      </span>
      <span className="text-xs font-medium tracking-wide text-[var(--text-secondary)]">
        {live ? 'Live' : 'Connecting'}
      </span>
    </div>
  )
}
