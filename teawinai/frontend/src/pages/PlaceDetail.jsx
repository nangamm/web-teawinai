import { useState, useEffect } from 'react'
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
  User
} from 'lucide-react'
import { placesAPI } from '@/services/api'
import toast from 'react-hot-toast'


export function PlaceDetail() {
  const { id } = useParams()
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlace()
  }, [])

  const fetchPlace = async () => {
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
  }

  const handleNavigate = () => {
    if (place.map_link) {
      window.open(place.map_link, '_blank')
    } else {
      toast.error('ไม่มีข้อมูลแผนที่')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-300 rounded-lg mb-6"></div>
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!place) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบสถานที่ท่องเที่ยว</h2>
          <Link to="/places" className="btn btn-primary">
            กลับไปหน้าสถานที่ท่องเที่ยว
          </Link>
        </div>
      </div>
    )
  }

  const getCategoryIcon = (category) => {
    // Backend returns category object: { name: 'วัด', icon: '🏛️' }
    if (category && typeof category === 'object') {
      return category.icon || '📍'
    }
    
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

  const getCategoryName = (category) => {
    // Backend returns category object: { name: 'วัด', icon: '🏛️' }
    if (category && typeof category === 'object') {
      return category.name || 'อื่นๆ'
    }
    
    const names = {
      temple: 'วัดวาอาราม',
      beach: 'ชายหาด',
      mountain: 'ภูเขา',
      city: 'เมือง',
      museum: 'พิพิธภัณฑ์',
      park: 'สวนสาธารณะ',
      market: 'ตลาด',
      restaurant: 'ร้านอาหาร',
      other: 'อื่นๆ'
    }
    return names[category] || category || 'อื่นๆ'
  }

  const getPriceRangeText = (price_min, is_free) => {
    if (is_free) return 'ฟรี'
    if (price_min === 0) return 'ฟรี'
    if (price_min <= 100) return 'ราคาถูก'
    if (price_min <= 300) return 'ราคาปานกลาง'
    return 'ราคาสูง'
  }

  const getDayName = (day) => {
    const days = {
      monday: 'จันทร์',
      tuesday: 'อังคาร',
      wednesday: 'พุธ',
      thursday: 'พฤหัสบดี',
      friday: 'ศุกร์',
      saturday: 'เสาร์',
      sunday: 'อาทิตย์'
    }
    return days[day] || day
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm">
          <li><Link to="/" className="text-gray-500 hover:text-gray-700">หน้าแรก</Link></li>
          <li className="text-gray-400">/</li>
          <li><Link to="/places" className="text-gray-500 hover:text-gray-700">สถานที่ท่องเที่ยว</Link></li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900">{place.name}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">{getCategoryIcon(place.category)}</span>
              <h1 className="text-3xl font-bold text-gray-900">{place.name}</h1>
            </div>
            <div className="flex items-center space-x-4 text-gray-600">
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {getCategoryName(place.category)}
              </span>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {place.address?.split('จังหวัด')[1]?.trim() || 'ไม่ระบุ'}
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="font-medium">{place.rating}</span>
                <span className="ml-1">(0 รีวิว)</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Heart className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share2 className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Images */}
          <div className="mb-8">
            {place.images && place.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Main Image */}
                <div className="md:col-span-2">
                  <img
                    src={`http://localhost:5001${place.images[0]}`}
                    alt={place.name}
                    className="w-full h-96 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/800/600'
                    }}
                  />
                </div>
                
                {/* Additional Images */}
                {place.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={`http://localhost:5001${image}`}
                      alt={`${place.name} - รูปที่ ${index + 2}`}
                      className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {
                        // Could add lightbox functionality here
                        window.open(`http://localhost:5001${image}`, '_blank')
                      }}
                      onError={(e) => {
                        e.target.src = '/api/placeholder/400/300'
                      }}
                    />
                    {index === 3 && place.images.length > 5 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">+{place.images.length - 5}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">ยังไม่มีรูปภาพ</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">รายละเอียด</h2>
            <p className="text-gray-700 leading-relaxed">{place.address}</p>
          </div>

          {/* Opening Hours */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">เวลาเปิด-ปิด</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {place.opening_hours && Object.keys(place.opening_hours).length > 0 ? (
                <div className="space-y-2">
                  {['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'].map((day) => {
                    const dayHours = place.opening_hours[day]
                    return (
                      <div key={day} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-700 w-16">{day}</span>
                          {dayHours?.closed ? (
                            <span className="text-sm text-red-600 font-medium">หยุด</span>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Clock className="h-3 w-3 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {dayHours?.open || '-'} - {dayHours?.close || '-'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    เวลาเปิด-ปิด
                  </div>
                  <span className="font-medium">{place.open_time} - {place.close_time}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Quick Info */}
          <div className="card mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลสำคัญ</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    ช่วงราคา
                  </div>
                  <span className="font-medium">{getPriceRangeText(place.price_min, place.is_free)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Star className="h-4 w-4 mr-2" />
                    คะแนนรีวิว
                  </div>
                  <span className="font-medium">{place.rating}/5.0</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    เพิ่มเมื่อ
                  </div>
                  <span className="font-medium">
                    {new Date(place.createdAt).toLocaleDateString('th-TH')}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button 
                  onClick={handleNavigate}
                  className="btn btn-primary w-full"
                >
                  <Navigation className="inline-block mr-2 h-4 w-4" />
                  นำทาง
                </button>
                <button className="btn btn-secondary w-full">
                  แชร์สถานที่
                </button>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ที่ตั้ง</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 text-gray-600 mt-1" />
                  <div>
                    <p className="text-gray-700">{place.address}</p>
                    <p className="text-gray-600">{place.address?.split('จังหวัด')[1]?.trim() || 'ไม่ระบุ'}</p>
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
