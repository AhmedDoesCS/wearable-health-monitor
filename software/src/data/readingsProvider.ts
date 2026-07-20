/**
 * ============================================================================
 * MOCK DATA PROVIDER — temporary implementation
 * ============================================================================
 * This module is the ONLY place that generates or fetches reading data.
 * Every UI component must import from here (or consume hooks that wrap this
 * interface). Nothing else in the app should know whether data is mocked
 * or comes from a remote backend.
 *
 * ---------------------------------------------------------------------------
 * HOW TO REPLACE WITH SUPABASE LATER
 * ---------------------------------------------------------------------------
 * Target table: `public.readings`
 * Columns: id (uuid), created_at (timestamptz), bpm (float), spo2 (float),
 *          steps (int), temp_c (float), kcal_per_min (float), hrv_ms (float)
 *
 * 1. Install `@supabase/supabase-js` and create a client with
 *    VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.
 * 2. `getLatestReading`:
 *      .from('readings').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle()
 * 3. `getReadingsInRange(start, end)`:
 *      .from('readings').select('*')
 *        .gte('created_at', start.toISOString())
 *        .lte('created_at', end.toISOString())
 *        .order('created_at', { ascending: true })
 * 4. `subscribeToNewReadings(callback)`:
 *      supabase.channel('readings-live')
 *        .on('postgres_changes',
 *            { event: 'INSERT', schema: 'public', table: 'readings' },
 *            (payload) => callback(payload.new as Reading))
 *        .subscribe()
 *      Return a function that calls channel.unsubscribe().
 * 5. Keep this file's exported function names and return types identical
 *    so the rest of the app needs zero changes.
 * ============================================================================
 */

import type { DailyGoals, Reading, ReadingsProvider, Unsubscribe } from './types'

const INTERVAL_MS = 30_000
const HISTORY_DAYS = 30
const DAILY_GOALS: DailyGoals = { steps: 10_000, calories: 500 }

