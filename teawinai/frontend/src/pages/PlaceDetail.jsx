import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  MapPin,
  Star,
  Clock,
  DollarSign,
  Calendar,
  Share2,
  Heart,
  Camera,
  Navigation,
} from 'lucide-react'
import { placesAPI } from '@/services/api'
import toast from 'react-hot-toast'

export function PlaceDetail() {
  const { id } = useParams()
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchPlace = useCallback(async () => {
    setLoading(true)
    try {
      const response = await placesAPI.getPlace(id)
      console.log('Place detail received:', response.data)
      setPlace(response.data.data || response.data)
    } catch (error) {
      console.error('Error fetching place detail:', error)
      toast.error('ไม่สามารถดึงข้อมูลสถานที่ได้')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchPlace() }, [fetchPlace])

  const handleNavigate = () => {
    if (place.map_link) {
      window.open(place.map_link, '_blank')
    } else {
      toast.error('ไม่มีข้อมูลแผนที่')
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('คัดลอกลิงก์สถานที่เรียบร้อยแล้ว')
    } catch {
      toast.error('ไม่สามารถคัดลอกลิงก์ได้')
    }
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="detail-skeleton">
        <div className="detail-skeleton-img" />
        <div className="detail-skeleton-line" style={{ width: '40%' }} />
        <div className="detail-skeleton-line" style={{ width: '70%' }} />
        <div className="detail-skeleton-line" style={{ width: '55%' }} />
      </div>
    )
  }

  // ── Not found ──
  if (!place) {
    return (
      <div className="detail-not-found">
        <MapPin size={40} style={{ color: '#ccc' }} />
        <h2>ไม่พบสถานที่ท่องเที่ยว</h2>
        <Link to="/places" className="detail-btn-primary" style={{ width: 'auto', padding: '12px 28px', textDecoration: 'none' }}>
          กลับไปหน้าสถานที่ท่องเที่ยว
        </Link>
      </div>
    )
  }

  const getCategoryIcon = (category) => {
    if (category && typeof category === 'object') return category.icon || '📍'
    const icons = { temple: '🏛️', beach: '🏖️', mountain: '⛰️', city: '🏙️', museum: '🏛️', park: '🌳', market: '🛍️', restaurant: '🍜', other: '📍' }
    return icons[category] || '📍'
  }

  const getCategoryName = (category) => {
    if (category && typeof category === 'object') return category.name || 'อื่นๆ'
    const names = { temple: 'วัดวาอาราม', beach: 'ชายหาด', mountain: 'ภูเขา', city: 'เมือง', museum: 'พิพิธภัณฑ์', park: 'สวนสาธารณะ', market: 'ตลาด', restaurant: 'ร้านอาหาร', other: 'อื่นๆ' }
    return names[category] || category || 'อื่นๆ'
  }

  const getPriceRangeText = (price_min, is_free) => {
    if (is_free || price_min === 0) return 'ฟรี'
    if (price_min <= 100) return 'ราคาถูก'
    if (price_min <= 300) return 'ราคาปานกลาง'
    return 'ราคาสูง'
  }

  return (
    <div className="detail-page">
      <div className="detail-inner">

        {/* ── Breadcrumb ── */}
        <nav className="detail-breadcrumb">
          <Link to="/">หน้าแรก</Link>
          <span className="detail-breadcrumb-sep">/</span>
          <Link to="/places">สถานที่ท่องเที่ยว</Link>
          <span className="detail-breadcrumb-sep">/</span>
          <span className="detail-breadcrumb-current">{place.name}</span>
        </nav>

        {/* ── Header ── */}
        <div className="detail-header">
          <div className="detail-header-left">
            <div className="detail-title-row">
              <span className="detail-cat-emoji">{getCategoryIcon(place.category)}</span>
              <h1 className="detail-title">{place.name}</h1>
            </div>
            <div className="detail-meta">
              <span className="detail-cat-tag">{getCategoryName(place.category)}</span>
              <span className="detail-meta-divider" />
              <div className="detail-meta-item">
                <MapPin />
                {place.address?.split('จังหวัด')[1]?.trim() || 'ไม่ระบุ'}
              </div>
              <span className="detail-meta-divider" />
              <div className="detail-meta-item">
                <Star className="star-icon" />
                <strong>{place.rating}</strong>&nbsp;(0 รีวิว)
              </div>
            </div>
          </div>

          <div className="detail-actions">
            <button className="detail-action-btn" title="บันทึก">
              <Heart />
            </button>
            <button className="detail-action-btn" onClick={handleShare} title="แชร์">
              <Share2 />
            </button>
          </div>
        </div>

        {/* ── Main layout ── */}
        <div className="detail-layout">

          {/* Left: Gallery + Details */}
          <div>
            {/* Gallery */}
            <div className="detail-gallery">
              {place.images?.length > 0 ? (
                <>
                  <img
                    src={`http://localhost:5001${place.images[0]}`}
                    alt={place.name}
                    className="detail-gallery-main"
                    onError={e => { e.target.src = '/api/placeholder/800/600' }}
                  />
                  {place.images.length > 1 && (
                    <div className="detail-gallery-grid">
                      {place.images.slice(1, 5).map((img, idx) => (
                        <div
                          key={idx}
                          className="detail-gallery-thumb"
                          onClick={() => window.open(`http://localhost:5001${img}`, '_blank')}
                        >
                          <img
                            src={`http://localhost:5001${img}`}
                            alt={`${place.name} - รูปที่ ${idx + 2}`}
                            onError={e => { e.target.src = '/api/placeholder/400/300' }}
                          />
                          {idx === 3 && place.images.length > 5 && (
                            <div className="detail-gallery-more">+{place.images.length - 5}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="detail-gallery-placeholder">
                  <Camera />
                  <span>ยังไม่มีรูปภาพ</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="detail-section-title">รายละเอียด</div>
            <div className="detail-description">{place.address}</div>

            {/* Opening Hours */}
            <div className="detail-hours-card">
              <div className="detail-section-title">เวลาเปิด-ปิด</div>
              {place.opening_hours && Object.keys(place.opening_hours).length > 0 ? (
                ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'].map(day => {
                  const h = place.opening_hours[day]
                  return (
                    <div key={day} className="detail-hours-row">
                      <span className="detail-hours-day">{day}</span>
                      {h?.closed ? (
                        <span className="detail-hours-closed">หยุด</span>
                      ) : (
                        <div className="detail-hours-time">
                          <Clock />
                          {h?.open || '-'} — {h?.close || '-'}
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="detail-hours-simple">
                  <div className="detail-hours-simple-left">
                    <Clock />
                    เวลาเปิด-ปิด
                  </div>
                  <span style={{ fontWeight: 500, color: '#111', fontSize: 13 }}>
                    {place.open_time} — {place.close_time}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="detail-sidebar">

            {/* Quick Info */}
            <div className="detail-sidebar-card">
              <div className="detail-section-title">ข้อมูลสำคัญ</div>

              <div className="detail-info-row">
                <div className="detail-info-label"><DollarSign />ช่วงราคา</div>
                <span className="detail-info-value">{getPriceRangeText(place.price_min, place.is_free)}</span>
              </div>
              <div className="detail-info-row">
                <div className="detail-info-label"><Star />คะแนนรีวิว</div>
                <span className="detail-info-value">{place.rating} / 5.0</span>
              </div>
              <div className="detail-info-row">
                <div className="detail-info-label"><Calendar />เพิ่มเมื่อ</div>
                <span className="detail-info-value">
                  {new Date(place.createdAt).toLocaleDateString('th-TH')}
                </span>
              </div>

              <button onClick={handleNavigate} className="detail-btn-primary">
                <Navigation />นำทาง
              </button>
              <button onClick={handleShare} className="detail-btn-secondary">
                <Share2 />แชร์สถานที่
              </button>
            </div>

            {/* Location */}
            <div className="detail-sidebar-card">
              <div className="detail-section-title">ที่ตั้ง</div>
              <div className="detail-location-row">
                <MapPin />
                <div>
                  <div>{place.address}</div>
                  <div style={{ color: '#aaa', marginTop: 4 }}>
                    {place.address?.split('จังหวัด')[1]?.trim() || 'ไม่ระบุ'}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
