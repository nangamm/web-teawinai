import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bookmark,
  Camera,
  Clock,
  ExternalLink,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Share2,
  Star,
} from 'lucide-react'
import { placesAPI } from '@/services/api'
import { getUser, isAuthenticated } from '@/utils/auth'
import { buildImageUrl } from '../utils/image'
import { hasInappropriateContent } from '@/utils/contentModeration'
import toast from 'react-hot-toast'

const thaiDays = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']
const thaiDayKeys = ['วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์', 'วันอาทิตย์']
const defaultTags = ['อาหารไทย', 'อาหารจานเดียว', 'ต้มยำ', 'ราคาดี', 'อาหารเช้า']

const getDisplayName = (user, fallback = 'นักเดินทาง') => (
  user?.username || user?.name || fallback
)

const getAvatarSrc = (user, displayName) => {
  if (user?.avatar) return buildImageUrl(user.avatar)
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=116045&color=fff&size=96`
}

const getReviewerMeta = (review) => {
  const displayName = getDisplayName(review.user, review.name || 'นักเดินทาง')

  return {
    name: displayName,
    avatarSrc: getAvatarSrc(review.user, displayName),
  }
}

const getReplyMeta = (reply) => {
  const displayName = getDisplayName(reply.user, 'ผู้ตอบกลับ')

  return {
    name: displayName,
    avatarSrc: getAvatarSrc(reply.user, displayName),
  }
}

const getSavedPlacesKey = (user) => {
  const userId = user?.id || user?._id || 'guest'
  return `teawinai:saved-places:${userId}`
}

const readSavedPlaces = (user) => {
  try {
    return JSON.parse(localStorage.getItem(getSavedPlacesKey(user)) || '[]')
  } catch {
    return []
  }
}

const writeSavedPlaces = (user, places) => {
  localStorage.setItem(getSavedPlacesKey(user), JSON.stringify(places))
}

export function PlaceDetail() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [activeReplyReviewId, setActiveReplyReviewId] = useState(null)
  const [replyComment, setReplyComment] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const fetchPlace = useCallback(async () => {
    setLoading(true)
    try {
      const response = await placesAPI.getPlace(id)
      setPlace(response.data.data || response.data)
    } catch (error) {
      console.error('Error fetching place detail:', error)
      toast.error('ไม่สามารถดึงข้อมูลสถานที่ได้')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchPlace() }, [fetchPlace])

  useEffect(() => {
    const user = getUser()
    const savedPlaces = readSavedPlaces(user)
    setIsSaved(savedPlaces.some(item => String(item.id) === String(id)))
  }, [id])

  const resultReturnState = location.state?.fromResult
    ? {
        tripPlan: location.state.tripPlan,
        tripName: location.state.tripName,
      }
    : null

  const handleBackToResult = () => {
    navigate('/result', { state: resultReturnState })
  }

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [id])

  const handleNavigate = () => {
    if (place?.map_link) {
      window.open(place.map_link, '_blank', 'noopener,noreferrer')
    } else {
      toast.error('ไม่มีข้อมูลแผนที่')
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: place?.name || 'Teawinai',
      text: place?.name ? `ดูสถานที่นี้ใน Teawinai: ${place.name}` : 'ดูสถานที่นี้ใน Teawinai',
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (error) {
        if (error.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('คัดลอกลิงก์สถานที่เรียบร้อยแล้ว')
    } catch {
      toast.error('ไม่สามารถคัดลอกลิงก์ได้')
    }
  }

  const handleSavePlace = () => {
    if (!isAuthenticated()) {
      toast.error('กรุณาเข้าสู่ระบบก่อนบันทึกสถานที่')
      return
    }

    const user = getUser()
    const savedPlaces = readSavedPlaces(user)
    const placeId = place._id || place.id || id
    const alreadySaved = savedPlaces.some(item => String(item.id) === String(placeId))

    if (alreadySaved) {
      writeSavedPlaces(user, savedPlaces.filter(item => String(item.id) !== String(placeId)))
      setIsSaved(false)
      toast.success('ยกเลิกบันทึกสถานที่แล้ว')
      return
    }

    writeSavedPlaces(user, [
      {
        id: placeId,
        name: place.name,
        category: getCategoryName(place.category),
        image: Array.isArray(place.images) ? place.images[0] : '',
        address: place.address || '',
        rating: Number(place.rating || 0),
        savedAt: new Date().toISOString(),
      },
      ...savedPlaces,
    ])
    setIsSaved(true)
    toast.success('บันทึกสถานที่แล้ว')
  }

  const handleReviewSubmit = async (event) => {
    event.preventDefault()

    if (!isAuthenticated()) {
      toast.error('กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น')
      return
    }

    if (!reviewForm.comment.trim()) {
      toast.error('กรุณาเขียนความคิดเห็น')
      return
    }

    if (hasInappropriateContent(reviewForm.comment)) {
      toast.error('ความคิดเห็นมีคำไม่สุภาพ ไม่เหมาะสม หรือสื่อไปทางเพศ')
      return
    }

    setSubmittingReview(true)
    try {
      const response = await placesAPI.addReview(id, {
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      })
      setPlace(response.data.data || response.data)
      setReviewForm({ rating: 5, comment: '' })
      setShowReviewForm(false)
      toast.success(response.data.message || 'บันทึกความคิดเห็นแล้ว')
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error(error.response?.data?.message || 'ไม่สามารถบันทึกความคิดเห็นได้')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleReplySubmit = async (event, reviewId) => {
    event.preventDefault()

    if (!isAuthenticated()) {
      toast.error('กรุณาเข้าสู่ระบบก่อนตอบกลับความคิดเห็น')
      return
    }

    if (!replyComment.trim()) {
      toast.error('กรุณาเขียนคำตอบกลับ')
      return
    }

    if (hasInappropriateContent(replyComment)) {
      toast.error('คำตอบกลับมีคำไม่สุภาพ ไม่เหมาะสม หรือสื่อไปทางเพศ')
      return
    }

    setSubmittingReply(true)
    try {
      const response = await placesAPI.addReviewReply(id, reviewId, {
        comment: replyComment.trim(),
      })
      setPlace(response.data.data || response.data)
      setReplyComment('')
      setActiveReplyReviewId(null)
      toast.success(response.data.message || 'บันทึกคำตอบกลับแล้ว')
    } catch (error) {
      console.error('Error submitting review reply:', error)
      toast.error(error.response?.data?.message || 'ไม่สามารถบันทึกคำตอบกลับได้')
    } finally {
      setSubmittingReply(false)
    }
  }

  if (loading) {
    return (
      <div className="detail-skeleton">
        <div className="detail-skeleton-line" style={{ width: '22%' }} />
        <div className="detail-skeleton-line detail-skeleton-title" style={{ width: '38%' }} />
        <div className="detail-skeleton-img" />
        <div className="detail-skeleton-grid">
          <div className="detail-skeleton-card" />
          <div className="detail-skeleton-card" />
        </div>
      </div>
    )
  }

  if (!place) {
    return (
      <div className="detail-not-found">
        <MapPin size={40} style={{ color: '#c8c2ba' }} />
        <h2>ไม่พบสถานที่ท่องเที่ยว</h2>
        <Link to="/places" className="detail-btn-primary detail-not-found-link">
          กลับไปหน้าสถานที่ท่องเที่ยว
        </Link>
      </div>
    )
  }

  const getCategoryIcon = (category) => {
    if (category && typeof category === 'object') return category.icon || '📍'
    const icons = {
      temple: '🏛️',
      beach: '🏖️',
      mountain: '⛰️',
      city: '🏙️',
      museum: '🏛️',
      park: '🌳',
      market: '🛍️',
      restaurant: '🍜',
      other: '📍',
    }
    return icons[category] || '📍'
  }

  const getCategoryName = (category) => {
    if (category && typeof category === 'object') return category.name || 'อื่นๆ'
    const names = {
      temple: 'วัดวาอาราม',
      beach: 'ชายหาด',
      mountain: 'ภูเขา',
      city: 'เมือง',
      museum: 'พิพิธภัณฑ์',
      park: 'สวนสาธารณะ',
      market: 'ตลาด',
      restaurant: 'ร้านอาหาร',
      other: 'อื่นๆ',
    }
    return names[category] || category || 'อื่นๆ'
  }

  const imageSrc = (src) => {
    if (!src) return ''
    if (/^https?:\/\//i.test(src)) return src
    return `${API_BASE}${src}`
  }

  const getPlaceArea = () => {
    const address = place.address || ''
    return address.split('จังหวัด')[1]?.trim() || address.split(',').at(-1)?.trim() || 'ไม่ระบุ'
  }

  const getDescription = () => {
    return place.description || place.detail || 'ร้านอาหารท้องถิ่นที่เหมาะสำหรับแวะพัก เติมพลัง และใช้เวลาแบบไม่เร่งรีบ รายละเอียดเพิ่มเติมของสถานที่นี้ยังรอการอัปเดตจากชุมชน'
  }

  const getHourForDay = (index) => {
    const hours = place.opening_hours || {}
    const value = hours[thaiDayKeys[index]] || hours[thaiDays[index]] || hours[thaiDays[index].toLowerCase()]
    if (value?.closed) return 'ปิด'
    if (value?.open || value?.close) return `${value.open || '-'} - ${value.close || '-'}`
    if (typeof value === 'string') return value
    if (place.open_time || place.close_time) return `${place.open_time || '-'} - ${place.close_time || '-'}`
    return '09:00 - 18:00'
  }

  const reviews = Array.isArray(place.reviews) ? place.reviews : []
  const rating = Number(place.rating || 0)
  const reviewCount = place.review_count || place.reviews_count || reviews.length || 0
  const currentUser = getUser()
  const canReview = currentUser && ['user', 'owner', 'admin'].includes(currentUser.role)
  const currentUserReview = currentUser
    ? reviews.find(review => {
        const reviewUserId = review.user?._id || review.user?.id || review.user
        return String(reviewUserId) === String(currentUser.id || currentUser._id)
      })
    : null
  const ratingCounts = reviews.reduce((counts, review) => {
    const score = Math.round(Number(review.rating || 0))
    if (score >= 1 && score <= 5) counts[score] += 1
    return counts
  }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
  const tags = Array.isArray(place.tags) && place.tags.length ? place.tags : defaultTags
  const ratingRows = [5, 4, 3, 2, 1].map(score => ({
    score,
    percent: reviewCount ? (ratingCounts[score] / reviewCount) * 100 : 0,
  }))

  return (
    <div className="detail-page">
      <div className="detail-inner">
        {resultReturnState && (
          <button type="button" className="detail-result-back" onClick={handleBackToResult}>
            <ArrowLeft />
            กลับไปหน้า Result
          </button>
        )}

        <nav className="detail-breadcrumb" aria-label="breadcrumb">
          <Link to="/">หน้าแรก</Link>
          <span className="detail-breadcrumb-sep">/</span>
          <Link to="/places">สถานที่ท่องเที่ยว</Link>
          <span className="detail-breadcrumb-sep">/</span>
          <span className="detail-breadcrumb-current">{place.name}</span>
        </nav>

        <header className="detail-header">
          <div className="detail-header-left">
            <div className="detail-title-row">
              <span className="detail-cat-emoji" aria-hidden="true">{getCategoryIcon(place.category)}</span>
              <h1 className="detail-title">{place.name}</h1>
            </div>
            <div className="detail-meta">
              <span className="detail-cat-tag">{getCategoryName(place.category)}</span>
              <span className="detail-meta-item">
                <MapPin />
                {getPlaceArea()}
              </span>
              <span className="detail-meta-item">
                <Star className="star-icon" />
                <strong>{rating ? rating.toFixed(1) : 'ยังไม่มีคะแนน'}</strong>
                {reviewCount ? `(${reviewCount} รีวิว)` : '(0 รีวิว)'}
              </span>
            </div>
          </div>

          <div className="detail-actions">
            <button type="button" className="detail-action-btn" onClick={handleShare}>
              <Share2 />
              แชร์
            </button>
            <button
              type="button"
              className={`detail-action-btn detail-action-save${isSaved ? ' is-saved' : ''}`}
              onClick={handleSavePlace}
              aria-pressed={isSaved}
              title={isSaved ? 'ยกเลิกบันทึกสถานที่' : 'บันทึกสถานที่'}
            >
              <Bookmark />
              {isSaved ? 'บันทึกแล้ว' : 'บันทึก'}
            </button>
          </div>
        </header>

        <section className="detail-gallery" aria-label="รูปภาพสถานที่">
          {place.images?.length > 0 ? (
            <>
              <img
                src={imageSrc(place.images[0])}
                alt={place.name}
                className="detail-gallery-main"
                onError={e => { e.currentTarget.src = '/api/placeholder/1200/520' }}
              />
              <button type="button" className="detail-gallery-all" onClick={() => window.open(imageSrc(place.images[0]), '_blank', 'noopener,noreferrer')}>
                <ImageIcon />
                ดูรูปภาพทั้งหมด
              </button>
            </>
          ) : (
            <div className="detail-gallery-placeholder">
              <Camera />
              <span>ยังไม่มีรูปภาพ</span>
            </div>
          )}
        </section>

        <div className="detail-layout">
          <main className="detail-main">
            <section className="detail-card detail-description-card">
              <h2 className="detail-section-title">รายละเอียด</h2>
              <p className="detail-description">{getDescription()}</p>

              <div className="detail-address-block">
                <div className="detail-address-icon">
                  <MapPin />
                </div>
                <div>
                  <div className="detail-address-label">ที่อยู่</div>
                  <p>{place.address || 'ยังไม่มีข้อมูลที่อยู่'}</p>
                  {place.map_link && (
                    <button type="button" className="detail-map-link" onClick={handleNavigate}>
                      ดูบนแผนที่
                      <ExternalLink />
                    </button>
                  )}
                </div>
              </div>

            </section>

            <section className="detail-food-section">
              <h2 className="detail-section-title">ประเภทอาหารยอดนิยม</h2>
              <div className="detail-chip-row">
                {tags.slice(0, 8).map(tag => (
                  <span key={tag} className="detail-chip">{tag}</span>
                ))}
              </div>
            </section>

            <section className="detail-review-section">
              <div className="detail-review-heading">
                <h2 className="detail-section-title">ความคิดเห็น</h2>
                {canReview ? (
                  <button
                    type="button"
                    className="detail-review-btn"
                    onClick={() => {
                      if (currentUserReview) {
                        setReviewForm({
                          rating: Number(currentUserReview.rating || 5),
                          comment: currentUserReview.comment || currentUserReview.content || '',
                        })
                      }
                      setShowReviewForm(value => !value)
                    }}
                  >
                    <MessageCircle />
                    {currentUserReview ? 'แก้ไขรีวิว' : 'เขียนรีวิว'}
                  </button>
                ) : (
                  <Link to="/login" className="detail-review-login">
                    เข้าสู่ระบบเพื่อเขียนรีวิว
                  </Link>
                )}
              </div>

              <div className="detail-rating-card">
                <div className="detail-rating-score">
                  <strong>{rating ? rating.toFixed(1) : '-'}</strong>
                  <div className="detail-stars" aria-label={`คะแนน ${rating || 0} จาก 5`}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className={index < Math.round(rating) ? 'filled' : ''} />
                    ))}
                  </div>
                  <span>จาก {reviewCount} รีวิว</span>
                </div>
                <div className="detail-rating-bars">
                  {ratingRows.map(row => (
                    <div className="detail-rating-row" key={row.score}>
                      <span>{row.score}</span>
                      <div className="detail-rating-track">
                        <div style={{ width: `${reviewCount ? row.percent : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {canReview && showReviewForm && (
                <form className="detail-review-form" onSubmit={handleReviewSubmit}>
                  <div className="detail-review-form-head">
                    <div>
                      <h3>{currentUserReview ? 'แก้ไขความคิดเห็นของคุณ' : 'เพิ่มความคิดเห็นของคุณ'}</h3>
                      <p>แบ่งปันข้อมูลที่ช่วยให้คนอื่นตัดสินใจได้ง่ายขึ้น</p>
                    </div>
                    <div className="detail-review-stars-input" aria-label="เลือกคะแนน">
                      {Array.from({ length: 5 }).map((_, index) => {
                        const score = index + 1
                        return (
                          <button
                            key={score}
                            type="button"
                            className={score <= reviewForm.rating ? 'is-active' : ''}
                            onClick={() => setReviewForm(prev => ({ ...prev, rating: score }))}
                            aria-label={`ให้ ${score} คะแนน`}
                          >
                            <Star />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <textarea
                    value={reviewForm.comment}
                    onChange={event => setReviewForm(prev => ({ ...prev, comment: event.target.value }))}
                    placeholder="เล่าประสบการณ์ จุดเด่น หรือคำแนะนำสำหรับสถานที่นี้"
                    rows={4}
                    maxLength={1000}
                    required
                  />
                  <div className="detail-review-form-actions">
                    <span>{reviewForm.comment.length}/1000</span>
                    <div>
                      <button
                        type="button"
                        className="detail-review-cancel"
                        onClick={() => setShowReviewForm(false)}
                        disabled={submittingReview}
                      >
                        ยกเลิก
                      </button>
                      <button type="submit" className="detail-review-submit" disabled={submittingReview}>
                        {submittingReview ? 'กำลังบันทึก...' : 'บันทึกความคิดเห็น'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="detail-review-list">
                {reviews.length > 0 ? reviews.slice(0, 3).map(review => {
                  const reviewer = getReviewerMeta(review)

                  return (
                    <article key={review.id || review._id || review.createdAt} className="detail-review-card">
                      <div className="detail-review-top">
                        <div className="detail-review-user">
                          <img
                            src={reviewer.avatarSrc}
                            alt={reviewer.name}
                            className="detail-review-avatar"
                            loading="lazy"
                          />
                          <div>
                            <strong>{reviewer.name}</strong>
                            <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString('th-TH') : 'ไม่นานมานี้'}</span>
                          </div>
                        </div>
                        <span className="detail-review-score"><Star /> {Number(review.rating || 0).toFixed(1)}</span>
                      </div>
                      <p>{review.comment || review.content || 'ผู้ใช้ยังไม่ได้เพิ่มข้อความรีวิว'}</p>
                      <div className="detail-review-card-actions">
                        {canReview ? (
                          <button
                            type="button"
                            className="detail-reply-toggle"
                            onClick={() => {
                              const reviewId = review._id || review.id
                              setActiveReplyReviewId(value => value === reviewId ? null : reviewId)
                              setReplyComment('')
                            }}
                          >
                            ตอบกลับ
                          </button>
                        ) : (
                          <Link to="/login" className="detail-reply-login">เข้าสู่ระบบเพื่อตอบกลับ</Link>
                        )}
                      </div>

                      {Array.isArray(review.replies) && review.replies.length > 0 && (
                        <div className="detail-reply-list">
                          {review.replies.map(reply => {
                            const replyAuthor = getReplyMeta(reply)

                            return (
                              <div key={reply._id || reply.createdAt} className="detail-reply-item">
                                <img
                                  src={replyAuthor.avatarSrc}
                                  alt={replyAuthor.name}
                                  className="detail-reply-avatar"
                                  loading="lazy"
                                />
                                <div className="detail-reply-body">
                                  <div className="detail-reply-meta">
                                    <strong>{replyAuthor.name}</strong>
                                    <span>{reply.createdAt ? new Date(reply.createdAt).toLocaleDateString('th-TH') : 'ไม่นานมานี้'}</span>
                                  </div>
                                  <p>{reply.comment}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {activeReplyReviewId === (review._id || review.id) && (
                        <form className="detail-reply-form" onSubmit={event => handleReplySubmit(event, review._id || review.id)}>
                          <textarea
                            value={replyComment}
                            onChange={event => setReplyComment(event.target.value)}
                            placeholder="เขียนคำตอบกลับความคิดเห็นนี้"
                            rows={3}
                            maxLength={1000}
                            required
                          />
                          <div className="detail-reply-form-actions">
                            <span>{replyComment.length}/1000</span>
                            <div>
                              <button
                                type="button"
                                className="detail-review-cancel"
                                onClick={() => {
                                  setActiveReplyReviewId(null)
                                  setReplyComment('')
                                }}
                                disabled={submittingReply}
                              >
                                ยกเลิก
                              </button>
                              <button type="submit" className="detail-review-submit" disabled={submittingReply}>
                                {submittingReply ? 'กำลังบันทึก...' : 'ตอบกลับ'}
                              </button>
                            </div>
                          </div>
                        </form>
                      )}
                    </article>
                  )
                }) : (
                  <div className="detail-empty-review">
                    <MessageCircle />
                    <p>ยังไม่มีความคิดเห็นสำหรับสถานที่นี้</p>
                  </div>
                )}
              </div>
            </section>
          </main>

          <aside className="detail-sidebar" aria-label="ข้อมูลเพิ่มเติม">
            <section className="detail-card detail-hours-card">
              <h2 className="detail-section-title detail-section-title-icon">
                <Clock />
                เวลาเปิด-ปิด
              </h2>
              <div className="detail-hours-list">
                {thaiDays.map((day, index) => {
                  const value = getHourForDay(index)
                  const isClosed = value === 'ปิด'
                  return (
                    <div key={day} className={`detail-hours-row${isClosed ? ' is-closed' : ''}`}>
                      <span className="detail-hours-day">{day}</span>
                      <span className="detail-hours-time">{value}</span>
                    </div>
                  )
                })}
              </div>
              <button type="button" className="detail-btn-primary" onClick={place.phone ? undefined : handleNavigate}>
                {place.phone ? <Phone /> : <Navigation />}
                {place.phone ? 'ติดต่อสอบถาม' : 'นำทาง'}
              </button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
