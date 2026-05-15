import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility function for combining class names
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Format date to Thai locale
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }
  
  return new Date(date).toLocaleDateString('th-TH', defaultOptions)
}

// Format price range
export function formatPriceRange(range) {
  const ranges = {
    free: 'ฟรี',
    low: 'ราคาถูก',
    medium: 'ราคาปานกลาง',
    high: 'ราคาสูง'
  }
  return ranges[range] || '-'
}

// Get category icon
export function getCategoryIcon(category) {
  const icons = {
    temple: '🏛️',
    beach: '🏖️',
    mountain: '⛰️',
    city: '🏙️',
    museum: '🏛️',
    park: '🌳',
    market: '🛍️',
    restaurant: '🍜',
    other: '📍'
  }
  return icons[category] || '📍'
}

// Get category name in Thai
export function getCategoryName(category) {
  const names = {
    temple: 'วัดวาอาราม',
    beach: 'ชายหาด',
    mountain: 'ภูเขา',
    city: 'เมือง',
    museum: 'พิพิธภัณฑ์',
    park: 'สวนสาธารณะ',
    market: 'ตลาด',
    restaurant: 'ร้านอาหาร',
    other: 'อื่นๆ'
  }
  return names[category] || 'อื่นๆ'
}

// Truncate text
export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Generate star rating display
export function generateStarRating(rating, maxRating = 5) {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0)

  for (let i = 0; i < fullStars; i++) {
    stars.push('full')
  }

  if (hasHalfStar) {
    stars.push('half')
  }

  for (let i = 0; i < emptyStars; i++) {
    stars.push('empty')
  }

  return stars
}

// Validate email format
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
export function validatePassword(password) {
  const minLength = 6
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  return {
    isValid: password.length >= minLength,
    hasMinLength: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar
  }
}

// Format file size
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Debounce function
export function debounce(func, delay) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

// Get day name in Thai
export function getDayName(day) {
  const days = {
    monday: 'จันทร์',
    tuesday: 'อังคาร',
    wednesday: 'พุธ',
    thursday: 'พฤหัสบดี',
    friday: 'ศุกร์',
    saturday: 'เสาร์',
    sunday: 'อาทิตย์'
  }
  return days[day] || day
}

// Convert coordinates to display format
export function formatCoordinates(coordinates) {
  if (!coordinates || coordinates.length !== 2) return '-'
  const [lng, lat] = coordinates
  return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`
}
