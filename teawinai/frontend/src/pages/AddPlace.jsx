import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { placesAPI, categoriesAPI } from '@/services/api'
import { getDistrictsByProvince, getSubdistrictsByDistrict, provinces } from '@/data/ubonLocations'

export function AddPlace() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    address: '',
    province: '',
    district: '',
    subdistrict: '',
    detailed_address: '',
    map_link: '',
    price_min: 0,
    price_max: 0,
    is_free: 'false',
    opening_hours: {
      จันทร์: { open: '', close: '', closed: false },
      อังคาร: { open: '', close: '', closed: false },
      พุธ: { open: '', close: '', closed: false },
      พฤหัสบดี: { open: '', close: '', closed: false },
      ศุกร์: { open: '', close: '', closed: false },
      เสาร์: { open: '', close: '', closed: false },
      อาทิตย์: { open: '', close: '', closed: false }
    },
    images: []
  })


  const handleProvinceChange = (e) => {
    const province = e.target.value
    setFormData(prev => ({
      ...prev,
      province,
      district: '',
      subdistrict: ''
    }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)

    // Check limit
    if (formData.images.length + files.length > 5) {
      toast.error('สามารถอัปโหลดได้สูงสุด 5 รูปเท่านั้น')
      return
    }

    // Process each file
    const newImages = files.map(file => {
      if (file.type.startsWith('image/')) {
        return {
          file,
          preview: URL.createObjectURL(file),
          name: file.name
        }
      }
      return null
    }).filter(Boolean)

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }))

    // Clear input
    e.target.value = ''
  }

  const removeImage = (index) => {
    setFormData(prev => {
      const newImages = [...prev.images]
      const removedImage = newImages[index]

      // Revoke object URL to prevent memory leak
      if (removedImage.preview) {
        URL.revokeObjectURL(removedImage.preview)
      }

      newImages.splice(index, 1)
      return {
        ...prev,
        images: newImages
      }
    })
  }

  const handleOpeningHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...prev.opening_hours[day],
          [field]: value
        }
      }
    }))
  }

  const handleClosedDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...prev.opening_hours[day],
          closed: !prev.opening_hours[day].closed
        }
      }
    }))
  }

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories()
      setCategories(response.data.data || response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('ไม่สามารถดึงข้อมูลหมวดหมู่ได้')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData({
      ...formData,
      [name]: value
    })
  }


  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check required fields based on whether it's free or paid
    const isFreePlace = formData.is_free === 'true'
    const requiredFields = [
      formData.name,
      formData.category, 
      formData.province, 
      formData.district, 
      formData.subdistrict,
      formData.map_link
    ]
    
    // Only require prices if it's not a free place
    if (!isFreePlace) {
      requiredFields.push(formData.price_min, formData.price_max)
    }
    
    if (requiredFields.some(field => !field)) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน')
      return
    }

    // Only validate price range if it's not a free place
    if (!isFreePlace && parseFloat(formData.price_min) > parseFloat(formData.price_max)) {
      toast.error('ราคาต่ำสุดต้องไม่มากกว่าราคาสูงสุด')
      return
    }

    setLoading(true)

    try {
      // Create full address from province, district, subdistrict and detailed address
      let fullAddress = `${formData.subdistrict} ${formData.district} ${formData.province}`
      if (formData.detailed_address) {
        fullAddress = `${formData.detailed_address}, ${fullAddress}`
      }

      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('address', fullAddress)
      formDataToSend.append('province', formData.province)
      formDataToSend.append('district', formData.district)
      formDataToSend.append('subdistrict', formData.subdistrict)
      formDataToSend.append('map_link', formData.map_link)
      
      // Handle pricing based on whether it's a free place
      if (isFreePlace) {
        formDataToSend.append('price_min', 0)
        formDataToSend.append('price_max', 0)
      } else {
        formDataToSend.append('price_min', parseFloat(formData.price_min))
        formDataToSend.append('price_max', parseFloat(formData.price_max))
      }
      
      formDataToSend.append('is_free', isFreePlace ? 'true' : 'false')
      formDataToSend.append('opening_hours', JSON.stringify(formData.opening_hours))

      // Append images
      formData.images.forEach((image) => {
        formDataToSend.append(`images`, image.file)
      })

      console.log('Creating place with FormData:', formDataToSend)
      console.log('User token:', localStorage.getItem('token'))
      console.log('User data:', JSON.parse(localStorage.getItem('user') || 'null'))
      const response = await placesAPI.createPlace(formDataToSend)
      console.log('Place created successfully:', response.data)

      toast.success('เพิ่มสถานที่สำเร็จ!')
      navigate('/places')
    } catch (error) {
      console.error('Error creating place:', error)
      console.error('Error response:', error.response?.data)
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มสถานที่')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">เพิ่มสถานที่ท่องเที่ยว</h1>
        <p className="text-gray-600 mt-2">แชร์สถานที่ท่องเที่ยวที่น่าสนใจกับชุมชนของเรา</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ข้อมูลพื้นฐาน</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อสถานที่ *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder="กรอกชื่อสถานที่"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                หมวดหมู่ *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">เลือกหมวดหมู่</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ประเภทสถานที่
              </label>
              <select
                name="is_free"
                value={formData.is_free || 'false'}
                onChange={handleChange}
                className="input"
              >
                <option value="false">เสียค่าใช้จ่าย</option>
                <option value="true">ไม่เสียค่าใช้จ่าย</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.is_free === 'true' ? 'สถานที่ที่ไม่เสียค่าใช้จ่าย' : 'กรุณาระบุช่วงราคาสำหรับสถานที่ท่องเที่ยวทั่วไป'}
              </p>
            </div>
            <hr/>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ราคาต่ำสุด *
              </label>
              <input
                type="number"
                name="price_min"
                value={formData.price_min}
                onChange={handleChange}
                className="input"
                placeholder="0"
                min="0"
                step="0.01"
                required
                disabled={formData.is_free === 'true'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ราคาสูงสุด *
              </label>
              <input
                type="number"
                name="price_max"
                value={formData.price_max}
                onChange={handleChange}
                className="input"
                placeholder="0"
                min="0"
                step="0.01"
                required
                disabled={formData.is_free === 'true'}
              />
            </div>

          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ที่ตั้ง</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                จังหวัด *
              </label>
              <select
                name="province"
                value={formData.province || ''}
                onChange={handleProvinceChange}
                className="input mb-4"
                required
              >
                <option value="">เลือกจังหวัด</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                อำเภอ *
              </label>
              <select
                name="district"
                value={formData.district || ''}
                onChange={handleChange}
                className="input mb-4"
                required
                disabled={!formData.province}
              >
                <option value="">เลือกอำเภอ</option>
                {getDistrictsByProvince(formData.province).map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ตำบล *
              </label>
              <select
                name="subdistrict"
                value={formData.subdistrict || ''}
                onChange={handleChange}
                className="input"
                required
                disabled={!formData.district}
              >
                <option value="">เลือกตำบล</option>
                {getSubdistrictsByDistrict(formData.province, formData.district).map((subdistrict) => (
                  <option key={subdistrict} value={subdistrict}>
                    {subdistrict}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ที่อยู่เพิ่มเติม
              </label>
              <input
                type="text"
                name="detailed_address"
                value={formData.detailed_address || ''}
                onChange={handleChange}
                className="input"
                placeholder="เช่น: 100 หมู่ 3, ตรงข้ามวัด, ใกล้ปั๊มน้ำ..."
              />
              <p className="text-xs text-gray-500 mt-1">
                ระบุรายละเอียดเพิ่มเติมเกี่ยวกับที่อยู่เพื่อความสะดวกในการค้นหา
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ลิงค์แผนที่ *
              </label>
              <input
                type="url"
                name="map_link"
                value={formData.map_link}
                onChange={handleChange}
                className="input"
                placeholder="https://maps.google.com/?q=สถานที่ท่องเที่ยว"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                คัดลอกลิงค์แผนที่หรือใส่ URL ที่ใช้ระบุตำแหน่ง
              </p>
            </div>

          </div>
        </div>


        {/* Opening Hours */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">เวลาเปิด-ปิด</h2>

          <div className="space-y-4">
            {Object.entries(formData.opening_hours).map(([day, hours]) => (
              <div key={day} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-16">
                  <span className="text-sm font-medium text-gray-700">{day}</span>
                </div>

                {!hours.closed && (
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">เปิด</label>
                      <input
                        type="text"
                        value={hours.open}
                        onChange={(e) => {
                          // Only allow numbers and format as HH:MM
                          let value = e.target.value.replace(/[^\d]/g, '')
                          if (value.length >= 3) {
                            value = value.slice(0, 2) + ':' + value.slice(2, 4)
                          }
                          handleOpeningHoursChange(day, 'open', value)
                        }}
                        className="input text-sm"
                        placeholder="08:00"
                        maxLength="5"
                      />
                      <p className="text-xs text-gray-400 mt-1">รูปแบบ: 08:00 (08:00)</p>
                    </div>

                    <span className="text-gray-500 mt-4">-</span>

                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">ปิด</label>
                      <input
                        type="text"
                        value={hours.close}
                        onChange={(e) => {
                          // Only allow numbers and format as HH:MM
                          let value = e.target.value.replace(/[^\d]/g, '')
                          if (value.length >= 3) {
                            value = value.slice(0, 2) + ':' + value.slice(2, 4)
                          }
                          handleOpeningHoursChange(day, 'close', value)
                        }}
                        className="input text-sm"
                        placeholder="20:00"
                        maxLength="5"
                      />
                      <p className="text-xs text-gray-400 mt-1">รูปแบบ: 20:00 (20:00)</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={hours.closed}
                    onChange={() => handleClosedDayToggle(day)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div style={{ display: 'flex' }}>
                    <span className="text-sm font-medium text-gray-700">หยุด</span>
                  </div>
                </div>

                {hours.closed && (
                  <div className="flex-1 text-sm text-gray-500">
                    หยุดทั้งวัน
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">รูปภาพ</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              อัปโหลดรูปภาพ (สูงสุด 5 รูป)
            </label>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">คลิกเพื่ออัปโหลดรูปภาพ</p>
                <p className="text-sm text-gray-500">หรือลากไฟล์มาวางที่นี่</p>
                <p className="text-xs text-gray-400 mt-2">รองรับ JPG, PNG, GIF สูงสุด 5 รูป</p>
              </label>
            </div>

            {/* Image Preview */}
            {formData.images && formData.images.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">รูปภาพที่อัปโหลด ({formData.images.length}/5)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.preview}
                        alt={`รูปที่ ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/places')}
            className="btn btn-secondary"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'กำลังบันทึก...' : 'บันทึกสถานที่'}
          </button>
        </div>
      </form>
    </div>
  )
}
