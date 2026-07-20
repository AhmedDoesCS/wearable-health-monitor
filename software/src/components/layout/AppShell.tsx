import type { ReactNode } from 'react'
import { Sidebar, type NavId } from './Sidebar'
import { TabBar } from './TabBar'
import { ThemeToggle } from '../ui/ThemeToggle'

interface AppShellProps {
  active: NavId
  onNavigate: (id: NavId) => void
  title: string
  subtitle?: string
  children: ReactNode
  headerRight?: ReactNode
}

export function AppShell({
  active,
  onNavigate,
  title,
  subtitle,
  children,
  headerRight,
}: AppShellProps) {
  return (
    <>
      <div className="app-backdrop" aria-hidden />
      <Sidebar active={active} onNavigate={onNavigate} />
      <div className="md:pl-[220px] min-h-dvh flex flex-col">
        <header
          className="sticky top-0 z-20 px-5 sm:px-8 pt-5 sm:pt-7 pb-3 backdrop-blur-xl border-b border-transparent"
          style={{ background: 'color-mix(in srgb, var(--bg-base) 72%, transparent)' }}
        >
          <div className="flex items-start justify-between gap-4 max-w-[1200px]">
            <div>
              <p className="label-caps mb-1.5 md:hidden">Pulse</p>
              <h1 className="text-[1.75rem] sm:text-[2rem] font-semibold tracking-tight leading-none">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-sm text-[var(--text-secondary)] tracking-wide">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-4 shrink-0 pt-1">
              {headerRight}
              <div className="md:hidden">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-5 sm:px-8 pb-28 md:pb-12 pt-4 sm:pt-6">
          <div className="max-w-[1200px] mx-auto space-y-8 lg:space-y-10">{children}</div>
        </main>
      </div>
      <TabBar active={active} onNavigate={onNavigate} />
    </>
  )
}
