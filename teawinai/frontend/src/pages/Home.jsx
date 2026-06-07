import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Heart, Loader2, MapPin, Star, Tag } from 'lucide-react'
import { categoriesAPI, placesAPI, tripsAPI } from '@/services/api'
import { DEFAULT_PROVINCE, getDistrictsByProvince, getSubdistrictsByDistrict, provinces } from '@/data/ubonLocations'
import { isAuthenticated } from '@/utils/auth'
import toast from 'react-hot-toast'

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '')

const CAT_EMOJI = {
  'วัด': '⛩', 'Temples': '⛩',
  'ร้านอาหาร': '🍽', 'Restaurants': '🍽',
  'ธรรมชาติ': '🌿', 'Nature': '🌿',
  'คาเฟ่': '☕', 'Cafe': '☕',
  'ช็อปปิ้ง': '🛍', 'Shopping': '🛍',
  'พิพิธภัณฑ์': '🏛', 'Museum': '🏛',
  'ตลาด': '🏪', 'Market': '🏪',
}

const formatPrice = (place) => {
  if (place.is_free) return 'ฟรี'
  if (place.price_min && place.price_max && place.price_min !== place.price_max) {
    return `฿${place.price_min.toLocaleString()} - ฿${place.price_max.toLocaleString()}`
  }
  if (place.price_min) return `เริ่มต้น ฿${place.price_min.toLocaleString()}`
  if (place.price_max) return `ไม่เกิน ฿${place.price_max.toLocaleString()}`
  return 'ดูรายละเอียด'
}

const getPlaceImage = (place) => {
  const firstImage = place.images?.[0]
  if (!firstImage) return ''
  return firstImage.startsWith('http') ? firstImage : `${API_ORIGIN}${firstImage}`
}

const getDisplayName = (user, fallback = 'นักเดินทาง') => (
  user?.username || user?.name || fallback
)

