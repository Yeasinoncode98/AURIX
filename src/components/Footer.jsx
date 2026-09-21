const footerLinks = {
  Products: [
    { label: 'AURIX ONE',             href: '#hero' },
    { label: 'Exploded Architecture', href: '#engineering' },
    { label: 'Technical Specs',       href: '#specifications' },
  ],
  Company: [
    { label: 'About AURIX',   href: '#' },
    { label: 'Acoustics Lab', href: '#' },
    { label: 'Press Kit',     href: '#' },
  ],
  Support: [
    { label: '30-Day Return Policy', href: '#' },
    { label: 'Warranty Registry',    href: '#' },
    { label: 'Contact Engineering',  href: '#' },
  ],
}

export default function Footer() {
  const smoothTo = (e, href) => {
    if (!href.startsWith('#')) return
    e.preventDefault()
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="border-t border-border" style={{ background: '#0c0c0c', padding: '60px 0 36px' }} role="contentinfo">
      <div className="container-inner">
        <div className="grid gap-10 mb-12" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
          {/* Brand */}
          <div>
            <div className="font-display text-[18px] font-extrabold tracking-[-0.02em] mb-3">
              AUR<span className="text-red">I</span>X
            </div>
            <p className="text-[12px] text-muted leading-[1.8]">
              Silence the noise. Feel everything.<br /><br />
              Designed for discerning audiophiles and acoustic purists.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <div className="text-[10px] font-semibold tracking-wider4 uppercase text-muted mb-4">{heading}</div>
              <ul className="flex flex-col gap-[10px] list-none">
                {links.map(l => (
                  <li key={l.label}>
                    <a href={l.href} onClick={e => smoothTo(e, l.href)}
                      className="text-[13px] text-off no-underline hover:text-white transition-colors duration-200">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-7 border-t border-border text-[11px] text-muted">
          <span>&copy; 2026 AURIX Audio Systems Inc. All rights reserved.</span>
          <span>Privacy Notice · Terms of Sale · Accessibility</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          footer .grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          footer .grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  )
}
