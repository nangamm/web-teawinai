import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
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
        setError('เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <section className="login-shell" aria-labelledby="login-title">
        <div className="login-card">
          <aside className="login-art-panel" aria-label="การท่องเที่ยวท้องถิ่น Teawinai">
            <div className="login-art-top">
              <Link to="/" className="login-brand">
                <span className="login-brand-mark" aria-hidden="true">
                  <ArrowLeft />
                </span>
                <span>กลับหน้าหลัก</span>
              </Link>
            </div>

            <div className="login-art-copy">
              <h2>ค้นหาที่เที่ยวที่ใช่</h2>
              <p>บันทึกสถานที่น่าไป วางแผนเส้นทาง และจัดทริปท้องถิ่นได้ในไม่กี่คลิก</p>
              <div className="login-art-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>
          </aside>

          <div className="login-form-panel">
            <div className="login-form-wrap">
              <div className="login-heading">
                <h1 id="login-title">ยินดีต้อนรับกลับสู่ Teawinai!</h1>
                <p>เข้าสู่ระบบบัญชีของคุณ</p>
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                <div className="login-field">
                  <label htmlFor="email">อีเมลของคุณ</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={error ? 'has-error' : ''}
                    placeholder="name@example.com"
                  />
                </div>

                <div className="login-field">
                  <label htmlFor="password">รหัสผ่าน</label>
                  <div className={`login-password-control${error ? ' has-error' : ''}`}>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="กรอกรหัสผ่าน"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
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
                    <span>จดจำฉันไว้</span>
                  </label>
                  <a href="#">ลืมรหัสผ่าน?</a>
                </div>

                <button type="submit" className="login-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="login-spin" />
                      กำลังเข้าสู่ระบบ...
                    </>
                  ) : (
                    'เข้าสู่ระบบ'
                  )}
                </button>

              </form>

              <p className="login-register">
                ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link>
              </p>

            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
