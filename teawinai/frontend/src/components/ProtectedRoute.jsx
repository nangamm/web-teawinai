import { Navigate } from 'react-router-dom'
import { isAuthenticated, getUser } from '../utils/auth'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const isAuth = isAuthenticated()
  const user = getUser()

  console.log('ProtectedRoute Debug:', {
    isAuth,
    user,
    requiredRole,
    userRole: user?.role,
    hasAccess: requiredRole ? requiredRole.includes(user?.role) : true
  })

  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && !requiredRole.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
