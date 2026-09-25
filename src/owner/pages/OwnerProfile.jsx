import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function OwnerProfile() {
  const { user, profile } = useAuth()
  const [form, setForm] = useState({ name:'', phone:'', address:'' })
  const [photo, setPhoto] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getDoc(doc(db,'owners',user.uid)).then(snap => {
      if (snap.exists()) {
        const d = snap.data()
        setForm({ name:d.name||profile?.name||'', phone:d.phone||profile?.phone||'', address:d.address||'' })
        setPhoto(d.photoURL||'')
      } else {
        setForm({ name:profile?.name||'', phone:profile?.phone||'', address:'' })
      }
      setLoading(false)
    })
  }, [user, profile])

  const handlePhoto = e => {
    const file = e.target.files[0]; if(!file) return
    if(file.size > 2*1024*1024) { toast.error('Max 2MB'); return }
    const reader = new FileReader()
    reader.onload = ev => setPhoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name required'); return }
    setSaving(true)
    try {
      await setDoc(doc(db,'owners',user.uid), {
        uid: user.uid, email: user.email,
        name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim(),
        photoURL: photo, updatedAt: serverTimestamp(),
      }, { merge: true })
      toast.success('Profile updated successfully')
    } catch { toast.error('Failed to save') } finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"/></div>

  const iCls = "w-full bg-[#111] border border-[#1a1a1a] rounded-[4px] px-3 py-2.5 text-[13px] text-white placeholder-muted outline-none focus:border-[#333] transition-colors"

  return (
    <div className="p-6 max-w-[600px] space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-white">Owner Profile</h1>
        <p className="text-[12px] text-muted mt-0.5">Your profile is stored separately from admin profiles</p>
      </div>

      {/* Avatar */}
      <div className="rounded-[8px] border border-[#1a1a1a] p-5" style={{background:'linear-gradient(160deg,#0e0e0e,#0a0a0a)'}}>
        <p className="text-[10px] uppercase tracking-wider2 text-muted font-semibold mb-4">Profile Picture</p>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center font-bold text-[26px] flex-shrink-0"
            style={{background:'linear-gradient(135deg,#eab308,#a16207)',color:'#000'}}>
            {photo ? <img src={photo} alt="" className="w-full h-full object-cover"/> : (form.name||user?.email||'O')[0].toUpperCase()}
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-[#141414] border border-[#222] rounded-[6px] text-[12px] text-off hover:text-white transition-all w-fit">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Upload Photo
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto}/>
            </label>
            <p className="text-[10px] text-muted">Max 2MB</p>
            {photo && <button onClick={()=>setPhoto('')} className="text-[10px] text-muted hover:text-red transition-colors">Remove</button>}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-[8px] border border-[#1a1a1a] overflow-hidden" style={{background:'linear-gradient(160deg,#0e0e0e,#0a0a0a)'}}>
        <div className="px-5 py-3.5 border-b border-[#1a1a1a]">
          <p className="text-[10px] uppercase tracking-wider2 text-muted font-semibold">Account Information</p>
        </div>
        <div className="p-5 space-y-4">
          <div><label className="text-[11px] text-muted font-medium block mb-1.5">Full Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Your name" className={iCls}/></div>
          <div><label className="text-[11px] text-muted font-medium block mb-1.5">Email</label><input value={user?.email||''} readOnly className={iCls+' opacity-50 cursor-not-allowed'}/></div>
          <div><label className="text-[11px] text-muted font-medium block mb-1.5">Phone</label><input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="01XXXXXXXXX" className={iCls}/></div>
          <div><label className="text-[11px] text-muted font-medium block mb-1.5">Address</label><textarea value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} rows={2} placeholder="Your address" className={iCls+' resize-none'}/></div>
        </div>
      </div>

      {/* Role info — read-only */}
      <div className="rounded-[8px] border px-5 py-4" style={{borderColor:'rgba(234,179,8,0.2)',background:'rgba(234,179,8,0.05)'}}>
        <div className="flex items-center gap-2 mb-1">
          <span style={{color:'#eab308'}}>👑</span>
          <p className="text-[12px] font-semibold" style={{color:'#eab308'}}>Owner Role</p>
        </div>
        <p className="text-[12px] text-muted">Your role is verified from Firestore (<code className="text-[11px] bg-[#1a1a1a] px-1 rounded">role: "owner"</code>). This cannot be changed from the profile UI.</p>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full py-3.5 rounded-[6px] text-[13px] font-semibold text-black disabled:opacity-60 flex items-center justify-center gap-2"
        style={{background:'linear-gradient(135deg,#eab308,#a16207)'}}>
        {saving ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>Saving...</> : 'Save Profile'}
      </button>
    </div>
  )
}
