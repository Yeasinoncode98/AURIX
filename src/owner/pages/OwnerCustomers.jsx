import { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'

export default function OwnerCustomers() {
  const [users,   setUsers]   = useState([])
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  useEffect(() => onSnapshot(collection(db,'users'),  s => { setUsers(s.docs.map(d=>({id:d.id,...d.data()}))); setLoading(false) }), [])
  useEffect(() => onSnapshot(collection(db,'orders'), s => setOrders(s.docs.map(d=>({id:d.id,...d.data()})))), [])

  const customers = users.filter(u=>u.role==='customer').map(u => {
    const userOrders = orders.filter(o=>o.userId===u.id||o.userEmail===u.email)
    const spent = userOrders.filter(o=>o.status==='delivered').reduce((s,o)=>s+(o.totalAmount||0),0)
    const lastOrder = userOrders.sort((a,b)=>{
      const at=a.createdAt?.toDate?a.createdAt.toDate():new Date(0)
      const bt=b.createdAt?.toDate?b.createdAt.toDate():new Date(0)
      return bt-at
    })[0]
    return { ...u, orderCount:userOrders.length, spent, lastOrder }
  }).sort((a,b)=>b.spent-a.spent)

  const filtered = customers.filter(c => {
    const s = search.toLowerCase()
    return !s || c.name?.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s)
  })

  const fmtDate = ts => ts?.toDate ? ts.toDate().toLocaleDateString('en-BD',{day:'2-digit',month:'short',year:'numeric',timeZone:'Asia/Dhaka'}) : '—'

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"/></div>

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-white">Customer Insights</h1>
        <p className="text-[12px] text-muted mt-0.5">Read-only · {customers.length} customers</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {label:'Total Customers',value:customers.length,color:'#3b82f6'},
          {label:'With Orders',value:customers.filter(c=>c.orderCount>0).length,color:'#22c55e'},
          {label:'Total Orders',value:customers.reduce((s,c)=>s+c.orderCount,0),color:'#8b5cf6'},
          {label:'Total Revenue',value:'৳'+customers.reduce((s,c)=>s+c.spent,0).toLocaleString(),color:'#eab308'},
        ].map(s=>(
          <div key={s.label} className="rounded-[8px] border border-[#1a1a1a] px-4 py-4 relative overflow-hidden" style={{background:'#0e0e0e'}}>
            <div className="absolute top-0 right-0 w-10 h-10 rounded-full opacity-10" style={{background:s.color,filter:'blur(12px)',transform:'translate(30%,-30%)'}}/>
            <p className="text-[18px] font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-muted uppercase tracking-wider2 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative max-w-md">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Search by name or email..." value={search} onChange={e=>setSearch(e.target.value)}
          className="w-full bg-[#0e0e0e] border border-[#1a1a1a] rounded-[6px] pl-9 pr-4 py-2.5 text-[13px] text-white placeholder-muted outline-none focus:border-[#333]"/>
      </div>

      <div className="rounded-[8px] border border-[#1a1a1a] overflow-hidden" style={{background:'#0a0a0a'}}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] min-w-[600px]">
            <thead>
              <tr className="border-b border-[#151515]">
                {['Customer','Email','Registered','Orders','Total Spent','Last Order'].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-wider2 text-muted font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0f0f0f]">
              {filtered.map(c=>(
                <tr key={c.id} className="hover:bg-[#0d0d0d] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] overflow-hidden flex-shrink-0"
                        style={{background:'linear-gradient(135deg,#C1121F,#8b0000)',color:'#fff'}}>
                        {c.photoURL?<img src={c.photoURL} alt="" className="w-full h-full object-cover"/>:(c.name||c.email||'C')[0].toUpperCase()}
                      </div>
                      <p className="font-semibold text-white">{c.name||'—'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-off">{c.email}</td>
                  <td className="px-4 py-3 text-muted text-[11px]">{fmtDate(c.createdAt)}</td>
                  <td className="px-4 py-3 font-bold text-white">{c.orderCount}</td>
                  <td className="px-4 py-3 font-bold" style={{color:'#eab308'}}>{c.spent>0?'৳'+c.spent.toLocaleString():'—'}</td>
                  <td className="px-4 py-3 text-muted text-[11px]">{c.lastOrder?fmtDate(c.lastOrder.createdAt):'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length===0&&<p className="text-center text-muted text-[12px] py-10">No customers found</p>}
        </div>
      </div>
    </div>
  )
}
