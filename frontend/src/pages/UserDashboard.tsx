import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { api } from '../api'
import type { Profile, Booking } from '../api'
import { Calendar, Award, Clock, ShoppingBag, MessageSquare, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export function UserDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const userProfile = await api.getProfile()
      setProfile(userProfile)
      if (userProfile.id) {
        const userBookings = await api.getUserBookings(userProfile.id)
        setBookings(userBookings)
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (!profile) return <div className="flex items-center justify-center h-screen italic text-gray-400">Loading your wellness journey...</div>

  return (
    <DashboardLayout
      sidebarItems={[
        { label: 'Dashboard', active: true, path: '/dashboard' },
        { label: 'Marketplace', path: '/marketplace' },
        { label: 'My Sessions', path: '/sessions' },
        { label: 'Product Store', path: '#' },
        { label: 'Wellness AI', path: '#' },
      ]}
    >
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <h1 className="text-4xl font-black tracking-tight text-white mb-2">
              Hello, <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{profile.name}</span>
            </h1>
            <p className="text-gray-400 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" /> Track your wellness and upcoming sessions
            </p>
          </div>
          <Link to="/marketplace" className="relative z-10 bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-xl shadow-white/10">
            Book New Session
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-md p-6 rounded-3xl border border-emerald-500/20 shadow-lg relative overflow-hidden"
              >
                <div className="absolute -top-4 -right-4 bg-emerald-500/10 p-8 rounded-full blur-2xl" />
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Clock size={14} /> Next Session
                </p>
                {bookings.length > 0 ? (
                  <div>
                    <p className="text-xl font-bold text-white mb-1">
                      Session with Practitioner #{bookings[0].practitionerId}
                    </p>
                    <p className="text-sm text-emerald-400/80">
                      {bookings[0].bookingDate ? new Date(bookings[0].bookingDate).toLocaleDateString() : 'Date TBD'}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-emerald-500/30">
                        {bookings[0].status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 italic py-4">No sessions scheduled.</p>
                )}
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-md p-6 rounded-3xl border border-amber-500/20 shadow-lg relative overflow-hidden"
              >
                <div className="absolute -top-4 -right-4 bg-amber-500/10 p-8 rounded-full blur-2xl" />
                <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Award size={14} /> Wellness Points
                </p>
                <p className="text-4xl font-black text-white mb-1">1,240</p>
                <p className="text-sm text-amber-400/80">Keep going! You're in the top 5%</p>
              </motion.div>
            </div>

            <section className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 shadow-xl">
              <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                <Calendar size={24} className="text-blue-400" /> Your Booking History
              </h2>
              <div className="space-y-4">
                {bookings.length > 0 ? (
                  bookings.map((booking, idx) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold group-hover:scale-110 transition-transform">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-white">Practitioner ID: {booking.practitionerId}</p>
                          <p className="text-xs text-gray-500">{booking.bookingDate ? new Date(booking.bookingDate).toLocaleString() : 'Date Pending'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm ${booking.status === 'CONFIRMED' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                            booking.status === 'CANCELLED' ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' :
                              'border-blue-500/30 text-blue-400 bg-blue-500/10'
                          }`}>
                          {booking.status}
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <div className="bg-white/5 inline-block p-6 rounded-full mb-4">
                      <Calendar size={32} className="text-gray-600" />
                    </div>
                    <p className="text-gray-500 font-medium">No bookings yet. Start your journey today!</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="bg-gradient-to-b from-white/5 to-transparent backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg">
              <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                <ShoppingBag size={18} className="text-purple-400" /> Quick Store
              </h2>
              <div className="space-y-4">
                {[
                  { name: 'Organic Lavender Oil', price: '$22', delivered: true },
                  { name: 'Meditation Cushion', price: '$45', delivered: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <p className="text-sm font-bold text-white">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.price} · {item.delivered ? 'Delivered' : 'In Transit'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-gradient-to-b from-white/5 to-transparent backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg">
              <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-400" /> Community
              </h2>
              <div className="space-y-4">
                <p className="text-xs text-gray-400 leading-relaxed italic border-l-2 border-blue-500/30 pl-3">
                  "The acupuncture session last week completely cleared my chronic migraines. Highly recommend Dr. Emily!"
                </p>
                <div className="flex gap-2">
                  <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-[10px] font-bold">#Acupuncture</span>
                  <span className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded text-[10px] font-bold">#Wellness</span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  )
}

