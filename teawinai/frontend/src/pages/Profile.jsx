import { useState, useEffect, useRef } from 'react'
import { User, MapPin, Star, Settings, LogOut, Camera, Upload, Crop, ZoomIn, ZoomOut, Move } from 'lucide-react'
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
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    avatar: '',
    preferences: []
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [isCropping, setIsCropping] = useState(false)
  const [cropData, setCropData] = useState({
    scale: 1,
    positionX: 0,
    positionY: 0,
    rotation: 0
  })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const cropContainerRef = useRef(null)
  const imageRef = useRef(null)
  const navigate = useNavigate()


  useEffect(() => {
    fetchUserData()
  }, [navigate])

  useEffect(() => {
    if (activeTab === 'places' && user) {
      fetchUserPlaces()
    } else if (activeTab === 'reviews' && user) {
      fetchUserReviews()
    }
  }, [activeTab, user])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      const response = await authAPI.getMe()
      setUser(response.data.user)
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      toast.error('ไม่สามารถดึงข้อมูลผู้ใช้ได้')
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

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
    setEditForm({
      username: user.username || '',
      bio: user.bio || '',
      avatar: user.avatar || '',
      preferences: user.preferences || []
    })
    setIsEditing(true)
  }

  const handleSaveProfile = async () => {
    try {
      console.log('Saving profile with avatar:', avatarFile ? 'File' : 'None')
      
      const formData = new FormData()
      formData.append('username', editForm.username)
      formData.append('bio', editForm.bio)
      formData.append('preferences', JSON.stringify(editForm.preferences))
      
      if (avatarFile) {
        console.log('Appending avatar file:', avatarFile.name, avatarFile.type, avatarFile.size)
        formData.append('avatar', avatarFile)
      } else if (editForm.avatar) {
        formData.append('avatarUrl', editForm.avatar)
      }

      const response = await authAPI.updateProfile(formData)
      console.log('Profile update response:', response.data)
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
    setEditForm({
      username: '',
      bio: '',
      avatar: '',
      preferences: []
    })
    setAvatarFile(null)
    setAvatarPreview('')
    setIsCropping(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePreferenceToggle = (preference) => {
    setEditForm(prev => ({
      ...prev,
      preferences: prev.preferences.includes(preference)
        ? prev.preferences.filter(p => p !== preference)
        : [...prev.preferences, preference]
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
          setCropData({
            scale: 1,
            positionX: 0,
            positionY: 0,
            rotation: 0
          })
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
    setDragStart({
      x: e.clientX - cropData.positionX,
      y: e.clientY - cropData.positionY
    })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    
    setCropData(prev => ({
      ...prev,
      positionX: e.clientX - dragStart.x,
      positionY: e.clientY - dragStart.y
    }))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoom = (delta) => {
    setCropData(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(3, prev.scale + delta))
    }))
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    handleZoom(delta)
  }

  const handleCrop = () => {
    if (!canvasRef.current || !avatarPreview) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Create a circular mask
      const size = 200
      canvas.width = size
      canvas.height = size
      
      // Create circular clipping path
      ctx.save()
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      
      // Clear canvas with transparent background
      ctx.clearRect(0, 0, size, size)
      
      // Calculate image dimensions and position
      const imgWidth = img.width * cropData.scale
      const imgHeight = img.height * cropData.scale
      const centerX = size / 2 + cropData.positionX
      const centerY = size / 2 + cropData.positionY
      
      // Draw the image with transformations
      ctx.translate(centerX, centerY)
      ctx.rotate((cropData.rotation * Math.PI) / 180)
      ctx.drawImage(
        img,
        -imgWidth / 2,
        -imgHeight / 2,
        imgWidth,
        imgHeight
      )
      ctx.restore()
      
      // Convert to PNG blob
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], 'avatar.png', { type: 'image/png' })
          setAvatarFile(croppedFile)
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
    setCropData({
      scale: 1,
      positionX: 0,
      positionY: 0,
      rotation: 0
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false)
    const handleGlobalMouseMove = (e) => {
      if (isDragging) {
        handleMouseMove(e)
      }
    }

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp)
      document.addEventListener('mousemove', handleGlobalMouseMove)
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
    }
  }, [isDragging, dragStart])

  const getCategoryIcon = (category) => {
    const icons = {
      temple: '🏛️',
      beach: '🏖️',
      mountain: '⛰️',
      city: '🏙️',
      museum: '🏛️',
      park: '🌳',
      market: '🛍️',
      restaurant: '🍜',
      other: '📍'
    }
    return icons[category] || '📍'
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-300 rounded-lg mb-8"></div>
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบข้อมูลผู้ใช้</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative">
            <img
              src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:5001${user.avatar}`) : `https://ui-avatars.com/api/?name=${user.username}&background=116045&color=fff&size=100`}
              alt={user.username}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=116045&color=fff&size=100`
              }}
            />
            <button className="absolute bottom-0 right-0 bg-[#116045] text-white p-2 rounded-full hover:bg-[#0f4a37] shadow-lg">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
            <p className="text-gray-600 mb-2">{user.email}</p>
            <p className="text-gray-700 mb-4">{user.bio}</p>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                สมัครเมื่อ {new Date(user.joinDate).toLocaleDateString('th-TH')}
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <button 
              onClick={handleEditProfile}
              className="btn bg-[#116045] text-white hover:bg-[#0f4a37] flex items-center justify-center"
            >
              <Settings className="h-4 w-4 mr-2" />
              แก้ไขโปรไฟล์
            </button>
            <button
              onClick={handleLogout}
              className="btn bg-red-600 text-white hover:bg-red-700 flex items-center justify-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              ออกจากระบบ
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{userPlaces.length}</div>
            <div className="text-sm text-gray-600">สถานที่ที่เพิ่ม</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{userReviews.length}</div>
            <div className="text-sm text-gray-600">รีวิว</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{user.stats.followers}</div>
            <div className="text-sm text-gray-600">ผู้ติดตาม</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{user.stats.following}</div>
            <div className="text-sm text-gray-600">กำลังติดตาม</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('places')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'places'
                ? 'border-[#116045] text-[#116045]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            สถานที่ที่เพิ่ม ({userPlaces.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reviews'
                ? 'border-[#116045] text-[#116045]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            รีวิว ({userReviews.length})
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preferences'
                ? 'border-[#116045] text-[#116045]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ความสนใจ
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'places' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userPlaces.length > 0 ? (
              userPlaces.map((place) => (
                <div key={place._id} className="card hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gray-200">
                    {place.images && place.images.length > 0 ? (
                      <img
                        src={place.images[0].startsWith('http') 
                          ? place.images[0] 
                          : `http://localhost:5001${place.images[0]}`}
                        alt={place.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const svg = '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#e2e8f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="20" fill="#64748b">No Image</text></svg>';
                          e.target.src = `data:image/svg+xml;base64,${btoa(svg)}`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                        <MapPin className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xl">{getCategoryIcon(place.category)}</span>
                      <h3 className="font-semibold text-gray-900">{place.name}</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{place.rating}</span>
                        <span className="text-sm text-gray-500 ml-1">({place.reviewCount})</span>
                      </div>
                      <button 
                        onClick={() => navigate(`/places/${place._id}`)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        ดูรายละเอียด
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีสถานที่ที่เพิ่ม</h3>
                <p className="text-gray-500">เริ่มเพิ่มสถานที่ท่องเที่ยวเพื่อแชร์กับผู้คนอื่น</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="text-center py-12">
            {userReviews.length > 0 ? (
              <div className="space-y-4">
                {userReviews.map((review) => (
                  <div key={review._id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">{review.placeName}</h3>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(review.createdAt).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีรีวิว</h3>
                <p className="text-gray-500">เริ่มรีวิวสถานที่ท่องเที่ยวเพื่อแชร์ประสบการณ์ของคุณ</p>
              </>
            )}
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ความสนใจ</h3>
            <div className="flex flex-wrap gap-2">
              {user.preferences.map((pref, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {pref}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Profile Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">แก้ไขโปรไฟล์</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อผู้ใช้
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกชื่อผู้ใช้"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ประวัติ
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="แนะนำตัวเองสั้นๆ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รูปโปรไฟล์
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="flex items-center justify-center w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#116045]"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      เลือกรูปภาพ
                    </label>
                  </div>
                  {avatarPreview && (
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300">
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ความสนใจ
                </label>
                <div className="flex flex-wrap gap-2">
                  {['beach', 'mountain', 'temple', 'city', 'museum', 'park', 'market', 'restaurant'].map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => handlePreferenceToggle(pref)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        editForm.preferences.includes(pref)
                          ? 'bg-[#116045] text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-[#116045] text-white rounded-md hover:bg-[#0f4a37]"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discord-style Avatar Cropper Modal */}
      {isCropping && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-white text-xl font-bold mb-4">แก้ไขรูปโปรไฟล์</h2>
            
            {/* Cropping Area */}
            <div className="mb-6">
              <div 
                ref={cropContainerRef}
                className="relative w-64 h-64 mx-auto bg-gray-800 rounded-full overflow-hidden cursor-move"
                onMouseDown={handleMouseDown}
                onWheel={handleWheel}
              >
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  {avatarPreview && (
                    <img
                      ref={imageRef}
                      src={avatarPreview}
                      alt="Crop preview"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        transform: `translate(${cropData.positionX}px, ${cropData.positionY}px) scale(${cropData.scale}) rotate(${cropData.rotation}deg)`,
                        transformOrigin: 'center',
                        cursor: isDragging ? 'grabbing' : 'grab'
                      }}
                      draggable={false}
                    />
                  )}
                </div>
                
                {/* Circular mask overlay */}
                <div className="absolute inset-0 rounded-full pointer-events-none">
                  <div className="absolute inset-0 rounded-full border-2 border-white opacity-50"></div>
                </div>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="mb-6">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleZoom(-0.1)}
                  className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                  title="ซูมออก"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                
                <div className="flex-1">
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={cropData.scale}
                    onChange={(e) => setCropData(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>50%</span>
                    <span>{Math.round(cropData.scale * 100)}%</span>
                    <span>300%</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleZoom(0.1)}
                  className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                  title="ซูมเข้า"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-6 text-center">
              <p className="text-gray-400 text-sm">
                <Move className="inline h-4 w-4 mr-1" />
                ลากเพื่อย้าย | Scroll เพื่อซูม
              </p>
            </div>

            <canvas ref={canvasRef} className="hidden" />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelCrop}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleCrop}
                className="px-4 py-2 bg-[#116045] text-white rounded-md hover:bg-[#0f4a37] transition-colors flex items-center"
              >
                <Crop className="h-4 w-4 mr-2" />
                บันทึกรูป
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
