import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  CheckCircle2,
  CircleDot,
  Compass,
  Database,
  MapPinned,
  Route,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  UsersRound
} from 'lucide-react'

const consoleRows = [
  { icon: Search, text: 'Searching Hidden Gems' },
  { icon: Route, text: 'Route Optimization' },
  { icon: Database, text: 'Maintaining Local Data' }
]

const missionCards = [
  {
    icon: Target,
    title: 'Easy to Find',
    text: 'หาแหล่งเที่ยวจากพื้นที่ ความสนใจ และงบประมาณ โดยไม่ต้องไล่เปิดหลายหน้าพร้อมกัน'
  },
  {
    icon: SlidersHorizontal,
    title: 'Clear Costs',
    text: 'เห็นข้อมูลค่าใช้จ่ายและช่วงราคา เพื่อช่วยตัดสินใจว่าทริปนี้เหมาะกับแผนของคุณไหม'
  },
  {
    icon: BadgeCheck,
    title: 'Community Verified',
    text: 'ข้อมูลถูกเติมและดูแลจากชุมชน เจ้าของสถานที่ และผู้ดูแลระบบของ Teawinai'
  }
]

const steps = [
  {
    number: '1',
    title: 'Choose interests',
    text: 'เลือกพื้นที่ หมวดหมู่ และงบประมาณสำหรับทริปของคุณ'
  },
  {
    number: '2',
    title: 'Practical Plan',
    text: 'ระบบช่วยจัดแผนที่อ่านง่ายและนำไปใช้เดินทางต่อได้'
  },
  {
    number: '3',
    title: 'Local Updates',
    text: 'ข้อมูลสถานที่ถูกอัปเดตจากคนในพื้นที่และผู้ดูแล'
  }
]

const audiences = [
  {
    title: 'Travelers',
    text: 'ค้นหาสถานที่และวางแผนเที่ยวโดยใช้ข้อมูลที่เข้าใจง่าย',
    imagePosition: 'center'
  },
  {
    title: 'Locals',
    text: 'ช่วยเพิ่มสถานที่น่าสนใจและแบ่งปันความรู้จากพื้นที่จริง',
    imagePosition: 'left center'
  },
  {
    title: 'Admins/Owners',
    text: 'ดูแลข้อมูลและตรวจสอบรายการ เพื่อให้ฐานข้อมูลยังน่าเชื่อถือ',
    imagePosition: 'right center'
  }
]

const trustItems = [
  {
    title: 'Data Verification',
    text: 'ข้อมูลสำคัญสามารถตรวจและปรับต่อได้เมื่อสถานที่เปลี่ยน'
  },
  {
    title: 'Community Contribution',
    text: 'เปิดให้คนท้องถิ่นและผู้ใช้ช่วยเติมข้อมูลจากประสบการณ์จริง'
  },
  {
    title: 'Admin Review System',
    text: 'ผู้ดูแลช่วยคัดกรองรายการและคำขออัปเดตที่มีผลต่อความถูกต้อง'
  }
]

