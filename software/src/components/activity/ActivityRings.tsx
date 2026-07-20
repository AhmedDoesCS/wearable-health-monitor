import { motion } from 'framer-motion'

interface RingSpec {
  progress: number
  color: string
  track: string
  radius: number
  stroke: number
}

function Ring({ progress, color, track, radius, stroke }: RingSpec) {
  const c = 2 * Math.PI * radius
  const clamped = Math.min(1, Math.max(0, progress))
  const offset = c * (1 - clamped)

  return (
    <>
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke={track}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      <motion.circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ type: 'spring', stiffness: 80, damping: 20, mass: 1 }}
        style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
      />
    </>
  )
}

interface ActivityRingsProps {
  steps: number
  stepsGoal: number
  calories: number
  caloriesGoal: number
}

export function ActivityRings({ steps, stepsGoal, calories, caloriesGoal }: ActivityRingsProps) {
  const stepsProgress = stepsGoal > 0 ? steps / stepsGoal : 0
  const calProgress = caloriesGoal > 0 ? calories / caloriesGoal : 0

  return (
    <div className="relative mx-auto w-[200px] h-[200px] sm:w-[220px] sm:h-[220px]">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <Ring
          progress={stepsProgress}
          color="var(--ring-steps)"
          track="var(--bg-fill-strong)"
          radius={78}
          stroke={12}
        />
        <Ring
          progress={calProgress}
          color="var(--ring-calories)"
          track="var(--bg-fill-strong)"
          radius={58}
          stroke={12}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
        <span className="label-caps mb-1">Today</span>
        <span className="metric-num text-2xl text-[var(--text-primary)]">
          {Math.round(Math.min(stepsProgress, calProgress) * 100)}%
        </span>
      </div>
    </div>
  )
}
