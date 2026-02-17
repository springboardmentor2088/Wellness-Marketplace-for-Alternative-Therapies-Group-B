import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNav } from '../components/TopNav'
import { api } from '../api'
import type { Profile } from '../api'


export function DegreeUploadPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<Profile | null>(null)

  // Fetch user profile to get ID
  useEffect(() => {
    api.getProfile()
      .then(profile => setUserProfile(profile))
      .catch(() => setError('Failed to load user profile'))
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are allowed')
        setFile(null)
        return
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB
        setError('File size must be less than 5MB')
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }
    if (!userProfile) {
      setError('User profile not loaded yet')
      return
    }

    setLoading(true)
    try {
      await api.uploadDegree(file, userProfile.id) // ✅ pass userId
      navigate('/dashboard/practitioner')
    } catch (error) {
      setError('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-emerald-50">
      <TopNav />
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-10">
        <div className="rounded-2xl bg-white p-6 shadow-soft-card md:p-8">
          <h1 className="text-xl font-semibold text-slate-900">Upload Degree Certificate</h1>
          <p className="mt-1 text-xs text-slate-600">
            As a practitioner, please upload your degree certificate for verification.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-700">Degree Certificate (PDF)</label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              {file && <p className="mt-1 text-xs text-slate-600">Selected: {file.name}</p>}
              {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft-card hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload and Continue'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
