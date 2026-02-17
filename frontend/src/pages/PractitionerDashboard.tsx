import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { api, type Profile } from '../api'

export function PractitionerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    country: '',
    specialization: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')

  // Fetch profile on mount
  useEffect(() => {
    api
      .getProfile()
      .then((data) => {
        setProfile(data)
        setFormData({
          name: data.name,
          city: data.city || '',
          country: data.country || '',
          specialization: data.specialization || '',
        })
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-6">Loading...</div>
  if (!profile) return <div className="p-6">Unable to load profile.</div>

  const status = profile.verificationStatus || 'PENDING'

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    try {
      // Update profile using API object
      await api.updateUser(profile.id, formData)

      // Upload file if selected
      if (file) {
        await api.uploadDegree(file, profile.id)
        setMessage('Profile and degree uploaded successfully!')
      } else {
        setMessage('Profile updated successfully!')
      }

      // Refresh profile
      const updatedProfile = await api.getProfile()
      setProfile(updatedProfile)
      setFile(null)
    } catch (err) {
      console.error(err)
      setMessage('Error updating profile')
    }
  }

  return (
    <DashboardLayout
      sidebarItems={[
        { label: 'Dashboard', active: true },
        { label: 'Profile & Verification', to: '#' },
        { label: 'Session Requests', to: '#' },
        { label: 'Calendar', to: '#' },
        { label: 'Community Q&A', to: '#' },
        { label: 'Reviews', to: '#' },
      ]}
    >
      <div className="grid gap-5 lg:grid-cols-[2fr,1.1fr]">
        <section className="space-y-5">
          {/* Stats + Verification */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-soft-card">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-600">
                Pending Sessions
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">3</p>
              <p className="mt-1 text-xs text-slate-600">
                New requests awaiting your response.
              </p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 p-4 shadow-soft-card">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">
                Verification Status
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{status}</p>
              <p className="mt-1 text-xs text-slate-600">
                {status === 'APPROVED' &&
                  'Your account is verified and visible to clients.'}
                {status === 'PENDING' &&
                  'Your documents are under review by admin.'}
                {status === 'REJECTED' &&
                  'Your verification was rejected. Please re-upload valid documents.'}
              </p>
              {profile.degreeFile && (
                <a
                  href={`http://localhost:8080/${profile.degreeFile}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block mt-3 text-xs text-blue-600 underline"
                >
                  View Uploaded Degree
                </a>
              )}
            </div>
          </div>

          {/* Editable Form */}
          <section className="rounded-2xl bg-white p-4 shadow-soft-card">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Edit Profile
            </h2>
            {message && <p className="mb-2 text-xs text-green-600">{message}</p>}
            <form className="space-y-3" onSubmit={handleSave}>
              <div>
                <label className="text-xs font-semibold">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>

              {status !== 'APPROVED' && (
                <div>
                  <label className="text-xs font-semibold">Upload Degree</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="mt-1 w-full text-sm"
                  />
                </div>
              )}

              <button
                type="submit"
                className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Save Changes
              </button>
            </form>
          </section>
        </section>

        {/* Sidebar */}
        <aside className="space-y-4">
          <section className="rounded-2xl bg-white p-4 shadow-soft-card">
            <h2 className="text-sm font-semibold text-slate-900">Your Info</h2>
            <div className="mt-3 text-xs text-slate-700 space-y-2">
              <p>
                <strong>Name:</strong> {profile.name}
              </p>
              <p>
                <strong>Email:</strong> {profile.email}
              </p>
              <p>
                <strong>City:</strong> {profile.city || 'N/A'}
              </p>
              <p>
                <strong>Country:</strong> {profile.country || 'N/A'}
              </p>
              <p>
                <strong>Specialization:</strong> {profile.specialization || 'N/A'}
              </p>
              <p>
                <strong>Status:</strong> {status}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </DashboardLayout>
  )
}
