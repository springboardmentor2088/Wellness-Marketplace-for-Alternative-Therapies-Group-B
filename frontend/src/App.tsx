import { Route, Routes, Navigate } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DegreeUploadPage } from './pages/DegreeUploadPage'
import { UserDashboard } from './pages/UserDashboard'
import { PractitionerDashboard } from './pages/PractitionerDashboard'
import { AdminDashboard } from './pages/AdminDashboard'
import { MarketplacePage } from './pages/MarketplacePage'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-emerald-50">
      <Routes>
        {/* Landing & Auth */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Degree Upload */}
        <Route path="/upload-degree" element={<DegreeUploadPage />} />

        {/* Marketplace */}
        <Route path="/marketplace" element={<MarketplacePage />} />

        {/* Dashboards */}
        <Route path="/user" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/practitioner" element={
          <ProtectedRoute allowedRoles={['PROVIDER']}>
            <PractitionerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Redirect unknown routes to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
