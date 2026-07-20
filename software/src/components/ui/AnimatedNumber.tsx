import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'

interface AnimatedNumberProps {
  value: number
  decimals?: number
  className?: string
}

export function AnimatedNumber({ value, decimals = 0, className = '' }: AnimatedNumberProps) {
  const spring = useSpring(value, { stiffness: 120, damping: 22, mass: 0.8 })
  const display = useTransform(spring, (latest) =>
    latest.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
  )

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span className={`metric-num ${className}`}>{display}</motion.span>
}
