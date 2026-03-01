import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Sparkles, Bell } from 'lucide-react'
import { formatImageUrl } from '../utils/image'

type DashboardLayoutProps = {
  sidebarItems: { label: string; path?: string; active?: boolean; icon: ReactNode; onClick?: () => void }[]
  children: ReactNode
  headerContent?: ReactNode
}

export function DashboardLayout({ sidebarItems, children, headerContent }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const userName = localStorage.getItem('userName') || 'Guest'
  const profileImage = localStorage.getItem('profileImage') || undefined

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="hidden w-72 flex-shrink-0 bg-white border-r border-brand-100/50 md:flex flex-col shadow-sm">
        <div className="flex items-center gap-3 px-8 py-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-xl shadow-brand-600/20">
            <span className="text-xl font-black">W</span>
          </div>
          <div>
            <div className="text-lg font-black tracking-tight text-slate-900 leading-none">Wellness Hub</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-brand-600 mt-1">Holistic Portal</div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          <div className="px-4 mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Main Menu</div>
          {sidebarItems.map((item) => {
            const isActive = item.active
            return (
              <Link
                key={item.label}
                to={item.path || '#'}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault()
                    item.onClick()
                  }
                }}
                className={`flex items-center gap-4 rounded-2xl px-5 py-3.5 text-sm font-black transition-all group ${isActive
                  ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-100/50'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <span className={`${isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-brand-500'} transition-colors`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-sm font-black text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex h-24 items-center justify-between border-b border-brand-100/50 bg-white/80 backdrop-blur-md px-10 shadow-sm z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dashboard</p>
              <Sparkles size={12} className="text-brand-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">Welcome, {userName}</h1>
          </div>

          <div className="flex items-center gap-6">
            {headerContent}
            <div className="relative group cursor-pointer p-2 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all">
              <Bell size={20} className="text-slate-400 group-hover:text-brand-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-black text-slate-900 leading-none">{userName}</div>
                <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Gold Member</div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-500 text-lg font-black text-white shadow-lg overflow-hidden">
                {profileImage ? (
                  <img src={formatImageUrl(profileImage)} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  userName[0]
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-10 py-10 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

