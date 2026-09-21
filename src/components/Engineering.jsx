import { useRef } from 'react'
import useExplodedView from '../hooks/useExplodedView'

const PINS = [
  { id: 'pin-frame',   label: 'Aluminium Frame', sub: 'Frame',    className: 'top-[12%] right-[54%]',  left: true  },
  { id: 'pin-driver',  label: '40mm Graphene Driver', sub: 'Acoustic', className: 'top-[22%] left-[52%]', left: false },
  { id: 'pin-anc',     label: 'Adaptive ANC Core',    sub: 'Logic',    className: 'top-[48%] left-[52%]', left: false },
  { id: 'pin-mesh',    label: 'Acoustic Mesh',         sub: 'Acoustics',className: 'top-[40%] right-[54%]',left: true  },
  { id: 'pin-cushion', label: 'Memory Foam Cushion',   sub: 'Comfort',  className: 'bottom-[12%] right-[52%]', left: true },
  { id: 'pin-battery', label: '1000mAh Battery',       sub: 'Power',    className: 'bottom-[25%] left-[52%]', left: false },
]

const MOBILE_COMPONENTS = [
  { sub: 'Frame',    label: 'Aluminium Frame' },
  { sub: 'Acoustic', label: '40mm Graphene Driver' },
  { sub: 'Logic',    label: 'Adaptive ANC Core' },
  { sub: 'Acoustics',label: 'Acoustic Mesh' },
  { sub: 'Comfort',  label: 'Memory Foam Cushion' },
  { sub: 'Power',    label: '1000mAh Battery' },
]

