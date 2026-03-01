import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { SessionCalendar } from '../components/SessionCalendar'
import { SessionReminderBanner } from '../components/SessionReminderBanner'
import { PatientActivity } from '../components/PatientActivity'
import { api, type Profile, type Booking, type SessionBooking, type PatientAnalytics } from '../api'
import {
  Calendar, LayoutDashboard, ShoppingBag, MessageSquare, Sparkles, Clock,
  Compass, Activity, User, Mail, MapPin, Globe, Shield, Save, CheckCircle2,
  XCircle, RefreshCw, Star, ArrowRight, ClipboardList, TrendingUp
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

const SPECIALIZATIONS = [
  'Acupuncture', 'Ayurveda', 'Chiropractic', 'Homeopathy', 'Naturopathy',
  'Yoga Therapy', 'Massage Therapy', 'Nutrition & Dietetics', 'Reiki', 'Hypnotherapy'
]

interface EditProfileForm {
  name?: string
  city?: string
  country?: string
  specialization?: string
  password?: string
  confirmPassword?: string
}

function PractitionerStatusBadge({ status }: { status?: string }) {
  const s = (status || '').toUpperCase()
  if (s === 'APPROVED') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle2 size={10} /> Verified
    </span>
  )
  if (s === 'REJECTED') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
      <XCircle size={10} /> Rejected
    </span>
  )
  if (s === 'REUPLOAD_REQUESTED') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200">
      <RefreshCw size={10} /> Reupload Requested
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
      <Activity size={10} /> Pending Approval
    </span>
  )
}

const getBookingStatus = (booking: Booking): 'Pending' | 'Ongoing' | 'Completed' => {
  if (!booking.bookingDate) return 'Pending'

  const now = new Date()
  const start = new Date(booking.bookingDate)
  const end = new Date(start.getTime() + 30 * 60 * 1000)

  if (now < start) return 'Pending'
  if (now >= start && now <= end) return 'Ongoing'
  return 'Completed'
}

const getBookingStatusClasses = (status: ReturnType<typeof getBookingStatus>) => {
  if (status === 'Pending') {
    return 'border-amber-200 text-amber-700 bg-amber-50'
  }
  if (status === 'Ongoing') {
    return 'border-sky-200 text-sky-700 bg-sky-50'
  }
  // Completed
  return 'border-emerald-200 text-emerald-700 bg-emerald-50'
}

const getSessionStatus = (session: SessionBooking): 'Pending' | 'Ongoing' | 'Completed' => {
  const { sessionDate, startTime, endTime } = session
  if (!sessionDate || !startTime || !endTime) return 'Pending'

  const now = new Date()
  const start = new Date(`${sessionDate}T${startTime}`)
  const end = new Date(`${sessionDate}T${endTime}`)

  if (now < start) return 'Pending'
  if (now >= start && now <= end) return 'Ongoing'
  return 'Completed'
}

const getSessionStatusClasses = (status: ReturnType<typeof getSessionStatus>) => {
  if (status === 'Pending') return 'bg-yellow-100 text-yellow-700'
  if (status === 'Ongoing') return 'bg-blue-100 text-blue-700'
  return 'bg-green-100 text-green-700'
}

