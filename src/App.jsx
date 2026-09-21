import { Routes, Route } from 'react-router-dom'
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

export default function App() {
  return (
    <>
      <div id="progress-bar" className="fixed top-0 left-0 h-[2px] bg-red z-[9999] w-0 transition-[width] duration-100" />
      <Navbar />
      <Routes>
        <Route path="/"               element={<Home />} />
        <Route path="/shop"           element={<Shop />} />
        <Route path="/shop/:slug"     element={<ProductDetail />} />
        <Route path="/checkout"       element={<Checkout />} />
        <Route path="/order-success"  element={<OrderSuccess />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<Register />} />
        <Route path="/profile"        element={<Profile />} />
      </Routes>
      <Footer />
    </>
  )
}
