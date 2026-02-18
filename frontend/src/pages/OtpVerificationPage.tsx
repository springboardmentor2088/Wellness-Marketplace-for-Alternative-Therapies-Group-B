import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, RefreshCw, ShieldCheck } from 'lucide-react'
import { api } from '../api/api'

export function OtpVerificationPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const email = location.state?.email || localStorage.getItem('userEmail')

    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [resendLoading, setResendLoading] = useState(false)
    const [timer, setTimer] = useState(60)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        if (!email) {
            navigate('/register')
        }

        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)

        return () => clearInterval(interval)
    }, [email, navigate])

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return

        const newOtp = [...otp]
        newOtp[index] = value.substring(value.length - 1)
        setOtp(newOtp)

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        const otpValue = otp.join('')
        if (otpValue.length < 6) {
            setError('Please enter the full 6-digit code')
            return
        }

        setLoading(true)
        setError('')
        try {
            const response = await api.verifyOtp(email, otpValue)

            const role = response.role
            if (role === 'ADMIN') navigate('/admin')
            else if (role === 'PROVIDER') navigate('/practitioner')
            else navigate('/user')

        } catch (err: any) {
            setError(err.response?.data?.error || 'Verification failed. Invalid OTP.')
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (timer > 0) return
        setResendLoading(true)
        setError('')
        try {
            await api.resendOtp(email)
            setTimer(60)
            setOtp(['', '', '', '', '', ''])
            inputRefs.current[0]?.focus()
        } catch (err: any) {
            setError('Failed to resend OTP. Please try again.')
        } finally {
            setResendLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-brand-500/10 border border-brand-100"
            >
                <div className="text-center mb-10">
                    <div className="mx-auto w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center text-brand-600 mb-6 shadow-inner">
                        <ShieldCheck size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Verify your email</h1>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        We've sent a 6-digit code to <br />
                        <span className="text-slate-900 font-black">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-8">
                    <div className="flex justify-between gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el }}
                                type="text"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-16 text-center text-2xl font-black rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
                                maxLength={1}
                            />
                        ))}
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center text-sm font-bold text-red-500"
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full group flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-8 py-5 text-lg font-black text-white shadow-xl shadow-brand-600/20 transition-all hover:bg-brand-700 active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : <>Complete Registration <ArrowRight className="group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-sm font-medium text-slate-500 mb-4">
                        Didn't receive the code?
                    </p>
                    <button
                        onClick={handleResend}
                        disabled={timer > 0 || resendLoading}
                        className={`flex items-center gap-2 mx-auto font-black text-sm transition-all ${timer > 0 ? 'text-slate-300 cursor-not-allowed' : 'text-brand-600 hover:text-brand-700'
                            }`}
                    >
                        <RefreshCw size={16} className={resendLoading ? 'animate-spin' : ''} />
                        {resendLoading ? 'Sending...' : timer > 0 ? `Resend code in ${timer}s` : 'Resend Code Now'}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
