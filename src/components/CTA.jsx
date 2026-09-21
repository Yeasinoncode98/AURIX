export default function CTA() {
  const smoothTo = (e, href) => {
    e.preventDefault()
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="cta"
      aria-label="Order AURIX ONE"
      className="relative text-center border-t border-border overflow-hidden"
      style={{ padding: '160px 0', background: '#080808' }}
    >
      {/* Ambient glow */}
      <div className="absolute pointer-events-none" style={{
        top: '-150px', left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 500,
        background: 'radial-gradient(ellipse, rgba(193,18,31,0.12) 0%, transparent 70%)',
      }} />

      <div className="container-inner relative z-[1]">
        <div className="eyebrow justify-center">
          <div className="eyebrow-line" />
          <span className="eyebrow-text">Production Run Available</span>
        </div>

        <h2 className="font-display font-extrabold tracking-[-0.04em] leading-[0.95] mb-5"
          style={{ fontSize: 'clamp(40px, 6.5vw, 84px)' }}>
          Silence the <span className="text-red">noise.</span><br />Feel everything.
        </h2>

        <p className="text-[15px] text-off mb-9">
          Direct-from-lab worldwide shipping · 30-day in-home trial · 2-year warranty
        </p>

        <div className="flex items-baseline justify-center gap-3 mb-9">
          <span className="font-display font-extrabold tracking-[-0.03em]" style={{ fontSize: 52 }}>$449</span>
          <span className="text-[11px] tracking-wider2 uppercase text-muted">USD · Free Express Shipping</span>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <a href="#" className="btn-primary" style={{ padding: '16px 44px', fontSize: 13 }}>Order AURIX ONE</a>
          <a href="#engineering" onClick={e => smoothTo(e, '#engineering')} className="btn-ghost" style={{ padding: '16px 44px', fontSize: 13 }}>Review Architecture</a>
        </div>

        <p className="text-[11px] tracking-wider2 uppercase text-muted">
          In stock for immediate dispatch · Carbon neutral shipping
        </p>
      </div>
    </section>
  )
}
