import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { collection, onSnapshot, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import AdminNotificationBell from './components/AdminNotificationBell'
import AdminBDClock from './components/AdminBDClock'

/* ── Nav items ── */
const NAV = [
  { to: '/admin',            icon: DashIcon,    label: 'Dashboard'        },
  { to: '/admin/orders',     icon: OrderIcon,   label: 'Orders'           },
  { to: '/admin/products',   icon: ProductIcon, label: 'Products'         },
  { to: '/admin/categories', icon: CategoryIcon,label: 'Categories'       },
  { to: '/admin/reviews',    icon: ReviewIcon,  label: 'Reviews'          },
  { to: '/admin/users',      icon: UsersIcon,   label: 'Users & CRM'      },
  { to: '/admin/coupons',    icon: CouponIcon,  label: 'Coupons'          },
  { to: '/admin/billings',   icon: BillingIcon, label: 'Billings'         },
  { to: '/admin/analytics',  icon: AnalyticsIcon,label: 'Analytics'       },
  { to: '/admin/reports',    icon: ReportIcon,  label: 'Monthly Reports'  },
  { to: '/admin/admins',     icon: AdminMgmtIcon,label: 'Admin Management'},
  { to: '/admin/profile',    icon: ProfileIcon, label: 'Admin Profile'    },
]

export default function AdminLayout() {
  const { user, profile, logout, isAdmin, loading } = useAuth()
  const navigate  = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unseenReviews, setUnseenReviews] = useState(0)  // only NEW reviews since last visit
  const prevReviewCount = useRef(null)

  // Track only NEW reviews since admin last visited Reviews page
  useEffect(() => {
    return onSnapshot(collection(db, 'reviews'), snap => {
      const count = snap.size
      if (prevReviewCount.current === null) {
        // First load — baseline, no badge
        prevReviewCount.current = count
        return
      }
      if (count > prevReviewCount.current) {
        // New reviews arrived
        setUnseenReviews(n => n + (count - prevReviewCount.current))
      }
      prevReviewCount.current = count
    })
  }, [])

  // Wait for Firebase auth to restore session before redirecting
  useEffect(() => {
    if (loading) return          // still loading — do nothing
    if (!user || !isAdmin) navigate('/login', { replace: true })
  }, [user, isAdmin, loading, navigate])

  // Real-time role watcher — if role changes to non-admin, force logout
  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(doc(db, 'users', user.uid), snap => {
      if (!snap.exists()) return
      const role = snap.data().role
      if (role !== 'admin') {
        logout().then(() => navigate('/login', { replace: true }))
      }
    })
    return unsub
  }, [user])

  // Show spinner while Firebase restores session
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#080808]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#222] border-t-red rounded-full animate-spin"/>
        <p className="text-[12px] text-muted">Restoring session...</p>
      </div>
    </div>
  )

  if (!user || !isAdmin) return null

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-[#080808] text-white overflow-hidden">

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-[40] lg:hidden"
          onClick={() => setMobileOpen(false)} />
      )}

      {/* ══ SIDEBAR ══ */}
      <aside className={`
        fixed lg:relative z-[50] flex flex-col h-full
        bg-[#0c0c0c] border-r border-[#1a1a1a]
        transition-all duration-300 ease-in-out flex-shrink-0
        ${collapsed ? 'w-[68px]' : 'w-[240px]'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-[#1a1a1a] flex-shrink-0
                         ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-[6px] bg-red flex items-center justify-center flex-shrink-0"
            style={{ boxShadow: '0 0 16px rgba(193,18,31,0.4)' }}>
            <span className="text-[11px] font-black text-white tracking-tight">AX</span>
          </div>
          {!collapsed && (
            <div>
              <p className="font-display font-extrabold text-[14px] tracking-[-0.03em] text-white leading-none">AURIX</p>
              <p className="text-[9px] text-muted uppercase tracking-wider2 mt-0.5">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2 scrollbar-hide">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              onClick={() => {
                setMobileOpen(false)
                if (to === '/admin/reviews') setUnseenReviews(0)
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-[12px] font-medium
                 transition-all duration-150 group relative
                 ${isActive
                   ? 'bg-red/10 text-white border border-red/20'
                   : 'text-muted hover:text-white hover:bg-[#141414] border border-transparent'
                 }
                 ${collapsed ? 'justify-center' : ''}`
              }>
              {({ isActive }) => (
                <>
                  <Icon size={16} active={isActive} />
                  {!collapsed && (
                    <span className="truncate flex items-center gap-1.5">
                      {label}
                      {to === '/admin/reviews' && unseenReviews > 0 && (
                        <span className="px-1.5 py-0.5 bg-red/20 text-red text-[9px]
                                         font-black rounded-full border border-red/30 leading-none">
                          {unseenReviews}
                        </span>
                      )}
                    </span>
                  )}
                  {/* Tooltip when collapsed */}
                  {collapsed && (
                    <span className="absolute left-full ml-3 px-2 py-1 bg-[#1a1a1a] border border-[#2a2a2a]
                                     text-white text-[11px] rounded-[4px] whitespace-nowrap
                                     opacity-0 group-hover:opacity-100 pointer-events-none
                                     transition-opacity duration-150 z-[100]">
                      {label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: collapse toggle + logout */}
        <div className="flex-shrink-0 border-t border-[#1a1a1a] p-2 space-y-1">
          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-[6px]
                       text-muted hover:text-white hover:bg-[#141414] transition-all duration-150
                       text-[12px] font-medium"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <CollapseIcon collapsed={collapsed} />
            {!collapsed && <span>Collapse</span>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-[6px]
                       text-muted hover:text-red hover:bg-red/5 transition-all duration-150
                       text-[12px] font-medium ${collapsed ? 'justify-center' : ''}`}>
            <LogoutIcon />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ══ MAIN AREA ══ */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── TOP HEADER ── */}
        <header className="flex-shrink-0 flex items-center justify-between
                           px-5 py-3.5 bg-[#0c0c0c] border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="lg:hidden w-8 h-8 flex items-center justify-center text-muted hover:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6"  x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            {/* BD Clock */}
            <AdminBDClock />
          </div>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <AdminNotificationBell />

            {/* Admin avatar */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-[#1a1a1a]">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#2a2a2a] flex-shrink-0
                              flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #C1121F, #8b0000)' }}>
                {profile?.photoURL
                  ? <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                  : <span className="text-[11px] font-bold text-white">
                      {(profile?.name || user?.email || 'A')[0].toUpperCase()}
                    </span>
                }
              </div>
              <div className="hidden sm:block">
                <p className="text-[12px] font-semibold text-white leading-none">
                  {profile?.name || 'Admin'}
                </p>
                <p className="text-[10px] text-muted mt-0.5">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 overflow-y-auto bg-[#080808]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

/* ══ ICONS ══ */
function DashIcon({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={active ? '#C1121F' : 'currentColor'} strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  )
}
function OrderIcon({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={active ? '#C1121F' : 'currentColor'} strokeWidth="1.8">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  )
}
function ProductIcon({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={active ? '#C1121F' : 'currentColor'} strokeWidth="1.8">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <line x1="12" y1="22" x2="12" y2="11"/><path d="M3.27 6.96 12 12.01l8.73-5.05"/>
    </svg>
  )
}
function CategoryIcon({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={active ? '#C1121F' : 'currentColor'} strokeWidth="1.8">
      <path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
    </svg>
  )
}
function ReviewIcon({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={active ? '#C1121F' : 'currentColor'} strokeWidth="1.8">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
}
function UsersIcon({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={active ? '#C1121F' : 'currentColor'} strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}
function CouponIcon({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={active ? '#C1121F' : 'currentColor'} strokeWidth="1.8">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  )
}
function BillingIcon({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={active ? '#C1121F' : 'currentColor'} strokeWidth="1.8">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  )
}
function AnalyticsIcon({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={active ? '#C1121F' : 'currentColor'} strokeWidth="1.8">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  )
}
function ReportIcon({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={active ? '#C1121F' : 'currentColor'} strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9"  x2="8" y2="9"/>
    </svg>
  )
}
function AdminMgmtIcon({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={active ? '#C1121F' : 'currentColor'} strokeWidth="1.8">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}
function ProfileIcon({ size = 16, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={active ? '#C1121F' : 'currentColor'} strokeWidth="1.8">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}
function CollapseIcon({ collapsed }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}
