# Owner Dashboard Memory
Last updated: AURIX Project — Owner Dashboard complete ✅

## Overview
- **Route:** `/owner/*`
- **Layout file:** `src/owner/OwnerLayout.jsx`
- **Pages folder:** `src/owner/pages/`
- **Components folder:** `src/owner/components/`
- **Theme:** Dark premium — bg `#070709`, sidebar `#0c0c10`, accent `#eab308` (gold/yellow)
- **Purpose:** Executive read-only business overview — operations চালানো এখানে না, oversight-এর জন্য
- **Currency:** ৳ Taka everywhere
- **Real-time:** সব data `onSnapshot` দিয়ে

---

## Packages Used
```bash
npm install recharts react-hot-toast react-to-print
# Already present: firebase, react-router-dom, tailwindcss
```

---

## File Structure
```
src/owner/
├── OwnerLayout.jsx              ← sidebar + header + auth guard (yellow theme)
├── components/
│   └── OwnerBDClock.jsx         ← real-time Bangladesh clock (Asia/Dhaka)
└── pages/
    ├── OwnerOverview.jsx        ← real-time metrics, charts, admin presence widget
    ├── OwnerOrders.jsx          ← read-only all orders, search, date filter, detail drawer
    ├── OwnerAdminManagement.jsx ← promote/demote admins ✍️ (exception — writes)
    ├── OwnerAdminPerformance.jsx← per-admin stats, orders handled, date range
    ├── OwnerInventory.jsx       ← products table, stock/price edit ✍️ (exception — writes)
    ├── OwnerCustomers.jsx       ← all customers, order stats per customer, read-only
    ├── OwnerCoupons.jsx         ← coupon overview, usage count, read-only
    ├── OwnerFinance.jsx         ← revenue breakdown, charts, payment methods
    ├── OwnerReports.jsx         ← printable reports, CEO sign, read-only
    └── OwnerProfile.jsx         ← owner's own profile → owners/{uid}
```

---

## Routing — App.jsx
```jsx
<Route path="/owner" element={<OwnerLayout />}>
  <Route index element={<OwnerOverview />} />
  <Route path="orders" element={<OwnerOrders />} />
  <Route path="admin-management" element={<OwnerAdminManagement />} />
  <Route path="admin-performance" element={<OwnerAdminPerformance />} />
  <Route path="inventory" element={<OwnerInventory />} />
  <Route path="customers" element={<OwnerCustomers />} />
  <Route path="coupons" element={<OwnerCoupons />} />
  <Route path="finance" element={<OwnerFinance />} />
  <Route path="reports" element={<OwnerReports />} />
  <Route path="profile" element={<OwnerProfile />} />
</Route>
```

---

## OwnerLayout.jsx — সম্পূর্ণ Structure

### Sidebar Nav Items (order অনুযায়ী)
```js
const NAV = [
  { to: '/owner',                   label: 'Overview',          icon: '📊' },
  { to: '/owner/orders',            label: 'All Orders',        icon: '📦' },
  { to: '/owner/admin-management',  label: 'Admin Management',  icon: '👥' },
  { to: '/owner/admin-performance', label: 'Admin Performance', icon: '📈' },
  { to: '/owner/inventory',         label: 'Inventory',         icon: '🏪' },
  { to: '/owner/customers',         label: 'Customers',         icon: '👤' },
  { to: '/owner/coupons',           label: 'Coupons',           icon: '🏷️' },
  { to: '/owner/finance',           label: 'Finance & Revenue', icon: '💰' },
  { to: '/owner/reports',           label: 'Reports',           icon: '📄' },
  { to: '/owner/profile',           label: 'Owner Profile',     icon: '⚙️' },
]
```

### Auth Guard Logic
```js
const { user, profile, logout, isOwner, loading } = useAuth()

// Auth loading wait — refresh-এ logout হয় না
useEffect(() => {
  if (loading) return
  if (!user || !isOwner) navigate('/login', { replace: true })
}, [user, isOwner, loading, navigate])

// Loading spinner (yellow theme)
if (loading) return (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#070709' }}>
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
      <p className="text-[12px] text-muted">Verifying owner access...</p>
    </div>
  </div>
)
if (!user || !isOwner) return null
```

