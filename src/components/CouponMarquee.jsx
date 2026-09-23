import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

export default function CouponMarquee() {
  const [coupons, setCoupons] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'coupons'), where('active', '==', true))
    return onSnapshot(q, snap =>
      setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
  }, [])

  if (coupons.length === 0) return null

  const items = [...coupons, ...coupons, ...coupons]

  return (
    <div className="w-full overflow-hidden border-b border-[#1a1a1a]"
      style={{ background: 'linear-gradient(90deg, #0a0a0a, #110608, #0a0a0a)' }}>
      <div className="flex items-center">
        {/* Left label */}
        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5
                        border-r border-[#1a1a1a] bg-red/10 z-10">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C1121F" strokeWidth="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          <span className="text-[10px] font-black text-red uppercase tracking-wider2 whitespace-nowrap">
            Offers
          </span>
        </div>

        {/* Scrolling content */}
        <div className="overflow-hidden flex-1">
          <div className="flex gap-0 marquee-track">
            {items.map((c, i) => (
              <span key={i}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-[12px] whitespace-nowrap">
                <span className="text-muted">✦</span>
                <span className="text-off">Use code</span>
                <span className="font-mono font-black text-red tracking-wider">{c.code}</span>
                <span className="text-white font-semibold">
                  {c.type === 'percent' ? `${c.value}% OFF` : `৳${c.value} OFF`}
                </span>
                {c.minOrder > 0 && (
                  <span className="text-muted text-[11px]">on orders above ৳{c.minOrder}</span>
                )}
                {c.description && (
                  <span className="text-muted text-[11px]">· {c.description}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .marquee-track {
          animation: marquee-scroll 22s linear infinite;
          width: max-content;
        }
        .marquee-track:hover { animation-play-state: paused; }
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  )
}