const getAvatarSrc = (user, displayName) => {
  if (user?.avatar) {
    return user.avatar.startsWith('http') ? user.avatar : `${API_ORIGIN}${user.avatar}`
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=116045&color=fff&size=96`
}

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
  const [featuredPlaces, setFeaturedPlaces] = useState([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [featuredCategory, setFeaturedCategory] = useState('')
  const [homeReviews, setHomeReviews] = useState([])
  const [homeReviewsLoading, setHomeReviewsLoading] = useState(true)
  
  useEffect(() => {
    fetchCategories()
    fetchHomeReviews()
  }, [])

  useEffect(() => {
    fetchFeaturedPlaces(featuredCategory)
  }, [featuredCategory])

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

  const fetchFeaturedPlaces = async (categoryId = '') => {
    setFeaturedLoading(true)
    try {
      const params = { province: DEFAULT_PROVINCE, limit: 8 }
      if (categoryId) params.category = categoryId
      const response = await placesAPI.getPlaces(params)
      const places = response.data.data || response.data || []
      setFeaturedPlaces(Array.isArray(places) ? places.slice(0, 6) : [])
    } catch (error) {
      console.error('Unable to fetch featured places:', error)
      setFeaturedPlaces([])
    } finally {
      setFeaturedLoading(false)
    }
  }

  const fetchHomeReviews = async () => {
    setHomeReviewsLoading(true)
    try {
      const response = await placesAPI.getPlaces({ province: DEFAULT_PROVINCE, limit: 10 })
      const places = response.data.data || response.data || []
      const visiblePlaces = Array.isArray(places) ? places.slice(0, 10) : []
      const detailedPlaces = await Promise.all(
        visiblePlaces.map(place => placesAPI.getPlace(place._id).then(res => res.data.data || res.data).catch(() => null))
      )

      const reviews = detailedPlaces
        .filter(Boolean)
        .flatMap(place => {
          const placeReviews = Array.isArray(place.reviews) ? place.reviews : []
          return placeReviews.map(review => ({
            ...review,
            place: {
              _id: place._id,
              name: place.name,
              category: place.category?.name || place.category,
            }
          }))
        })
        .filter(review => review.comment || review.content)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 9)

      setHomeReviews(reviews)
    } catch (error) {
      console.error('Unable to fetch home reviews:', error)
      setHomeReviews([])
    } finally {
      setHomeReviewsLoading(false)
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
      const res = await tripsAPI.planTrip({
        budget: parseFloat(formData.budget),
        categories: formData.categories,
        maxPlaces: parseInt(formData.maxPlaces),
        location: {
          province: formData.province,
          district: formData.district,
          subdistrict: formData.subdistrict
        }
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
        <div className="hero-copy">
          <div className="eyebrow">Ubon Ratchathani Heritage</div>
          <h1 className="hero-title">
            The Emerald<br />of Isan.
          </h1>
          <p className="hero-helper">
            วางแผนเที่ยวอุบลจากงบ ความสนใจ และพื้นที่ที่คุณอยากไป
          </p>
        </div>

        {/* Planner Card */}
        <form onSubmit={handleSubmit} className="planner-form">
          <div className="booking-card">
            <div className="booking-card-header">
              <div className="booking-kicker">Your journey</div>
              <button type="button" className="reset-btn" onClick={resetPlanner}>
                ล้างค่า
              </button>
            </div>

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

      <section className="home-showcase" aria-labelledby="home-showcase-title">
        <div className="home-showcase-inner">
          <div className="home-showcase-header">
            <div>
              <h2 id="home-showcase-title">สถานที่น่าไปในอุบลราชธานี</h2>
            </div>
          </div>

          <div className="home-showcase-tabs" aria-label="เลือกหมวดหมู่สถานที่แนะนำ">
            <button
              type="button"
              className={`home-showcase-tab${featuredCategory === '' ? ' active' : ''}`}
              onClick={() => setFeaturedCategory('')}
            >
              ทั้งหมด
            </button>
            {categories.map(category => (
              <button
                type="button"
                key={category._id}
                className={`home-showcase-tab${featuredCategory === category._id ? ' active' : ''}`}
                onClick={() => setFeaturedCategory(category._id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {featuredLoading ? (
            <div className="home-destination-rail" aria-label="กำลังโหลดสถานที่แนะนำ">
              {[1, 2, 3, 4].map(item => (
                <div key={item} className="home-destination-card skeleton" />
              ))}
            </div>
          ) : featuredPlaces.length > 0 ? (
            <div className="home-destination-rail auto" aria-label="สถานที่แนะนำ">
              <div className="home-destination-track">
              {[...featuredPlaces, ...featuredPlaces].map((place, index) => {
                const catName = place.category?.name || place.category || 'สถานที่'
                const imageSrc = getPlaceImage(place)

                return (
                  <article
                    key={`${place._id}-${index}`}
                    className="home-destination-card"
                    onClick={() => navigate(`/places/${place._id}`)}
                    aria-hidden={index >= featuredPlaces.length}
                  >
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={place.name}
                        onError={event => {
                          event.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="home-destination-placeholder">
                        <MapPin />
                      </div>
                    )}
                    <button
                      type="button"
                      className="home-destination-heart"
                      aria-label={`บันทึก ${place.name}`}
                      onClick={event => event.stopPropagation()}
                    >
                      <Heart size={20} />
                    </button>
                    <div className="home-destination-content">
                      <div className="home-destination-category">{CAT_EMOJI[catName] || '📍'} {catName}</div>
                      <h3>{place.name}</h3>
                      <p>{place.address || 'อุบลราชธานี'}</p>
                      <div className="home-destination-meta">
                        <span><Tag size={15} />{formatPrice(place)}</span>
                        <span><Star size={15} />{place.rating || 'ใหม่'}</span>
                      </div>
                      <button
                        type="button"
                        className="home-destination-cta"
                        onClick={event => {
                          event.stopPropagation()
                          navigate(`/places/${place._id}`)
                        }}
                      >
                        ดูรายละเอียด
                      </button>
                    </div>
                  </article>
                )
              })}
              </div>
            </div>
          ) : (
            <div className="home-showcase-empty">
              ยังไม่มีสถานที่ให้แสดงในตอนนี้
            </div>
          )}
        </div>
      </section>

      <section className="home-reviews" aria-labelledby="home-reviews-title">
        <div className="home-reviews-inner">
          <div className="home-reviews-header">
            <h2 id="home-reviews-title">เสียงจากนักเดินทาง</h2>
            <p>รีวิวจริงจากผู้ใช้ที่เคยแบ่งปันประสบการณ์ในสถานที่ต่าง ๆ</p>
          </div>

          {homeReviewsLoading ? (
            <div className="home-reviews-grid" aria-label="กำลังโหลดรีวิว">
              {[1, 2, 3, 4, 5, 6].map(item => (
                <div key={item} className="home-review-card skeleton" />
              ))}
            </div>
          ) : homeReviews.length > 0 ? (
            <div className="home-reviews-grid">
              {homeReviews.map(review => {
                const displayName = getDisplayName(review.user, review.name || 'นักเดินทาง')
                const avatarSrc = getAvatarSrc(review.user, displayName)
                const placeName = review.place?.name || 'สถานที่ในอุบลราชธานี'
                const reviewDate = review.createdAt
                  ? new Date(review.createdAt).toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })
                  : 'ไม่นานมานี้'

                return (
                  <article
                    key={review._id || `${placeName}-${review.createdAt}`}
                    className="home-review-card"
                    onClick={() => review.place?._id && navigate(`/places/${review.place._id}`)}
                  >
                    <div className="home-review-top">
                      <img src={avatarSrc} alt={displayName} loading="lazy" />
                      <div>
                        <strong>{displayName}</strong>
                        <span>{placeName}</span>
                      </div>
                    </div>
                    <p>{review.comment || review.content}</p>
                    <div className="home-review-foot">
                      <span className="home-review-score">
                        <Star size={15} />
                        {Number(review.rating || 0).toFixed(1)}
                      </span>
                      <time dateTime={review.createdAt}>{reviewDate}</time>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="home-reviews-empty">
              ยังไม่มีรีวิวให้แสดงในตอนนี้
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
