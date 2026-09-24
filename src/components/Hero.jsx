import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'

export default function Hero() {
  const contentRef = useRef(null)
  const imgRef     = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(contentRef.current.children, { opacity: 0, y: 30 })
      gsap.set(imgRef.current,              { opacity: 0, scale: 0.92 })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 })
      tl.to(contentRef.current.children, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 })
      tl.to(imgRef.current,              { opacity: 1, scale: 1, duration: 1.1 }, '-=0.5')
    })
    return () => ctx.revert()
  }, [])

  const smoothTo = (e, href) => {
    e.preventDefault()
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="hero"
      aria-label="Hero Section"
      className="relative flex items-center overflow-hidden"
      style={{
        minHeight: '100vh', maxHeight: '980px',
        paddingTop: 'calc(var(--nav-h) + 52px)',
        paddingBottom: '60px',
        background: `
          radial-gradient(ellipse 60% 50% at 75% 50%, rgba(193,18,31,0.12) 0%, transparent 70%),
          radial-gradient(ellipse 50% 50% at 20% 40%, rgba(20,20,20,0.8) 0%, transparent 60%),
          linear-gradient(180deg, #0d0d0d 0%, #080808 100%)
        `,
      }}
    >
      {/* Background rings */}
      <div className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none opacity-35 hidden lg:block">
        <div className="absolute inset-0 rounded-full border border-border2" />
        <div className="absolute inset-[120px] rounded-full border border-red/25" />
      </div>

      <div className="container-inner w-full">
        <div className="grid gap-10 items-center max-[960px]:grid-cols-1"
          style={{ gridTemplateColumns: '1.1fr 0.9fr' }}>
          {/* Content */}
          <div ref={contentRef} className="flex flex-col items-center text-center md:items-start md:text-left">
            <div className="eyebrow items-center">
              <div className="eyebrow-line" />
              <span className="eyebrow-text">AURIX ONE · Flagship Wireless</span>
            </div>
            <h1 className="font-display font-extrabold tracking-[-0.04em] leading-[0.96] mb-5"
              style={{ fontSize: 'clamp(44px, 5.8vw, 84px)' }}>
              Silence the <span className="text-red">noise.</span><br />Feel everything.
            </h1>
            <p className="text-off font-light leading-[1.7] mb-9 max-w-[520px]"
              style={{ fontSize: 'clamp(15px, 1.4vw, 18px)' }}>
              Engineered with 40mm graphene drivers, hybrid adaptive noise cancellation, and aircraft-grade aluminium for pure acoustic mastery.
            </p>
            <div className="flex flex-row gap-3 items-stretch mb-12 w-full sm:w-auto justify-center">
              <Link to="/shop"
                className="btn-primary flex-1 sm:flex-none text-center whitespace-nowrap"
                style={{ minWidth: 0 }}>
                Order Now — ৳449
              </Link>
              <a href="#engineering" onClick={e => smoothTo(e, '#engineering')}
                className="btn-ghost flex-1 sm:flex-none text-center whitespace-nowrap"
                style={{ minWidth: 0 }}>
                Explore Inside
              </a>
            </div>
            <div className="flex gap-10 pt-6 border-t border-border justify-center md:justify-start w-full">
              {[['40h','Playback'],['−42dB','Adaptive ANC'],['40mm','Graphene']].map(([val, lbl]) => (
                <div key={lbl}>
                  <strong className="block font-display text-[20px] font-bold tracking-[-0.02em] text-white">{val}</strong>
                  <span className="text-[11px] text-muted tracking-[0.1em] uppercase">{lbl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product image */}
          <div className="flex items-center justify-center max-[960px]:hidden">
            <img
              ref={imgRef}
              src="assets/aurix/aurix-product-showcase.png"
              alt="AURIX ONE Premium Wireless Headphones"
              className="w-full max-w-[540px] h-auto block"
              style={{
                filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.8)) drop-shadow(0 0 70px rgba(193,18,31,0.18))',
                animation: 'float-headphone 6s ease-in-out infinite',
              }}
              loading="eager"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
