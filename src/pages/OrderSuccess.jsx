import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

export default function OrderSuccess() {
  const { state }  = useLocation()
  const navigate   = useNavigate()
  const contentRef = useRef(null)

  const [order, setOrder]     = useState(null)
  const [loading, setLoading] = useState(true)

  // Redirect if no orderId in state
  useEffect(() => {
    if (!state?.orderId) { navigate('/shop', { replace: true }); return }

    // Fetch the full order from Firestore for complete details
    getDoc(doc(db, 'orders', state.orderId))
      .then(snap => {
        if (snap.exists()) {
          const data = snap.data()
          // Derive missing fields for older orders
          const deliveryFee = data.deliveryFee ?? 0
          const totalAmount = data.totalAmount ?? state.total ?? 0
          const subtotal    = data.subtotal ?? (totalAmount - deliveryFee)
          setOrder({ id: snap.id, ...data, subtotal, deliveryFee, totalAmount })
        } else {
          // Fallback: use state data
          const totalAmount = state.total ?? 0
          const deliveryFee = state.deliveryFee ?? 0
          const subtotal    = totalAmount - deliveryFee
          setOrder({
            orderId:       state.orderId,
            customerName:  state.name,
            paymentLabel:  state.payment,
            deliveryLabel: state.delivery,
            totalAmount,
            deliveryFee,
            subtotal,
          })
        }
      })
      .catch(() => {
        const totalAmount = state.total ?? 0
        const deliveryFee = state.deliveryFee ?? 0
        const subtotal    = totalAmount - deliveryFee
        setOrder({
          orderId:       state.orderId,
          customerName:  state.name,
          paymentLabel:  state.payment,
          deliveryLabel: state.delivery,
          totalAmount,
          deliveryFee,
          subtotal,
        })
      })
      .finally(() => setLoading(false))
  }, [state, navigate])

  // Fade-in animation once data is ready
  useEffect(() => {
    if (loading || !order) return
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
  }, [loading, order])

  if (!state?.orderId) return null

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 'var(--nav-h)' }}>
      <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )

  const firstName = order.customerName?.split(' ')[0] || 'Customer'

  // Format createdAt timestamp
  const orderDate = order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleString('en-BD', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      })
    : new Date().toLocaleString('en-BD', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      })

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

      <div ref={contentRef} className="relative z-[1] w-full max-w-[580px] text-center">

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
          Thank you, {firstName}!
        </h1>
        <p className="text-[14px] text-off leading-[1.8] mb-8 max-w-[420px] mx-auto">
          Your order has been received and saved. We'll verify your payment and confirm shortly.
        </p>

        {/* ── Order Details Card ── */}
        <div className="rounded-[8px] border border-border overflow-hidden mb-5 text-left"
          style={{ background: 'linear-gradient(160deg, #141414, #0f0f0f)' }}>

          {/* Header row */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <span className="text-[11px] uppercase tracking-wider2 text-muted">Order ID</span>
            <span className="font-display font-bold text-[15px] tracking-[-0.02em] text-red">
              {order.orderId || order.id}
            </span>
          </div>

          {/* Date & Time */}
          <Row label="Date & Time" value={orderDate} />

          {/* Customer */}
          <Row label="Customer"     value={order.customerName} />
          <Row label="Phone"        value={order.customerPhone} />
          <Row label="Address"      value={order.deliveryAddress} longValue />

          {/* Delivery */}
          <Row label="Delivery Zone" value={order.deliveryLabel} />

          {/* Payment */}
          <Row label="Payment Method"  value={order.paymentLabel} />
          <Row label="Sent From"       value={order.senderNumber} />
          <Row label="Transaction ID"  value={order.trxId} mono />
          <Row label="Paid To Number"  value={order.paymentNumber} />

          {/* Financials */}
          <Row label="Delivery Fee Paid"
               value={order.deliveryFee != null ? `৳${Number(order.deliveryFee).toLocaleString()} ✓ Already Paid` : null}
               green />

          {/* Big highlighted amount — what customer pays at door */}
          <div className="px-6 py-4 bg-red/5 border-b border-[#1a1a1a]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider2 text-muted mb-1">
                  Amount to Pay at Door
                </p>
                <p className="text-[10px] text-muted">
                  (Delivery ৳{order.deliveryFee ?? 0} already paid via {order.paymentLabel})
                </p>
              </div>
              <p className="font-display font-extrabold text-[28px] tracking-[-0.03em] text-white">
                ৳{(order.subtotal ?? (order.totalAmount - (order.deliveryFee ?? 0)))?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* ── Ordered Items ── */}
        {order.items?.length > 0 && (
          <div className="rounded-[8px] border border-border overflow-hidden mb-5 text-left"
            style={{ background: 'linear-gradient(160deg, #141414, #0f0f0f)' }}>
            <div className="px-6 py-4 border-b border-border">
              <p className="text-[11px] uppercase tracking-wider2 text-muted">Items Ordered</p>
            </div>
            <div className="divide-y divide-[#1a1a1a]">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-12 h-12 rounded-[4px] border border-border bg-surface
                                  flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-[80%] object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">{item.name}</p>
                    <p className="text-[11px] text-muted">Qty: {item.qty} × ৳{item.price?.toLocaleString()}</p>
                  </div>
                  <span className="text-[13px] font-bold text-white flex-shrink-0">
                    ৳{(item.subtotal ?? (item.price * item.qty))?.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What happens next */}
        <div className="rounded-[8px] border border-border px-6 py-5 mb-8 text-left"
          style={{ background: 'linear-gradient(135deg, #141414, #0f0f0f)' }}>
          <p className="text-[11px] uppercase tracking-wider2 text-muted mb-4">What happens next</p>
          <div className="space-y-3">
            {[
              'We verify your payment transaction ID',
              'Your order is packed and handed to courier',
              `Courier delivers — pay ৳${
                order.subtotal ?? (order.totalAmount - (order.deliveryFee ?? 0))
              } at door (delivery already paid)`,
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

/* ── Reusable detail row ── */
function Row({ label, value, highlight, mono, longValue, green }) {
  if (!value) return null
  return (
    <div className={`flex items-start justify-between px-6 py-3.5 border-b border-[#1a1a1a] last:border-0
                     ${highlight ? 'bg-red/5' : ''}`}>
      <span className="text-[12px] text-muted flex-shrink-0 mr-4">{label}</span>
      <span className={`text-right
        ${highlight ? 'text-white font-bold text-[14px]' : green ? 'text-green-400 font-semibold text-[13px]' : 'text-[13px] font-medium text-off'}
        ${mono ? 'font-mono tracking-wider' : ''}
        ${longValue ? 'max-w-[60%] leading-relaxed' : ''}`}>
        {value}
      </span>
    </div>
  )
}
