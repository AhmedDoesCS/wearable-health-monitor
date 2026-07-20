import { motion } from 'framer-motion'
import { useLayoutEffect, useRef, useState } from 'react'

export interface SegmentOption<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel = 'Segmented control',
}: SegmentedControlProps<T>) {
  const refs = useRef<Map<T, HTMLButtonElement>>(new Map())
  const [thumb, setThumb] = useState({ left: 0, width: 0 })

  useLayoutEffect(() => {
    const el = refs.current.get(value)
    if (!el) return
    setThumb({ left: el.offsetLeft, width: el.offsetWidth })
  }, [value, options])

  return (
    <div className="segmented" role="tablist" aria-label={ariaLabel}>
      <motion.div
        className="segmented-thumb"
        animate={{ left: thumb.left, width: thumb.width }}
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        style={{ left: thumb.left, width: thumb.width }}
      />
      {options.map((opt) => (
        <button
          key={opt.value}
          ref={(node) => {
            if (node) refs.current.set(opt.value, node)
            else refs.current.delete(opt.value)
          }}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          data-active={value === opt.value}
          className="segmented-btn pressable"
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
