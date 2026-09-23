import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function AdminProfile() {
  const { user, profile } = useAuth()
  const [form, setForm] = useState({
    name:       '',
    phone:      '',
    address:    '',
    adminNo:    '',
    nidNumber:  '',
    photoURL:   '',
    nidPhotoURL:'',
  })
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [photoPreview,  setPhotoPreview]  = useState('')
  const [nidPreview,    setNidPreview]    = useState('')

  // Load existing admin profile
  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'admins', user.uid)).then(snap => {
      if (snap.exists()) {
        const d = snap.data()
        setForm({
          name:        d.name        || profile?.name  || '',
          phone:       d.phone       || profile?.phone || '',
          address:     d.address     || '',
          adminNo:     d.adminNo     || '',
          nidNumber:   d.nidNumber   || '',
          photoURL:    d.photoURL    || '',
          nidPhotoURL: d.nidPhotoURL || '',
        })
        setPhotoPreview(d.photoURL    || '')
        setNidPreview(  d.nidPhotoURL || '')
      } else {
        // Pre-fill from user profile
        setForm(f => ({
          ...f,
          name:  profile?.name  || '',
          phone: profile?.phone || '',
        }))
      }
      setLoading(false)
    })
  }, [user, profile])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  /* ── Image handlers ── */
  const handleImage = (key, previewSetter, maxMB = 2) => (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`Image must be under ${maxMB}MB`)
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      set(key, ev.target.result)
      previewSetter(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  /* ── Save ── */
  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      await setDoc(doc(db, 'admins', user.uid), {
        uid:         user.uid,
        email:       user.email,
        name:        form.name.trim(),
        phone:       form.phone.trim(),
        address:     form.address.trim(),
        adminNo:     form.adminNo.trim(),
        nidNumber:   form.nidNumber.trim(),
        photoURL:    form.photoURL,
        nidPhotoURL: form.nidPhotoURL,
        updatedAt:   serverTimestamp(),
      }, { merge: true })
      toast.success('Profile updated successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-white/20 border-t-red rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="p-6 max-w-[700px] space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-white">
          Admin Profile
        </h1>
        <p className="text-[12px] text-muted mt-0.5">
          Your details appear in Admin Management for company security
        </p>
      </div>

      {/* Profile photo */}
      <div className="rounded-[8px] border border-[#1a1a1a] p-5"
        style={{ background: 'linear-gradient(160deg,#0e0e0e,#0a0a0a)' }}>
        <p className="text-[10px] uppercase tracking-wider2 text-muted font-semibold mb-4">
          Profile Picture
        </p>
        <div className="flex items-center gap-5">
          {/* Preview */}
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#222] flex-shrink-0
                          flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#C1121F,#8b0000)' }}>
            {photoPreview ? (
              <img src={photoPreview} alt="" className="w-full h-full object-cover"/>
            ) : (
              <span className="text-[26px] font-bold text-white">
                {(form.name || user?.email || 'A')[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 bg-[#141414]
                               border border-[#222] rounded-[6px] text-[12px] text-off
                               hover:border-[#333] hover:text-white transition-all duration-150 w-fit">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload Photo
              <input type="file" accept="image/*" className="hidden"
                onChange={handleImage('photoURL', setPhotoPreview)}/>
            </label>
            <p className="text-[10px] text-muted">Max 2MB · JPG, PNG, WEBP</p>
            {photoPreview && (
              <button onClick={() => { set('photoURL',''); setPhotoPreview('') }}
                className="text-[10px] text-muted hover:text-red transition-colors">
                Remove photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="rounded-[8px] border border-[#1a1a1a] overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#0e0e0e,#0a0a0a)' }}>
        <div className="px-5 py-3.5 border-b border-[#1a1a1a]">
          <p className="text-[10px] uppercase tracking-wider2 text-muted font-semibold">
            Personal Information
          </p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name *">
              <input value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="Your full name" className={iCls}/>
            </Field>
            <Field label="Email">
              <input value={user?.email || ''} readOnly
                className={iCls + ' opacity-50 cursor-not-allowed'}/>
            </Field>
            <Field label="Phone Number">
              <input value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="01XXXXXXXXX" className={iCls}/>
            </Field>
            <Field label="Admin Number">
              <input value={form.adminNo} onChange={e => set('adminNo', e.target.value)}
                placeholder="e.g. 001" className={iCls}/>
            </Field>
          </div>
          <Field label="Address">
            <textarea value={form.address} onChange={e => set('address', e.target.value)}
              placeholder="Your full address" rows={2}
              className={iCls + ' resize-none'}/>
          </Field>
        </div>
      </div>

      {/* Identity verification */}
      <div className="rounded-[8px] border border-[#1a1a1a] overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#0e0e0e,#0a0a0a)' }}>
        <div className="px-5 py-3.5 border-b border-[#1a1a1a] flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C1121F" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <p className="text-[10px] uppercase tracking-wider2 text-muted font-semibold">
            Identity Verification (Company Security)
          </p>
        </div>
        <div className="p-5 space-y-4">
          <Field label="NID Number">
            <input value={form.nidNumber} onChange={e => set('nidNumber', e.target.value)}
              placeholder="National ID number" className={iCls}
              style={{ fontFamily:'monospace', letterSpacing:'0.06em' }}/>
          </Field>

          {/* NID Photo upload */}
          <div>
            <p className="text-[11px] text-muted mb-2 font-medium">NID Picture Upload</p>
            <div className="flex items-start gap-4">
              {/* Preview */}
              {nidPreview ? (
                <div className="relative w-[160px] h-[100px] rounded-[6px] overflow-hidden
                                border border-[#222] flex-shrink-0 bg-[#111]">
                  <img src={nidPreview} alt="NID" className="w-full h-full object-cover"/>
                  <button
                    onClick={() => { set('nidPhotoURL',''); setNidPreview('') }}
                    className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/70 rounded-full
                               flex items-center justify-center text-white hover:bg-red transition-colors">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-[160px] h-[100px]
                                   border-2 border-dashed border-[#222] rounded-[6px] cursor-pointer
                                   hover:border-[#333] transition-colors duration-150 bg-[#0d0d0d] flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <p className="text-[10px] text-muted mt-1.5">Upload NID</p>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={handleImage('nidPhotoURL', setNidPreview, 5)}/>
                </label>
              )}

              <div className="space-y-1.5">
                <p className="text-[12px] text-off font-medium">Upload your NID card photo</p>
                <p className="text-[11px] text-muted leading-relaxed">
                  This is stored securely for company security purposes only.
                  It will be visible to authorized admins in the Admin Management page.
                </p>
                <p className="text-[10px] text-muted">Max 5MB · JPG, PNG</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <button onClick={handleSave} disabled={saving}
        className="w-full py-3.5 bg-red text-white rounded-[6px] text-[13px] font-semibold
                   hover:bg-red/90 transition-colors duration-150 disabled:opacity-60
                   flex items-center justify-center gap-2">
        {saving ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
            Saving...
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            Save Profile
          </>
        )}
      </button>

      <p className="text-[11px] text-muted text-center">
        Your profile data will automatically appear in the Admin Management page after saving.
      </p>
    </div>
  )
}

const iCls = `w-full bg-[#111] border border-[#1a1a1a] rounded-[4px] px-3 py-2.5
              text-[13px] text-white placeholder-muted outline-none
              focus:border-[#333] transition-colors duration-150`

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] text-muted font-medium">{label}</label>
      {children}
    </div>
  )
}
