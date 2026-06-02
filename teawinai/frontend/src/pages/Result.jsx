import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MapPin, Clock, Star, Save, RotateCcw, Edit3 } from 'lucide-react'
import { tripsAPI } from '@/services/api'
import { isAuthenticated } from '@/utils/auth'

export function Result() {
  const location = useLocation()
  const navigate = useNavigate()
  const [tripPlan, setTripPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tripName, setTripName] = useState('')

  useEffect(() => {
    if (location.state?.tripPlan) {
      setTripPlan(location.state.tripPlan)
      const defaultName = `ทริป ${new Date().toLocaleDateString('th-TH', {
        day: 'numeric', month: 'short', year: 'numeric'
      })}`
      setTripName(defaultName)
    }
    setLoading(false)
  }, [location])

  const handleSaveTrip = async () => {
    if (!isAuthenticated()) { navigate('/login'); return }
    if (!tripName.trim()) { alert('กรุณาระบุชื่อทริป'); return }
    setSaving(true)
    try {
      await tripsAPI.saveTrip({
        trip_name: tripName.trim(),
        budget_total: tripPlan.budget_total,
        trip_date: new Date(),
        selectedPlaces: tripPlan.selectedPlaces,
        categories: tripPlan.selectedPlaces?.map(p => p.category?.name).filter(Boolean) || [],
        max_places: tripPlan.selectedPlaces?.length || 10
      })
      navigate('/my-trips')
    } catch (error) {
      console.error('Error saving trip:', error)
      alert('เกิดข้อผิดพลาดในการบันทึกทริป: ' + (error.response?.data?.message || error.message))
    } finally {
      setSaving(false)
    }
  }

  const handlePlaceDetail = (placeId) => navigate(`/places/${placeId}`)

  const getBudgetPercentage = () => {
    if (!tripPlan) return 0
    return Math.min(100, (tripPlan.budget_used / tripPlan.budget_total) * 100)
  }

  const getRisk = () => {
    const p = getBudgetPercentage()
    if (p < 50) return { key: 'low', label: 'Low Risk' }
    if (p < 80) return { key: 'mid', label: 'Medium Risk' }
    return { key: 'high', label: 'High Risk' }
  }

  // Estimate category spend from places
  const getCatSpend = (places) => {
    const dining = places?.filter(p => ['ร้านอาหาร','Restaurants','คาเฟ่','Cafe'].includes(p.category?.name))
      .reduce((s, p) => s + (p.selectedCost || p.price_min || 0), 0) || 0
    const tours = places?.filter(p => ['วัด','Temples'].includes(p.category?.name))
      .reduce((s, p) => s + (p.selectedCost || p.price_min || 0), 0) || 0
    return { dining, tours }
  }

  if (loading) {
    return (
      <div className="result-skeleton">
        <div className="result-skeleton-line" style={{ width: '20%' }} />
        <div className="result-skeleton-line" style={{ width: '50%', height: 36, marginBottom: 16 }} />
        <div className="result-skeleton-line" style={{ width: '60%' }} />
        <div className="result-skeleton-line" style={{ width: '45%', marginBottom: 32 }} />
        {[1,2,3].map(i => <div key={i} className="result-skeleton-card" />)}
      </div>
    )
  }

  if (!tripPlan) {
    return (
      <div className="result-page" style={{ textAlign: 'center', paddingTop: 120 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#333', marginBottom: 12 }}>ไม่พบแผนการเดินทาง</h2>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>กรุณากลับไปสร้างแผนการเดินทางก่อน</p>
        <button onClick={() => navigate('/')} className="result-cta-btn" style={{ width: 'auto', padding: '12px 28px', margin: '0 auto' }}>
          กลับหน้าหลัก
        </button>
      </div>
    )
  }

  const risk = getRisk()
  const catSpend = getCatSpend(tripPlan.selectedPlaces)
  const pct = getBudgetPercentage()

  return (
    <div className="result-page">
      <div className="result-inner">

        {/* ── Header ── */}
        <div className="result-eyebrow">UBON RATCHATHANI HERITAGE</div>
        <h1 className="result-title">One Day in the<br />Emerald City</h1>
        <p className="result-subtitle">
          A curated editorial journey through the spiritual heart of Isan. From the golden glow
          of morning temples to the serene twilight by the Mun River.
        </p>

        {/* Trip Name */}
        <div className="result-name-wrap">
          <Edit3 />
          <input
            type="text"
            className="result-name-input"
            value={tripName}
            onChange={e => setTripName(e.target.value)}
            placeholder="ตั้งชื่อทริปของคุณ..."
            maxLength={100}
          />
        </div>

        {/* ── Two-column layout ── */}
        <div className="result-layout">

          {/* Left: Timeline */}
          <div className="result-timeline" style={{ paddingLeft: 32 }}>
            {tripPlan.selectedPlaces.map((place, index) => {
              const isFree = place.is_free || place.price_min === 0
              const cost = isFree ? null : (place.selectedCost || place.price_min)
              const catName = place.category?.name || ''

              return (
                <div key={index} className="result-timeline-item">
                  <div className="result-timeline-dot" />

                  {/* Image */}
                  {place.images?.length > 0 ? (
                    <img
                      src={`http://localhost:5001${place.images[0]}`}
                      alt={place.name}
                      className="result-place-img"
                      onError={e => {
                        const svg = '<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#eae8e3"/></svg>'
                        e.target.src = `data:image/svg+xml;base64,${btoa(svg)}`
                      }}
                    />
                  ) : (
                    <div className="result-place-img-placeholder"><MapPin /></div>
                  )}

                  {/* Content */}
                  <div className="result-place-content">
                    <div className="result-place-name">{place.name}
                      <span className={`result-place-cost${isFree ? ' free' : ''}`}>
                        {isFree ? '฿0 Entrance' : `฿${cost} Est. Cost`}
                      </span>
                    </div>

                    <div className="result-place-desc">{place.address}</div>

                    {catName && (
                      <div className="result-place-tags">
                        <span className="result-place-tag">{catName}</span>
                        {place.rating && <span className="result-place-tag">★ {place.rating}</span>}
                      </div>
                    )}

                    <div className="result-place-meta">
                      {place.rating && (
                        <div className="result-place-meta-item">
                          <Star style={{ color: '#f5a623', fill: '#f5a623' }} />
                          {place.rating}
                        </div>
                      )}
                      <div className="result-place-meta-item">
                        <Clock />
                        {place.opening_hours?.['จันทร์']
                          ? `${place.opening_hours['จันทร์'].open} - ${place.opening_hours['จันทร์'].close}`
                          : place.open_time && place.close_time
                          ? `${place.open_time} - ${place.close_time}`
                          : 'ไม่ระบุเวลา'}
                      </div>
                      <button className="result-place-detail-btn" onClick={() => handlePlaceDetail(place._id)}>
                        ดูรายละเอียด →
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right: Sidebar */}
          <div className="result-sidebar">

            {/* Budget Intelligence */}
            <div className="result-budget-card">
              <div className="result-budget-title">Budget Intelligence</div>

              <div className="result-util-row">
                <span>Daily Utilization</span>
                <span className="result-util-pct">{pct.toFixed(0)}%</span>
              </div>

              <div className="result-progress-track">
                <div
                  className={`result-progress-fill ${risk.key}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="result-budget-boxes">
                <div className="result-budget-box">
                  <div className="result-budget-box-label">Total Spent</div>
                  <div className="result-budget-box-num">฿{tripPlan.budget_used?.toLocaleString()}</div>
                </div>
                <div className="result-budget-box">
                  <div className="result-budget-box-label">Remaining</div>
                  <div className="result-budget-box-num">฿{tripPlan.budget_remaining?.toLocaleString()}</div>
                </div>
              </div>

              <div className="result-risk-row">
                <div>
                  <div style={{ marginBottom: 3 }}>Projected Overload</div>
                  <span className={`result-risk-badge ${risk.key}`}>{risk.label}</span>
                </div>
                <button className="result-edit-budget">Edit Budget →</button>
              </div>
            </div>

            {/* Category spend */}
            <div className="result-cat-grid">
              <div className="result-cat-box">
                <div className="result-cat-icon">🍽</div>
                <div className="result-cat-label">Dining</div>
                <div className="result-cat-amount">฿{catSpend.dining.toLocaleString()}</div>
              </div>
              <div className="result-cat-box">
                <div className="result-cat-icon">⛩</div>
                <div className="result-cat-label">Tours</div>
                <div className="result-cat-amount">฿{catSpend.tours.toLocaleString()}</div>
              </div>
              <div className="result-cat-box">
                <div className="result-cat-icon">🚌</div>
                <div className="result-cat-label">Transport</div>
                <div className="result-cat-amount">฿0</div>
              </div>
              <div className="result-cat-box">
                <div className="result-cat-icon">🛍</div>
                <div className="result-cat-label">Shopping</div>
                <div className="result-cat-amount">฿0</div>
              </div>
            </div>

            {/* CTAs */}
            <button className="result-cta-btn" onClick={handleSaveTrip} disabled={saving}>
              <Save />
              {saving ? 'กำลังบันทึก...' : 'บันทึกแผน'}
            </button>

            <button className="result-share-btn">Share with Travel Partners</button>

            <button className="result-replан-btn" onClick={() => navigate('/')}>
              <RotateCcw />วางแผนใหม่
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}
