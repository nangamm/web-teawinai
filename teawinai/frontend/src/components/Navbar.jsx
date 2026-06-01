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
    toast.success('Signed out')
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
            Plan trip
          </Link>
          <Link
            to="/places"
            className={`navbar-link${isActive('/places') ? ' active' : ''}`}
          >
            Explore places
          </Link>
          <Link
            to="/about"
            className={`navbar-link${isActive('/about') ? ' active' : ''}`}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={`navbar-link${isActive('/contact') ? ' active' : ''}`}
          >
            Contact
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
              placeholder="Search places..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </form>

          {isAuthenticated ? (
            <>
              <Link to="/profile" className="navbar-icon-btn" title="Profile" aria-label="Profile">
                <User />
              </Link>
              {/* Account menu */}
              <div className="navbar-dropdown-container" ref={dropdownRef}>
                <button
                  type="button"
                  className="navbar-icon-btn"
                  onClick={() => setDropdownOpen(v => !v)}
                  aria-label={dropdownOpen ? 'Close account menu' : 'Open account menu'}
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
                    aria-label="Account menu"
                  >
                    {canAddPlace && (
                      <Link
                        to="/places/add"
                        className="navbar-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                        role="menuitem"
                      >
                        Add place
                      </Link>
                    )}
                    {isAdminUser && (
                      <Link
                        to="/admin"
                        className="navbar-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                        role="menuitem"
                      >
                        Admin console
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
                      Sign out
                    </button>
                  </div>
                )}
              </div>
              <Link to="/my-trips" className="navbar-cta">
                My trips
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-cta-ghost">
                Sign in
              </Link>
              <Link to="/register" className="navbar-cta">
                Create account
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className="navbar-icon-btn navbar-mobile"
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
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
              placeholder="Search places..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="navbar-mobile-divider" />

          {/* Mobile links */}
          <Link to="/" {...mobileLinkProps('/')}>Plan trip</Link>
          <Link to="/places" {...mobileLinkProps('/places')}>Explore places</Link>
          <Link to="/about" {...mobileLinkProps('/about')}>About</Link>
          <Link to="/contact" {...mobileLinkProps('/contact')}>Contact</Link>
          {isAuthenticated && (
            <Link to="/my-trips" {...mobileLinkProps('/my-trips')}>My trips</Link>
          )}
          {canAddPlace && (
            <Link to="/places/add" {...mobileLinkProps('/places/add')}>Add place</Link>
          )}
          {isAdminUser && (
            <Link to="/admin" {...mobileLinkProps('/admin')}>
              <Settings size={13} className="navbar-mobile-link-icon" />
              Admin
            </Link>
          )}

          <div className="navbar-mobile-divider" />

          {/* Mobile auth */}
          <div className="navbar-mobile-actions">
            {isAuthenticated ? (
              <>
                <Link to="/profile" {...mobileLinkProps('/profile')}>
                  <User size={13} className="navbar-mobile-link-icon" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="navbar-mobile-link navbar-mobile-button"
                >
                  <LogOut size={13} className="navbar-mobile-link-icon" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-cta-ghost navbar-mobile-auth-link">
                  Sign in
                </Link>
                <Link to="/register" className="navbar-cta navbar-mobile-auth-link">
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
