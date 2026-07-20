import type { LucideIcon } from 'lucide-react'
import { GlassCard } from '../ui/GlassCard'
import { AnimatedNumber } from '../ui/AnimatedNumber'

interface MetricCardProps {
  label: string
  value: number
  unit: string
  decimals?: number
  icon: LucideIcon
  delay?: number
}

export function MetricCard({
  label,
  value,
  unit,
  decimals = 0,
  icon: Icon,
  delay = 0,
}: MetricCardProps) {
  return (
    <GlassCard
      gradient
      className="p-5 sm:p-6 min-h-[148px] flex flex-col justify-between pressable"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28, delay }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="label-caps">{label}</span>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{
            background: 'var(--accent-muted)',
            boxShadow: '0 0 20px var(--accent-glow)',
          }}
        >
          <Icon size={18} strokeWidth={1.5} className="text-[var(--accent-2)] dark:text-[var(--accent-1)]" />
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-1.5">
          <AnimatedNumber
            value={value}
            decimals={decimals}
            className="text-[2.35rem] sm:text-[2.75rem] leading-none tracking-tight text-[var(--text-primary)]"
          />
          <span className="text-sm font-medium text-[var(--text-secondary)] tracking-wide">
            {unit}
          </span>
        </div>
      </div>
    </GlassCard>
  )
}
