import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Brand */}
        <div className="footer-brand">The Emerald Editorial</div>

        {/* Nav Links */}
        <div className="footer-links">
          <Link to="/" className="footer-link">หน้าแรก</Link>
          <Link to="/places" className="footer-link">สถานที่</Link>
          <Link to="/add-place" className="footer-link">เพิ่มสถานที่</Link>
          <Link to="/contact" className="footer-link">ติดต่อ</Link>
        </div>

        <div className="footer-divider" />

        {/* Copyright */}
        <p className="footer-copy">
          © {new Date().getFullYear()} The Emerald Editorial. Ubon Ratchathani Heritage.
        </p>

      </div>
    </footer>
  )
}