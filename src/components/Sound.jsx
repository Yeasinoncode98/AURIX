import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const cards = [
  {
    num: '01', title: 'Adaptive ANC Processor', tag: '−42dB Real-Time Reduction',
    body: 'Calculates environmental counter-noise 50,000 times per second. Seamlessly adjusts between intense commute noise and quiet office ambience.',
    icon: (
      <svg viewBox="0 0 38 38" fill="none" aria-hidden="true">
        <circle cx="19" cy="19" r="17" stroke="#C1121F" strokeWidth="1.5"/>
        <path d="M11 19c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#C1121F" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="19" cy="19" r="2.5" fill="#C1121F"/>
      </svg>
    ),
  },
  {
    num: '02', title: 'Spatial Audio & Head Tracking', tag: '360° Spherical Soundstage',
    body: 'Dynamic gyroscopic sensors track subtle head shifts, locking directional audio elements in 3D virtual space as if you were in the center of the recording room.',
    icon: (
      <svg viewBox="0 0 38 38" fill="none" aria-hidden="true">
        <ellipse cx="19" cy="19" rx="15" ry="7.5" stroke="#C1121F" strokeWidth="1.5"/>
        <ellipse cx="19" cy="19" rx="15" ry="7.5" stroke="#C1121F" strokeWidth="1.5" transform="rotate(60 19 19)"/>
        <ellipse cx="19" cy="19" rx="15" ry="7.5" stroke="#C1121F" strokeWidth="1.5" transform="rotate(120 19 19)"/>
        <circle cx="19" cy="19" r="2.5" fill="#C1121F"/>
      </svg>
    ),
  },
  {
    num: '03', title: '40mm Graphene Drivers', tag: 'Ultra-low <0.05% THD',
    body: 'Graphene diaphragm with diamond-like rigidity and featherlight inertia produces zero harmonic breakup across the full 4Hz to 40kHz range.',
    icon: (
      <svg viewBox="0 0 38 38" fill="none" aria-hidden="true">
        <circle cx="19" cy="19" r="13" stroke="#C1121F" strokeWidth="1.5"/>
        <circle cx="19" cy="19" r="6"  stroke="#C1121F" strokeWidth="1"/>
        <circle cx="19" cy="19" r="2"  fill="#C1121F"/>
      </svg>
    ),
  },
  {
    num: '04', title: '1000mAh Rapid Charge Battery', tag: '10 Min Charge = 4 Hours Play', hasBar: true,
    body: 'Enjoy up to 40 hours of playback with ANC active or 55 hours without. Ten minutes of USB-C quick charge provides four hours of uninterrupted listening.',
    icon: (
      <svg viewBox="0 0 38 38" fill="none" aria-hidden="true">
        <rect x="3" y="12" width="28" height="14" rx="2" stroke="#C1121F" strokeWidth="1.5"/>
        <path d="M31 16v6" stroke="#C1121F" strokeWidth="2.5" strokeLinecap="round"/>
        <rect x="6" y="15" width="18" height="8" rx="1" fill="#C1121F"/>
      </svg>
    ),
  },
]

const WAVE_BARS = Array.from({ length: 12 }, (_, i) => ({
  height: [24,32,18,28,36,20,30,22,34,16,28,20][i],
  delay:  [0, 0.1, 0.2, 0.05, 0.15, 0.25, 0.08, 0.18, 0.03, 0.13, 0.22, 0.07][i],
}))

