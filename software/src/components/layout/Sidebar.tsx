import { Activity, HeartPulse, LayoutDashboard, Settings2 } from 'lucide-react'
import { ThemeToggle } from '../ui/ThemeToggle'

export type NavId = 'overview' | 'vitals' | 'activity' | 'settings'

const NAV: { id: NavId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'vitals', label: 'Vitals', icon: HeartPulse },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings2 },
]

interface SidebarProps {
  active: NavId
  onNavigate: (id: NavId) => void
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-[220px] flex-col border-r border-[var(--separator)] bg-[var(--bg-sidebar)] backdrop-blur-2xl px-4 py-6">
      <div className="px-3 mb-8">
        <div className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-[10px] flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2) 55%, var(--accent-3))',
              boxShadow: '0 0 20px var(--accent-glow)',
            }}
          >
            <HeartPulse size={16} strokeWidth={1.75} className="text-white" />
          </div>
          <div>
            <p className="text-[15px] font-semibold tracking-tight leading-none">Pulse</p>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-1 tracking-wide">Health Monitor</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={[
                'pressable w-full flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13.5px] font-medium tracking-tight transition-colors',
                isActive
                  ? 'bg-[var(--accent-muted)] text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-fill)] hover:text-[var(--text-primary)]',
              ].join(' ')}
            >
              <Icon
                size={18}
                strokeWidth={1.5}
                className={isActive ? 'text-[var(--accent-2)] dark:text-[var(--accent-1)]' : ''}
              />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="px-2 pt-4 border-t border-[var(--separator)]">
        <p className="label-caps mb-3 px-1">Appearance</p>
        <ThemeToggle />
      </div>
    </aside>
  )
}

export { NAV as SIDEBAR_NAV }