### Theme — Yellow/Gold (Admin-এর Red-এর বিপরীতে)
```js
// Sidebar border
borderColor: 'rgba(234,179,8,0.1)'

// Active nav item background
background: 'linear-gradient(135deg,rgba(234,179,8,0.2),rgba(234,179,8,0.08))'
// Active nav border
borderColor: 'rgba(234,179,8,0.3)'

// Logo gradient
background: 'linear-gradient(135deg,#eab308,#a16207)'

// Owner badge in header
background: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.25)', color: '#eab308'
text: '👑 Owner'

// Page bg
background: '#070709'
// Sidebar bg
background: '#0c0c10'
```

### Header (top bar)
- Left: Mobile hamburger + `OwnerBDClock`
- Right: `👑 Owner` badge + Owner avatar (yellow gradient)
- **No notification bell** — owner শুধু দেখে, alerts পায় না

### Sidebar Features
- Collapsed mode: `w-[64px]` — icons only, tooltip on hover
- Mobile: slide-in drawer
- **No real-time badges** — শুধু navigation

### OwnerBDClock.jsx (same logic as AdminBDClock)
```js
useEffect(() => {
  const tick = () => setTime(
    new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka', dateStyle: 'full', timeStyle: 'medium' })
  )
  tick()
  const interval = setInterval(tick, 1000)
  return () => clearInterval(interval)
}, [])
```

---

## AuthContext — Owner-specific

### loginAsOwner flow
```js
const loginAsOwner = async (email, pass) => {
  const cred = await signInWithEmailAndPassword(auth, email, pass)
  const snap = await getDoc(doc(db, 'users', cred.user.uid))
  if (snap.data()?.role !== 'owner') {
    await signOut(auth)
    throw new Error('Access denied. Owner role required.')
  }
  // isOwner = true set হয়
}
```

### Login Page — Owner Tab (3rd tab)
- Tab 3: "Owner" — yellow/gold styling, crown icon `👑`
- Email/Password only (no Google)
- Rate limit: 5 attempts per 30 seconds

### Owner Role Setup (Manual)
```
Firebase Console → Firestore → users collection → {uid} → role: 'owner'
```

### isOwner vs isAdmin
- `isOwner` — Owner Dashboard access
- `isAdmin` — Admin Dashboard access
- Owner can also read `admins` collection (admin profiles), `presence`, all orders
- **Owner হলে Auto-logout নেই** (Admin-এ আছে, Owner-এ নেই)

---

## Firestore Collections — Owner যা read/write করে

### Read (সব read করতে পারে)
```
orders       — সব orders (no restriction for owner)
products     — সব products + stock
categories   — সব categories
users        — সব users (customer + admin)
admins       — সব admin profiles
presence     — সব admins-এর online status
refunds      — সব refunds
coupons      — সব coupons
blockedIPs   — সব blocked IPs
reviews      — top-level reviews
```

### Write (exception — শুধু এই দুটোতে)
```
users/{uid}     → role change (promote/demote admin)
products/{slug} → stock + price update (OwnerInventory)
blockedIPs/{ip} → block/unblock IP (OwnerOrders drawer)
owners/{uid}    → own profile only (OwnerProfile)
```

### `owners/{uid}` collection (Owner Profile)
```js
{ name, phone, email, photoURL, address, updatedAt }
```

---

## Owner Dashboard Pages — সম্পূর্ণ Logic

### 1. OwnerOverview.jsx

**Collections:** `orders`, `products`, `admins`, `presence`, `refunds` — সব onSnapshot

**Stat Cards (12টি):**
```js
Today's Orders    | Total Orders     | Month Orders
Today Revenue     | Month Revenue    | Total Revenue
Product Revenue   | Pending Refunds  | Refunded (Delivery)
Pending           | Delivered        | Admins Online (X/total)
```

