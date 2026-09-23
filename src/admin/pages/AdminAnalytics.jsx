import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'

const COST_PER_ORDER = 0 // set your product cost here if needed for profit calc

function bdDate(ts) {
  if (!ts?.toDate) return null
  return new Date(ts.toDate().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }))
}

export default function AdminAnalytics() {
  const [orders,   setOrders]   = useState([])
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [range,    setRange]    = useState('30D')

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    return onSnapshot(collection(db, 'products'), snap =>
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-white/20 border-t-red rounded-full animate-spin"/>
    </div>
  )

  const delivered = orders.filter(o => o.status === 'delivered')
  const cancelled = orders.filter(o => o.status === 'cancelled')

  const totalRevenue    = delivered.reduce((s,o) => s + (o.totalAmount||0), 0)
  const totalDelivery   = delivered.reduce((s,o) => s + (o.deliveryFee||0), 0)
  const productRevenue  = totalRevenue - totalDelivery
  const totalOrders     = orders.length
  const deliveryRate    = totalOrders > 0 ? ((delivered.length / totalOrders) * 100).toFixed(1) : 0
  const cancelRate      = totalOrders > 0 ? ((cancelled.length / totalOrders) * 100).toFixed(1) : 0
  const avgOrderValue   = delivered.length > 0 ? Math.round(totalRevenue / delivered.length) : 0

  // Sales trend data
  const salesData  = buildSalesData(orders, range)
  const revenueData= buildRevenueData(orders, range)

  // Top products by revenue
  const productRevData = buildProductRevenue(orders, products)

  // Monthly comparison
  const monthlyData = buildMonthlyComparison(orders)

  // Order funnel
  const funnel = [
    { name: 'Placed',    value: orders.length,                               fill: '#3b82f6' },
    { name: 'Confirmed', value: orders.filter(o=>o.status!=='pending'&&o.status!=='cancelled').length, fill: '#8b5cf6' },
    { name: 'Shipped',   value: orders.filter(o=>['shipped','delivered'].includes(o.status)).length,   fill: '#06b6d4' },
    { name: 'Delivered', value: delivered.length,                            fill: '#22c55e' },
    { name: 'Cancelled', value: cancelled.length,                            fill: '#C1121F' },
  ]

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-white">Analytics</h1>
        <p className="text-[12px] text-muted mt-0.5">Overall website performance & sales insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label:'Total Revenue',     value:`৳${totalRevenue.toLocaleString()}`,     color:'#22c55e', icon:'💰', sub:`${delivered.length} delivered orders` },
          { label:'Product Revenue',   value:`৳${productRevenue.toLocaleString()}`,   color:'#C1121F', icon:'📦', sub:'Excl. delivery fees' },
          { label:'Avg. Order Value',  value:`৳${avgOrderValue.toLocaleString()}`,    color:'#3b82f6', icon:'📊', sub:'Per delivered order' },
          { label:'Delivery Rate',     value:`${deliveryRate}%`,                      color:'#06b6d4', icon:'🚚', sub:`Cancel rate: ${cancelRate}%` },
        ].map(s => (
          <div key={s.label} className="rounded-[8px] border border-[#1a1a1a] px-4 py-4 relative overflow-hidden"
            style={{ background: '#0e0e0e' }}>
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10"
              style={{ background: s.color, filter:'blur(20px)', transform:'translate(30%,-30%)' }}/>
            <p className="text-[22px] mb-1">{s.icon}</p>
            <p className="text-[20px] font-display font-extrabold text-white tracking-[-0.03em] leading-none">
              {s.value}
            </p>
            <p className="text-[11px] font-semibold text-off mt-1.5">{s.label}</p>
            <p className="text-[10px] text-muted mt-0.5">{s.sub}</p>
            <div className="absolute bottom-0 left-0 h-[2px] w-full opacity-40" style={{ background: s.color }}/>
          </div>
        ))}
      </div>

      {/* Range toggle */}
      <div className="flex gap-1.5">
        {['7D','30D','12M'].map(r => (
          <button key={r} onClick={() => setRange(r)}
            className={`px-3 py-1.5 rounded-[4px] text-[11px] font-bold border transition-all duration-150
              ${range===r ? 'bg-red text-white border-red' : 'bg-[#0e0e0e] text-muted border-[#1a1a1a] hover:text-white hover:border-[#333]'}`}>
            {r}
          </button>
        ))}
      </div>

      {/* Sales + Revenue charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ChartCard title="Daily Sales Volume" sub="Number of orders placed">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesData} margin={{ top:5, right:10, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="g-sales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a"/>
              <XAxis dataKey="date" tick={{ fill:'#666', fontSize:10 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'#666', fontSize:10 }} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip contentStyle={{ background:'#111', border:'1px solid #222', borderRadius:6, fontSize:11 }}
                labelStyle={{ color:'#aaa' }} itemStyle={{ color:'#fff' }}/>
              <Area type="monotone" dataKey="orders" name="Orders"
                stroke="#3b82f6" fill="url(#g-sales)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue Generated" sub="From delivered orders only">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData} margin={{ top:5, right:10, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="g-rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a"/>
              <XAxis dataKey="date" tick={{ fill:'#666', fontSize:10 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'#666', fontSize:10 }} axisLine={false} tickLine={false}
                tickFormatter={v => v>=1000 ? `${(v/1000).toFixed(0)}k` : v}/>
              <Tooltip contentStyle={{ background:'#111', border:'1px solid #222', borderRadius:6, fontSize:11 }}
                labelStyle={{ color:'#aaa' }} itemStyle={{ color:'#fff' }}
                formatter={v => [`৳${v.toLocaleString()}`, 'Revenue']}/>
              <Area type="monotone" dataKey="revenue" name="Revenue"
                stroke="#22c55e" fill="url(#g-rev)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Product Revenue + Monthly comparison */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ChartCard title="Revenue by Product" sub="Top performing products">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={productRevData} layout="vertical" margin={{ top:5, right:20, left:10, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false}/>
              <XAxis type="number" tick={{ fill:'#666', fontSize:10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `৳${(v/1000).toFixed(0)}k`}/>
              <YAxis type="category" dataKey="name" tick={{ fill:'#aaa', fontSize:10 }}
                axisLine={false} tickLine={false} width={70}/>
              <Tooltip contentStyle={{ background:'#111', border:'1px solid #222', borderRadius:6, fontSize:11 }}
                formatter={v => [`৳${v.toLocaleString()}`, 'Revenue']}/>
              <Bar dataKey="revenue" fill="#C1121F" radius={[0,4,4,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Comparison" sub="Orders vs Revenue (last 6 months)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData} margin={{ top:5, right:10, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a"/>
              <XAxis dataKey="month" tick={{ fill:'#666', fontSize:10 }} axisLine={false} tickLine={false}/>
              <YAxis yAxisId="left"  tick={{ fill:'#666', fontSize:10 }} axisLine={false} tickLine={false} allowDecimals={false}/>
              <YAxis yAxisId="right" orientation="right" tick={{ fill:'#666', fontSize:10 }}
                axisLine={false} tickLine={false} tickFormatter={v => `৳${(v/1000).toFixed(0)}k`}/>
              <Tooltip contentStyle={{ background:'#111', border:'1px solid #222', borderRadius:6, fontSize:11 }}
                labelStyle={{ color:'#aaa' }}/>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:10, paddingTop:8 }}/>
              <Line yAxisId="left"  type="monotone" dataKey="orders"  name="Orders"
                stroke="#3b82f6" strokeWidth={2} dot={false}/>
              <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue"
                stroke="#22c55e" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Order Funnel */}
      <ChartCard title="Order Funnel" sub="From placement to delivery">
        <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
          <ResponsiveContainer width="40%" height={180}>
            <PieChart>
              <Pie data={funnel.filter(f=>f.name!=='Cancelled')} cx="50%" cy="50%"
                innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                {funnel.filter(f=>f.name!=='Cancelled').map((f,i) => (
                  <Cell key={i} fill={f.fill}/>
                ))}
              </Pie>
              <Tooltip contentStyle={{ background:'#111', border:'1px solid #222', borderRadius:6, fontSize:11 }}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3 flex-1">
            {funnel.map(f => (
              <div key={f.name} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: f.fill }}/>
                <span className="text-[12px] text-off w-24">{f.name}</span>
                <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    background: f.fill,
                    width: orders.length > 0 ? `${(f.value/orders.length*100).toFixed(0)}%` : '0%',
                    transition: 'width 0.8s ease',
                  }}/>
                </div>
                <span className="text-[12px] font-bold text-white w-8 text-right">{f.value}</span>
                <span className="text-[10px] text-muted w-10 text-right">
                  {orders.length > 0 ? `${(f.value/orders.length*100).toFixed(0)}%` : '0%'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>
    </div>
  )
}

function ChartCard({ title, sub, children }) {
  return (
    <div className="rounded-[8px] border border-[#1a1a1a] overflow-hidden"
      style={{ background:'linear-gradient(160deg,#0e0e0e,#0a0a0a)' }}>
      <div className="px-5 py-4 border-b border-[#1a1a1a]">
        <p className="text-[13px] font-bold text-white">{title}</p>
        {sub && <p className="text-[10px] text-muted mt-0.5">{sub}</p>}
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  )
}

function buildSalesData(orders, range) {
  const days = range==='7D' ? 7 : range==='30D' ? 30 : 365
  if (range==='12M') return buildMonthlyOrders(orders)
  return Array.from({ length: days }, (_,i) => {
    const d = new Date(); d.setDate(d.getDate()-(days-1-i)); d.setHours(0,0,0,0)
    const next = new Date(d); next.setDate(next.getDate()+1)
    return {
      date: d.toLocaleDateString('en-BD',{ month:'short', day:'2-digit' }),
      orders: orders.filter(o => { const od=bdDate(o.createdAt); return od&&od>=d&&od<next }).length,
    }
  })
}
function buildRevenueData(orders, range) {
  const days = range==='7D' ? 7 : range==='30D' ? 30 : 365
  if (range==='12M') {
    const months = {}
    for (let i=11;i>=0;i--) {
      const d=new Date(); d.setMonth(d.getMonth()-i); d.setDate(1); d.setHours(0,0,0,0)
      const label = d.toLocaleDateString('en-BD',{ month:'short', year:'2-digit' })
      months[label] = { date:label, revenue:0 }
    }
    orders.filter(o=>o.status==='delivered').forEach(o => {
      const d=bdDate(o.createdAt); if(!d) return
      const label = d.toLocaleDateString('en-BD',{ month:'short', year:'2-digit' })
      if (months[label]) months[label].revenue += o.totalAmount||0
    })
    return Object.values(months)
  }
  return Array.from({ length: days }, (_,i) => {
    const d=new Date(); d.setDate(d.getDate()-(days-1-i)); d.setHours(0,0,0,0)
    const next=new Date(d); next.setDate(next.getDate()+1)
    return {
      date: d.toLocaleDateString('en-BD',{ month:'short', day:'2-digit' }),
      revenue: orders.filter(o=>o.status==='delivered').filter(o=>{
        const od=bdDate(o.createdAt); return od&&od>=d&&od<next
      }).reduce((s,o)=>s+(o.totalAmount||0),0),
    }
  })
}
function buildProductRevenue(orders, products) {
  const rev = {}
  orders.filter(o=>o.status==='delivered').forEach(o =>
    (o.items||[]).forEach(item => { rev[item.name]=(rev[item.name]||0)+(item.subtotal||0) })
  )
  return Object.entries(rev).sort((a,b)=>b[1]-a[1]).slice(0,5)
    .map(([name,revenue]) => ({ name:name.replace('AURIX ',''), revenue }))
}
function buildMonthlyOrders(orders) {
  const months = {}
  for (let i=11;i>=0;i--) {
    const d=new Date(); d.setMonth(d.getMonth()-i); d.setDate(1); d.setHours(0,0,0,0)
    const label = d.toLocaleDateString('en-BD',{ month:'short', year:'2-digit' })
    months[label] = { date:label, orders:0 }
  }
  orders.forEach(o => {
    const d=bdDate(o.createdAt); if(!d) return
    const label=d.toLocaleDateString('en-BD',{ month:'short', year:'2-digit' })
    if (months[label]) months[label].orders++
  })
  return Object.values(months)
}
function buildMonthlyComparison(orders) {
  const months = {}
  for (let i=5;i>=0;i--) {
    const d=new Date(); d.setMonth(d.getMonth()-i); d.setDate(1); d.setHours(0,0,0,0)
    const label=d.toLocaleDateString('en-BD',{ month:'short', year:'2-digit' })
    months[label] = { month:label, orders:0, revenue:0 }
  }
  orders.forEach(o => {
    const d=bdDate(o.createdAt); if(!d) return
    const label=d.toLocaleDateString('en-BD',{ month:'short', year:'2-digit' })
    if (!months[label]) return
    months[label].orders++
    if (o.status==='delivered') months[label].revenue += o.totalAmount||0
  })
  return Object.values(months)
}
