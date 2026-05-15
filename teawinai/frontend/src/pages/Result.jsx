import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MapPin, Clock, DollarSign, Star, ExternalLink, Save, RotateCcw, Edit3 } from 'lucide-react'
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
    // Get trip plan from location state
    if (location.state?.tripPlan) {
      setTripPlan(location.state.tripPlan)
      // Set default trip name based on current date
      const defaultName = `ทริป ${new Date().toLocaleDateString('th-TH', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      })}`
      setTripName(defaultName)
    }
    setLoading(false)
  }, [location])

  const handleSaveTrip = async () => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }

    if (!tripName.trim()) {
      alert('กรุณาระบุชื่อทริป')
      return
    }

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
      // Show success message or redirect
      navigate('/my-trips')
    } catch (error) {
      console.error('Error saving trip:', error)
      alert('เกิดข้อผิดพลาดในการบันทึกทริป: ' + (error.response?.data?.message || error.message))
    } finally {
      setSaving(false)
    }
  }

  const handlePlaceDetail = (placeId) => {
    navigate(`/places/${placeId}`)
  }


  const getBudgetPercentage = () => {
    if (!tripPlan) return 0
    return (tripPlan.budget_used / tripPlan.budget_total) * 100
  }

  const getBudgetColor = () => {
    const percentage = getBudgetPercentage()
    if (percentage < 50) return 'bg-green-500'
    if (percentage < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!tripPlan) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No trip plan found</h2>
        <p className="text-gray-600 mb-8">Please go back and create a trip plan first.</p>
        <button 
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">แผนการเดินทางของคุณ</h1>
          <p className="text-lg text-gray-600 mb-6">นี่คือแผนการท่องเที่ยวที่ปรับให้เหมาะกับคุณ</p>
          
          {/* Trip Name Input */}
          <div className="max-w-md mx-auto">
            <label className="block text-left text-sm font-medium text-gray-700 mb-2">
              ชื่อทริปของคุณ
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Edit3 className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="ตั้งชื่อทริปของคุณ..."
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#116045] focus:border-[#116045] block text-base placeholder-gray-400"
                maxLength={100}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 text-left">
              ตั้งชื่อทริปเพื่อให้จดจำง่ายขึ้น (สูงสุด 100 ตัวอักษร)
            </p>
          </div>
        </div>

        {/* Budget Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">สรุปงบประมาณ</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm text-gray-600">งบประมาณทั้งหมด</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">${tripPlan.budget_total}</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm text-gray-600">ใช้ไปแล้ว</span>
              </div>
              <p className="text-2xl font-bold text-green-600">${tripPlan.budget_used}</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-sm text-gray-600">คงเหลือ</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">${tripPlan.budget_remaining}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${getBudgetColor()}`}
              style={{ width: `${getBudgetPercentage()}%` }}
            />
          </div>
          <p className="text-center mt-2 text-sm text-gray-600">
            ใช้งบประมาณไป {getBudgetPercentage().toFixed(1)}%
          </p>
        </div>

        {/* Selected Places */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">สถานที่ที่เลือก</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tripPlan.selectedPlaces.map((place, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                {/* Place Header with Image */}
                <div className="relative h-48 bg-gray-200">
                  {place.images && place.images.length > 0 ? (
                    <img 
                      src={`http://localhost:5001${place.images[0]}`} 
                      alt={place.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const svg = '<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#e2e8f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="20" fill="#64748b">No Image</text></svg>';
                        e.target.src = `data:image/svg+xml;base64,${btoa(svg)}`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <MapPin className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-90 text-gray-800">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {place.category?.name || 'Category'}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{place.name}</h3>
                    </div>
                    <div className="text-right ml-2 flex-shrink-0">
                      {place.is_free ? (
                        <>
                          <p className="text-xl font-bold text-green-600">ฟรี</p>
                          <p className="text-xs text-gray-500">ไม่เสียค่าใช้จ่าย</p> 
                        </>
                      ) : (
                        <>
                          <p className="text-xl font-bold text-green-600">${place.selectedCost || place.price_min}</p>
                          <p className="text-xs text-gray-500">ประมาณการ</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Place Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 mr-2 text-yellow-400 flex-shrink-0" />
                      <span>คะแนน {place.rating || 'ไม่มีคะแนน'}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span>
                        {place.opening_hours && place.opening_hours['จันทร์'] 
                          ? `${place.opening_hours['จันทร์'].open || '-'} - ${place.opening_hours['จันทร์'].close || '-'}`
                          : place.open_time && place.close_time 
                            ? `${place.open_time} - ${place.close_time}`
                            : 'ไม่ระบุเวลา'
                        }
                      </span>
                    </div>

                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                      <span className="line-clamp-1 flex-1 min-w-0">{place.address}</span>
                    </div>
                  </div>
                </div>

                {/* Place Actions */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <button 
                    onClick={() => handlePlaceDetail(place._id)}
                    className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium py-2 transition-colors"
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleSaveTrip}
            disabled={saving}
            className="btn btn-primary flex items-center justify-center disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'กำลังบันทึก...' : 'บันทึกแผนนี้'}
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="btn btn-secondary flex items-center justify-center"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            วางแผนใหม่
          </button>
        </div>
      </div>
    </div>
  )
}
