import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, User, LogOut, MapPin, Settings, Menu, X, Globe, Bell } from 'lucide-react'
import { useState, useEffect } from 'react'
import { isAdmin, hasRole } from '@/utils/auth'
import toast from 'react-hot-toast'

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const isAuthenticated = localStorage.getItem('token')
  const isAdminUser = isAdmin()
  const canAddPlace = hasRole(['admin', 'owner'])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const isActive = (path) => location.pathname === path

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/places?search=${encodeURIComponent(searchQuery)}`)
      setMobileOpen(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('ออกจากระบบสำเร็จ')
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* ── Logo ── */}
        <Link to="/" className="navbar-logo">
          <MapPin className="navbar-logo-icon" />
          <span className="navbar-logo-text">The Emerald Editorial</span>
        </Link>

        {/* ── Center Links (desktop) ── */}
        <div className="navbar-links">
          <Link
            to="/"
            className={`navbar-link${isActive('/') ? ' active' : ''}`}
          >
            Plan Trip
          </Link>
          <Link
            to="/places"
            className={`navbar-link${isActive('/places') ? ' active' : ''}`}
          >
            Explore
          </Link>
          {canAddPlace && (
            <Link
              to="/places/add"
              className={`navbar-link${isActive('/places/add') ? ' active' : ''}`}
            >
              Business Portal
            </Link>
          )}
          {isAdminUser && (
            <Link
              to="/admin"
              className={`navbar-link${isActive('/admin') ? ' active' : ''}`}
            >
              Admin Login
            </Link>
          )}
        </div>



        {/* ── Right Actions (desktop) ── */}
        <div className="navbar-actions">
          {/* ── Search (desktop) ── */}
          <form onSubmit={handleSearch} className="navbar-search">
            <Search />
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Search experiences..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </form>

          {isAuthenticated ? (
            <>
              <Link to="/profile" className="navbar-icon-btn" title="โปรไฟล์">
                <User />
              </Link>
              <button
                onClick={handleLogout}
                className="navbar-icon-btn"
                title="ออกจากระบบ"
              >
                <LogOut />
              </button>
              {isAuthenticated && (
                <Link to="/my-trips" className="navbar-cta">
                  My Trips
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-cta-ghost">
                เข้าสู่ระบบ
              </Link>
              <Link to="/register" className="navbar-cta">
                Book Now
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="navbar-icon-btn navbar-mobile"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="เมนู"
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* ── Mobile Panel ── */}
      {mobileOpen && (
        <div className="navbar-mobile-panel">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="navbar-mobile-search">
            <Search />
            <input
              type="text"
              placeholder="Search experiences..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="navbar-mobile-divider" />

          {/* Mobile Links */}
          <Link to="/" className="navbar-mobile-link">Plan Trip</Link>
          <Link to="/places" className="navbar-mobile-link">Explore</Link>
          {isAuthenticated && (
            <Link to="/my-trips" className="navbar-mobile-link">My Trips</Link>
          )}
          {canAddPlace && (
            <Link to="/places/add" className="navbar-mobile-link">Business Portal</Link>
          )}
          {isAdminUser && (
            <Link to="/admin" className="navbar-mobile-link">
              <Settings size={13} style={{ display: 'inline', marginRight: 6 }} />
              Admin
            </Link>
          )}

          <div className="navbar-mobile-divider" />

          {/* Mobile Auth */}
          <div className="navbar-mobile-actions">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="navbar-mobile-link">
                  <User size={13} style={{ display: 'inline', marginRight: 6 }} />
                  โปรไฟล์
                </Link>
                <button
                  onClick={handleLogout}
                  className="navbar-mobile-link"
                  style={{ textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', width: '100%' }}
                >
                  <LogOut size={13} style={{ display: 'inline', marginRight: 6 }} />
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-cta-ghost" style={{ justifyContent: 'center' }}>
                  เข้าสู่ระบบ
                </Link>
                <Link to="/register" className="navbar-cta" style={{ justifyContent: 'center' }}>
                  Book Now
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}