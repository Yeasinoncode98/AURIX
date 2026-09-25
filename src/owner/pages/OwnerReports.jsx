import { useState, useEffect, useRef } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'
import { useReactToPrint } from 'react-to-print'

function bdDate(ts) { if(!ts?.toDate)return null; return new Date(ts.toDate().toLocaleString('en-US',{timeZone:'Asia/Dhaka'})) }

export default function OwnerReports() {
  const [orders,setOrders]=useState([])
  const [mode,setMode]=useState('month')
  const [selMonth,setSelMonth]=useState(()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`})
  const [selYear,setSelYear]=useState(String(new Date().getFullYear()))
  const [from,setFrom]=useState('')
  const [to,setTo]=useState('')
  const [ceoSigned,setCeoSigned]=useState(false)
  const [ceoName,setCeoName]=useState('')
  const printRef=useRef(null)
  const handlePrint=useReactToPrint({content:()=>printRef.current})

  useEffect(()=>onSnapshot(collection(db,'orders'),s=>setOrders(s.docs.map(d=>({id:d.id,...d.data()})))),[])

  const filtered=orders.filter(o=>{
    const d=bdDate(o.createdAt); if(!d)return false
    if(mode==='month'){const[y,m]=selMonth.split('-');return d.getFullYear()===Number(y)&&d.getMonth()+1===Number(m)}
    if(mode==='year')return d.getFullYear()===Number(selYear)
    if(mode==='range'&&from&&to){const e=new Date(to);e.setHours(23,59,59,999);return d>=new Date(from)&&d<=e}
    return true
  })
  const delivered=filtered.filter(o=>o.status==='delivered')
  const revenue=delivered.reduce((s,o)=>s+(o.totalAmount||0),0)
  const delivery=delivered.reduce((s,o)=>s+(o.deliveryFee||0),0)
  const fmtDate=ts=>ts?.toDate?ts.toDate().toLocaleDateString('en-BD',{day:'2-digit',month:'short',year:'numeric',timeZone:'Asia/Dhaka'}):'—'
  const period=mode==='month'?selMonth:mode==='year'?selYear:`${from} to ${to}`
  const now=new Date().toLocaleString('en-BD',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:true,timeZone:'Asia/Dhaka'})

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-white">Reports</h1><p className="text-[12px] text-muted mt-0.5">Generate printable reports from real data</p></div>
        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2.5 text-black text-[12px] font-semibold rounded-[6px] border border-yellow-500/50" style={{background:'linear-gradient(135deg,#eab308,#a16207)'}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print / PDF
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {[['month','Monthly'],['year','Yearly'],['range','Date Range']].map(([v,l])=>(
          <button key={v} onClick={()=>setMode(v)} className={`px-3 py-2 rounded-[6px] text-[11px] font-semibold border transition-all ${mode===v?'text-black border-yellow-500':'bg-[#0e0e0e] text-muted border-[#1a1a1a] hover:text-white'}`} style={mode===v?{background:'linear-gradient(135deg,#eab308,#a16207)'}:{}}>{l}</button>
        ))}
        {mode==='month'&&<input type="month" value={selMonth} onChange={e=>setSelMonth(e.target.value)} className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-[6px] px-3 py-2 text-[12px] text-white outline-none [color-scheme:dark]"/>}
        {mode==='year'&&<select value={selYear} onChange={e=>setSelYear(e.target.value)} className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-[6px] px-3 py-2 text-[12px] text-white outline-none">{[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}</select>}
        {mode==='range'&&<><input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-[6px] px-3 py-2 text-[12px] text-white outline-none [color-scheme:dark]"/><span className="text-muted">to</span><input type="date" value={to} onChange={e=>setTo(e.target.value)} className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-[6px] px-3 py-2 text-[12px] text-white outline-none [color-scheme:dark]"/></>}
      </div>

      {/* Print content */}
      <div className="rounded-[8px] border border-[#1a1a1a] overflow-hidden">
        <div ref={printRef} style={{background:'#fff',color:'#111',fontFamily:'serif',padding:'32px 40px'}}>
          <div style={{textAlign:'center',marginBottom:24,paddingBottom:16,borderBottom:'2px solid #111'}}>
            <div style={{fontSize:26,fontWeight:900,color:'#C1121F',letterSpacing:-1}}>AURIX</div>
            <div style={{fontSize:9,color:'#888',letterSpacing:3,textTransform:'uppercase',marginTop:2}}>Premium Headphones — Owner Report</div>
            <div style={{fontSize:16,fontWeight:700,marginTop:10}}>Sales Report — {period}</div>
            <div style={{fontSize:11,color:'#666',marginTop:4}}>Generated: {now}</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
            {[['Total Orders',filtered.length],['Delivered',delivered.length],['Revenue','৳'+revenue.toLocaleString()],['Avg Order',delivered.length?'৳'+Math.round(revenue/delivered.length).toLocaleString():'—']].map(([l,v])=>(
              <div key={l} style={{border:'1px solid #eee',borderRadius:6,padding:'10px 14px'}}><div style={{fontSize:18,fontWeight:900}}>{v}</div><div style={{fontSize:9,color:'#888',textTransform:'uppercase',letterSpacing:1,marginTop:2}}>{l}</div></div>
            ))}
          </div>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <thead><tr>{['Order ID','Date','Customer','Items','Total','Status'].map(h=><th key={h} style={{textAlign:'left',padding:'6px 8px',background:'#f5f5f5',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:'#666'}}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(o=>(
                <tr key={o.id}>
                  <td style={{padding:'6px 8px',borderBottom:'1px solid #f0f0f0',fontFamily:'monospace',color:'#C1121F',fontWeight:700}}>{o.orderId||o.id}</td>
                  <td style={{padding:'6px 8px',borderBottom:'1px solid #f0f0f0',color:'#333'}}>{fmtDate(o.createdAt)}</td>
                  <td style={{padding:'6px 8px',borderBottom:'1px solid #f0f0f0'}}>{o.customerName}</td>
                  <td style={{padding:'6px 8px',borderBottom:'1px solid #f0f0f0',color:'#333'}}>{(o.items||[]).length}</td>
                  <td style={{padding:'6px 8px',borderBottom:'1px solid #f0f0f0',fontWeight:700}}>৳{o.totalAmount?.toLocaleString()}</td>
                  <td style={{padding:'6px 8px',borderBottom:'1px solid #f0f0f0',textTransform:'capitalize',color:o.status==='delivered'?'#16a34a':o.status==='cancelled'?'#dc2626':'#d97706',fontWeight:600}}>{o.status}</td>
                </tr>
              ))}
              <tr style={{background:'#f9f9f9'}}><td colSpan={4} style={{padding:'6px 8px',fontWeight:700,fontSize:10,textTransform:'uppercase',letterSpacing:1}}>TOTALS</td><td style={{padding:'6px 8px',fontWeight:900,fontSize:13}}>৳{revenue.toLocaleString()}</td><td/></tr>
            </tbody>
          </table>
          <div style={{marginTop:32,paddingTop:16,borderTop:'1px solid #eee',textAlign:'center',fontSize:10,color:'#bbb'}}>AURIX Owner Report · Confidential</div>
        </div>
      </div>
    </div>
  )
}
