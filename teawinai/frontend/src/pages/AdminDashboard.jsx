import { useState, useEffect } from 'react'
import { Users, MapPin, DollarSign, Clock, CheckCircle, XCircle, Settings, TrendingUp, Search, Star, Edit, Trash2, Plus, AlertCircle, LayoutDashboard, Navigation, Banknote } from 'lucide-react'
import { Link } from 'react-router-dom'
import { placesAPI, priceUpdatesAPI, authAPI, categoriesAPI } from '@/services/api'
import { isAdmin } from '@/utils/auth'
import toast from 'react-hot-toast'

const CAT_EMOJI = {
  'ร้านอาหาร': '🍽', 'Restaurants': '🍽',
  'คาเฟ่': '☕', 'Cafe': '☕',
  'วัด': '⛩', 'Temples': '⛩',
  'ธรรมชาติ': '🌿', 'Nature': '🌿',
  'ที่พัก': '🏨', 'Accommodation': '🏨',
  'ทัวร์': '🚴', 'Tour': '🚴',
}

export function AdminDashboard() {
  const [stats, setStats] = useState({ totalPlaces: 0, totalUsers: 0, pendingUpdates: 0 })
  const [pendingUpdates, setPendingUpdates] = useState([])
  const [places, setPlaces] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [categories, setCategories] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPlace, setEditingPlace] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isFree, setIsFree] = useState('false')
  const [openingHours, setOpeningHours] = useState({
    จันทร์: { open: '', close: '', closed: false },
    อังคาร: { open: '', close: '', closed: false },
    พุธ: { open: '', close: '', closed: false },
    พฤหัสบดี: { open: '', close: '', closed: false },
    ศุกร์: { open: '', close: '', closed: false },
    เสาร์: { open: '', close: '', closed: false },
    อาทิตย์: { open: '', close: '', closed: false }
  })
  const [images, setImages] = useState([])

  const normalizeOpeningHours = (raw) => {
    const defaultHours = {
      จันทร์: { open: '', close: '', closed: false },
      อังคาร: { open: '', close: '', closed: false },
      พุธ: { open: '', close: '', closed: false },
      พฤหัสบดี: { open: '', close: '', closed: false },
      ศุกร์: { open: '', close: '', closed: false },
      เสาร์: { open: '', close: '', closed: false },
      อาทิตย์: { open: '', close: '', closed: false }
    }
    let data = raw
    if (typeof data === 'string') {
      try { data = JSON.parse(data) } catch { return defaultHours }
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) return defaultHours
    const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']
    const isComplete = days.every(day => data[day] && typeof data[day] === 'object')
    if (isComplete) {
      const result = {}
      days.forEach(day => {
        result[day] = { open: data[day].open || '', close: data[day].close || '', closed: !!data[day].closed }
      })
      return result
    }
    return defaultHours
  }

  useEffect(() => {
    if (!isAdmin()) { window.location.href = '/'; return }
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, updatesResponse, placesRes, categoriesRes] = await Promise.all([
        authAPI.getDashboardStats(),
        priceUpdatesAPI.getPendingUpdates(),
        placesAPI.getPlaces({ limit: 100 }),
        categoriesAPI.getCategories()
      ])
      const statsData = statsResponse.data?.stats || statsResponse.data || {}
      const updates = updatesResponse.data?.data || updatesResponse.data || []
      const placesData = placesRes.data?.data || placesRes.data || []
      const categoriesData = categoriesRes.data?.data || categoriesRes.data || []

      setStats({ totalPlaces: statsData.totalPlaces || 0, totalUsers: statsData.totalUsers || 0, pendingUpdates: statsData.pendingUpdates || 0 })
      setPendingUpdates(updates)
      setPlaces(placesData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('ไม่สามารถดึงข้อมูลแดชบอร์ดได้')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPlace = async (placeData) => {
    try {
      await placesAPI.createPlace(placeData)
      setShowAddModal(false)
      fetchDashboardData()
      toast.success('เพิ่มสถานที่สำเร็จ')
    } catch (error) {
      console.error('Error adding place:', error)
      toast.error('ไม่สามารถเพิ่มสถานที่ได้')
    }
  }

  const handleEditPlace = async (placeData) => {
    try {
      await placesAPI.updatePlace(editingPlace._id, placeData)
      setEditingPlace(null)
      setShowAddModal(false)
      fetchDashboardData()
      toast.success('แก้ไขสถานที่สำเร็จ')
    } catch (error) {
      console.error('Error updating place:', error)
      toast.error('ไม่สามารถแก้ไขสถานที่ได้')
    }
  }

  const handleDeletePlace = async (placeId) => {
    try {
      await placesAPI.deletePlace(placeId)
      setShowDeleteModal(false)
      setDeleteTarget(null)
      fetchDashboardData()
      toast.success('ลบสถานที่สำเร็จ')
    } catch (error) {
      console.error('Error deleting place:', error)
      toast.error('ไม่สามารถลบสถานที่ได้')
    }
  }

  const handleApprovePriceUpdate = async (updateId, reviewNote) => {
    try {
      await priceUpdatesAPI.approvePriceUpdate(updateId, { review_note: reviewNote || 'อนุมัติ' })
      setPendingUpdates(prev => prev.filter(u => u._id !== updateId))
      setStats(prev => ({ ...prev, pendingUpdates: Math.max(0, prev.pendingUpdates - 1) }))
      toast.success('อนุมัติการอัพเดทราคาสำเร็จ')
      fetchDashboardData()
    } catch (error) {
      console.error('Error approving update:', error)
      toast.error('ไม่สามารถอนุมัติการอัพเดทได้')
    }
  }

  const handleRejectPriceUpdate = async (updateId, reviewNote) => {
    try {
      await priceUpdatesAPI.rejectPriceUpdate(updateId, { review_note: reviewNote })
      setPendingUpdates(prev => prev.filter(u => u._id !== updateId))
      setStats(prev => ({ ...prev, pendingUpdates: Math.max(0, prev.pendingUpdates - 1) }))
      toast.success('ปฏิเสธการอัพเดทราคาสำเร็จ')
      fetchDashboardData()
    } catch (error) {
      console.error('Error rejecting update:', error)
      toast.error('ไม่สามารถปฏิเสธการอัพเดทได้')
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (images.length + files.length > 5) { toast.error('สามารถอัปโหลดได้สูงสุด 5 รูปเท่านั้น'); return }
    const newImages = files.map(file => {
      if (file.type.startsWith('image/')) return { file, preview: URL.createObjectURL(file), name: file.name }
      return null
    }).filter(Boolean)
    setImages(prev => [...prev, ...newImages])
    e.target.value = ''
  }

  const removeImage = (index) => {
    setImages(prev => {
      const next = [...prev]
      if (next[index].preview) URL.revokeObjectURL(next[index].preview)
      next.splice(index, 1)
      return next
    })
  }

  const openAddModal = () => {
    setEditingPlace(null)
    setIsFree('false')
    setOpeningHours({ จันทร์: { open:'',close:'',closed:false }, อังคาร: { open:'',close:'',closed:false }, พุธ: { open:'',close:'',closed:false }, พฤหัสบดี: { open:'',close:'',closed:false }, ศุกร์: { open:'',close:'',closed:false }, เสาร์: { open:'',close:'',closed:false }, อาทิตย์: { open:'',close:'',closed:false } })
    setImages([])
    setShowAddModal(true)
  }

  const openEditModal = (place) => {
    setEditingPlace(place)
    setIsFree(place.is_free ? 'true' : 'false')
    setOpeningHours(normalizeOpeningHours(place.opening_hours))
    setImages(place.images?.map((img, idx) => ({
      file: null,
      preview: img.startsWith('http') ? img : `http://localhost:5001${img}`,
      name: `image_${idx}`,
      existingUrl: img
    })) || [])
    setShowAddModal(true)
  }

  const openDeleteModal = (place) => { setDeleteTarget(place); setShowDeleteModal(true) }

  const filteredPlaces = places.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleFormSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const isFreePlace = isFree === 'true'
    const fd = new FormData()
    fd.append('name', formData.get('name'))
    fd.append('category', formData.get('category'))
    fd.append('address', formData.get('address'))
    fd.append('price_min', isFreePlace ? 0 : parseFloat(formData.get('price_min')))
    fd.append('price_max', isFreePlace ? 0 : parseFloat(formData.get('price_max')))
    fd.append('is_free', isFreePlace ? 'true' : 'false')
    fd.append('opening_hours', JSON.stringify(openingHours))
    fd.append('status', editingPlace?.status || 'active')
    images.forEach(img => {
      if (img.file) fd.append('images', img.file)
      else if (img.existingUrl) fd.append('existing_images', img.existingUrl)
    })
    editingPlace ? handleEditPlace(fd) : handleAddPlace(fd)
  }

  const updateHour = (day, field, value) => {
    if (field === 'open' || field === 'close') {
      let v = value.replace(/[^\d]/g, '')
      if (v.length >= 3) v = v.slice(0, 2) + ':' + v.slice(2, 4)
      setOpeningHours(prev => ({ ...prev, [day]: { ...prev[day], [field]: v } }))
    } else {
      setOpeningHours(prev => ({ ...prev, [day]: { ...prev[day], closed: !prev[day].closed } }))
    }
  }

  if (loading) {
    return (
      <div className="admin-skeleton">
        <div className="admin-skeleton-hero">
          <div className="admin-skeleton-line" style={{ width: '30%', height: 40, marginBottom: 16 }} />
          <div className="admin-skeleton-line" style={{ width: '50%' }} />
          <div className="admin-skeleton-line" style={{ width: '40%' }} />
        </div>
        <div style={{ padding: '40px 48px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 140, borderRadius: 14, background: 'rgba(255,255,255,0.04)' }} />)}
        </div>
      </div>
    )
  }

  const PLACEHOLDER_PLACES = [
    { name: 'Wat Phra That Nong Bua', sub: 'Ubon City Center', cat: 'Heritage / Temple', rating: 4.9, status: 'published', emoji: '⛩' },
    { name: 'Sam Phan Bok', sub: 'Khong Chiam', cat: 'Nature / Landmark', rating: 4.8, status: 'published', emoji: '🌿' },
    { name: 'The Moon River Resort', sub: 'Warinchamrap', cat: 'Accommodation', rating: 4.5, status: 'draft', emoji: '🏨' },
  ]

  const PLACEHOLDER_QUEUE = [
    { name: 'Lab Ped Ubon', type: 'Business Submission', emoji: '🍽' },
    { name: 'Mun River Trails', type: 'Tour Operator', emoji: '🚴' },
  ]

  return (
    <div className="admin-page">

      {/* ── Hero ── */}
      <div className="admin-hero">
        <div className="admin-hero-inner">
          <div>
            <h1 className="admin-hero-title">Admin Console</h1>
            <p className="admin-hero-sub">
              Managing the cultural heritage and editorial integrity of Ubon
              Ratchathani's premier destination guide.
            </p>
          </div>
          <button className="admin-hero-btn" onClick={openAddModal}>
            <Plus />New Attraction
          </button>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="admin-tab-nav">
        <nav className="admin-tab-bar">
          <button className={`admin-tab-btn${activeTab === 'dashboard' ? ' active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={16} />Dashboard
          </button>
          <button className={`admin-tab-btn${activeTab === 'priceUpdates' ? ' active' : ''}`} onClick={() => setActiveTab('priceUpdates')}>
            <Banknote size={16} />Price Updates
            {pendingUpdates.length > 0 && <span className="admin-tab-badge">{pendingUpdates.length}</span>}
          </button>
        </nav>
      </div>

      {/* ══════ DASHBOARD TAB ══════ */}
      {activeTab === 'dashboard' && (
        <>
          <div className="admin-stats">
            <div className="admin-stat-card">
              <div className="admin-stat-eyebrow">Total Engagement <TrendingUp /></div>
              <div className="admin-stat-num">{(stats.totalPlaces * 1000 + 142890).toLocaleString()}</div>
              <div className="admin-stat-desc">Views across all curated heritage sites this month</div>
              <div className="admin-stat-progress"><div className="admin-stat-progress-fill" style={{ width: '72%' }} /></div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-eyebrow">Pending Reviews</div>
              <div className="admin-stat-num">{stats.pendingUpdates}</div>
              <div className="admin-stat-desc">Business owner submissions awaiting approval</div>
              <div className="admin-stat-progress"><div className="admin-stat-progress-fill" style={{ width: `${Math.min(100, stats.pendingUpdates * 4)}%` }} /></div>
              <button className="admin-stat-link" onClick={() => setActiveTab('priceUpdates')} style={{ background:'none', border:'none', cursor:'pointer', padding:0 }}>
                Review Queue →
              </button>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-eyebrow">สถานที่ทั้งหมด</div>
              <div className="admin-stat-num">{stats.totalPlaces}</div>
              <div className="admin-stat-desc">สถานที่ท่องเที่ยวทั้งหมดในระบบ</div>
              <div className="admin-stat-progress"><div className="admin-stat-progress-fill" style={{ width: `${Math.min(100, stats.totalPlaces * 2)}%` }} /></div>
              <span className="admin-stat-link">ดูรายละเอียด →</span>
            </div>
          </div>

          <div className="admin-main">
            {/* Place Database */}
            <div>
              <div className="admin-db-header">
                <div className="admin-db-title">Place Database</div>
                <div className="admin-search-wrap">
                  <Search />
                  <input type="text" className="admin-search-input" placeholder="Search attractions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
              </div>

              <div className="admin-table-wrap">
                <div className="admin-table-head">
                  <div className="admin-table-head-cell">Attraction</div>
                  <div className="admin-table-head-cell">Category</div>
                  <div className="admin-table-head-cell">Rating</div>
                  <div className="admin-table-head-cell">Status</div>
                  <div className="admin-table-head-cell">Actions</div>
                </div>

                {(filteredPlaces.length > 0 ? filteredPlaces.slice(0,10) : PLACEHOLDER_PLACES).map((place, i) => {
                  const isReal = !!place._id
                  return (
                    <div key={place._id || i} className="admin-table-row">
                      <div className="admin-table-place">
                        {isReal && place.images?.length > 0
                          ? <img src={`http://localhost:5001${place.images[0]}`} alt={place.name} className="admin-table-thumb" onError={e => { e.target.style.display='none' }} />
                          : <div className="admin-table-thumb-placeholder">{isReal ? (CAT_EMOJI[place.category?.name] || '📍') : place.emoji}</div>
                        }
                        <div>
                          <div className="admin-table-place-name">{place.name}</div>
                          <div className="admin-table-place-sub">{isReal ? (place.address?.split(',').pop()?.trim() || 'ไม่ระบุ') : place.sub}</div>
                        </div>
                      </div>
                      <div className="admin-table-cat">{isReal ? (place.category?.name || '—') : place.cat}</div>
                      <div className="admin-table-rating"><Star />{isReal ? (place.rating ?? '—') : `★ ${place.rating}`}</div>
                      <div>
                        <span className={`admin-status-badge ${isReal ? (place.status === 'published' ? 'published' : place.status === 'pending' ? 'pending' : 'draft') : place.status}`}>
                          {isReal ? (place.status === 'published' ? 'PUBLISHED' : place.status === 'pending' ? 'PENDING' : 'DRAFT') : place.status?.toUpperCase()}
                        </span>
                      </div>
                      <div className="admin-table-actions">
                        <button className="admin-action-btn" onClick={() => isReal && openEditModal(place)}><Edit /></button>
                        <button className="admin-action-btn danger" onClick={() => isReal && openDeleteModal(place)}><Trash2 /></button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div className="admin-sidebar">
              <div className="admin-sidebar-card">
                <div className="admin-sidebar-title">Approval Queue</div>
                {(pendingUpdates.length > 0 ? pendingUpdates.slice(0,5) : PLACEHOLDER_QUEUE).map((item, i) => {
                  const isReal = !!item._id
                  return (
                    <div key={item._id || i} className="admin-queue-item">
                      <div className="admin-queue-icon">{isReal ? (CAT_EMOJI[item.place_id?.category?.name] || '📍') : item.emoji}</div>
                      <div className="admin-queue-info">
                        <div className="admin-queue-name">{isReal ? (item.place_id?.name || 'ไม่ระบุ') : item.name}</div>
                        <div className="admin-queue-type">{isReal ? (item.owner_id?.name || 'Business Submission') : item.type}</div>
                      </div>
                      <div className="admin-queue-btns">
                        <button className="admin-q-approve" onClick={() => isReal && handleApprovePriceUpdate(item._id)}><CheckCircle /></button>
                        <button className="admin-q-reject" onClick={() => { if (!isReal) return; const r = prompt('กรุณาระบุเหตุผล:'); if (r) handleRejectPriceUpdate(item._id, r) }}><XCircle /></button>
                      </div>
                    </div>
                  )
                })}
                <button className="admin-queue-view-all" onClick={() => setActiveTab('priceUpdates')}>View All Submissions</button>
              </div>

              <div className="admin-sidebar-card">
                <div className="admin-sidebar-title">Budget Trends</div>
                {[{ label:'$ Budget', pct:42, cls:'budget' }, { label:'$$ Mid-Range', pct:35, cls:'midrange' }, { label:'$$$ Luxury', pct:23, cls:'luxury' }].map(row => (
                  <div key={row.label} className="admin-trend-row">
                    <div className="admin-trend-top">
                      <span className="admin-trend-label">{row.label}</span>
                      <span className="admin-trend-pct">{row.pct}%</span>
                    </div>
                    <div className="admin-trend-track">
                      <div className={`admin-trend-fill ${row.cls}`} style={{ width: `${row.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════ PRICE UPDATES TAB ══════ */}
      {activeTab === 'priceUpdates' && (
        <div className="admin-price-tab">
          <div className="admin-price-tab-header">
            <div className="admin-price-tab-title">การอัพเดทราคาที่รออนุมัติ ({pendingUpdates.length})</div>
          </div>

          {pendingUpdates.length === 0 ? (
            <div className="admin-price-empty">
              <CheckCircle />
              <div className="admin-price-empty-title">ดำเนินการเรียบร้อย!</div>
              <div className="admin-price-empty-sub">ไม่มีการอัพเดทราคาที่รออนุมัติ</div>
            </div>
          ) : pendingUpdates.map(update => (
            <div key={update._id} className="admin-update-card">
              <div className="admin-update-card-top">
                <div>
                  <div className="admin-update-card-name">{update.place_id?.name || 'ไม่ระบุ'}</div>
                  <div className="admin-update-card-by">ส่งโดย: {update.owner_id?.name || 'ไม่ระบุ'} ({update.owner_id?.email || '—'})</div>
                  <div className="admin-update-card-date">{update.submitted_at ? new Date(update.submitted_at).toLocaleDateString() : '—'}</div>
                </div>
                <div className="admin-update-card-btns">
                  <button className="admin-update-approve-btn" onClick={() => handleApprovePriceUpdate(update._id, 'อนุมัติ')}>
                    <CheckCircle />อนุมัติ
                  </button>
                  <button className="admin-update-reject-btn" onClick={() => { const r = prompt('กรุณาระบุเหตุผล:'); if (r) handleRejectPriceUpdate(update._id, r) }}>
                    <XCircle />ปฏิเสธ
                  </button>
                </div>
              </div>

              <div className="admin-update-price-grid">
                <div>
                  <div className="admin-update-price-label">ราคาปัจจุบัน:</div>
                  <div className="admin-update-price-val">฿{update.place_id?.price_min ?? '—'} - ฿{update.place_id?.price_max ?? '—'}</div>
                </div>
                <div>
                  <div className="admin-update-price-label">ราคาใหม่:</div>
                  <div className="admin-update-price-new">฿{update.new_price_min ?? '—'} - ฿{update.new_price_max ?? '—'}</div>
                </div>
              </div>

              {update.promotion && (
                <div className="admin-update-promo">
                  <div className="admin-update-promo-label">โปรโมชั่น:</div>
                  <div className="admin-update-promo-text">{update.promotion}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══════ ADD / EDIT MODAL ══════ */}
      {showAddModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="admin-modal-title">{editingPlace ? 'แก้ไขสถานที่' : 'เพิ่มสถานที่'}</div>

            <form onSubmit={handleFormSubmit} className="admin-modal-form">
              <div>
                <label className="admin-modal-label">ชื่อสถานที่</label>
                <input type="text" name="name" defaultValue={editingPlace?.name || ''} className="admin-modal-input" required />
              </div>

              <div>
                <label className="admin-modal-label">หมวดหมู่</label>
                <select name="category" defaultValue={editingPlace?.category?._id || ''} className="admin-modal-input" required>
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>)}
                </select>
              </div>

              <div>
                <label className="admin-modal-label">ประเภทสถานที่</label>
                <select value={isFree} onChange={e => setIsFree(e.target.value)} className="admin-modal-input">
                  <option value="false">เสียค่าใช้จ่าย</option>
                  <option value="true">ไม่เสียค่าใช้จ่าย</option>
                </select>
                <div className="admin-modal-hint">{isFree === 'true' ? 'สถานที่ที่ไม่เสียค่าใช้จ่าย' : 'กรุณาระบุช่วงราคา'}</div>
              </div>

              <div>
                <label className="admin-modal-label">ที่อยู่</label>
                <input type="text" name="address" defaultValue={editingPlace?.address || ''} className="admin-modal-input" required />
              </div>

              <div className="admin-modal-two-col">
                <div>
                  <label className="admin-modal-label">ราคาต่ำสุด</label>
                  <input type="number" name="price_min" defaultValue={editingPlace?.price_min || ''} className="admin-modal-input" min="0" step="0.01" required disabled={isFree === 'true'} />
                </div>
                <div>
                  <label className="admin-modal-label">ราคาสูงสุด</label>
                  <input type="number" name="price_max" defaultValue={editingPlace?.price_max || ''} className="admin-modal-input" min="0" step="0.01" required disabled={isFree === 'true'} />
                </div>
              </div>

              <div>
                <label className="admin-modal-label">เวลาเปิด-ปิด</label>
                {Object.entries(openingHours).map(([day, hours]) => (
                  <div key={day} className="admin-hours-row">
                    <span className="admin-hours-day">{day}</span>
                    {!hours.closed && (
                      <div className="admin-hours-inputs">
                        <div className="admin-hours-time-group">
                          <span className="admin-hours-time-label">เปิด</span>
                          <input type="text" value={hours.open} onChange={e => updateHour(day, 'open', e.target.value)} className="admin-modal-input" placeholder="08:00" maxLength="5" style={{ padding: '6px 10px', fontSize: 12 }} />
                        </div>
                        <span className="admin-hours-sep">-</span>
                        <div className="admin-hours-time-group">
                          <span className="admin-hours-time-label">ปิด</span>
                          <input type="text" value={hours.close} onChange={e => updateHour(day, 'close', e.target.value)} className="admin-modal-input" placeholder="20:00" maxLength="5" style={{ padding: '6px 10px', fontSize: 12 }} />
                        </div>
                      </div>
                    )}
                    {hours.closed && <span className="admin-hours-closed-text">หยุดทั้งวัน</span>}
                    <div className="admin-hours-closed-wrap">
                      <input type="checkbox" checked={hours.closed} onChange={() => updateHour(day, 'closed')} style={{ width:14, height:14, cursor:'pointer' }} />
                      <span className="admin-hours-closed-label">หยุด</span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="admin-modal-label">รูปภาพ (สูงสุด 5 รูป)</label>
                <div className="admin-upload-area">
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display:'none' }} id="image-upload" />
                  <label htmlFor="image-upload" className="admin-upload-label">
                    <div className="admin-upload-icon">📷</div>
                    <div className="admin-upload-text">คลิกเพื่ออัปโหลดรูปภาพ</div>
                    <div className="admin-upload-hint">รองรับ JPG, PNG, GIF สูงสุด 5 รูป</div>
                  </label>
                </div>
                {images.length > 0 && (
                  <div className="admin-img-grid">
                    {images.map((img, idx) => (
                      <div key={idx} className="admin-img-thumb-wrap">
                        <img src={img.preview} alt={`รูปที่ ${idx+1}`} className="admin-img-thumb" />
                        <button type="button" className="admin-img-remove" onClick={() => removeImage(idx)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-modal-cancel" onClick={() => { setShowAddModal(false); setEditingPlace(null) }}>ยกเลิก</button>
                <button type="submit" className="admin-modal-submit">{editingPlace ? 'แก้ไข' : 'บันทึก'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════ DELETE MODAL ══════ */}
      {showDeleteModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-delete-modal">
            <div className="admin-delete-modal-header">
              <AlertCircle />
              <span className="admin-delete-modal-title">ยืนยันการลบ</span>
            </div>
            <div className="admin-delete-modal-body">
              คุณแน่ใจหรือไม่ที่จะลบ "{deleteTarget?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้
            </div>
            <div className="admin-delete-modal-footer">
              <button className="admin-modal-cancel" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null) }}>ยกเลิก</button>
              <button className="admin-delete-btn" onClick={() => handleDeletePlace(deleteTarget?._id)}>ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}