function mulberry32(seed: number) {
  return function next() {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function round(n: number, digits = 1) {
  const f = 10 ** digits
  return Math.round(n * f) / f
}

function hourOfDay(date: Date) {
  return date.getHours() + date.getMinutes() / 60
}

/** Activity intensity 0–1 based on time of day (sleep → commute → work → gym). */
function activityFactor(hour: number, rng: () => number) {
  if (hour < 6 || hour >= 23) return 0.05 + rng() * 0.05
  if (hour < 8) return 0.35 + rng() * 0.2
  if (hour >= 12 && hour < 13) return 0.4 + rng() * 0.15
  if (hour >= 17 && hour < 19) return 0.65 + rng() * 0.3
  if (hour >= 19 && hour < 21) return 0.25 + rng() * 0.15
  return 0.15 + rng() * 0.15
}

/** Coarser spacing for older history keeps memory light while staying believable. */
function stepForAge(ageMs: number) {
  const day = 24 * 60 * 60 * 1000
  if (ageMs <= day) return INTERVAL_MS
  if (ageMs <= 7 * day) return 2 * 60 * 1000
  return 5 * 60 * 1000
}

function generateHistory(seed: number): Reading[] {
  const rng = mulberry32(seed)
  const now = Date.now()
  const start = now - HISTORY_DAYS * 24 * 60 * 60 * 1000
  const readings: Reading[] = []

  let bpm = 68 + rng() * 8
  let spo2 = 97.5 + rng() * 1.2
  let temp = 33.2 + rng() * 0.6
  let hrv = 48 + rng() * 20
  let dayKey = ''
  let stepsToday = 0
  let kcalBaseline = 0.08

  for (let t = start; t <= now; ) {
    const date = new Date(t)
    const key = date.toISOString().slice(0, 10)
    if (key !== dayKey) {
      dayKey = key
      stepsToday = Math.floor(rng() * 40)
    }

    const hour = hourOfDay(date)
    const activity = activityFactor(hour, rng)
    const spike = rng() < 0.012 ? 25 + rng() * 35 : 0

    bpm = clamp(bpm + (rng() - 0.48) * 2.2 + activity * 1.4 + spike * 0.35 - (bpm - (62 + activity * 40)) * 0.04, 48, 165)
    spo2 = clamp(spo2 + (rng() - 0.5) * 0.18 - spike * 0.01, 94, 100)
    temp = clamp(temp + (rng() - 0.5) * 0.04 + activity * 0.01, 31.5, 36.2)
    hrv = clamp(hrv + (rng() - 0.5) * 3.5 - activity * 2.5 - spike * 0.2, 18, 110)

    const stepMs = stepForAge(now - t)
    const awake = hour >= 6.5 && hour < 22.5
    const stepDelta = awake
      ? Math.floor(activity * (8 + rng() * 18) * (stepMs / INTERVAL_MS) + (rng() < 0.08 ? rng() * 40 : 0))
      : rng() < 0.02
        ? 1
        : 0
    stepsToday += stepDelta

    kcalBaseline = clamp(0.06 + activity * 0.35 + (spike > 0 ? 0.4 : 0) + (rng() - 0.5) * 0.04, 0.04, 1.2)

    readings.push({
      id: `mock-${t}`,
      created_at: date.toISOString(),
      bpm: round(bpm, 1),
      spo2: round(spo2, 1),
      steps: stepsToday,
      temp_c: round(temp, 2),
      kcal_per_min: round(kcalBaseline, 3),
      hrv_ms: round(hrv, 1),
    })

    t += stepMs
  }

  return readings
}

const SEED = (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0
let store = generateHistory(SEED)
let liveTimer: ReturnType<typeof setInterval> | null = null
const subscribers = new Set<(reading: Reading) => void>()

function ensureLiveLoop() {
  if (liveTimer) return
  liveTimer = setInterval(() => {
    const prev = store[store.length - 1]
    if (!prev) return

    const now = new Date()
    const hour = hourOfDay(now)
    const rng = Math.random
    const activity = activityFactor(hour, rng)
    const spike = rng() < 0.02 ? 20 + rng() * 30 : 0
    const sameDay = prev.created_at.slice(0, 10) === now.toISOString().slice(0, 10)

    const next: Reading = {
      id: `mock-${now.getTime()}`,
      created_at: now.toISOString(),
      bpm: round(clamp(prev.bpm + (rng() - 0.48) * 2.4 + activity * 1.2 + spike * 0.3, 48, 165), 1),
      spo2: round(clamp(prev.spo2 + (rng() - 0.5) * 0.2, 94, 100), 1),
      steps: (sameDay ? prev.steps : 0) + (hour >= 6.5 && hour < 22.5 ? Math.floor(activity * (6 + rng() * 14)) : 0),
      temp_c: round(clamp(prev.temp_c + (rng() - 0.5) * 0.05, 31.5, 36.2), 2),
      kcal_per_min: round(clamp(0.06 + activity * 0.35 + (rng() - 0.5) * 0.05, 0.04, 1.2), 3),
      hrv_ms: round(clamp(prev.hrv_ms + (rng() - 0.5) * 3.2 - activity * 2, 18, 110), 1),
    }

    store = [...store.slice(-Math.ceil((HISTORY_DAYS * 24 * 60 * 60 * 1000) / INTERVAL_MS)), next]
    subscribers.forEach((cb) => cb(next))
  }, INTERVAL_MS)
}

function delay<T>(value: T, ms = 280 + Math.random() * 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export const readingsProvider: ReadingsProvider = {
  async getLatestReading() {
    ensureLiveLoop()
    return delay(store[store.length - 1] ?? null)
  },

  async getReadingsInRange(start: Date, end: Date) {
    ensureLiveLoop()
    const startMs = start.getTime()
    const endMs = end.getTime()
    const filtered = store.filter((r) => {
      const t = new Date(r.created_at).getTime()
      return t >= startMs && t <= endMs
    })
    return delay(filtered)
  },

  subscribeToNewReadings(callback) {
    ensureLiveLoop()
    subscribers.add(callback)
    const unsub: Unsubscribe = () => {
      subscribers.delete(callback)
      if (subscribers.size === 0 && liveTimer) {
        clearInterval(liveTimer)
        liveTimer = null
      }
    }
    return unsub
  },

  getDailyGoals() {
    return DAILY_GOALS
  },
}

/** Convenience re-export so consumers have a single import path. */
export type { DailyGoals, Reading, ReadingsProvider, TimeRange, Unsubscribe } from './types'
