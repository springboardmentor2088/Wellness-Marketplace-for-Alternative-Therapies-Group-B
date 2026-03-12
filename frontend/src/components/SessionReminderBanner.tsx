import { useEffect, useState } from 'react'
import type { SessionBooking } from '../api'
import { Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  fetchReminders: () => Promise<SessionBooking[]>
}

export function SessionReminderBanner({ fetchReminders }: Props) {
  const [visible, setVisible] = useState(false)
  const [nextSession, setNextSession] = useState<SessionBooking | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const sessions = await fetchReminders()
        if (!cancelled && sessions.length > 0) {
          setNextSession(sessions[0])
          setVisible(true)
        }
      } catch {
        // Ignore errors; banner is best-effort
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [fetchReminders])

  return (
    <AnimatePresence>
      {visible && nextSession && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-0 inset-x-0 z-40 flex justify-center pointer-events-none"
        >
          <div className="pointer-events-auto mt-4 px-4">
            <div className="max-w-3xl mx-auto bg-slate-900 text-white rounded-2xl shadow-2xl shadow-slate-900/40 px-4 py-3 flex items-center gap-3 text-sm">
              <div className="p-2 rounded-xl bg-brand-500/20 text-brand-200">
                <Bell size={18} />
              </div>
              <div className="flex-1">
                <p className="font-black text-xs tracking-widest uppercase text-slate-300 mb-0.5">
                  Upcoming Session
                </p>
                <p className="font-bold text-sm">
                  Your session starts in approximately 30 minutes.
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {nextSession.sessionDate} · {nextSession.startTime} – {nextSession.endTime} ·{' '}
                  {nextSession.duration} mins
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVisible(false)}
                className="text-[11px] font-bold uppercase tracking-widest text-slate-300 hover:text-white"
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

