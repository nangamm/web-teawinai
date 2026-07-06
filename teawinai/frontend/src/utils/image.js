export function buildImageUrl(path) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL
    || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/i, '') : 'http://localhost:5001')

  if (!path) return ''

  try {
    const isAbsolute = /^https?:\/\//i.test(path)
    if (isAbsolute) return path
    return new URL(path, API_BASE).toString()
  } catch (err) {
    if (path.startsWith('/')) return `${API_BASE}${path}`
    return `${API_BASE}/${path}`
  }
}
