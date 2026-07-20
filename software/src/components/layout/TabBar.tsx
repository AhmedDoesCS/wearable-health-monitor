import { SIDEBAR_NAV, type NavId } from './Sidebar'

interface TabBarProps {
  active: NavId
  onNavigate: (id: NavId) => void
}

export function TabBar({ active, onNavigate }: TabBarProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--separator)] bg-[var(--bg-sidebar)] backdrop-blur-2xl"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <div className="flex items-stretch justify-around px-2 pt-1.5 pb-1.5">
        {SIDEBAR_NAV.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className="pressable flex flex-1 flex-col items-center gap-0.5 py-1.5 rounded-[12px]"
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={22}
                strokeWidth={1.5}
                className={
                  isActive
                    ? 'text-[var(--accent-2)] dark:text-[var(--accent-1)]'
                    : 'text-[var(--text-tertiary)]'
                }
              />
              <span
                className={[
                  'text-[10px] font-medium tracking-wide',
                  isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]',
                ].join(' ')}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
