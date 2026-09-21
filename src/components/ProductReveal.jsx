import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const stats = [
  { target: 40,  unit: 'h',  label: 'Battery Life (ANC on)' },
  { target: 42,  unit: 'dB', label: 'Peak Noise Attenuation' },
  { target: 5,   unit: 'ms', label: 'aptX Lossless Latency' },
  { target: 261, unit: 'g',  label: 'Featherweight Architecture' },
]

const badges = [
  { label: 'Driver', value: '40mm Graphene', className: 'top-[18%] right-[-2%]' },
  { label: 'ANC',    value: '−42dB Hybrid',  className: 'top-[52%] left-[-4%]' },
  { label: 'Weight', value: '261g Only',      className: 'bottom-[22%] right-[2%]' },
]

export default function ProductReveal() {
  const sectionRef  = useRef(null)
  const titleRef    = useRef(null)
  const descRef     = useRef(null)
  const imgWrapRef  = useRef(null)
  const imgRef      = useRef(null)
  const badgeRefs   = useRef([])
  const counterRefs = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial hidden states
      gsap.set([titleRef.current, descRef.current], { opacity: 0, y: 30 })
      gsap.set(imgWrapRef.current, { opacity: 0, scale: 0.88 })
      gsap.set(badgeRefs.current,  { opacity: 0, y: 16 })

      // Title entrance
      gsap.to(titleRef.current, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      })
      gsap.to(descRef.current, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.15,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      })

      // Image scale + fade
      gsap.to(imgWrapRef.current, {
        opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out', delay: 0.2,
        scrollTrigger: { trigger: imgWrapRef.current, start: 'top 90%', once: true },
      })

      // Parallax
      gsap.to(imgRef.current, {
        yPercent: -10, ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom', end: 'bottom top', scrub: true,
        },
      })

      // Badges stagger
      gsap.to(badgeRefs.current, {
        opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.4)', stagger: 0.15, delay: 0.6,
        scrollTrigger: { trigger: imgWrapRef.current, start: 'top 85%', once: true },
      })

      // Counters
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'bottom 90%',
        once: true,
        onEnter: () => {
          counterRefs.current.forEach((el, i) => {
            if (!el) return
            gsap.to({ val: 0 }, {
              val: stats[i].target, duration: 1.6, ease: 'power2.out', delay: 0.2,
              onUpdate() { el.textContent = Math.round(this.targets()[0].val) },
            })
          })
        },
      })

      // Stats slide up
      gsap.from('.reveal-stat-item', {
        opacity: 0, y: 20, duration: 0.6, ease: 'power2.out', stagger: 0.08,
        scrollTrigger: { trigger: '.reveal-stats-bar', start: 'top 95%', once: true },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="product-reveal"
      ref={sectionRef}
      aria-label="Product Reveal"
      className="relative border-t border-border overflow-hidden"
      style={{ background: '#000' }}
    >
      {/* Rotating conic ring */}
      <div className="absolute pointer-events-none" style={{
        top: '10%', left: '50%',
        width: 700, height: 700, borderRadius: '50%',
        background: 'conic-gradient(from 0deg, transparent 70%, rgba(193,18,31,0.12) 85%, transparent 100%)',
        animation: 'reveal-spin 12s linear infinite',
        transform: 'translateX(-50%)',
      }} />

      {/* Scan line */}
      <div className="absolute left-0 right-0 h-px pointer-events-none" style={{
        background: 'linear-gradient(90deg, transparent, rgba(193,18,31,0.5), transparent)',
        animation: 'scan-line 4s ease-in-out infinite',
      }} />

      {/* Stage */}
      <div className="container-inner relative z-[2]">
        <div className="flex flex-col items-center text-center pt-24">
          <div className="eyebrow justify-center">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Acoustic Precision</span>
          </div>

          <h2 ref={titleRef} className="font-display font-extrabold tracking-[-0.035em] leading-[1.02] mb-4"
            style={{ fontSize: 'clamp(32px,4.5vw,64px)' }}>
            Where precision<br />meets <span className="text-red">silence.</span>
          </h2>

          <p ref={descRef} className="text-[14px] text-off max-w-[460px] leading-[1.85] mb-14">
            AURIX ONE is sculpted for pristine sonic truth. Every micron refined through rigorous acoustic lab testing.
          </p>

          {/* Image */}
          <div ref={imgWrapRef} className="relative w-full max-w-[680px]">
            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none z-10"
              style={{ background: 'linear-gradient(to top, #000 0%, transparent 100%)' }} />

            {/* Orbit ring */}
            <div className="absolute pointer-events-none" style={{
              top: '50%', left: '50%',
              width: '90%', height: '90%', borderRadius: '50%',
              border: '1px dashed rgba(193,18,31,0.2)',
              animation: 'orbit-rotate 20s linear infinite',
              transform: 'translate(-50%,-50%)',
            }} />

            {/* Tech badges */}
            {badges.map((b, i) => (
              <div
                key={b.label}
                ref={el => badgeRefs.current[i] = el}
                className={`absolute z-20 bg-[rgba(14,14,14,0.92)] border border-border2 px-3 py-[6px]
                            rounded-[3px] text-[10px] font-semibold tracking-wider2 uppercase text-white
                            whitespace-nowrap backdrop-blur-[12px] hidden sm:block ${b.className}`}
              >
                <span className="block text-[8px] text-red tracking-wider3 mb-0.5">{b.label}</span>
                {b.value}
              </div>
            ))}

            <img
              ref={imgRef}
              src="assets/aurix/aurix-product-showcase.png"
              alt="AURIX ONE precision engineering"
              className="w-full h-auto block"
              style={{ filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.95)) drop-shadow(0 0 80px rgba(193,18,31,0.25))' }}
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="reveal-stats-bar grid border-t border-border relative z-[2]"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {stats.map((s, i) => (
          <div key={s.label} className="reveal-stat-item group py-9 px-6 text-center border-r border-border
                     last:border-r-0 relative overflow-hidden cursor-default transition-colors duration-300 hover:bg-red/5">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-red scale-x-0 origin-left
                            transition-transform duration-[400ms] group-hover:scale-x-100" />
            <div className="font-display font-extrabold tracking-[-0.03em] leading-none mb-2"
              style={{ fontSize: 'clamp(28px,3vw,44px)' }}>
              <span ref={el => counterRefs.current[i] = el}>{s.target}</span>
              <span className="text-red">{s.unit}</span>
            </div>
            <div className="text-[10px] tracking-wider3 uppercase text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 600px) {
          .reveal-stats-bar { grid-template-columns: 1fr 1fr !important; }
          .reveal-stat-item:nth-child(2) { border-right: none !important; }
          .reveal-stat-item:nth-child(3),
          .reveal-stat-item:nth-child(4) { border-top: 1px solid #222; }
          .reveal-stat-item:nth-child(4) { border-right: none !important; }
        }
      `}</style>
    </section>
  )
}
