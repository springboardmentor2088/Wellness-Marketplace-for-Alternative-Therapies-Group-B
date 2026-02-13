import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { api } from '../api'

export function UserDashboard() {
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    api.getProfile().then(setProfile).catch(console.error)
  }, [])

  if (!profile) return <div>Loading...</div>

  return (
    <DashboardLayout
      sidebarItems={[
        { label: 'Dashboard', active: true },
        { label: 'Book Therapy', to: '#' },
        { label: 'Product Store', to: '#' },
        { label: 'My Orders', to: '#' },
        { label: 'My Sessions', to: '#' },
        { label: 'Reviews', to: '#' },
        { label: 'Community Q&A', to: '#' },
        { label: 'AI Recommendations', to: '#' },
      ]}
    >
      <div className="grid gap-5 lg:grid-cols-[2fr,1.2fr]">
        <section className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-soft-card">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-600">
                Upcoming Therapy
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                Acupuncture with Dr. Smith
              </p>
              <p className="mt-1 text-xs text-slate-600">Fri, April 26, 2024 · 10:00 AM</p>
              <button className="mt-3 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-brand-800">
                Confirmed
              </button>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 p-4 shadow-soft-card">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">
                Wellness Points
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">120</p>
              <p className="mt-1 text-xs text-slate-600">
                Earned from your recent wellness activities.
              </p>
              <button className="mt-3 rounded-full border border-amber-500/60 px-3 py-1 text-[11px] font-semibold text-amber-800">
                View details
              </button>
            </div>
          </div>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">Book a Therapy Session</h2>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <article className="flex gap-3 rounded-2xl bg-white p-4 shadow-soft-card">
                <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-[url('https://images.pexels.com/photos/3738341/pexels-photo-3738341.jpeg?auto=compress&cs=tinysrgb&w=200')] bg-cover bg-center" />
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Dr. Emily Johnson</p>
                    <p className="text-xs text-slate-500">Ayurveda · 4.9 ★</p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>Fri, April 26 · 10:00 AM</span>
                    <button className="rounded-full bg-brand-600 px-3 py-1 text-[11px] font-semibold text-white">
                      Book now
                    </button>
                  </div>
                </div>
              </article>
              <article className="flex gap-3 rounded-2xl bg-white p-4 shadow-soft-card">
                <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-[url('https://images.pexels.com/photos/3738413/pexels-photo-3738413.jpeg?auto=compress&cs=tinysrgb&w=200')] bg-cover bg-center" />
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Dr. John Smith</p>
                    <p className="text-xs text-slate-500">Acupuncture · 4.8 ★</p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>Sun, April 28 · 2:00 PM</span>
                    <button className="rounded-full bg-brand-600 px-3 py-1 text-[11px] font-semibold text-white">
                      Book now
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl bg-white p-4 shadow-soft-card">
            <h2 className="text-sm font-semibold text-slate-900">Latest Orders</h2>
            <div className="mt-3 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Essential Oils</p>
                  <p className="text-slate-500">$25 · Delivered</p>
                </div>
                <button className="rounded-full border border-emerald-200 px-3 py-1 text-[11px] font-semibold text-brand-700">
                  View details
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-4 shadow-soft-card">
            <h2 className="text-sm font-semibold text-slate-900">Community Q&amp;A</h2>
            <div className="mt-3 space-y-3 text-xs text-slate-700">
              <div>
                <p>What are the benefits of acupuncture?</p>
                <button className="mt-2 rounded-full border border-brand-500/50 px-3 py-1 text-[11px] font-semibold text-brand-700">
                  View answers
                </button>
              </div>
              <div>
                <p>Tips for better sleep?</p>
                <button className="mt-2 rounded-full border border-brand-500/50 px-3 py-1 text-[11px] font-semibold text-brand-700">
                  View answers
                </button>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </DashboardLayout>
  )
}

