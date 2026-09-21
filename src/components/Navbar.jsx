import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import CartDrawer from './CartDrawer'

const homeLinks = [
  { href: '#product-reveal', label: 'Product' },
  { href: '#sound',          label: 'Sound' },
  { href: '#engineering',    label: 'Engineering' },
  { href: '#craftsmanship',  label: 'Craft' },
  { href: '#specifications', label: 'Specs' },
]

export default function Navbar() {
  const [scrolled,      setScrolled]      = useState(false)
  const [drawerOpen,    setDrawerOpen]    = useState(false)
  const [hamburgerOpen, setHamburgerOpen] = useState(false)
  const location    = useLocation()
  const navigate    = useNavigate()
  const isHome      = location.pathname === '/'
  const { totalQty } = useCart()
  const { user, logout } = useAuth()
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    const bar = document.getElementById('progress-bar')
    const onScroll = () => {
      const sy  = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (bar && max > 0) bar.style.width = (sy / max * 100) + '%'
      setScrolled(sy > 40)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // smooth scroll on home page, navigate then scroll from other pages
  const smoothTo = (e, href) => {
    e.preventDefault()
    setDrawerOpen(false)
    setHamburgerOpen(false)
    if (isHome) {
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/')
      setTimeout(() => {
        const el = document.querySelector(href)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  const toggleDrawer = () => {
    setDrawerOpen(o => !o)
    setHamburgerOpen(o => !o)
  }

  return (
    <>
      <header        className={`fixed top-0 left-0 right-0 z-[1000] flex items-center px-10 transition-all duration-300 border-b
          ${scrolled ? 'bg-[rgba(8,8,8,0.94)] backdrop-blur-[16px] border-border' : 'border-transparent'}
        `}
        style={{ height: 'var(--nav-h)' }}
        role="banner"
      >
        <div className="w-full max-w-[1280px] mx-auto flex items-center justify-between relative">
          {/* Logo */}
          <Link to="/"
            className="font-display text-[20px] font-extrabold tracking-[-0.02em] text-white no-underline
                       md:static absolute left-1/2 md:left-auto md:transform-none -translate-x-1/2">
            AUR<span className="text-red">I</span>X
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex gap-9 list-none items-center">
            {homeLinks.map(l => (
              <li key={l.href}>
                <a href={l.href} onClick={e => smoothTo(e, l.href)}
                  className="text-[11px] font-medium tracking-wider2 uppercase text-off no-underline hover:text-white transition-colors duration-200">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link to="/shop"
                className={`text-[11px] font-medium tracking-wider2 uppercase no-underline transition-colors duration-200
                  ${location.pathname === '/shop' ? 'text-red' : 'text-off hover:text-white'}`}>
                Shop
              </Link>
            </li>
          </ul>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart icon */}
            <button onClick={() => setCartOpen(true)}
              className="relative w-9 h-9 flex items-center justify-center text-muted hover:text-white transition-colors duration-200"
              aria-label="Open cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {totalQty > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red text-white text-[9px] font-bold flex items-center justify-center">
                  {totalQty}
                </span>
              )}
            </button>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted hidden lg:block truncate max-w-[120px]">
                  {user.displayName || user.email}
                </span>
                <button onClick={logout}
                  className="btn-ghost" style={{ padding: '8px 16px', fontSize: '11px' }}>
                  Sign Out
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-ghost" style={{ padding: '8px 16px', fontSize: '11px' }}>
                Sign In
              </Link>
            )}

            <a href="#cta" onClick={e => smoothTo(e, '#cta')}
              className="btn-primary"
              style={{ padding: '10px 22px', fontSize: '11px' }}>
              Order Now
            </a>
          </div>

          {/* Hamburger */}
          <button
            onClick={toggleDrawer}
            aria-label="Toggle menu"
            aria-expanded={drawerOpen}
            className="md:hidden absolute right-0 flex flex-col justify-center items-end gap-[5px] w-10 h-10 bg-transparent border-none cursor-pointer p-1"
          >
            <span className={`block h-[1.5px] bg-white rounded-full transition-all duration-300 origin-center
              ${hamburgerOpen ? 'w-5 translate-y-[6.5px] rotate-45' : 'w-5'}`} />
            <span className={`block h-[1.5px] bg-white rounded-full transition-all duration-200
              ${hamburgerOpen ? 'w-0 opacity-0' : 'w-3.5 opacity-100'}`} />
            <span className={`block h-[1.5px] bg-white rounded-full transition-all duration-300 origin-center
              ${hamburgerOpen ? 'w-5 -translate-y-[6.5px] -rotate-45' : 'w-5'}`} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <nav
        aria-label="Mobile navigation"
        className={`md:hidden fixed left-0 right-0 z-[999] bg-[rgba(6,6,6,0.98)] backdrop-blur-[20px]
          border-b border-border flex flex-col transition-all duration-300
          ${drawerOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-3 pointer-events-none'}`}
        style={{ top: 'var(--nav-h)' }}
      >
        <div className="px-6 pt-4 pb-2">
          {homeLinks.map((l, i) => (
            <a key={l.href} href={l.href} onClick={e => smoothTo(e, l.href)}
              className="flex items-center justify-between text-[12px] font-semibold tracking-wider2 uppercase
                         text-off no-underline py-4 border-b border-[#1a1a1a] hover:text-white transition-colors duration-200 group">
              <span>{l.label}</span>
              <span className="text-[#333] text-[10px] group-hover:text-red transition-colors duration-200">0{i + 1}</span>
            </a>
          ))}
          {/* Shop link in mobile drawer */}
          <Link to="/shop"
            onClick={() => { setDrawerOpen(false); setHamburgerOpen(false) }}
            className={`flex items-center justify-between text-[12px] font-semibold tracking-wider2 uppercase
                       no-underline py-4 border-b border-[#1a1a1a] transition-colors duration-200 group
                       ${location.pathname === '/shop' ? 'text-red' : 'text-off hover:text-white'}`}>
            <span>Shop</span>
            <span className="text-[#333] text-[10px] group-hover:text-red transition-colors duration-200">0{homeLinks.length + 1}</span>
          </Link>
        </div>
        <div className="px-6 py-4">
          <a href="#cta" onClick={e => smoothTo(e, '#cta')}
            className="flex items-center justify-center w-full text-[12px] font-semibold tracking-wider2 uppercase
                       text-white no-underline py-4 bg-red hover:bg-[#a30e19] transition-colors duration-200 rounded-[2px]">
            Order Now — ৳449
          </a>
        </div>
      </nav>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
