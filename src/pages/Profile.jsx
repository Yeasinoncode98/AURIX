import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AvatarInitials({ name, size = 80 }) {
  const initials = (name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="flex items-center justify-center w-full h-full rounded-full text-white font-display font-bold"
      style={{ fontSize: size * 0.38, background: 'linear-gradient(135deg, #C1121F 0%, #8B0E17 100%)' }}>
      {initials}
    </div>
  )
}

function Field({ label, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold tracking-wider2 uppercase text-muted">{label}</label>
      {children}
      {hint && !error && <p className="text-[10px] text-muted">{hint}</p>}
      {error && <p className="text-[11px] text-red">{error}</p>}
    </div>
  )
}

const inp = (err) =>
  `w-full bg-[#0e0e0e] border ${err ? 'border-red' : 'border-border'} rounded-[4px] px-4 py-3
   text-[14px] text-white placeholder-muted outline-none focus:border-[#444] transition-colors duration-200`

export default function Profile() {
  const { user, profile, logout, updateUserProfile, loading } = useAuth()
  const navigate = useNavigate()
  const fileRef  = useRef(null)

  const [form,   setForm]   = useState({ name: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [imgSrc, setImgSrc] = useState(null)
  const [imgLoading, setImgLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true })
  }, [loading, user, navigate])

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name || '', phone: profile.phone || '' })
      setImgSrc(profile.photoURL || user?.photoURL || null)
    }
  }, [profile, user])

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 'var(--nav-h)' }}>
      <div className="w-8 h-8 border-2 border-border border-t-red rounded-full animate-spin" />
    </div>
  )

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
    setSaved(false)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setErrors(er => ({ ...er, avatar: 'Image must be under 2 MB' }))
      return
    }
    setErrors(er => ({ ...er, avatar: '' }))
    setImgLoading(true)
    const reader = new FileReader()
    reader.onload = (ev) => { setImgSrc(ev.target.result); setImgLoading(false) }
    reader.readAsDataURL(file)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (form.phone && !/^01[3-9]\d{8}$/.test(form.phone)) errs.phone = 'Enter a valid BD phone number'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      await updateUserProfile({ name: form.name.trim(), phone: form.phone.trim(), photoURL: imgSrc || '' })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setErrors({ general: 'Failed to save. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => { await logout(); navigate('/') }

  const displayName = profile?.name || user.displayName || user.email?.split('@')[0] || 'User'
  const memberSince = profile?.createdAt?.toDate
    ? profile.createdAt.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'N/A'

  return (
    <main style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh', background: '#080808' }}>

      {/* ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(193,18,31,0.05) 0%, transparent 70%)',
        }} />
      </div>

      {/* breadcrumb */}
      <div className="border-b border-border">
        <div className="container-inner py-4 flex items-center gap-2 text-[11px] text-muted">
          <Link to="/" className="hover:text-white transition-colors duration-150">Home</Link>
          <span>/</span>
          <span className="text-white">My Profile</span>
        </div>
      </div>

      <div className="container-inner py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 max-w-[860px] mx-auto items-start">

          {/* ── LEFT — avatar card ── */}
          <div className="flex flex-col items-center gap-5 p-6 rounded-[8px] border border-border
                          lg:sticky lg:top-[calc(var(--nav-h)+24px)]"
            style={{ background: 'linear-gradient(160deg, #141414, #0f0f0f)' }}>

            {/* Avatar with upload overlay */}
            <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
              <div className="w-[88px] h-[88px] rounded-full overflow-hidden border-2 border-border"
                style={{ boxShadow: '0 0 0 4px rgba(193,18,31,0.1)' }}>
                {imgLoading ? (
                  <div className="w-full h-full bg-surface flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-border border-t-red rounded-full animate-spin" />
                  </div>
                ) : imgSrc ? (
                  <img src={imgSrc} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <AvatarInitials name={displayName} size={88} />
                )}
              </div>
              {/* hover overlay */}
              <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center
                              opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
            </div>

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            {errors.avatar && <p className="text-[11px] text-red text-center">{errors.avatar}</p>}
            <p className="text-[10px] uppercase tracking-wider2 text-muted">Tap photo to change</p>

            {/* summary */}
            <div className="text-center w-full pt-4 border-t border-border space-y-1">
              <p className="font-display font-bold text-[16px] tracking-[-0.02em] text-white">{displayName}</p>
              <p className="text-[11px] text-muted truncate">{user.email}</p>
              {(profile?.phone || form.phone) && (
                <p className="text-[11px] text-muted">{profile?.phone || form.phone}</p>
              )}
              <div className="pt-2">
                <span className="inline-block text-[9px] uppercase tracking-wider2 font-bold px-2.5 py-1 rounded-[2px]"
                  style={{
                    background: profile?.role === 'admin' ? 'rgba(193,18,31,0.15)' : 'rgba(255,255,255,0.05)',
                    color:      profile?.role === 'admin' ? '#C1121F' : '#777',
                    border:     `1px solid ${profile?.role === 'admin' ? 'rgba(193,18,31,0.3)' : '#333'}`,
                  }}>
                  {profile?.role === 'admin' ? 'Admin' : 'Customer'}
                </span>
              </div>
            </div>

            {/* sign out */}
            <button onClick={handleLogout}
              className="btn-ghost w-full justify-center gap-2" style={{ fontSize: '11px', padding: '10px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out
            </button>
          </div>

          {/* ── RIGHT — edit form ── */}
          <div className="rounded-[8px] border border-border overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #141414, #0f0f0f)' }}>

            <div className="px-7 py-5 border-b border-border">
              <h1 className="font-display font-bold text-[18px] tracking-[-0.02em] text-white">Edit Profile</h1>
              <p className="text-[12px] text-muted mt-0.5">Changes save in real time — no refresh needed.</p>
            </div>

            <form onSubmit={handleSave} noValidate className="px-7 py-7 space-y-6">

              {errors.general && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-[4px] border border-red/30 bg-red/5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C1121F" strokeWidth="2" className="flex-shrink-0">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-[12px] text-red">{errors.general}</p>
                </div>
              )}

              <Field label="Full Name" error={errors.name}>
                <input type="text" placeholder="Your full name" value={form.name}
                  onChange={e => set('name', e.target.value)} className={inp(errors.name)} />
              </Field>

              <Field label="Email Address" hint="Email cannot be changed.">
                <div className="relative">
                  <input type="email" value={user.email} readOnly
                    className="w-full bg-[#0a0a0a] border border-border rounded-[4px] px-4 py-3
                               text-[14px] text-muted outline-none cursor-not-allowed" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] uppercase
                                   tracking-wider2 text-muted border border-border px-1.5 py-0.5 rounded-[2px] bg-[#111]">
                    Fixed
                  </span>
                </div>
              </Field>

              <Field label="Phone Number" hint="Used for order notifications and promotions." error={errors.phone}>
                <input type="tel" placeholder="01XXXXXXXXX" value={form.phone}
                  onChange={e => set('phone', e.target.value)} className={inp(errors.phone)} />
              </Field>

              <div className="pt-1">
                <button type="submit" disabled={saving}
                  className={`btn-primary flex items-center gap-2 transition-all duration-300
                    ${saved ? '!bg-green-700 !border-green-700' : ''}`}
                  style={{ padding: '12px 28px', fontSize: '12px', opacity: saving ? 0.8 : 1 }}>
                  {saving ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                  ) : saved ? (
                    <><svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                      <path d="M1.5 6l3 3 6-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>Saved!</>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>

            {/* account info */}
            <div className="mx-7 mb-7 p-4 rounded-[6px] border border-border space-y-2.5"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[10px] uppercase tracking-wider2 text-muted mb-3">Account Info</p>
              {[
                ['Member Since',  memberSince],
                ['Account Type',  profile?.role === 'admin' ? 'Administrator' : 'Customer'],
                ['Login Method',  user.providerData?.[0]?.providerId === 'google.com' ? 'Google' : 'Email & Password'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-[12px]">
                  <span className="text-muted">{label}</span>
                  <span className="text-off">{value}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
