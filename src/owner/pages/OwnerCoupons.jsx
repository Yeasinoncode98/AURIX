import { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'

export default function OwnerCoupons() {
  const [coupons,  setCoupons]  = useState([])
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => onSnapshot(collection(db,'coupons'), s => { setCoupons(s.docs.map(d=>({id:d.id,...d.data()}))); setLoading(false) }), [])
  useEffect(() => onSnapshot(collection(db,'orders'),  s => setOrders(s.docs.map(d=>({id:d.id,...d.data()})))), [])

  const couponStats = coupons.map(c => {
    const used = orders.filter(o=>o.couponCode===c.code)
    const savings = used.reduce((s,o)=>s+(o.discount||0),0)
    return { ...c, usedCount:used.length, totalSavings:savings }
  })

  const fmtDate = ts => ts?.toDate ? ts.toDate().toLocaleDateString('en-BD',{day:'2-digit',month:'short',year:'numeric',timeZone:'Asia/Dhaka'}) : '—'

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"/></div>

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-white">Coupon Overview</h1>
        <p className="text-[12px] text-muted mt-0.5">Read-only · {coupons.length} coupons · {coupons.filter(c=>c.active).length} active</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {label:'Total Coupons',value:coupons.length,color:'#3b82f6'},
          {label:'Active',value:coupons.filter(c=>c.active).length,color:'#22c55e'},
          {label:'Times Used',value:couponStats.reduce((s,c)=>s+c.usedCount,0),color:'#eab308'},
          {label:'Total Savings Given',value:'৳'+couponStats.reduce((s,c)=>s+c.totalSavings,0).toLocaleString(),color:'#C1121F'},
        ].map(s=>(
          <div key={s.label} className="rounded-[8px] border border-[#1a1a1a] px-4 py-4 relative overflow-hidden" style={{background:'#0e0e0e'}}>
            <div className="absolute top-0 right-0 w-10 h-10 rounded-full opacity-10" style={{background:s.color,filter:'blur(12px)',transform:'translate(30%,-30%)'}}/>
            <p className="text-[18px] font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-muted uppercase tracking-wider2 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {couponStats.map(c=>(
          <div key={c.id} className="rounded-[8px] border border-[#1a1a1a] p-5" style={{background:'linear-gradient(160deg,#0e0e0e,#0a0a0a)'}}>
            <div className="flex items-start justify-between mb-3">
              <span className="font-mono font-black text-[20px] tracking-wide" style={{color:'#eab308'}}>{c.code}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.active?'text-green-400 bg-green-500/10 border-green-500/20':'text-muted bg-[#141414] border-[#222]'}`}>
                {c.active?'Active':'Inactive'}
              </span>
            </div>
            <p className="text-[14px] font-bold text-white mb-3">
              {c.type==='percent'?`${c.value}% OFF`:`৳${c.value} OFF`}
              {c.minOrder>0&&<span className="text-[11px] text-muted font-normal ml-2">min ৳{c.minOrder}</span>}
            </p>
            <p className="text-[12px] text-muted mb-3">{c.description||'No description'}</p>
            <div className="flex justify-between text-[11px] pt-3 border-t border-[#1a1a1a]">
              <span className="text-muted">Used <span className="font-bold text-white">{c.usedCount}x</span></span>
              <span className="text-muted">Savings: <span className="font-bold" style={{color:'#eab308'}}>৳{c.totalSavings.toLocaleString()}</span></span>
            </div>
          </div>
        ))}
        {couponStats.length===0&&(
          <div className="col-span-full text-center py-12 text-muted text-[13px]">No coupons created yet</div>
        )}
      </div>
    </div>
  )
}
