import { useState, useEffect, useRef } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'
import { useReactToPrint } from 'react-to-print'

const STATUS_COLOR = {
  pending:   'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  confirmed: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  preparing: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  shipped:   'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  delivered: 'text-green-400 bg-green-500/10 border-green-500/20',
  cancelled: 'text-red bg-red/10 border-red/20',
}

export default function AdminBillings() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [dateFrom,setDateFrom]= useState('')
  const [dateTo,  setDateTo]  = useState('')
  const [selected,setSelected]= useState(null)

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [])

  const filtered = orders.filter(o => {
    const s = search.toLowerCase()
    const matchSearch = !s ||
      (o.orderId||o.id).toLowerCase().includes(s) ||
      o.customerName?.toLowerCase().includes(s) ||
      o.customerPhone?.includes(s)

    let matchDate = true
    if (dateFrom || dateTo) {
      const d = o.createdAt?.toDate ? o.createdAt.toDate() : null
      if (d) {
        if (dateFrom) matchDate = matchDate && d >= new Date(dateFrom)
        if (dateTo) {
          const end = new Date(dateTo); end.setHours(23,59,59,999)
          matchDate = matchDate && d <= end
        }
      }
    }
    return matchSearch && matchDate
  })

  // Summary stats
  const totalRevenue  = filtered.filter(o => o.status === 'delivered').reduce((s,o) => s+(o.totalAmount||0), 0)
  const totalDelivery = filtered.filter(o => o.status === 'delivered').reduce((s,o) => s+(o.deliveryFee||0), 0)
  const totalProducts = totalRevenue - totalDelivery
  const pending       = filtered.filter(o => o.status === 'pending').reduce((s,o) => s+(o.totalAmount||0), 0)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-white/20 border-t-red rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-white">Billings</h1>
        <p className="text-[12px] text-muted mt-0.5">Order billing history & financial records</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: 'Total Revenue',    value: `৳${totalRevenue.toLocaleString()}`,  color: '#22c55e', sub: 'Delivered orders' },
          { label: 'Product Revenue',  value: `৳${totalProducts.toLocaleString()}`, color: '#C1121F', sub: 'Excl. delivery fees' },
          { label: 'Delivery Collected',value:`৳${totalDelivery.toLocaleString()}`, color: '#3b82f6', sub: 'Pre-paid fees' },
          { label: 'Pending Amount',   value: `৳${pending.toLocaleString()}`,       color: '#f59e0b', sub: 'Awaiting delivery' },
        ].map(s => (
          <div key={s.label} className="rounded-[8px] border border-[#1a1a1a] px-4 py-4 relative overflow-hidden"
            style={{ background: '#0e0e0e' }}>
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10"
              style={{ background: s.color, filter: 'blur(20px)', transform: 'translate(30%,-30%)' }}/>
            <p className="text-[18px] font-display font-extrabold text-white tracking-[-0.02em]">{s.value}</p>
            <p className="text-[11px] font-semibold text-off mt-1">{s.label}</p>
            <p className="text-[10px] text-muted mt-0.5">{s.sub}</p>
            <div className="absolute bottom-0 left-0 h-[2px] w-full opacity-40" style={{ background: s.color }}/>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14"
            viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search by Order ID, Name, Phone..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0e0e0e] border border-[#1a1a1a] rounded-[6px] pl-9 pr-4 py-2.5
                       text-[13px] text-white placeholder-muted outline-none focus:border-[#333]
                       transition-colors duration-150"/>
        </div>
        <div className="flex gap-2 items-center">
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-[6px] px-3 py-2.5
                       text-[12px] text-white outline-none focus:border-[#333] transition-colors
                       [color-scheme:dark]"/>
          <span className="text-muted text-[12px]">to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-[6px] px-3 py-2.5
                       text-[12px] text-white outline-none focus:border-[#333] transition-colors
                       [color-scheme:dark]"/>
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo('') }}
              className="text-[11px] text-muted hover:text-red transition-colors px-2">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[8px] border border-[#1a1a1a] overflow-hidden" style={{ background: '#0a0a0a' }}>
        <div className="px-5 py-3 border-b border-[#151515] flex items-center justify-between">
          <p className="text-[11px] text-muted">{filtered.length} records</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] min-w-[800px]">
            <thead>
              <tr className="border-b border-[#151515]">
                {['Order ID','Date','Customer','Payment Method','Subtotal','Delivery Fee','Total','Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-wider2
                                         text-muted font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0f0f0f]">
              {filtered.map(o => (
                <tr key={o.id}
                  onClick={() => setSelected(o)}
                  className="hover:bg-[#0d0d0d] transition-colors duration-100 cursor-pointer">
                  <td className="px-4 py-3 font-mono font-bold text-red text-[11px]">
                    {o.orderId || o.id}
                  </td>
                  <td className="px-4 py-3 text-muted text-[11px] whitespace-nowrap">
                    {o.createdAt?.toDate
                      ? o.createdAt.toDate().toLocaleDateString('en-BD',
                          { day:'2-digit', month:'short', year:'numeric', timeZone:'Asia/Dhaka' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{o.customerName}</p>
                    <p className="text-muted text-[10px]">{o.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-off">{o.paymentLabel}</p>
                    <p className="text-muted text-[10px] font-mono">{o.trxId}</p>
                  </td>
                  <td className="px-4 py-3 text-off">৳{o.subtotal?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-green-400 font-semibold">৳{o.deliveryFee?.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-white">৳{o.totalAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                                      tracking-wider border ${STATUS_COLOR[o.status] || 'text-muted bg-[#141414] border-[#222]'}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-[#1a1a1a] bg-[#0d0d0d]">
                  <td colSpan={4} className="px-4 py-3 text-[11px] font-bold text-muted uppercase tracking-wider2">
                    Totals ({filtered.length} records)
                  </td>
                  <td className="px-4 py-3 font-bold text-off">
                    ৳{filtered.reduce((s,o) => s+(o.subtotal||0), 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-bold text-green-400">
                    ৳{filtered.reduce((s,o) => s+(o.deliveryFee||0), 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-black text-white text-[13px]">
                    ৳{filtered.reduce((s,o) => s+(o.totalAmount||0), 0).toLocaleString()}
                  </td>
                  <td/>
                </tr>
              </tfoot>
            )}
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-muted text-[12px] py-10">No billing records found</p>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selected && <BillingDetailModal order={selected} onClose={() => setSelected(null)}/>}
    </div>
  )
}

function BillingDetailModal({ order, onClose }) {
  const printRef = useRef(null)
  const handlePrint = useReactToPrint({ content: () => printRef.current })

  return (
    <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="w-full max-w-[500px] rounded-[8px] border border-[#1a1a1a] overflow-hidden
                      max-h-[85vh] flex flex-col"
        style={{ background: '#0a0a0a' }} onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a] flex-shrink-0">
          <p className="text-[13px] font-bold text-white">Billing Detail</p>
          <div className="flex gap-2">
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red text-white rounded-[6px]
                         text-[11px] font-semibold hover:bg-red/90 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print
            </button>
            <button onClick={onClose} className="text-muted hover:text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-5" ref={printRef}>
          <div className="space-y-4">
            <Row label="Order ID"        value={order.orderId || order.id} bold mono/>
            <Row label="Date"            value={order.createdAt?.toDate
              ? order.createdAt.toDate().toLocaleString('en-BD',{ day:'2-digit', month:'short',
                  year:'numeric', hour:'2-digit', minute:'2-digit', hour12:true, timeZone:'Asia/Dhaka' })
              : '—'}/>
            <Row label="Status"          value={order.status?.toUpperCase()} />
            <div className="border-t border-[#151515] pt-4">
              <Row label="Customer"      value={order.customerName} />
              <Row label="Phone"         value={order.customerPhone} />
              <Row label="Address"       value={order.deliveryAddress} />
              <Row label="Delivery Zone" value={order.deliveryLabel} />
            </div>
            <div className="border-t border-[#151515] pt-4">
              <Row label="Payment"       value={order.paymentLabel} />
              <Row label="Sender No."    value={order.senderNumber} />
              <Row label="TRX ID"        value={order.trxId} mono/>
            </div>
            <div className="border-t border-[#151515] pt-4 space-y-1">
              {(order.items||[]).map((item,i) => (
                <div key={i} className="flex justify-between text-[12px]">
                  <span className="text-off">{item.name} × {item.qty}</span>
                  <span className="font-semibold text-white">৳{item.subtotal?.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#1a1a1a] pt-4 space-y-2">
              <Row label="Subtotal"      value={`৳${order.subtotal?.toLocaleString()}`} />
              <Row label="Delivery Fee"  value={`৳${order.deliveryFee?.toLocaleString()}`} green/>
              <Row label="Total"         value={`৳${order.totalAmount?.toLocaleString()}`} bold highlight/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, bold, mono, highlight, green }) {
  if (!value) return null
  return (
    <div className="flex justify-between items-start gap-4 py-1">
      <span className="text-[11px] text-muted flex-shrink-0">{label}</span>
      <span className={`text-right text-[12px] break-all
        ${highlight ? 'text-[14px] font-black text-red' : bold ? 'font-bold text-white' : 'text-off'}
        ${mono ? 'font-mono tracking-wider' : ''}
        ${green ? 'text-green-400' : ''}`}>
        {value}
      </span>
    </div>
  )
}