export default function Engineering() {
  const canvasRef = useRef(null)
  const boxRef    = useRef(null)

  const {
    frame, autoPlaying, statusText,
    animateTo, scrubTo, toggleAutoPlay,
    stopAutoPlay, TOTAL_FRAMES,
  } = useExplodedView(canvasRef)

  const showPins = frame >= 55

  // Drag scrub
  const drag = useRef({ active: false, startX: 0, startFrame: 0 })

  const onPointerDown = (e) => {
    drag.current = { active: true, startX: e.clientX ?? e.touches?.[0]?.clientX ?? 0, startFrame: frame }
  }
  const onPointerMove = (e) => {
    if (!drag.current.active) return
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0
    const rect = boxRef.current.getBoundingClientRect()
    const shift = ((clientX - drag.current.startX) / rect.width) * (TOTAL_FRAMES - 1)
    scrubTo(Math.max(0, Math.min(TOTAL_FRAMES - 1, drag.current.startFrame + shift)))
  }
  const onPointerUp = () => { drag.current.active = false }

  const onClick = () => {
    if (autoPlaying) return
    animateTo(frame > 80 ? 0 : TOTAL_FRAMES - 1)
  }

  return (
    <section id="engineering" className="section-wrap relative" aria-label="Physical Construction & Exploded View">
      <div className="container-inner">
        {/* Header */}
        <div className="text-center max-w-[700px] mx-auto mb-14">
          <div className="eyebrow justify-center">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Interactive Deconstruction</span>
          </div>
          <h2 className="section-title">Built from the inside out.</h2>
          <p className="section-desc mx-auto">
            Hover or drag to separate the AURIX ONE into its core internal components. Experience every precision-engineered layer.
          </p>
        </div>

        {/* Stage */}
        <div className="flex flex-col items-center mb-14">
          {/* Canvas box */}
          <div
            ref={boxRef}
            id="exploded-box"
            className="relative w-full max-w-[820px] bg-black border border-border rounded-[4px] cursor-grab active:cursor-grabbing"
            style={{ aspectRatio: '16/9', boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 60px rgba(193,18,31,0.08)' }}
            onMouseDown={onPointerDown}
            onMouseMove={onPointerMove}
            onMouseUp={onPointerUp}
            onMouseLeave={onPointerUp}
            onTouchStart={onPointerDown}
            onTouchMove={onPointerMove}
            onTouchEnd={onPointerUp}
            onClick={onClick}
            role="region"
            aria-label="AURIX ONE interactive exploded view"
          >
            <canvas ref={canvasRef} id="exploded-canvas" width={960} height={540}
              className="w-full h-full block rounded-[4px]" aria-hidden="true" />

            {/* Desktop pins */}
            <div className="absolute inset-0 pointer-events-none z-10 hidden sm:block">
              {PINS.map(p => (
                <div key={p.id}
                  className={`absolute flex items-center gap-[10px] transition-all duration-400
                    ${p.left ? 'flex-row-reverse' : ''} ${p.className}
                    ${showPins ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[6px]'}`}
                  style={{ transitionTimingFunction: 'var(--ease-out)' }}
                >
                  <div className="w-[7px] h-[7px] rounded-full bg-red flex-shrink-0" style={{ boxShadow: '0 0 10px #C1121F' }} />
                  <div className="w-9 h-px flex-shrink-0"
                    style={{ background: p.left ? 'linear-gradient(270deg,#C1121F,rgba(193,18,31,0.3))' : 'linear-gradient(90deg,#C1121F,rgba(193,18,31,0.3))' }} />
                  <div className="bg-[rgba(14,14,14,0.92)] border border-border2 px-3 py-[6px] rounded-[2px] text-[10px] font-semibold tracking-wider2 uppercase text-white whitespace-nowrap backdrop-blur-[8px]">
                    <span className="block text-[8px] text-red tracking-wider3 mb-[2px]">{p.sub}</span>
                    {p.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile component cards */}
          <div className={`sm:hidden w-full max-w-[820px] mt-6 grid grid-cols-2 border border-border
            transition-all duration-400 ${showPins ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[10px] pointer-events-none'}`}
            style={{ background: '#222' }}>
            {MOBILE_COMPONENTS.map(c => (
              <div key={c.label} className="bg-void px-[14px] py-4 flex items-start gap-[10px] border-r border-b border-border last:border-r-0">
                <div className="w-[6px] h-[6px] rounded-full bg-red flex-shrink-0 mt-1" style={{ boxShadow: '0 0 8px #C1121F' }} />
                <div>
                  <span className="block text-[8px] font-semibold tracking-wider3 uppercase text-red mb-[3px]">{c.sub}</span>
                  <strong className="block font-display text-[11px] font-bold text-white tracking-[-0.01em]">{c.label}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="w-full max-w-[820px] mt-6 flex flex-col gap-4">
            <div className="flex items-center gap-[18px] w-full">
              <span className="text-[10px] font-semibold tracking-wider3 uppercase text-muted flex-shrink-0">Assembled</span>
              <input
                type="range" min="0" max={TOTAL_FRAMES - 1} value={frame}
                onChange={e => { stopAutoPlay(); scrubTo(e.target.value) }}
                className="flex-1 h-[4px] rounded-full appearance-none cursor-pointer bg-border2"
                style={{ accentColor: '#C1121F' }}
                aria-label="Exploded view scrubber"
              />
              <span className="text-[10px] font-semibold tracking-wider3 uppercase text-red flex-shrink-0">Exploded</span>
            </div>

            <div className="flex justify-between items-center text-[11px] text-off">
              <div className="flex items-center gap-2 text-[10px] tracking-wider2 uppercase text-off">
                <div className="w-[6px] h-[6px] rounded-full bg-red" />
                {statusText}
              </div>
              <div className="flex gap-[10px]">
                {[
                  { id: 'btn-normal',  label: 'Assembled', action: () => { stopAutoPlay(); animateTo(0) } },
                  { id: 'btn-explode', label: 'Exploded',  action: () => { stopAutoPlay(); animateTo(TOTAL_FRAMES - 1) } },
                ].map(b => (
                  <button key={b.id} type="button" onClick={b.action}
                    className="font-body text-[10px] font-semibold tracking-wider2 uppercase text-off
                               bg-surface border border-border2 px-[14px] py-[6px] rounded-[2px] cursor-pointer
                               hover:text-white hover:border-red hover:bg-red/15 transition-all duration-200">
                    {b.label}
                  </button>
                ))}
                <button type="button" onClick={toggleAutoPlay}
                  className={`font-body text-[10px] font-semibold tracking-wider2 uppercase
                               px-[14px] py-[6px] rounded-[2px] cursor-pointer border transition-all duration-200
                               ${autoPlaying ? 'text-white border-red bg-red/15' : 'text-off bg-surface border-border2 hover:text-white hover:border-red hover:bg-red/15'}`}>
                  {autoPlaying ? 'Pause' : 'Auto Play'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
