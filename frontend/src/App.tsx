import { Route, Routes, Navigate } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DegreeUploadPage } from './pages/DegreeUploadPage'
import { UserDashboard } from './pages/UserDashboard'
import { PractitionerDashboard } from './pages/PractitionerDashboard'
import { AdminDashboard } from './pages/AdminDashboard'
import { MarketplacePage } from './pages/MarketplacePage'
import { ProductsPage } from './pages/ProductsPage'
import { MyProductsPage } from './pages/MyProductsPage'
import { ProductOrdersPage } from './pages/ProductOrdersPage'
import { ProtectedRoute } from './components/ProtectedRoute'

import { VerificationPendingPage } from './pages/VerificationPendingPage'
import { VerifyEmailLanding } from './pages/VerifyEmailLanding'
import { OtpVerificationPage } from './pages/OtpVerificationPage'

function App() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Routes>
        {/* Landing & Auth */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Verification */}
        <Route path="/verification-sent" element={<VerificationPendingPage />} />
        <Route path="/otp-verification" element={<OtpVerificationPage />} />
        <Route path="/verify" element={<VerifyEmailLanding />} />

        {/* Degree Upload */}
        <Route path="/upload-degree" element={<DegreeUploadPage />} />

        {/* Marketplace */}
        <Route path="/marketplace" element={<MarketplacePage />} />

        <Route path="/products" element={
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <ProductsPage />
          </ProtectedRoute>
        } />

        <Route path="/my-products" element={
          <ProtectedRoute allowedRoles={['PROVIDER']}>
            <MyProductsPage />
          </ProtectedRoute>
        } />

        <Route path="/product-orders" element={
          <ProtectedRoute allowedRoles={['CLIENT', 'PROVIDER']}>
            <ProductOrdersPage />
          </ProtectedRoute>
        } />

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