export default function Sound() {
  const sectionRef = useRef(null)
  const cardRefs   = useRef([])
  const barRef     = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title entrance
      gsap.from('#sound .sound-title', {
        opacity: 0, y: 30, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '#sound .sound-head', start: 'top 85%', once: true },
      })

      // Set cards hidden first, then animate in
      gsap.set(cardRefs.current, { opacity: 0, y: 40 })
      gsap.to(cardRefs.current, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12,
        scrollTrigger: { trigger: '#sound .sound-cards-grid', start: 'top 85%', once: true },
      })

      // Battery bar
      ScrollTrigger.create({
        trigger: barRef.current,
        start: 'top 90%', once: true,
        onEnter: () => {
          if (barRef.current) gsap.to(barRef.current, { width: '85%', duration: 1.2, ease: 'power2.out' })
        },
      })
    }, sectionRef)

    // 3D tilt + glow on cards
    const cleanup = []
    cardRefs.current.forEach(card => {
      if (!card) return
      const onMove = e => {
        const r = card.getBoundingClientRect()
        const x = ((e.clientX - r.left) / r.width) * 100
        const y = ((e.clientY - r.top) / r.height) * 100
        card.style.setProperty('--mx', x + '%')
        card.style.setProperty('--my', y + '%')
        gsap.to(card, {
          rotateX: ((e.clientY - r.top) / r.height - 0.5) * 6,
          rotateY: ((e.clientX - r.left) / r.width - 0.5) * -6,
          transformPerspective: 800, duration: 0.4, ease: 'power2.out',
        })
      }
      const onLeave = () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5, ease: 'power2.out' })
      card.addEventListener('mousemove', onMove)
      card.addEventListener('mouseleave', onLeave)
      cleanup.push(() => { card.removeEventListener('mousemove', onMove); card.removeEventListener('mouseleave', onLeave) })
    })

    return () => { ctx.revert(); cleanup.forEach(fn => fn()) }
  }, [])

  return (
    <section id="sound" ref={sectionRef} className="section-wrap relative overflow-hidden" aria-label="Sound Architecture">
      {/* Ambient pulse */}
      <div className="absolute top-1/2 left-1/2 pointer-events-none w-[900px] h-[900px]" style={{
        transform: 'translate(-50%,-50%)',
        background: 'radial-gradient(ellipse, rgba(193,18,31,0.06) 0%, transparent 60%)',
        animation: 'sound-pulse 4s ease-in-out infinite',
        borderRadius: '50%',
      }} />

      <div className="container-inner relative z-[1]">
        {/* Head */}
        <div className="sound-head text-center max-w-[680px] mx-auto mb-20">
          <div className="eyebrow justify-center">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Audio Architecture</span>
          </div>
          <h2 className="section-title sound-title">Engineered to disappear.</h2>
          <p className="section-desc mx-auto">
            Quad-microphone array with real-time neural DSP filters distractions before sound waves ever reach your ear canal.
          </p>
          {/* Waveform */}
          <div className="flex items-center justify-center gap-1 mt-7 h-8" aria-hidden="true">
            {WAVE_BARS.map((b, i) => (
              <div key={i} className="w-[3px] rounded-full bg-red/70"
                style={{
                  height: b.height,
                  animation: `wave-anim 1.2s ease-in-out infinite`,
                  animationDelay: `${b.delay}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="sound-cards-grid grid gap-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {cards.map((c, i) => (
            <div
              key={c.num}
              ref={el => cardRefs.current[i] = el}
              className="group relative bg-surface border border-border rounded-[6px] p-10 overflow-hidden cursor-default"
            >
              {/* Top sweep line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-red scale-x-0 origin-left transition-transform duration-450 group-hover:scale-x-100" style={{ transitionTimingFunction: 'var(--ease-out)' }} />
              {/* Cursor glow */}
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none rounded-[6px]"
                style={{ background: 'radial-gradient(circle 200px at var(--mx,50%) var(--my,50%), rgba(193,18,31,0.1) 0%, transparent 70%)' }} />

              <span className="absolute top-5 right-6 font-display text-[11px] font-bold tracking-[0.1em] text-border2 transition-colors duration-300 group-hover:text-red/40">{c.num}</span>

              <div className="w-11 h-11 mb-6 transition-transform duration-400 group-hover:scale-[1.15] group-hover:rotate-[8deg]">
                {c.icon}
              </div>
              <h3 className="font-display text-[20px] font-bold tracking-[-0.02em] mb-3 transition-colors duration-250 group-hover:text-white">{c.title}</h3>
              <p className="text-[13px] text-off leading-[1.85] mb-6">{c.body}</p>
              <div className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-wider4 uppercase text-red">
                <span className="w-[14px] h-px bg-red flex-shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: c.tag }} />
              </div>
              {c.hasBar && (
                <div className="mt-4 h-[2px] bg-border2 rounded-full overflow-hidden">
                  <div ref={barRef} className="h-full bg-gradient-to-r from-red to-red/50 rounded-full" style={{ width: 0 }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #sound .sound-cards-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
