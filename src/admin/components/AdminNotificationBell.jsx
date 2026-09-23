import { useState, useEffect, useRef } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'

export default function AdminNotificationBell() {
  const [pendingOrders, setPendingOrders] = useState([])
  const [open,          setOpen]          = useState(false)
  const [seen,          setSeen]          = useState(false)
  const [toasts,        setToasts]        = useState([])
  const ref         = useRef(null)
  const knownIds    = useRef(null)   // null = not yet initialized

  useEffect(() => {
    // Listen to ALL orders — no where/orderBy = no index needed
    const unsub = onSnapshot(collection(db, 'orders'), snap => {
      const allOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }))

      // Client-side filter: pending only, sorted newest first
      const pending = allOrders
        .filter(o => o.status === 'pending')
        .sort((a, b) => {
          const at = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0)
          const bt = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0)
          return bt - at
        })

      setPendingOrders(pending)

      const currentIds = new Set(pending.map(o => o.id))

      if (knownIds.current === null) {
        // First load — just save, no toast
        knownIds.current = currentIds
        return
      }

      // Find new pending orders since last snapshot
      const newOrders = pending.filter(o => !knownIds.current.has(o.id))
      knownIds.current = currentIds

      if (newOrders.length > 0) {
        setSeen(false)
        newOrders.forEach(order => {
          const tid = order.id + '_' + Date.now()
          setToasts(prev => [...prev, {
            tid,
            orderId: order.orderId || order.id,
            name:    order.customerName  || 'Customer',
            total:   order.totalAmount   || 0,
            phone:   order.customerPhone || '',
          }])
          // Auto-dismiss after 6s
          setTimeout(() => setToasts(prev => prev.filter(t => t.tid !== tid)), 6000)
        })
      }
    })

    return unsub
  }, [])

  // Close on outside click
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const toggle      = () => { setOpen(o => !o); setSeen(true) }
  const dismiss     = tid => setToasts(prev => prev.filter(t => t.tid !== tid))
  const hasUnread   = !seen && pendingOrders.length > 0

  return (
    <>
      {/* ══ Toast popups (top-right) ══ */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
        style={{ maxWidth: 320 }}>
        {toasts.map(t => (
          <div key={t.tid}
            className="pointer-events-auto flex items-start gap-3 px-4 py-3.5
                       rounded-[8px] border shadow-2xl"
            style={{
              background:  'linear-gradient(135deg,#161616,#0f0f0f)',
              borderColor: 'rgba(193,18,31,0.35)',
              boxShadow:   '0 8px 32px rgba(193,18,31,0.2)',
              animation:   'notif-in 0.3s ease forwards',
            }}>
            <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
              style={{ background:'rgba(193,18,31,0.12)', border:'1px solid rgba(193,18,31,0.3)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C1121F" strokeWidth="2">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-red uppercase tracking-widest leading-none">
                🔔 New Order Received!
              </p>
              <p className="text-[13px] font-bold text-white mt-1.5 truncate">{t.name}</p>
              <p className="text-[11px] text-muted mt-0.5 font-mono">{t.orderId}</p>
              <p className="text-[11px] text-off font-semibold mt-0.5">
                ৳{Number(t.total).toLocaleString()}
                {t.phone ? <span className="text-muted font-normal"> · {t.phone}</span> : null}
              </p>
            </div>
            <button onClick={() => dismiss(t.tid)}
              className="text-muted hover:text-white flex-shrink-0 mt-0.5 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* ══ Bell button ══ */}
      <div ref={ref} className="relative">
        <button onClick={toggle}
          className="relative w-9 h-9 rounded-[8px] bg-[#141414] border border-[#222]
                     flex items-center justify-center hover:border-[#333] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={hasUnread ? '#C1121F' : '#555'} strokeWidth="1.8"
            style={hasUnread ? { animation:'bell-shake 1.2s ease infinite' } : {}}>
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
          {hasUnread && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1
                             bg-red rounded-full flex items-center justify-center
                             text-[9px] font-black text-white border-2 border-[#0c0c0c]"
              style={{ animation:'badge-glow 2s ease infinite' }}>
              {pendingOrders.length > 9 ? '9+' : pendingOrders.length}
            </span>
          )}
        </button>

        {/* ══ Dropdown ══ */}
        {open && (
          <div className="absolute right-0 top-full mt-2 w-[320px] rounded-[8px]
                          border border-[#1a1a1a] overflow-hidden shadow-2xl z-[200]"
            style={{ background:'#0f0f0f' }}>

            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
              <p className="text-[12px] font-bold text-white uppercase tracking-wider2">
                Pending Orders
              </p>
              {pendingOrders.length > 0 && (
                <span className="px-2 py-0.5 bg-red/15 border border-red/25 rounded-full
                                 text-[10px] font-black text-red">
                  {pendingOrders.length} pending
                </span>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto divide-y divide-[#131313]">
              {pendingOrders.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-2">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                  </svg>
                  <p className="text-[12px] text-muted">No pending orders</p>
                </div>
              ) : (
                pendingOrders.slice(0, 10).map(order => (
                  <div key={order.id}
                    className="px-4 py-3 hover:bg-[#141414] transition-colors duration-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-black text-red font-mono">
                        {order.orderId || order.id}
                      </span>
                      <span className="text-[10px] text-muted">
                        {order.createdAt?.toDate
                          ? order.createdAt.toDate().toLocaleString('en-BD', {
                              day:'2-digit', month:'short',
                              hour:'2-digit', minute:'2-digit',
                              hour12:true, timeZone:'Asia/Dhaka',
                            })
                          : '—'}
                      </span>
                    </div>
                    <p className="text-[13px] font-semibold text-white">{order.customerName}</p>
                    <p className="text-[11px] text-muted mt-0.5">
                      {order.customerPhone} · ৳{order.totalAmount?.toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            {pendingOrders.length > 0 && (
              <div className="px-4 py-2.5 border-t border-[#1a1a1a] text-center">
                <a href="/admin/orders"
                  className="text-[11px] text-red hover:text-red/80 font-semibold transition-colors">
                  View all orders →
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes notif-in {
          from { opacity:0; transform:translateX(24px) scale(0.96); }
          to   { opacity:1; transform:translateX(0)    scale(1); }
        }
        @keyframes bell-shake {
          0%,90%,100% { transform:rotate(0); }
          92%  { transform:rotate(12deg); }
          94%  { transform:rotate(-10deg); }
          96%  { transform:rotate(8deg); }
          98%  { transform:rotate(-6deg); }
        }
        @keyframes badge-glow {
          0%,100% { box-shadow:0 0 0 0 rgba(193,18,31,0.6); }
          50%     { box-shadow:0 0 0 5px rgba(193,18,31,0); }
        }
      `}</style>
    </>
  )
}
