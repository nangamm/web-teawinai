import { Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Home } from '@/pages/Home'
import { Result } from '@/pages/Result'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { MyTrips } from '@/pages/MyTrips'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { Profile } from '@/pages/Profile'
import { Places } from '@/pages/Places'
import { PlaceDetail } from '@/pages/PlaceDetail'
import { AddPlace } from '@/pages/AddPlace'
import { NotFound } from '@/pages/NotFound'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/result" element={<Result />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/places" element={<Places />} />
          <Route path="/places/:id" element={<PlaceDetail />} />
          
          {/* Protected routes */}
          <Route 
            path="/my-trips" 
            element={
              <ProtectedRoute>
                <MyTrips />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/places/add" 
            element={
              <ProtectedRoute requiredRole={['admin', 'owner']}>
                <AddPlace />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-place" 
            element={
              <ProtectedRoute requiredRole={['admin', 'owner']}>
                <AddPlace />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin only routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