**Revenue calculations (same as Admin Dashboard):**
```js
const delivered = orders.filter(o => o.status === 'delivered')
const totalRev = delivered.reduce((s, o) => s + (o.totalAmount || 0), 0)
const productRev = totalRev - delivered.reduce((s, o) => s + (o.deliveryFee || 0), 0)
```

**Admin Presence Widget:**
```js
// isOnline check — 2 minute window
const isOnline = (uid) => {
  const p = presence[uid]
  if (!p?.lastSeen || p.online === false) return false
  const last = p.lastSeen?.toDate ? p.lastSeen.toDate() : new Date(p.lastSeen)
  return Date.now() - last.getTime() < 2 * 60 * 1000
}
const onlineAdmins = admins.filter(a => isOnline(a.id))

// Grid of admin cards — green/gray dot, name, Online/lastSeen
// "Manage Admins →" link to /owner/admin-management
```

**Low Stock Alert:**
```js
const lowStock = products.filter(p => (p.stock ?? 999) <= 5)
// Yellow warning card, link → /owner/inventory
```

**Charts:**
- 7-Day Trend: `AreaChart` — orders + revenue (dual area, blue + yellow)
- Order Status: `PieChart` donut — same STATUS_COLORS as admin

---

### 2. OwnerOrders.jsx — READ ONLY

**Collection:** `orders` (onSnapshot, client-side sort by createdAt desc)

**Table columns:** Order ID | Customer | Payment | Items | Amount | Status | Handled By

**Key difference from Admin:** কোনো status update button নেই — শুধু view

**Filters:**
- Search: Order ID, Customer Name, Customer Phone
- Status filter: all / pending / confirmed / preparing / shipped / delivered / cancelled (yellow theme)
- **Date range filter**: `dateFrom` + `dateTo` input (`[color-scheme:dark]`)

**Date filter logic:**
```js
if (dateFrom || dateTo) {
  const d = o.createdAt?.toDate ? o.createdAt.toDate() : null
  if (d) {
    if (dateFrom) matchD = matchD && d >= new Date(dateFrom)
    if (dateTo) {
      const e = new Date(dateTo); e.setHours(23,59,59,999)
      matchD = matchD && d <= e
    }
  }
}
```

**Detail Drawer (right slide-in, max-w-[460px]):**
- Label: "Order Details — Read Only"
- All order fields shown (customer, payment, items, summary, handledBy)
- **IP Tracking section** (same as Admin)
- **Block/Unblock IP button** (Owner can block too → writes to `blockedIPs`)

**IP Block from OwnerOrders:**
```js
await setDoc(doc(db, 'blockedIPs', ipKey), {
  ip: order.clientIP,
  active: !blocked,
  blockedAt: serverTimestamp(),
  reason: 'Blocked by owner from order: ' + (order.orderId || order.id),
  orderId: order.orderId || order.id,
}, { merge: true })
toast.success(blocked ? 'IP unblocked' : 'IP blocked')
```

---

### 3. OwnerAdminManagement.jsx — ✍️ WRITES TO FIRESTORE

**IMPORTANT: এটি Owner Dashboard-এর একমাত্র page যেটি সরাসরি user roles পরিবর্তন করে।**

**Collections:** `admins`, `users`, `presence`, `orders` — সব onSnapshot

**Admin List building:**
```js
// Source of truth: users where role === 'admin'
// Merge with admins collection for profile details (photo, adminNo, nid etc.)
const adminList = users
  .filter(u => u.role === 'admin')
  .map(u => {
    const adminProfile = admins.find(a => a.id === u.id) || {}
    return {
      ...adminProfile,  // profile details (photo, adminNo)
      ...u,             // user data overrides (role, email, name)
      id: u.id,
      ordersHandled: orders.filter(o => o.handledBy?.uid === u.id).length,
      online: isOnline(u.id),
      lastSeen: presence[u.id]?.lastSeen,
    }
  })
```

