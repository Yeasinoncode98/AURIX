import { useState, useEffect } from 'react'
import { collection, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function OwnerAdminManagement() {
  const { user } = useAuth()
  const [admins,   setAdmins]   = useState([])
  const [users,    setUsers]    = useState([])
  const [presence, setPresence] = useState({})
  const [orders,   setOrders]   = useState([])
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')
  const [selected, setSelected] = useState(null)
  const [confirm,  setConfirm]  = useState(null) // {type, target}
  const [loading,  setLoading]  = useState(true)

  useEffect(() => onSnapshot(collection(db,'admins'),   s => { setAdmins(s.docs.map(d=>({id:d.id,...d.data()}))); setLoading(false) }), [])
  useEffect(() => onSnapshot(collection(db,'users'),    s => { setUsers(s.docs.map(d=>({id:d.id,...d.data()}))); setLoading(false) }), [])
  useEffect(() => onSnapshot(collection(db,'presence'), s => { const m={}; s.docs.forEach(d=>m[d.id]=d.data()); setPresence(m) }), [])
  useEffect(() => onSnapshot(collection(db,'orders'),   s => setOrders(s.docs.map(d=>({id:d.id,...d.data()})))), [])

  const isOnline = uid => {
    const p = presence[uid]; if(!p?.lastSeen||p.online===false) return false
    const last = p.lastSeen?.toDate ? p.lastSeen.toDate() : new Date(p.lastSeen)
    return (Date.now()-last.getTime()) < 2*60*1000
  }

  // Admin list = users with role==='admin' (source of truth)
  // Merge with admins collection for profile details only
  const adminList = users
    .filter(u => u.role === 'admin')
    .map(u => {
      const adminProfile = admins.find(a => a.id === u.id) || {}
      return {
        ...adminProfile,
        ...u,
        id: u.id,
        ordersHandled: orders.filter(o => o.handledBy?.uid === u.id).length,
        online: isOnline(u.id),
        lastSeen: presence[u.id]?.lastSeen,
      }
    })

  const filtered = adminList.filter(a => {
    const s = search.toLowerCase()
    const matchS = !s || a.name?.toLowerCase().includes(s) || a.email?.toLowerCase().includes(s)
    const matchF = filter==='all' ? true
      : filter==='online'  ? a.online
      : filter==='offline' ? !a.online
      : true
    return matchS && matchF
  })

  // Promote user → admin
  const promoteUser = async (u) => {
    try {
      await updateDoc(doc(db,'users',u.id), { role:'admin', promotedBy:user?.uid, promotedAt:serverTimestamp() })
      toast.success(`${u.name||u.email} promoted to Admin`)
      setConfirm(null)
    } catch { toast.error('Failed to promote user') }
  }

  // Demote admin → customer
  const demoteAdmin = async (a) => {
    if (a.role === 'owner') { toast.error('Cannot demote the Owner'); return }
    try {
      await updateDoc(doc(db,'users',a.id), { role:'customer', demotedBy:user?.uid, demotedAt:serverTimestamp() })
      toast.success(`${a.name||a.email} demoted to Customer`)
      setConfirm(null); setSelected(null)
    } catch { toast.error('Failed to demote admin') }
  }

  // Users who are NOT admin/owner — eligible for promotion
  const regularUsers = users.filter(u => u.role === 'customer')

  const fmtDate = ts => ts?.toDate ? ts.toDate().toLocaleDateString('en-BD',{day:'2-digit',month:'short',year:'numeric',timeZone:'Asia/Dhaka'}) : '—'
  const fmtTime = ts => ts?.toDate ? ts.toDate().toLocaleString('en-BD',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:true,timeZone:'Asia/Dhaka'}) : '—'

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"/></div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-white">Admin Management</h1>
          <p className="text-[12px] text-muted mt-0.5">{adminList.length} admins · {adminList.filter(a=>a.online).length} online now</p>
        </div>
      </div>

      {/* Security note */}
      <div className="rounded-[8px] border px-4 py-3 text-[12px]" style={{borderColor:'rgba(234,179,8,0.2)',background:'rgba(234,179,8,0.05)',color:'#eab308'}}>
        ⚠ Role changes update Firestore only. Firebase Auth session tokens are not immediately revoked — the affected admin must log out and back in for changes to fully take effect.
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search by name or email..." value={search} onChange={e=>setSearch(e.target.value)}
            className="w-full bg-[#0e0e0e] border border-[#1a1a1a] rounded-[6px] pl-9 pr-4 py-2.5 text-[13px] text-white placeholder-muted outline-none focus:border-[#333]"/>
        </div>
        <div className="flex gap-1.5">
          {['all','online','offline'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              className={`px-3 py-2 rounded-[6px] text-[11px] font-semibold uppercase tracking-wider border transition-all
                ${filter===f ? 'text-black border-yellow-500' : 'bg-[#0e0e0e] text-muted border-[#1a1a1a] hover:text-white'}`}
              style={filter===f?{background:'linear-gradient(135deg,#eab308,#a16207)'}:{}}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Admin table */}
      <div className="rounded-[8px] border border-[#1a1a1a] overflow-hidden" style={{background:'#0a0a0a'}}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] min-w-[700px]">
            <thead>
              <tr className="border-b border-[#151515]">
                {['Admin','Contact','Admin No.','Orders Handled','Status','Last Seen','Actions'].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-wider2 text-muted font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0f0f0f]">
              {filtered.map(a=>(
                <tr key={a.id} className="hover:bg-[#0d0d0d] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] overflow-hidden"
                          style={{background:'linear-gradient(135deg,#eab308,#a16207)',color:'#000'}}>
                          {a.photoURL ? <img src={a.photoURL} alt="" className="w-full h-full object-cover"/> : (a.name||'A')[0].toUpperCase()}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0a]"
                          style={{background:a.online?'#22c55e':'#444'}}/>
                      </div>
                      <div>
                        <p className="font-semibold text-white">{a.name||'—'}</p>
                        <p className="text-muted text-[10px]">{a.id?.slice(0,8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-off">{a.email}<br/><span className="text-muted text-[10px]">{a.phone||'—'}</span></td>
                  <td className="px-4 py-3"><span className="font-mono text-[11px]" style={{color:'#eab308'}}>#{String(a.adminNo||'—').padStart(3,'0')}</span></td>
                  <td className="px-4 py-3 text-white font-semibold">{a.ordersHandled}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{background:a.online?'#22c55e':'#444'}}/>
                      <span className={`text-[11px] font-semibold ${a.online?'text-green-400':'text-muted'}`}>{a.online?'Online':'Offline'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted text-[11px]">{fmtTime(a.lastSeen)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={()=>setSelected(a)}
                        className="px-2.5 py-1 bg-[#141414] border border-[#222] rounded-[4px] text-[10px] text-muted hover:text-white hover:border-[#333] transition-all">
                        View
                      </button>
                      {a.role !== 'owner' && (
                        <button onClick={()=>setConfirm({type:'demote',target:a})}
                          className="px-2.5 py-1 bg-red/5 border border-red/20 rounded-[4px] text-[10px] text-red hover:bg-red/10 transition-all">
                          Demote
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length===0&&<p className="text-center text-muted text-[12px] py-10">No admins found</p>}
        </div>
      </div>

      {/* Promote User section */}
      <div className="rounded-[8px] border border-[#1a1a1a] overflow-hidden" style={{background:'#0a0a0a'}}>
        <div className="px-5 py-4 border-b border-[#1a1a1a]">
          <p className="text-[13px] font-bold text-white">Promote User to Admin</p>
          <p className="text-[11px] text-muted mt-0.5">{regularUsers.length} registered customers</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] min-w-[500px]">
            <thead>
              <tr className="border-b border-[#151515]">
                {['User','Email','Registered','Action'].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-wider2 text-muted font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0f0f0f]">
              {regularUsers.slice(0,20).map(u=>(
                <tr key={u.id} className="hover:bg-[#0d0d0d] transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">{u.name||'—'}</td>
                  <td className="px-4 py-3 text-off">{u.email}</td>
                  <td className="px-4 py-3 text-muted text-[11px]">{fmtDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button onClick={()=>setConfirm({type:'promote',target:u})}
                      className="px-3 py-1.5 rounded-[4px] text-[10px] font-semibold text-black border border-yellow-500/50 hover:border-yellow-500 transition-all"
                      style={{background:'linear-gradient(135deg,rgba(234,179,8,0.15),rgba(234,179,8,0.05))'}}>
                      Make Admin
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Detail Drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[100]" onClick={()=>setSelected(null)}/>
          <div className="fixed right-0 top-0 h-full w-full max-w-[440px] z-[101] overflow-y-auto border-l border-[#1a1a1a]" style={{background:'#0a0a0a'}}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a] sticky top-0" style={{background:'#0a0a0a'}}>
              <p className="font-bold text-[15px] text-white">{selected.name||'Admin'}</p>
              <button onClick={()=>setSelected(null)} className="text-muted hover:text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-[24px] font-bold overflow-hidden"
                  style={{background:'linear-gradient(135deg,#eab308,#a16207)',color:'#000'}}>
                  {selected.photoURL?<img src={selected.photoURL} alt="" className="w-full h-full object-cover"/>:(selected.name||'A')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-[16px] text-white">{selected.name||'—'}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full" style={{background:selected.online?'#22c55e':'#444'}}/>
                    <span className={`text-[11px] ${selected.online?'text-green-400':'text-muted'}`}>{selected.online?'Online Now':'Offline'}</span>
                  </div>
                </div>
              </div>
              {[
                ['Email',selected.email],['Phone',selected.phone],['Address',selected.address],
                ['Admin No.','#'+String(selected.adminNo||'—').padStart(3,'0')],
                ['NID',selected.nidNumber?`****${selected.nidNumber.slice(-4)}`:'—'],
                ['Orders Handled',String(selected.ordersHandled)],
                ['Last Seen',fmtTime(selected.lastSeen)],
                ['Created',fmtDate(selected.userDoc?.createdAt)],
              ].filter(r=>r[1]).map(([l,v])=>(
                <div key={l} className="flex justify-between gap-4 py-2 border-b border-[#111] text-[12px]">
                  <span className="text-muted">{l}</span>
                  <span className="text-off font-medium text-right">{v}</span>
                </div>
              ))}
              {selected.role !== 'owner' && (
                <button onClick={()=>setConfirm({type:'demote',target:selected})}
                  className="w-full py-2.5 rounded-[6px] bg-red/10 border border-red/20 text-[12px] font-semibold text-red hover:bg-red/20 transition-all mt-2">
                  Demote to Customer
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4" onClick={()=>setConfirm(null)}>
          <div className="w-full max-w-[380px] rounded-[8px] border border-[#1a1a1a] p-6" style={{background:'#0e0e0e'}} onClick={e=>e.stopPropagation()}>
            <p className="text-[15px] font-bold text-white mb-2">
              {confirm.type==='promote' ? 'Promote to Admin?' : 'Demote to Customer?'}
            </p>
            <p className="text-[13px] text-muted mb-1"><strong className="text-white">{confirm.target.name||confirm.target.email}</strong></p>
            <p className="text-[12px] text-muted mb-5">
              {confirm.type==='promote'
                ? 'This user will gain Admin access to the Admin Dashboard. Their role in Firestore will be set to "admin".'
                : 'This admin will lose Admin privileges. Their Firestore role will be set to "customer". They must log out for changes to fully take effect.'}
            </p>
            <div className="flex gap-3">
              <button onClick={()=>setConfirm(null)} className="flex-1 py-2.5 rounded-[6px] border border-[#222] text-[12px] text-muted hover:text-white transition-colors">Cancel</button>
              <button
                onClick={()=>confirm.type==='promote' ? promoteUser(confirm.target) : demoteAdmin(confirm.target)}
                className="flex-1 py-2.5 rounded-[6px] text-[12px] font-semibold text-black border border-yellow-500/50 transition-all"
                style={{background:'linear-gradient(135deg,#eab308,#a16207)'}}>
                {confirm.type==='promote' ? 'Confirm Promote' : 'Confirm Demote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
