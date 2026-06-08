import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Compass,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  Route,
  Star,
} from 'lucide-react'
import { authAPI } from '@/services/api'
import { saveToken } from '@/utils/auth'

export function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))

    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authAPI.login(formData)

      if (response.data.success) {
        saveToken(response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        navigate('/')
      } else {
        setError('Login failed. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <section className="login-shell" aria-labelledby="login-title">
        <div className="login-card">
          <div className="login-form-panel">
            <div className="login-topbar">
              <Link to="/" className="login-home-link">
                <ArrowLeft />
                Back home
              </Link>
            </div>

            <div className="login-form-wrap">
              <div className="login-heading">
                <h1 id="login-title">Welcome Back</h1>
                <p>Sign in to plan trips, save places, and manage your local recommendations.</p>
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                <div className="login-field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={error ? 'has-error' : ''}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="login-field">
                  <label htmlFor="password">Password</label>
                  <div className={`login-password-control${error ? ' has-error' : ''}`}>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="login-error" role="alert">
                    <AlertCircle />
                    <span>{error}</span>
                  </div>
                )}

                <div className="login-options">
                  <label className="login-remember">
                    <input id="remember-me" name="remember-me" type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <a href="#">Forgot your password?</a>
                </div>

                <button type="submit" className="login-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="login-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Log In'
                  )}
                </button>

                <div className="login-divider">
                  <span>Or login with</span>
                </div>

                <div className="login-social-grid" aria-label="Social login options">
                  <button type="button">
                    <span className="login-google-mark" aria-hidden="true">G</span>
                    Google
                  </button>
                  <button type="button">
                    <span aria-hidden="true">Apple</span>
                  </button>
                </div>
              </form>

              <p className="login-register">
                Do not have an account? <Link to="/register">Register now.</Link>
              </p>
            </div>

            <div className="login-footer-note">
              <span>Copyright (c) 2026 Teawinai</span>
              <Link to="/contact">Contact</Link>
            </div>
          </div>

          <aside className="login-art-panel" aria-label="Teawinai trip planning overview">
            <div className="login-art-pattern" aria-hidden="true" />
            <div className="login-art-copy">
              <h2>Plan local trips with trusted recommendations.</h2>
              <p>Access your saved places, trip ideas, and contributor tools in one calm workspace.</p>
            </div>

            <div className="login-preview">
              <div className="login-preview-card login-preview-summary">
                <div>
                  <span>Saved places</span>
                  <strong>24</strong>
                </div>
                <MapPin />
              </div>
              <div className="login-preview-card login-preview-route">
                <div>
                  <span>Next plan</span>
                  <strong>Ubon day route</strong>
                </div>
                <Route />
              </div>
              <div className="login-preview-card login-preview-rating">
                <div>
                  <span>Community rating</span>
                  <strong>4.8</strong>
                </div>
                <Star />
              </div>
              <div className="login-preview-table">
                <div className="login-preview-row head">
                  <span>Place</span>
                  <span>Budget</span>
                  <span>Status</span>
                </div>
                {[
                  ['Wat Phra That Nong Bua', 'Free', 'Saved'],
                  ['Huai Wang Nong', 'Low', 'Planned'],
                  ['Local cafe route', 'Medium', 'Draft'],
                ].map(([place, budget, status]) => (
                  <div className="login-preview-row" key={place}>
                    <span>{place}</span>
                    <span>{budget}</span>
                    <span>{status}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
