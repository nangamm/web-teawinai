import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, ChevronDown, AlertCircle, Loader2 } from 'lucide-react'
import { categoriesAPI, tripsAPI } from '@/services/api'
import toast from 'react-hot-toast'

const CAT_EMOJI = {
  'วัด': '⛩', 'Temples': '⛩',
  'ร้านอาหาร': '🍽', 'Restaurants': '🍽',
  'ธรรมชาติ': '🌿', 'Nature': '🌿',
  'คาเฟ่': '☕', 'Cafe': '☕',
  'ช็อปปิ้ง': '🛍', 'Shopping': '🛍',
  'พิพิธภัณฑ์': '🏛', 'Museum': '🏛',
  'ตลาด': '🏪', 'Market': '🏪',
}

export function Home() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ budget: '', categories: [], maxPlaces: '5', province: '', district: '', subdistrict: '' })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  // Thailand provinces and districts data (from AddPlace.jsx)
  const provinces = [
    'อุบลราชธานี'
  ]

  const districtsByProvince = {
    'อุบลราชธานี': [
      'เมืองอุบลราชธานี',
      'กุดข้าวปุ้น',
      'โขงเจียม',
      'เขื่องใน',
      'เขมราฐ',
      'เดชอุดม',
      'ตระการพืชผล',
      'ตาลสุม',
      'ทุ่งศรีอุดม',
      'นาจะหลวย',
      'นาตาล',
      'นาเยีย',
      'น้ำขุ่น',
      'น้ำยืน',
      'บุณฑริก',
      'พิบูลมังสาหาร',
      'โพธิ์ไทร',
      'ม่วงสามสิบ',
      'วารินชำราบ',
      'ศรีเมืองใหม่',
      'สว่างวีระวงศ์',
      'สำโรง',
      'สิรินธร',
      'ดอนมดแดง',
      'เหล่าเสือโก้ก'
    ]
  }

  const subdistrictsByDistrict = {
    'อุบลราชธานี': {
      'เมืองอุบลราชธานี': [
        'ในเมือง', 'จระเข้', 'ไร่น้อย', 'กระโสบ', 'กุดลาด',
        'ขามใหญ่', 'แจระแม', 'หนองขอน', 'ปทุม', 'หนองบ่อ',
        'หัวเรือ', 'หนองฮอ', 'ดอนมดแดง', 'เหล่าเสือโก้ก',
        'หนองไห', 'ขามป้อม', 'บ้านเป็ด', 'พะลาน', 'กาดิน'
      ],
      'กุดข้าวปุ้น': [
        'ข้าวปุ้น', 'กาบิน', 'แก้งเหนือ', 'โนนสวาง', 'หนองทันน้ำ'
      ],
      'โขงเจียม': [
        'โขงเจียม', 'ห้วยไผ่', 'นาโพธิ์กลาง', 'หนองแสงน้อย', 'ห้วยยาง'
      ],
      'เขื่องใน': [
        'เขื่องใน', 'สร้างถ่อ', 'ค้อทอง', 'ก่อเอ้', 'หัวดอน',
        'ชีทวน', 'ท่าไห', 'นาคำใหญ่', 'แดงหม้อ', 'ธาตุน้อย',
        'บ้านไทย', 'บ้านกอก', 'สหธาตุ', 'หนองเมือง'
      ],
      'เขมราฐ': [
        'เขมราฐ', 'แก้งเหนือ', 'หนองผือ', 'นาแวง', 'เจียด',
        'หนองนกทา', 'หนองสิม', 'ขามป้อม', 'พะลาน'
      ],
      'เดชอุดม': [
        'เดชอุดม', 'นาส่วง', 'นาเจริญ', 'ทุ่งเทิง', 'สมสะอาด',
        'กลาง', 'แก้ง', 'ท่าโพธิ์ศรี', 'บัวงาม', 'คำครั่ง',
        'โนนสมบูรณ์', 'นาเกษม', 'กุดประทาย', 'ตบหู'
      ],
      'ตระการพืชผล': [
        'ขุหลุ', 'กระเดียน', 'เกษม', 'กุดเรือ', 'คอนสาย',
        'คำเจริญ', 'ถ้ำแข้', 'ท่าหลวง', 'บ้านแดง', 'บึงเจ็บ',
        'เซเป็ด', 'สะพือ', 'หนองเต่า', 'ขามเปี้ย', 'ตระการ',
        'ตากแดด', 'ไหล่ทุ่ง', 'นาสะไม', 'นาพิน'
      ],
      'ตาลสุม': [
        'ตาลสุม', 'สำโรง', 'จิกเทิง', 'หนองกุง', 'นาคาย', 'คำหว้า'
      ],
      'ทุ่งศรีอุดม': [
        'โนนโพธิ์', 'หนองอ้ม', 'นาเกษม', 'กุดเรือ', 'นาห่อม'
      ],
      'นาจะหลวย': [
        'นาจะหลวย', 'โนนสมบูรณ์', 'พรสวรรค์', 'บ้านตูม', 'โสกแสง', 'โนนใหญ่'
      ],
      'นาตาล': [
        'นาตาล', 'นาถ่อน', 'พะลาน', 'พังเคน'
      ],
      'นาเยีย': [
        'นาเยีย', 'นาดี', 'นาเรือง'
      ],
      'น้ำขุ่น': [
        'ขี้เหล็ก', 'โซง', 'ตาเกา', 'ไพบูลย์'
      ],
      'น้ำยืน': [
        'โซง', 'ยาง', 'เก่าขาม', 'ไพบูลย์', 'สีวิเชียร',
        'ยางใหญ่', 'บุเปือย'
      ],
      'บุณฑริก': [
        'โพนงาม', 'ห้วยข่า', 'คอแลน', 'นาโพธิ์', 'หนองสะโน',
        'โนนค้อ', 'บัวงาม', 'บ้านแมด'
      ],
      'พิบูลมังสาหาร': [
        'พิบูล', 'กุดชมภู', 'ดอนจิก', 'ทรายมูล', 'นาโพธิ์',
        'โนนกลาง', 'บ้านแขม', 'โพธิ์ไทร', 'ระเว', 'หนองบัวฮี',
        'อ่างศิลา', 'โนนกาหลง', 'นาจาน', 'ไร่ใต้', 'หนองบัว'
      ],
      'โพธิ์ไทร': [
        'โพธิ์ไทร', 'ม่วงใหญ่', 'สำโรง', 'สองคอน', 'สารภี', 'เหล่างาม'
      ],
      'ม่วงสามสิบ': [
        'ม่วงสามสิบ', 'เหล่าบก', 'ดุมใหญ่', 'หนองช้างใหญ่', 'หนองเมือง',
        'เตย', 'หนองไข่นก', 'หนองเหล่า', 'หนองฮาง', 'ยางสักกระโพหลุ่ม'
      ],
      'วารินชำราบ': [
        'วารินชำราบ', 'ธาตุ', 'ท่าลาด', 'โนนผึ้ง', 'หนองกินเพล',
        'โนนโหนน', 'ห้วยขะยุง', 'บุ่งหวาย', 'คำน้ำแซบ', 'บุ่งไหม',
        'สระสมิง', 'คำขวาง', 'โพธิ์ใหญ่', 'แสนสุข', 'หนองไห', 'เมืองศรีไค'
      ],
      'ศรีเมืองใหม่': [
        'นาคำ', 'แก้งกอก', 'เอือดใหญ่', 'วาริน', 'ลาดควาย',
        'สงยาง', 'ตะบ่าย', 'คำเขื่อนแก้ว', 'หนามแท่ง', 'อ่างสุวรรณ'
      ],
      'สว่างวีระวงศ์': [
        'สว่าง', 'บุ่งมะแลง', 'แก้งโนนน้อย', 'ท่าช้าง'
      ],
      'สำโรง': [
        'สำโรง', 'โนนกาเล็น', 'หนองไฮ', 'ขามป้อม', 'ห้วยเดื่อ',
        'ค้อน้อย', 'บอน', 'โคกก่อง'
      ],
      'สิรินธร': [
        'นิคมสร้างตนเอง', 'นาแวง', 'คันไร่', 'ช่องเม็ก', 'โนนก่อ'
      ],
      'ดอนมดแดง': [
        'ดอนมดแดง', 'เหล่าแดง', 'ท่าเมือง', 'คำไฮใหญ่'
      ],
      'เหล่าเสือโก้ก': [
        'เหล่าเสือโก้ก', 'โพนเมือง', 'แพงใหญ่', 'หนองเมือง'
      ]
    }
  }

  const getDistrictsByProvince = (province) => {
    return districtsByProvince[province] || []
  }

  const getSubdistrictsByDistrict = (province, district) => {
    return subdistrictsByDistrict[province]?.[district] || []
  }

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    try {
      const res = await categoriesAPI.getCategories()
      setCategories(res.data.data || res.data || [])
    } catch {
      toast.error('ไม่สามารถดึงข้อมูลหมวดหมู่ได้')
    }
  }

  const toggleCategory = (name) => {
    setFormData(p => ({
      ...p,
      categories: p.categories.includes(name)
        ? p.categories.filter(c => c !== name)
        : [...p.categories, name]
    }))
    if (errors.categories) setErrors(p => ({ ...p, categories: '' }))
  }

  const validate = () => {
    const e = {}
    if (!formData.budget || formData.budget <= 0) e.budget = 'กรุณากรอกงบประมาณที่มากกว่า 0'
    if (!formData.categories.length) e.categories = 'กรุณาเลือกอย่างน้อย 1 หมวดหมู่'
    if (!formData.province) e.province = 'กรุณาเลือกจังหวัด'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await tripsAPI.planTrip({
        budget: parseFloat(formData.budget),
        categories: formData.categories,
        maxPlaces: parseInt(formData.maxPlaces),
        location: {
          province: formData.province,
          district: formData.district,
          subdistrict: formData.subdistrict
        }
      })
      navigate('/result', { state: { tripPlan: res.data.data || res.data } })
      toast.success('วางแผนทริปสำเร็จ!')
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'ไม่สามารถวางแผนทริปได้ กรุณาลองใหม่' })
      toast.error('ไม่สามารถวางแผนทริปได้')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      {/* Hero image — วางรูปจริงที่ public/images/hero-temple.jpg */}
      <img
        className="hero-img"
        src="/images/pexels-nsu-mon-1803488-3759941.jpg"
        alt="วัดในอีสาน"
        onError={e => { e.currentTarget.style.display = 'none' }}
      />
      <div className="hero-bg-overlay" />

      <div className="hero-content">
        {/* Eyebrow */}
        <div className="eyebrow">
          <span className="eyebrow-pill">Ubon Ratchathani</span>
        </div>

        {/* Headline */}
        <h1 className="hero-title">
          The Emerald<br />of Isan.
        </h1>

        {/* Booking Card */}
        <form onSubmit={handleSubmit}>
          <div className="booking-card">

            {/* Row: Province + District + Subdistrict */}
            <div className="card-row-3">
              <div className="field-group">
                <div className="field-label">จังหวัด</div>
                <div className={`input-box${errors.province ? ' has-error' : ''}`}>
                  <select
                    className="bare-input"
                    value={formData.province}
                    onChange={e => {
                      setFormData(p => ({ ...p, province: e.target.value, district: '', subdistrict: '' }))
                      if (errors.province) setErrors(p => ({ ...p, province: '' }))
                    }}
                  >
                    <option value="">เลือกจังหวัด</option>
                    {provinces.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>
                {errors.province && (
                  <div className="field-error"><AlertCircle size={11} />{errors.province}</div>
                )}
              </div>

              <div className="field-group">
                <div className="field-label">อำเภอ</div>
                <div className="input-box">
                  <select
                    className="bare-input"
                    value={formData.district}
                    onChange={e => {
                      setFormData(p => ({ ...p, district: e.target.value, subdistrict: '' }))
                    }}
                    disabled={!formData.province}
                  >
                    <option value="">เลือกอำเภอ</option>
                    {getDistrictsByProvince(formData.province).map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field-group">
                <div className="field-label">ตำบล</div>
                <div className="input-box">
                  <select
                    className="bare-input"
                    value={formData.subdistrict}
                    onChange={e => {
                      setFormData(p => ({ ...p, subdistrict: e.target.value }))
                    }}
                    disabled={!formData.district}
                  >
                    <option value="">เลือกตำบล</option>
                    {getSubdistrictsByDistrict(formData.province, formData.district).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Budget field */}
            <div className="card-row">
              <div className="field-group">
                <div className="field-label">งบประมาณ</div>
                <div className={`input-box${errors.budget ? ' has-error' : ''}`}>
                  <div className="b-icon">฿</div>
                  <input
                    className="bare-input"
                    type="number"
                    placeholder="งบประมาณ"
                    value={formData.budget}
                    min="1"
                    onChange={e => {
                      setFormData(p => ({ ...p, budget: e.target.value }))
                      if (errors.budget) setErrors(p => ({ ...p, budget: '' }))
                    }}
                  />
                </div>
                {errors.budget && (
                  <div className="field-error"><AlertCircle size={11} />{errors.budget}</div>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="chips-section">
              <div className="chips-label">หมวดหมู่</div>
              <div className="chips-row">
                {categories.map(cat => (
                  <button
                    type="button"
                    key={cat._id}
                    className={`chip${formData.categories.includes(cat.name) ? ' active' : ''}`}
                    onClick={() => toggleCategory(cat.name)}
                  >
                    {CAT_EMOJI[cat.name]
                      ? <span className="chip-emoji">{CAT_EMOJI[cat.name]}</span>
                      : null}
                    {cat.name}
                  </button>
                ))}
              </div>
              {errors.categories && (
                <div className="field-error" style={{ marginTop: 8 }}>
                  <AlertCircle size={11} />{errors.categories}
                </div>
              )}
            </div>

            <div className="card-divider" />

            {/* Number of places */}
            <div className="chips-section" style={{ marginBottom: 14 }}>
              <div className="chips-label">จำนวนสถานที่</div>
              <div className="chips-row">
                {['3', '5', '7'].map(n => (
                  <button
                    type="button"
                    key={n}
                    className={`chip${formData.maxPlaces === n ? ' active' : ''}`}
                    onClick={() => setFormData(p => ({ ...p, maxPlaces: n }))}
                  >
                    {n} สถานที่
                  </button>
                ))}
              </div>
            </div>

            {/* Submit error */}
            {errors.submit && (
              <div className="submit-error">
                <AlertCircle size={13} />{errors.submit}
              </div>
            )}

            {/* CTA */}
            <button type="submit" className="cta-btn" disabled={loading}>
              {loading
                ? <><Loader2 size={16} className="spin" /> กำลังวางแผน...</>
                : 'Plan My Heritage Trip'}
            </button>

          </div>
        </form>
      </div>
    </div>
  )
}