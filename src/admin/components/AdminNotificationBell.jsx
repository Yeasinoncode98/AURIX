import { useState, useEffect, useRef } from 'react'
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'

export default function AdminNotificationBell() {
  const [orders,  setOrders]  = useState([])
  const [open,    setOpen]    = useState(false)
  const [toast,   setToast]   = useState(null)  // live toast popup
  const ref       = useRef(null)
  const prevCount = useRef(null)

  // Listen to pending orders real-time
  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setOrders(data)

      // Show toast if new order arrived (count increased)
      if (prevCount.current !== null && data.length > prevCount.current) {
        const newest = data[0]
        setToast({
          orderId: newest.orderId || newest.id,
          name:    newest.customerName,
          total:   newest.totalAmount,
        })
        setTimeout(() => setToast(null), 4000)
      }
      prevCount.current = data.length
    })
    return unsub
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const count = orders.length

  return (
    <>
      {/* ── Live toast popup ── */}
      {toast && (
        <div className="fixed top-5 right-5 z-[9999] animate-slide-in">
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-[8px] border border-red/30
                          shadow-2xl min-w-[280px]"
            style={{ background: 'linear-gradient(135deg, #141414, #0f0f0f)',
                     boxShadow: '0 8px 32px rgba(193,18,31,0.2)' }}>
            <div className="w-8 h-8 rounded-full bg-red/15 border border-red/30 flex items-center
                            justify-center flex-shrink-0 mt-0.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C1121F" strokeWidth="2">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-red uppercase tracking-wider2">New Order!</p>
              <p className="text-[13px] font-semibold text-white mt-0.5 truncate">{toast.name}</p>
              <p className="text-[11px] text-muted">
                {toast.orderId} · ৳{toast.total?.toLocaleString()}
              </p>
            </div>
            <button onClick={() => setToast(null)} className="text-muted hover:text-white mt-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Bell button + dropdown ── */}
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          className="relative w-9 h-9 rounded-[8px] bg-[#141414] border border-[#222]
                     flex items-center justify-center hover:border-[#333] transition-colors duration-150">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={count > 0 ? '#C1121F' : '#666'} strokeWidth="1.8">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
          {count > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red rounded-full
                             flex items-center justify-center text-[9px] font-bold text-white
                             border border-[#0c0c0c]">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 top-full mt-2 w-[320px] rounded-[8px] border border-[#1a1a1a]
                          overflow-hidden shadow-2xl z-[200]"
            style={{ background: '#0f0f0f' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
              <p className="text-[12px] font-bold text-white uppercase tracking-wider2">
                Pending Orders
              </p>
              {count > 0 && (
                <span className="px-2 py-0.5 bg-red/15 border border-red/30 rounded-full
                                 text-[10px] font-bold text-red">
                  {count} pending
                </span>
              )}
            </div>

            <div className="max-h-[320px] overflow-y-auto divide-y divide-[#151515]">
              {orders.length === 0 ? (
                <p className="text-[12px] text-muted text-center py-6">No pending orders</p>
              ) : (
                orders.slice(0, 8).map(order => (
                  <div key={order.id} className="px-4 py-3 hover:bg-[#141414] transition-colors duration-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-red">{order.orderId || order.id}</span>
                      <span className="text-[10px] text-muted">
                        {order.createdAt?.toDate
                          ? order.createdAt.toDate().toLocaleDateString('en-BD', { day: '2-digit', month: 'short' })
                          : '—'}
                      </span>
                    </div>
                    <p className="text-[12px] font-semibold text-white truncate">{order.customerName}</p>
                    <p className="text-[11px] text-muted">{order.customerPhone} · ৳{order.totalAmount?.toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>

            {count > 8 && (
              <div className="px-4 py-2.5 border-t border-[#1a1a1a] text-center">
                <span className="text-[11px] text-muted">+{count - 8} more pending orders</span>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease forwards; }
      `}</style>
    </>
  )
}
