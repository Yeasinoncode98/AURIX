import { useEffect, useState } from 'react'

export default function ShopIntro({ onDone }) {
  const [phase, setPhase] = useState(0)
  // phase 0: visible+animate, phase 1: fade out, phase 2: gone

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1800)
    const t2 = setTimeout(() => { setPhase(2); onDone() }, 2400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  if (phase === 2) return null

  return (
    <div className={`fixed inset-0 z-[2000] flex items-center justify-center bg-[#080808]
      transition-opacity duration-500 ${phase === 1 ? 'opacity-0' : 'opacity-100'}`}>

      {/* Outer glow ring */}
      <div className="absolute w-[320px] h-[320px] rounded-full border border-red/10 animate-ping-slow" />
      <div className="absolute w-[260px] h-[260px] rounded-full border border-red/20" style={{
        animation: 'orbit-rotate 4s linear infinite'
      }} />

      {/* Center content */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Headphone SVG */}
        <div style={{ animation: 'float-headphone 2s ease-in-out infinite' }}>
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Arc / headband */}
            <path d="M18 52 C18 28 78 28 78 52" stroke="#C1121F" strokeWidth="3" strokeLinecap="round" fill="none"
              style={{ strokeDasharray: 120, strokeDashoffset: 0, animation: 'dash-draw 1s ease forwards' }}/>
            {/* Left cup */}
            <rect x="10" y="50" width="16" height="26" rx="6" fill="#1a1a1a" stroke="#C1121F" strokeWidth="1.5"/>
            <rect x="13" y="55" width="10" height="16" rx="3" fill="#C1121F" opacity="0.2"/>
            {/* Right cup */}
            <rect x="70" y="50" width="16" height="26" rx="6" fill="#1a1a1a" stroke="#C1121F" strokeWidth="1.5"/>
            <rect x="73" y="55" width="10" height="16" rx="3" fill="#C1121F" opacity="0.2"/>
            {/* Inner glow dots */}
            <circle cx="18" cy="63" r="2" fill="#C1121F" opacity="0.6"/>
            <circle cx="78" cy="63" r="2" fill="#C1121F" opacity="0.6"/>
          </svg>
        </div>

        {/* Brand */}
        <div className="font-display font-extrabold text-[28px] tracking-[-0.03em] text-white"
          style={{ animation: 'fade-up 0.6s 0.4s both ease' }}>
          AUR<span className="text-red">I</span>X
        </div>

        {/* Loading bar */}
        <div className="w-32 h-[1px] bg-border overflow-hidden rounded-full"
          style={{ animation: 'fade-up 0.6s 0.5s both ease' }}>
          <div className="h-full bg-red rounded-full" style={{ animation: 'load-bar 1.4s 0.3s ease forwards', width: 0 }} />
        </div>

        {/* Label */}
        <p className="text-[10px] tracking-wider4 uppercase text-muted"
          style={{ animation: 'fade-up 0.6s 0.6s both ease' }}>
          Loading Collection
        </p>
      </div>

      <style>{`
        @keyframes dash-draw {
          from { stroke-dashoffset: 120; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes load-bar {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ping-slow {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50%       { transform: scale(1.08); opacity: 0; }
        }
        .animate-ping-slow { animation: ping-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
