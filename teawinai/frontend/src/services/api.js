import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
})
// Note: Do not set a default `Content-Type` header here so that
// axios can automatically set the correct headers for FormData
// (including the multipart boundary) when uploading files.

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => {
    // Handle FormData for file uploads
    if (profileData instanceof FormData) {
      return api.put('/auth/profile', profileData)
    }
    // Regular JSON data
    return api.put('/auth/profile', profileData)
  },
  getUserPlaces: () => api.get('/auth/places'),
  getUserReviews: () => api.get('/auth/reviews'),
  getUsers: (params) => api.get('/auth/users', { params }),
  getDashboardStats: () => api.get('/auth/dashboard/stats'),
}

// Places API
export const placesAPI = {
  getPlaces: (params) => api.get('/places', { params }),
  getHomeReviews: (params) => api.get('/places/reviews/home', { params }),
  getAdminPlaces: (params) => api.get('/places/admin/all', { params }),
  getPlace: (id) => api.get(`/places/${id}`),
  getPlacePromotions: (id) => api.get(`/places/${id}/promotions`),
  createPlace: (placeData) => {
  // Check if it's FormData (for file uploads)
  if (placeData instanceof FormData) {
    return api.post('/places', placeData)
  }
  // Regular JSON data
  return api.post('/places', placeData)
},
  updatePlace: (id, placeData) => {
    // Handle FormData for file uploads
    if (placeData instanceof FormData) {
      return api.put(`/places/${id}`, placeData)
    }
    // Regular JSON data
    return api.put(`/places/${id}`, placeData)
  },
  deletePlace: (id) => api.delete(`/places/${id}`),
  approvePlace: (id) => api.put(`/places/${id}/approve`),
  rejectPlace: (id) => api.put(`/places/${id}/reject`),
  addReview: (id, reviewData) => api.post(`/places/${id}/reviews`, reviewData),
  addReviewReply: (id, reviewId, replyData) => api.post(`/places/${id}/reviews/${reviewId}/replies`, replyData),
}

// Trips API
export const tripsAPI = {
  planTrip: (data) => api.post('/trips/plan', data),
  saveTrip: (data) => api.post('/trips/save', data),
  getMyTrips: (params) => api.get('/trips/my', { params }),
  deleteTrip: (id) => api.delete(`/trips/${id}`),
}

// Categories API
export const categoriesAPI = {
  getCategories: () => api.get('/categories'),
}

// Price Updates API
export const priceUpdatesAPI = {
  submitPriceUpdate: (data) => api.post('/price-updates', data),
  getPendingUpdates: (params) => api.get('/price-updates/pending', { params }),
  approvePriceUpdate: (id, data) => api.put(`/price-updates/${id}/approve`, data),
  rejectPriceUpdate: (id, data) => api.put(`/price-updates/${id}/reject`, data),
}

// Notifications API
export const notificationsAPI = {
  getNotifications: (params) => api.get('/auth/notifications', { params }),
  markRead: (ids) => api.put('/auth/notifications/read', ids?.length ? { ids } : {}),
}

export default api
