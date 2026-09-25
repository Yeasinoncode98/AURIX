import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import OwnerBDClock from './components/OwnerBDClock'

const NAV = [
  { to: '/owner',                  label: 'Overview',          icon: '📊' },
  { to: '/owner/orders',           label: 'All Orders',        icon: '📦' },
  { to: '/owner/admin-management', label: 'Admin Management',  icon: '👥' },
  { to: '/owner/admin-performance',label: 'Admin Performance', icon: '📈' },
  { to: '/owner/inventory',        label: 'Inventory',         icon: '🏪' },
  { to: '/owner/customers',        label: 'Customers',         icon: '👤' },
  { to: '/owner/coupons',          label: 'Coupons',           icon: '🏷️' },
  { to: '/owner/finance',          label: 'Finance & Revenue', icon: '💰' },
  { to: '/owner/reports',          label: 'Reports',           icon: '📄' },
  { to: '/owner/profile',          label: 'Owner Profile',     icon: '⚙️' },
]

export default function OwnerLayout() {
  const { user, profile, logout, isOwner, loading } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user || !isOwner) navigate('/login', { replace: true })
  }, [user, isOwner, loading, navigate])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#070709' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
        <p className="text-[12px] text-muted">Verifying owner access...</p>
      </div>
    </div>
  )

  if (!user || !isOwner) return null

  const handleLogout = async () => { await logout(); navigate('/login') }
  const displayName  = profile?.name || user?.email?.split('@')[0] || 'Owner'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'#070709', color:'#fff' }}>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed lg:relative z-50 flex flex-col h-full border-r transition-all duration-300 flex-shrink-0
        ${collapsed ? 'w-[64px]' : 'w-[240px]'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background:'#0c0c10', borderColor:'rgba(234,179,8,0.1)' }}>

        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b flex-shrink-0 ${collapsed ? 'justify-center' : ''}`}
          style={{ borderColor:'rgba(234,179,8,0.1)' }}>
          <div className="w-8 h-8 rounded-[6px] flex items-center justify-center flex-shrink-0"
            style={{ background:'linear-gradient(135deg,#eab308,#a16207)', boxShadow:'0 0 16px rgba(234,179,8,0.3)' }}>
            <span className="text-[11px] font-black text-black">AX</span>
          </div>
          {!collapsed && (
            <div>
              <p className="font-display font-extrabold text-[14px] tracking-[-0.03em] text-white leading-none">AURIX</p>
              <p className="text-[9px] uppercase tracking-wider2 mt-0.5" style={{ color:'#eab308' }}>Owner Portal</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end={to === '/owner'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-[12px] font-medium
                 transition-all duration-150 group relative
                 ${collapsed ? 'justify-center' : ''}
                 ${isActive
                   ? 'text-black border border-yellow-500/30'
                   : 'text-muted hover:text-white hover:bg-white/5 border border-transparent'}`
              }
              style={({ isActive }) => isActive ? { background:'linear-gradient(135deg,rgba(234,179,8,0.2),rgba(234,179,8,0.08))' } : {}}>
              <span className="text-[14px] flex-shrink-0" style={{ filter: 'none' }}>{icon}</span>
              {!collapsed && <span className="truncate text-white">{label}</span>}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-[#1a1a1a] border border-[#2a2a2a]
                                 text-white text-[11px] rounded-[4px] whitespace-nowrap
                                 opacity-0 group-hover:opacity-100 pointer-events-none z-[100]">
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="flex-shrink-0 border-t p-2 space-y-1" style={{ borderColor:'rgba(234,179,8,0.1)' }}>
          <button onClick={() => setCollapsed(c => !c)}
            className="hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-[6px]
                       text-muted hover:text-white hover:bg-white/5 transition-all text-[12px]"
            title={collapsed ? 'Expand' : 'Collapse'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition:'transform 0.3s', flexShrink:0 }}>
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {!collapsed && <span>Collapse</span>}
          </button>
          <button onClick={handleLogout}
            className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-[6px]
                       text-muted hover:text-red hover:bg-red/5 transition-all text-[12px]
                       ${collapsed ? 'justify-center' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ flexShrink:0 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 border-b"
          style={{ background:'#0c0c10', borderColor:'rgba(234,179,8,0.1)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(o => !o)}
              className="lg:hidden w-8 h-8 flex items-center justify-center text-muted hover:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <OwnerBDClock />
          </div>

          <div className="flex items-center gap-3">
            {/* Owner badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider"
              style={{ background:'rgba(234,179,8,0.08)', borderColor:'rgba(234,179,8,0.25)', color:'#eab308' }}>
              <span>👑</span> Owner
            </div>
            {/* Avatar */}
            <div className="flex items-center gap-2 pl-3 border-l" style={{ borderColor:'rgba(234,179,8,0.15)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0"
                style={{ background:'linear-gradient(135deg,#eab308,#a16207)', color:'#000' }}>
                {(profile?.name || user?.email || 'O')[0].toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-[12px] font-semibold text-white leading-none">{displayName}</p>
                <p className="text-[10px] text-muted mt-0.5">Business Owner</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={{ background:'#070709' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
