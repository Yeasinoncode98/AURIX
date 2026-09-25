import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import MyOrders from './pages/MyOrders'

// Admin
import AdminLayout     from './admin/AdminLayout'
import AdminDashboard  from './admin/pages/AdminDashboard'
import AdminOrders     from './admin/pages/AdminOrders'
import AdminProducts   from './admin/pages/AdminProducts'
import AdminCategories from './admin/pages/AdminCategories'
import AdminReviews    from './admin/pages/AdminReviews'
import AdminUsers      from './admin/pages/AdminUsers'
import AdminCoupons    from './admin/pages/AdminCoupons'
import AdminBillings   from './admin/pages/AdminBillings'
import AdminAnalytics  from './admin/pages/AdminAnalytics'
import AdminReports    from './admin/pages/AdminReports'
import AdminManagement from './admin/pages/AdminManagement'
import AdminProfile    from './admin/pages/AdminProfile'

// Owner
import OwnerLayout           from './owner/OwnerLayout'
import OwnerOverview         from './owner/pages/OwnerOverview'
import OwnerOrders           from './owner/pages/OwnerOrders'
import OwnerAdminManagement  from './owner/pages/OwnerAdminManagement'
import OwnerAdminPerformance from './owner/pages/OwnerAdminPerformance'
import OwnerInventory        from './owner/pages/OwnerInventory'
import OwnerCustomers        from './owner/pages/OwnerCustomers'
import OwnerCoupons          from './owner/pages/OwnerCoupons'
import OwnerFinance          from './owner/pages/OwnerFinance'
import OwnerReports          from './owner/pages/OwnerReports'
import OwnerProfile          from './owner/pages/OwnerProfile'

export default function App() {
  return (
    <>
      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#141414',
            color: '#fff',
            border: '1px solid #222',
            borderRadius: '6px',
            fontSize: '13px',
            fontFamily: 'inherit',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#141414' },
          },
          error: {
            iconTheme: { primary: '#C1121F', secondary: '#141414' },
          },
        }}
      />

      {/* ── Public routes (with Navbar + Footer) ── */}
      <Routes>
        <Route path="/" element={<WithShell><Home /></WithShell>} />
        <Route path="/shop" element={<WithShell><Shop /></WithShell>} />
        <Route path="/shop/:slug" element={<WithShell><ProductDetail /></WithShell>} />
        <Route path="/checkout" element={<WithShell><Checkout /></WithShell>} />
        <Route path="/order-success" element={<WithShell><OrderSuccess /></WithShell>} />
        <Route path="/login" element={<WithShell><Login /></WithShell>} />
        <Route path="/register" element={<WithShell><Register /></WithShell>} />
        <Route path="/profile" element={<WithShell><Profile /></WithShell>} />
        <Route path="/my-orders" element={<WithShell><MyOrders /></WithShell>} />

        {/* ── Admin routes (no Navbar/Footer — own layout) ── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index                element={<AdminDashboard />} />
          <Route path="orders"        element={<AdminOrders />} />
          <Route path="products"      element={<AdminProducts />} />
          <Route path="categories"    element={<AdminCategories />} />
          <Route path="reviews"       element={<AdminReviews />} />
          <Route path="users"         element={<AdminUsers />} />
          <Route path="coupons"       element={<AdminCoupons />} />
          <Route path="billings"      element={<AdminBillings />} />
          <Route path="analytics"     element={<AdminAnalytics />} />
          <Route path="reports"       element={<AdminReports />} />
          <Route path="admins"        element={<AdminManagement />} />
          <Route path="profile"       element={<AdminProfile />} />
        </Route>
        {/* ── Owner routes ── */}
        <Route path="/owner" element={<OwnerLayout />}>
          <Route index                    element={<OwnerOverview />} />
          <Route path="orders"            element={<OwnerOrders />} />
          <Route path="admin-management"  element={<OwnerAdminManagement />} />
          <Route path="admin-performance" element={<OwnerAdminPerformance />} />
          <Route path="inventory"         element={<OwnerInventory />} />
          <Route path="customers"         element={<OwnerCustomers />} />
          <Route path="coupons"           element={<OwnerCoupons />} />
          <Route path="finance"           element={<OwnerFinance />} />
          <Route path="reports"           element={<OwnerReports />} />
          <Route path="profile"           element={<OwnerProfile />} />
        </Route>
      </Routes>
    </>
  )
}

/* Wraps public pages with Navbar + Footer */
function WithShell({ children }) {
  return (
    <>
      <div id="progress-bar"
        className="fixed top-0 left-0 h-[2px] bg-red z-[9999] w-0 transition-[width] duration-100" />
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
