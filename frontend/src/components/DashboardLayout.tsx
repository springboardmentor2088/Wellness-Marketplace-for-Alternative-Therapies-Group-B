import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type DashboardLayoutProps = {
  sidebarItems: { label: string; path?: string; active?: boolean; icon?: ReactNode }[]
  children: ReactNode
}

export function DashboardLayout({ sidebarItems, children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-brand-50/80">
      <aside className="hidden w-64 flex-shrink-0 bg-gradient-to-b from-brand-800 to-brand-700 text-slate-50 shadow-2xl md:block">
        <div className="flex items-center gap-2 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white">
            <span className="text-lg font-semibold">W</span>
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide">Wellness Hub</div>
            <div className="text-xs text-emerald-100">Wellness Marketplace</div>
          </div>
        </div>
        <nav className="mt-2 space-y-1 px-3">
          {sidebarItems.map((item) => {
            const baseClasses =
              'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium'
            const activeClasses = item.active
              ? 'bg-white text-brand-800 shadow-soft-card'
              : 'text-emerald-100/90 hover:bg-brand-600/60'

            const content = (
              <>
                {item.icon && <span className="opacity-70">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </>
            )

            if (item.path) {
              return (
                <Link key={item.label} to={item.path} className={`${baseClasses} ${activeClasses}`}>
                  {content}
                </Link>
              )
            }

            return (
              <div key={item.label} className={`${baseClasses} ${activeClasses}`}>
                {content}
              </div>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1">
        <header className="flex items-center justify-between border-b border-emerald-100 bg-white/80 px-4 py-4 shadow-sm sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Dashboard
            </p>
            <p className="text-lg font-semibold text-slate-800">Welcome, [Your Name]</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100">
              Wellness Points: 120
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-200 text-sm font-semibold text-brand-800">
              Y
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">
          {children}
        </div>
      </main>
    </div>
  )
}

