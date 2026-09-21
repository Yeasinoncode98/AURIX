import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ProductReveal from './components/ProductReveal'
import Sound from './components/Sound'
import Engineering from './components/Engineering'
import Craftsmanship from './components/Craftsmanship'
import Specifications from './components/Specifications'
import CTA from './components/CTA'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      {/* Scroll progress bar */}
      <div id="progress-bar" className="fixed top-0 left-0 h-[2px] bg-red z-[9999] w-0 transition-[width] duration-100" />
      <Navbar />
      <main>
        <Hero />
        <ProductReveal />
        <Sound />
        <Engineering />
        <Craftsmanship />
        <Specifications />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
