import { motion } from 'framer-motion'
import { Watch } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
}

export function EmptyState({
  title = 'No data yet',
  description = 'Metrics appear once the wearable has buffered enough sensor data. Keep the device on — readings typically start within a minute.',
}: EmptyStateProps) {
  return (
    <motion.div
      className="glass rounded-[22px] px-8 py-16 flex flex-col items-center text-center"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
    >
      <div
        className="mb-5 flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: 'var(--accent-muted)', boxShadow: '0 0 28px var(--accent-glow)' }}
      >
        <Watch size={26} strokeWidth={1.4} className="text-[var(--accent-2)]" />
      </div>
      <h3 className="text-xl font-semibold tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}
