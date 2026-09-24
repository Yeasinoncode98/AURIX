import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
// import { db } from "../firebase";
import { useCart } from "../context/CartContext";
import CartDrawer from "../components/CartDrawer";

/* ── feature icon map ── */
function FeatureIcon({ type }) {
  const icons = {
    driver: (
      <path
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12A6 6 0 0 1 12 6zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
        fill="currentColor"
        fillOpacity=".15"
        stroke="currentColor"
        strokeWidth="0"
      />
    ),
    ear: (
      <path
        d="M3 18s0-8 9-8 9 8 9 8M12 10V2M8 6l4-4 4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    ),
    cable: (
      <path
        d="M5 12h14M12 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    build: (
      <path
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    frame: (
      <path
        d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    ),
    fit: (
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    ),
    water: (
      <path
        d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    ),
    grip: (
      <path
        d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    ),
    flat: (
      <path
        d="M2 12h20M2 6h20M2 18h20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    ),
  };
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className="flex-shrink-0"
    >
      {icons[type] || icons.driver}
    </svg>
  );
}

/* ── Star rating ── */
function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill={
            i <= Math.floor(rating)
              ? "#C1121F"
              : i - 0.5 <= rating
                ? "url(#half)"
                : "none"
          }
          stroke="#C1121F"
          strokeWidth="1.5"
        >
          <defs>
            <linearGradient id="half" x1="0" x2="1" y1="0" y2="0">
              <stop offset="50%" stopColor="#C1121F" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

/* ── Qty stepper ── */
function QtyControl({ qty, onInc, onDec }) {
  return (
    <div className="flex items-center border border-border rounded-[3px] overflow-hidden">
      <button
        onClick={onDec}
        className="w-10 h-10 flex items-center justify-center text-muted hover:text-white hover:bg-[#1e1e1e] transition-colors duration-150 text-lg"
      >
        −
      </button>
      <span className="w-10 text-center text-[14px] font-semibold text-white border-x border-border">
        {qty}
      </span>
      <button
        onClick={onInc}
        className="w-10 h-10 flex items-center justify-center text-muted hover:text-white hover:bg-[#1e1e1e] transition-colors duration-150 text-lg"
      >
        +
      </button>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("specs");
  const [visible, setVisible] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setVisible(false);
    setQty(1);
    setAdded(false);

    // Fetch current product by slug (slug = Firestore document ID)
    const productRef = doc(db, "products", slug);
    // Fetch all for related products
    const allRef = query(collection(db, "products"), orderBy("id"));

    Promise.all([getDoc(productRef), getDocs(allRef)])
      .then(([snap, allSnap]) => {
        const found = snap.exists() ? { ...snap.data(), slug: snap.id } : null;
        const all = allSnap.docs.map((d) => ({ ...d.data(), slug: d.id }));
        setProduct(found);
        setRelated(all.filter((p) => p.slug !== slug).slice(0, 3));
        setLoading(false);
        setTimeout(() => setVisible(true), 60);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) add(product);
    setAdded(true);
    setCartOpen(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ paddingTop: "var(--nav-h)" }}
      >
        <div className="w-8 h-8 border-2 border-border border-t-red rounded-full animate-spin" />
      </div>
    );

  if (!product)
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ paddingTop: "var(--nav-h)" }}
      >
        <p className="text-off">Product not found.</p>
        <Link
          to="/shop"
          className="btn-primary"
          style={{ fontSize: "11px", padding: "10px 20px" }}
        >
          Back to Shop
        </Link>
      </div>
    );

  return (
    <>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <main style={{ paddingTop: "var(--nav-h)" }}>
        {/* ── Breadcrumb ── */}
        <div className="border-b border-border">
          <div className="container-inner py-4 flex items-center gap-2 text-[11px] text-muted">
            <Link
              to="/"
              className="hover:text-white transition-colors duration-150"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              to="/shop"
              className="hover:text-white transition-colors duration-150"
            >
              Shop
            </Link>
            <span>/</span>
            <span className="text-white">{product.name}</span>
          </div>
        </div>

        {/* ── Hero split ── */}
        <section
          className="border-b border-border"
          style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease" }}
        >
          <div className="container-inner py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              {/* LEFT — image */}
              <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    style={{
                      width: "55%",
                      paddingBottom: "55%",
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle, rgba(193,18,31,0.14) 0%, transparent 70%)",
                      position: "absolute",
                      animation: "sound-pulse 3s ease-in-out infinite",
                    }}
                  />
                </div>
                {/* Background grid */}
                <div
                  className="absolute inset-0 rounded-[8px] overflow-hidden pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(193,18,31,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(193,18,31,0.03) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                    background:
                      "linear-gradient(135deg, #141414 0%, #0e0e0e 100%)",
                  }}
                />
                <div
                  className="relative rounded-[8px] overflow-hidden border border-border flex items-center justify-center"
                  style={{
                    minHeight: "460px",
                    background:
                      "radial-gradient(ellipse at 50% 60%, #1e1e1e 0%, #0c0c0c 80%)",
                  }}
                >
                  {/* Subtle grid inside */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-30"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(193,18,31,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(193,18,31,0.06) 1px, transparent 1px)",
                      backgroundSize: "40px 40px",
                    }}
                  />
                  {/* Badge */}
                  {product.badge && (
                    <span
                      className="absolute top-5 left-5 z-10 text-[9px] font-bold tracking-wider4 uppercase
                                     bg-red text-white px-3 py-1.5 rounded-[2px]"
                      style={{ boxShadow: "0 2px 12px rgba(193,18,31,0.5)" }}
                    >
                      {product.badge}
                    </span>
                  )}
                  <img
                    ref={imgRef}
                    src={product.image}
                    alt={product.name}
                    className="relative z-[1] object-contain"
                    style={{
                      width: "68%",
                      filter:
                        "drop-shadow(0 20px 48px rgba(193,18,31,0.2)) drop-shadow(0 8px 24px rgba(0,0,0,0.6))",
                      animation: "float-headphone 4s ease-in-out infinite",
                    }}
                  />
                  {/* Bottom gradient */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, #0c0c0c, transparent)",
                    }}
                  />
                </div>

                {/* Floating stat pills */}
                <div className="flex gap-3 mt-4 flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-[4px] border border-border bg-card text-[11px]">
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-green-400"
                      style={{ boxShadow: "0 0 5px rgba(74,222,128,0.8)" }}
                    />
                    <span className="text-muted">In Stock</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-[4px] border border-border bg-card text-[11px]">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#888"
                      strokeWidth="1.8"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <span className="text-muted">Free Shipping</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-[4px] border border-border bg-card text-[11px]">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#888"
                      strokeWidth="1.8"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span className="text-muted">2-Year Warranty</span>
                  </div>
                </div>
              </div>

              {/* RIGHT — details */}
              <div
                style={{
                  transform: visible ? "translateX(0)" : "translateX(24px)",
                  transition:
                    "transform 0.6s 0.1s ease, opacity 0.6s 0.1s ease",
                  opacity: visible ? 1 : 0,
                }}
              >
                {/* Eyebrow */}
                <div className="eyebrow mb-4">
                  <span className="eyebrow-line" />
                  <span className="eyebrow-text">{product.color}</span>
                </div>

                {/* Name */}
                <h1
                  className="font-display font-extrabold tracking-[-0.04em] leading-[1.0] text-white mb-2"
                  style={{ fontSize: "clamp(36px, 5vw, 62px)" }}
                >
                  {product.name}
                </h1>
                <p className="text-[15px] text-off mb-5 leading-relaxed">
                  {product.tagline}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-6">
                  <Stars rating={product.rating} />
                  <span className="text-[13px] font-semibold text-white">
                    {product.rating}
                  </span>
                  <span className="text-[12px] text-muted">
                    ({product.reviews.toLocaleString()} reviews)
                  </span>
                </div>

                {/* Description */}
                <p className="text-[14px] text-off leading-[1.8] mb-8 border-l-2 border-red pl-4">
                  {product.description}
                </p>

                {/* Quick specs */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <div
                      key={k}
                      className="px-4 py-3 rounded-[4px] border border-border"
                      style={{
                        background: "linear-gradient(135deg, #161616, #111)",
                      }}
                    >
                      <p className="text-[9px] uppercase tracking-wider2 text-muted mb-1">
                        {k}
                      </p>
                      <p className="text-[13px] font-semibold text-white">
                        {v}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Price + qty */}
                <div
                  className="flex items-end justify-between mb-6 pb-6"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-wider2 text-muted mb-1">
                      Price
                    </p>
                    <span className="font-display font-extrabold text-[40px] tracking-[-0.04em] text-white leading-none">
                      ৳{product.price}
                    </span>
                    {qty > 1 && (
                      <span className="text-[13px] text-muted ml-2">
                        × {qty} = ৳{(product.price * qty).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider2 text-muted mb-2">
                      Quantity
                    </p>
                    <QtyControl
                      qty={qty}
                      onInc={() => setQty((q) => q + 1)}
                      onDec={() => setQty((q) => Math.max(1, q - 1))}
                    />
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={handleAdd}
                    className={`flex-1 flex items-center justify-center gap-2 text-[12px] font-semibold
                      tracking-wider2 uppercase rounded-[3px] border transition-all duration-300 cursor-pointer
                      ${added ? "bg-transparent border-red text-red" : "bg-red border-red text-white hover:bg-[#a30e19]"}`}
                    style={{
                      padding: "14px 24px",
                      minWidth: 180,
                      boxShadow: added
                        ? "0 0 20px rgba(193,18,31,0.3)"
                        : "0 4px 20px rgba(193,18,31,0.3)",
                    }}
                  >
                    {added ? (
                      <>
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M1.5 6l3 3 6-6"
                            stroke="#C1121F"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="9" cy="21" r="1" />
                          <circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setCartOpen(true)}
                    className="btn-ghost flex items-center gap-2"
                    style={{ padding: "14px 20px", fontSize: "11px" }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    Cart
                  </button>
                </div>

                {/* Trust row */}
                <div className="flex items-center gap-5 mt-5 flex-wrap">
                  {["30-Day Returns", "Secure Checkout", "Expert Support"].map(
                    (t) => (
                      <div
                        key={t}
                        className="flex items-center gap-1.5 text-[11px] text-muted"
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M1.5 6l3 3 6-6"
                            stroke="#555"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {t}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="section-wrap border-b border-border">
          <div className="container-inner">
            <div className="eyebrow mb-6">
              <span className="eyebrow-line" />
              <span className="eyebrow-text">Why {product.name}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.features.map((f, i) => (
                <div
                  key={i}
                  className="group p-6 rounded-[6px] border border-border hover:border-red/40 transition-all duration-300"
                  style={{
                    background: "linear-gradient(145deg, #141414, #0f0f0f)",
                    boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
                    animationDelay: `${i * 80}ms`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-[6px] border border-border flex items-center justify-center mb-4
                                  text-red group-hover:bg-red/10 group-hover:border-red/40 transition-all duration-300"
                  >
                    <FeatureIcon type={f.icon} />
                  </div>
                  <h4 className="font-display font-bold text-[15px] tracking-[-0.02em] text-white mb-2">
                    {f.title}
                  </h4>
                  <p className="text-[12px] text-muted leading-[1.7]">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Long description ── */}
        <section className="section-wrap border-b border-border">
          <div className="container-inner">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="eyebrow mb-4">
                  <span className="eyebrow-line" />
                  <span className="eyebrow-text">The Story</span>
                </div>
                <h2 className="section-title mb-6">
                  Engineered without compromise
                </h2>
                {product.longDescription.split("\n\n").map((para, i) => (
                  <p
                    key={i}
                    className="text-[14px] text-off leading-[1.85] mb-4"
                  >
                    {para}
                  </p>
                ))}
              </div>
              {/* Decorative right side */}
              <div
                className="relative flex items-center justify-center"
                style={{ minHeight: 360 }}
              >
                <div
                  className="absolute w-[280px] h-[280px] rounded-full border border-red/10"
                  style={{ animation: "orbit-rotate 12s linear infinite" }}
                />
                <div
                  className="absolute w-[200px] h-[200px] rounded-full border border-red/20"
                  style={{
                    animation: "orbit-rotate 8s linear infinite reverse",
                  }}
                />
                <div
                  className="relative z-[1] p-8 rounded-[8px] border border-border text-center"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, #181818, #0e0e0e)",
                  }}
                >
                  <p className="font-display font-extrabold text-[56px] tracking-[-0.05em] text-white leading-none mb-1">
                    {product.rating}
                  </p>
                  <Stars rating={product.rating} />
                  <p className="text-[11px] text-muted mt-2">
                    {product.reviews.toLocaleString()} verified reviews
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Tabs: Full Specs / In The Box ── */}
        <section className="section-wrap border-b border-border">
          <div className="container-inner">
            {/* Tab bar */}
            <div className="flex gap-0 border-b border-border mb-10 -mx-1">
              {[
                ["specs", "Full Specifications"],
                ["box", "What's In The Box"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-6 py-4 text-[11px] font-semibold tracking-wider2 uppercase transition-all duration-200 border-b-2
                    ${
                      activeTab === key
                        ? "text-white border-red"
                        : "text-muted border-transparent hover:text-off"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Full specs */}
            {activeTab === "specs" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
                {Object.entries(product.fullSpecs).map(([k, v], i) => (
                  <div key={k} className="spec-row">
                    <span className="spec-key">{k}</span>
                    <span className="spec-val">{v}</span>
                  </div>
                ))}
              </div>
            )}

            {/* In the box */}
            {activeTab === "box" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {product.inBox.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-[4px] border border-border"
                    style={{
                      background: "linear-gradient(135deg, #141414, #101010)",
                    }}
                  >
                    <div className="w-6 h-6 rounded-full border border-red/40 flex items-center justify-center flex-shrink-0">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M1.5 6l3 3 6-6"
                          stroke="#C1121F"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span className="text-[13px] text-off">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <section className="section-wrap">
            <div className="container-inner">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <div className="eyebrow mb-2">
                    <span className="eyebrow-line" />
                    <span className="eyebrow-text">Also Consider</span>
                  </div>
                  <h2 className="font-display font-extrabold text-[28px] tracking-[-0.03em] text-white">
                    More from AURIX
                  </h2>
                </div>
                <Link
                  to="/shop"
                  className="btn-ghost hidden md:inline-flex"
                  style={{ fontSize: "11px", padding: "10px 20px" }}
                >
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {related.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/shop/${p.slug}`)}
                    className="group cursor-pointer rounded-[6px] overflow-hidden border border-border hover:border-red/40
                               transition-all duration-300 hover:-translate-y-1"
                    style={{
                      background: "linear-gradient(145deg, #161616, #111)",
                    }}
                  >
                    <div
                      className="flex items-center justify-center py-8"
                      style={{
                        background:
                          "radial-gradient(ellipse at center, #1c1c1c, #0e0e0e)",
                        height: 180,
                      }}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-[55%] object-contain
                        group-hover:scale-105 transition-transform duration-500"
                        style={{
                          filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))",
                        }}
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-[10px] uppercase tracking-wider2 text-muted mb-1">
                        {p.color}
                      </p>
                      <h4 className="font-display font-bold text-[17px] tracking-[-0.02em] text-white mb-1">
                        {p.name}
                      </h4>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-display font-extrabold text-[18px] text-white">
                          ৳{p.price}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider2 text-red font-semibold group-hover:underline">
                          View →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <ReviewSection slug={slug} />
    </>
  );
}

/* ══ Review Section ══ */
function ReviewSection({ slug }) {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Load reviews real-time
  useEffect(() => {
    if (!slug) return;
    const q = query(
      collection(db, "products", slug, "reviews"),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(q, (snap) =>
      setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
  }, [slug]);

  const avgRating = reviews.length
    ? (
        reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length
      ).toFixed(1)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Please sign in to leave a review");
      return;
    }
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      setError("Please write your review");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await addDoc(collection(db, "products", slug, "reviews"), {
        rating,
        comment: comment.trim(),
        userName:
          profile?.name ||
          user.displayName ||
          user.email?.split("@")[0] ||
          "Customer",
        userEmail: user.email,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      setRating(0);
      setComment("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      setError("Failed to submit review. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="section-wrap border-t border-border"
      style={{ background: "#080808" }}
    >
      <div className="container-inner">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="eyebrow mb-2">
              <span className="eyebrow-line" />
              <span className="eyebrow-text">Customer Reviews</span>
            </div>
            <h2 className="font-display font-extrabold text-[28px] tracking-[-0.03em] text-white">
              What people say
            </h2>
          </div>
          {reviews.length > 0 && (
            <div className="flex items-center gap-3">
              <div>
                <p className="font-display font-extrabold text-[40px] tracking-[-0.04em] text-white leading-none">
                  {avgRating}
                </p>
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg
                      key={i}
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill={
                        i <= Math.round(Number(avgRating)) ? "#C1121F" : "none"
                      }
                      stroke="#C1121F"
                      strokeWidth="1.5"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="text-[11px] text-muted mt-0.5">
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
          {/* ── Reviews list ── */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-14 rounded-[8px]
                              border border-border"
                style={{ background: "#0e0e0e" }}
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#333"
                  strokeWidth="1.2"
                  className="mb-3"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p className="text-muted text-[13px]">
                  No reviews yet — be the first!
                </p>
              </div>
            ) : (
              reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-[8px] border border-[#1a1a1a] px-5 py-5"
                  style={{
                    background: "linear-gradient(160deg,#0e0e0e,#0a0a0a)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center
                                      text-[13px] font-bold text-white flex-shrink-0"
                        style={{
                          background: "linear-gradient(135deg,#C1121F,#8b0000)",
                        }}
                      >
                        {(r.userName || "C")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-white">
                          {r.userName}
                        </p>
                        <div className="flex gap-0.5 mt-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <svg
                              key={i}
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill={i <= (r.rating || 0) ? "#C1121F" : "none"}
                              stroke="#C1121F"
                              strokeWidth="1.5"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted flex-shrink-0">
                      {r.createdAt?.toDate
                        ? r.createdAt
                            .toDate()
                            .toLocaleDateString("en-BD", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                        : "—"}
                    </span>
                  </div>
                  <p className="text-[13px] text-off leading-relaxed">
                    {r.comment}
                  </p>

                  {/* Admin reply */}
                  {r.adminReply && (
                    <div className="mt-3 pl-4 border-l-2 border-red/30">
                      <p className="text-[10px] font-bold text-red uppercase tracking-wider mb-1">
                        AURIX Response
                      </p>
                      <p className="text-[12px] text-off leading-relaxed">
                        {r.adminReply}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* ── Write review ── */}
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+24px)]">
            <div
              className="rounded-[8px] border border-[#1a1a1a] overflow-hidden"
              style={{ background: "linear-gradient(160deg,#0e0e0e,#0a0a0a)" }}
            >
              <div className="px-5 py-4 border-b border-[#1a1a1a]">
                <h3 className="font-display font-bold text-[16px] tracking-[-0.02em] text-white">
                  Write a Review
                </h3>
                {!user && (
                  <p className="text-[11px] text-muted mt-1">
                    <Link to="/login" className="text-red hover:underline">
                      Sign in
                    </Link>{" "}
                    to leave a review
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
                {/* Star rating */}
                <div>
                  <p className="text-[11px] text-muted uppercase tracking-wider2 mb-2">
                    Your Rating *
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => setRating(i)}
                        className="transition-transform duration-100 hover:scale-110"
                      >
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill={(hovered || rating) >= i ? "#C1121F" : "none"}
                          stroke="#C1121F"
                          strokeWidth="1.5"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="text-[12px] text-muted self-center ml-2">
                        {
                          ["", "Poor", "Fair", "Good", "Great", "Excellent"][
                            rating
                          ]
                        }
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <p className="text-[11px] text-muted uppercase tracking-wider2 mb-2">
                    Your Review *
                  </p>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    disabled={!user}
                    className="w-full bg-[#111] border border-[#1a1a1a] rounded-[4px] px-4 py-3
                               text-[13px] text-white placeholder-muted outline-none resize-none
                               focus:border-[#333] transition-colors duration-200
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {error && <p className="text-[11px] text-red">{error}</p>}

                {submitted && (
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 rounded-[6px]
                                  bg-green-500/10 border border-green-500/20"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <p className="text-[12px] text-green-400 font-semibold">
                      Review submitted! Thank you.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !user}
                  className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ padding: "12px 20px", fontSize: "12px" }}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