**Admin Table columns:** Admin | Contact | Admin No. | Orders Handled | Status | Last Seen | Actions

**Promote User → Admin:**
```js
await updateDoc(doc(db, 'users', u.id), {
  role: 'admin',
  promotedBy: user?.uid,
  promotedAt: serverTimestamp()
})
toast.success(`${u.name || u.email} promoted to Admin`)
```

**Demote Admin → Customer:**
```js
if (a.role === 'owner') { toast.error('Cannot demote the Owner'); return }
await updateDoc(doc(db, 'users', a.id), {
  role: 'customer',
  demotedBy: user?.uid,
  demotedAt: serverTimestamp()
})
toast.success(`${a.name || a.email} demoted to Customer`)
```

**Security note shown in UI:**
```
⚠ Role changes update Firestore only. Firebase Auth session tokens are not immediately
revoked — the affected admin must log out and back in for changes to fully take effect.
```

**AdminLayout real-time watcher:** demoted admin-এর session automatically end হয় (onSnapshot role check)

**Filter:** All / Online / Offline

**Confirm Modal:** Promote/Demote action-এ confirmation dialog দেখায়

**"Promote User" section (bottom):** সব `role === 'customer'` users দেখায়, "Make Admin" button

**Admin Detail Drawer:**
- Name, Email, Phone, Address, Admin No., NID (last 4 digits masked: `****1234`)
- Orders Handled count, Last Seen, Online status
- "Demote to Customer" button

---

### 4. OwnerAdminPerformance.jsx — READ ONLY

**Collections:** `orders`, `admins`, `users` (onSnapshot)

**Logic:**
```js
// Per admin — orders handled
const adminStats = adminList.map(admin => {
  const handled = orders.filter(o => o.handledBy?.uid === admin.id)
  const delivered = handled.filter(o => o.status === 'delivered')
  return {
    ...admin,
    totalHandled: handled.length,
    delivered: delivered.length,
    cancelled: handled.filter(o => o.status === 'cancelled').length,
    revenue: delivered.reduce((s, o) => s + (o.totalAmount || 0), 0),
    // avg handle time: updatedAt - createdAt average
  }
})
```

**Date range filter** (from / to) — same pattern as OwnerOrders

**Display:** Table or cards per admin with their stats

---

### 5. OwnerInventory.jsx — ✍️ WRITES STOCK + PRICE

**Collection:** `products` (onSnapshot, sorted by numeric id)

**Features:**
- Table: Product image + name + tagline | Price | Stock (color-coded) | Status badge | Categories | Edit button
- Stock colors: `#22c55e` (>5) | `#eab308` (≤5, >0) | `#C1121F` (0) | `#666` (null)
- Filter: All / OK (>5) / Low (≤5 & >0) / Out (=0)
- Search by product name

**Stock Alert banner (yellow):**
```js
const lowCount = products.filter(p => (p.stock ?? 999) <= 5 && (p.stock ?? 999) > 0).length
const outCount = products.filter(p => p.stock === 0).length
// Shows: "X products out of stock · Y products low stock (≤5)"
```

**Edit Modal (Stock + Price only):**
```js
// onClick Edit → setEditing({ docId: p.docId, stock: String(p.stock ?? ''), price: String(p.price || '') })

await updateDoc(doc(db, 'products', editing.docId), {
  stock: Number(editing.stock),
  price: Number(editing.price),
  updatedAt: serverTimestamp()
})
toast.success('Product updated successfully')
```

**CRITICAL:** `editing.docId` = Firestore string doc ID (not numeric id field)

**Real-time reflection:** Admin Dashboard low stock alert + Shop page price — সব immediately update হয়

---

### 6. OwnerCustomers.jsx — READ ONLY

**Collections:** `users` (where role='customer'), `orders` (onSnapshot)

