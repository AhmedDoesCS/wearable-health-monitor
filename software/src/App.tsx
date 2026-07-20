import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { DailySummary } from './components/activity/DailySummary'
import { ChartSection } from './components/charts/ChartSection'
import { EmptyState } from './components/EmptyState'
import { AppShell } from './components/layout/AppShell'
import type { NavId } from './components/layout/Sidebar'
import { LiveBadge } from './components/LiveBadge'
import { MetricsGrid } from './components/metrics/MetricsGrid'
import { GlassCard } from './components/ui/GlassCard'
import { ThemeToggle } from './components/ui/ThemeToggle'
import type { TimeRange } from './data/types'
import { useHistoricalReadings, useLatestReading, useTodayStats } from './hooks/useReadings'

const TITLES: Record<NavId, { title: string; subtitle: string }> = {
  overview: {
    title: 'Overview',
    subtitle: 'Live vitals from your wearable',
  },
  vitals: {
    title: 'Vitals',
    subtitle: 'Heart rate, oxygen, temperature & HRV',
  },
  activity: {
    title: 'Activity',
    subtitle: 'Steps and calorie progress',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Appearance and data source',
  },
}

export default function App() {
  const [nav, setNav] = useState<NavId>('overview')
  const [range, setRange] = useState<TimeRange>('24h')
  const { reading, loading: latestLoading, empty } = useLatestReading()
  const { readings, loading: histLoading } = useHistoricalReadings(range)
  const { steps, calories, goals } = useTodayStats(reading)

  const meta = TITLES[nav]

  return (
    <AppShell
      active={nav}
      onNavigate={setNav}
      title={meta.title}
      subtitle={meta.subtitle}
      headerRight={<LiveBadge live={!latestLoading && !!reading} />}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={nav}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="space-y-8 lg:space-y-10"
        >
          {empty ? (
            <EmptyState />
          ) : (
            <>
              {(nav === 'overview' || nav === 'vitals') && (
                <section>
                  <MetricsGrid reading={reading} loading={latestLoading} />
                </section>
              )}

              {(nav === 'overview' || nav === 'vitals') && (
                <section>
                  <ChartSection
                    readings={readings}
                    loading={histLoading}
                    range={range}
                    onRangeChange={setRange}
                  />
                </section>
              )}

              {(nav === 'overview' || nav === 'activity') && (
                <section>
                  <DailySummary
                    steps={steps}
                    stepsGoal={goals.steps}
                    calories={calories}
                    caloriesGoal={goals.calories}
                    loading={latestLoading}
                  />
                </section>
              )}

              {nav === 'settings' && <SettingsPanel />}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  )
}

function SettingsPanel() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
      <GlassCard
        className="p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      >
        <h2 className="text-base font-semibold tracking-tight mb-1">Appearance</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-5">
          Light and dark modes are fully designed. Your choice is saved on this device.
        </p>
        <ThemeToggle />
      </GlassCard>

      <GlassCard
        className="p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.06 }}
      >
        <h2 className="text-base font-semibold tracking-tight mb-1">Data source</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
          Currently using the local mock provider with realistic simulated readings.
          When Supabase is ready, only{' '}
          <code className="text-[12px] px-1.5 py-0.5 rounded-md bg-[var(--bg-fill)] text-[var(--accent-2)]">
            src/data/readingsProvider.ts
          </code>{' '}
          needs to change.
        </p>
        <div className="rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-fill)] px-4 py-3">
          <p className="label-caps mb-1">Provider</p>
          <p className="text-sm font-medium tracking-tight">Mock · random-walk · live every 30s</p>
        </div>
      </GlassCard>
    </div>
  )
}
