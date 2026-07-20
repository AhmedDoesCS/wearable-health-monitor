import { useId, useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Reading, TimeRange } from '../../data/types'
import { useTheme } from '../../theme/ThemeProvider'

interface TimeSeriesChartProps {
  readings: Reading[]
  dataKey: 'bpm' | 'hrv_ms'
  range: TimeRange
  unit: string
  label: string
}

function formatTick(iso: string, range: TimeRange) {
  const d = new Date(iso)
  if (range === '24h') {
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  }
  if (range === '7d') {
    return d.toLocaleDateString(undefined, { weekday: 'short', hour: 'numeric' })
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function TimeSeriesChart({
  readings,
  dataKey,
  range,
  unit,
  label,
}: TimeSeriesChartProps) {
  const { resolved } = useTheme()
  const gradId = useId().replace(/:/g, '')
  const strokeId = `stroke-${gradId}`
  const fillId = `fill-${gradId}`

  const data = useMemo(
    () =>
      readings.map((r) => ({
        t: r.created_at,
        value: r[dataKey],
      })),
    [readings, dataKey],
  )

  const accent1 = resolved === 'dark' ? '#00d4ff' : '#00b8e6'
  const accent2 = resolved === 'dark' ? '#0088ff' : '#0077e6'
  const accent3 = resolved === 'dark' ? '#00ffc8' : '#00d4a8'

  if (data.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center text-sm text-[var(--text-tertiary)]">
        Waiting for {label.toLowerCase()} samples…
      </div>
    )
  }

  return (
    <div className="h-[240px] sm:h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={accent1} />
              <stop offset="50%" stopColor={accent2} />
              <stop offset="100%" stopColor={accent3} />
            </linearGradient>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent2} stopOpacity={resolved === 'dark' ? 0.35 : 0.22} />
              <stop offset="100%" stopColor={accent3} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} strokeDasharray="3 8" />
          <XAxis
            dataKey="t"
            tickFormatter={(v) => formatTick(String(v), range)}
            tick={{ fill: 'var(--chart-tick)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            tick={{ fill: 'var(--chart-tick)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-elevated-strong)',
              border: '1px solid var(--border-glass)',
              borderRadius: 14,
              backdropFilter: 'blur(20px)',
              boxShadow: 'var(--shadow-elevated)',
              color: 'var(--text-primary)',
              fontSize: 13,
            }}
            labelStyle={{ color: 'var(--text-tertiary)', marginBottom: 4 }}
            formatter={(value) => [`${Number(value).toFixed(dataKey === 'bpm' ? 0 : 0)} ${unit}`, label]}
            labelFormatter={(v) =>
              new Date(String(v)).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })
            }
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={`url(#${strokeId})`}
            fill={`url(#${fillId})`}
            strokeWidth={2.25}
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-out"
            dot={false}
            activeDot={{
              r: 5,
              strokeWidth: 2,
              stroke: accent1,
              fill: 'var(--bg-base)',
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
