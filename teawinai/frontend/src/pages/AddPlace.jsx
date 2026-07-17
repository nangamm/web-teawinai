import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock,
  Image as ImageIcon,
  Info,
  Link as LinkIcon,
  Map,
  MapPin,
  Save,
  UploadCloud,
  X
} from 'lucide-react'
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
    <main className="add-place-page">
      <div className="add-place-shell">
        <header className="add-place-hero">
          <h1>แชร์สถานที่ใหม่</h1>
          <p>แบ่งปันประสบการณ์การเดินทางที่มีประโยชน์ให้ชุมชนเที่ยวไหนด้วยกัน</p>
        </header>

        <form onSubmit={handleSubmit} className="add-place-form">
          <section className="add-place-card">
            <h2 className="add-place-section-title">
              <Info />
              ข้อมูลพื้นฐาน
            </h2>

            <div className="add-place-stack">
              <label className="add-place-field add-place-field-full">
                <span>ชื่อสถานที่ *</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="ระบุชื่อสถานที่ท่องเที่ยวของคุณ"
                  required
                />
              </label>

              <div className="add-place-grid add-place-grid-2">
                <label className="add-place-field">
                  <span>หมวดหมู่ *</span>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">เลือกหมวดหมู่</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="add-place-field">
                  <span>ประเภทสถานที่</span>
                  <div className="add-place-segment" role="group" aria-label="ประเภทสถานที่">
                    <button
                      type="button"
                      className={formData.is_free === 'true' ? 'is-active' : ''}
                      onClick={() => setFormData(prev => ({ ...prev, is_free: 'true', price_min: 0, price_max: 0 }))}
                    >
                      ไม่เสียค่าใช้จ่าย
                    </button>
                    <button
                      type="button"
                      className={formData.is_free !== 'true' ? 'is-active' : ''}
                      onClick={() => setFormData(prev => ({ ...prev, is_free: 'false' }))}
                    >
                      เสียค่าใช้จ่าย
                    </button>
                  </div>
                </div>
              </div>

              <p className="add-place-note">
                กรุณาระบุช่วงราคาที่เหมาะสมต่อหนึ่งคนในหน่วยบาท
              </p>

              <div className="add-place-grid add-place-grid-2">
                <label className="add-place-field">
                  <span>ราคาต่ำสุด *</span>
                  <input
                    type="number"
                    name="price_min"
                    value={formData.price_min}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                    disabled={formData.is_free === 'true'}
                  />
                </label>

                <label className="add-place-field">
                  <span>ราคาสูงสุด *</span>
                  <input
                    type="number"
                    name="price_max"
                    value={formData.price_max}
                    onChange={handleChange}
                    placeholder="500"
                    min="0"
                    step="0.01"
                    required
                    disabled={formData.is_free === 'true'}
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="add-place-card">
            <h2 className="add-place-section-title">
              <MapPin />
              ที่ตั้ง
            </h2>

            <div className="add-place-stack">
              <div className="add-place-grid add-place-grid-3">
                <label className="add-place-field">
                  <span>จังหวัด *</span>
                  <select
                    name="province"
                    value={formData.province || ''}
                    onChange={handleProvinceChange}
                    required
                  >
                    <option value="">เลือกจังหวัด</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="add-place-field">
                  <span>อำเภอ *</span>
                  <select
                    name="district"
                    value={formData.district || ''}
                    onChange={handleChange}
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
                </label>

                <label className="add-place-field">
                  <span>ตำบล *</span>
                  <select
                    name="subdistrict"
                    value={formData.subdistrict || ''}
                    onChange={handleChange}
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
                </label>
              </div>

              <label className="add-place-field add-place-field-full">
                <span>ที่อยู่เพิ่มเติม</span>
                <textarea
                  name="detailed_address"
                  value={formData.detailed_address || ''}
                  onChange={handleChange}
                  placeholder="ระบุรายละเอียดเพิ่มเติม เช่น เลขที่ หมู่บ้าน จุดสังเกต หรือทางเข้า"
                  rows={4}
                />
              </label>

              <label className="add-place-field add-place-field-full">
                <span>ลิงค์แผนที่ *</span>
                <div className="add-place-map-row">
                  <div className="add-place-input-icon">
                    <LinkIcon />
                    <input
                      type="url"
                      name="map_link"
                      value={formData.map_link}
                      onChange={handleChange}
                      placeholder="คัดลอกลิงค์แผนที่หรือใส่ URL ที่ใช้ระบุตำแหน่ง"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    className="add-place-map-btn"
                    onClick={() => formData.map_link && window.open(formData.map_link, '_blank', 'noopener,noreferrer')}
                    aria-label="เปิดแผนที่"
                  >
                    <Map />
                  </button>
                </div>
              </label>
            </div>
          </section>

          <section className="add-place-card">
            <h2 className="add-place-section-title">
              <Clock />
              เวลาเปิด-ปิด
            </h2>

            <div className="add-place-hours">
              {Object.entries(formData.opening_hours).map(([day, hours]) => (
                <div key={day} className="add-place-hour-row">
                  <span className="add-place-hour-day">{day}</span>
                  <div className="add-place-hour-inputs">
                    <input
                      type="text"
                      value={hours.open}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^\d]/g, '')
                        if (value.length >= 3) {
                          value = value.slice(0, 2) + ':' + value.slice(2, 4)
                        }
                        handleOpeningHoursChange(day, 'open', value)
                      }}
                      placeholder="08:00"
                      maxLength="5"
                      disabled={hours.closed}
                      aria-label={`${day} เวลาเปิด`}
                    />
                    <span>-</span>
                    <input
                      type="text"
                      value={hours.close}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^\d]/g, '')
                        if (value.length >= 3) {
                          value = value.slice(0, 2) + ':' + value.slice(2, 4)
                        }
                        handleOpeningHoursChange(day, 'close', value)
                      }}
                      placeholder="20:00"
                      maxLength="5"
                      disabled={hours.closed}
                      aria-label={`${day} เวลาปิด`}
                    />
                  </div>
                  <label className="add-place-closed">
                    <input
                      type="checkbox"
                      checked={hours.closed}
                      onChange={() => handleClosedDayToggle(day)}
                    />
                    <span>หยุด</span>
                  </label>
                </div>
              ))}
            </div>
          </section>

          <section className="add-place-card">
            <h2 className="add-place-section-title">
              <ImageIcon />
              รูปภาพ
            </h2>

            <div className="add-place-upload">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                id="image-upload"
              />
              <label htmlFor="image-upload" className="add-place-upload-label">
                <span className="add-place-upload-icon">
                  <UploadCloud />
                </span>
                <strong>อัปโหลดรูปภาพ (สูงสุด 5 รูป)</strong>
                <span>ลากและวางรูปภาพที่นี่ หรือคลิกเพื่อเลือกไฟล์</span>
                <small>รองรับ JPG, PNG, GIF ขนาดไฟล์ไม่เกิน 5MB ต่อรูป</small>
              </label>
            </div>

            {formData.images && formData.images.length > 0 && (
              <div className="add-place-preview">
                <h3>รูปภาพที่อัปโหลด ({formData.images.length}/5)</h3>
                <div className="add-place-preview-grid">
                  {formData.images.map((image, index) => (
                    <div key={index} className="add-place-preview-item">
                      <img src={image.preview} alt={`รูปที่ ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        aria-label={`ลบรูปที่ ${index + 1}`}
                      >
                        <X />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <div className="add-place-actions">
            <button
              type="button"
              onClick={() => navigate('/places')}
              className="add-place-btn add-place-btn-secondary"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="add-place-btn add-place-btn-primary"
            >
              <Save />
              {loading ? 'กำลังบันทึก...' : 'บันทึกสถานที่'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
