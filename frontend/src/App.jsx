import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import VerifyPage from './pages/VerifyPage'
import Navbar from './components/Navbar'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('cv_token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <>
      <Toaster position="bottom-right" toastOptions={{
        style: { background: '#1a1f35', color: '#e0e0e0', border: '1px solid rgba(255,255,255,0.1)' }
      }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Navbar />
            <DashboardPage />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}
