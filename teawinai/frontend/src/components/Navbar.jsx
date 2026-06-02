import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, User, LogOut, MapPin, Settings, Menu, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { isAdmin, hasRole } from '@/utils/auth'
import toast from 'react-hot-toast'

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const isAuthenticated = localStorage.getItem('token')
  const isAdminUser = isAdmin()
  const canAddPlace = hasRole(['admin', 'owner'])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])
  useEffect(() => { setDropdownOpen(false) }, [location.pathname])

  useEffect(() => {
    if (!dropdownOpen) return

    const handlePointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [dropdownOpen])

  const isActive = (path) => location.pathname === path
  const mobileLinkProps = (path) => ({
    className: `navbar-mobile-link${isActive(path) ? ' active' : ''}`,
    'aria-current': isActive(path) ? 'page' : undefined
  })

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
    toast.success('ออกจากระบบแล้ว')
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <MapPin className="navbar-logo-icon" />
          <span className="navbar-logo-text">Teawinai</span>
        </Link>

        {/* Desktop links */}
        <div className="navbar-links">
          <Link
            to="/"
            className={`navbar-link${isActive('/') ? ' active' : ''}`}
          >
            วางแผนเที่ยว
          </Link>
          <Link
            to="/places"
            className={`navbar-link${isActive('/places') ? ' active' : ''}`}
          >
            สำรวจสถานที่
          </Link>
          <Link
            to="/about"
            className={`navbar-link${isActive('/about') ? ' active' : ''}`}
          >
            เกี่ยวกับเรา
          </Link>
          <Link
            to="/contact"
            className={`navbar-link${isActive('/contact') ? ' active' : ''}`}
          >
            ติดต่อ
          </Link>
        </div>



        {/* Desktop actions */}
        <div className="navbar-actions">
          {/* Desktop search */}
          <form onSubmit={handleSearch} className="navbar-search">
            <Search />
            <input
              type="text"
              className="navbar-search-input"
              placeholder="ค้นหาสถานที่..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </form>

          {isAuthenticated ? (
            <>
              <Link to="/profile" className="navbar-icon-btn" title="โปรไฟล์" aria-label="โปรไฟล์">
                <User />
              </Link>
              {/* Account menu */}
              <div className="navbar-dropdown-container" ref={dropdownRef}>
                <button
                  type="button"
                  className="navbar-icon-btn"
                  onClick={() => setDropdownOpen(v => !v)}
                  aria-label={dropdownOpen ? 'ปิดเมนูบัญชี' : 'เปิดเมนูบัญชี'}
                  aria-controls="navbar-account-menu"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="menu"
                >
                  <Menu />
                </button>
                {dropdownOpen && (
                  <div
                    id="navbar-account-menu"
                    className="navbar-dropdown-menu"
                    role="menu"
                    aria-label="เมนูบัญชี"
                  >
                    <Link
                      to="/my-trips"
                      className="navbar-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                      role="menuitem"
                    >
                      ทริปของฉัน
                    </Link>
                    {canAddPlace && (
                      <Link
                        to="/places/add"
                        className="navbar-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                        role="menuitem"
                      >
                        เพิ่มสถานที่
                      </Link>
                    )}
                    {isAdminUser && (
                      <Link
                        to="/admin"
                        className="navbar-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                        role="menuitem"
                      >
                        แผงผู้ดูแล
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout()
                        setDropdownOpen(false)
                      }}
                      className="navbar-dropdown-item navbar-menu-button logout"
                      role="menuitem"
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-cta-ghost">
                เข้าสู่ระบบ
              </Link>
              <Link to="/register" className="navbar-cta">
                ลงทะเบียน
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className="navbar-icon-btn navbar-mobile"
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="navbar-mobile-panel">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="navbar-mobile-search">
            <Search />
            <input
              type="text"
              placeholder="ค้นหาสถานที่..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="navbar-mobile-divider" />

          {/* Mobile links */}
          <Link to="/" {...mobileLinkProps('/')}>วางแผนเที่ยว</Link>
          <Link to="/places" {...mobileLinkProps('/places')}>สำรวจสถานที่</Link>
          <Link to="/about" {...mobileLinkProps('/about')}>เกี่ยวกับเรา</Link>
          <Link to="/login" {...mobileLinkProps('/login')}>เข้าสู่ระบบผู้ดูแล</Link>
          {isAuthenticated && (
            <Link to="/my-trips" {...mobileLinkProps('/my-trips')}>ทริปของฉัน</Link>
          )}
          {canAddPlace && (
            <Link to="/places/add" {...mobileLinkProps('/places/add')}>เพิ่มสถานที่</Link>
          )}
          {isAdminUser && (
            <Link to="/admin" {...mobileLinkProps('/admin')}>
              <Settings size={13} className="navbar-mobile-link-icon" />
              ผู้ดูแล
            </Link>
          )}

          <div className="navbar-mobile-divider" />

          {/* Mobile auth */}
          <div className="navbar-mobile-actions">
            {isAuthenticated ? (
              <>
                <Link to="/profile" {...mobileLinkProps('/profile')}>
                  <User size={13} className="navbar-mobile-link-icon" />
                  โปรไฟล์
                </Link>
                <button
                  onClick={handleLogout}
                  className="navbar-mobile-link navbar-mobile-button"
                >
                  <LogOut size={13} className="navbar-mobile-link-icon" />
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-cta-ghost navbar-mobile-auth-link">
                  เข้าสู่ระบบ
                </Link>
                <Link to="/register" className="navbar-cta navbar-mobile-auth-link">
                  เริ่มวางแผน
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
