import { useMemo, useState } from 'react'
import type { SessionBooking } from '../api'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SessionCalendarProps {
  sessions: SessionBooking[]
  role: 'patient' | 'practitioner'
  onDaySelect?: (date: string) => void
}

interface DayInfo {
  date: string
  count: number
  statuses: string[]
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Normalize any sessionDate value (YYYY-MM-DD or full ISO) to a local YYYY-MM-DD string.
 * If the string is already YYYY-MM-DD we return it as-is to avoid timezone shifting via
 * the Date constructor (new Date('2025-03-01') is parsed as UTC midnight, not local).
 */
function toLocalDateKey(raw: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  const d = new Date(raw)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function SessionCalendar({ sessions, role, onDaySelect }: SessionCalendarProps) {
  // currentDate represents the first day of the currently viewed month
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const viewYear = currentDate.getFullYear()
  const viewMonth = currentDate.getMonth()

  const startOfMonth = new Date(viewYear, viewMonth, 1)
  const endOfMonth = new Date(viewYear, viewMonth + 1, 0)
  const startWeekday = startOfMonth.getDay()
  const daysInMonth = endOfMonth.getDate()

  const handlePrevMonth = () => {
    setCurrentDate(new Date(viewYear, viewMonth - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(viewYear, viewMonth + 1, 1))
  }

  // Build a map of YYYY-MM-DD -> session count using normalized local date keys
  const daySessions: Record<string, DayInfo> = useMemo(() => {
    const map: Record<string, DayInfo> = {}
    sessions.forEach((s) => {
      if (!s.sessionDate) return
      const key = toLocalDateKey(String(s.sessionDate))
      if (!map[key]) {
        map[key] = { date: key, count: 0, statuses: [] }
      }
      map[key].count += 1
      if (s.status) {
        map[key].statuses.push(s.status)
      }
    })
    return map
  }, [sessions])


  const selectedSessions = selectedDate
    ? sessions.filter((s) => toLocalDateKey(String(s.sessionDate)) === selectedDate)
    : []

  // Build "today" string the same way — local date, no timezone shift
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly Planner</p>
              <h3 className="text-xl font-black text-slate-900">
                {currentDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-600 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-600 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
            {WEEK_DAYS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2 text-sm">
            {/* Empty cells before the first day */}
            {Array.from({ length: startWeekday }).map((_, idx) => (
              <div key={`empty-${idx}`} className="aspect-square" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const info = daySessions[dateStr]
              const isToday = dateStr === todayStr
              const isSelected = selectedDate === dateStr

              const baseClasses =
                'relative flex flex-col items-center justify-center aspect-square rounded-2xl border text-xs font-bold cursor-pointer transition-all'

              const isPast = dateStr < todayStr

              const getColor = () => {
                if (!info || info.count === 0) {
                  return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-white hover:border-brand-200'
                }

                if (isPast) {
                  const hasIssues = info.statuses.some(s => s === 'NOT_COMPLETED' || s === 'PENDING_COMPLETION_ACTION')
                  if (hasIssues) {
                    return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/50'
                  }
                  const allCompleted = info.statuses.every(s => s === 'COMPLETED')
                  if (allCompleted) {
                    return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-white hover:border-brand-200'
                  }
                }

                return 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/50'
              }

              const colorClasses = getColor()

              return (
                <button
                  key={dateStr}
                  type="button"
                  title={`${info?.count || 0} sessions on ${dateStr}`}
                  onClick={() => {
                    setSelectedDate(dateStr)
                    onDaySelect?.(dateStr)
                  }}
                  className={`${baseClasses} ${colorClasses} ${isSelected ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-white scale-110 z-10' : ''}`}
                >
                  <span className="mb-0.5">{day}</span>
                  {isToday && (
                    <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-brand-500 shadow-sm" />
                  )}
                  {info && info.count > 0 && (
                    <span className="text-[10px] font-black opacity-60">{info.count}</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend — same for both roles */}
          <div className="mt-8 flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-t border-slate-50 pt-6">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span>No sessions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span>Session booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span>Action Required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Side panel */}
      <div className="h-full">
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm h-full flex flex-col min-h-[400px]">
          <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center justify-between">
            <span>
              {selectedDate
                ? (() => {
                  const [y, m, d] = selectedDate.split('-').map(Number)
                  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })
                })()
                : 'Day Details'}
            </span>
            {selectedDate && (
              <span className="px-3 py-1 bg-brand-50 text-brand-600 rounded-lg text-[10px] uppercase tracking-widest">
                {selectedSessions.length} sessions
              </span>
            )}
          </h3>
          <div className="flex-1 overflow-y-auto space-y-4">
            <AnimatePresence mode="wait">
              {!selectedDate ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-6"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-3">
                    <ChevronLeft size={24} />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Select a date from the calendar to view scheduled sessions.</p>
                </motion.div>
              ) : selectedSessions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-10"
                >
                  <p className="text-xs text-slate-400 font-medium italic">No sessions scheduled for this date.</p>
                </motion.div>
              ) : (
                selectedSessions.map((s, idx) => (
                  <motion.div
                    key={s.id || idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-brand-200 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-black text-slate-900 text-sm">
                        {role === 'practitioner'
                          ? s.clientName || `Client #${s.clientId}`
                          : s.providerName || `Provider #${s.providerId}`}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${s.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}
                      >
                        {s.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-bold mb-1">
                      {s.sessionDate}
                    </p>
                    <p className="text-[11px] text-slate-600 font-bold mb-2">
                      {s.startTime} – {s.endTime} · {s.duration} mins
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed italic">
                      {s.issueDescription || 'No description provided.'}
                    </p>
                    {s.providerMessage && (
                      <div className="mt-3 text-[10px] text-amber-700 bg-amber-50/50 border border-amber-100 rounded-2xl p-3">
                        <p className="font-black uppercase tracking-tighter mb-1 select-none opacity-50">Note from specialist</p>
                        {s.providerMessage}
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
