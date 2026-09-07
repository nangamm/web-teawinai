import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, MapPin } from 'lucide-react'
import { categoriesAPI, tripsAPI } from '@/services/api'
import { DEFAULT_PROVINCE, getDistrictsByProvince, getSubdistrictsByDistrict, provinces } from '@/data/ubonLocations'
import { isAuthenticated } from '@/utils/auth'
import toast from 'react-hot-toast'

const SEARCH_HISTORY_KEY = 'teawinai-trip-search-history'

const buildSearchKey = ({ budget, categories, maxPlaces, location }) => JSON.stringify({
  budget,
  categories: [...categories].sort(),
  maxPlaces,
  location
})

const readSearchHistory = (searchKey) => {
  try {
    const history = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '{}')
    return Array.isArray(history[searchKey]) ? history[searchKey] : []
  } catch {
    return []
  }
}

const rememberSelectedPlaces = (searchKey, selectedPlaces) => {
  try {
    const history = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '{}')
    const selectedIds = selectedPlaces
      .map(place => place?._id || place?.id)
      .filter(Boolean)
      .map(String)
    history[searchKey] = [...new Set([...(history[searchKey] || []), ...selectedIds])].slice(-200)
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history))
  } catch {
    // Ignore storage failures; the backend still returns a valid random result.
  }
}

// const CAT_EMOJI = {
//   'วัด': '⛩', 'Temples': '⛩',
//   'ร้านอาหาร': '🍽', 'Restaurants': '🍽',
//   'ธรรมชาติ': '🌿', 'Nature': '🌿',
//   'คาเฟ่': '☕', 'Cafe': '☕',
//   'ช็อปปิ้ง': '🛍', 'Shopping': '🛍',
//   'พิพิธภัณฑ์': '🏛', 'Museum': '🏛',
//   'ตลาด': '🏪', 'Market': '🏪',
// }

