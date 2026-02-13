import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { api } from '../api'

export function PractitionerDashboard() {
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    api.getProfile().then(setProfile).catch(console.error)
  }, [])

  if (!profile) return <div>Loading...</div>

  return (
    <DashboardLayout
      sidebarItems={[
        { label: 'Dashboard', active: true },
        { label: 'Profile & Verification', to: '#' },
        { label: 'Session Requests', to: '#' },
        { label: 'Calendar', to: '#' },
        { label: 'Community Q&A', to: '#' },
        { label: 'Reviews', to: '#' },
      ]}
    >
      <div className="grid gap-5 lg:grid-cols-[2fr,1.1fr]">
        <section className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-soft-card">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-600">
                Pending Sessions
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">3</p>
              <p className="mt-1 text-xs text-slate-600">New requests awaiting your response.</p>
              <button className="mt-3 rounded-full bg-brand-600 px-3 py-1 text-[11px] font-semibold text-white">
                View all
              </button>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 p-4 shadow-soft-card">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">
                Verification Status
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{profile.verificationStatus || 'Pending'}</p>
              <p className="mt-1 text-xs text-slate-600">
                {profile.verificationStatus === 'APPROVED' ? 'Your account is verified.' : 'Complete your profile to gain full access to the marketplace.'}
              </p>
              {profile.verificationStatus !== 'APPROVED' && (
                <button className="mt-3 rounded-full border border-amber-600/60 px-3 py-1 text-[11px] font-semibold text-amber-800">
                  Complete profile
                </button>
              )}
            </div>
          </div>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">Session Requests</h2>
            <div className="mt-3 space-y-3">
              {[
                { name: 'Sarah M.', datetime: 'Fri, April 26, 2024 · 10:00 AM' },
                { name: 'Alex T.', datetime: 'Fri, April 26, 2024 · 3:00 PM' },
              ].map((req) => (
                <article
                  key={req.name}
                  className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-soft-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-brand-800">
                      {req.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{req.name}</p>
                      <p className="text-xs text-slate-500">{req.datetime}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-[11px]">
                    <button className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700">
                      Reject
                    </button>
                    <button className="rounded-full bg-brand-600 px-3 py-1 font-semibold text-white">
                      Accept
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">Latest Reviews</h2>
            <div className="mt-3 space-y-3 rounded-2xl bg-white p-4 text-xs text-slate-700 shadow-soft-card">
              <p className="font-semibold text-slate-900">James R.</p>
              <p className="mt-1">
                “Great session! I feel much better after my acupuncture therapy. Thank you!”
              </p>
            </div>
          </section>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl bg-white p-4 shadow-soft-card">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Calendar</h2>
              <span className="rounded-full bg-brand-50 px-2 py-1 text-[11px] font-medium text-brand-700">
                April 2024
              </span>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] text-slate-600">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => (
                <div key={d} className="font-semibold">
                  {d}
                </div>
              ))}
              {Array.from({ length: 30 }).map((_, idx) => {
                const day = idx + 1
                const isActive = [12, 18, 24].includes(day)
                return (
                  <div
                    key={day}
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] ${
                      isActive
                        ? 'bg-brand-600 text-white'
                        : 'bg-transparent text-slate-700 hover:bg-emerald-50'
                    }`}
                  >
                    {day}
                  </div>
                )
              })}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-4 shadow-soft-card">
            <h2 className="text-sm font-semibold text-slate-900">Answer Community Q&amp;A</h2>
            <div className="mt-3 space-y-3 text-xs text-slate-700">
              <div>
                <p>Is meditation helpful for anxiety?</p>
                <button className="mt-2 rounded-full bg-brand-600 px-3 py-1 text-[11px] font-semibold text-white">
                  Answer
                </button>
              </div>
              <div>
                <p>How often should I get a massage?</p>
                <button className="mt-2 rounded-full bg-brand-600 px-3 py-1 text-[11px] font-semibold text-white">
                  Answer
                </button>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </DashboardLayout>
  )
}

