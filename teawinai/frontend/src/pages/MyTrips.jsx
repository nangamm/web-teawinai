import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, DollarSign, MapPin, Trash2, Plus, Eye, Map, TrendingUp, Users } from 'lucide-react'
import { tripsAPI } from '@/services/api'
import { isAuthenticated } from '@/utils/auth'

export function MyTrips() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      return
    }
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      const response = await tripsAPI.getMyTrips()
      console.log('Trips response:', response.data)
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
      setTrips(trips.filter(trip => trip._id !== tripId))
    } catch (error) {
      console.error('Error deleting trip:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">ทริปของฉัน</h1>
              <p className="text-gray-600 text-lg">จัดการแผนการเดินทางของคุณ</p>
            </div>
            <Link 
              to="/" 
              className="inline-flex items-center px-6 py-3 bg-[#116045] text-white font-medium rounded-lg hover:bg-[#0f4a37] transition-colors shadow-md hover:shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              สร้างทริปใหม่
            </Link>
          </div>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-[#116045]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-10 w-10 text-[#116045]" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">ยังไม่มีทริป</h3>
            <p className="text-gray-600 mb-8 text-lg">เริ่มวางแผนการเดินทางครั้งแรกของคุณ!</p>
            <Link 
              to="/" 
              className="inline-flex items-center px-8 py-3 bg-[#116045] text-white font-medium rounded-lg hover:bg-[#0f4a37] transition-colors shadow-md hover:shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              สร้างทริปแรกของคุณ
            </Link>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div key={trip._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
              {/* Trip Header */}
              <div className="bg-gradient-to-r from-[#116045] to-[#0f4a37] p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">
                      {trip.trip_name || 'แผนการเดินทาง'}
                    </h3>
                    <div className="flex items-center text-white/90 text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(trip.trip_date).toLocaleDateString('th-TH', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    trip.status === 'saved' 
                      ? 'bg-white/20 text-white backdrop-blur-sm' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {trip.status === 'saved' ? 'บันทึก' : 'ร่าง'}
                  </span>
                </div>
              </div>

              {/* Trip Content */}
              <div className="p-4 flex-1 flex flex-col">
                {/* Budget Summary */}
                <div className="grid grid-cols-1 gap-2 mb-4">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">งบทั้งหมด</span>
                    <span className="text-sm font-bold text-gray-900">${trip.budget_total}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-600">ใช้ไป</span>
                    <span className="text-sm font-bold text-blue-600">${trip.budget_used}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                    <span className="text-sm text-green-600">คงเหลือ</span>
                    <span className="text-sm font-bold text-green-600">${trip.budget_total - trip.budget_used}</span>
                  </div>
                </div>

                {/* Places Section */}
                <div className="mb-4 flex-1">
                  <div className="flex items-center mb-2">
                    <Map className="h-4 w-4 text-[#116045] mr-1" />
                    <h4 className="font-semibold text-gray-900 text-sm">
                      สถานที่ ({trip.trip_items?.length || 0})
                    </h4>
                  </div>
                  
                  {trip.trip_items && trip.trip_items.length > 0 ? (
                    <div className="space-y-1">
                      {trip.trip_items.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex items-center p-2 bg-gray-50 rounded text-xs">
                          <div className="w-5 h-5 bg-[#116045] text-white rounded-full flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {item.place_id?.name || 'ไม่ทราบชื่อ'}
                            </p>
                            <p className="text-gray-600">
                              ${item.estimated_cost || 0}
                            </p>
                          </div>
                        </div>
                      ))}
                      {trip.trip_items.length > 2 && (
                        <div className="text-center p-2 bg-gray-50 rounded text-xs">
                          <p className="text-gray-600">
                            +{trip.trip_items.length - 2} สถานที่
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <MapPin className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">ไม่มีสถานที่</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto">
                  <button className="flex-1 flex items-center justify-center px-3 py-2 bg-[#116045] text-white text-sm font-medium rounded-lg hover:bg-[#0f4a37] transition-colors">
                    <Eye className="h-3 w-3 mr-1" />
                    ดูรายละเอียด
                  </button>
                  <button
                    onClick={() => deleteTrip(trip._id)}
                    className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
