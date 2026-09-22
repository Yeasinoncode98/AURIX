import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import { useCart } from '../context/CartContext'
import CartDrawer from '../components/CartDrawer'
import ShopIntro from '../components/ShopIntro'

/* ── tiny hook: fade-up on scroll into view ── */
function useFadeIn(delay = 0) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(28px)'
    el.style.transition = `opacity 0.7s ${delay}ms ease, transform 0.7s ${delay}ms ease`
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
        obs.disconnect()
      }
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])
  return ref
}

/* ── Added-to-cart flash button state ── */
function AddButton({ product, onAdd }) {
  const [added, setAdded] = useState(false)
  const handle = () => {
    onAdd(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }
  return (
    <button
      onClick={handle}
      className={`relative overflow-hidden flex items-center justify-center gap-2
        text-[11px] font-semibold tracking-wider2 uppercase rounded-[3px] border
        transition-all duration-300 cursor-pointer
        ${added
          ? 'bg-transparent border-red text-red'
          : 'bg-red border-red text-white hover:bg-[#a30e19]'
        }`}
      style={{ padding: '10px 18px', boxShadow: added ? '0 0 16px rgba(193,18,31,0.3)' : '' }}>
      {added ? (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1.5 6l3 3 6-6" stroke="#C1121F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Added
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          Add to Cart
        </>
      )}
    </button>
  )
}

/* ── Product Card ── */
function ProductCard({ product, onAdd, index }) {
  const ref = useFadeIn(index * 100)
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col rounded-[6px] overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #161616 0%, #111111 100%)',
        border: `1px solid ${hovered ? '#C1121F40' : '#222'}`,
        boxShadow: hovered
          ? '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(193,18,31,0.15), inset 0 1px 0 rgba(255,255,255,0.04)'
          : '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
        transition: 'border-color 0.35s ease, box-shadow 0.35s ease, transform 0.35s ease',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
      }}>

      {/* Badge */}
      {product.badge && (
        <span className="absolute top-4 left-4 z-10 text-[9px] font-bold tracking-wider4 uppercase
                         bg-red text-white px-2.5 py-[5px] rounded-[2px]"
          style={{ boxShadow: '0 2px 10px rgba(193,18,31,0.4)' }}>
          {product.badge}
        </span>
      )}

      {/* Wishlist btn */}
      <button className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full border border-border
                         flex items-center justify-center text-muted hover:text-red hover:border-red
                         transition-all duration-200 bg-[#0e0e0e]/80 backdrop-blur-sm"
        aria-label="Wishlist">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      {/* Clickable image area → product detail */}
      <div
        onClick={() => navigate(`/shop/${product.slug}`)}
        className="relative flex items-center justify-center overflow-hidden cursor-pointer"
        style={{ height: '220px', background: 'radial-gradient(ellipse at center, #1c1c1c 0%, #0e0e0e 70%)' }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div style={{
            width: 160, height: 160, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(193,18,31,0.18) 0%, transparent 70%)',
            opacity: hovered ? 1 : 0, transition: 'opacity 0.4s ease',
          }} />
        </div>
        <img src={product.image} alt={product.name}
          className="relative z-[1] object-contain"
          style={{
            width: '62%',
            transform: hovered ? 'scale(1.08) translateY(-4px)' : 'scale(1) translateY(0)',
            filter: hovered ? 'drop-shadow(0 12px 24px rgba(193,18,31,0.25))' : 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))',
            transition: 'transform 0.5s ease, filter 0.5s ease',
          }}
        />
        {/* "View Details" overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center z-[2]"
          style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.3s ease' }}>
          <span className="text-[10px] tracking-wider2 uppercase font-semibold text-white/70 border border-white/20
                           px-3 py-1.5 rounded-[2px] backdrop-blur-sm bg-black/30">
            View Details
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #111111, transparent)' }} />
      </div>

      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #ffffff08, transparent)' }} />

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-red" style={{ boxShadow: '0 0 6px rgba(193,18,31,0.8)' }} />
          <span className="text-[10px] font-semibold tracking-wider4 uppercase text-muted">{product.color}</span>
        </div>
        <h3
          onClick={() => navigate(`/shop/${product.slug}`)}
          className="font-display font-extrabold text-[20px] tracking-[-0.03em] text-white leading-tight mb-1 cursor-pointer hover:text-red transition-colors duration-200">
          {product.name}
        </h3>
        <p className="text-[12px] text-muted leading-relaxed mb-4">{product.tagline}</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {Object.entries(product.specs).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[3px] border border-border"
              style={{ background: 'rgba(255,255,255,0.025)' }}>
              <span className="text-[9px] uppercase tracking-wider2 text-muted">{k}</span>
              <span className="text-[9px] text-[#888] mx-0.5">·</span>
              <span className="text-[10px] font-semibold text-white">{v}</span>
            </div>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex items-center justify-between pt-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <p className="text-[9px] uppercase tracking-wider2 text-muted mb-0.5">Price</p>
            <span className="font-display font-extrabold text-[22px] tracking-[-0.03em] text-white">৳{product.price}</span>
          </div>
          <AddButton product={product} onAdd={onAdd} />
        </div>
      </div>
    </div>
  )
}

/* ── Main Shop Page ── */
export default function Shop() {
  const [products,     setProducts]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [introDone,    setIntroDone]    = useState(false)
  const [cartOpen,     setCartOpen]     = useState(false)
  const { add, totalQty }               = useCart()
  const heroRef = useFadeIn(0)

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('id'))
    getDocs(q)
      .then(snap => {
        const data = snap.docs.map(d => ({ ...d.data(), slug: d.id }))
        setProducts(data)
        setLoading(false)
      })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const handleAdd = (product) => {
    add(product)
    setCartOpen(true)
  }

  return (
    <>
      {/* Intro animation */}
      {!introDone && <ShopIntro onDone={() => setIntroDone(true)} />}

      {/* Cart drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <main style={{ paddingTop: 'var(--nav-h)', opacity: introDone ? 1 : 0, transition: 'opacity 0.5s ease' }}>

        {/* Floating cart button */}
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-8 right-8 z-[1000] w-14 h-14 rounded-full bg-red flex items-center justify-center
                     shadow-2xl hover:-translate-y-1 transition-transform duration-200"
          style={{ boxShadow: '0 8px 32px rgba(193,18,31,0.5)' }}
          aria-label="Open cart">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {totalQty > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-red text-[10px]
                             font-bold flex items-center justify-center">
              {totalQty}
            </span>
          )}
        </button>

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border py-24"
          style={{ background: 'linear-gradient(180deg, #0c0c0c 0%, #080808 100%)' }}>
          {/* Background grid */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(rgba(193,18,31,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(193,18,31,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
          <div className="container-inner relative" ref={heroRef}>
            <div className="eyebrow">
              <span className="eyebrow-line" />
              <span className="eyebrow-text">Collection 2026</span>
            </div>
            <h1 className="section-title mb-4">Shop AURIX</h1>
            <p className="section-desc mb-8">
              Every model hand-tuned. Every driver precision-calibrated.<br/>
              Choose the AURIX that fits your world.
            </p>
            <div className="flex items-center gap-6 text-[12px] text-muted">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 6px rgba(74,222,128,0.8)' }} />
                Free worldwide shipping
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red" style={{ boxShadow: '0 0 6px rgba(193,18,31,0.8)' }} />
                2-year warranty
              </div>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="section-wrap">
          <div className="container-inner">
            <div className="flex items-center justify-between mb-10">
              <p className="text-[12px] text-muted uppercase tracking-wider2">
                {products.length} Products
              </p>
              <button
                onClick={() => setCartOpen(true)}
                className="hidden md:flex items-center gap-2 text-[11px] tracking-wider2 uppercase text-off
                           hover:text-white transition-colors duration-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                View Cart {totalQty > 0 && <span className="text-red">({totalQty})</span>}
              </button>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-32">
                <div className="w-8 h-8 border-2 border-border border-t-red rounded-full animate-spin" />
              </div>
            )}

            {error && (
              <div className="text-center py-32">
                <p className="text-red text-[14px]">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((p, i) => (
                  <ProductCard key={p.id} product={p} onAdd={handleAdd} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
