import { useState, useEffect, useRef } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'
import { useReactToPrint } from 'react-to-print'

function bdDate(ts) {
  if (!ts?.toDate) return null
  return new Date(ts.toDate().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }))
}

export default function AdminReports() {
  const [orders,    setOrders]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [mode,      setMode]      = useState('month')  // month | year | range
  const [selMonth,  setSelMonth]  = useState(() => {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  })
  const [selYear,   setSelYear]   = useState(() => String(new Date().getFullYear()))
  const [dateFrom,  setDateFrom]  = useState('')
  const [dateTo,    setDateTo]    = useState('')
  const [ceoSigned, setCeoSigned] = useState(false)
  const [ceoName,   setCeoName]   = useState('')
  const printRef = useRef(null)
  const handlePrint = useReactToPrint({ content: () => printRef.current })

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [])

  // Filter orders based on selected mode
  const filtered = orders.filter(o => {
    const d = bdDate(o.createdAt)
    if (!d) return false
    if (mode === 'month') {
      const [y,m] = selMonth.split('-')
      return d.getFullYear()===Number(y) && d.getMonth()+1===Number(m)
    }
    if (mode === 'year') return d.getFullYear()===Number(selYear)
    if (mode === 'range' && dateFrom && dateTo) {
      const end = new Date(dateTo); end.setHours(23,59,59,999)
      return d >= new Date(dateFrom) && d <= end
    }
    return true
  })

  const delivered = filtered.filter(o => o.status === 'delivered')
  const pending   = filtered.filter(o => o.status === 'pending')
  const cancelled = filtered.filter(o => o.status === 'cancelled')
  const revenue   = delivered.reduce((s,o) => s+(o.totalAmount||0), 0)
  const delivery  = delivered.reduce((s,o) => s+(o.deliveryFee||0), 0)
  const product   = revenue - delivery

  const periodLabel = mode==='month' ? selMonth
    : mode==='year' ? selYear
    : (dateFrom && dateTo) ? `${dateFrom} to ${dateTo}` : 'All Time'

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-white/20 border-t-red rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-white">
            Monthly Reports
          </h1>
          <p className="text-[12px] text-muted mt-0.5">Generate, print & download sales reports</p>
        </div>
        <button onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 bg-red text-white rounded-[6px]
                     text-[12px] font-semibold hover:bg-red/90 transition-colors duration-150">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Print / Download PDF
        </button>
      </div>

      {/* Mode selector */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1.5">
          {[
            { id:'month', label:'Monthly' },
            { id:'year',  label:'Yearly' },
            { id:'range', label:'Date Range' },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`px-3 py-2 rounded-[6px] text-[11px] font-semibold border transition-all duration-150
                ${mode===m.id ? 'bg-red text-white border-red'
                  : 'bg-[#0e0e0e] text-muted border-[#1a1a1a] hover:text-white hover:border-[#333]'}`}>
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'month' && (
          <input type="month" value={selMonth} onChange={e => setSelMonth(e.target.value)}
            className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-[6px] px-3 py-2
                       text-[13px] text-white outline-none focus:border-[#333] [color-scheme:dark]"/>
        )}
        {mode === 'year' && (
          <select value={selYear} onChange={e => setSelYear(e.target.value)}
            className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-[6px] px-3 py-2
                       text-[13px] text-white outline-none focus:border-[#333]">
            {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
        {mode === 'range' && (
          <div className="flex gap-2 items-center">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-[6px] px-3 py-2
                         text-[12px] text-white outline-none focus:border-[#333] [color-scheme:dark]"/>
            <span className="text-muted">to</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-[6px] px-3 py-2
                         text-[12px] text-white outline-none focus:border-[#333] [color-scheme:dark]"/>
          </div>
        )}
      </div>

      {/* CEO Sign option */}
      <div className="rounded-[8px] border border-[#1a1a1a] p-4 flex flex-col sm:flex-row
                      items-start sm:items-center gap-4"
        style={{ background: '#0e0e0e' }}>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setCeoSigned(s => !s)}
            className={`relative w-11 h-6 rounded-full transition-all duration-300
                        ${ceoSigned ? 'bg-green-500' : 'bg-[#222]'}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm
                              transition-all duration-300 ${ceoSigned ? 'left-[22px]' : 'left-0.5'}`}/>
          </button>
          <span className="text-[12px] text-off font-medium">Include CEO Signature</span>
        </div>
        {ceoSigned && (
          <input value={ceoName} onChange={e => setCeoName(e.target.value)}
            placeholder="CEO Full Name"
            className="flex-1 bg-[#111] border border-[#1a1a1a] rounded-[4px] px-3 py-2
                       text-[13px] text-white placeholder-muted outline-none
                       focus:border-[#333] transition-colors"/>
        )}
      </div>

      {/* Report preview */}
      <div className="rounded-[8px] border border-[#1a1a1a] overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1a1a1a] flex items-center justify-between"
          style={{ background: '#0d0d0d' }}>
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider2">Report Preview</p>
          <span className="text-[11px] text-off">{filtered.length} orders · {periodLabel}</span>
        </div>
        <div ref={printRef} style={{ background: '#fff', color: '#000' }}>
          <ReportContent
            orders={filtered}
            delivered={delivered}
            pending={pending}
            cancelled={cancelled}
            revenue={revenue}
            delivery={delivery}
            product={product}
            period={periodLabel}
            ceoSigned={ceoSigned}
            ceoName={ceoName}
          />
        </div>
      </div>
    </div>
  )
}

/* ── Printable Report Content ── */
function ReportContent({ orders, delivered, pending, cancelled, revenue, delivery, product, period, ceoSigned, ceoName }) {
  const now = new Date().toLocaleString('en-BD', {
    day:'2-digit', month:'long', year:'numeric',
    hour:'2-digit', minute:'2-digit', hour12:true, timeZone:'Asia/Dhaka',
  })

  const s = {
    page:     { fontFamily:'serif', padding:'32px 40px', color:'#111', minHeight:'100vh', background:'#fff' },
    header:   { textAlign:'center', marginBottom:24, paddingBottom:16, borderBottom:'2px solid #111' },
    logo:     { fontSize:28, fontWeight:900, letterSpacing:-1, color:'#C1121F' },
    subtitle: { fontSize:11, letterSpacing:3, textTransform:'uppercase', color:'#888', marginTop:2 },
    title:    { fontSize:18, fontWeight:700, marginTop:12, color:'#111' },
    meta:     { fontSize:11, color:'#666', marginTop:4 },
    section:  { marginTop:20 },
    secTitle: { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:2,
                color:'#888', borderBottom:'1px solid #eee', paddingBottom:4, marginBottom:12 },
    grid:     { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 },
    card:     { border:'1px solid #eee', borderRadius:6, padding:'10px 14px' },
    cardVal:  { fontSize:18, fontWeight:900, color:'#111' },
    cardLbl:  { fontSize:10, color:'#888', marginTop:2, textTransform:'uppercase', letterSpacing:1 },
    table:    { width:'100%', borderCollapse:'collapse', fontSize:11 },
    th:       { textAlign:'left', padding:'6px 8px', background:'#f5f5f5',
                fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:1, color:'#666' },
    td:       { padding:'6px 8px', borderBottom:'1px solid #f0f0f0', color:'#333' },
    tdBold:   { padding:'6px 8px', borderBottom:'1px solid #f0f0f0', fontWeight:700, color:'#111' },
    footer:   { marginTop:40, paddingTop:20, borderTop:'1px solid #eee' },
    sign:     { display:'flex', justifyContent:'space-between', alignItems:'flex-end' },
    signBox:  { textAlign:'center', minWidth:180 },
    signLine: { borderTop:'1px solid #333', marginTop:40, paddingTop:6, fontSize:11, color:'#555' },
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.logo}>AURIX</div>
        <div style={s.subtitle}>Premium Headphones</div>
        <div style={s.title}>Sales Report</div>
        <div style={s.meta}>Period: {period} &nbsp;·&nbsp; Generated: {now}</div>
      </div>

      {/* Summary */}
      <div style={s.section}>
        <div style={s.secTitle}>Summary</div>
        <div style={s.grid}>
          {[
            { label:'Total Orders',    val: orders.length },
            { label:'Delivered',       val: delivered.length },
            { label:'Pending',         val: pending.length },
            { label:'Cancelled',       val: cancelled.length },
            { label:'Total Revenue',   val: `৳${(revenue).toLocaleString()}` },
            { label:'Product Revenue', val: `৳${product.toLocaleString()}` },
            { label:'Delivery Fees',   val: `৳${delivery.toLocaleString()}` },
            { label:'Avg Order Value', val: delivered.length > 0 ? `৳${Math.round(revenue/delivered.length).toLocaleString()}` : '—' },
          ].map(c => (
            <div key={c.label} style={s.card}>
              <div style={s.cardVal}>{c.val}</div>
              <div style={s.cardLbl}>{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Order list */}
      <div style={s.section}>
        <div style={s.secTitle}>Order Details ({orders.length} orders)</div>
        <table style={s.table}>
          <thead>
            <tr>
              {['Order ID','Date','Customer','Phone','Items','Subtotal','Delivery','Total','Status'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td style={{ ...s.td, fontFamily:'monospace', color:'#C1121F', fontWeight:700 }}>
                  {o.orderId||o.id}
                </td>
                <td style={s.td}>
                  {o.createdAt?.toDate
                    ? o.createdAt.toDate().toLocaleDateString('en-BD',
                        { day:'2-digit', month:'short', year:'numeric', timeZone:'Asia/Dhaka' })
                    : '—'}
                </td>
                <td style={s.td}>{o.customerName}</td>
                <td style={s.td}>{o.customerPhone}</td>
                <td style={s.td}>{(o.items||[]).length}</td>
                <td style={s.td}>৳{o.subtotal?.toLocaleString()}</td>
                <td style={s.td}>৳{o.deliveryFee?.toLocaleString()}</td>
                <td style={s.tdBold}>৳{o.totalAmount?.toLocaleString()}</td>
                <td style={{ ...s.td,
                  color: o.status==='delivered'?'#16a34a' : o.status==='cancelled'?'#dc2626' : '#d97706',
                  textTransform:'capitalize', fontWeight:600 }}>
                  {o.status}
                </td>
              </tr>
            ))}
            {/* Totals row */}
            <tr style={{ background:'#f9f9f9' }}>
              <td colSpan={6} style={{ ...s.th, textAlign:'right' }}>TOTALS</td>
              <td style={s.th}>৳{delivery.toLocaleString()}</td>
              <td style={{ ...s.th, color:'#111', fontSize:12 }}>৳{revenue.toLocaleString()}</td>
              <td style={s.th}/>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer + CEO sign */}
      <div style={s.footer}>
        <div style={s.sign}>
          <div style={s.signBox}>
            <div style={s.signLine}>Prepared By</div>
            <div style={{ fontSize:10, color:'#999', marginTop:2 }}>AURIX Admin</div>
          </div>
          {ceoSigned && (
            <div style={s.signBox}>
              <div style={{ ...s.signLine, borderColor:'#C1121F' }}>
                {ceoName || 'CEO, AURIX'}
              </div>
              <div style={{ fontSize:10, color:'#999', marginTop:2 }}>Chief Executive Officer</div>
            </div>
          )}
          <div style={s.signBox}>
            <div style={s.signLine}>Verified Date</div>
            <div style={{ fontSize:10, color:'#999', marginTop:2 }}>{new Date().toLocaleDateString('en-BD',{day:'2-digit',month:'long',year:'numeric'})}</div>
          </div>
        </div>
        <div style={{ textAlign:'center', marginTop:24, fontSize:10, color:'#bbb' }}>
          AURIX Premium Headphones · Confidential Business Document
        </div>
      </div>
    </div>
  )
}
