import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Star, Settings, LogOut, Camera, Upload, Crop, ZoomIn, ZoomOut, Move } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'

export function Profile() {
  const [user, setUser] = useState(null)
  const [userPlaces, setUserPlaces] = useState([])
  const [userReviews, setUserReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('places')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ username: '', bio: '', avatar: '', preferences: [] })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [isCropping, setIsCropping] = useState(false)
  const [cropData, setCropData] = useState({ scale: 1, positionX: 0, positionY: 0, rotation: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const cropContainerRef = useRef(null)
  const imageRef = useRef(null)
  const navigate = useNavigate()

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) { navigate('/login'); return }
      const response = await authAPI.getMe()
      setUser(response.data.user)
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      toast.error('ไม่สามารถดึงข้อมูลผู้ใช้ได้')
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => { fetchUserData() }, [fetchUserData])

  useEffect(() => {
    if (activeTab === 'places' && user) fetchUserPlaces()
    else if (activeTab === 'reviews' && user) fetchUserReviews()
  }, [activeTab, user])

  const fetchUserPlaces = async () => {
    try {
      const response = await authAPI.getUserPlaces()
      setUserPlaces(response.data.places)
    } catch (error) {
      console.error('Failed to fetch user places:', error)
      toast.error('ไม่สามารถดึงข้อมูลสถานที่ได้')
    }
  }

  const fetchUserReviews = async () => {
    try {
      const response = await authAPI.getUserReviews()
      setUserReviews(response.data.reviews)
    } catch (error) {
      console.error('Failed to fetch user reviews:', error)
      toast.error('ไม่สามารถดึงข้อมูลรีวิวได้')
    }
  }

  const handleEditProfile = () => {
    setEditForm({ username: user.username || '', bio: user.bio || '', avatar: user.avatar || '', preferences: user.preferences || [] })
    setIsEditing(true)
  }

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData()
      formData.append('username', editForm.username)
      formData.append('bio', editForm.bio)
      formData.append('preferences', JSON.stringify(editForm.preferences))
      if (avatarFile) {
        formData.append('avatar', avatarFile)
      } else if (editForm.avatar) {
        formData.append('avatarUrl', editForm.avatar)
      }
      const response = await authAPI.updateProfile(formData)
      setUser(response.data.user)
      setIsEditing(false)
      toast.success('อัพเดทโปรไฟล์สำเร็จ')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('ไม่สามารถอัพเดทโปรไฟล์ได้')
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditForm({ username: '', bio: '', avatar: '', preferences: [] })
    setAvatarFile(null)
    setAvatarPreview('')
    setIsCropping(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handlePreferenceToggle = (pref) => {
    setEditForm(prev => ({
      ...prev,
      preferences: prev.preferences.includes(pref)
        ? prev.preferences.filter(p => p !== pref)
        : [...prev.preferences, pref]
    }))
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('ออกจากระบบสำเร็จ')
    navigate('/')
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        setAvatarFile(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          setAvatarPreview(e.target.result)
          setCropData({ scale: 1, positionX: 0, positionY: 0, rotation: 0 })
          setIsCropping(true)
        }
        reader.readAsDataURL(file)
      } else {
        toast.error('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
      }
    }
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - cropData.positionX, y: e.clientY - cropData.positionY })
  }

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    setCropData(prev => ({ ...prev, positionX: e.clientX - dragStart.x, positionY: e.clientY - dragStart.y }))
  }, [dragStart.x, dragStart.y, isDragging])

  const handleZoom = (delta) => {
    setCropData(prev => ({ ...prev, scale: Math.max(0.5, Math.min(3, prev.scale + delta)) }))
  }

  const handleWheel = (e) => {
    e.preventDefault()
    handleZoom(e.deltaY > 0 ? -0.1 : 0.1)
  }

  const handleCrop = () => {
    if (!canvasRef.current || !avatarPreview) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      const size = 200
      canvas.width = size
      canvas.height = size
      ctx.save()
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.clearRect(0, 0, size, size)
      const imgWidth = img.width * cropData.scale
      const imgHeight = img.height * cropData.scale
      ctx.translate(size / 2 + cropData.positionX, size / 2 + cropData.positionY)
      ctx.rotate((cropData.rotation * Math.PI) / 180)
      ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight)
      ctx.restore()
      canvas.toBlob((blob) => {
        if (blob) {
          setAvatarFile(new File([blob], 'avatar.png', { type: 'image/png' }))
          setAvatarPreview(canvas.toDataURL('image/png'))
          setIsCropping(false)
        }
      }, 'image/png', 1.0)
    }
    img.src = avatarPreview
  }

  const handleCancelCrop = () => {
    setIsCropping(false)
    setAvatarFile(null)
    setAvatarPreview('')
    setCropData({ scale: 1, positionX: 0, positionY: 0, rotation: 0 })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false)
    const handleGlobalMouseMove = (e) => { if (isDragging) handleMouseMove(e) }
    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp)
      document.addEventListener('mousemove', handleGlobalMouseMove)
    }
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
    }
  }, [isDragging, dragStart, handleMouseMove])

  const getCategoryIcon = (category) => {
    const icons = { temple: '🏛️', beach: '🏖️', mountain: '⛰️', city: '🏙️', museum: '🏛️', park: '🌳', market: '🛍️', restaurant: '🍜', other: '📍' }
    return icons[category] || '📍'
  }

  const avatarSrc = user
    ? (user.avatar
        ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:5001${user.avatar}`)
        : `https://ui-avatars.com/api/?name=${user.username}&background=116045&color=fff&size=100`)
    : ''

  // ── Loading ──
  if (loading) {
    return (
      <div className="profile-skeleton">
        <div className="profile-skeleton-hero">
          <div className="profile-skeleton-banner" />
          <div className="profile-skeleton-body">
            <div className="profile-skeleton-avatar" />
            <div className="profile-skeleton-line" style={{ width: '30%' }} />
            <div className="profile-skeleton-line" style={{ width: '50%' }} />
            <div className="profile-skeleton-line" style={{ width: '70%' }} />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-inner" style={{ textAlign: 'center', paddingTop: 40 }}>
          <h2 style={{ fontSize: 16, color: '#555' }}>ไม่พบข้อมูลผู้ใช้</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-inner">

        {/* ── Hero Card ── */}
        <div className="profile-hero">
          <div className="profile-hero-banner">
            <div className="profile-hero-banner-pattern" />
          </div>
          <div className="profile-hero-body">
            <div className="profile-avatar-wrap">
              <img
                src={avatarSrc}
                alt={user.username}
                className="profile-avatar"
                onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=116045&color=fff&size=100` }}
              />
              <button className="profile-avatar-cam" onClick={() => fileInputRef.current?.click()}>
                <Camera />
              </button>
            </div>

            <div className="profile-hero-info-row">
              <div>
                <div className="profile-name">{user.username}</div>
                <div className="profile-email">{user.email}</div>
                {user.bio && <div className="profile-bio">{user.bio}</div>}
                <div className="profile-join">
                  <MapPin />
                  สมัครเมื่อ {new Date(user.joinDate).toLocaleDateString('th-TH')}
                </div>
              </div>

              <div className="profile-btns">
                <button className="profile-btn-edit" onClick={handleEditProfile}>
                  <Settings />แก้ไขโปรไฟล์
                </button>
                <button className="profile-btn-logout" onClick={handleLogout}>
                  <LogOut />ออกจากระบบ
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            {[
              { num: userPlaces.length, label: 'สถานที่ที่เพิ่ม' },
              { num: userReviews.length, label: 'รีวิว' },
              { num: user.stats.followers, label: 'ผู้ติดตาม' },
              { num: user.stats.following, label: 'กำลังติดตาม' },
            ].map(s => (
              <div key={s.label} className="profile-stat">
                <div className="profile-stat-num">{s.num}</div>
                <div className="profile-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="profile-tabs">
          {[
            { key: 'places', label: `สถานที่ที่เพิ่ม (${userPlaces.length})` },
            { key: 'reviews', label: `รีวิว (${userReviews.length})` },
            { key: 'preferences', label: 'ความสนใจ' },
          ].map(t => (
            <button
              key={t.key}
              className={`profile-tab${activeTab === t.key ? ' active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Places ── */}
        {activeTab === 'places' && (
          <div className="profile-places-grid">
            {userPlaces.length > 0 ? userPlaces.map(place => (
              <div key={place._id} className="profile-place-card" onClick={() => navigate(`/places/${place._id}`)}>
                {place.images?.length > 0 ? (
                  <img
                    src={place.images[0].startsWith('http') ? place.images[0] : `http://localhost:5001${place.images[0]}`}
                    alt={place.name}
                    className="profile-place-img"
                    onError={e => {
                      const svg = '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#e2e8f0"/></svg>'
                      e.target.src = `data:image/svg+xml;base64,${btoa(svg)}`
                    }}
                  />
                ) : (
                  <div className="profile-place-img-placeholder"><MapPin /></div>
                )}
                <div className="profile-place-body">
                  <div className="profile-place-title-row">
                    <span className="profile-place-emoji">{getCategoryIcon(place.category)}</span>
                    <span className="profile-place-name">{place.name}</span>
                  </div>
                  <div className="profile-place-footer">
                    <div className="profile-place-rating">
                      <Star />
                      <span style={{ fontWeight: 600, color: '#111' }}>{place.rating}</span>
                      <span style={{ color: '#bbb' }}>({place.reviewCount})</span>
                    </div>
                    <button
                      className="profile-place-detail-btn"
                      onClick={e => { e.stopPropagation(); navigate(`/places/${place._id}`) }}
                    >
                      ดูรายละเอียด →
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="profile-empty">
                <MapPin />
                <div className="profile-empty-title">ยังไม่มีสถานที่ที่เพิ่ม</div>
                <div className="profile-empty-sub">เริ่มเพิ่มสถานที่ท่องเที่ยวเพื่อแชร์กับผู้คนอื่น</div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Reviews ── */}
        {activeTab === 'reviews' && (
          userReviews.length > 0 ? (
            <div>
              {userReviews.map(review => (
                <div key={review._id} className="profile-review-card">
                  <div className="profile-review-top">
                    <span className="profile-review-place">{review.placeName}</span>
                    <div className="profile-review-rating">
                      <Star />
                      {review.rating}
                    </div>
                  </div>
                  <div className="profile-review-comment">{review.comment}</div>
                  <div className="profile-review-date">{new Date(review.createdAt).toLocaleDateString('th-TH')}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="profile-empty">
              <Star />
              <div className="profile-empty-title">ยังไม่มีรีวิว</div>
              <div className="profile-empty-sub">เริ่มรีวิวสถานที่ท่องเที่ยวเพื่อแชร์ประสบการณ์ของคุณ</div>
            </div>
          )
        )}

        {/* ── Tab: Preferences ── */}
        {activeTab === 'preferences' && (
          <div className="profile-prefs-card">
            <div className="profile-prefs-title">ความสนใจ</div>
            <div>
              {user.preferences.map((pref, i) => (
                <span key={i} className="profile-pref-chip">{pref}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {isEditing && (
        <div className="profile-modal-backdrop">
          <div className="profile-modal">
            <div className="profile-modal-title">แก้ไขโปรไฟล์</div>

            <div className="profile-modal-field">
              <label className="profile-modal-label">ชื่อผู้ใช้</label>
              <input
                type="text"
                className="profile-modal-input"
                value={editForm.username}
                onChange={e => setEditForm(p => ({ ...p, username: e.target.value }))}
                placeholder="กรอกชื่อผู้ใช้"
              />
            </div>

            <div className="profile-modal-field">
              <label className="profile-modal-label">ประวัติ</label>
              <textarea
                className="profile-modal-input profile-modal-textarea"
                value={editForm.bio}
                onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                placeholder="แนะนำตัวเองสั้นๆ"
              />
            </div>

            <div className="profile-modal-field">
              <label className="profile-modal-label">รูปโปรไฟล์</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} id="avatar-upload" />
                <label htmlFor="avatar-upload" className="profile-modal-upload-label" style={{ flex: 1 }}>
                  <Upload />เลือกรูปภาพ
                </label>
                {avatarPreview && (
                  <div className="profile-modal-avatar-preview">
                    <img src={avatarPreview} alt="preview" />
                  </div>
                )}
              </div>
            </div>

            <div className="profile-modal-field">
              <label className="profile-modal-label">ความสนใจ</label>
              <div>
                {['beach', 'mountain', 'temple', 'city', 'museum', 'park', 'market', 'restaurant'].map(pref => (
                  <button
                    key={pref}
                    type="button"
                    className={`profile-pref-toggle ${editForm.preferences.includes(pref) ? 'on' : 'off'}`}
                    onClick={() => handlePreferenceToggle(pref)}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            <div className="profile-modal-footer">
              <button className="profile-modal-cancel" onClick={handleCancelEdit}>ยกเลิก</button>
              <button className="profile-modal-save" onClick={handleSaveProfile}>บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Crop Modal ── */}
      {isCropping && (
        <div className="crop-modal-backdrop">
          <div className="crop-modal">
            <div className="crop-modal-title">แก้ไขรูปโปรไฟล์</div>

            <div
              className="crop-circle-wrap"
              ref={cropContainerRef}
              onMouseDown={handleMouseDown}
              onWheel={handleWheel}
            >
              {avatarPreview && (
                <img
                  ref={imageRef}
                  src={avatarPreview}
                  alt="Crop preview"
                  style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                    transform: `translate(${cropData.positionX}px, ${cropData.positionY}px) scale(${cropData.scale}) rotate(${cropData.rotation}deg)`,
                    transformOrigin: 'center',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none',
                  }}
                  draggable={false}
                />
              )}
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
            </div>

            <div className="crop-zoom-row">
              <button className="crop-zoom-btn" onClick={() => handleZoom(-0.1)} title="ซูมออก"><ZoomOut /></button>
              <input
                type="range" min="0.5" max="3" step="0.1"
                value={cropData.scale}
                onChange={e => setCropData(p => ({ ...p, scale: parseFloat(e.target.value) }))}
                className="crop-range"
              />
              <button className="crop-zoom-btn" onClick={() => handleZoom(0.1)} title="ซูมเข้า"><ZoomIn /></button>
            </div>

            <div className="crop-hint">
              <Move />
              ลากเพื่อย้าย · Scroll เพื่อซูม
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="crop-footer">
              <button className="crop-cancel" onClick={handleCancelCrop}>ยกเลิก</button>
              <button className="crop-save" onClick={handleCrop}>
                <Crop />บันทึกรูป
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
