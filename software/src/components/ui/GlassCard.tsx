import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  gradient?: boolean
  strong?: boolean
  className?: string
}

export function GlassCard({
  children,
  gradient = false,
  strong = false,
  className = '',
  ...rest
}: GlassCardProps) {
  return (
    <motion.div
      className={[
        strong ? 'glass-strong' : 'glass',
        'rounded-[18px]',
        gradient ? 'gradient-border' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      whileHover={{ y: -2, transition: { type: 'spring', stiffness: 400, damping: 28 } }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
