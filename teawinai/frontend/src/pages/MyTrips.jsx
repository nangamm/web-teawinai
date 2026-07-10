import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Eye, Map, MapPin, Plus, Trash2 } from 'lucide-react'
import { tripsAPI } from '@/services/api'
import { isAuthenticated } from '@/utils/auth'

const formatMoney = (value) => {
  const amount = Number(value || 0)
  return `฿${amount.toLocaleString('th-TH')}`
}

const formatTripDate = (date) => {
  if (!date) return 'ยังไม่ระบุวัน'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'ยังไม่ระบุวัน'

  return parsed.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function MyTrips() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated()) {
      setLoading(false)
      navigate('/login')
      return
    }
    fetchTrips()
  }, [navigate])

  const fetchTrips = async () => {
    try {
      const response = await tripsAPI.getMyTrips()
      setTrips(response.data.data || [])
    } catch (error) {
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTrip = async (tripId) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบทริปนี้?')) {
      return
    }

    try {
      await tripsAPI.deleteTrip(tripId)
      setTrips((currentTrips) => currentTrips.filter((trip) => trip._id !== tripId))
    } catch (error) {
      console.error('Error deleting trip:', error)
    }
  }

  const viewTrip = (trip) => {
    const budgetTotal = Number(trip.budget_total || 0)
    const budgetUsed = Number(trip.budget_used || 0)

    navigate('/result', {
      state: {
        tripName: trip.trip_name,
        tripPlan: {
          budget_total: budgetTotal,
          budget_used: budgetUsed,
          budget_remaining: Math.max(0, budgetTotal - budgetUsed),
          selectedPlaces: (trip.trip_items || []).map((item) => ({
            ...(item.place_id || {}),
            selectedCost: Number(item.estimated_cost || 0),
          })),
        },
      },
    })
  }

  if (loading) {
    return (
      <div className="my-trips-page">
        <div className="my-trips-inner">
          <div className="my-trips-skeleton-head" />
          <div className="my-trips-skeleton-grid">
            {[1, 2, 3].map((item) => (
              <div key={item} className="my-trips-skeleton-card" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="my-trips-page">
      <div className="my-trips-inner">
        <header className="my-trips-header">
          <div className="my-trips-title-block">
            <span className="my-trips-kicker">Trip planner</span>
            <h1>ทริปของฉัน</h1>
            <p>จัดการแผนการเดินทางที่บันทึกไว้และกลับไปดูเส้นทางได้เร็วขึ้น</p>
          </div>
          <Link to="/" className="my-trips-primary">
            <Plus />
            <span>สร้างทริปใหม่</span>
          </Link>
        </header>

        {trips.length === 0 ? (
          <section className="my-trips-empty" aria-labelledby="my-trips-empty-title">
            <div className="my-trips-empty-icon" aria-hidden="true">
              <MapPin />
            </div>
            <h2 id="my-trips-empty-title">ยังไม่มีทริป</h2>
            <p>เริ่มวางแผนทริปจากสถานที่แนะนำ แล้วบันทึกไว้กลับมาดูภายหลัง</p>
            <Link to="/" className="my-trips-primary">
              <Plus />
              <span>สร้างทริปแรกของคุณ</span>
            </Link>
          </section>
        ) : (
          <section className="my-trips-grid" aria-label="รายการทริปของฉัน">
            {trips.map((trip) => {
              const items = trip.trip_items || []
              const remaining = Number(trip.budget_total || 0) - Number(trip.budget_used || 0)

              return (
                <article key={trip._id} className="my-trip-card">
                  <div className="my-trip-card-head">
                    <div className="my-trip-card-title">
                      <h2>{trip.trip_name || 'แผนการเดินทาง'}</h2>
                      <span>
                        <Calendar />
                        {formatTripDate(trip.trip_date)}
                      </span>
                    </div>
                    <span className={`my-trip-status ${trip.status === 'saved' ? 'is-saved' : 'is-draft'}`}>
                      {trip.status === 'saved' ? 'บันทึก' : 'ร่าง'}
                    </span>
                  </div>

                  <div className="my-trip-card-body">
                    <div className="my-trip-budget" aria-label="สรุปงบทริป">
                      <div>
                        <span>งบทั้งหมด</span>
                        <strong>{formatMoney(trip.budget_total)}</strong>
                      </div>
                      <div>
                        <span>ใช้ไป</span>
                        <strong>{formatMoney(trip.budget_used)}</strong>
                      </div>
                      <div>
                        <span>คงเหลือ</span>
                        <strong>{formatMoney(remaining)}</strong>
                      </div>
                    </div>

                    <div className="my-trip-places">
                      <div className="my-trip-section-title">
                        <Map />
                        <span>สถานที่ ({items.length})</span>
                      </div>

                      {items.length > 0 ? (
                        <div className="my-trip-place-list">
                          {items.slice(0, 3).map((item, index) => (
                            <div key={`${trip._id}-${index}`} className="my-trip-place-row">
                              <span className="my-trip-place-index">{index + 1}</span>
                              <div>
                                <strong>{item.place_id?.name || 'ไม่ทราบชื่อ'}</strong>
                                <span>{formatMoney(item.estimated_cost)}</span>
                              </div>
                            </div>
                          ))}
                          {items.length > 3 && (
                            <div className="my-trip-more">+{items.length - 3} สถานที่</div>
                          )}
                        </div>
                      ) : (
                        <div className="my-trip-no-place">
                          <MapPin />
                          <span>ไม่มีสถานที่</span>
                        </div>
                      )}
                    </div>

                    <div className="my-trip-actions">
                      <button type="button" className="my-trip-view" onClick={() => viewTrip(trip)}>
                        <Eye />
                        <span>ดูรายละเอียด</span>
                      </button>
                      <button
                        type="button"
                        className="my-trip-delete"
                        onClick={() => deleteTrip(trip._id)}
                        aria-label={`ลบทริป ${trip.trip_name || 'แผนการเดินทาง'}`}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </div>
    </div>
  )
}
