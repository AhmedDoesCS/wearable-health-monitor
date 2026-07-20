export interface Reading {
  id: string
  created_at: string
  bpm: number
  spo2: number
  steps: number
  temp_c: number
  kcal_per_min: number
  hrv_ms: number
}

export type TimeRange = '24h' | '7d' | '30d'

export interface DailyGoals {
  steps: number
  calories: number
}

export type Unsubscribe = () => void

/**
 * Sole data-access contract for the dashboard.
 * UI code must depend only on this interface — never on a specific backend.
 */
export interface ReadingsProvider {
  getLatestReading(): Promise<Reading | null>
  getReadingsInRange(start: Date, end: Date): Promise<Reading[]>
  subscribeToNewReadings(callback: (reading: Reading) => void): Unsubscribe
  getDailyGoals(): DailyGoals
}