**Per customer stats:**
```js
const customerStats = customers.map(c => ({
  ...c,
  orderCount: orders.filter(o => o.userId === c.id || o.userEmail === c.email).length,
  totalSpent: orders
    .filter(o => (o.userId === c.id || o.userEmail === c.email) && o.status === 'delivered')
    .reduce((s, o) => s + (o.totalAmount || 0), 0)
}))
```

**Table columns:** Customer | Email | Phone | Orders | Total Spent | Joined | Action (View)

**Detail drawer:** Full customer profile + order history list — no edit capability

---

### 7. OwnerCoupons.jsx — READ ONLY

**Collections:** `coupons`, `orders` (onSnapshot)

**Per coupon usage count:**
```js
const couponsWithUsage = coupons.map(c => ({
  ...c,
  usageCount: orders.filter(o => o.couponCode === c.code).length,
  totalDiscount: orders
    .filter(o => o.couponCode === c.code)
    .reduce((s, o) => s + (o.discountAmount || 0), 0)
}))
```

**Display:** Table — Code | Type | Value | Status (Active/Inactive) | Used | Total Discount Given

**No toggle/edit** — শুধু read (Admin Coupons page-এ toggle করতে হয়)

---

### 8. OwnerFinance.jsx — READ ONLY

**Collection:** `orders` (onSnapshot)

**Date range filter:** 7 Days / This Month / This Year / All Time

**KPI Cards (8টি):**
```
Gross Revenue      | Product Revenue   | Delivery Collected | Discount Given
Pending Value      | Delivered Orders  | Cancelled Orders   | Avg Order Value
```

**Revenue calculations:**
```js
const fo = filterOrders()  // filtered by selected range
const delivered = fo.filter(o => o.status === 'delivered')
const grossRevenue = delivered.reduce((s, o) => s + (o.totalAmount || 0), 0)
const deliveryCollected = delivered.reduce((s, o) => s + (o.deliveryFee || 0), 0)
const productRevenue = grossRevenue - deliveryCollected
const discountGiven = fo.filter(o => o.discount > 0).reduce((s, o) => s + (o.discount || 0), 0)
const pendingValue = fo.filter(o => o.status === 'pending').reduce((s, o) => s + (o.totalAmount || 0), 0)
```

**Important note shown in UI:**
```
ℹ Revenue figures are gross order totals from delivered orders.
Product cost, salaries, and operational expenses are not tracked —
profit/loss cannot be calculated from available data.
```

**Charts:**
- Monthly Revenue Trend: `AreaChart` (last 6 months, yellow gradient)
- Delivery Fee by Payment Method: simple list (bKash vs Nagad amounts)

**Monthly breakdown:**
```js
const monthly = Array.from({ length: 6 }, (_, i) => {
  const d = new Date(); d.setMonth(d.getMonth() - i); d.setDate(1); d.setHours(0,0,0,0)
  const next = new Date(d); next.setMonth(next.getMonth() + 1)
  const month = orders.filter(o => { const od = bdDate(o.createdAt); return od && od >= d && od < next })
  return {
    month: d.toLocaleDateString('en-BD', { month: 'short', year: '2-digit' }),
    revenue: month.filter(o => o.status === 'delivered').reduce((s,o) => s + (o.totalAmount||0), 0),
    orders: month.length,
  }
}).reverse()
```

---

### 9. OwnerReports.jsx — READ ONLY (print only)

**Collection:** `orders` (onSnapshot)

**Report modes:** Monthly | Yearly | Date Range

**Table columns (same as AdminReports):**
```
Order ID | Date | Customer | Phone | Items (name×qty) | Order Total | Discount | Delivery | Revenue | Status
```

**Items format:** `AURIX Studio ×4, AURIX Pro ×1`

**Totals row:**
- Total Revenue (delivered orders only)
- Total Discount sum
- Total Delivery sum
- Style: dark background, colored text

**CEO Signature toggle:**
```jsx
// Checkbox → shows at bottom of printed report:
<div style={{ marginTop: 40, borderTop: '1px solid #333', paddingTop: 12 }}>
  <p style={{ fontSize: 11 }}>Authorized by: {ceoName}</p>
  <p style={{ fontSize: 11 }}>Signature: _________________</p>
</div>
```

