import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Banknote,
  CheckCircle,
  Clock,
  ExternalLink,
  MapPin,
  Search,
  XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { placesAPI, priceUpdatesAPI } from '@/services/api'
import { isAdmin } from '@/utils/auth'

const CAT_EMOJI = {
  'ร้านอาหาร': '🍽',
  Restaurants: '🍽',
  'คาเฟ่': '☕',
  Cafe: '☕',
  'วัด': '⛩',
  Temples: '⛩',
  'ธรรมชาติ': '🌿',
  Nature: '🌿',
  'ที่พัก': '🏨',
  Accommodation: '🏨',
  'ทัวร์': '🚴',
  Tour: '🚴'
}

const formatDate = (value) => {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return '-'
  }
}

const getImageUrl = (images) => {
  const firstImage = images?.[0]
  if (!firstImage) return ''
  return firstImage.startsWith('http') ? firstImage : `http://localhost:5001${firstImage}`
}

export function ApprovalQueue() {
  const [pendingPlaces, setPendingPlaces] = useState([])
  const [pendingUpdates, setPendingUpdates] = useState([])
  const [activeQueue, setActiveQueue] = useState('places')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState('')

  useEffect(() => {
    if (!isAdmin()) {
      window.location.href = '/'
      return
    }
    fetchQueue()
  }, [])

  const fetchQueue = async () => {
    setLoading(true)
    try {
      const [placesRes, updatesRes] = await Promise.all([
        placesAPI.getAdminPlaces({ status: 'pending', limit: 100 }),
        priceUpdatesAPI.getPendingUpdates({ limit: 100 })
      ])
      setPendingPlaces(placesRes.data?.data || placesRes.data || [])
      setPendingUpdates(updatesRes.data?.data || updatesRes.data || [])
    } catch (error) {
      console.error('Error fetching approval queue:', error)
      toast.error('ไม่สามารถดึงข้อมูลคิวอนุมัติได้')
    } finally {
      setLoading(false)
    }
  }

  const filteredPlaces = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return pendingPlaces
    return pendingPlaces.filter((place) => {
      const fields = [
        place.name,
        place.category?.name,
        place.address,
        place.submitted_by?.name,
        place.submitted_by?.email
      ]
      return fields.some((field) => String(field || '').toLowerCase().includes(keyword))
    })
  }, [pendingPlaces, query])

  const filteredUpdates = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return pendingUpdates
    return pendingUpdates.filter((update) => {
      const fields = [
        update.place_id?.name,
        update.owner_id?.name,
        update.owner_id?.email,
        update.promotion
      ]
      return fields.some((field) => String(field || '').toLowerCase().includes(keyword))
    })
  }, [pendingUpdates, query])

  const runAction = async (id, action, successMessage) => {
    setActionId(id)
    try {
      await action()
      toast.success(successMessage)
      await fetchQueue()
    } catch (error) {
      console.error('Approval action failed:', error)
      toast.error('ดำเนินการไม่สำเร็จ')
    } finally {
      setActionId('')
    }
  }

  const handleApprovePlace = (placeId) => {
    runAction(placeId, () => placesAPI.approvePlace(placeId), 'อนุมัติสถานที่สำเร็จ')
  }

  const handleRejectPlace = (placeId) => {
    runAction(placeId, () => placesAPI.rejectPlace(placeId), 'ปฏิเสธสถานที่แล้ว')
  }

  const handleApprovePriceUpdate = (updateId) => {
    runAction(
      updateId,
      () => priceUpdatesAPI.approvePriceUpdate(updateId, { review_note: 'อนุมัติ' }),
      'อนุมัติการอัปเดตราคาสำเร็จ'
    )
  }

  const handleRejectPriceUpdate = (updateId) => {
    const reason = window.prompt('กรุณาระบุเหตุผล:')
    if (!reason) return
    runAction(
      updateId,
      () => priceUpdatesAPI.rejectPriceUpdate(updateId, { review_note: reason }),
      'ปฏิเสธการอัปเดตราคาแล้ว'
    )
  }

  if (loading) {
    return (
      <div className="admin-skeleton">
        <div className="admin-skeleton-hero">
          <div className="admin-skeleton-line" style={{ width: '28%', height: 38, marginBottom: 16 }} />
          <div className="admin-skeleton-line" style={{ width: '48%' }} />
          <div className="admin-skeleton-line" style={{ width: '36%' }} />
        </div>
        <div className="approval-queue-shell">
          <div className="approval-queue-loading-grid">
            {[1, 2, 3].map((item) => (
              <div key={item} className="approval-queue-loading-card" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const totalPending = pendingPlaces.length + pendingUpdates.length
  const shownItems = activeQueue === 'places' ? filteredPlaces : filteredUpdates

  return (
    <div className="admin-page approval-queue-page">
      <header className="admin-hero approval-queue-hero">
        <div className="admin-hero-inner">
          <div>
            <Link to="/admin" className="approval-queue-back">
              <ArrowLeft />
              กลับไป Admin Console
            </Link>
            <h1 className="admin-hero-title">Approval Queue</h1>
            <p className="admin-hero-sub">
              ตรวจรายการสถานที่ใหม่และการอัปเดตราคาก่อนแสดงให้ผู้ใช้เห็น
            </p>
          </div>
          <div className="approval-queue-total">
            <span>{totalPending}</span>
            <small>รายการรออนุมัติ</small>
          </div>
        </div>
      </header>

      <section className="approval-queue-shell">
        <div className="approval-queue-toolbar">
          <div className="approval-queue-tabs" role="tablist" aria-label="Approval queue type">
            <button
              type="button"
              className={activeQueue === 'places' ? 'active' : ''}
              onClick={() => setActiveQueue('places')}
            >
              <MapPin />
              สถานที่
              <span>{pendingPlaces.length}</span>
            </button>
            <button
              type="button"
              className={activeQueue === 'prices' ? 'active' : ''}
              onClick={() => setActiveQueue('prices')}
            >
              <Banknote />
              อัปเดตราคา
              <span>{pendingUpdates.length}</span>
            </button>
          </div>

          <label className="approval-queue-search">
            <Search />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ค้นหาจากชื่อสถานที่หรือผู้ส่ง"
            />
          </label>
        </div>

        {shownItems.length === 0 ? (
          <div className="approval-queue-empty">
            <CheckCircle />
            <h2>ไม่มีรายการที่ต้องอนุมัติ</h2>
            <p>คิวนี้เรียบร้อยแล้ว เมื่อมีคำขอใหม่ระบบจะแสดงในหน้านี้</p>
          </div>
        ) : (
          <div className="approval-queue-list">
            {activeQueue === 'places' &&
              filteredPlaces.map((place) => {
                const imageUrl = getImageUrl(place.images)
                return (
                  <article key={place._id} className="approval-place-card">
                    <div className="approval-place-media">
                      {imageUrl ? (
                        <img src={imageUrl} alt={place.name} onError={(event) => { event.currentTarget.style.display = 'none' }} />
                      ) : (
                        <span>{CAT_EMOJI[place.category?.name] || '📍'}</span>
                      )}
                    </div>
                    <div className="approval-place-body">
                      <div className="approval-card-topline">
                        <span className="admin-status-badge pending">PENDING</span>
                        <span><Clock /> {formatDate(place.createdAt || place.submitted_at)}</span>
                      </div>
                      <h2>{place.name}</h2>
                      <dl className="approval-meta-grid">
                        <div>
                          <dt>หมวดหมู่</dt>
                          <dd>{place.category?.name || '-'}</dd>
                        </div>
                        <div>
                          <dt>ผู้ส่ง</dt>
                          <dd>{place.submitted_by?.name || place.owner?.name || 'Place Submission'}</dd>
                        </div>
                        <div>
                          <dt>ราคา</dt>
                          <dd>{place.is_free ? 'ฟรี' : `฿${place.price_min ?? '-'} - ฿${place.price_max ?? '-'}`}</dd>
                        </div>
                        <div>
                          <dt>ที่อยู่</dt>
                          <dd>{place.address || '-'}</dd>
                        </div>
                      </dl>
                      {place.map_link && (
                        <a className="approval-map-link" href={place.map_link} target="_blank" rel="noreferrer">
                          <ExternalLink />
                          เปิดแผนที่
                        </a>
                      )}
                    </div>
                    <div className="approval-card-actions">
                      <button
                        type="button"
                        className="admin-update-approve-btn"
                        disabled={actionId === place._id}
                        onClick={() => handleApprovePlace(place._id)}
                      >
                        <CheckCircle />
                        อนุมัติ
                      </button>
                      <button
                        type="button"
                        className="admin-update-reject-btn"
                        disabled={actionId === place._id}
                        onClick={() => handleRejectPlace(place._id)}
                      >
                        <XCircle />
                        ปฏิเสธ
                      </button>
                    </div>
                  </article>
                )
              })}

            {activeQueue === 'prices' &&
              filteredUpdates.map((update) => (
                <article key={update._id} className="admin-update-card approval-update-card">
                  <div className="admin-update-card-top">
                    <div>
                      <div className="approval-card-topline">
                        <span className="admin-status-badge pending">PENDING</span>
                        <span><Clock /> {formatDate(update.submitted_at || update.createdAt)}</span>
                      </div>
                      <div className="admin-update-card-name">{update.place_id?.name || 'ไม่ระบุสถานที่'}</div>
                      <div className="admin-update-card-by">
                        ส่งโดย: {update.owner_id?.name || 'ไม่ระบุ'} ({update.owner_id?.email || '-'})
                      </div>
                    </div>
                    <div className="admin-update-card-btns">
                      <button
                        className="admin-update-approve-btn"
                        disabled={actionId === update._id}
                        onClick={() => handleApprovePriceUpdate(update._id)}
                      >
                        <CheckCircle />
                        อนุมัติ
                      </button>
                      <button
                        className="admin-update-reject-btn"
                        disabled={actionId === update._id}
                        onClick={() => handleRejectPriceUpdate(update._id)}
                      >
                        <XCircle />
                        ปฏิเสธ
                      </button>
                    </div>
                  </div>

                  <div className="admin-update-price-grid">
                    <div>
                      <div className="admin-update-price-label">ราคาปัจจุบัน</div>
                      <div className="admin-update-price-val">฿{update.place_id?.price_min ?? '-'} - ฿{update.place_id?.price_max ?? '-'}</div>
                    </div>
                    <div>
                      <div className="admin-update-price-label">ราคาใหม่</div>
                      <div className="admin-update-price-new">฿{update.new_price_min ?? '-'} - ฿{update.new_price_max ?? '-'}</div>
                    </div>
                  </div>

                  {update.promotion && (
                    <div className="admin-update-promo">
                      <div className="admin-update-promo-label">โปรโมชัน</div>
                      <div className="admin-update-promo-text">{update.promotion}</div>
                    </div>
                  )}
                </article>
              ))}
          </div>
        )}
      </section>
    </div>
  )
}
