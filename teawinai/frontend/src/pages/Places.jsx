import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MapPin, Star, Search, Filter } from 'lucide-react'
import { placesAPI, categoriesAPI } from '@/services/api'
import toast from 'react-hot-toast'

const CAT_EMOJI = {
  'คาเฟ่': '☕', 'Cafe': '☕',
  'วัด': '⛩', 'Temples': '⛩',
  'ร้านอาหาร': '🍽', 'Restaurants': '🍽',
  'สวนสาธารณะ': '🌳', 'Park': '🌳',
  'พิพิธภัณฑ์': '🏛', 'Museum': '🏛',
  'ตลาด': '🏪', 'Market': '🏪',
}

const formatPrice = (place) => {
  if (place.is_free) return 'ฟรี'
  if (place.price_min && place.price_max && place.price_min !== place.price_max) {
    return `฿${place.price_min.toLocaleString()} - ฿${place.price_max.toLocaleString()}`
  }
  if (place.price_min) return `฿${place.price_min.toLocaleString()}`
  if (place.price_max) return `฿${place.price_max.toLocaleString()}`
  return 'N/A'
}

export function Places() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [places, setPlaces] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    province: searchParams.get('province') || '',
    search: searchParams.get('search') || ''
  })

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories()
      setCategories(response.data.data || [])
    } catch {
      setCategories([])
    }
  }

  const fetchPlaces = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.category) params.category = filters.category
      if (filters.search) params.search = filters.search
      if (filters.province) params.province = filters.province
      const response = await placesAPI.getPlaces(params)
      setPlaces(response.data.data || [])
    } catch {
      toast.error('ไม่สามารถดึงข้อมูลสถานที่ได้')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchPlaces() }, [fetchPlaces])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => { if (v) params.set(k, v) })
    setSearchParams(params)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const value = e.target.searchQuery.value.trim()
    handleFilterChange('search', value)
  }

  const handlePlaceDetail = (id) => navigate(`/places/${id}`)

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="places-page">
        <div className="places-inner">
          <div className="places-header">
            <div className="places-eyebrow">Explore</div>
            <div className="places-title">สถานที่ท่องเที่ยว</div>
          </div>
          <div className="places-skeleton-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-img" />
                <div className="skeleton-body">
                  <div className="skeleton-line" style={{ width: '70%' }} />
                  <div className="skeleton-line" style={{ width: '45%' }} />
                  <div className="skeleton-line" style={{ width: '85%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="places-page">
      <div className="places-inner">

        {/* ── Header ── */}
        <div className="places-header">
          <div className="places-eyebrow">Explore</div>
          <h1 className="places-title">สถานที่ท่องเที่ยว</h1>
          <p className="places-subtitle">ค้นหาสถานที่ท่องเที่ยวที่น่าสนใจทั่วประเทศไทย</p>
        </div>

        {/* ── Filter Card ── */}
        <form onSubmit={handleSearch} className="places-filter-card">
          <div className="places-filter-header">
            <Filter />
            <span className="places-filter-label">ตัวกรอง</span>
          </div>

          <div className="places-filter-grid">
            {/* Search */}
            <div>
              <div className="places-field-label">ค้นหา</div>
              <div className="places-input-wrap">
                <Search />
                <input
                  type="text"
                  name="searchQuery"
                  defaultValue={filters.search}
                  placeholder="ค้นหาสถานที่..."
                  className="places-bare-input"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <div className="places-field-label">หมวดหมู่</div>
              <select
                value={filters.category}
                onChange={e => handleFilterChange('category', e.target.value)}
                className="places-select"
              >
                <option value="">ทั้งหมด</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Province */}
            <div>
              <div className="places-field-label">จังหวัด</div>
              <select
                value={filters.province}
                onChange={e => handleFilterChange('province', e.target.value)}
                className="places-select"
              >
                <option value="">ทั้งหมด</option>
                <option value="อุบลราชธานี">อุบลราชธานี</option>
              </select>
            </div>

            {/* Submit */}
            <div>
              <button type="submit" className="places-search-btn">
                ค้นหา
              </button>
            </div>
          </div>
        </form>

        {/* ── Result count ── */}
        <div className="places-result-count">
          พบ <strong>{places.length}</strong> สถานที่
        </div>

        {/* ── Places Grid ── */}
        {places.length > 0 ? (
          <div className="places-grid">
            {places.map(place => {
              const catName = place.category?.name || place.category
              const priceLabel = formatPrice(place)

              return (
                <div
                  key={place._id}
                  className="place-card"
                  onClick={() => handlePlaceDetail(place._id)}
                >
                  {/* Image */}
                  <div className="place-card-img-wrap">
                    {place.images && place.images.length > 0 ? (
                      <img
                        src={place.images[0].startsWith('http') 
                          ? place.images[0] 
                          : `http://localhost:5001${place.images[0]}`}
                        alt={place.name}
                        className="place-card-img"
                        onError={e => { 
                          const svg = '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#e2e8f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="20" fill="#64748b">No Image</text></svg>';
                          e.target.src = `data:image/svg+xml;base64,${btoa(svg)}`;
                        }}
                      />
                    ) : (
                      <div className="place-card-img-placeholder">
                        <MapPin />
                      </div>
                    )}

                    {/* Category emoji badge */}
                    <div className="place-card-cat-badge">
                      {CAT_EMOJI[catName] || '📍'}
                    </div>

                    {/* Extra image count */}
                    {place.images && place.images.length > 1 && (
                      <div className="place-card-img-count">
                        +{place.images.length - 1}
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="place-card-body">
                    <div className="place-card-top">
                      <div className="place-card-name">{place.name}</div>
                      <div className={`place-card-price ${place.is_free ? 'free' : ''}`}>
                        {priceLabel}
                      </div>
                    </div>

                    <div className="place-card-cat-tag">{catName}</div>

                    <div className="place-card-address">{place.address}</div>

                    <div className="place-card-location">
                      <MapPin />
                      {place.address?.split('จังหวัด')[1]?.trim() || 'ไม่ระบุ'}
                    </div>

                    <div className="place-card-footer">
                      <div className="place-card-rating">
                        <Star />
                        <span className="place-card-rating-num">{place.rating}</span>
                        <span style={{ color: '#bbb' }}>(0 รีวิว)</span>
                      </div>
                      <button
                        className="place-card-detail-btn"
                        onClick={e => { e.stopPropagation(); handlePlaceDetail(place._id) }}
                      >
                        ดูรายละเอียด →
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* ── Empty state ── */
          <div className="places-empty">
            <MapPin />
            <div className="places-empty-title">ไม่พบสถานที่ท่องเที่ยว</div>
            <div className="places-empty-sub">ลองปรับเปลี่ยนตัวกรองหรือคำค้นหา</div>
          </div>
        )}

      </div>
    </div>
  )
}
