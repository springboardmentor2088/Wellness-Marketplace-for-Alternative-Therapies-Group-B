import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { api } from '../api'
import type { RegisterRequest, AuthResponse } from '../api'

export function RegisterPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const defaultRole = params.get('role') ?? 'PATIENT'

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    specialization: '',
    city: '',
    country: ''
  })

  const [dropdownRole, setDropdownRole] = useState<'PATIENT' | 'PRACTITIONER' | 'ADMIN'>(defaultRole as 'PATIENT' | 'PRACTITIONER' | 'ADMIN')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const roleMap: Record<string, 'CLIENT' | 'PROVIDER' | 'ADMIN'> = {
    PATIENT: 'CLIENT',
    PRACTITIONER: 'PROVIDER',
    ADMIN: 'ADMIN'
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (formData.fullName.length < 2) newErrors.fullName = 'Full name must be at least 2 characters'
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email'
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (dropdownRole === 'PRACTITIONER' && !formData.specialization) newErrors.specialization = 'Specialization is required for practitioners'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'role') setDropdownRole(value as 'PATIENT' | 'PRACTITIONER' | 'ADMIN')
    else setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setErrors({})

    try {
      const payload: RegisterRequest = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: roleMap[dropdownRole],
        specialization: formData.specialization,
        city: formData.city,
        country: formData.country
      }

      const response: AuthResponse = await api.register(payload)
      console.log('REGISTER RESPONSE:', response)

      if (response.accessToken) localStorage.setItem('accessToken', response.accessToken)

      if (payload.role === 'PROVIDER') navigate('/upload-degree')
      else if (payload.role === 'ADMIN') navigate('/dashboard/admin')
      else navigate('/dashboard/user')

    } catch (err) {
      setErrors({ general: 'Registration failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-emerald-50">
      <TopNav />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-10">
        <div className="rounded-2xl bg-white p-6 shadow-soft-card md:p-8">
          <h1 className="text-xl font-semibold text-slate-900">Create your Wellness Hub account</h1>
          <p className="mt-1 text-xs text-slate-600">Choose your role to get a tailored dashboard experience.</p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
            {/* Left column */}
            <div className="space-y-4 md:col-span-1">
              <div>
                <label className="text-xs font-medium text-slate-700">Full name</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="Your name"/>
                {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="you@example.com"/>
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="Create a strong password"/>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4 md:col-span-1">
              <div>
                <label className="text-xs font-medium text-slate-700">Role</label>
                <select name="role" value={dropdownRole} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                  <option value="PATIENT">Patient</option>
                  <option value="PRACTITIONER">Practitioner</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {dropdownRole === 'PRACTITIONER' && (
                <div>
                  <label className="text-xs font-medium text-slate-700">Specialization</label>
                  <select name="specialization" value={formData.specialization} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                    <option value="">Select specialization</option>
                    <option value="Acupuncture">Acupuncture</option>
                    <option value="Massage Therapy">Massage Therapy</option>
                    <option value="Yoga">Yoga</option>
                    <option value="Reiki">Reiki</option>
                    <option value="Chiropractic">Chiropractic</option>
                    <option value="Herbal Medicine">Herbal Medicine</option>
                  </select>
                  {errors.specialization && <p className="mt-1 text-xs text-red-600">{errors.specialization}</p>}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-slate-700">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="Your city"/>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700">Country</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" placeholder="Your country"/>
              </div>
            </div>

            <div className="md:col-span-2">
              {errors.general && <p className="text-xs text-red-600">{errors.general}</p>}
              <button type="submit" disabled={loading} className="mt-2 w-full rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft-card hover:bg-brand-700 disabled:opacity-50 md:w-auto">
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
