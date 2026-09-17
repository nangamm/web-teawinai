import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    toast.success('ส่งข้อความเรียบร้อยแล้ว')
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="places-page">
      <div className="places-inner">
        <div className="places-header">
          <div className="places-eyebrow">Contact Us</div>
          <h1 className="places-title">ติดต่อเรา</h1>
          <p className="places-subtitle">เรายินดีรับฟังความคิดเห็นและข้อเสนอแนะจากคุณ</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '60px' }}>
          {/* Contact Info */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#0e0e0e' }}>
              ข้อมูลติดต่อ
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '50%', 
                  background: 'rgba(17,96,69,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Mail style={{ width: '20px', height: '20px', color: '#A8223B' }} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>อีเมล</div>
                  <div style={{ fontSize: '14px', color: '#0e0e0e' }}>admin@teawinai.com</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '50%', 
                  background: 'rgba(17,96,69,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Phone style={{ width: '20px', height: '20px', color: '#A8223B' }} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>โทรศัพท์</div>
                  <div style={{ fontSize: '14px', color: '#0e0e0e' }}>+66 2 123 4567</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '50%', 
                  background: 'rgba(17,96,69,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MapPin style={{ width: '20px', height: '20px', color: '#A8223B' }} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '2px' }}>ที่อยู่</div>
                  <div style={{ fontSize: '14px', color: '#0e0e0e' }}>อุบลราชธานี, ประเทศไทย</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div style={{ background: '#fff', borderRadius: '14px', padding: '32px', border: '1px solid #eae8e3' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#0e0e0e' }}>
              ส่งข้อความถึงเรา
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#888', marginBottom: '6px' }}>
                  ชื่อ
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid #9d9ca0',
                    borderRadius: '8px',
                    background: '#f4f2ee',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#888', marginBottom: '6px' }}>
                  อีเมล
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid #9d9ca0',
                    borderRadius: '8px',
                    background: '#f4f2ee',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#888', marginBottom: '6px' }}>
                  เรื่อง
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid #9d9ca0',
                    borderRadius: '8px',
                    background: '#f4f2ee',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#888', marginBottom: '6px' }}>
                  ข้อความ
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1.5px solid #9d9ca0',
                    borderRadius: '8px',
                    background: '#f4f2ee',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    resize: 'vertical',
                    fontFamily: 'Noto Sans Thai, sans-serif'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#A8223B',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Send style={{ width: '16px', height: '16px' }} />
                ส่งข้อความ
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
