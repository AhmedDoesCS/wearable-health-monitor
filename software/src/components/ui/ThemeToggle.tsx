import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../theme/ThemeProvider'

export function ThemeToggle() {
  const { resolved, toggleDark } = useTheme()
  const isDark = resolved === 'dark'

  return (
    <div className="flex items-center gap-3">
      <Sun size={16} strokeWidth={1.5} className="text-[var(--text-tertiary)]" aria-hidden />
      <button
        type="button"
        className="toggle pressable"
        data-on={isDark}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={isDark}
        onClick={toggleDark}
      >
        <motion.div
          className="toggle-knob"
          animate={{ x: isDark ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        />
      </button>
      <Moon size={16} strokeWidth={1.5} className="text-[var(--text-tertiary)]" aria-hidden />
    </div>
  )
}
