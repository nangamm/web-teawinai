import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, User, LogOut, Settings, Menu, X, Bell } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { isAdmin, hasRole } from '@/utils/auth'
import { authAPI, notificationsAPI } from '@/services/api'
import toast from 'react-hot-toast'

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '')

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch (error) {
    console.warn('Unable to read user:', error)
    return null
  }
}

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [placesMenuOpen, setPlacesMenuOpen] = useState(false)
  const placesMenuTimeoutRef = useRef(null)
  const dropdownTimeoutRef = useRef(null)
  const [notificationCount, setNotificationCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [currentUser, setCurrentUser] = useState(() => readStoredUser())
  const dropdownRef = useRef(null)
  const notificationRef = useRef(null)
  const placesMenuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const isAuthenticated = localStorage.getItem('token')
  const isAdminUser = isAdmin()
  const canAddPlace = hasRole(['admin', 'owner'])
  const visibleNotificationCount = notificationCount > 99 ? '99+' : notificationCount
  const avatarSrc = currentUser?.avatar
    ? (currentUser.avatar.startsWith('http') ? currentUser.avatar : `${API_ORIGIN}${currentUser.avatar}`)
    : ''
  const fallbackAvatarSrc = currentUser
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username || currentUser.name || 'User')}&background=116045&color=fff&size=80`
    : ''

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])
  useEffect(() => { setDropdownOpen(false) }, [location.pathname])
  useEffect(() => { setNotificationOpen(false) }, [location.pathname])
  useEffect(() => { setPlacesMenuOpen(false) }, [location.pathname])

  useEffect(() => {
    const syncStoredUser = () => setCurrentUser(readStoredUser())

    const fetchCurrentUser = async () => {
      if (!isAuthenticated) {
        setCurrentUser(null)
        return
      }

      syncStoredUser()

      try {
        const response = await authAPI.getMe()
        const nextUser = response.data.user
        setCurrentUser(nextUser)
        localStorage.setItem('user', JSON.stringify(nextUser))
      } catch (error) {
        console.error('Unable to fetch navbar user:', error)
      }
    }

    fetchCurrentUser()
    window.addEventListener('storage', syncStoredUser)
    window.addEventListener('teawinai:user-updated', syncStoredUser)

    return () => {
      window.removeEventListener('storage', syncStoredUser)
      window.removeEventListener('teawinai:user-updated', syncStoredUser)
    }
  }, [isAuthenticated])

  useEffect(() => {
    const readLocalNotificationCount = () => {
      const directCount = Number(localStorage.getItem('teawinai_notification_count'))

      if (Number.isFinite(directCount) && directCount > 0) {
        setNotificationCount(directCount)
        return
      }

      try {
        const notifications = JSON.parse(localStorage.getItem('teawinai_notifications') || '[]')

        if (Array.isArray(notifications)) {
          setNotificationCount(notifications.filter(item => item && item.read !== true).length)
          return
        }
      } catch (error) {
        console.warn('Unable to read notifications:', error)
      }

      setNotificationCount(0)
    }

    const fetchNotifications = async () => {
      if (!isAuthenticated) {
        setNotificationCount(0)
        setNotifications([])
        return
      }

      try {
        const response = await notificationsAPI.getNotifications({ limit: 8 })
        const nextNotifications = response.data.notifications || []
        setNotifications(nextNotifications)
        setNotificationCount(response.data.unreadCount || 0)
      } catch (error) {
        console.error('Unable to fetch notifications:', error)
        readLocalNotificationCount()
      }
    }

    fetchNotifications()
    const intervalId = window.setInterval(fetchNotifications, 30000)

    window.addEventListener('storage', readLocalNotificationCount)
    window.addEventListener('teawinai:notifications-updated', fetchNotifications)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('storage', readLocalNotificationCount)
      window.removeEventListener('teawinai:notifications-updated', fetchNotifications)
    }
  }, [isAuthenticated])

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

  useEffect(() => {
    if (!notificationOpen) return

    const handlePointerDown = (event) => {
      if (!notificationRef.current?.contains(event.target)) {
        setNotificationOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setNotificationOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [notificationOpen])

  useEffect(() => {
    if (!placesMenuOpen) return

    const handlePointerDown = (event) => {
      if (!placesMenuRef.current?.contains(event.target)) {
        setPlacesMenuOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setPlacesMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [placesMenuOpen])

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

  const handleNotificationToggle = () => {
    setNotificationOpen(value => !value)
    setDropdownOpen(false)
  }

  const handlePlacesMenuToggle = () => {
    setPlacesMenuOpen(value => !value)
    setDropdownOpen(false)
    setNotificationOpen(false)
  }

  const handlePlacesMenuEnter = () => {
    if (placesMenuTimeoutRef.current) {
      clearTimeout(placesMenuTimeoutRef.current)
      placesMenuTimeoutRef.current = null
    }
    setPlacesMenuOpen(true)
  }

  const handlePlacesMenuLeave = () => {
    placesMenuTimeoutRef.current = setTimeout(() => {
      setPlacesMenuOpen(false)
    }, 200)
  }

  const handleDropdownEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
      dropdownTimeoutRef.current = null
    }
    setDropdownOpen(true)
  }

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(false)
    }, 200)
  }

  const handleMarkAllNotificationsRead = async () => {
    try {
      await notificationsAPI.markRead()
      setNotificationCount(0)
      setNotifications(items => items.map(item => ({ ...item, read: true })))
    } catch (error) {
      console.error('Unable to mark notifications as read:', error)
      toast.error('ไม่สามารถอัปเดตการแจ้งเตือนได้')
    }
  }

  const handleNotificationClick = (notification) => {
    setNotificationOpen(false)

    if (!notification || notification.read) return

    setNotificationCount(count => Math.max(0, count - 1))
    setNotifications(items => items.map(item => (
      item._id === notification._id ? { ...item, read: true } : item
    )))

    notificationsAPI.markRead([notification._id]).catch(error => {
      console.error('Unable to mark notification as read:', error)
    })
  }

  const notificationHref = (notification) => {
    if (notification?.place?._id || notification?.place) {
      const placeId = notification.place._id || notification.place
      return `/places/${placeId}`
    }

    return '/places'
  }

  const formatNotificationDate = (value) => {
    if (!value) return ''
    return new Date(value).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('ออกจากระบบแล้ว')
    navigate('/')
  }

  return (
    <nav className="navbar navbar-soft">
      <div className="navbar-inner">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-text">Teawinai</span>
        </Link>

        {/* Desktop links */}
        <div className="navbar-links">
          <Link
            to="/"
            className={`navbar-link${isActive('/') ? ' active' : ''}`}
          >
            หน้าแรก
          </Link>
          <div className="navbar-link-dropdown" ref={placesMenuRef} onMouseEnter={handlePlacesMenuEnter} onMouseLeave={handlePlacesMenuLeave}>
            <button
              type="button"
              className={`navbar-link navbar-link-button${isActive('/places') ? ' active' : ''}`}
              onClick={handlePlacesMenuToggle}
              aria-expanded={placesMenuOpen}
              aria-haspopup="menu"
              aria-label="เมนูสำรวจสถานที่"
            >
              สำรวจสถานที่
            </button>
            {placesMenuOpen && (
              <div className="navbar-link-menu" role="menu" aria-label="เมนูสำรวจสถานที่">
                <Link
                  to="/places"
                  className="navbar-dropdown-item"
                  onClick={() => setPlacesMenuOpen(false)}
                  role="menuitem"
                >
                  สถานที่ท่องเที่ยว
                </Link>
                <Link
                  to="/promotions"
                  className="navbar-dropdown-item"
                  onClick={() => setPlacesMenuOpen(false)}
                  role="menuitem"
                >
                  โปรโมชั่น
                </Link>
              </div>
            )}
          </div>
          <Link
            to="/contact"
            className={`navbar-link${isActive('/contact') ? ' active' : ''}`}
          >
            ติดต่อเรา
          </Link>
        </div>



        {/* Desktop actions */}
        <div className="navbar-actions">  

          {isAuthenticated ? (
            <>
              <div className="navbar-notification-container" ref={notificationRef}>
                <button
                  type="button"
                  className="navbar-icon-btn navbar-notification-btn"
                  title="การแจ้งเตือน"
                  aria-label={`การแจ้งเตือน${notificationCount > 0 ? ` ${notificationCount} รายการที่ยังไม่ได้อ่าน` : ''}`}
                  aria-controls="navbar-notification-menu"
                  aria-expanded={notificationOpen}
                  aria-haspopup="menu"
                  onClick={handleNotificationToggle}
                >
                  <Bell />
                  {notificationCount > 0 && (
                    <span className="navbar-notification-badge" aria-hidden="true">
                      {visibleNotificationCount}
                    </span>
                  )}
                </button>
                {notificationOpen && (
                  <div
                    id="navbar-notification-menu"
                    className="navbar-notification-menu"
                    role="menu"
                    aria-label="การแจ้งเตือน"
                  >
                    <div className="navbar-notification-head">
                      <span>การแจ้งเตือน</span>
                      {notificationCount > 0 && (
                        <button type="button" onClick={handleMarkAllNotificationsRead}>
                          อ่านทั้งหมด
                        </button>
                      )}
                    </div>
                    {notifications.length > 0 ? (
                      <div className="navbar-notification-list">
                        {notifications.map(notification => (
                          <Link
                            key={notification._id}
                            to={notificationHref(notification)}
                            className={`navbar-notification-item${notification.read ? '' : ' unread'}`}
                            role="menuitem"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <span className="navbar-notification-dot" aria-hidden="true" />
                            <span className="navbar-notification-copy">
                              <strong>{notification.title}</strong>
                              <span>{notification.message}</span>
                              <time dateTime={notification.createdAt}>{formatNotificationDate(notification.createdAt)}</time>
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="navbar-notification-empty">ยังไม่มีการแจ้งเตือน</div>
                    )}
                  </div>
                )}
              </div>
              <Link to="/profile" className="navbar-icon-btn" title="โปรไฟล์" aria-label="โปรไฟล์">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt=""
                    className="navbar-avatar"
                    onError={e => {
                      e.currentTarget.src = fallbackAvatarSrc
                    }}
                  />
                ) : (
                  <User />
                )}
              </Link>
              {/* Account menu */}
              <div className="navbar-dropdown-container" ref={dropdownRef} onMouseEnter={handleDropdownEnter} onMouseLeave={handleDropdownLeave}>
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
                สมัครสมาชิก
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
          <Link to="/promotions" {...mobileLinkProps('/promotions')}>โปรโมชั่น</Link>
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
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt=""
                      className="navbar-mobile-avatar"
                      onError={e => {
                        e.currentTarget.src = fallbackAvatarSrc
                      }}
                    />
                  ) : (
                    <User size={13} className="navbar-mobile-link-icon" />
                  )}
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
