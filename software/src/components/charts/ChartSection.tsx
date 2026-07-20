import { motion } from 'framer-motion'
import type { Reading, TimeRange } from '../../data/types'
import { SegmentedControl } from '../ui/SegmentedControl'
import { ChartSkeleton } from '../ui/Skeleton'
import { TimeSeriesChart } from './TimeSeriesChart'
import { GlassCard } from '../ui/GlassCard'

const RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
]

interface ChartSectionProps {
  readings: Reading[]
  loading: boolean
  range: TimeRange
  onRangeChange: (range: TimeRange) => void
}

export function ChartSection({ readings, loading, range, onRangeChange }: ChartSectionProps) {
  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 px-0.5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Trends</h2>
          <p className="text-sm text-[var(--text-secondary)]">Heart rate & HRV over time</p>
        </div>
        <SegmentedControl
          options={RANGE_OPTIONS}
          value={range}
          onChange={onRangeChange}
          ariaLabel="Time range"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-5">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-5">
          <ChartPanel title="Heart Rate" subtitle="BPM" delay={0.1}>
            <TimeSeriesChart
              readings={readings}
              dataKey="bpm"
              range={range}
              unit="BPM"
              label="Heart Rate"
            />
          </ChartPanel>
          <ChartPanel title="Heart Rate Variability" subtitle="ms" delay={0.16}>
            <TimeSeriesChart
              readings={readings}
              dataKey="hrv_ms"
              range={range}
              unit="ms"
              label="HRV"
            />
          </ChartPanel>
        </div>
      )}
    </div>
  )
}

function ChartPanel({
  title,
  subtitle,
  children,
  delay,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  delay: number
}) {
  return (
    <GlassCard
      className="p-5 sm:p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28, delay }}
    >
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-semibold tracking-tight">{title}</h3>
        <span className="label-caps">{subtitle}</span>
      </div>
      <motion.div layout>{children}</motion.div>
    </GlassCard>
  )
}
