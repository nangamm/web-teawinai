import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Plus, Edit2, Trash2, CheckCircle, XCircle, AlertCircle, DollarSign, Users, Settings, Star, ArrowLeft } from 'lucide-react'
import { placesAPI, priceUpdatesAPI } from '@/services/api'
import { isAdmin } from '@/utils/auth'
import toast from 'react-hot-toast'

export function Admin() {
  const [activeTab, setActiveTab] = useState('places')
  const [places, setPlaces] = useState([])
  const [priceUpdates, setPriceUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPlace, setEditingPlace] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    console.log('Admin component - checking auth...')
    const adminStatus = isAdmin()
    const user = JSON.parse(localStorage.getItem('user'))
    console.log('Admin status:', adminStatus)
    console.log('User data:', user)
    
    if (!adminStatus) {
      console.log('User is not admin, redirecting...')
      window.location.href = '/'
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [placesRes, updatesRes] = await Promise.all([
        placesAPI.getPlaces({ limit: 100 }),
        priceUpdatesAPI.getPendingUpdates()
      ])
      
      console.log('Admin data received:', {
        placesResponse: placesRes.data,
        updatesResponse: updatesRes.data,
        placesArray: placesRes.data?.data || placesRes.data,
        updatesArray: updatesRes.data?.data || updatesRes.data
      })
      
      const placesData = placesRes.data?.data || placesRes.data || []
      const updatesData = updatesRes.data?.data || updatesRes.data || []
      
      console.log('Final data to set:', {
        placesCount: placesData.length,
        updatesCount: updatesData.length,
        firstPlace: placesData[0]
      })
      
      setPlaces(placesData)
      setPriceUpdates(updatesData)
    } catch (error) {
      console.error('Error fetching admin data:', error)
      console.error('Error response:', error.response?.data)
      toast.error('ไม่สามารถดึงข้อมูลได้')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPlace = async (placeData) => {
    try {
      await placesAPI.createPlace(placeData)
      setShowAddModal(false)
      fetchData()
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
      fetchData()
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
      fetchData()
      toast.success('ลบสถานที่สำเร็จ')
    } catch (error) {
      console.error('Error deleting place:', error)
      toast.error('ไม่สามารถลบสถานที่ได้')
    }
  }

  const handleApprovePriceUpdate = async (updateId, reviewNote) => {
    try {
      await priceUpdatesAPI.approvePriceUpdate(updateId, { review_note: reviewNote })
      fetchData()
      toast.success('อนุมัติการอัพเดทราคาสำเร็จ')
    } catch (error) {
      console.error('Error approving update:', error)
      toast.error('ไม่สามารถอนุมัติการอัพเดทได้')
    }
  }

  const handleRejectPriceUpdate = async (updateId, reviewNote) => {
    try {
      await priceUpdatesAPI.rejectPriceUpdate(updateId, { review_note: reviewNote })
      fetchData()
      toast.success('ปฏิเสธการอัพเดทราคาสำเร็จ')
    } catch (error) {
      console.error('Error rejecting update:', error)
      toast.error('ไม่สามารถปฏิเสธการอัพเดทได้')
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">หน้าจัดการระบบ</h1>
              <p className="text-gray-600">จัดการสถานที่และการอัพเดทราคา</p>
            </div>
            <Link
              to="/admin"
              className="btn btn-secondary flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับแดชบอร์ด
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('places')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'places'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  จัดการสถานที่
                </div>
              </button>
              <button
                onClick={() => setActiveTab('priceUpdates')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'priceUpdates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  การอัพเดทราคา
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'places' && (
              <div>
                {/* Places Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    สถานที่ทั้งหมด ({places.length})
                  </h2>
                  <button
                    onClick={openAddModal}
                    className="btn btn-primary flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มสถานที่
                  </button>
                </div>

                {/* Places Table */}
                {places.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      ยังไม่มีสถานที่ในระบบ
                    </h3>
                    <p className="text-gray-500 mb-4">เริ่มต้นโดยการเพิ่มสถานที่แรกของคุณ</p>
                    <button
                      onClick={openAddModal}
                      className="btn btn-primary flex items-center mx-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      เพิ่มสถานที่แรก
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ชื่อสถานที่
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          หมวดหมู่
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ช่วงราคา
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          คะแนน
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          สถานะ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          จัดการ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {places.map((place) => (
                        <tr key={place._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {place.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {place.category?.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${place.price_min} - ${place.price_max}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              {place.rating}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              place.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {place.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditModal(place)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(place)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
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

            {activeTab === 'priceUpdates' && (
              <div>
                {/* Price Updates Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    การอัพเดทราคาที่รออนุมัติ ({priceUpdates.length})
                  </h2>
                </div>

                {/* Price Updates List */}
                {priceUpdates.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      ดำเนินการเรียบร้อย!
                    </h3>
                    <p className="text-gray-500">ไม่มีการอัพเดทราคาที่รออนุมัติ</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {priceUpdates.map((update) => (
                      <div key={update._id} className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {update.place_id?.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              ส่งโดย: {update.owner_id?.name} ({update.owner_id?.email})
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(update.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprovePriceUpdate(update._id, 'อนุมัติ')}
                              className="btn bg-green-600 text-white hover:bg-green-700 flex items-center"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              อนุมัติ
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:')
                                if (reason) {
                                  handleRejectPriceUpdate(update._id, reason)
                                }
                              }}
                              className="btn bg-red-600 text-white hover:bg-red-700 flex items-center"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              ปฏิเสธ
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
                            <p className="font-medium text-green-600">${update.new_price_min} - ${update.new_price_max}</p>
                          </div>
                        </div>

                        {update.promotion && (
                          <div className="mt-4">
                            <p className="text-gray-600">โปรโมชั่น:</p>
                            <p className="text-gray-900">{update.promotion}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                  status: 'active'
                }
                
                if (editingPlace) {
                  handleEditPlace(placeData)
                } else {
                  handleAddPlace(placeData)
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ชื่อสถานที่</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingPlace?.name || ''}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">หมวดหมู่</label>
                    <select name="category" className="input" required>
                      <option value="">เลือกหมวดหมู่</option>
                      <option value="temple">วัด</option>
                      <option value="beach">หาด</option>
                      <option value="mountain">ภูเขา</option>
                      <option value="city">เมือง</option>
                      <option value="museum">พิพิธภัณฑ์</option>
                      <option value="park">สวนสาธารณะ</option>
                      <option value="market">ตลาด</option>
                      <option value="restaurant">ร้านอาหาร</option>
                      <option value="other">อื่นๆ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">ที่อยู่</label>
                    <input
                      type="text"
                      name="address"
                      defaultValue={editingPlace?.address || ''}
                      className="input"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ละติจูด</label>
                      <input
                        type="number"
                        name="lat"
                        defaultValue={editingPlace?.lat || ''}
                        className="input"
                        step="any"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ลองจิจูด</label>
                      <input
                        type="number"
                        name="lng"
                        defaultValue={editingPlace?.lng || ''}
                        className="input"
                        step="any"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ราคาต่ำสุด</label>
                      <input
                        type="number"
                        name="price_min"
                        defaultValue={editingPlace?.price_min || ''}
                        className="input"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ราคาสูงสุด</label>
                      <input
                        type="number"
                        name="price_max"
                        defaultValue={editingPlace?.price_max || ''}
                        className="input"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">เวลาเปิด</label>
                      <input
                        type="text"
                        name="open_time"
                        defaultValue={editingPlace?.open_time || ''}
                        className="input"
                        placeholder="08:00"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">เวลาปิด</label>
                      <input
                        type="text"
                        name="close_time"
                        defaultValue={editingPlace?.close_time || ''}
                        className="input"
                        placeholder="20:00"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL รูปภาพ</label>
                    <input
                      type="text"
                      name="image_url"
                      defaultValue={editingPlace?.image_url || ''}
                      className="input"
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="btn btn-secondary"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      {editingPlace ? 'แก้ไข' : 'เพิ่ม'} สถานที่
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">ยืนยันการลบ</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                คุณแน่ใจหรือไม่ที่จะลบ "{deleteTarget.name}"? การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn btn-secondary"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => handleDeletePlace(deleteTarget._id)}
                  className="btn bg-red-600 text-white hover:bg-red-700"
                >
                  ลบ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
