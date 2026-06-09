import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Facebook, Loader2 } from 'lucide-react'
import { authAPI } from '@/services/api'

export function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (success) {
      setSuccess('')
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อ'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'กรุณากรอกอีเมลให้ถูกต้อง'
    }

    if (formData.password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      })

      if (response.data.success) {
        setSuccess('สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ')
        setTimeout(() => {
          navigate('/login', { state: { message: 'สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ' } })
        }, 2000)
      } else {
        setErrors({ submit: 'สมัครสมาชิกไม่สำเร็จ กรุณาลองอีกครั้ง' })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ submit: 'สมัครสมาชิกไม่สำเร็จ กรุณาลองอีกครั้ง' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <section className="register-shell" aria-labelledby="register-title">
        <div className="register-card">
          <aside className="register-art-panel" aria-label="การท่องเที่ยวท้องถิ่น Teawinai">
            <div className="register-art-top">
              <Link to="/" className="register-brand">
                <span className="register-brand-mark" aria-hidden="true">
                  <ArrowLeft />
                </span>
                <span>กลับหน้าหลัก</span>
              </Link>
            </div>

            <div className="register-art-copy">
              <h2>เริ่มต้นทริปท้องถิ่นของคุณ</h2>
              <p>สมัครบัญชีเพื่อบันทึกสถานที่ วางแผนเส้นทาง และเก็บไอเดียทริปไว้ในที่เดียว</p>
              <div className="register-art-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>
          </aside>

          <div className="register-form-panel">
            <div className="register-form-wrap">
              <div className="register-heading">
                <h1 id="register-title">สมัครบัญชี Teawinai</h1>
                <p>เริ่มวางแผนทริปจากคำแนะนำของคนท้องถิ่น</p>
              </div>

              <form className="register-form" onSubmit={handleSubmit}>
                <div className="register-field">
                  <label htmlFor="name">ชื่อของคุณ</label>
                  <div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                        className={errors.name ? 'has-error' : ''}
                        placeholder="กรอกชื่อของคุณ"
                />
                {errors.name && (
                      <p className="register-field-error">{errors.name}</p>
                )}
              </div>
            </div>

                <div className="register-field">
                  <label htmlFor="email">อีเมลของคุณ</label>
                  <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                        className={errors.email ? 'has-error' : ''}
                        placeholder="name@example.com"
                />
                {errors.email && (
                      <p className="register-field-error">{errors.email}</p>
                )}
              </div>
            </div>

                <div className="register-field">
                  <label htmlFor="password">รหัสผ่าน</label>
                  <div className={`register-password-control${errors.password ? ' has-error' : ''}`}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="กรอกรหัสผ่าน"
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                        {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && (
                    <p className="register-field-error">{errors.password}</p>
              )}
            </div>

                <div className="register-field">
                  <label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</label>
                  <div className={`register-password-control${errors.confirmPassword ? ' has-error' : ''}`}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="ยืนยันรหัสผ่าน"
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'ซ่อนรหัสผ่านยืนยัน' : 'แสดงรหัสผ่านยืนยัน'}
                >
                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.confirmPassword && (
                    <p className="register-field-error">{errors.confirmPassword}</p>
              )}
            </div>

          {success && (
                  <div className="register-success" role="status">
                    <CheckCircle2 />
                {success}
            </div>
          )}

          {errors.submit && (
                  <div className="register-error" role="alert">
                    <AlertCircle />
                {errors.submit}
            </div>
          )}

                <label className="register-terms">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              required
            />
                  <span>
                    ฉันยอมรับ <a href="#">ข้อกำหนดการใช้บริการ</a> และ <a href="#">นโยบายความเป็นส่วนตัว</a>
                  </span>
            </label>

            <button
              type="submit"
              disabled={loading}
                  className="register-submit"
            >
                  {loading ? (
                    <>
                      <Loader2 className="register-spin" />
                      กำลังสร้างบัญชี...
                    </>
                  ) : (
                    'สมัครสมาชิก'
                  )}
            </button>

                <div className="register-divider">
                  <span>สมัครอย่างรวดเร็ว</span>
              </div>

                <div className="register-social-grid" aria-label="ตัวเลือกสมัครด้วยโซเชียล">
                  <button type="button">
                    <span className="register-google-mark" aria-hidden="true">G</span>
                    สมัครด้วย Google
                  </button>
                  <button type="button">
                    <Facebook aria-hidden="true" />
                    สมัครด้วย Facebook
                  </button>
              </div>

                <p className="register-login">
                  มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
