import { Route, Routes } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DegreeUploadPage } from './pages/DegreeUploadPage'
import { UserDashboard } from './pages/UserDashboard'
import { PractitionerDashboard } from './pages/PractitionerDashboard'
import { AdminDashboard } from './pages/AdminDashboard'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-emerald-50">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/upload-degree" element={<DegreeUploadPage />} />
        <Route path="/dashboard/user" element={<UserDashboard />} />
        <Route path="/dashboard/practitioner" element={<PractitionerDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  )
}

export default App
