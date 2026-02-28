import { useEffect, useState } from 'react';
import { api, type Profile, type SessionBooking, type Notification } from '../api';

export type Booking = {
  id?: number;
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'RESCHEDULED' | string;
  clientId?: number;
  clientName?: string;
  providerId?: number;
  sessionDate?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  issueDescription?: string;
  [key: string]: any;
};
import { SPECIALIZATIONS } from '../constants/specializations';
import { DashboardLayout } from '../components/DashboardLayout';
import { SessionCalendar } from '../components/SessionCalendar';
import { SessionReminderBanner } from '../components/SessionReminderBanner';
import {
  CheckCircle2, XCircle, FileText, Calendar, User, LayoutDashboard,
  CloudUpload, ArrowRight, ShieldCheck, Activity, Globe, MessageSquare, RefreshCw, AlertCircle,
  Package, ClipboardList, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function VerificationStatusBadge({ status }: { status?: string }) {
  const s = (status || '').toUpperCase()
  if (s === 'APPROVED') return (
    <span className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl text-sm font-black border border-emerald-200 shadow-sm">
      <CheckCircle2 size={18} /> Verified Expert
    </span>
  )
  if (s === 'REJECTED') return (
    <span className="flex items-center gap-2 bg-rose-50 text-rose-700 px-6 py-3 rounded-2xl text-sm font-black border border-rose-200 shadow-sm">
      <XCircle size={18} /> Application Rejected
    </span>
  )
  if (s === 'REUPLOAD_REQUESTED') return (
    <span className="flex items-center gap-2 bg-orange-50 text-orange-700 px-6 py-3 rounded-2xl text-sm font-black border border-orange-200 shadow-sm">
      <RefreshCw size={18} /> Reupload Required
    </span>
  )
  if (s === 'PENDING_ADMIN_APPROVAL') return (
    <span className="flex items-center gap-2 bg-amber-50 text-amber-700 px-6 py-3 rounded-2xl text-sm font-black border border-amber-200 shadow-sm uppercase tracking-wider">
      <Activity size={18} /> Pending Admin Review
    </span>
  )
  return (
    <span className="flex items-center gap-2 bg-slate-50 text-slate-600 px-6 py-3 rounded-2xl text-sm font-black border border-slate-200 shadow-sm uppercase tracking-wider">
      <Activity size={18} /> {status || 'Pending'}
    </span>
  )
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

export function PractitionerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sessions, setSessions] = useState<SessionBooking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [degreeFile, setDegreeFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'sessions' | 'profile' | 'verification'>('overview');
  const [editForm, setEditForm] = useState<Partial<Profile>>({});
  const [rescheduleSession, setRescheduleSession] = useState<SessionBooking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleStartTime, setRescheduleStartTime] = useState<string>('');
  const [rescheduleEndTime, setRescheduleEndTime] = useState<string>('');
  const [rescheduleMessage, setRescheduleMessage] = useState<string>('');
  const [sessionActionLoadingId, setSessionActionLoadingId] = useState<number | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const sidebarItems = [
    { label: 'Overview', onClick: () => setActiveTab('overview'), active: activeTab === 'overview', icon: <LayoutDashboard size={20} /> },
    { label: 'Booking Requests', onClick: () => setActiveTab('requests'), active: activeTab === 'requests', icon: <Calendar size={20} /> },
    { label: 'Marketplace', path: '/marketplace', icon: <Globe size={20} /> },
    { label: 'My Products', path: '/my-products', icon: <Package size={20} /> },
    { label: 'Product Orders', path: '/product-orders', icon: <ClipboardList size={20} /> },
    { label: 'Profile', onClick: () => setActiveTab('profile'), active: activeTab === 'profile', icon: <User size={20} /> },
    { label: 'Verification', onClick: () => setActiveTab('verification'), active: activeTab === 'verification', icon: <ShieldCheck size={20} /> },
  ];

  useEffect(() => {
    fetchProfile();
    fetchNotifications();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.getProfile();
      setProfile(res);
      setEditForm({
        name: res.name,
        city: res.city,
        country: res.country,
        specialization: res.specialization,
      });
      if (res.id) {
        const bookingRes = await api.getPractitionerBookings(res.id);
        setBookings(bookingRes);
        const sessionRes = await api.getProviderSessions(res.id);
        setSessions(sessionRes);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const bookingRequests = bookings.filter((b) => b.status === 'PENDING');
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await api.markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  const acceptBooking = async (bookingId?: number) => {
    if (!bookingId) return;
    setSessionActionLoadingId(bookingId);
    try {
      const updated = await api.acceptBooking(bookingId);
      setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setMessage('Booking accepted successfully');
    } catch (err) {
      console.error(err);
    } finally {
      setSessionActionLoadingId(null);
    }
  };

  const rejectBooking = async (bookingId?: number) => {
    if (!bookingId) return;
    setSessionActionLoadingId(bookingId);
    try {
      const updated = await api.rejectBooking(bookingId);
      setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setMessage('Booking rejected');
    } catch (err) {
      console.error(err);
    } finally {
      setSessionActionLoadingId(null);
    }
  };

  const rescheduleBooking = (bookingId?: number) => {
    if (!bookingId) return;
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    // We store the booking in rescheduleSession initially to repurpose the form
    setRescheduleSession(booking as unknown as SessionBooking);

    if (booking.bookingDate) {
      // Assuming naive ISO string that JS will parse locally, but let's break it down safely
      try {
        const dateStr = booking.bookingDate.toString();
        if (dateStr.includes('T')) {
          const [d, t] = dateStr.split('T');
          setRescheduleDate(d);
          setRescheduleStartTime(t.substring(0, 5)); // get HH:mm
        } else {
          const dateObj = new Date(dateStr);
          const yyyy = dateObj.getFullYear();
          const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
          const dd = String(dateObj.getDate()).padStart(2, '0');
          setRescheduleDate(`${yyyy}-${mm}-${dd}`);

          const hh = String(dateObj.getHours()).padStart(2, '0');
          const min = String(dateObj.getMinutes()).padStart(2, '0');
          setRescheduleStartTime(`${hh}:${min}`);
        }
      } catch (e) {
        setRescheduleDate('');
        setRescheduleStartTime('');
      }
    } else {
      setRescheduleDate('');
      setRescheduleStartTime('');
    }

    setRescheduleEndTime('');
    setRescheduleMessage('');
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleSession || !rescheduleSession.id) return;
    setSessionActionLoadingId(rescheduleSession.id);
    try {
      const updated = await api.rescheduleBooking(rescheduleSession.id, {
        newSessionDate: rescheduleDate || undefined,
        newStartTime: rescheduleStartTime || undefined,
      });
      setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setRescheduleSession(null);
      setMessage('Booking rescheduled successfully');
    } catch (err) {
      console.error(err);
    } finally {
      setSessionActionLoadingId(null);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const saveProfile = async () => {
    if (!profile) return;
    if (editForm.password && editForm.password !== (editForm as any).confirmPassword) {
      setMessage('Passwords do not match!');
      return;
    }
    setLoading(true);
    try {
      const updated = await api.updateProfile(editForm);
      setMessage('Profile updated successfully');
      setProfile({ ...profile, ...updated });
      setEditForm({ ...editForm, password: '', confirmPassword: '' } as any);
      localStorage.setItem('userName', updated.name || profile.name || '');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDegreeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDegreeFile(e.target.files[0]);
    }
  };

  const uploadDegree = async () => {
    if (!degreeFile || !profile) return;
    setLoading(true);
    try {
      await api.uploadDegree(degreeFile, profile.id);
      setMessage('Degree uploaded successfully');
      fetchProfile();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to upload degree');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#F8FAFC]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mb-4">
        <Activity size={32} className="text-brand-600" />
      </motion.div>
      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading practitioner portal...</p>
    </div>
  );

  return (
    <>
      <SessionReminderBanner fetchReminders={api.getUpcomingSessionReminders} />
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="space-y-10">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-brand-600 to-violet-600 p-10 rounded-[2.5rem] shadow-xl shadow-brand-500/20 text-white"
          >
            <div>
              <h2 className="text-4xl font-black tracking-tight mb-2">
                Practitioner <span className="text-white/80">Portal</span>
              </h2>
              <p className="text-white/70 font-medium">Manage your professional credentials and bookings.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="relative p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-[10px] font-black flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-20">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                        Notifications
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {unreadCount} unread
                      </span>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-xs text-slate-400 text-center">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => handleNotificationClick(n)}
                            className={`w-full text-left px-4 py-3 text-xs border-b border-slate-50 last:border-b-0 ${n.read ? 'bg-white text-slate-500' : 'bg-slate-50 text-slate-800'
                              } hover:bg-slate-100 transition-colors`}
                          >
                            <p className="font-bold leading-snug">{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <VerificationStatusBadge status={profile.verificationStatus} />
            </div>
          </motion.header>

          {/* Admin Comment Banner (shown when rejected or reupload requested) */}
          {profile.adminComment && (profile.verificationStatus === 'REJECTED' || profile.verificationStatus === 'REUPLOAD_REQUESTED') && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl border flex items-start gap-4 ${profile.verificationStatus === 'REJECTED'
                ? 'bg-rose-50 border-rose-200'
                : 'bg-orange-50 border-orange-200'
                }`}
            >
              <div className={`p-2 rounded-xl flex-shrink-0 ${profile.verificationStatus === 'REJECTED' ? 'bg-rose-100' : 'bg-orange-100'}`}>
                {profile.verificationStatus === 'REJECTED'
                  ? <AlertCircle size={20} className="text-rose-600" />
                  : <RefreshCw size={20} className="text-orange-600" />}
              </div>
              <div>
                <p className={`font-black text-sm mb-1 ${profile.verificationStatus === 'REJECTED' ? 'text-rose-800' : 'text-orange-800'}`}>
                  {profile.verificationStatus === 'REJECTED' ? 'Rejection Reason' : 'Reupload Instructions'}
                </p>
                <p className={`text-sm font-medium ${profile.verificationStatus === 'REJECTED' ? 'text-rose-700' : 'text-orange-700'}`}>
                  {profile.adminComment}
                </p>
                {profile.verificationStatus === 'REUPLOAD_REQUESTED' && (
                  <button
                    onClick={() => setActiveTab('verification')}
                    className="mt-3 text-xs font-black text-orange-600 underline hover:text-orange-800"
                  >
                    Go to Verification tab to reupload →
                  </button>
                )}
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <section className="bg-white p-10 rounded-[3rem] border border-brand-100/50 shadow-xl shadow-brand-500/5">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900">
                      <Calendar size={24} className="text-brand-600" /> Upcoming Sessions
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Patient</th>
                          <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date/Time</th>
                          <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                          <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {bookings.length > 0 ? (
                          bookings.map((booking, idx) => (
                            <motion.tr
                              key={booking.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="group hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="py-6 pl-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 font-black text-xs">
                                    P
                                  </div>
                                  <span className="font-bold text-slate-900">Patient #{booking.userId}</span>
                                </div>
                              </td>
                              <td className="py-6 text-sm font-bold text-slate-600 tabular-nums">
                                {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                              </td>
                              <td className="py-6">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${booking.status === 'CONFIRMED' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' :
                                  booking.status === 'CANCELLED' ? 'border-rose-200 text-rose-600 bg-rose-50' :
                                    'border-brand-200 text-brand-600 bg-brand-50'
                                  }`}>
                                  {booking.status}
                                </span>
                              </td>
                              <td className="py-6 text-slate-500 text-xs font-medium italic max-w-[200px] truncate">{booking.notes || 'No notes'}</td>
                            </motion.tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-20 text-center">
                              <Calendar size={40} className="mx-auto text-slate-200 mb-4" />
                              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No active bookings found</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'requests' && (
              <motion.div key="requests" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <section className="bg-white p-10 rounded-[3rem] border border-brand-100/50 shadow-xl shadow-brand-500/5 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900">
                      <Calendar size={24} className="text-brand-600" /> Booking Requests
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {bookingRequests.length} pending
                    </p>
                  </div>

                  {bookingRequests.length === 0 ? (
                    <div className="py-12 text-center">
                      <Calendar size={40} className="mx-auto text-slate-200 mb-4" />
                      <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
                        No booking requests at the moment
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Client Name</th>
                            <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Session Date</th>
                            <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Time / Duration</th>
                            <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Issue Description</th>
                            <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {bookingRequests.map((request, idx) => (
                            <motion.tr
                              key={request.id ?? idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.04 }}
                              className="group hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="py-6 pl-4">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 font-black text-sm">
                                    {request.clientName ? request.clientName[0] : 'P'}
                                  </div>
                                  <span className="font-bold text-slate-900">
                                    {request.clientName ?? `Client #${request.clientId}`}
                                  </span>
                                </div>
                              </td>
                              <td className="py-6 text-sm font-bold text-slate-600">
                                {request.sessionDate}
                              </td>
                              <td className="py-6 text-sm font-bold text-slate-600">
                                {request.startTime && request.endTime ? `${request.startTime} - ${request.endTime}` : ''}
                                {request.duration ? <span className="block text-xs text-slate-400 font-medium">{request.duration} mins</span> : ''}
                              </td>
                              <td className="py-6 text-slate-500 text-xs font-medium max-w-[200px] truncate">
                                {request.issueDescription || 'No description provided'}
                              </td>
                              <td className="py-6 pr-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => acceptBooking(request.id)}
                                    disabled={sessionActionLoadingId === request.id}
                                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                  >
                                    {sessionActionLoadingId === request.id ? '...' : 'Accept'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => rescheduleBooking(request.id)}
                                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                                  >
                                    Reschedule
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => rejectBooking(request.id)}
                                    disabled={sessionActionLoadingId === request.id}
                                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors disabled:opacity-50"
                                  >
                                    {sessionActionLoadingId === request.id ? '...' : 'Reject'}
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                {/* Reschedule Modal */}
                <AnimatePresence>
                  {rescheduleSession && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setRescheduleSession(null)}
                      />
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        className="relative bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl border border-slate-100"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-black text-slate-900">Suggest New Time</h3>
                          <button
                            type="button"
                            onClick={() => setRescheduleSession(null)}
                            className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                          >
                            Close
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">
                          Patient:{' '}
                          <span className="font-bold text-slate-900">
                            {(rescheduleSession as unknown as Booking).clientName ?? `Patient #${(rescheduleSession as unknown as Booking).userId}`}
                          </span>
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                              New Date
                            </label>
                            <input
                              type="date"
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-medium text-slate-700 focus:outline-none focus:border-brand-400"
                              value={rescheduleDate}
                              onChange={(e) => setRescheduleDate(e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                Start Time
                              </label>
                              <input
                                type="time"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-medium text-slate-700 focus:outline-none focus:border-brand-400"
                                value={rescheduleStartTime}
                                onChange={(e) => setRescheduleStartTime(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                End Time
                              </label>
                              <input
                                type="time"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-medium text-slate-700 focus:outline-none focus:border-brand-400"
                                value={rescheduleEndTime}
                                onChange={(e) => setRescheduleEndTime(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                            Message to Patient
                          </label>
                          <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-medium text-slate-700 focus:outline-none focus:border-brand-400 min-h-[80px] resize-none"
                            value={rescheduleMessage}
                            onChange={(e) => setRescheduleMessage(e.target.value)}
                            placeholder="Share why you are suggesting this new time and any context they should know."
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleConfirmReschedule}
                          disabled={sessionActionLoadingId === rescheduleSession.id}
                          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-3 rounded-2xl shadow-lg shadow-brand-600/20 transition-all disabled:opacity-50"
                        >
                          {sessionActionLoadingId === rescheduleSession.id ? 'Sending suggestion...' : 'Send Suggestion'}
                        </button>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'sessions' && (
              <motion.div key="sessions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <section className="bg-white p-10 rounded-[3rem] border border-brand-100/50 shadow-xl shadow-brand-500/5 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900">
                      <Calendar size={24} className="text-brand-600" /> Session Calendar
                    </h3>
                  </div>
                  <SessionCalendar sessions={sessions} role="practitioner" />
                </section>

                <section className="bg-white p-10 rounded-[3rem] border border-brand-100/50 shadow-xl shadow-brand-500/5">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900">
                      <Calendar size={24} className="text-brand-600" /> Session History
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {sessions.length > 0 ? (
                      sessions
                        .slice()
                        .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
                        .map((session, idx) => (
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
                                  Session with {session.clientName ?? `Client #${session.clientId}`}
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
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">
                          No sessions found
                        </p>
                        <p className="text-slate-500 text-sm mt-2 font-medium">
                          Your session history will appear here as you accept bookings.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </motion.div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <section className="bg-white p-10 rounded-[3rem] border border-brand-100/50 shadow-xl shadow-brand-500/5 max-w-4xl mx-auto">
                  <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900">
                    <User size={24} className="text-brand-600" /> Profile Information
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="text"
                            name="name"
                            value={editForm.name || ''}
                            onChange={handleProfileChange}
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 focus:border-brand-500 focus:bg-white transition-all outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
                        <div className="relative group opacity-50">
                          <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="text"
                            value={profile.email}
                            disabled
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Primary Specialization</label>
                        <select
                          name="specialization"
                          value={editForm.specialization || ''}
                          onChange={handleProfileChange}
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 focus:border-brand-500 focus:bg-white transition-all outline-none"
                        >
                          <option value="">Select Specialization</option>
                          {SPECIALIZATIONS.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">City</label>
                        <input
                          type="text"
                          name="city"
                          value={editForm.city || ''}
                          onChange={handleProfileChange}
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 focus:border-brand-500 focus:bg-white transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Country</label>
                        <input
                          type="text"
                          name="country"
                          value={editForm.country || ''}
                          onChange={handleProfileChange}
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 focus:border-brand-500 focus:bg-white transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6 mt-6">
                      <h4 className="text-sm font-black text-slate-900 mb-4">Security</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">New Password</label>
                          <input
                            type="password"
                            name="password"
                            placeholder="Leave blank to keep current"
                            value={editForm.password || ''}
                            onChange={handleProfileChange}
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 focus:border-brand-500 focus:bg-white transition-all outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Confirm Password</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={(editForm as any).confirmPassword || ''}
                            onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value } as any)}
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-900 focus:border-brand-500 focus:bg-white transition-all outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={saveProfile}
                      disabled={loading}
                      className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-600/20 transition-all active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                    >
                      {loading ? 'Updating...' : <><ArrowRight size={18} /> Save Changes</>}
                    </button>
                  </div>
                </section>
              </motion.div>
            )}

            {/* Verification Tab */}
            {activeTab === 'verification' && (
              <motion.div key="verification" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <section className="bg-white p-10 rounded-[3rem] border border-brand-100/50 shadow-xl shadow-brand-500/5 max-w-2xl mx-auto">
                  <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900">
                    <ShieldCheck size={24} className="text-brand-600" /> Professional Verification
                  </h3>

                  {/* Current Status */}
                  <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Current Status</p>
                    <VerificationStatusBadge status={profile.verificationStatus} />
                    {profile.adminComment && (
                      <div className="mt-4 flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
                        <MessageSquare size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-700 font-medium">{profile.adminComment}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-8">
                    <div className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center text-center group hover:border-brand-300 transition-all hover:bg-brand-50/30">
                      <div className="p-5 rounded-3xl bg-white shadow-sm mb-6 text-slate-400 group-hover:text-brand-600 transition-colors">
                        <CloudUpload size={40} />
                      </div>
                      <h4 className="font-black text-slate-900 mb-2">Upload your credentials</h4>
                      <p className="text-xs text-slate-500 font-medium mb-6">Attach your PDF degree or certificate for admin verification.</p>
                      <input
                        type="file"
                        id="degree-upload"
                        accept="application/pdf"
                        onChange={handleDegreeChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="degree-upload"
                        className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl text-sm font-bold cursor-pointer hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                      >
                        {degreeFile ? degreeFile.name : 'Choose File'}
                      </label>
                    </div>

                    <button
                      onClick={uploadDegree}
                      disabled={loading || !degreeFile}
                      className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? 'Processing...' : <><ShieldCheck size={18} /> Submit for Review</>}
                    </button>

                    {profile.degreeFile && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-sm">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-emerald-900 leading-tight">Document Uploaded</p>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Status: {profile.verificationStatus}</p>
                          </div>
                        </div>
                        <a
                          href={`http://localhost:8080/api/degree/${profile.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-3 rounded-xl border border-emerald-200 text-emerald-600 hover:bg-white transition-all shadow-sm"
                        >
                          <ArrowRight size={16} />
                        </a>
                      </motion.div>
                    )}
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toast Message */}
          {message && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 font-black text-sm flex items-center gap-3"
            >
              <div className={`w-2 h-2 rounded-full animate-pulse ${message.includes('match') || message.includes('Failed') ? 'bg-red-500' : 'bg-brand-500'}`} />
              {message}
            </motion.div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
