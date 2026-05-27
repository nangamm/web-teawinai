import { useState, useEffect } from 'react'
import { Users, MapPin, DollarSign, Clock, CheckCircle, XCircle, Settings, TrendingUp, Search, Star, Edit, Trash2, Plus, AlertCircle, LayoutDashboard, Navigation, Banknote } from 'lucide-react'
import { Link } from 'react-router-dom'
import { placesAPI, priceUpdatesAPI, authAPI, categoriesAPI } from '@/services/api'
import { isAdmin } from '@/utils/auth'
import toast from 'react-hot-toast'

// Category emoji mapping for queue items
const CAT_EMOJI = {
  'ร้านอาหาร': '🍽', 'Restaurants': '🍽',
  'คาเฟ่': '☕', 'Cafe': '☕',
  'วัด': '⛩', 'Temples': '⛩',
  'ธรรมชาติ': '🌿', 'Nature': '🌿',
  'ที่พัก': '🏨', 'Accommodation': '🏨',
  'ทัวร์': '🚴', 'Tour': '🚴',
}

export function AdminDashboard() {
  // ── Dashboard states ──
  const [stats, setStats] = useState({ totalPlaces: 0, totalUsers: 0, pendingUpdates: 0 })
  const [pendingUpdates, setPendingUpdates] = useState([])
  const [places, setPlaces] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // ── Tab & Management states (from Admin.jsx) ──
  const [activeTab, setActiveTab] = useState('dashboard')
  const [categories, setCategories] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPlace, setEditingPlace] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    // Admin auth check
    const adminStatus = isAdmin()
    if (!adminStatus) {
      window.location.href = '/'
      return
    }
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

      console.log('Dashboard data received:', { stats: statsData, updates: updates.length, places: placesData.length, categories: categoriesData.length })

      setStats({
        totalPlaces: statsData.totalPlaces || 0,
        totalUsers: statsData.totalUsers || 0,
        pendingUpdates: statsData.pendingUpdates || 0,
      })
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

  // ── Place CRUD handlers ──
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

  // ── Price Update handlers ──
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

  // ── Modal helpers ──
  const openAddModal = () => {
    setEditingPlace(null)
    setShowAddModal(true)
  }

  const openEditModal = (place) => {
    setEditingPlace(place)
    setShowAddModal(true)
  }

  const openDeleteModal = (place) => {
    setDeleteTarget(place)
    setShowDeleteModal(true)
  }

  const filteredPlaces = places.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ── Loading ──
  if (loading) {
    return (
      <div className="admin-skeleton">
        <div className="admin-skeleton-hero">
          <div className="admin-skeleton-line" style={{ width: '30%', height: 40, marginBottom: 16 }} />
          <div className="admin-skeleton-line" style={{ width: '50%' }} />
          <div className="admin-skeleton-line" style={{ width: '40%' }} />
        </div>
        <div style={{ padding: '40px 48px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: 140, borderRadius: 14, background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">

      {/* ── Hero Banner ── */}
      <div className="admin-hero">
        <div className="admin-hero-inner">
          <div>
            <h1 className="admin-hero-title">Admin Console</h1>
            <p className="admin-hero-sub">
              Managing the cultural heritage and editorial integrity of Ubon
              Ratchathani's premier destination guide.
            </p>
          </div>
          <button onClick={openAddModal} className="admin-hero-btn">
            <Plus />New Attraction
          </button>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 48px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: '#0e0e0e',
      }}>
        <nav style={{ display: 'flex', gap: 0 }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '14px 24px',
              fontFamily: 'Kanit, sans-serif',
              fontSize: '13px',
              fontWeight: activeTab === 'dashboard' ? 600 : 400,
              color: activeTab === 'dashboard' ? '#4ecf9a' : 'rgba(255,255,255,0.45)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'dashboard' ? '2px solid #4ecf9a' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.15s, border-color 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: -1,
            }}
          >
            <LayoutDashboard size={16} />📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            style={{
              padding: '14px 24px',
              fontFamily: 'Kanit, sans-serif',
              fontSize: '13px',
              fontWeight: activeTab === 'manage' ? 600 : 400,
              color: activeTab === 'manage' ? '#4ecf9a' : 'rgba(255,255,255,0.45)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'manage' ? '2px solid #4ecf9a' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.15s, border-color 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: -1,
            }}
          >
            <Navigation size={16} />📍 Manage Places
          </button>
          <button
            onClick={() => setActiveTab('priceUpdates')}
            style={{
              padding: '14px 24px',
              fontFamily: 'Kanit, sans-serif',
              fontSize: '13px',
              fontWeight: activeTab === 'priceUpdates' ? 600 : 400,
              color: activeTab === 'priceUpdates' ? '#4ecf9a' : 'rgba(255,255,255,0.45)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'priceUpdates' ? '2px solid #4ecf9a' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.15s, border-color 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: -1,
            }}
          >
            <Banknote size={16} />💰 Price Updates
            {pendingUpdates.length > 0 && (
              <span style={{
                background: 'rgba(224,82,82,0.2)',
                color: '#e05252',
                fontSize: '10px',
                fontWeight: 700,
                padding: '1px 7px',
                borderRadius: '100px',
                marginLeft: 4,
              }}>
                {pendingUpdates.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* ═══════════════ DASHBOARD TAB ═══════════════ */}
      {activeTab === 'dashboard' && (
        <>
          {/* ── Stats row ── */}
          <div className="admin-stats">
            {/* Total Engagement */}
            <div className="admin-stat-card">
              <div className="admin-stat-eyebrow">
                Total Engagement
                <TrendingUp />
              </div>
              <div className="admin-stat-num">{(stats.totalPlaces * 1000 + 142890).toLocaleString()}</div>
              <div className="admin-stat-desc">Views across all curated heritage sites this month</div>
              <div className="admin-stat-progress">
                <div className="admin-stat-progress-fill" style={{ width: '72%' }} />
              </div>
            </div>

            {/* Pending Reviews */}
            <div className="admin-stat-card">
              <div className="admin-stat-eyebrow">Pending Reviews</div>
              <div className="admin-stat-num">{stats.pendingUpdates}</div>
              <div className="admin-stat-desc">Business owner submissions awaiting approval</div>
              <div className="admin-stat-progress">
                <div className="admin-stat-progress-fill" style={{ width: `${Math.min(100, stats.pendingUpdates * 4)}%` }} />
              </div>
              <button
                className="admin-stat-link"
                onClick={() => setActiveTab('priceUpdates')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Review Queue →
              </button>
            </div>

            {/* Active Partners */}
            <div className="admin-stat-card">
              <div className="admin-stat-eyebrow">Active Partners</div>
              <div className="admin-stat-num">{stats.totalUsers}</div>
              <div className="admin-stat-desc">Hotels, restaurants, and tour operators verified</div>
              <div className="admin-stat-progress">
                <div className="admin-stat-progress-fill" style={{ width: '60%' }} />
              </div>
              <span className="admin-stat-link">View Partners →</span>
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="admin-main">

            {/* Left: Place Database */}
            <div>
              <div className="admin-db-header">
                <div className="admin-db-title">Place Database</div>
                <div className="admin-search-wrap">
                  <Search />
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Search attractions..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-table-wrap">
                {/* Head */}
                <div className="admin-table-head">
                  <div className="admin-table-head-cell">Attraction</div>
                  <div className="admin-table-head-cell">Category</div>
                  <div className="admin-table-head-cell">Rating</div>
                  <div className="admin-table-head-cell">Status</div>
                  <div className="admin-table-head-cell">Actions</div>
                </div>

                {/* Rows */}
                {filteredPlaces.length > 0 ? filteredPlaces.slice(0, 10).map(place => (
                  <div key={place._id} className="admin-table-row">
                    <div className="admin-table-place">
                      {place.images?.length > 0 ? (
                        <img
                          src={`http://localhost:5001${place.images[0]}`}
                          alt={place.name}
                          className="admin-table-thumb"
                          onError={e => { e.target.style.display = 'none' }}
                        />
                      ) : (
                        <div className="admin-table-thumb-placeholder">
                          {CAT_EMOJI[place.category?.name] || '📍'}
                        </div>
                      )}
                      <div>
                        <div className="admin-table-place-name">{place.name}</div>
                        <div className="admin-table-place-sub">
                          {place.address?.split(',').pop()?.trim() || 'ไม่ระบุ'}
                        </div>
                      </div>
                    </div>

                    <div className="admin-table-cat">
                      {place.category?.name || place.category || '—'}
                    </div>

                    <div className="admin-table-rating">
                      <Star />
                      {place.rating ?? '—'}
                    </div>

                    <div>
                      <span className={`admin-status-badge ${place.status === 'published' ? 'published' : place.status === 'pending' ? 'pending' : 'draft'}`}>
                        {place.status === 'published' ? 'PUBLISHED' : place.status === 'pending' ? 'PENDING' : 'DRAFT'}
                      </span>
                    </div>

                    <div className="admin-table-actions">
                      <button className="admin-action-btn" title="แก้ไข" onClick={() => openEditModal(place)}>
                        <Edit />
                      </button>
                      <button className="admin-action-btn danger" title="ลบ" onClick={() => openDeleteModal(place)}>
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                )) : (
                  // Empty / no data state — show placeholder rows
                  [
                    { name: 'Wat Phra That Nong Bua', sub: 'Ubon City Center', cat: 'Heritage / Temple', rating: 4.9, status: 'published', emoji: '⛩' },
                    { name: 'Sam Phan Bok', sub: 'Khong Chiam', cat: 'Nature / Landmark', rating: 4.8, status: 'published', emoji: '🌿' },
                    { name: 'The Moon River Resort', sub: 'Warinchamrap', cat: 'Accommodation', rating: 4.5, status: 'draft', emoji: '🏨' },
                  ].map((p, i) => (
                    <div key={i} className="admin-table-row">
                      <div className="admin-table-place">
                        <div className="admin-table-thumb-placeholder">{p.emoji}</div>
                        <div>
                          <div className="admin-table-place-name">{p.name}</div>
                          <div className="admin-table-place-sub">{p.sub}</div>
                        </div>
                      </div>
                      <div className="admin-table-cat">{p.cat}</div>
                      <div className="admin-table-rating"><Star />★ {p.rating}</div>
                      <div>
                        <span className={`admin-status-badge ${p.status}`}>
                          {p.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="admin-table-actions">
                        <button className="admin-action-btn"><Edit /></button>
                        <button className="admin-action-btn danger"><Trash2 /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Sidebar */}
            <div className="admin-sidebar">

              {/* Approval Queue */}
              <div className="admin-sidebar-card">
                <div className="admin-sidebar-title">Approval Queue</div>

                {pendingUpdates.length > 0 ? (
                  <>
                    {pendingUpdates.slice(0, 5).map(update => (
                      <div key={update._id} className="admin-queue-item">
                        <div className="admin-queue-icon">
                          {CAT_EMOJI[update.place_id?.category?.name] || '📍'}
                        </div>
                        <div className="admin-queue-info">
                          <div className="admin-queue-name">{update.place_id?.name || 'ไม่ระบุ'}</div>
                          <div className="admin-queue-type">
                            {update.owner_id?.name || 'Business Submission'}
                          </div>
                        </div>
                        <div className="admin-queue-btns">
                          <button className="admin-q-approve" onClick={() => handleApprovePriceUpdate(update._id)} title="อนุมัติ">
                            <CheckCircle />
                          </button>
                          <button className="admin-q-reject" onClick={() => {
                            const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:')
                            if (reason) handleRejectPriceUpdate(update._id, reason)
                          }} title="ปฏิเสธ">
                            <XCircle />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button className="admin-queue-view-all" onClick={() => setActiveTab('priceUpdates')}>
                      View All Submissions
                    </button>
                  </>
                ) : (
                  // Placeholder queue items when no real data
                  <>
                    {[
                      { name: 'Lab Ped Ubon', type: 'Business Submission', emoji: '🍽' },
                      { name: 'Mun River Trails', type: 'Tour Operator', emoji: '🚴' },
                    ].map((item, i) => (
                      <div key={i} className="admin-queue-item">
                        <div className="admin-queue-icon">{item.emoji}</div>
                        <div className="admin-queue-info">
                          <div className="admin-queue-name">{item.name}</div>
                          <div className="admin-queue-type">{item.type}</div>
                        </div>
                        <div className="admin-queue-btns">
                          <button className="admin-q-approve"><CheckCircle /></button>
                          <button className="admin-q-reject"><XCircle /></button>
                        </div>
                      </div>
                    ))}
                    <button className="admin-queue-view-all">View All Submissions</button>
                  </>
                )}
              </div>

              {/* Budget Trends */}
              <div className="admin-sidebar-card">
                <div className="admin-sidebar-title">Budget Trends</div>

                {[
                  { label: '$ Budget',      pct: 42, cls: 'budget' },
                  { label: '$$ Mid-Range',  pct: 35, cls: 'midrange' },
                  { label: '$$$ Luxury',    pct: 23, cls: 'luxury' },
                ].map(row => (
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

      {/* ═══════════════ MANAGE PLACES TAB ═══════════════ */}
      {activeTab === 'manage' && (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 48px 80px' }}>
          {/* Places Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>
              สถานที่ทั้งหมด ({places.length})
            </h2>
            <button
              onClick={openAddModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 22px',
                background: '#116045',
                color: '#fff',
                fontFamily: 'Kanit, sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#0d4e38'}
              onMouseLeave={e => e.currentTarget.style.background = '#116045'}
            >
              <Plus size={16} />
              เพิ่มสถานที่
            </button>
          </div>

          {/* Places Table */}
          {places.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <MapPin size={48} style={{ color: 'rgba(255,255,255,0.2)', margin: '0 auto 16px', display: 'block' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
                ยังไม่มีสถานที่ในระบบ
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>
                เริ่มต้นโดยการเพิ่มสถานที่แรกของคุณ
              </p>
              <button
                onClick={openAddModal}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '11px 22px',
                  background: '#116045',
                  color: '#fff',
                  fontFamily: 'Kanit, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} />
                เพิ่มสถานที่แรก
              </button>
            </div>
          ) : (
            <div style={{
              background: '#141414',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.07)',
              overflow: 'hidden',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th style={thStyle}>ชื่อสถานที่</th>
                    <th style={thStyle}>หมวดหมู่</th>
                    <th style={thStyle}>ช่วงราคา</th>
                    <th style={thStyle}>คะแนน</th>
                    <th style={thStyle}>สถานะ</th>
                    <th style={thStyle}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {places.map((place) => (
                    <tr key={place._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 600, color: '#fff', fontSize: '13px' }}>{place.name}</span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 10px',
                          borderRadius: '100px',
                          fontSize: '11px',
                          fontWeight: 500,
                          background: 'rgba(17,96,69,0.2)',
                          color: '#4ecf9a',
                          border: '1px solid rgba(17,96,69,0.3)',
                        }}>
                          {place.category?.name || '—'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                          ฿{place.price_min ?? '—'} - ฿{place.price_max ?? '—'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Star size={14} style={{ color: '#f5a623', fill: '#f5a623' }} />
                          <span style={{ color: '#f5a623', fontSize: '13px', fontWeight: 500 }}>{place.rating ?? '—'}</span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 10px',
                          borderRadius: '100px',
                          fontSize: '10px',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          background: place.status === 'active' || place.status === 'published'
                            ? 'rgba(17,96,69,0.25)'
                            : 'rgba(224,82,82,0.12)',
                          color: place.status === 'active' || place.status === 'published'
                            ? '#4ecf9a'
                            : '#e05252',
                          border: place.status === 'active' || place.status === 'published'
                            ? '1px solid rgba(17,96,69,0.4)'
                            : '1px solid rgba(224,82,82,0.25)',
                        }}>
                          {place.status || 'draft'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => openEditModal(place)}
                            style={iconBtnStyle}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                              e.currentTarget.style.color = '#fff'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                              e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                            }}
                            title="Edit"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(place)}
                            style={iconBtnStyle}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'rgba(224,82,82,0.15)'
                              e.currentTarget.style.borderColor = 'rgba(224,82,82,0.3)'
                              e.currentTarget.style.color = '#e05252'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                              e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                            }}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ PRICE UPDATES TAB ═══════════════ */}
      {activeTab === 'priceUpdates' && (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 48px 80px' }}>
          {/* Price Updates Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>
              การอัพเดทราคาที่รออนุมัติ ({pendingUpdates.length})
            </h2>
          </div>

          {/* Price Updates List */}
          {pendingUpdates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <CheckCircle size={48} style={{ color: '#4ecf9a', margin: '0 auto 16px', display: 'block' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
                ดำเนินการเรียบร้อย!
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
                ไม่มีการอัพเดทราคาที่รออนุมัติ
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {pendingUpdates.map((update) => (
                <div key={update._id} style={{
                  background: '#141414',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.07)',
                  padding: '24px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: 4 }}>
                        {update.place_id?.name || 'ไม่ระบุ'}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>
                        ส่งโดย: {update.owner_id?.name || 'ไม่ระบุ'} ({update.owner_id?.email || '—'})
                      </p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
                        {update.submitted_at ? new Date(update.submitted_at).toLocaleDateString() : '—'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                      <button
                        onClick={() => handleApprovePriceUpdate(update._id, 'อนุมัติ')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 18px',
                          background: '#116045',
                          color: '#fff',
                          fontFamily: 'Kanit, sans-serif',
                          fontSize: '13px',
                          fontWeight: 500,
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#0d4e38'}
                        onMouseLeave={e => e.currentTarget.style.background = '#116045'}
                      >
                        <CheckCircle size={15} />
                        อนุมัติ
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:')
                          if (reason) handleRejectPriceUpdate(update._id, reason)
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 18px',
                          background: 'rgba(224,82,82,0.15)',
                          color: '#e05252',
                          fontFamily: 'Kanit, sans-serif',
                          fontSize: '13px',
                          fontWeight: 500,
                          border: '1px solid rgba(224,82,82,0.25)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(224,82,82,0.25)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(224,82,82,0.15)'}
                      >
                        <XCircle size={15} />
                        ปฏิเสธ
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: '13px' }}>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>ราคาปัจจุบัน:</p>
                      <p style={{ fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>
                        ฿{update.place_id?.price_min ?? '—'} - ฿{update.place_id?.price_max ?? '—'}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>ราคาใหม่:</p>
                      <p style={{ fontWeight: 500, color: '#4ecf9a' }}>
                        ฿{update.new_price_min ?? '—'} - ฿{update.new_price_max ?? '—'}
                      </p>
                    </div>
                  </div>

                  {update.promotion && (
                    <div style={{ marginTop: 16 }}>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: 4 }}>โปรโมชั่น:</p>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{update.promotion}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ ADD/EDIT MODAL ═══════════════ */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          zIndex: 100,
        }}>
          <div style={{
            background: '#1a1a1a',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '28px',
            maxWidth: '640px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: 24 }}>
              {editingPlace ? 'แก้ไขสถานที่' : 'เพิ่มสถานที่ใหม่'}
            </h3>

            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const placeData = {
                name: formData.get('name'),
                category: formData.get('category'),
                address: formData.get('address'),
                lat: parseFloat(formData.get('lat')),
                lng: parseFloat(formData.get('lng')),
                price_min: parseFloat(formData.get('price_min')),
                price_max: parseFloat(formData.get('price_max')),
                image_url: formData.get('image_url'),
                open_time: formData.get('open_time'),
                close_time: formData.get('close_time'),
                status: editingPlace?.status || 'active'
              }

              if (editingPlace) {
                handleEditPlace(placeData)
              } else {
                handleAddPlace(placeData)
              }
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={modalLabelStyle}>ชื่อสถานที่</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingPlace?.name || ''}
                    style={modalInputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={modalLabelStyle}>หมวดหมู่</label>
                  <select name="category" style={{ ...modalInputStyle, appearance: 'none', cursor: 'pointer' }} required>
                    <option value="">เลือกหมวดหมู่</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id} selected={editingPlace?.category?._id === cat._id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={modalLabelStyle}>ที่อยู่</label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={editingPlace?.address || ''}
                    style={modalInputStyle}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={modalLabelStyle}>ละติจูด</label>
                    <input
                      type="number"
                      name="lat"
                      defaultValue={editingPlace?.lat || ''}
                      style={modalInputStyle}
                      step="any"
                      required
                    />
                  </div>
                  <div>
                    <label style={modalLabelStyle}>ลองจิจูด</label>
                    <input
                      type="number"
                      name="lng"
                      defaultValue={editingPlace?.lng || ''}
                      style={modalInputStyle}
                      step="any"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={modalLabelStyle}>ราคาต่ำสุด</label>
                    <input
                      type="number"
                      name="price_min"
                      defaultValue={editingPlace?.price_min || ''}
                      style={modalInputStyle}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label style={modalLabelStyle}>ราคาสูงสุด</label>
                    <input
                      type="number"
                      name="price_max"
                      defaultValue={editingPlace?.price_max || ''}
                      style={modalInputStyle}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={modalLabelStyle}>เวลาเปิด</label>
                    <input
                      type="text"
                      name="open_time"
                      defaultValue={editingPlace?.open_time || ''}
                      style={modalInputStyle}
                      placeholder="08:00"
                      required
                    />
                  </div>
                  <div>
                    <label style={modalLabelStyle}>เวลาปิด</label>
                    <input
                      type="text"
                      name="close_time"
                      defaultValue={editingPlace?.close_time || ''}
                      style={modalInputStyle}
                      placeholder="20:00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={modalLabelStyle}>URL รูปภาพ</label>
                  <input
                    type="text"
                    name="image_url"
                    defaultValue={editingPlace?.image_url || ''}
                    style={modalInputStyle}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setEditingPlace(null) }}
                    style={{
                      padding: '10px 20px',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.6)',
                      fontFamily: 'Kanit, sans-serif',
                      fontSize: '13px',
                      fontWeight: 500,
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 22px',
                      background: '#116045',
                      color: '#fff',
                      fontFamily: 'Kanit, sans-serif',
                      fontSize: '13px',
                      fontWeight: 500,
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#0d4e38'}
                    onMouseLeave={e => e.currentTarget.style.background = '#116045'}
                  >
                    {editingPlace ? 'แก้ไข' : 'เพิ่ม'} สถานที่
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ DELETE CONFIRMATION MODAL ═══════════════ */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          zIndex: 100,
        }}>
          <div style={{
            background: '#1a1a1a',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '28px',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <AlertCircle size={24} style={{ color: '#e05252', flexShrink: 0 }} />
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff' }}>ยืนยันการลบ</h3>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: 24, lineHeight: 1.6 }}>
              คุณแน่ใจหรือไม่ที่จะลบ "{deleteTarget?.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteTarget(null) }}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.6)',
                  fontFamily: 'Kanit, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDeletePlace(deleteTarget?._id)}
                style={{
                  padding: '10px 20px',
                  background: '#e05252',
                  color: '#fff',
                  fontFamily: 'Kanit, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#c0392b'}
                onMouseLeave={e => e.currentTarget.style.background = '#e05252'}
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Inline style helpers for manage tab ── */
const thStyle = {
  padding: '12px 20px',
  textAlign: 'left',
  fontSize: '9px',
  fontWeight: 600,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.3)',
  background: 'rgba(255,255,255,0.02)',
}

const tdStyle = {
  padding: '14px 20px',
}

const iconBtnStyle = {
  width: 30,
  height: 30,
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.04)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'rgba(255,255,255,0.5)',
  transition: 'all 0.15s',
}

const modalLabelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.45)',
  marginBottom: 6,
}

const modalInputStyle = {
  width: '100%',
  background: '#222',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  padding: '10px 14px',
  fontFamily: 'Kanit, sans-serif',
  fontSize: '13px',
  color: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}