**Print/PDF:**
```jsx
import { useReactToPrint } from 'react-to-print'
const printRef = useRef()
const handlePrint = useReactToPrint({ content: () => printRef.current })
```

---

### 10. OwnerProfile.jsx

**Firestore path:** `owners/{uid}` (আলাদা collection — NOT `users/{uid}`, NOT `admins/{uid}`)

**Fields:**
```js
{ name, phone, email (read-only), photoURL (base64), address, updatedAt }
```

**Image upload (same base64 pattern):**
```js
if (file.size > 2 * 1024 * 1024) { toast.error('Max 2MB'); return }
const reader = new FileReader()
reader.onload = ev => setForm(f => ({ ...f, photoURL: ev.target.result }))
reader.readAsDataURL(file)
```

**Save:**
```js
await setDoc(doc(db, 'owners', user.uid), {
  ...form,
  email: user.email,
  updatedAt: serverTimestamp()
}, { merge: true })
toast.success('Profile saved')
```

---

## Firestore Rules — Owner-specific

```js
// Helper functions (rules_version = '2')
function isAdmin() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
function isOwner() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner';
}
function isAdminOrOwner() {
  return isAdmin() || isOwner();
}

// users — owner can read all, update role
match /users/{uid} {
  allow read: if request.auth.uid == uid || isAdminOrOwner();
  allow update: if (request.auth.uid == uid
      && !('role' in request.resource.data.diff(resource.data).affectedKeys()))
    || isAdminOrOwner();
}

// products — owner can write (stock/price update)
match /products/{productId} {
  allow read: if true;
  allow write: if isAdmin() || isOwner();
}

// admins — owner can read (see all admin profiles)
match /admins/{uid} {
  allow read: if isAdminOrOwner();
  allow write: if request.auth.uid == uid && !('role' in request.resource.data);
}

// presence — owner can read
match /presence/{uid} {
  allow read: if isAdminOrOwner();
  allow write: if request.auth.uid == uid;
}

// orders — owner can read
match /orders/{orderId} {
  allow create: if true;
  allow read: if request.auth != null;
  allow update: if isAdmin() || isOwner();
}

// owners collection — own profile only
match /owners/{uid} {
  allow read, write: if request.auth.uid == uid;
}

// refunds — owner can read + update
match /refunds/{id} {
  allow get: if request.auth.uid == resource.data.userId || isAdminOrOwner();
  allow list: if isAdminOrOwner();
  allow update: if isAdmin();  // owner cannot process refunds
}

// blockedIPs — owner can read + write
match /blockedIPs/{ip} {
  allow read, write: if isAdminOrOwner();
}

// coupons — owner can read
match /coupons/{id} {
  allow read: if true;
  allow write: if isAdmin();  // only admin creates/toggles coupons
}
```

---

## Admin vs Owner — পার্থক্য চার্ট

| Feature | Admin | Owner |
|---------|-------|-------|
| Route | `/admin` | `/owner` |
| Theme | Red (`#C1121F`) | Gold (`#eab308`) |
| Accent | Red | Yellow |
| Login tab | Tab 2 | Tab 3 |
| Role in Firestore | `role: 'admin'` | `role: 'owner'` |
| Auto-logout on demote | ✅ (real-time watcher) | ❌ |
| Notification bell | ✅ | ❌ |
| Status update orders | ✅ | ❌ |
| Cash memo print | ✅ | ❌ |
| Product CRUD | ✅ Full | ⚠️ Stock+Price only |
| Category CRUD | ✅ | ❌ |
| Coupon toggle | ✅ | ❌ |
| Admin reply reviews | ✅ | ❌ |
| Refund processing | ✅ | ❌ |
| CRM customer edit | ✅ | ❌ |
| Promote/demote admin | ❌ | ✅ |
| Admin Performance | ❌ | ✅ |
| Block/Unblock IP | ✅ | ✅ |
| Profile collection | `admins/{uid}` | `owners/{uid}` |
| Profile fields | name, phone, nid, nidPhoto, adminNo | name, phone, address, photo |

