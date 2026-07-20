import { Activity, Droplets, Flame, Footprints, Heart, Thermometer } from 'lucide-react'
import type { Reading } from '../../data/types'
import { MetricCardSkeleton } from '../ui/Skeleton'
import { MetricCard } from './MetricCard'

interface MetricsGridProps {
  reading: Reading | null
  loading: boolean
}

export function MetricsGrid({ reading, loading }: MetricsGridProps) {
  if (loading || !reading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const cards = [
    { label: 'Heart Rate', value: reading.bpm, unit: 'BPM', decimals: 0, icon: Heart },
    { label: 'Blood Oxygen', value: reading.spo2, unit: '%', decimals: 1, icon: Droplets },
    { label: 'Steps Today', value: reading.steps, unit: 'steps', decimals: 0, icon: Footprints },
    { label: 'Skin Temp', value: reading.temp_c, unit: '°C', decimals: 1, icon: Thermometer },
    { label: 'Burn Rate', value: reading.kcal_per_min, unit: 'kcal/min', decimals: 2, icon: Flame },
    { label: 'HRV', value: reading.hrv_ms, unit: 'ms', decimals: 0, icon: Activity },
  ] as const

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
      {/* Asymmetric offset on larger screens */}
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={
            i === 0
              ? 'xl:col-span-1'
              : i === 2
                ? 'sm:translate-y-0 xl:translate-y-3'
                : i === 3
                  ? 'xl:-translate-y-2'
                  : i === 5
                    ? 'xl:translate-y-2'
                    : ''
          }
        >
          <MetricCard {...card} delay={0.05 + i * 0.06} />
        </div>
      ))}
    </div>
  )
}
