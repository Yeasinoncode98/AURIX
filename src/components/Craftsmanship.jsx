import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const materials = [
  {
    num: '01',
    name: 'Aircraft-Grade Aluminium',
    tag: 'Chassis & Frame',
    specVal: '6061-T6',
    specLbl: 'Alloy Grade',
    desc: 'CNC-milled from a single billet of 6061 aluminium. Anodised to a satin finish that resists scratching, fingerprints, and corrosion through years of use.',
    swatchColors: ['#6B7280', '#D1D5DB', '#9CA3AF', '#E5E7EB', '#6B7280'],
    accent: 'rgba(209,213,219,0.15)',
  },
  {
    num: '02',
    name: 'Triple-Layer Memory Foam',
    tag: 'Ear Cushions',
    specVal: '62mm',
    specLbl: 'Cushion Depth',
    desc: 'Temperature-responsive memory foam with breathable protein leather. Distributes clamping force evenly to prevent fatigue during extended listening.',
    swatchColors: ['#1C1C1C', '#404040', '#525252', '#3A3A3A', '#1C1C1C'],
    accent: 'rgba(82,82,82,0.2)',
  },
  {
    num: '03',
    name: 'Acoustic Fabric Mesh',
    tag: 'Driver Protection',
    specVal: '0.04mm',
    specLbl: 'Weave Porosity',
    desc: 'Ultra-fine woven mesh with sub-millimeter acoustic porosity. Tuned to allow sound transmission while filtering particulate contamination from driver assemblies.',
    swatchColors: ['#111', '#2A2A2A', '#1A1A1A', '#333', '#111'],
    accent: 'rgba(50,50,50,0.25)',
  },
]

export default function Craftsmanship() {
  const sectionRef = useRef(null)
  const headRef    = useRef(null)
  const cardRefs   = useRef([])
  const swatchRefs = useRef([])
  const numRefs    = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header entrance
      gsap.from(headRef.current.children, {
        opacity: 0, y: 40, duration: 0.9, ease: 'power3.out', stagger: 0.12,
        scrollTrigger: { trigger: headRef.current, start: 'top 80%', once: true },
      })

      // Cards: stagger slide up
      gsap.fromTo(cardRefs.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.15,
          scrollTrigger: { trigger: cardRefs.current[0], start: 'top 85%', once: true },
        }
      )

      // Swatch bar wipe — animate all bars inside each swatch container
      swatchRefs.current.forEach((el, i) => {
        if (!el) return
        const bars = el.parentElement.querySelectorAll('div')
        gsap.set(bars, { scaleX: 0, transformOrigin: 'left' })
        gsap.to(bars, {
          scaleX: 1, duration: 0.8, ease: 'power3.out', stagger: 0.06, delay: i * 0.1,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })

      // Large number parallax
      numRefs.current.forEach(el => {
        if (!el) return
        gsap.to(el, {
          yPercent: -20, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
        })
      })
    }, sectionRef)

    // 3D tilt
    const cleanup = []
    cardRefs.current.forEach(card => {
      if (!card) return
      const onMove = e => {
        const r = card.getBoundingClientRect()
        gsap.to(card, {
          rotateX: ((e.clientY - r.top) / r.height - 0.5) * 5,
          rotateY: ((e.clientX - r.left) / r.width - 0.5) * -5,
          transformPerspective: 900, duration: 0.5, ease: 'power2.out',
        })
        card.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100) + '%')
        card.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100) + '%')
      }
      const onLeave = () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power2.out' })
      card.addEventListener('mousemove', onMove)
      card.addEventListener('mouseleave', onLeave)
      cleanup.push(() => { card.removeEventListener('mousemove', onMove); card.removeEventListener('mouseleave', onLeave) })
    })

    return () => { ctx.revert(); cleanup.forEach(f => f()) }
  }, [])

  return (
    <section id="craftsmanship" className="section-wrap overflow-hidden" aria-label="Materials & Craftsmanship">
      <div className="container-inner">

        {/* Header */}
        <div ref={headRef} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20">
          <div>
            <div className="eyebrow">
              <div className="eyebrow-line" />
              <span className="eyebrow-text">Materials Science</span>
            </div>
            <h2 className="section-title mb-0">Crafted to last<br />a lifetime.</h2>
          </div>
          <p className="section-desc md:max-w-[380px] md:text-right">
            Every material was selected for acoustic properties first, then engineered to meet aerospace durability standards.
          </p>
        </div>

        {/* Material Cards */}
        <div className="flex flex-col gap-[1px] bg-border border border-border">
          {materials.map((m, i) => (
            <div
              key={m.num}
              ref={el => cardRefs.current[i] = el}
              className="group relative bg-void overflow-hidden cursor-default"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Cursor glow */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'radial-gradient(circle 300px at var(--gx,50%) var(--gy,50%), rgba(193,18,31,0.07) 0%, transparent 70%)' }} />

              {/* Red left border on hover */}
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-red scale-y-0 origin-top transition-transform duration-500 group-hover:scale-y-100"
                style={{ transitionTimingFunction: 'var(--ease-out)' }} />

              <div className="grid md:grid-cols-[100px_1fr_1fr_160px] items-center gap-6 px-8 md:px-10 py-10 md:py-12">

                {/* Large number */}
                <div ref={el => numRefs.current[i] = el}
                  className="hidden md:block font-display font-extrabold text-[72px] leading-none tracking-[-0.05em] select-none"
                  style={{ color: m.accent, WebkitTextStroke: `1px ${m.accent}` }}>
                  {m.num}
                </div>

                {/* Name + swatch */}
                <div>
                  <span className="block text-[10px] font-semibold tracking-wider3 uppercase text-red mb-3">{m.tag}</span>
                  <h3 className="font-display text-[22px] md:text-[26px] font-bold tracking-[-0.03em] leading-[1.1] mb-4 transition-colors duration-300 group-hover:text-white">
                    {m.name}
                  </h3>
                  {/* Animated swatch */}
                  <div className="flex gap-[3px] items-center h-[3px]" aria-hidden="true">
                    {m.swatchColors.map((c, j) => (
                      <div
                        key={j}
                        className="h-full flex-1 rounded-full"
                        style={{ background: c, transformOrigin: 'left', transform: 'scaleX(0)' }}
                        ref={j === 0 ? el => swatchRefs.current[i] = el : undefined}
                      />
                    ))}
                  </div>
                </div>

                {/* Description */}
                <p className="text-[13px] text-off leading-[1.85]">{m.desc}</p>

                {/* Spec */}
                <div className="text-left md:text-right">
                  <strong className="block font-display text-[32px] font-extrabold tracking-[-0.04em] text-white leading-none mb-1">
                    {m.specVal}
                  </strong>
                  <span className="text-[10px] tracking-wider3 uppercase text-muted">{m.specLbl}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom strip */}
        <div className="mt-[1px] bg-void border-x border-b border-border grid grid-cols-3 divide-x divide-border">
          {[
            ['IPX4', 'Weather Resistance'],
            ['2yr',  'Warranty Coverage'],
            ['261g', 'Total Mass'],
          ].map(([val, lbl]) => (
            <div key={lbl} className="py-6 text-center group hover:bg-surface transition-colors duration-300">
              <span className="block font-display text-[20px] font-bold tracking-[-0.03em] text-white mb-1
                               transition-colors duration-300 group-hover:text-red">{val}</span>
              <span className="text-[10px] tracking-wider3 uppercase text-muted">{lbl}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