---

## Key Patterns — Owner Dashboard specific

### Yellow theme button pattern
```jsx
// Active filter button — yellow gradient
<button
  style={isActive ? { background: 'linear-gradient(135deg,#eab308,#a16207)' } : {}}
  className={`... ${isActive ? 'text-black border-yellow-500' : 'bg-[#0e0e0e] text-muted border-[#1a1a1a]'}`}>
  {label}
</button>
```

### Spinner — yellow theme
```jsx
<div className="w-6 h-6 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
```

### Stat card — same structure as Admin, but yellow accent
```jsx
<div style={{ background: 'linear-gradient(160deg,#0e0e0e,#0a0a0a)' }}>
  <div style={{ background: color, filter: 'blur(16px)' }} className="absolute ... opacity-10" />
  <p className="text-[20px] font-bold text-white">{value}</p>
  <p className="text-[11px] font-semibold text-off">{label}</p>
  <p className="text-[10px] text-muted">{sub}</p>
  <div style={{ background: color }} className="absolute bottom-0 h-[2px] w-full opacity-40" />
</div>
```

### Read-only label pattern
```jsx
// Page subtitle-এ "Read-only view" বা "Read-only" দেখানো হয়
<p className="text-[12px] text-muted mt-0.5">{orders.length} total · Read-only view</p>
```

---

## Common Bugs & Fixes — Owner specific

| Bug | Cause | Fix |
|-----|-------|-----|
| Owner refresh করলে logout | `loading` check নেই | `if (loading) return` before redirect |
| `docId` error in OwnerInventory | numeric `id` use করেছে | `{ ...d.data(), docId: d.id }` pattern |
| Admin list empty on OwnerAdminManagement | `admins` collection শুধু দেখছে | `users where role==='admin'` + merge with `admins` |
| Admin demote কাজ করে কিন্তু session চলছে | Firebase Auth token revocation নেই | AdminLayout-এর real-time role watcher handle করে |
| Revenue wrong | pending/cancelled orders include হয়েছে | `filter(o => o.status === 'delivered')` |
| Presence check fails | `lastSeen` null হয় | null check + 2-minute window |

---

## Owner Role Setup (Manual — no UI)
```
1. Firebase Console → Firestore → users collection
2. Find the user document (doc ID = Firebase Auth UID)
3. Edit: role field → 'owner'
4. Save
```

## Security Notes
- **Firebase Auth session revocation নেই**: Demoted admin-এর session real-time watcher শেষ করে (client-side)
- **Owner cannot be demoted** via OwnerAdminManagement (code check করে `role === 'owner'`)
- **Owner cannot process refunds** — admin-only operation
- **Owner cannot create admins** via Cloud Function (future improvement)

## Session Notes
- Bengali-তে কথা, code English-এ
- `৳` currency — কখনো `$` না
- Yellow `#eab308` accent — red ব্যবহার করবে না Owner Dashboard-এ
- সব real-time — `onSnapshot` everywhere
- Owner Dashboard = executive view, operations নয়
- Existing Admin/Customer pages কখনো break করবে না


---

## ⚠️ Special Note — Project Type অনুযায়ী Product System পরিবর্তন হয়

### AURIX (headphone) vs অন্য ধরনের project
AURIX-এ একটা product মানে একটা headphone — একটাই unit, একটাই price, একটাই stock।
কিন্তু **প্রতিটি project-এ product structure এক রকম না।**

### উদাহরণ — Grocery / Food Product
যদি project-টা grocery বা food selling হয়, তাহলে একটা product-এর **multiple variants** থাকতে পারে।

**যেমন:** খেজুর (Date) product-এ থাকতে পারে —
- ২৫০ গ্রাম প্যাকেট → ৳১২০
- ৫০০ গ্রাম বক্স → ৳২২০
- ১ কেজি বক্স → ৳৪০০
- ২ কেজি গিফট বক্স → ৳৭৫০

