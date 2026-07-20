import { useCallback, useEffect, useState } from 'react'
import { readingsProvider } from '../data/readingsProvider'
import type { DailyGoals, Reading, TimeRange } from '../data/types'

function rangeToDates(range: TimeRange): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date(end)
  if (range === '24h') start.setHours(start.getHours() - 24)
  else if (range === '7d') start.setDate(start.getDate() - 7)
  else start.setDate(start.getDate() - 30)
  return { start, end }
}

/** Downsample dense series so charts stay smooth. */
function downsample(readings: Reading[], maxPoints = 180): Reading[] {
  if (readings.length <= maxPoints) return readings
  const step = Math.ceil(readings.length / maxPoints)
  const out: Reading[] = []
  for (let i = 0; i < readings.length; i += step) out.push(readings[i])
  const last = readings[readings.length - 1]
  if (out[out.length - 1]?.id !== last.id) out.push(last)
  return out
}

export function useLatestReading() {
  const [reading, setReading] = useState<Reading | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    readingsProvider
      .getLatestReading()
      .then((r) => {
        if (alive) {
          setReading(r)
          setError(null)
        }
      })
      .catch((e: unknown) => {
        if (alive) setError(e instanceof Error ? e.message : 'Failed to load')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    const unsub = readingsProvider.subscribeToNewReadings((next) => {
      if (alive) setReading(next)
    })

    return () => {
      alive = false
      unsub()
    }
  }, [])

  return { reading, loading, error, empty: !loading && !reading }
}

export function useHistoricalReadings(range: TimeRange) {
  const [readings, setReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { start, end } = rangeToDates(range)
    const data = await readingsProvider.getReadingsInRange(start, end)
    setReadings(downsample(data, range === '24h' ? 120 : range === '7d' ? 160 : 200))
    setLoading(false)
  }, [range])

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      const { start, end } = rangeToDates(range)
      const data = await readingsProvider.getReadingsInRange(start, end)
      if (alive) {
        setReadings(downsample(data, range === '24h' ? 120 : range === '7d' ? 160 : 200))
        setLoading(false)
      }
    })()

    const unsub = readingsProvider.subscribeToNewReadings((next) => {
      if (!alive) return
      setReadings((prev) => {
        const { start } = rangeToDates(range)
        if (new Date(next.created_at) < start) return prev
        return downsample([...prev, next], range === '24h' ? 120 : range === '7d' ? 160 : 200)
      })
    })

    return () => {
      alive = false
      unsub()
    }
  }, [range])

  return { readings, loading, refresh, empty: !loading && readings.length === 0 }
}

export function useDailyGoals(): DailyGoals {
  return readingsProvider.getDailyGoals()
}

/** Approximate today's calorie burn from kcal_per_min samples. */
export function estimateTodayCalories(readings: Reading[]): number {
  if (readings.length < 2) return 0
  const todayKey = new Date().toDateString()
  const todayReadings = readings.filter((r) => new Date(r.created_at).toDateString() === todayKey)
  if (todayReadings.length < 2) return 0

  let kcal = 0
  for (let i = 1; i < todayReadings.length; i++) {
    const dtMin =
      (new Date(todayReadings[i].created_at).getTime() -
        new Date(todayReadings[i - 1].created_at).getTime()) /
      60_000
    kcal += todayReadings[i].kcal_per_min * Math.min(dtMin, 10)
  }
  return Math.round(kcal)
}

export function useTodayStats(latest: Reading | null) {
  const [calories, setCalories] = useState(0)
  const goals = useDailyGoals()

  useEffect(() => {
    let alive = true
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()

    readingsProvider.getReadingsInRange(start, end).then((data) => {
      if (alive) setCalories(estimateTodayCalories(data))
    })

    const unsub = readingsProvider.subscribeToNewReadings(() => {
      readingsProvider.getReadingsInRange(start, new Date()).then((data) => {
        if (alive) setCalories(estimateTodayCalories(data))
      })
    })

    return () => {
      alive = false
      unsub()
    }
  }, [latest?.id])

  return {
    steps: latest?.steps ?? 0,
    calories,
    goals,
  }
}
