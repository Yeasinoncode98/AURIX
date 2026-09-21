import { useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function OrderSuccess() {
  const { state }  = useLocation()
  const navigate   = useNavigate()
  const contentRef = useRef(null)

  useEffect(() => {
    if (!state?.orderId) { navigate('/shop', { replace: true }); return }
    const el = contentRef.current
    if (el) {
      el.style.opacity = '0'
      el.style.transform = 'translateY(24px)'
      requestAnimationFrame(() => {
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
      })
    }
  }, [state, navigate])

  if (!state?.orderId) return null

  const { orderId, name, payment, delivery, total } = state

  const rows = [
    ['Customer',       name],
    ['Payment Method', payment],
    ['Delivery Zone',  delivery],
    ['Total Bill',     '৳' + total.toLocaleString()],
  ]

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 py-20"
      style={{ paddingTop: 'var(--nav-h)' }}>

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', top: '30%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(193,18,31,0.06) 0%, transparent 70%)',
        }} />
      </div>

      <div ref={contentRef} className="relative z-[1] w-full max-w-[520px] text-center">

        {/* Success icon */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute w-[140px] h-[140px] rounded-full border border-red/10"
            style={{ animation: 'orbit-rotate 6s linear infinite' }} />
          <div className="absolute w-[110px] h-[110px] rounded-full border border-red/20"
            style={{ animation: 'orbit-rotate 4s linear infinite reverse' }} />
          <div className="relative w-20 h-20 rounded-full bg-red/10 border-2 border-red flex items-center justify-center"
            style={{ boxShadow: '0 0 40px rgba(193,18,31,0.3)' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M6 16l7 7 13-13" stroke="#C1121F" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ strokeDasharray: 40, strokeDashoffset: 40, animation: 'dash-check 0.5s 0.2s ease forwards' }} />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div className="eyebrow justify-center mb-3">
          <span className="eyebrow-line" />
          <span className="eyebrow-text">Order Confirmed</span>
          <span className="eyebrow-line" />
        </div>
        <h1 className="font-display font-extrabold text-[36px] tracking-[-0.04em] text-white mb-3 leading-tight">
          Thank you, {name.split(' ')[0]}!
        </h1>
        <p className="text-[14px] text-off leading-[1.8] mb-8 max-w-[400px] mx-auto">
          Your order has been successfully received. We will process it shortly and reach out to confirm delivery.
        </p>

        {/* Order details card */}
        <div className="rounded-[8px] border border-border overflow-hidden mb-8 text-left"
          style={{ background: 'linear-gradient(160deg, #141414, #0f0f0f)' }}>

          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <span className="text-[11px] uppercase tracking-wider2 text-muted">Order ID</span>
            <span className="font-display font-bold text-[15px] tracking-[-0.02em] text-red">{orderId}</span>
          </div>

          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between px-6 py-3.5 border-b border-[#1a1a1a] last:border-0">
              <span className="text-[12px] text-muted">{label}</span>
              <span className={`text-[13px] font-medium ${label === 'Total Bill' ? 'text-white font-bold' : 'text-off'}`}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* What happens next */}
        <div className="rounded-[8px] border border-border px-6 py-5 mb-8 text-left"
          style={{ background: 'linear-gradient(135deg, #141414, #0f0f0f)' }}>
          <p className="text-[11px] uppercase tracking-wider2 text-muted mb-4">What happens next</p>
          <div className="space-y-3">
            {[
              'We verify your payment transaction',
              'Your order is packed and handed to courier',
              'You receive delivery within 2-5 working days',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full border border-red/40 flex items-center justify-center
                                 flex-shrink-0 text-[10px] font-bold text-red mt-0.5">
                  {i + 1}
                </span>
                <span className="text-[13px] text-off leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/shop" className="btn-primary" style={{ fontSize: '12px', padding: '13px 28px' }}>
            Continue Shopping
          </Link>
          <Link to="/" className="btn-ghost" style={{ fontSize: '11px', padding: '13px 28px' }}>
            Back to Home
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes dash-check { to { stroke-dashoffset: 0; } }
      `}</style>
    </main>
  )
}
