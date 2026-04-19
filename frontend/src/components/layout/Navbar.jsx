import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingBag, User, Menu as MenuIcon, X, MapPin, ChevronDown, LogOut, Home as HomeIcon, Search, Receipt, Image, Info } from 'lucide-react'
import { shopInfo } from '../../data/menuData'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, isGuest, logout } = useAuth()
  const { totalItems } = useCart()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const AnnouncementBanner = () => (
    <div style={{
      background: 'var(--gold)',
      color: 'var(--green-dark)',
      textAlign: 'center',
      padding: '8px 0',
      fontSize: '13px',
      fontWeight: 950,
      letterSpacing: '1px',
      textTransform: 'uppercase',
      borderBottom: '1px solid rgba(0,0,0,0.1)',
      zIndex: 1100,
      position: 'relative'
    }}>
      <marquee scrollamount="6" style={{ display: 'block' }}>
        ✨ MINIMUM ORDER SGD 10.00 FOR ALL DELIVERIES AND PICKUPS ✨ ENJOY AUTHENTIC STM SALAM FLAVORS ✨ MINIMUM ORDER SGD 10.00 ✨
      </marquee>
    </div>
  );

  // Close menu on navigation
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const links = [
    { to: '/',       label: 'Home' },
    { to: '/menu',   label: 'Menu' },
    { to: '/gallery',label: 'Gallery' },
    { to: '/about',  label: 'About Us' },
    { to: '/profile',label: 'Orders' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <AnnouncementBanner />
      <nav style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: scrolled ? 'rgba(1, 50, 32, 0.98)' : 'var(--green-dark)',
        backdropFilter: 'blur(16px)',
        borderBottom: scrolled ? '1px solid rgba(201, 163, 68, 0.15)' : '1px solid transparent',
        boxShadow: scrolled ? '0 10px 40px rgba(0,0,0,0.3)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: scrolled ? '10px 0' : '18px 0',
        width: '100%', overflow: 'hidden'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          
          {/* LOGO AREA */}
          <Link to="/" style={{ 
            display: 'flex', alignItems: 'center', gap: '12px', 
            textDecoration: 'none', transition: 'transform 0.2s'
          }}>
            <img loading="lazy" src="/stmsalamlogo.png" alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
          </Link>

          {/* DESKTOP NAV (Hidden < 968px) */}
          <div className="desktop-nav" style={{ 
            display: 'flex', gap: '6px', alignItems: 'center', 
            background: 'rgba(255,255,255,0.06)', padding: '6px', 
            borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)'
          }}>
            {links.map(l => (
              <Link key={l.to} to={l.to} style={{
                padding: '10px 22px', borderRadius: '12px', fontSize: '15px', fontWeight: 700,
                color: pathname === l.to ? 'var(--green-dark)' : 'rgba(255,255,255,0.8)',
                background: pathname === l.to ? 'var(--gold)' : 'transparent',
                transition: 'all 0.3s ease', textDecoration: 'none'
              }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* RIGHT ACTIONS */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            
            {/* Header Icons Wrapper */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

              {/* Auth State Display */}
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gold)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: 900, color: 'var(--green-dark)'
                    }}>
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="nav-brand-text" style={{ color: 'white', fontWeight: 700, fontSize: '14px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name?.split(' ')[0]}</span>
                  </Link>
                  <button onClick={handleLogout} title="Sign Out" style={{
                    width: '36px', height: '36px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}>
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="nav-icon-btn" style={{ 
                  padding: '8px 18px', borderRadius: '14px',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  textDecoration: 'none', fontSize: '14px', fontWeight: 700
                }}>
                  <User size={18} /> {isGuest ? 'Guest' : 'Sign In'}
                </Link>
              )}
              
              <Link to="/cart" style={{ 
                background: 'var(--gold)', color: 'var(--green-dark)', 
                padding: '0 16px', borderRadius: '14px', height: '42px',
                display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', fontWeight: 900
              }}>
                <ShoppingBag size={18} />
                <span style={{ fontSize: '14px' }}>{totalItems}</span>
              </Link>

              {/* Mobile Toggle */}
              <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-toggle" style={{
                background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white',
                width: '42px', height: '42px', borderRadius: '14px', cursor: 'pointer', display: 'none',
                alignItems: 'center', justifyContent: 'center'
              }}>
                {menuOpen ? <X size={22} /> : <MenuIcon size={22} />}
              </button>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 968px) {
            .desktop-nav { display: none !important; }
            .mobile-toggle { display: flex !important; }
            .container { padding: 0 16px !important; }
          }
        `}</style>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'var(--green-dark)', padding: '120px 40px',
          display: 'flex', flexDirection: 'column', gap: '20px'
        }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              fontSize: '40px', fontWeight: 950, color: pathname === l.to ? 'var(--gold)' : 'white',
              textDecoration: 'none'
            }}>
              {l.label}
            </Link>
          ))}
          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '40px' }}>
            <div style={{ display: 'flex', gap: '20px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
              <span>Marine Terrace</span>
              <span>•</span>
              <span>Halal Certified</span>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="mobile-bottom-nav">
         <Link to="/" className={`mobile-nav-item ${pathname === '/' ? 'active' : ''}`}>
            <HomeIcon size={22} />
            <span>Home</span>
         </Link>
         <Link to="/menu" className={`mobile-nav-item ${pathname === '/menu' ? 'active' : ''}`}>
            <Search size={22} />
            <span>Menu</span>
         </Link>
         <Link to="/cart" className={`mobile-nav-item ${pathname === '/cart' ? 'active' : ''}`} style={{ position: 'relative' }}>
            <ShoppingBag size={22} />
            <span>Cart</span>
            {totalItems > 0 && (
              <div style={{ position: 'absolute', top: -5, right: -5, background: 'var(--green-dark)', color: 'var(--gold)', fontSize: '10px', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 900, border: '1.5px solid white' }}>
                {totalItems}
              </div>
            )}
         </Link>
         <Link to="/gallery" className={`mobile-nav-item ${pathname === '/gallery' ? 'active' : ''}`}>
            <Image size={22} />
            <span>Gallery</span>
         </Link>
         <Link to="/profile" className={`mobile-nav-item ${pathname === '/profile' ? 'active' : ''}`}>
            <User size={22} />
            <span>Profile</span>
         </Link>
      </div>
    </>
  )
}
