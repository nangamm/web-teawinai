import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, ChevronDown, AlertCircle, Loader2 } from 'lucide-react'
import { categoriesAPI, tripsAPI } from '@/services/api'
import toast from 'react-hot-toast'

const CAT_EMOJI = {
  'วัด': '⛩', 'Temples': '⛩',
  'ร้านอาหาร': '🍽', 'Restaurants': '🍽',
  'ธรรมชาติ': '🌿', 'Nature': '🌿',
  'คาเฟ่': '☕', 'Cafe': '☕',
  'ช็อปปิ้ง': '🛍', 'Shopping': '🛍',
  'พิพิธภัณฑ์': '🏛', 'Museum': '🏛',
  'ตลาด': '🏪', 'Market': '🏪',
}

export function Home() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ budget: '', categories: [], maxPlaces: '5' })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    try {
      const res = await categoriesAPI.getCategories()
      setCategories(res.data.data || res.data || [])
    } catch {
      toast.error('ไม่สามารถดึงข้อมูลหมวดหมู่ได้')
    }
  }

  const toggleCategory = (name) => {
    setFormData(p => ({
      ...p,
      categories: p.categories.includes(name)
        ? p.categories.filter(c => c !== name)
        : [...p.categories, name]
    }))
    if (errors.categories) setErrors(p => ({ ...p, categories: '' }))
  }

  const validate = () => {
    const e = {}
    if (!formData.budget || formData.budget <= 0) e.budget = 'กรุณากรอกงบประมาณที่มากกว่า 0'
    if (!formData.categories.length) e.categories = 'กรุณาเลือกอย่างน้อย 1 หมวดหมู่'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await tripsAPI.planTrip({
        budget: parseFloat(formData.budget),
        categories: formData.categories,
        maxPlaces: parseInt(formData.maxPlaces)
      })
      navigate('/result', { state: { tripPlan: res.data.data || res.data } })
      toast.success('วางแผนทริปสำเร็จ!')
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'ไม่สามารถวางแผนทริปได้ กรุณาลองใหม่' })
      toast.error('ไม่สามารถวางแผนทริปได้')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      {/* Hero image — วางรูปจริงที่ public/images/hero-temple.jpg */}
      <img
        className="hero-img"
        src="/images/pexels-nsu-mon-1803488-3759941.jpg"
        alt="วัดในอีสาน"
        onError={e => { e.currentTarget.style.display = 'none' }}
      />
      <div className="hero-bg-overlay" />

      <div className="hero-content">
        {/* Eyebrow */}
        <div className="eyebrow">
          <span className="eyebrow-pill">Ubon Ratchathani</span>
        </div>

        {/* Headline */}
        <h1 className="hero-title">
          The Emerald<br />of Isan.
        </h1>

        {/* Booking Card */}
        <form onSubmit={handleSubmit}>
          <div className="booking-card">

            {/* Row: Date + Budget */}
            <div className="card-row">
              <div className="field-group">
                <div className="field-label">Your Journey</div>
                <div className="input-box">
                  <Calendar />
                  <input
                    className="bare-input"
                    type="text"
                    placeholder="Select Dates"
                    readOnly
                  />
                </div>
              </div>

              <div className="field-group">
                <div className="field-label">Budget Tier</div>
                <div className={`input-box${errors.budget ? ' has-error' : ''}`}>
                  <div className="b-icon">฿</div>
                  <input
                    className="bare-input"
                    type="number"
                    placeholder="งบประมาณ"
                    value={formData.budget}
                    min="1"
                    onChange={e => {
                      setFormData(p => ({ ...p, budget: e.target.value }))
                      if (errors.budget) setErrors(p => ({ ...p, budget: '' }))
                    }}
                  />
                </div>
                {errors.budget && (
                  <div className="field-error"><AlertCircle size={11} />{errors.budget}</div>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="chips-section">
              <div className="chips-label">หมวดหมู่</div>
              <div className="chips-row">
                {categories.map(cat => (
                  <button
                    type="button"
                    key={cat._id}
                    className={`chip${formData.categories.includes(cat.name) ? ' active' : ''}`}
                    onClick={() => toggleCategory(cat.name)}
                  >
                    {CAT_EMOJI[cat.name]
                      ? <span className="chip-emoji">{CAT_EMOJI[cat.name]}</span>
                      : null}
                    {cat.name}
                  </button>
                ))}
              </div>
              {errors.categories && (
                <div className="field-error" style={{ marginTop: 8 }}>
                  <AlertCircle size={11} />{errors.categories}
                </div>
              )}
            </div>

            <div className="card-divider" />

            {/* Number of places */}
            <div className="chips-section" style={{ marginBottom: 14 }}>
              <div className="chips-label">จำนวนสถานที่</div>
              <div className="chips-row">
                {['3', '5', '7'].map(n => (
                  <button
                    type="button"
                    key={n}
                    className={`chip${formData.maxPlaces === n ? ' active' : ''}`}
                    onClick={() => setFormData(p => ({ ...p, maxPlaces: n }))}
                  >
                    {n} สถานที่
                  </button>
                ))}
              </div>
            </div>

            {/* Submit error */}
            {errors.submit && (
              <div className="submit-error">
                <AlertCircle size={13} />{errors.submit}
              </div>
            )}

            {/* CTA */}
            <button type="submit" className="cta-btn" disabled={loading}>
              {loading
                ? <><Loader2 size={16} className="spin" /> กำลังวางแผน...</>
                : 'Plan My Heritage Trip'}
            </button>

          </div>
        </form>
      </div>
    </div>
  )
}