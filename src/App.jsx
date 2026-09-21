import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'

export default function App() {
  return (
    <>
      <div id="progress-bar" className="fixed top-0 left-0 h-[2px] bg-red z-[9999] w-0 transition-[width] duration-100" />
      <Navbar />
      <Routes>
        <Route path="/"     element={<Home />} />
        <Route path="/shop" element={<Shop />} />
      </Routes>
      <Footer />
    </>
  )
}