export function UserDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [sessions, setSessions] = useState<SessionBooking[]>([])
  const [approvedPractitioners, setApprovedPractitioners] = useState<Profile[]>([])
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'activity' | 'profile'>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [editForm, setEditForm] = useState<EditProfileForm>({})
  const [analyticsData, setAnalyticsData] = useState<PatientAnalytics | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  const filteredPractitioners = selectedSpecialization
    ? approvedPractitioners.filter((p) => p.specialization === selectedSpecialization)
    : approvedPractitioners

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000) // Poll every 10s for real-time updates
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const userProfile = await api.getProfile()
      setProfile(userProfile)
      setEditForm({
        name: userProfile.name,
        city: userProfile.city,
        country: userProfile.country,
        specialization: userProfile.specialization,
      })
      if (userProfile.id) {
        const userBookings = await api.getUserBookings(userProfile.id)
        setBookings(userBookings)

        const userSessions = await api.getClientSessions(userProfile.id)
        setSessions(userSessions)
        fetchAnalytics(userProfile.id)
      }
      // Fetch only approved practitioners for patient view
      const practitioners = await api.getApprovedPractitioners()
      setApprovedPractitioners(practitioners)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchAnalytics = async (userId: number) => {
    try {
      const data = await api.getPatientAnalytics(userId)
      setAnalyticsData(data)
    } catch (err) {
      console.error('Failed to fetch patient analytics:', err)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      setMessage('Passwords do not match!')
      return
    }
    setUpdateLoading(true)
    setMessage('')
    try {
      const updated = await api.updateProfile(editForm)
      setProfile({ ...profile!, ...updated })
      setIsEditing(false)
      setMessage('Profile updated successfully!')
      setEditForm({ ...editForm, password: '', confirmPassword: '' })
      // Update localStorage name
      localStorage.setItem('userName', updated.name || profile?.name || '')
      setTimeout(() => setMessage(''), 4000)
    } catch (err) {
      setMessage('Failed to update profile.')
    } finally {
      setUpdateLoading(false)
    }
  }

  if (!profile) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mb-4">
        <Activity size={32} className="text-brand-600" />
      </motion.div>
      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading your wellness journey...</p>
    </div>
  )

  return (
    <>
      <SessionReminderBanner fetchReminders={api.getUpcomingSessionReminders} />
      <DashboardLayout
        sidebarItems={[
          { label: 'Dashboard', active: activeTab === 'overview', path: '#', onClick: () => setActiveTab('overview'), icon: <LayoutDashboard size={20} /> },
          { label: 'Sessions', active: activeTab === 'sessions', path: '#', onClick: () => setActiveTab('sessions'), icon: <Calendar size={20} /> },
          { label: 'My Activity', active: activeTab === 'activity', path: '#', onClick: () => setActiveTab('activity'), icon: <TrendingUp size={20} /> },
          { label: 'Marketplace', path: '/marketplace', icon: <Compass size={20} /> },
          { label: 'Products', path: '/products', icon: <ShoppingBag size={20} /> },
          { label: 'Product Orders', path: '/product-orders', icon: <ClipboardList size={20} /> },
          { label: 'Profile', active: activeTab === 'profile', path: '#', onClick: () => setActiveTab('profile'), icon: <User size={20} /> },
        ]}
      >
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              {/* Header */}
              <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-brand-600 to-indigo-600 p-10 rounded-[2.5rem] shadow-xl shadow-brand-500/20 text-white"
              >
                <div>
                  <h2 className="text-4xl font-black tracking-tight mb-2">
                    Wellness <span className="text-white/80">Overview</span>
                  </h2>
                  <p className="text-white/70 flex items-center gap-2 font-medium">
                    <Sparkles size={16} /> Track your activity and upcoming therapy sessions
                  </p>
                </div>
                <Link to="/marketplace" className="bg-white text-brand-600 px-8 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-all active:scale-95">
                  Book New Session
                </Link>
              </motion.header>

              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div whileHover={{ y: -4 }} className="bg-white p-8 rounded-[2.5rem] border border-brand-100/50 shadow-xl shadow-brand-500/5">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-brand-50 rounded-2xl text-brand-600"><Clock size={24} /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Session</span>
                  </div>
                  {bookings.length > 0 ? (
                    (() => {
                      const next = bookings[0]
                      const status = getBookingStatus(next)
                      return (
                        <div>
                          <h3 className="text-xl font-black text-slate-900 mb-1">Session with Specialist</h3>
                          <p className="text-sm text-slate-500 font-medium italic">
                            {next.bookingDate ? new Date(next.bookingDate).toLocaleString() : 'Date TBD'}
                          </p>
                          <div className="mt-4">
                            <span
                              className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm ${getBookingStatusClasses(status)}`}
                            >
                              {status}
                            </span>
                          </div>
                        </div>
                      )
                    })()
                  ) : (
                    <div>
                      <p className="text-slate-400 font-medium italic">No sessions scheduled.</p>
                      <Link to="/marketplace" className="mt-4 text-brand-600 font-black text-sm flex items-center gap-1">
                        Find a practitioner <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}
                </motion.div>

                <motion.div whileHover={{ y: -4 }} className="bg-white p-8 rounded-[2.5rem] border border-brand-100/50 shadow-xl shadow-brand-500/5">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-brand-50 rounded-2xl text-brand-600"><Sparkles size={24} /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Wellness Points</span>
                  </div>
                  <p className="text-5xl font-black text-slate-900 mb-1 tabular-nums">1,240</p>
                  <p className="text-sm text-slate-500 font-medium">You've earned 240 pts this month!</p>
                </motion.div>
              </div>

              {/* Approved Practitioners Section */}
              <section className="bg-white rounded-[3rem] border border-brand-100/50 p-10 shadow-xl shadow-brand-500/5">
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                      <CheckCircle2 size={24} className="text-brand-600" /> Verified Practitioners
                    </h2>
                    <Link
                      to="/marketplace"
                      className="text-[10px] font-black uppercase tracking-widest text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      View All <ArrowRight size={12} />
                    </Link>
                  </div>
                  <select
                    value={selectedSpecialization}
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                    className="w-full md:w-auto border border-gray-300 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                  >
                    <option value="">All Specializations</option>
                    {SPECIALIZATIONS.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                {filteredPractitioners.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="bg-slate-50 inline-block p-8 rounded-full mb-4 border border-slate-100">
                      <Compass size={36} className="text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No verified practitioners yet</p>
                    <p className="text-slate-500 text-sm mt-2">Check back soon or explore the marketplace.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredPractitioners.slice(0, 6).map((p, idx) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-slate-50/80 rounded-3xl border border-slate-100 p-6 hover:border-brand-200 hover:bg-white hover:shadow-lg hover:shadow-brand-500/5 transition-all group"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="h-12 w-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 font-black text-lg flex-shrink-0 group-hover:scale-110 transition-transform">
                            {p.name[0]}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-slate-900 leading-tight truncate">{p.name}</h4>
                            <p className="text-xs text-brand-600 font-bold uppercase tracking-wider mt-0.5">
                              {p.specialization || 'General Wellness'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <PractitionerStatusBadge status={p.verificationStatus} />
                          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                            <Star size={12} fill="currentColor" /> 4.9
                          </div>
                        </div>
                        {p.city && (
                          <p className="text-xs text-slate-400 font-medium mt-2 flex items-center gap-1">
                            <MapPin size={10} /> {p.city}{p.country ? `, ${p.country}` : ''}
                          </p>
                        )}
                        <Link
                          to="/marketplace"
                          className="mt-4 w-full bg-brand-600 text-white text-xs font-black py-2.5 rounded-xl flex items-center justify-center gap-1 hover:bg-brand-700 transition-all"
                        >
                          Book Session <ArrowRight size={12} />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>

              {/* Booking History */}
              <section className="bg-white rounded-[3rem] border border-brand-100/50 p-10 shadow-xl shadow-brand-500/5">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <Calendar size={24} className="text-brand-600" /> Booking History
                  </h2>
                </div>
                <div className="space-y-4">
                  {bookings.length > 0 ? (
                    bookings.map((booking, idx) => {
                      const computedStatus = getBookingStatus(booking)
                      const badgeClasses = getBookingStatusClasses(computedStatus)
                      return (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-brand-200 hover:bg-white hover:shadow-lg hover:shadow-brand-500/5 transition-all"
                        >
                          <div className="flex items-center gap-5">
                            <div className="h-12 w-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 font-black text-sm">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 leading-tight">Practitioner #{booking.practitionerId}</p>
                              <p className="text-xs text-slate-500 font-semibold">
                                {booking.bookingDate
                                  ? new Date(booking.bookingDate).toLocaleString()
                                  : 'Date Pending'}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border shadow-sm ${badgeClasses}`}
                          >
                            {computedStatus}
                          </span>
                        </motion.div>
                      )
                    })
                  ) : (
                    <div className="py-16 text-center">
                      <div className="bg-slate-50 inline-block p-8 rounded-full mb-6 border border-slate-100">
                        <Calendar size={40} className="text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No bookings found</p>
                      <p className="text-slate-500 text-sm mt-2 font-medium">Your wellness journey starts with your first booking.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Community */}
              <section className="bg-brand-600 rounded-[2.5rem] p-8 shadow-xl shadow-brand-600/20 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <MessageSquare size={120} />
                </div>
                <h2 className="text-lg font-black mb-4 flex items-center gap-2 relative z-10">
                  <MessageSquare size={20} className="text-brand-100" /> Community
                </h2>
                <p className="text-sm font-bold leading-relaxed italic border-l-4 border-white/20 pl-4 py-1 relative z-10">
                  "The acupuncture session last week completely cleared my chronic migraines. Highly recommend!"
                </p>
                <div className="flex gap-2 mt-4 relative z-10">
                  <span className="bg-white/10 text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-tighter border border-white/10">#Acupuncture</span>
                  <span className="bg-white/10 text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-tighter border border-white/10">#Wellness</span>
                </div>
              </section>
            </motion.div>
          ) : activeTab === 'sessions' ? (
            <motion.div
              key="sessions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-brand-600 to-purple-600 p-10 rounded-[2.5rem] shadow-xl shadow-brand-500/20 text-white"
              >
                <div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                    Session <span className="text-white/80">Planner</span>
                  </h2>
                  <p className="text-white/70 flex items-center gap-2 font-medium">
                    <Clock size={16} /> View upcoming sessions and your session history.
                  </p>
                </div>
              </motion.header>

              <SessionCalendar sessions={sessions.filter(s => s.status === 'ACCEPTED')} role="patient" />

              <section className="bg-white rounded-[3rem] border border-brand-100/50 p-10 shadow-xl shadow-brand-500/5">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <Calendar size={24} className="text-brand-600" /> Session History
                  </h2>
                </div>
                <div className="space-y-4">
                  {sessions.length > 0 ? (
                    sessions
                      .slice()
                      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
                      .map((session, idx) => (
                        // Treat as booking history entry with dynamic status based on time window
                        <motion.div
                          key={session.id ?? idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-brand-200 hover:bg-white hover:shadow-lg hover:shadow-brand-500/5 transition-all"
                        >
                          <div className="flex items-center gap-5">
                            <div className="h-12 w-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 font-black text-sm">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 leading-tight">
                                Session with {session.providerName ?? `Provider #${session.providerId}`}
                              </p>
                              <p className="text-xs text-slate-500 font-semibold">
                                {session.sessionDate}{' '}
                                {session.startTime && session.endTime
                                  ? `${session.startTime} - ${session.endTime}`
                                  : ''}
                                {session.duration ? ` · ${session.duration} mins` : ''}
                              </p>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                {session.issueDescription}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {(() => {
                              const status = getSessionStatus(session)
                              return (
                                <span
                                  className={`px-3 py-1 rounded-full text-[11px] font-semibold ${getSessionStatusClasses(status)}`}
                                >
                                  {status}
                                </span>
                              )
                            })()}
                            {session.providerMessage && (
                              <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-1 max-w-xs text-right">
                                {session.providerMessage}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))
                  ) : (
                    <div className="py-16 text-center">
                      <div className="bg-slate-50 inline-block p-8 rounded-full mb-6 border border-slate-100">
                        <Calendar size={40} className="text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No sessions found</p>
                      <p className="text-slate-500 text-sm mt-2 font-medium">
                        Your session history will appear here after your first booking.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          ) : activeTab === 'activity' ? (
            <motion.div
              key="activity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <PatientActivity data={analyticsData} loading={analyticsLoading} />
            </motion.div>
          ) : (
            /* Profile Tab */
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-[3rem] border border-brand-100/50 shadow-2xl shadow-brand-500/5 overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-brand-600 to-indigo-600 relative">
                  <div className="absolute -bottom-16 left-10">
                    <div className="h-32 w-32 rounded-[2rem] bg-white p-2 shadow-2xl">
                      <div className="h-full w-full rounded-[1.5rem] bg-brand-50 flex items-center justify-center text-brand-600 text-4xl font-black">
                        {profile.name[0]}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-24 px-10 pb-10">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-4xl font-black text-slate-900 mb-2">{profile.name}</h2>
                      <p className="text-slate-500 font-bold flex items-center gap-2">
                        <Shield size={16} className="text-brand-500" /> Member since 2024
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="bg-brand-50 text-brand-600 px-6 py-3 rounded-2xl font-black hover:bg-brand-100 transition-all flex items-center gap-2"
                    >
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>

                  {message && (
                    <div className={`mb-6 p-4 rounded-2xl font-bold text-sm ${message.includes('success') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                      {message}
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          disabled={!isEditing}
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-brand-500 transition-all outline-none disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          disabled
                          value={profile.email}
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold opacity-50 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">City</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          disabled={!isEditing}
                          value={editForm.city || ''}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-brand-500 transition-all outline-none disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Country</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          disabled={!isEditing}
                          value={editForm.country || ''}
                          onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-brand-500 transition-all outline-none disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">New Password</label>
                          <div className="relative">
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                              type="password"
                              placeholder="Leave blank to keep current"
                              value={editForm.password || ''}
                              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                              className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-brand-500 transition-all outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Confirm New Password</label>
                          <div className="relative">
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                              type="password"
                              value={editForm.confirmPassword || ''}
                              onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                              className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-brand-500 transition-all outline-none"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2 pt-4">
                          <button
                            type="submit"
                            disabled={updateLoading}
                            className="w-full bg-brand-600 text-white rounded-2xl py-5 font-black text-lg shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <Save size={20} /> {updateLoading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DashboardLayout>
    </>
  )
}
