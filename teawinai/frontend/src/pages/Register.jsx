import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { authAPI } from '@/services/api'

export function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name] || success) {
      setErrors(prev => ({ ...prev, [name]: '' }))
      setSuccess('')
    }
  }

  const validateForm = () => {
    const nextErrors = {}
    if (!formData.name.trim()) nextErrors.name = 'กรุณากรอกชื่อ'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = 'กรุณากรอกอีเมลให้ถูกต้อง'
    if (formData.password.length < 6) nextErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
    if (formData.password !== formData.confirmPassword) nextErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    try {
      const response = await authAPI.register({ name: formData.name, email: formData.email, password: formData.password })
      if (response.data.success) {
        setSuccess('สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ')
        setTimeout(() => navigate('/login', { state: { message: 'สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ' } }), 2000)
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
    <div className="login-page">
      <section className="login-shell" aria-labelledby="register-title">
        <div className="login-card">
          <aside className="login-art-panel" aria-label="การท่องเที่ยวท้องถิ่น Teawinai">
            <div className="login-art-top">
              <Link to="/" className="login-brand">
                <span className="login-brand-mark" aria-hidden="true"><ArrowLeft /></span>
                <span>กลับหน้าหลัก</span>
              </Link>
            </div>
            <div className="login-art-copy">
              <h2>เริ่มต้นทริปท้องถิ่นของคุณ</h2>
              <p>สมัครบัญชีเพื่อบันทึกสถานที่ วางแผนเส้นทาง และเก็บไอเดียทริปไว้ในที่เดียว</p>
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
                <h1 id="register-title">สมัครบัญชี Teawinai</h1>
                <p>เริ่มวางแผนทริปจากคำแนะนำของคนท้องถิ่น</p>
              </div>
              <form className="login-form" onSubmit={handleSubmit}>
                <div className="login-field">
                  <label htmlFor="name">ชื่อของคุณ</label>
                  <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className={errors.name ? 'has-error' : ''} placeholder="กรอกชื่อของคุณ" />
                  {errors.name && <p className="register-field-error">{errors.name}</p>}
                </div>
                <div className="login-field">
                  <label htmlFor="email">อีเมลของคุณ</label>
                  <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className={errors.email ? 'has-error' : ''} placeholder="name@example.com" />
                  {errors.email && <p className="register-field-error">{errors.email}</p>}
                </div>
                <div className="login-field">
                  <label htmlFor="password">รหัสผ่าน</label>
                  <div className={`login-password-control${errors.password ? ' has-error' : ''}`}>
                    <input id="password" name="password" type={showPassword ? 'text' : 'password'} required minLength="6" value={formData.password} onChange={handleChange} placeholder="กรอกรหัสผ่าน" />
                    <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}>{showPassword ? <EyeOff /> : <Eye />}</button>
                  </div>
                  {errors.password && <p className="register-field-error">{errors.password}</p>}
                </div>
                <div className="login-field">
                  <label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</label>
                  <div className={`login-password-control${errors.confirmPassword ? ' has-error' : ''}`}>
                    <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required minLength="6" value={formData.confirmPassword} onChange={handleChange} placeholder="ยืนยันรหัสผ่าน" />
                    <button type="button" onClick={() => setShowConfirmPassword(value => !value)} aria-label={showConfirmPassword ? 'ซ่อนรหัสผ่านยืนยัน' : 'แสดงรหัสผ่านยืนยัน'}>{showConfirmPassword ? <EyeOff /> : <Eye />}</button>
                  </div>
                  {errors.confirmPassword && <p className="register-field-error">{errors.confirmPassword}</p>}
                </div>
                {success && <div className="register-success" role="status"><CheckCircle2 />{success}</div>}
                {errors.submit && <div className="login-error" role="alert"><AlertCircle />{errors.submit}</div>}
                <label className="register-terms"><input type="checkbox" required /><span>ฉันยอมรับ <a href="#">ข้อกำหนดการใช้บริการ</a> และ <a href="#">นโยบายความเป็นส่วนตัว</a></span></label>
                <button type="submit" disabled={loading} className="login-submit">{loading ? <><Loader2 className="login-spin" />กำลังสร้างบัญชี...</> : 'สมัครสมาชิก'}</button>
                <p className="register-login">มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบ</Link></p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
