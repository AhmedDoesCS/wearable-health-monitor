import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <motion.div
      className={`rounded-[14px] bg-[var(--bg-skeleton)] ${className}`}
      animate={{ opacity: [0.45, 0.85, 0.45] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

export function MetricCardSkeleton() {
  return (
    <div className="glass gradient-border rounded-[18px] p-5 min-h-[148px]">
      <div className="flex items-start justify-between mb-6">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-9 w-9 !rounded-full" />
      </div>
      <Skeleton className="h-10 w-24 mb-2" />
      <Skeleton className="h-3 w-12" />
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="glass rounded-[22px] p-6 min-h-[320px]">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-40 !rounded-full" />
      </div>
      <Skeleton className="h-[220px] w-full !rounded-[16px]" />
    </div>
  )
}
