/**
 * Authentication utility functions
 */

// Save token to localStorage
export const saveToken = (token) => {
  localStorage.setItem('token', token)
}

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('token')
}

// Remove token from localStorage (logout)
export const removeToken = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// Get user object from localStorage or JWT
export const getUser = () => {
  // First try to get from localStorage (saved by Login.jsx)
  const userFromStorage = localStorage.getItem('user')
  if (userFromStorage) {
    try {
      return JSON.parse(userFromStorage)
    } catch (error) {
      console.error('Error parsing user from localStorage:', error)
    }
  }

  // Fallback to JWT decode
  const token = getToken()
  if (!token) return null

  try {
    // Split token and get payload
    const payload = token.split('.')[1]
    if (!payload) return null

    // Decode base64
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch (error) {
    console.error('Error decoding token:', error)
    removeToken() // Remove invalid token
    return null
  }
}

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken()
  const user = getUser()
  return !!(token && user)
}

// Check if user has specific role(s)
export const hasRole = (roles) => {
  const user = getUser()
  console.log('hasRole debug:', { roles, user, userRole: user?.role })
  
  if (!user) return false
  
  // If roles is a string, check single role
  if (typeof roles === 'string') {
    const result = user.role === roles
    console.log('hasRole string check:', { role: roles, userRole: user.role, result })
    return result
  }
  
  // If roles is an array, check if user role is in array
  if (Array.isArray(roles)) {
    const result = roles.includes(user.role)
    console.log('hasRole array check:', { roles, userRole: user.role, result })
    return result
  }
  
  return false
}

// Check if user is admin
export const isAdmin = () => {
  return hasRole('admin')
}

// Check if user is owner or admin
export const isOwnerOrAdmin = () => {
  const user = getUser()
  return user && (user.role === 'owner' || user.role === 'admin')
}