export function Home() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    budget: '',
    categories: [],
    maxPlaces: '5',
    province: DEFAULT_PROVINCE,
    district: '',
    subdistrict: ''
  })
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setCategoriesLoading(true)
    try {
      const res = await categoriesAPI.getCategories()
      setCategories(res.data.data || res.data || [])
    } catch {
      toast.error('ไม่สามารถดึงข้อมูลหมวดหมู่ได้')
    } finally {
      setCategoriesLoading(false)
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
    if (!formData.maxPlaces || formData.maxPlaces < 1 || formData.maxPlaces > 20) e.maxPlaces = 'กรุณาระบุจำนวนสถานที่ 1-20 แห่ง'
    if (!formData.categories.length) e.categories = 'กรุณาเลือกอย่างน้อย 1 หมวดหมู่'
    if (!formData.province) e.province = 'กรุณาเลือกจังหวัด'
    setErrors(e)
    return !Object.keys(e).length
  }

  const resetPlanner = () => {
    setFormData({
      budget: '',
      categories: [],
      maxPlaces: '5',
      province: DEFAULT_PROVINCE,
      district: '',
      subdistrict: ''
    })
    setErrors({})
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!isAuthenticated()) {
      toast.error('กรุณาเข้าสู่ระบบก่อนวางแผนเที่ยว')
      navigate('/login', { state: { from: '/' } })
      return
    }
    if (!validate()) return
    setLoading(true)
    try {
      const request = {
        budget: parseFloat(formData.budget),
        categories: formData.categories,
        maxPlaces: parseInt(formData.maxPlaces),
        location: {
          province: formData.province,
          district: formData.district,
          subdistrict: formData.subdistrict
        }
      }
      const searchKey = buildSearchKey(request)
      const res = await tripsAPI.planTrip({ ...request, excludePlaceIds: readSearchHistory(searchKey) })
      const tripPlan = res.data.data || res.data
      rememberSelectedPlaces(searchKey, tripPlan.selectedPlaces || [])
      navigate('/result', { state: { tripPlan } })
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
        src="/images/ubon-hero-4k.png"
        alt="วัดในอีสาน"
        onError={e => { e.currentTarget.style.display = 'none' }}
      />
      <div className="hero-bg-overlay" aria-hidden="true" />

      <div className="hero-content">

        {/* Planner Card */}
        <form onSubmit={handleSubmit} className="planner-form">
          <div className="planner-hook">
            <h1>วางแผนทริปในฝันของคุณ</h1>
            <p>สัมผัสหัวใจแห่งอีสานได้ในไม่กี่คลิก</p>
          </div>
          <div className="booking-card">

            {/* Location details */}
            <div className="location-details" id="location-details">
              <div className="card-row-3">
                <div className="field-group">
                  <label className="field-label" htmlFor="province">จังหวัด</label>
                  <div className={`input-box${errors.province ? ' has-error' : ''}`}>
                    <select
                      id="province"
                      className="bare-input"
                      value={formData.province}
                      onChange={e => {
                        setFormData(p => ({ ...p, province: e.target.value, district: '', subdistrict: '' }))
                        if (errors.province) setErrors(p => ({ ...p, province: '' }))
                      }}
                    >
                      <option value="">เลือกจังหวัด</option>
                      {provinces.map(prov => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>
                  {errors.province && (
                    <div className="field-error"><AlertCircle size={11} />{errors.province}</div>
                  )}
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="district">อำเภอ</label>
                  <div className="input-box">
                    <select
                      id="district"
                      className="bare-input"
                      value={formData.district}
                      onChange={e => {
                        setFormData(p => ({ ...p, district: e.target.value, subdistrict: '' }))
                      }}
                      disabled={!formData.province}
                    >
                      <option value="">เลือกอำเภอ</option>
                      {getDistrictsByProvince(formData.province).map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="subdistrict">ตำบล</label>
                  <div className="input-box">
                    <select
                      id="subdistrict"
                      className="bare-input"
                      value={formData.subdistrict}
                      onChange={e => {
                        setFormData(p => ({ ...p, subdistrict: e.target.value }))
                      }}
                      disabled={!formData.district}
                    >
                      <option value="">เลือกตำบล</option>
                      {getSubdistrictsByDistrict(formData.province, formData.district).map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="card-row">
              <div className="field-group">
                <label className="field-label" htmlFor="budget">งบประมาณ</label>
                <div className={`input-box${errors.budget ? ' has-error' : ''}`}>
                  <div className="b-icon">฿</div>
                  <input
                    id="budget"
                    className="bare-input"
                    type="number"
                    placeholder="เช่น 1500"
                    value={formData.budget}
                    min="1"
                    inputMode="numeric"
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

              <div className="field-group">
                <label className="field-label" htmlFor="maxPlaces">จำนวนสถานที่ที่จะไป</label>
                <div className={`input-box${errors.maxPlaces ? ' has-error' : ''}`}>
                  <MapPin />
                  <input
                    id="maxPlaces"
                    className="bare-input"
                    type="number"
                    placeholder="เช่น 5"
                    value={formData.maxPlaces}
                    min="1"
                    max="20"
                    inputMode="numeric"
                    onChange={e => {
                      setFormData(p => ({ ...p, maxPlaces: e.target.value }))
                      if (errors.maxPlaces) setErrors(p => ({ ...p, maxPlaces: '' }))
                    }}
                  />
                </div>
                {errors.maxPlaces && (
                  <div className="field-error"><AlertCircle size={11} />{errors.maxPlaces}</div>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="chips-section">
              <div className="field-group">
                <label className="field-label" htmlFor="categories">หมวดหมู่</label>
                <div className="chips-row">
                  {categoriesLoading && (
                    <div className="chips-empty" role="status" aria-live="polite">กำลังโหลดหมวดหมู่...</div>
                  )}
                  {!categoriesLoading && categories.length === 0 && (
                    <div className="chips-empty" role="status">ยังไม่มีหมวดหมู่ให้เลือก ลองใหม่อีกครั้งภายหลัง</div>
                  )}
                  {!categoriesLoading && categories.map(cat => (
                    <button
                      type="button"
                      key={cat._id}
                      className={`chip${formData.categories.includes(cat.name) ? ' active' : ''}`}
                      onClick={() => toggleCategory(cat.name)}
                    >
                      {cat.name}
                    </button>
                  ))}
                  <button type="button" className="reset-btn" onClick={resetPlanner}>
                    ล้างค่า
                  </button>
                </div>
                {errors.categories && (
                  <div className="field-error" style={{ marginTop: 8 }}>
                    <AlertCircle size={11} />{errors.categories}
                  </div>
                )}
              </div>
            </div>

            <div className="card-divider" />

            {/* Submit error */}
            {errors.submit && (
              <div className="submit-error">
                <AlertCircle size={13} />{errors.submit}
              </div>
            )}

            {/* CTA */}
            <button type="submit" className="cta-btn" disabled={loading}>
              {loading
                ? <><Loader2 size={16} className="spin" /> กำลังหาเส้นทางที่เหมาะ...</>
                : 'Plan My Heritage Trip'}
            </button>



          </div>
        </form>
      </div>

    </div>
  )
}
