import { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'

export default function OwnerInventory() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')

  useEffect(() => onSnapshot(collection(db,'products'), s => {
    const data = s.docs.map(d=>({...d.data(),docId:d.id}))
    data.sort((a,b)=>(a.id||0)-(b.id||0))
    setProducts(data); setLoading(false)
  }), [])

  const filtered = products.filter(p => {
    const s = search.toLowerCase()
    const matchS = !s || p.name?.toLowerCase().includes(s)
    const stock = p.stock ?? null
    const matchF = filter==='all' ? true
      : filter==='low'  ? (stock!==null && stock<=5 && stock>0)
      : filter==='out'  ? (stock!==null && stock===0)
      : filter==='ok'   ? (stock===null || stock>5)
      : true
    return matchS && matchF
  })

  const lowCount = products.filter(p=>(p.stock??999)<=5&&(p.stock??999)>0).length
  const outCount = products.filter(p=>p.stock===0).length

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"/></div>

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-white">Inventory Insights</h1>
        <p className="text-[12px] text-muted mt-0.5">Read-only view · {products.length} products</p>
      </div>

      {/* Alert */}
      {(lowCount+outCount)>0&&(
        <div className="rounded-[8px] border px-4 py-3 text-[12px]" style={{borderColor:'rgba(234,179,8,0.3)',background:'rgba(234,179,8,0.05)',color:'#eab308'}}>
          ⚠ {outCount>0&&`${outCount} product${outCount>1?'s':''} out of stock`}{outCount>0&&lowCount>0&&' · '}{lowCount>0&&`${lowCount} product${lowCount>1?'s':''} low stock (≤5)`}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {label:'Total Products',value:products.length,color:'#3b82f6'},
          {label:'In Stock (>5)',value:products.filter(p=>(p.stock??999)>5).length,color:'#22c55e'},
          {label:'Low Stock (≤5)',value:lowCount,color:'#eab308'},
          {label:'Out of Stock',value:outCount,color:'#C1121F'},
        ].map(s=>(
          <div key={s.label} className="rounded-[8px] border border-[#1a1a1a] px-4 py-4 relative overflow-hidden" style={{background:'#0e0e0e'}}>
            <div className="absolute top-0 right-0 w-10 h-10 rounded-full opacity-10" style={{background:s.color,filter:'blur(12px)',transform:'translate(30%,-30%)'}}/>
            <p className="text-[20px] font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-muted uppercase tracking-wider2 mt-1">{s.label}</p>
            <div className="absolute bottom-0 left-0 h-[2px] w-full opacity-40" style={{background:s.color}}/>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search products..." value={search} onChange={e=>setSearch(e.target.value)}
            className="w-full bg-[#0e0e0e] border border-[#1a1a1a] rounded-[6px] pl-9 pr-4 py-2.5 text-[13px] text-white placeholder-muted outline-none focus:border-[#333]"/>
        </div>
        <div className="flex gap-1.5">
          {[['all','All'],['ok','OK'],['low','Low'],['out','Out']].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)}
              className={`px-3 py-2 rounded-[6px] text-[11px] font-semibold border transition-all
                ${filter===v?'text-black border-yellow-500':'bg-[#0e0e0e] text-muted border-[#1a1a1a] hover:text-white'}`}
              style={filter===v?{background:'linear-gradient(135deg,#eab308,#a16207)'}:{}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[8px] border border-[#1a1a1a] overflow-hidden" style={{background:'#0a0a0a'}}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] min-w-[500px]">
            <thead>
              <tr className="border-b border-[#151515]">
                {['Product','Price','Stock','Status','Category'].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-wider2 text-muted font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0f0f0f]">
              {filtered.map(p => {
                const stock = p.stock ?? null
                const stockColor = stock===null?'#666':stock===0?'#C1121F':stock<=5?'#eab308':'#22c55e'
                const stockLabel = stock===null?'Not Set':stock===0?'Out of Stock':stock<=5?`${stock} — Low`:`${stock}`
                return (
                  <tr key={p.docId} className="hover:bg-[#0d0d0d] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image&&<div className="w-10 h-10 rounded-[4px] border border-[#1a1a1a] bg-[#111] flex items-center justify-center overflow-hidden flex-shrink-0"><img src={p.image} alt="" className="w-full h-full object-contain p-1"/></div>}
                        <div><p className="font-semibold text-white">{p.name}</p><p className="text-muted text-[10px]">{p.tagline}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-white">৳{p.price?.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className="font-bold text-[13px]" style={{color:stockColor}}>{stockLabel}</span></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border`}
                        style={{color:stockColor,background:stockColor+'15',borderColor:stockColor+'30'}}>
                        {stock===null?'Unknown':stock===0?'Out of Stock':stock<=5?'Low Stock':'In Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted text-[11px]">{(p.categories||[]).join(', ')||'—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length===0&&<p className="text-center text-muted text-[12px] py-10">No products found</p>}
        </div>
      </div>
    </div>
  )
}
