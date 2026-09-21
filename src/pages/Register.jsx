import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()

  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [show,    setShow]    = useState(false)

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '', general: '' })) }

  const validate = () => {
    const e = {}
    if (!form.name.trim())               e.name     = 'Name is required'
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email   = 'Enter a valid email'
    if (form.password.length < 6)        e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm)  e.confirm  = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await register(form.name.trim(), form.email, form.password)
      navigate('/shop', { replace: true })
    } catch (err) {
      // show the actual firebase error code for easier debugging
      const code = err.code || err.message || 'unknown'
      setErrors({ general: friendlyError(code) })
      console.error('Register error:', code, err)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = (key) =>
    `w-full bg-[#111] border ${errors[key] ? 'border-red' : 'border-border'} rounded-[4px] px-4 py-3
     text-[14px] text-white placeholder-muted outline-none focus:border-[#444] transition-colors duration-200`

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-10"
      style={{ paddingTop: 'var(--nav-h)', background: '#080808' }}>

      {/* bg glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div style={{
          position: 'absolute', top: '40%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(193,18,31,0.07) 0%, transparent 70%)',
        }} />
      </div>

      <div className="relative z-[1] w-full max-w-[420px]">

        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="font-display font-extrabold text-[26px] tracking-[-0.03em] text-white no-underline">
            AUR<span className="text-red">I</span>X
          </Link>
          <p className="text-[13px] text-muted mt-2">Create your account</p>
        </div>

        {/* Card */}
        <div className="rounded-[8px] border border-border overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #141414, #0f0f0f)' }}>

          <div className="px-8 py-8">
            {errors.general && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-[4px] border border-red/30 bg-red/5 mb-6">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C1121F" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-[12px] text-red">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold tracking-wider2 uppercase text-muted">Full Name <span className="text-red">*</span></label>
                <input type="text" placeholder="Md. Rahim Hossain" autoComplete="name"
                  value={form.name} onChange={e => set('name', e.target.value)}
                  className={inputCls('name')} />
                {errors.name && <p className="text-[11px] text-red">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold tracking-wider2 uppercase text-muted">Email Address <span className="text-red">*</span></label>
                <input type="email" placeholder="you@example.com" autoComplete="email"
                  value={form.email} onChange={e => set('email', e.target.value)}
                  className={inputCls('email')} />
                {errors.email && <p className="text-[11px] text-red">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold tracking-wider2 uppercase text-muted">Password <span className="text-red">*</span></label>
                  <button type="button" onClick={() => setShow(s => !s)}
                    className="text-[10px] text-muted hover:text-white transition-colors duration-150 uppercase tracking-wider2">
                    {show ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input type={show ? 'text' : 'password'} placeholder="Min. 6 characters" autoComplete="new-password"
                  value={form.password} onChange={e => set('password', e.target.value)}
                  className={inputCls('password')} />
                {errors.password && <p className="text-[11px] text-red">{errors.password}</p>}
              </div>

              {/* Confirm */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold tracking-wider2 uppercase text-muted">Confirm Password <span className="text-red">*</span></label>
                <input type={show ? 'text' : 'password'} placeholder="Repeat password" autoComplete="new-password"
                  value={form.confirm} onChange={e => set('confirm', e.target.value)}
                  className={inputCls('confirm')} />
                {errors.confirm && <p className="text-[11px] text-red">{errors.confirm}</p>}
              </div>

              <button
                type="submit" disabled={loading}
                className="btn-primary w-full justify-center mt-2"
                style={{ padding: '14px', fontSize: '12px', opacity: loading ? 0.8 : 1 }}>
                {loading
                  ? <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </span>
                  : 'Create Account'
                }
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-border text-center">
            <p className="text-[12px] text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-white hover:text-red transition-colors duration-150 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted mt-6">
          <Link to="/shop" className="hover:text-white transition-colors duration-150">
            ← Continue without signing in
          </Link>
        </p>
      </div>
    </main>
  )
}

function friendlyError(code) {
  const map = {
    'auth/email-already-in-use':   'This email is already registered. Sign in instead.',
    'auth/invalid-email':          'Please enter a valid email address.',
    'auth/weak-password':          'Password is too weak. Use at least 6 characters.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'permission-denied':           'Database permission denied. Check your Firestore rules.',
    'firestore/permission-denied': 'Database permission denied. Check your Firestore rules.',
  }
  return map[code] || `Error: ${code}`
}
