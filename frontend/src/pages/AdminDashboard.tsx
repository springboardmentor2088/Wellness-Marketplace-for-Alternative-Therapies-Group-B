import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { api, type Profile } from '../api/api'
import { ShieldCheck, UserCheck, UserX, FileText, LayoutDashboard, Settings, Activity, CheckCircle2, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function AdminDashboard() {
  const [practitioners, setPractitioners] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [confirmingAction, setConfirmingAction] = useState<{ id: number, type: 'APPROVE' | 'REJECT' } | null>(null)

  useEffect(() => {
    setLoading(true)
    api.getUsers()
      .then((data: Profile[]) => {
        setPractitioners(data)
      })
      .catch((err) => {
        console.error('FETCH USERS ERROR:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])
  const handleApprove = async (id: number) => {
    setProcessingId(id)
    try {
      await api.approvePractitioner(id)
      setPractitioners((prev) =>
        prev.map((p) => (p.id === id ? { ...p, verificationStatus: 'APPROVED' } : p))
      )
      setConfirmingAction(null)
    } catch (err: any) {
      console.error('ADMIN APPROVE ERROR:', err.response?.data || err)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: number) => {
    setProcessingId(id)
    try {
      await api.rejectPractitioner(id)
      setPractitioners((prev) =>
        prev.map((p) => (p.id === id ? { ...p, verificationStatus: 'REJECTED' } : p))
      )
      setConfirmingAction(null)
    } catch (err: any) {
      console.error('ADMIN REJECT ERROR:', err.response?.data || err)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <DashboardLayout
      sidebarItems={[
        { label: 'Overview', path: '/admin', active: true, icon: <LayoutDashboard size={20} /> },
        { label: 'Users', path: '#', icon: <UserCheck size={20} /> },
        { label: 'Reports', path: '#', icon: <Activity size={20} /> },
        { label: 'Settings', path: '#', icon: <Settings size={20} /> },
      ]}
    >
      <div className="space-y-10">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[2.5rem] border border-brand-100/50 shadow-xl shadow-brand-500/5"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-brand-50 text-brand-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-100">Control Panel</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
            Admin <span className="text-brand-600">Verification</span>
          </h2>
          <p className="text-slate-500 font-medium italic">Validate practitioner credentials and manage platform access.</p>
        </motion.header>

        <section className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <ShieldCheck size={24} className="text-brand-600" /> Pending Approvals
            </h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {practitioners.length} Applications Total
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mb-4">
                  <Activity size={32} className="text-brand-600" />
                </motion.div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Synchronizing records...</p>
              </div>
            ) : practitioners.length === 0 ? (
              <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <ShieldCheck size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No pending applications</p>
              </div>
            ) : (
              <AnimatePresence>
                {practitioners.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-500/5 hover:border-brand-200 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8"
                  >
                    <div className="flex items-start gap-6">
                      <div className="h-16 w-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 text-2xl font-black shadow-inner shadow-brand-500/5">
                        {p.name[0]}
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-900 mb-1">{p.name}</h4>
                        <p className="text-sm font-bold text-slate-400 mb-3">{p.email}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-bold border border-slate-100 uppercase tracking-tighter">
                            {p.city} · {p.country}
                          </span>
                          {p.verificationStatus === 'APPROVED' ? (
                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black border border-emerald-100 uppercase tracking-widest flex items-center gap-1">
                              <CheckCircle2 size={12} /> {p.verificationStatus}
                            </span>
                          ) : p.verificationStatus === 'REJECTED' ? (
                            <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-lg text-[10px] font-black border border-rose-100 uppercase tracking-widest flex items-center gap-1">
                              <XCircle size={12} /> {p.verificationStatus}
                            </span>
                          ) : (
                            <span className="bg-brand-50 text-brand-600 px-3 py-1 rounded-lg text-[10px] font-black border border-brand-100 uppercase tracking-widest">
                              {p.verificationStatus || 'PENDING'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 border-t lg:border-t-0 pt-6 lg:pt-0 lg:pl-10 lg:border-l border-slate-100">
                      {p.degreeFile && (
                        <a
                          href={`http://localhost:8080/api/degree/${p.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 bg-brand-50 text-brand-600 px-6 py-4 rounded-2xl text-sm font-black hover:bg-brand-100 transition-all shadow-sm"
                        >
                          <FileText size={18} /> Credentials
                        </a>
                      )}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <AnimatePresence mode="wait">
                          {confirmingAction?.id === p.id ? (
                            <motion.div
                              key="confirm"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200"
                            >
                              <span className="text-[10px] font-black uppercase tracking-tight text-slate-500 px-2">
                                Confirm {confirmingAction!.type}?
                              </span>
                              <button
                                onClick={() => confirmingAction!.type === 'APPROVE' ? handleApprove(p.id) : handleReject(p.id)}
                                disabled={processingId === p.id}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase text-white shadow-lg transition-all ${confirmingAction!.type === 'APPROVE'
                                  ? 'bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-600'
                                  : 'bg-rose-500 shadow-rose-500/20 hover:bg-rose-600'
                                  }`}
                              >
                                {processingId === p.id ? '...' : 'Yes'}
                              </button>
                              <button
                                onClick={() => setConfirmingAction(null)}
                                disabled={processingId === p.id}
                                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-white text-slate-400 border border-slate-200 hover:text-slate-600 transition-all"
                              >
                                No
                              </button>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="actions"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex gap-2"
                            >
                              {(!p.verificationStatus || p.verificationStatus === 'PENDING' || p.verificationStatus === 'PENDING_ADMIN_APPROVAL') && (
                                <>
                                  <button
                                    onClick={() => setConfirmingAction({ id: p.id, type: 'APPROVE' })}
                                    className="p-4 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all group/btn"
                                    title="Approve Practitioner"
                                  >
                                    <UserCheck size={20} className="group-hover/btn:scale-110 transition-transform" />
                                  </button>
                                  <button
                                    onClick={() => setConfirmingAction({ id: p.id, type: 'REJECT' })}
                                    className="p-4 bg-rose-500 text-white rounded-2xl shadow-xl shadow-rose-500/20 hover:bg-rose-600 active:scale-95 transition-all group/btn"
                                    title="Reject Application"
                                  >
                                    <UserX size={20} className="group-hover/btn:scale-110 transition-transform" />
                                  </button>
                                </>
                              )}
                              {(p.verificationStatus === 'APPROVED' || p.verificationStatus === 'REJECTED') && (
                                <div className="p-4 text-slate-300 italic text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                  Action Completed
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