---

### Owner Dashboard-এ কীভাবে প্রভাব পড়বে

#### OwnerInventory.jsx
AURIX-এ inventory table-এ ছিল: Product | Price | Stock | Status | Edit

**Grocery variants থাকলে:**
```
Product     | Variants         | Total Stock | Actions
খেজুর        | 4 variants       | 110 units   | Edit
             ├─ 250g প্যাকেট   | ৳120 · 50 units
             ├─ 500g বক্স      | ৳220 · 30 units
             ├─ 1kg বক্স       | ৳400 · 20 units
             └─ 2kg গিফট বক্স  | ৳750 · 10 units
```

**Edit Modal-এ** single stock/price input-এর বদলে per-variant edit হবে:
```js
// AURIX:
{ stock: Number, price: Number }

// Grocery variants:
variants.map(v => ({ label, price, stock }))
await updateDoc(doc(db, 'products', docId), { variants: updatedVariants, updatedAt })
```

#### OwnerOverview.jsx — Low Stock Alert
AURIX-এ: `products.filter(p => p.stock <= 5)`

**Variants থাকলে:**
```js
// Variant-level low stock check
products.filter(p =>
  (p.variants || []).some(v => v.stock <= 5)
)
// Alert-এ: "খেজুর — 1kg বক্স: 3 left"
```

#### OwnerReports.jsx — Items Column
```
// AURIX style:
AURIX Pro ×2, AURIX Air ×1

// Grocery variants style:
খেজুর (1kg বক্স) ×2, খেজুর (250g) ×3
```

#### OwnerFinance.jsx — Revenue
Variants হলে revenue calculation same থাকে (item.subtotal sum), শুধু display-এ variant label দেখাবে।

---

### Variants থাকলে Firestore Schema পরিবর্তন

```js
// products/{slug} — Grocery variant version
{
  id, slug, name, category, image, description,
  unit: 'kg' | 'g' | 'piece' | 'litre',

  // প্রতিটি variant আলাদা price + stock
  variants: [
    { label: '250g প্যাকেট', weight: '250g', price: 120, stock: 50 },
    { label: '500g বক্স',    weight: '500g', price: 220, stock: 30 },
    { label: '1kg বক্স',     weight: '1kg',  price: 400, stock: 20 },
    { label: '2kg গিফট বক্স', weight: '2kg', price: 750, stock: 10 },
  ],

  badge, rating, createdAt, updatedAt
  // AURIX-এর price, stock, specs, features, fullSpecs, inBox → grocery-তে নাও লাগতে পারে
}
```

---

### Project Type Reference Table

| Project Type | Variants দরকার? | Variant কী হবে? | Owner Inventory কীভাবে দেখাবে |
|---|---|---|---|
| Headphone / Electronics | ❌ সাধারণত না | Color/storage হলে হয় | Single price + stock |
| Grocery / Food | ✅ অবশ্যই | Weight (250g, 500g, 1kg) | Per-variant stock |
| Clothing / Fashion | ✅ অবশ্যই | Size (S/M/L) + Color | Per-variant stock |
| Medicine / Supplement | ✅ প্রায়ই | Pack size (30tabs, 60tabs) | Per-variant stock |
| Cosmetics | ✅ প্রায়ই | Shade / Volume (50ml, 100ml) | Per-variant stock |
| Books / Stationery | ❌ সাধারণত না | Edition হলে হয় | Single price + stock |

---

### Key Rule — নতুন project শুরুর আগে Owner Dashboard বানানোর আগেই ঠিক করো

> **"এই project-এ কি product-এর multiple variants (size/weight/color) দরকার?"**

- **না** → AURIX-এর মতো OwnerInventory রাখো (single stock/price edit)
- **হ্যাঁ** → OwnerInventory-তে per-variant edit system বানাও, OwnerOverview low stock alert-এও variant-level check করো
