import { useEffect, useRef, useState } from 'react'

const links = [
  { href: '#product-reveal', label: 'Product' },
  { href: '#sound',          label: 'Sound' },
  { href: '#engineering',    label: 'Engineering' },
  { href: '#craftsmanship',  label: 'Craft' },
  { href: '#specifications', label: 'Specs' },
]

export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false)
  const [drawerOpen,   setDrawerOpen]   = useState(false)
  const [hamburgerOpen, setHamburgerOpen] = useState(false)
  const progressRef = useRef(null)

  useEffect(() => {
    const bar = document.getElementById('progress-bar')
    const onScroll = () => {
      const sy = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (bar && max > 0) bar.style.width = (sy / max * 100) + '%'
      setScrolled(sy > 40)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const smoothTo = (e, href) => {
    e.preventDefault()
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setDrawerOpen(false)
    setHamburgerOpen(false)
  }

  const toggleDrawer = () => {
    setDrawerOpen(o => !o)
    setHamburgerOpen(o => !o)
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[1000] flex items-center px-10 transition-all duration-300 border-b
          ${scrolled ? 'bg-[rgba(8,8,8,0.94)] backdrop-blur-[16px] border-border' : 'border-transparent'}
        `}
        style={{ height: 'var(--nav-h)' }}
        role="banner"
      >
        <div className="w-full max-w-[1280px] mx-auto flex items-center justify-between relative">
          {/* Logo — centered on mobile */}
          <a href="#hero" onClick={e => smoothTo(e, '#hero')}
            className="font-display text-[20px] font-extrabold tracking-[-0.02em] text-white no-underline
                       md:static absolute left-1/2 md:left-auto md:transform-none -translate-x-1/2">
            AUR<span className="text-red">I</span>X
          </a>

          {/* Desktop links */}
          <ul className="hidden md:flex gap-9 list-none">
            {links.map(l => (
              <li key={l.href}>
                <a href={l.href} onClick={e => smoothTo(e, l.href)}
                  className="text-[11px] font-medium tracking-wider2 uppercase text-off no-underline hover:text-white transition-colors duration-200">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <a href="#cta" onClick={e => smoothTo(e, '#cta')}
            className="btn-primary hidden md:inline-flex"
            style={{ padding: '10px 22px', fontSize: '11px' }}>
            Order Now
          </a>

          {/* Hamburger — mobile only, no border, clean lines */}
          <button
            onClick={toggleDrawer}
            aria-label="Toggle menu"
            aria-expanded={drawerOpen}
            className="md:hidden absolute right-0 flex flex-col justify-center items-end gap-[5px] w-10 h-10 bg-transparent border-none cursor-pointer p-1"
          >
            {/* Top line — full width */}
            <span className={`block h-[1.5px] bg-white rounded-full transition-all duration-300 origin-center
              ${hamburgerOpen ? 'w-5 translate-y-[6.5px] rotate-45' : 'w-5'}`} />
            {/* Middle line — shorter */}
            <span className={`block h-[1.5px] bg-white rounded-full transition-all duration-200
              ${hamburgerOpen ? 'w-0 opacity-0' : 'w-3.5 opacity-100'}`} />
            {/* Bottom line — full width */}
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
          {links.map((l, i) => (
            <a key={l.href} href={l.href} onClick={e => smoothTo(e, l.href)}
              className="flex items-center justify-between text-[12px] font-semibold tracking-wider2 uppercase
                         text-off no-underline py-4 border-b border-[#1a1a1a] hover:text-white transition-colors duration-200 group">
              <span>{l.label}</span>
              <span className="text-[#333] text-[10px] group-hover:text-red transition-colors duration-200">0{i + 1}</span>
            </a>
          ))}
        </div>
        <div className="px-6 py-4">
          <a href="#cta" onClick={e => smoothTo(e, '#cta')}
            className="flex items-center justify-center w-full text-[12px] font-semibold tracking-wider2 uppercase
                       text-white no-underline py-4 bg-red hover:bg-[#a30e19] transition-colors duration-200 rounded-[2px]">
            Order Now — $449
          </a>
        </div>
      </nav>
    </>
  )
}
