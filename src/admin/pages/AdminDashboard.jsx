import { useState, useEffect } from 'react'
import { collection, query, onSnapshot, orderBy, where, Timestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

const STATUS_COLORS = {
  pending:   '#f59e0b',
  confirmed: '#3b82f6',
  preparing: '#8b5cf6',
  shipped:   '#06b6d4',
  delivered: '#22c55e',
  cancelled: '#ef4444',
}

/* ── helpers ── */
const startOf = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x }
const today   = () => startOf(new Date())
const yesterday = () => { const d = startOf(new Date()); d.setDate(d.getDate()-1); return d }
const monthStart= () => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d }

function bdDate(ts) {
  if (!ts?.toDate) return null
  return new Date(ts.toDate().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }))
}

export default function AdminDashboard() {
  const [orders,   setOrders]   = useState([])
  const [products, setProducts] = useState([])
  const [trendRange, setTrendRange] = useState('30D')

  // Real-time orders
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
  }, [])

  // Real-time products
  useEffect(() => {
    return onSnapshot(collection(db, 'products'), snap =>
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
  }, [])

  /* ── Stats ── */
  const tod  = today()
  const yest = yesterday()
  const mon  = monthStart()

  const todayOrders     = orders.filter(o => { const d = bdDate(o.createdAt); return d && d >= tod })
  const yesterdayOrders = orders.filter(o => { const d = bdDate(o.createdAt); return d && d >= yest && d < tod })
  const monthOrders     = orders.filter(o => { const d = bdDate(o.createdAt); return d && d >= mon })
  const totalRevenue    = orders.filter(o => o.status === 'delivered').reduce((s,o) => s + (o.totalAmount||0), 0)
  const monthRevenue    = monthOrders.filter(o => o.status === 'delivered').reduce((s,o) => s + (o.totalAmount||0), 0)
  const pending         = orders.filter(o => o.status === 'pending').length
  const confirmed       = orders.filter(o => o.status === 'confirmed').length
  const delivered       = orders.filter(o => o.status === 'delivered').length

  /* ── Low stock products ── */
  const lowStock = products.filter(p => (p.stock ?? 999) <= 5)

  /* ── Order Trend data ── */
  const trendData = buildTrendData(orders, trendRange)

  /* ── Revenue Trend ── */
  const revenueData = buildRevenueData(orders, trendRange)

  /* ── Top Products ── */
  const topProducts = buildTopProducts(orders, products)

  /* ── Status distribution ── */
  const statusDist = Object.entries(
    orders.reduce((acc, o) => { acc[o.status] = (acc[o.status]||0)+1; return acc }, {})
  ).map(([name, value]) => ({ name, value }))

  const stats = [
    { label: "Today's Orders",     value: todayOrders.length,     icon: '📦', color: '#3b82f6' },
    { label: "Yesterday's Orders", value: yesterdayOrders.length, icon: '📅', color: '#8b5cf6' },
    { label: 'Total Orders',       value: orders.length,          icon: '🗂️', color: '#06b6d4' },
    { label: 'This Month',         value: monthOrders.length,     icon: '📆', color: '#f59e0b' },
    { label: 'Month Revenue',      value: `৳${monthRevenue.toLocaleString()}`, icon: '💰', color: '#22c55e' },
    { label: 'Total Revenue',      value: `৳${totalRevenue.toLocaleString()}`, icon: '💵', color: '#C1121F' },
    { label: 'Pending',            value: pending,                icon: '⏳', color: '#f59e0b', link: '/admin/orders?status=pending' },
    { label: 'Confirmed',          value: confirmed,              icon: '✅', color: '#22c55e' },
    { label: 'Delivered',          value: delivered,              icon: '🚚', color: '#06b6d4' },
  ]

  return (
    <div className="p-6 space-y-6">

      {/* ── Low Stock Alerts ── */}
      {lowStock.length > 0 && (
        <div className="rounded-[8px] border border-yellow-500/30 bg-yellow-500/5 px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p className="text-[12px] font-bold text-yellow-500 uppercase tracking-wider2">
              Low Stock Alert — {lowStock.length} product{lowStock.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(p => (
              <Link key={p.id} to="/admin/products"
                className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20
                           rounded-[6px] hover:border-yellow-500/40 transition-colors duration-150">
                <span className="text-[12px] font-semibold text-white">{p.name}</span>
                <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/20 px-1.5 py-0.5 rounded-full">
                  {p.stock ?? 0} left
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {stats.map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Charts Row 1: Order Trends + Revenue ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ChartCard
          title="Order Trends"
          sub={`${orders.length} total orders`}
          range={trendRange}
          onRange={setTrendRange}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {Object.entries(STATUS_COLORS).map(([k, c]) => (
                  <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={c} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 6, fontSize: 11 }}
                labelStyle={{ color: '#aaa' }} itemStyle={{ color: '#fff' }}/>
              <Legend iconType="circle" iconSize={8}
                wrapperStyle={{ fontSize: 10, paddingTop: 8 }}/>
              {['pending','confirmed','shipped','delivered'].map(s => (
                <Area key={s} type="monotone" dataKey={s} name={s.charAt(0).toUpperCase()+s.slice(1)}
                  stroke={STATUS_COLORS[s]} fill={`url(#grad-${s})`} strokeWidth={2}/>
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Revenue Trend"
          sub={`৳${totalRevenue.toLocaleString()} total`}
          range={trendRange}
          onRange={setTrendRange}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad-rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#C1121F" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#C1121F" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}/>
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 6, fontSize: 11 }}
                labelStyle={{ color: '#aaa' }} itemStyle={{ color: '#fff' }}
                formatter={v => [`৳${v.toLocaleString()}`, 'Revenue']}/>
              <Area type="monotone" dataKey="revenue" name="Revenue"
                stroke="#C1121F" fill="url(#grad-rev)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Charts Row 2: Top Products + Status Dist ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ChartCard title="Top Products" sub="by units sold">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a"/>
              <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 6, fontSize: 11 }}
                labelStyle={{ color: '#aaa' }} itemStyle={{ color: '#fff' }}/>
              <Bar dataKey="sold" name="Units Sold" fill="#C1121F" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Order Status" sub="distribution">
          <div className="flex items-center justify-center gap-8">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={statusDist} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  dataKey="value" paddingAngle={3}>
                  {statusDist.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#444'}/>
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 6, fontSize: 11 }}
                  itemStyle={{ color: '#fff' }}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {statusDist.map(s => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: STATUS_COLORS[s.name] || '#444' }}/>
                  <span className="text-[11px] text-off capitalize">{s.name}</span>
                  <span className="text-[11px] font-bold text-white ml-auto pl-4">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* ── Recent Orders ── */}
      <div className="rounded-[8px] border border-[#1a1a1a] overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0e0e0e, #0a0a0a)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <p className="text-[13px] font-bold text-white">Recent Orders</p>
          <Link to="/admin/orders"
            className="text-[11px] text-red hover:text-red/80 font-medium transition-colors">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[#151515]">
                {['Order ID','Customer','Amount','Status','Date'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] uppercase tracking-wider2 text-muted font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111]">
              {orders.slice(0,8).map(o => (
                <tr key={o.id} className="hover:bg-[#0f0f0f] transition-colors duration-100">
                  <td className="px-5 py-3 font-mono font-bold text-red text-[11px]">
                    {o.orderId || o.id}
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-white">{o.customerName}</p>
                    <p className="text-muted text-[10px]">{o.customerPhone}</p>
                  </td>
                  <td className="px-5 py-3 font-semibold text-white">
                    ৳{o.totalAmount?.toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={o.status}/>
                  </td>
                  <td className="px-5 py-3 text-muted text-[11px]">
                    {o.createdAt?.toDate
                      ? o.createdAt.toDate().toLocaleDateString('en-BD', { day:'2-digit', month:'short', year:'numeric' })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="text-center text-muted text-[12px] py-8">No orders yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Stat Card ── */
function StatCard({ label, value, icon, color, link }) {
  const inner = (
    <div className="rounded-[8px] border border-[#1a1a1a] px-4 py-4 hover:border-[#252525]
                    transition-colors duration-150 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0e0e0e, #0a0a0a)' }}>
      <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-5"
        style={{ background: color, filter: 'blur(20px)', transform: 'translate(20%, -20%)' }}/>
      <p className="text-[22px] mb-1">{icon}</p>
      <p className="text-[20px] font-display font-extrabold text-white tracking-[-0.03em] leading-none">
        {value}
      </p>
      <p className="text-[10px] text-muted uppercase tracking-wider2 mt-1.5">{label}</p>
      <div className="absolute bottom-0 left-0 h-[2px] w-full opacity-30" style={{ background: color }}/>
    </div>
  )
  return link ? <Link to={link}>{inner}</Link> : inner
}

/* ── Status Badge ── */
export function StatusBadge({ status }) {
  const colors = {
    pending:   'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    preparing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    shipped:   'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
    cancelled: 'bg-red/10 text-red border-red/20',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border
                      ${colors[status] || 'bg-[#222] text-muted border-[#333]'}`}>
      {status}
    </span>
  )
}

/* ── Chart Card wrapper ── */
function ChartCard({ title, sub, range, onRange, children }) {
  return (
    <div className="rounded-[8px] border border-[#1a1a1a] overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0e0e0e, #0a0a0a)' }}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
        <div>
          <p className="text-[13px] font-bold text-white">{title}</p>
          {sub && <p className="text-[10px] text-muted mt-0.5">{sub}</p>}
        </div>
        {onRange && (
          <div className="flex gap-1">
            {['7D','30D','12M'].map(r => (
              <button key={r} onClick={() => onRange(r)}
                className={`px-2.5 py-1 rounded-[4px] text-[10px] font-bold transition-all duration-150
                  ${range === r ? 'bg-red text-white' : 'bg-[#141414] text-muted hover:text-white border border-[#222]'}`}>
                {r}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  )
}

/* ── Data builders ── */
function buildTrendData(orders, range) {
  const days = range === '7D' ? 7 : range === '30D' ? 30 : 365
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0)
    const next = new Date(d); next.setDate(next.getDate() + 1)
    const label = range === '12M'
      ? d.toLocaleDateString('en-BD', { month: 'short', day: '2-digit' })
      : d.toLocaleDateString('en-BD', { month: 'short', day: '2-digit' })
    const dayOrders = orders.filter(o => {
      const od = bdDate(o.createdAt)
      return od && od >= d && od < next
    })
    result.push({
      date:      label,
      pending:   dayOrders.filter(o => o.status === 'pending').length,
      confirmed: dayOrders.filter(o => o.status === 'confirmed').length,
      shipped:   dayOrders.filter(o => o.status === 'shipped').length,
      delivered: dayOrders.filter(o => o.status === 'delivered').length,
    })
  }
  // For 12M, group by month
  if (range === '12M') return groupByMonth(orders)
  return result
}

function groupByMonth(orders) {
  const months = {}
  for (let i = 11; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i); d.setDate(1); d.setHours(0,0,0,0)
    const label = d.toLocaleDateString('en-BD', { month: 'short', year: '2-digit' })
    months[label] = { date: label, pending: 0, confirmed: 0, shipped: 0, delivered: 0 }
  }
  orders.forEach(o => {
    const d = bdDate(o.createdAt)
    if (!d) return
    const label = d.toLocaleDateString('en-BD', { month: 'short', year: '2-digit' })
    if (months[label]) months[label][o.status] = (months[label][o.status] || 0) + 1
  })
  return Object.values(months)
}

function buildRevenueData(orders, range) {
  const days = range === '7D' ? 7 : range === '30D' ? 30 : 365
  if (range === '12M') {
    const months = {}
    for (let i = 11; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i); d.setDate(1); d.setHours(0,0,0,0)
      const label = d.toLocaleDateString('en-BD', { month: 'short', year: '2-digit' })
      months[label] = { date: label, revenue: 0 }
    }
    orders.filter(o => o.status === 'delivered').forEach(o => {
      const d = bdDate(o.createdAt)
      if (!d) return
      const label = d.toLocaleDateString('en-BD', { month: 'short', year: '2-digit' })
      if (months[label]) months[label].revenue += o.totalAmount || 0
    })
    return Object.values(months)
  }
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (days - 1 - i)); d.setHours(0,0,0,0)
    const next = new Date(d); next.setDate(next.getDate() + 1)
    const rev = orders
      .filter(o => o.status === 'delivered')
      .filter(o => { const od = bdDate(o.createdAt); return od && od >= d && od < next })
      .reduce((s, o) => s + (o.totalAmount || 0), 0)
    return { date: d.toLocaleDateString('en-BD', { month: 'short', day: '2-digit' }), revenue: rev }
  })
}

function buildTopProducts(orders, products) {
  const sold = {}
  orders.forEach(o => (o.items || []).forEach(item => {
    sold[item.name] = (sold[item.name] || 0) + (item.qty || 1)
  }))
  return Object.entries(sold)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => ({
      name: name.replace('AURIX ', ''),
      sold: qty,
    }))
}
