import { useState, useEffect } from 'react'
import { Users, MapPin, DollarSign, Clock, CheckCircle, XCircle, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { placesAPI, priceUpdatesAPI, authAPI } from '@/services/api'
import toast from 'react-hot-toast'

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPlaces: 0,
    totalUsers: 0,
    pendingUpdates: 0
  })
  const [pendingUpdates, setPendingUpdates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const statsResponse = await authAPI.getDashboardStats()
      const statsData = statsResponse.data?.stats || statsResponse.data || {}

      // Fetch pending price updates
      const updatesResponse = await priceUpdatesAPI.getPendingUpdates()
      const updates = updatesResponse.data?.data || updatesResponse.data || []

      console.log('Dashboard data received:', {
        stats: statsData,
        updates: updates,
        statsResponse: statsResponse.data,
        updatesResponse: updatesResponse.data
      })

      setStats({
        totalPlaces: statsData.totalPlaces || 0,
        totalUsers: statsData.totalUsers || 0,
        pendingUpdates: statsData.pendingUpdates || 0
      })
      setPendingUpdates(updates)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      console.error('Error response:', error.response?.data)
      toast.error('ไม่สามารถดึงข้อมูลแดชบอร์ดได้')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (updateId) => {
    try {
      console.log('Approving price update:', updateId)
      const response = await priceUpdatesAPI.approvePriceUpdate(updateId, { review_note: 'อนุมัติ' })
      console.log('Approve response:', response.data)
      
      setPendingUpdates(pendingUpdates.filter(update => update._id !== updateId))
      setStats(prev => ({ ...prev, pendingUpdates: prev.pendingUpdates - 1 }))
      toast.success('อนุมัติการอัพเดทราคาสำเร็จ')
      fetchDashboardData() // Refresh data
    } catch (error) {
      console.error('Error approving update:', error)
      console.error('Error response:', error.response?.data)
      toast.error('ไม่สามารถอนุมัติการอัพเดทได้')
    }
  }

  const handleReject = async (updateId) => {
    const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:')
    if (!reason) return

    try {
      console.log('Rejecting price update:', updateId, 'reason:', reason)
      const response = await priceUpdatesAPI.rejectPriceUpdate(updateId, { review_note: reason })
      console.log('Reject response:', response.data)
      
      setPendingUpdates(pendingUpdates.filter(update => update._id !== updateId))
      setStats(prev => ({ ...prev, pendingUpdates: prev.pendingUpdates - 1 }))
      toast.success('ปฏิเสธการอัพเดทราคาสำเร็จ')
      fetchDashboardData() // Refresh data
    } catch (error) {
      console.error('Error rejecting update:', error)
      console.error('Error response:', error.response?.data)
      toast.error('ไม่สามารถปฏิเสธการอัพเดทได้')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ดผู้ดูแลระบบ</h1>
            <p className="text-gray-600 mt-2">จัดการระบบของคุณ</p>
          </div>
          <Link
            to="/admin/manage"
            className="btn btn-primary flex items-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            จัดการสถานที่
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">จำนวนสถานที่ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPlaces}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">จำนวนผู้ใช้ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">การอัพเดทที่รออนุมัติ</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingUpdates}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Price Updates */}
      <div className="card">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">การอัพเดทราคาที่รออนุมัติ</h2>
          
          {pendingUpdates.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">ดำเนินการเรียบร้อย!</h3>
              <p className="text-gray-500">ไม่มีการอัพเดทราคาที่รออนุมัติ</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUpdates.map((update) => (
                <div key={update._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{update.place_id?.name}</h4>
                      <p className="text-sm text-gray-600">
                        ส่งโดย: {update.owner_id?.name} ({update.owner_id?.email})
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(update.submitted_at).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(update._id)}
                        className="text-green-600 hover:text-green-700 p-1"
                        title="อนุมัติ"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleReject(update._id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="ปฏิเสธ"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">ราคาปัจจุบัน:</p>
                      <p className="font-medium">${update.place_id?.price_min} - ${update.place_id?.price_max}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">ราคาใหม่:</p>
                      <p className="font-medium text-blue-600">${update.new_price_min} - ${update.new_price_max}</p>
                    </div>
                  </div>

                  {update.promotion && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">โปรโมชั่น:</p>
                      <p className="text-sm text-gray-900">{update.promotion}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
