import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Home } from '@/pages/Home'
import { Result } from '@/pages/Result'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { MyTrips } from '@/pages/MyTrips'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { ApprovalQueue } from '@/pages/ApprovalQueue'
import { Profile } from '@/pages/Profile'
import { Places } from '@/pages/Places'
import { PlaceDetail } from '@/pages/PlaceDetail'
import { AddPlace } from '@/pages/AddPlace'
import { NotFound } from '@/pages/NotFound'
import Contact from '@/pages/Contact'
import { Promotions } from '@/pages/Promotions'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  const location = useLocation()
  const hideAppChrome = ['/login', '/register'].includes(location.pathname)

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {!hideAppChrome && <Navbar />}
      <main className={`flex-grow${hideAppChrome ? '' : ' main-with-navbar'}`}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/result" element={<Result />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/places" element={<Places />} />
          <Route path="/places/:id" element={<PlaceDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/promotions" element={<Promotions />} />
          
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
            path="/admin/approval-queue"
            element={
              <ProtectedRoute requiredRole={['admin']}>
                <ApprovalQueue />
              </ProtectedRoute>
            }
          />
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
      {!hideAppChrome && <Footer />}
    </div>
  )
}

export default App
