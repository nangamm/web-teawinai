import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Star, Percent } from 'lucide-react'
import { placesAPI } from '@/services/api'
import toast from 'react-hot-toast'

const formatPrice = (place) => {
  if (place.is_free) return 'ฟรี'
  if (place.price_min && place.price_max && place.price_min !== place.price_max) {
    return `฿${place.price_min.toLocaleString()} - ฿${place.price_max.toLocaleString()}`
  }
  if (place.price_min) return `฿${place.price_min.toLocaleString()}`
  if (place.price_max) return `฿${place.price_max.toLocaleString()}`
  return 'N/A'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export function Promotions() {
  const navigate = useNavigate()
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    setLoading(true)
    try {
      const response = await placesAPI.getPlaces({ is_promotion: true })
      setPromotions(response.data.places || [])
    } catch (error) {
      console.error('Unable to fetch promotions:', error)
      toast.error('ไม่สามารถโหลดโปรโมชั่นได้')
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceClick = (placeId) => {
    navigate(`/places/${placeId}`)
  }

  return (
    <div className="places-inner">
      <div className="places-page">
        <div className="places-header">
          <h1 className="places-title">โปรโมชั่นพิเศษ</h1>
          <p className="places-subtitle">รวมโปรโมชั่นและส่วนลดสำหรับสถานที่ท่องเที่ยว</p>
        </div>

        {loading ? (
          <div className="places-loading">
            <div className="places-loading-spinner" />
            <p>กำลังโหลด...</p>
          </div>
        ) : promotions.length === 0 ? (
          <div className="places-empty">
            <Percent size={48} className="places-empty-icon" />
            <h3>ยังไม่มีโปรโมชั่น</h3>
            <p>ไม่พบโปรโมชั่นที่แสดงในขณะนี้</p>
          </div>
        ) : (
          <div className="places-grid">
            {promotions.map((place) => (
              <div
                key={place._id}
                className="place-card"
                onClick={() => handlePlaceClick(place._id)}
              >
                <div className="place-card-img-wrap">
                  {place.images && place.images.length > 0 ? (
                    <img
                      src={place.images[0]}
                      alt={place.name}
                      className="place-card-img"
                    />
                  ) : (
                    <div className="place-card-img-placeholder">
                      <MapPin size={32} />
                    </div>
                  )}
                  {place.is_promotion && (
                    <div className="place-card-cat-badge">
                      <Percent size={16} />
                    </div>
                  )}
                </div>
                <div className="place-card-body">
                  <div className="place-card-top">
                    <h3 className="place-card-name">{place.name}</h3>
                    <div className="place-card-price">{formatPrice(place)}</div>
                  </div>
                  <div className="place-card-location">
                    <MapPin size={12} />
                    <span>{place.province}</span>
                  </div>
                  <div className="place-card-cat-tag">{place.category}</div>
                  <div className="place-card-footer">
                    <div className="place-card-rating">
                      <Star size={13} className="star-icon" />
                      <span className="place-card-rating-num">{place.rating || 'N/A'}</span>
                      {place.review_count && (
                        <span className="review-count">({place.review_count})</span>
                      )}
                    </div>
                    <span className="place-card-detail-btn">ดูรายละเอียด</span>
                  </div>
                  {place.promotion_end_date && (
                    <div className="place-card-promo-panel">
                      <div className="place-card-promo-item">
                        <div className="place-card-promo-title">สิ้นสุด: {formatDate(place.promotion_end_date)}</div>
                      </div>
                    </div>
                  )}
                  {place.promotion_description && (
                    <div className="place-card-promo-panel">
                      <div className="place-card-promo-item">
                        <div className="place-card-promo-title">{place.promotion_description}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
