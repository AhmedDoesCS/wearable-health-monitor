import { motion } from 'framer-motion'
import { Flame, Footprints } from 'lucide-react'
import { ActivityRings } from './ActivityRings'
import { AnimatedNumber } from '../ui/AnimatedNumber'
import { GlassCard } from '../ui/GlassCard'

interface DailySummaryProps {
  steps: number
  stepsGoal: number
  calories: number
  caloriesGoal: number
  loading?: boolean
}

export function DailySummary({
  steps,
  stepsGoal,
  calories,
  caloriesGoal,
  loading,
}: DailySummaryProps) {
  return (
    <GlassCard
      strong
      className="p-6 sm:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.2 }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
        <div className="shrink-0">
          <h2 className="text-lg font-semibold tracking-tight mb-1">Daily Summary</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-xs">
            Steps and calorie burn toward today&apos;s goals.
          </p>
          {!loading && (
            <ActivityRings
              steps={steps}
              stepsGoal={stepsGoal}
              calories={calories}
              caloriesGoal={caloriesGoal}
            />
          )}
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatRow
            icon={Footprints}
            label="Steps"
            value={steps}
            goal={stepsGoal}
            unit=""
            accent="var(--ring-steps)"
          />
          <StatRow
            icon={Flame}
            label="Calories"
            value={calories}
            goal={caloriesGoal}
            unit="kcal"
            accent="var(--ring-calories)"
          />
        </div>
      </div>
    </GlassCard>
  )
}

function StatRow({
  icon: Icon,
  label,
  value,
  goal,
  unit,
  accent,
}: {
  icon: typeof Footprints
  label: string
  value: number
  goal: number
  unit: string
  accent: string
}) {
  const pct = Math.min(100, Math.round((value / goal) * 100))

  return (
    <div className="rounded-[16px] p-4 bg-[var(--bg-fill)] border border-[var(--border-subtle)]">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} strokeWidth={1.5} style={{ color: accent }} />
        <span className="label-caps">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5 mb-3">
        <AnimatedNumber value={value} className="text-2xl text-[var(--text-primary)]" />
        <span className="text-sm text-[var(--text-tertiary)]">
          / {goal.toLocaleString()}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--bg-fill-strong)] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${accent}, color-mix(in srgb, ${accent} 70%, white))`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 22 }}
        />
      </div>
      <p className="mt-2 text-xs text-[var(--text-tertiary)] tracking-wide">{pct}% of goal</p>
    </div>
  )
}