export default function About() {
  return (
    <main className="about-ref-page">
      <section className="about-ref-hero">
        <img
          src="/images/pexels-nsu-mon-1803488-3759941.jpg"
          alt="บรรยากาศแหล่งท่องเที่ยวท้องถิ่นในอีสาน"
          className="about-ref-hero-img"
        />
        <div className="about-ref-hero-shade" />
        <div className="about-ref-hero-copy">
          <span className="about-ref-pill">Authentic Isan</span>
          <h1>Teawinai About</h1>
          <p className="about-ref-lead">คู่มือเที่ยวท้องถิ่นที่ช่วยให้แผนเที่ยวใช้งานได้จริง</p>
          <p className="about-ref-copy">
            เราออกแบบ Teawinai ให้เป็นพื้นที่รวมข้อมูลสถานที่ท่องเที่ยวจากคนในพื้นที่
            พร้อมเครื่องมือค้นหาและวางแผนที่เข้าใจง่ายสำหรับนักเดินทาง
          </p>
          <div className="about-ref-actions">
            <Link to="/places" className="about-ref-btn about-ref-btn-primary">สำรวจสถานที่</Link>
            <Link to="/" className="about-ref-btn about-ref-btn-ghost">วางแผนทริป</Link>
          </div>
        </div>
      </section>

      <section className="about-ref-console-section">
        <div className="about-ref-console-card">
          <div className="about-ref-console-head">
            <span className="about-ref-console-icon"><MapPinned /></span>
            <div>
              <strong>Ubon Local Console</strong>
              <span>Real-time local data management</span>
            </div>
          </div>
          <div className="about-ref-console-list">
            {consoleRows.map(item => {
              const Icon = item.icon
              return (
                <div className="about-ref-console-row" key={item.text}>
                  <Icon />
                  <span>{item.text}</span>
                  <CheckCircle2 />
                </div>
              )
            })}
          </div>
        </div>

        <div className="about-ref-console-copy">
          <h2>ผู้ช่วยส่วนตัวในการสำรวจอุบลฯ</h2>
          <p>
            Teawinai Console ทำหน้าที่รวมข้อมูลสถานที่ หมวดหมู่ ราคา และสถานะ
            เพื่อให้การค้นหาและการวางแผนทริปไม่กระจัดกระจาย
          </p>
          <ul>
            <li><CircleDot /> Precision Search: ค้นหาตามหมวดหมู่ งบประมาณ และตำแหน่ง</li>
            <li><CircleDot /> Smart Planning: จัดเส้นทางตามเงื่อนไขของนักเดินทาง</li>
            <li><CircleDot /> Data Integrity: ข้อมูลที่สามารถตรวจและแก้ไขโดยบทบาทที่เหมาะสม</li>
          </ul>
        </div>
      </section>

      <section className="about-ref-mission">
        <div className="about-ref-section-head">
          <h2>จุดมุ่งหมายของเรา</h2>
          <p>
            Teawinai ไม่ใช่เว็บขายแพ็กเกจทัวร์ แต่เป็นเครื่องมือที่ช่วยให้ข้อมูลท้องถิ่น
            กลายเป็นแผนเดินทางที่ตัดสินใจได้
          </p>
        </div>
        <div className="about-ref-mission-grid">
          {missionCards.map(item => {
            const Icon = item.icon
            return (
              <article className="about-ref-soft-card" key={item.title}>
                <span className="about-ref-mini-icon"><Icon /></span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="about-ref-steps">
        <div className="about-ref-steps-pattern" aria-hidden="true" />
        <h2>ใช้งานง่ายใน 3 ขั้นตอน</h2>
        <div className="about-ref-step-grid">
          {steps.map(item => (
            <article className="about-ref-step" key={item.number}>
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-ref-audience">
        <div className="about-ref-section-head">
          <h2>แพลตฟอร์มเพื่อทุกคน</h2>
        </div>
        <div className="about-ref-audience-grid">
          {audiences.map(item => (
            <article className="about-ref-audience-card" key={item.title}>
              <img
                src="public/images/fa6dec2785180e3f6486b6bf762d5292.jpg"
                alt=""
                style={{ objectPosition: item.imagePosition }}
              />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-ref-trust-wrap">
        <div className="about-ref-trust-panel">
          <div className="about-ref-trust-copy">
            <h2>ความน่าเชื่อถือหัวใจของเรา</h2>
            <div className="about-ref-trust-list">
              {trustItems.map((item, index) => (
                <div className="about-ref-trust-item" key={item.title}>
                  <span>{index === 1 ? '2A' : index + 1}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="about-ref-collage" aria-hidden="true">
            <div className="about-ref-collage-tile text-tile">ชื่อที่ถูกต้อง</div>
            <div className="about-ref-collage-tile image-tile one" />
            <div className="about-ref-collage-tile image-tile two" />
            <div className="about-ref-collage-tile image-tile three" />
          </div>
        </div>
      </section>

      <section className="about-ref-final-cta">
        <h2>มีสถานที่ที่ควรอยู่ใน Teawinai หรืออยากคุยกับทีม?</h2>
        <p>ร่วมเป็นส่วนหนึ่งของฐานข้อมูลท้องถิ่นที่ช่วยให้นักเดินทางและคนในชุมชนใช้งานได้จริง</p>
        <div className="about-ref-actions center">
          <Link to="/contact" className="about-ref-btn about-ref-btn-primary">ติดต่อเรา</Link>
          <Link to="/places/add" className="about-ref-btn about-ref-btn-light">เพิ่มสถานที่</Link>
        </div>
      </section>
    </main>
  )
}
