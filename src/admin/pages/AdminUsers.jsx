import { useState, useEffect } from 'react'
import {
  collection, onSnapshot, query, orderBy,
  doc, updateDoc, serverTimestamp, getDocs, where
} from 'firebase/firestore'
import { db } from '../../firebase'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users,   setUsers]   = useState([])
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [selected,setSelected]= useState(null)  // CRM drawer
  const [presence,setPresence]= useState({})    // uid → lastSeen

  // Real-time users
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [])

  // Real-time orders (for per-user stats)
  useEffect(() => {
    return onSnapshot(collection(db, 'orders'), snap =>
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
  }, [])

  // Real-time presence (online users)
  useEffect(() => {
    return onSnapshot(collection(db, 'presence'), snap => {
      const map = {}
      snap.docs.forEach(d => { map[d.id] = d.data() })
      setPresence(map)
    })
  }, [])

  // Re-render every 30s so online/offline status stays current
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 30000)
    return () => clearInterval(t)
  }, [])

  const isOnline = (uid) => {
    const p = presence[uid]
    if (!p?.lastSeen) return false
    // If online flag explicitly false, offline
    if (p.online === false) return false
    const last = p.lastSeen?.toDate ? p.lastSeen.toDate() : new Date(p.lastSeen)
    // Online if seen within last 2 minutes
    return (Date.now() - last.getTime()) < 2 * 60 * 1000
  }

  const userOrders = (uid) => orders.filter(o => o.userId === uid)
  const totalSpent = (uid) => userOrders(uid)
    .filter(o => o.status === 'delivered')
    .reduce((s, o) => s + (o.totalAmount || 0), 0)

  const liveCount = users.filter(u => isOnline(u.id)).length

  const filtered = users.filter(u => {
    const s = search.toLowerCase()
    return !s ||
      u.name?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.phone?.includes(s)
  })

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
            Users & CRM
          </h1>
          <p className="text-[12px] text-muted mt-0.5">{users.length} registered users</p>
        </div>

        {/* Live count */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-[8px] border border-green-500/20
                        bg-green-500/5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
          <span className="text-[12px] font-semibold text-green-400">
            {liveCount} user{liveCount !== 1 ? 's' : ''} online right now
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-[400px]">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14"
          viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text" placeholder="Search by name, email, phone..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#0e0e0e] border border-[#1a1a1a] rounded-[6px]
                     pl-9 pr-4 py-2.5 text-[13px] text-white placeholder-muted
                     outline-none focus:border-[#333] transition-colors duration-150"
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Users',    value: users.length,                             color: '#3b82f6' },
          { label: 'Online Now',     value: liveCount,                                color: '#22c55e' },
          { label: 'Customers',      value: users.filter(u => u.role === 'customer').length, color: '#f59e0b' },
          { label: 'Admins',         value: users.filter(u => u.role === 'admin').length,    color: '#C1121F' },
        ].map(s => (
          <div key={s.label} className="rounded-[8px] border border-[#1a1a1a] px-4 py-3
                                         relative overflow-hidden"
            style={{ background: '#0e0e0e' }}>
            <div className="absolute top-0 right-0 w-12 h-12 rounded-full opacity-10"
              style={{ background: s.color, filter: 'blur(16px)', transform: 'translate(30%,-30%)' }}/>
            <p className="text-[22px] font-display font-extrabold text-white">{s.value}</p>
            <p className="text-[10px] text-muted uppercase tracking-wider2 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="rounded-[8px] border border-[#1a1a1a] overflow-hidden" style={{ background: '#0a0a0a' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] min-w-[700px]">
            <thead>
              <tr className="border-b border-[#151515]">
                {['User','Contact','Role','Orders','Spent','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-wider2
                                         text-muted font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0f0f0f]">
              {filtered.map(user => {
                const online  = isOnline(user.id)
                const oCount  = userOrders(user.id).length
                const spent   = totalSpent(user.id)
                return (
                  <tr key={user.id} className="hover:bg-[#0d0d0d] transition-colors duration-100">
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative flex-shrink-0">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center
                                          text-[12px] font-bold text-white overflow-hidden"
                            style={{ background: 'linear-gradient(135deg,#C1121F,#8b0000)' }}>
                            {user.photoURL
                              ? <img src={user.photoURL} alt="" className="w-full h-full object-cover"/>
                              : (user.name || user.email || 'U')[0].toUpperCase()
                            }
                          </div>
                          {online && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5
                                             rounded-full bg-green-500 border-2 border-[#0a0a0a]"/>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{user.name || '—'}</p>
                          <p className="text-muted text-[10px] truncate max-w-[140px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td className="px-4 py-3 text-off">{user.phone || '—'}</td>
                    {/* Role */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                                        border tracking-wider
                                        ${user.role === 'admin'
                                          ? 'bg-red/10 text-red border-red/20'
                                          : 'bg-[#141414] text-muted border-[#222]'}`}>
                        {user.role}
                      </span>
                    </td>
                    {/* Orders */}
                    <td className="px-4 py-3 text-white font-semibold">{oCount}</td>
                    {/* Spent */}
                    <td className="px-4 py-3 font-bold text-white">
                      {spent > 0 ? `৳${spent.toLocaleString()}` : '—'}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-[#333]'}`}/>
                        <span className={`text-[11px] ${online ? 'text-green-400' : 'text-muted'}`}>
                          {online ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(user)}
                        className="px-3 py-1.5 bg-[#141414] border border-[#222] rounded-[4px]
                                   text-[10px] text-muted hover:text-white hover:border-[#333]
                                   transition-all duration-150">
                        View / Edit
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-muted text-[12px] py-10">No users found</p>
          )}
        </div>
      </div>

      {/* CRM Drawer */}
      {selected && (
        <CRMDrawer
          user={selected}
          orders={userOrders(selected.id)}
          online={isOnline(selected.id)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

/* ── CRM Drawer ── */
function CRMDrawer({ user, orders, online, onClose }) {
  const [form, setForm]   = useState({ name: user.name||'', phone: user.phone||'', address: user.address||'' })
  const [saving,setSaving]= useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', user.id), {
        name:      form.name.trim(),
        phone:     form.phone.trim(),
        address:   form.address.trim(),
        updatedAt: serverTimestamp(),
      })
      toast.success('Customer updated successfully')
      onClose()
    } catch {
      toast.error('Failed to update customer')
    } finally {
      setSaving(false)
    }
  }

  const totalSpent = orders
    .filter(o => o.status === 'delivered')
    .reduce((s, o) => s + (o.totalAmount || 0), 0)

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[100]" onClick={onClose}/>
      <div className="fixed right-0 top-0 h-full w-full max-w-[460px] z-[101]
                      border-l border-[#1a1a1a] overflow-y-auto"
        style={{ background: '#0a0a0a' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]
                        sticky top-0 z-10" style={{ background: '#0a0a0a' }}>
          <div>
            <p className="text-[11px] uppercase tracking-wider2 text-muted">CRM — Customer Profile</p>
            <p className="font-display font-bold text-[15px] text-white mt-0.5">{user.name || user.email}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Avatar + Status */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center
                            text-[22px] font-bold text-white overflow-hidden flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#C1121F,#8b0000)' }}>
              {user.photoURL
                ? <img src={user.photoURL} alt="" className="w-full h-full object-cover"/>
                : (user.name || user.email || 'U')[0].toUpperCase()
              }
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-[#333]'}`}/>
                <span className={`text-[11px] font-semibold ${online ? 'text-green-400' : 'text-muted'}`}>
                  {online ? 'Online Now' : 'Offline'}
                </span>
              </div>
              <p className="text-[12px] text-muted">{user.email}</p>
              <p className="text-[11px] text-muted mt-0.5">
                Member since {user.createdAt?.toDate
                  ? user.createdAt.toDate().toLocaleDateString('en-BD', { day:'2-digit', month:'short', year:'numeric' })
                  : '—'}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Orders',  value: orders.length },
              { label: 'Delivered', value: orders.filter(o => o.status==='delivered').length },
              { label: 'Total Spent', value: totalSpent > 0 ? `৳${totalSpent.toLocaleString()}` : '—' },
            ].map(s => (
              <div key={s.label} className="rounded-[6px] border border-[#1a1a1a] px-3 py-3 text-center"
                style={{ background: '#0e0e0e' }}>
                <p className="text-[16px] font-bold text-white">{s.value}</p>
                <p className="text-[10px] text-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Edit form */}
          <div className="rounded-[8px] border border-[#1a1a1a] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1a1a1a] bg-[#0d0d0d]">
              <p className="text-[10px] uppercase tracking-wider2 text-muted font-semibold">Edit Details</p>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label:'Full Name', key:'name', placeholder:'Customer name' },
                { label:'Phone',     key:'phone', placeholder:'01XXXXXXXXX' },
                { label:'Address',   key:'address', placeholder:'Delivery address' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[11px] text-muted mb-1 block">{f.label}</label>
                  <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full bg-[#111] border border-[#1a1a1a] rounded-[4px] px-3 py-2
                               text-[13px] text-white placeholder-muted outline-none
                               focus:border-[#333] transition-colors duration-150"/>
                </div>
              ))}
              <button onClick={handleSave} disabled={saving}
                className="w-full py-2.5 bg-red text-white rounded-[6px] text-[12px] font-semibold
                           hover:bg-red/90 transition-colors duration-150 disabled:opacity-60
                           flex items-center justify-center gap-2">
                {saving
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving...</>
                  : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Order history */}
          <div className="rounded-[8px] border border-[#1a1a1a] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1a1a1a] bg-[#0d0d0d]">
              <p className="text-[10px] uppercase tracking-wider2 text-muted font-semibold">
                Order History ({orders.length})
              </p>
            </div>
            <div className="divide-y divide-[#111] max-h-[280px] overflow-y-auto">
              {orders.length === 0 ? (
                <p className="text-center text-muted text-[12px] py-6">No orders yet</p>
              ) : (
                orders.map(o => (
                  <div key={o.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-[11px] font-bold text-red font-mono">{o.orderId || o.id}</p>
                      <p className="text-[10px] text-muted">
                        {o.createdAt?.toDate
                          ? o.createdAt.toDate().toLocaleDateString('en-BD', { day:'2-digit', month:'short', year:'numeric' })
                          : '—'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] font-bold text-white">৳{o.totalAmount?.toLocaleString()}</p>
                      <span className={`text-[10px] font-semibold capitalize
                        ${o.status==='delivered' ? 'text-green-400'
                          : o.status==='pending' ? 'text-yellow-500'
                          : 'text-muted'}`}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
