import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { api, type Profile } from '../api/api'
import {
  ShieldCheck, UserCheck, UserX, FileText, LayoutDashboard, Settings,
  Activity, CheckCircle2, XCircle, RefreshCw, MessageSquare, AlertTriangle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type ActionType = 'APPROVE' | 'REJECT' | 'REUPLOAD'

interface PendingAction {
  id: number
  type: ActionType
  name: string
}

function StatusBadge({ status }: { status?: string }) {
  const s = (status || 'PENDING').toUpperCase()
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    APPROVED: { label: 'Verified', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={11} /> },
    REJECTED: { label: 'Rejected', cls: 'bg-rose-50 text-rose-700 border-rose-200', icon: <XCircle size={11} /> },
    PENDING_ADMIN_APPROVAL: { label: 'Pending Approval', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Activity size={11} /> },
    REUPLOAD_REQUESTED: { label: 'Reupload Requested', cls: 'bg-orange-50 text-orange-700 border-orange-200', icon: <RefreshCw size={11} /> },
    PENDING: { label: 'Pending', cls: 'bg-slate-50 text-slate-600 border-slate-200', icon: <Activity size={11} /> },
  }
  const cfg = map[s] || map['PENDING']
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

export function AdminDashboard() {
  const [practitioners, setPractitioners] = useState<Profile[]>([])
  const [systemUsers, setSystemUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview')
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [actionComment, setActionComment] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [pracData, allUserData] = await Promise.all([
        api.getPractitioners(),
        api.getAllUsers()
      ])
      setPractitioners(pracData)
      setSystemUsers(allUserData)
    } catch (err) {
      console.error('FETCH DATA ERROR:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleAction = async () => {
    if (!pendingAction) return
    setProcessingId(pendingAction.id)
    try {
      if (pendingAction.type === 'APPROVE') {
        await api.approvePractitioner(pendingAction.id)
      } else if (pendingAction.type === 'REJECT') {
        await api.rejectPractitioner(pendingAction.id, actionComment)
      } else if (pendingAction.type === 'REUPLOAD') {
        await api.requestReupload(pendingAction.id, actionComment)
      }
      await fetchData()
    } catch (err: any) {
      console.error('ADMIN ACTION ERROR:', err.response?.data || err)
    } finally {
      setProcessingId(null)
      setPendingAction(null)
      setActionComment('')
    }
  }

  const openAction = (p: Profile, type: ActionType) => {
    setPendingAction({ id: p.id, type, name: p.name })
    setActionComment('')
  }

  const sidebarItems = [
    { label: 'Overview', onClick: () => setActiveTab('overview'), active: activeTab === 'overview', icon: <LayoutDashboard size={20} /> },
    { label: 'All Users', onClick: () => setActiveTab('users'), active: activeTab === 'users', icon: <UserCheck size={20} /> },
    { label: 'Settings', path: '#', icon: <Settings size={20} /> },
  ]

  const stats = [
    { label: 'Total Users', value: systemUsers.length, icon: <UserCheck className="text-blue-500" size={22} />, bg: 'bg-blue-50' },
    { label: 'Practitioners', value: practitioners.length, icon: <ShieldCheck className="text-violet-500" size={22} />, bg: 'bg-violet-50' },
    { label: 'Pending Approval', value: practitioners.filter(p => p.verificationStatus === 'PENDING_ADMIN_APPROVAL').length, icon: <Activity className="text-amber-500" size={22} />, bg: 'bg-amber-50' },
    { label: 'Approved', value: practitioners.filter(p => p.verificationStatus === 'APPROVED').length, icon: <CheckCircle2 className="text-emerald-500" size={22} />, bg: 'bg-emerald-50' },
  ]

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 p-10 rounded-[2.5rem] shadow-xl shadow-violet-500/20 text-white"
        >
          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 mb-3 inline-block">
            Control Panel
          </span>
          <h2 className="text-4xl font-black tracking-tight mb-2">
            Admin {activeTab === 'overview' ? 'Verification' : 'User Management'}
          </h2>
          <p className="text-white/70 font-medium">
            {activeTab === 'overview'
              ? 'Validate practitioner credentials and manage platform access.'
              : 'View and manage all registered accounts on the platform.'}
          </p>
        </motion.header>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              </div>
              <div className={`p-3 ${stat.bg} rounded-2xl`}>{stat.icon}</div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Overview Tab — Practitioners */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <section className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <ShieldCheck size={22} className="text-violet-600" /> Practitioners
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {practitioners.length} Total
                  </span>
                </div>

                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mb-4">
                      <Activity size={32} className="text-violet-600" />
                    </motion.div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading records...</p>
                  </div>
                ) : practitioners.length === 0 ? (
                  <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-slate-100">
                    <ShieldCheck size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No practitioners found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {practitioners.map((p, idx) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-violet-200 hover:shadow-md transition-all"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          {/* Info */}
                          <div className="flex items-start gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 text-xl font-black flex-shrink-0">
                              {p.name[0]}
                            </div>
                            <div>
                              <h4 className="text-lg font-black text-slate-900 mb-0.5">{p.name}</h4>
                              <p className="text-sm text-slate-400 font-medium mb-2">{p.email}</p>
                              <div className="flex flex-wrap gap-2 items-center">
                                <StatusBadge status={p.verificationStatus} />
                                {p.specialization && (
                                  <span className="bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-100 uppercase tracking-tighter">
                                    {p.specialization}
                                  </span>
                                )}
                                {p.city && (
                                  <span className="bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-100">
                                    {p.city}{p.country ? `, ${p.country}` : ''}
                                  </span>
                                )}
                              </div>
                              {/* Show admin comment if present */}
                              {p.adminComment && (
                                <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 max-w-md">
                                  <MessageSquare size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                  <p className="text-[11px] text-amber-700 font-medium">{p.adminComment}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3 flex-wrap">
                            {p.degreeFile && (
                              <a
                                href={`http://localhost:8080/api/degree/${p.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-black hover:bg-slate-100 transition-all border border-slate-200"
                              >
                                <FileText size={14} /> View Docs
                              </a>
                            )}
                            <button
                              onClick={() => openAction(p, 'APPROVE')}
                              disabled={processingId === p.id}
                              className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-black hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-500/20 disabled:opacity-50"
                            >
                              <UserCheck size={14} /> Approve
                            </button>
                            <button
                              onClick={() => openAction(p, 'REJECT')}
                              disabled={processingId === p.id}
                              className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2.5 rounded-xl text-xs font-black hover:bg-rose-600 transition-all shadow-sm shadow-rose-500/20 disabled:opacity-50"
                            >
                              <UserX size={14} /> Reject
                            </button>
                            <button
                              onClick={() => openAction(p, 'REUPLOAD')}
                              disabled={processingId === p.id}
                              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl text-xs font-black hover:bg-orange-600 transition-all shadow-sm shadow-orange-500/20 disabled:opacity-50"
                            >
                              <RefreshCw size={14} /> Request Reupload
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            </motion.div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <UserCheck size={22} className="text-violet-600" /> All Platform Users
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Name</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Email</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Email Verified</th>
                        <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Verification Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {loading ? (
                        <tr><td colSpan={5} className="py-10 text-center text-slate-400 text-sm">Loading...</td></tr>
                      ) : systemUsers.length === 0 ? (
                        <tr><td colSpan={5} className="py-10 text-center text-slate-400 text-sm">No users found</td></tr>
                      ) : systemUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 pl-4 font-bold text-slate-900">{user.name}</td>
                          <td className="py-4 text-sm text-slate-500">{user.email}</td>
                          <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'PROVIDER'
                                ? 'bg-violet-50 text-violet-700 border-violet-200'
                                : 'bg-sky-50 text-sky-700 border-sky-200'
                              }`}>
                              {user.role === 'PROVIDER' ? 'Practitioner' : 'Patient'}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${user.emailVerified
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                              {user.emailVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-4">
                            <StatusBadge status={user.verificationStatus} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Confirmation Modal */}
      <AnimatePresence>
        {pendingAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => { setPendingAction(null); setActionComment('') }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-slate-100"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${pendingAction.type === 'APPROVE' ? 'bg-emerald-50' :
                  pendingAction.type === 'REJECT' ? 'bg-rose-50' : 'bg-orange-50'
                }`}>
                {pendingAction.type === 'APPROVE' && <UserCheck size={28} className="text-emerald-600" />}
                {pendingAction.type === 'REJECT' && <UserX size={28} className="text-rose-600" />}
                {pendingAction.type === 'REUPLOAD' && <RefreshCw size={28} className="text-orange-600" />}
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-1">
                {pendingAction.type === 'APPROVE' ? 'Approve Practitioner' :
                  pendingAction.type === 'REJECT' ? 'Reject Application' : 'Request Reupload'}
              </h3>
              <p className="text-slate-500 font-medium mb-6">
                {pendingAction.type === 'APPROVE'
                  ? `Approve ${pendingAction.name} as a verified practitioner?`
                  : pendingAction.type === 'REJECT'
                    ? `Reject ${pendingAction.name}'s application?`
                    : `Request ${pendingAction.name} to reupload their documents?`}
              </p>

              {(pendingAction.type === 'REJECT' || pendingAction.type === 'REUPLOAD') && (
                <div className="mb-6">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block flex items-center gap-2">
                    <MessageSquare size={12} />
                    {pendingAction.type === 'REJECT' ? 'Rejection Reason (optional)' : 'Reupload Instructions (optional)'}
                  </label>
                  <textarea
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                    placeholder={pendingAction.type === 'REJECT'
                      ? 'e.g., Degree certificate not legible, please resubmit...'
                      : 'e.g., Please upload a clearer scan of your degree certificate...'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:outline-none focus:border-violet-400 min-h-[100px] resize-none"
                  />
                </div>
              )}

              {pendingAction.type === 'APPROVE' && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                  <AlertTriangle size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-emerald-700 font-medium">
                    This will mark the practitioner as verified and notify them via email.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setPendingAction(null); setActionComment('') }}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-2xl font-black hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={processingId === pendingAction.id}
                  className={`flex-1 text-white py-3 rounded-2xl font-black transition-all shadow-lg disabled:opacity-50 ${pendingAction.type === 'APPROVE' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' :
                      pendingAction.type === 'REJECT' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' :
                        'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
                    }`}
                >
                  {processingId === pendingAction.id ? 'Processing...' :
                    pendingAction.type === 'APPROVE' ? 'Approve' :
                      pendingAction.type === 'REJECT' ? 'Reject' : 'Request Reupload'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
