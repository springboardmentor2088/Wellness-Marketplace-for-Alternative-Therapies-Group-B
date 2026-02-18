import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { api } from '../api/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ArrowRight, LogIn, Sparkles } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [showForgot, setShowForgot] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.login({ email, password });
      localStorage.setItem('userName', response.name);
      localStorage.setItem('userEmail', email);

      if (!response.emailVerified) {
        navigate('/otp-verification', { state: { email } });
        return;
      }

      if (response.role === 'ADMIN') navigate('/admin');
      else if (response.role === 'PROVIDER') navigate('/practitioner');
      else navigate('/user');

    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) return
    setLoading(true)
    try {
      await api.forgotPassword(forgotEmail)
      setForgotSent(true)
      setTimeout(() => {
        setShowForgot(false)
        setForgotSent(false)
      }, 5000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send recovery email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopNav />
      <main className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-12 px-4 pb-24 pt-24 lg:flex-row">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block lg:w-1/2"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1 text-sm font-bold text-brand-700 mb-6">
            <Sparkles size={16} /> <span>Welcome back to Wellness Hub</span>
          </div>
          <h1 className="text-6xl font-black text-slate-900 leading-[1.1] tracking-tighter mb-6">
            Your journey to <br />
            <span className="text-brand-600">better health</span> starts here.
          </h1>
          <p className="text-xl text-slate-600 font-medium max-w-md">
            Dive back into your personalized wellness dashboard and connect with top-tier practitioners.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="rounded-[2.5rem] bg-white p-10 shadow-2xl shadow-brand-500/10 border border-brand-100/50">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Member Login</h2>
              <p className="text-slate-500 font-medium">Access your holistic health portal.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-12 pr-4 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-12 pr-4 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end px-2">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs font-black text-slate-400 hover:text-brand-600 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <AnimatePresence>
                {showForgot && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-brand-50/50 p-6 rounded-2xl border border-brand-100 overflow-hidden"
                  >
                    {!forgotSent ? (
                      <div className="space-y-4 text-left">
                        <p className="text-xs font-black text-brand-700 uppercase tracking-widest">Reset Password</p>
                        <p className="text-xs text-slate-500 font-medium">Enter your email and we'll send a temporary password.</p>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            placeholder="Email address"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-500"
                          />
                          <button
                            type="button"
                            onClick={handleForgot}
                            className="bg-brand-600 text-white px-4 py-3 rounded-xl text-xs font-black hover:bg-brand-700"
                          >
                            Send
                          </button>
                        </div>
                        <button onClick={() => setShowForgot(false)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <Mail size={24} className="mx-auto text-emerald-500 mb-2" />
                        <p className="text-xs font-black text-emerald-600">Temporary password sent!</p>
                        <p className="text-[10px] text-slate-500 mt-1">Please check your email and login again.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full group flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-8 py-4 text-lg font-black text-white shadow-xl shadow-brand-600/20 transition-all hover:bg-brand-700 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Logging in...' : (
                  <>
                    Sign In <LogIn size={20} />
                  </>
                )}
              </button>

              <div className="text-center space-y-4 pt-2">
                <p className="text-sm font-medium text-slate-500">
                  New to Wellness Hub?{' '}
                  <Link to="/register" className="text-brand-600 font-black hover:text-brand-700">Create account</Link>
                </p>
                <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-brand-500 transition-colors">
                  Go back home <ArrowRight size={14} />
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
