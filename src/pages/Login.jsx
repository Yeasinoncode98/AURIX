import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/* ── Google SVG icon ── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
      <path d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z" fill="#FF3D00"/>
      <path d="M24 46c5.5 0 10.5-1.9 14.3-5l-6.6-5.6C29.6 37 26.9 38 24 38c-6.1 0-10.7-3.1-11.8-7.5l-7 5.4C8.6 41.8 15.7 46 24 46z" fill="#4CAF50"/>
      <path d="M44.5 20H24v8.5h11.8c-.6 2.4-2.1 4.4-4.1 5.9l6.6 5.6C42.5 36.3 45 30.6 45 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
    </svg>
  )
}

const TABS = [
  { key: 'user',  label: 'User' },
  { key: 'admin', label: 'Admin' },
]

export default function Login() {
  const { login, loginWithGoogle, loginAsAdmin } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from || '/shop'

  const [tab,     setTab]     = useState('user')
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [gLoad,   setGLoad]   = useState(false)
  const [show,    setShow]    = useState(false)

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError('') }

  /* ── Email / Password submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Please fill in all fields'); return }
    setLoading(true)
    try {
      if (tab === 'admin') {
        await loginAsAdmin(form.email, form.password)
        navigate('/admin', { replace: true })
      } else {
        await login(form.email, form.password)
        navigate(from, { replace: true })
      }
    } catch (err) {
      setError(err.message === 'NOT_ADMIN'
        ? 'Access denied. This account does not have admin privileges.'
        : friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  /* ── Google login ── */
  const handleGoogle = async () => {
    setGLoad(true); setError('')
    try {
      await loginWithGoogle()
      navigate(from, { replace: true })
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setGLoad(false)
    }
  }

  /* ── switch tab — clear state ── */
  const switchTab = (t) => {
    setTab(t)
    setForm({ email: '', password: '' })
    setError('')
    setShow(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5"
      style={{ paddingTop: 'var(--nav-h)', background: '#080808' }}>

      {/* bg glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div style={{
          position: 'absolute', top: '40%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 500, height: 500, borderRadius: '50%',
          background: tab === 'admin'
            ? 'radial-gradient(circle, rgba(193,18,31,0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(193,18,31,0.06) 0%, transparent 70%)',
          transition: 'background 0.4s ease',
        }} />
      </div>

      <div className="relative z-[1] w-full max-w-[420px]">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="font-display font-extrabold text-[26px] tracking-[-0.03em] text-white no-underline">
            AUR<span className="text-red">I</span>X
          </Link>
          <p className="text-[13px] text-muted mt-2">Sign in to your account</p>
        </div>

        {/* ── Tab switcher ── */}
        <div className="flex items-center gap-1 p-1 rounded-[6px] border border-border mb-6"
          style={{ background: '#111' }}>
          {TABS.map(t => (
            <button key={t.key} type="button"
              onClick={() => switchTab(t.key)}
              className={`flex-1 py-2.5 text-[11px] font-semibold tracking-wider2 uppercase rounded-[4px]
                          transition-all duration-200 cursor-pointer
                          ${tab === t.key
                            ? 'bg-red text-white'
                            : 'text-muted hover:text-white'}`}>
              {t.key === 'admin' && <span className="mr-1">🔒</span>}
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Card ── */}
        <div className="rounded-[8px] border overflow-hidden transition-all duration-300"
          style={{
            borderColor: tab === 'admin' ? 'rgba(193,18,31,0.3)' : '#222',
            background: 'linear-gradient(160deg, #141414, #0f0f0f)',
          }}>

          {/* Admin banner */}
          {tab === 'admin' && (
            <div className="flex items-center gap-2 px-6 py-3 border-b"
              style={{ borderColor: 'rgba(193,18,31,0.2)', background: 'rgba(193,18,31,0.06)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C1121F" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span className="text-[12px] font-semibold text-red tracking-wide">Admin Login — Restricted Access</span>
            </div>
          )}

          <div className="px-8 py-8">

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-[4px] border border-red/30 bg-red/5 mb-5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C1121F" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-[12px] text-red leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold tracking-wider2 uppercase text-muted">
                  Email Address
                </label>
                <input
                  type="email" placeholder="you@example.com" autoComplete="email"
                  value={form.email} onChange={e => set('email', e.target.value)}
                  className="w-full bg-[#0e0e0e] border border-border rounded-[4px] px-4 py-3
                             text-[14px] text-white placeholder-muted outline-none
                             focus:border-[#444] transition-colors duration-200" />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold tracking-wider2 uppercase text-muted">
                    Password
                  </label>
                  <button type="button" onClick={() => setShow(s => !s)}
                    className="text-[10px] text-muted hover:text-white transition-colors duration-150 uppercase tracking-wider2">
                    {show ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={show ? 'text' : 'password'} placeholder="••••••••"
                  autoComplete={tab === 'admin' ? 'current-password' : 'current-password'}
                  value={form.password} onChange={e => set('password', e.target.value)}
                  className="w-full bg-[#0e0e0e] border border-border rounded-[4px] px-4 py-3
                             text-[14px] text-white placeholder-muted outline-none
                             focus:border-[#444] transition-colors duration-200" />
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                className="btn-primary w-full justify-center"
                style={{ padding: '14px', fontSize: '12px', opacity: loading ? 0.8 : 1 }}>
                {loading
                  ? <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </span>
                  : tab === 'admin' ? 'Sign In as Admin' : 'Sign In'
                }
              </button>
            </form>

            {/* Google — user tab only */}
            {tab === 'user' && (
              <>
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[11px] text-muted uppercase tracking-wider2">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <button
                  type="button" onClick={handleGoogle} disabled={gLoad}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-[4px] border border-border
                             bg-[#0e0e0e] text-[13px] font-medium text-off hover:text-white hover:border-[#333]
                             transition-all duration-200 cursor-pointer"
                  style={{ opacity: gLoad ? 0.7 : 1 }}>
                  {gLoad
                    ? <span className="w-4 h-4 border-2 border-[#444] border-t-white rounded-full animate-spin" />
                    : <GoogleIcon />
                  }
                  Continue with Google
                </button>
              </>
            )}

            {/* Admin note */}
            {tab === 'admin' && (
              <p className="text-[11px] text-muted text-center mt-4 leading-relaxed">
                Admin access is by invitation only.<br/>Contact the site owner if you need access.
              </p>
            )}
          </div>

          {/* Card footer */}
          <div className="px-8 py-4 border-t border-border text-center">
            {tab === 'user' ? (
              <p className="text-[12px] text-muted">
                Don't have an account?{' '}
                <Link to="/register" className="text-white hover:text-red transition-colors duration-150 font-medium">
                  Register now
                </Link>
              </p>
            ) : (
              <p className="text-[12px] text-muted">
                <Link to="/login" onClick={() => switchTab('user')}
                  className="text-off hover:text-white transition-colors duration-150">
                  ← Back to User Login
                </Link>
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-muted mt-5">
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
    'auth/user-not-found':         'No account found with this email.',
    'auth/wrong-password':         'Incorrect password.',
    'auth/invalid-email':          'Enter a valid email address.',
    'auth/too-many-requests':      'Too many attempts. Try again later.',
    'auth/invalid-credential':     'Invalid email or password.',
    'auth/popup-closed-by-user':   'Google sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  }
  return map[code] || 'Something went wrong. Please try again.'
}
