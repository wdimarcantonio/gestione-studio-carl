import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { Toaster } from '@/components/ui/sonner'
import { LoginPage } from '@/components/auth/LoginPage'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { PatientsPage } from '@/components/admin/PatientsPage'
import { MeasurementsPage } from '@/components/admin/MeasurementsPage'
import { AdminMessagesPage } from '@/components/admin/AdminMessagesPage'
import { AdminDocumentsPage } from '@/components/admin/AdminDocumentsPage'
import { PatientDashboard } from '@/components/patient/PatientDashboard'
import { PatientMessagesPage } from '@/components/patient/PatientMessagesPage'
import { PatientDocumentsPage } from '@/components/patient/PatientDocumentsPage'

function RootRedirect() {
  const { user } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }
  
  return <Navigate to="/patient" replace />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/patients"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout>
                  <PatientsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/measurements"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout>
                  <MeasurementsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout>
                  <AdminMessagesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/documents"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Layout>
                  <AdminDocumentsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <Layout>
                  <PatientDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/messages"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <Layout>
                  <PatientMessagesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/documents"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <Layout>
                  <PatientDocumentsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App