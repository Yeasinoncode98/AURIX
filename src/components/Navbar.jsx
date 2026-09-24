import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CartDrawer from "./CartDrawer";

const homeLinks = [
  { href: "#product-reveal", label: "Product", isSection: true },
  { href: "#sound", label: "Sound", isSection: true },
  { href: "#engineering", label: "Engineering", isSection: true },
  { href: "/shop", label: "Shop", isSection: false },
  { href: "#craftsmanship", label: "Craft", isSection: true },
  { href: "#specifications", label: "Specs", isSection: true },
];

/* ── Avatar bubble (photo or initials) ── */
function NavAvatar({ user, profile, size = 30 }) {
  const src = profile?.photoURL || user?.photoURL;
  const name = profile?.name || user?.displayName || user?.email || "U";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (src)
    return (
      <img
        src={src}
        alt="avatar"
        className="rounded-full object-cover border border-border flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 border border-red/40"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: "linear-gradient(135deg, #C1121F, #8B0E17)",
      }}
    >
      {initials}
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const { totalQty } = useCart();
  const { user, profile, logout } = useAuth();

  useEffect(() => {
    const bar = document.getElementById("progress-bar");
    const onScroll = () => {
      const sy = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar && max > 0) bar.style.width = (sy / max) * 100 + "%";
      setScrolled(sy > 40);

      // Active section detection
      if (isHome) {
        const sections = [
          "product-reveal",
          "sound",
          "engineering",
          "craftsmanship",
          "specifications",
          "cta",
        ];
        let current = "";
        for (const id of sections) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= 120) current = id;
        }
        setActiveSection(current);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* close user menu on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const smoothTo = (e, href) => {
    e.preventDefault();
    setDrawerOpen(false);
    setHamburgerOpen(false);
    if (isHome) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(
        () =>
          document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    }
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate("/");
  };

  const toggleDrawer = () => {
    setDrawerOpen((o) => !o);
    setHamburgerOpen((o) => !o);
  };

  const displayName =
    profile?.name || user?.displayName || user?.email?.split("@")[0] || "User";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[1000] flex items-center px-10 transition-all duration-300 border-b
          ${scrolled ? "bg-[rgba(8,8,8,0.94)] backdrop-blur-[16px] border-border" : "border-transparent"}`}
        style={{ height: "var(--nav-h)" }}
        role="banner"
      >
        <div className="w-full max-w-[1280px] mx-auto flex items-center justify-between relative">
          {/* Logo */}
          <Link
            to="/"
            className="font-display text-[20px] font-extrabold tracking-[-0.02em] text-white no-underline
                       md:static absolute left-1/2 md:left-auto md:transform-none -translate-x-1/2"
          >
            AUR<span className="text-red">I</span>X
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex gap-9 list-none items-center">
            {homeLinks.map((l) => {
              const sectionId = l.href.replace('#', '')
              const isActive  = isHome && activeSection === sectionId
              const isShop    = !l.isSection

              return (
                <li key={l.href}>
                  {isShop ? (
                    <Link to={l.href}
                      className={`text-[11px] font-medium tracking-wider2 uppercase no-underline
                                  transition-colors duration-200
                                  ${location.pathname.startsWith('/shop') ? 'text-red' : 'text-off hover:text-white'}`}>
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href} onClick={e => smoothTo(e, l.href)}
                      className={`text-[11px] font-medium tracking-wider2 uppercase no-underline
                                  transition-colors duration-200 relative
                                  ${isActive ? 'text-white' : 'text-off hover:text-white'}`}>
                      {l.label}
                      {isActive && (
                        <span className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-red rounded-full"/>
                      )}
                    </a>
                  )}
                </li>
              )
            })}
          </ul>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart icon */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative w-9 h-9 flex items-center justify-center text-muted hover:text-white transition-colors duration-200"
              aria-label="Open cart"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {totalQty > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red text-white text-[9px] font-bold flex items-center justify-center">
                  {totalQty}
                </span>
              )}
            </button>

            {/* Auth — avatar dropdown or sign in */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] hover:bg-white/5
                             transition-colors duration-200 cursor-pointer"
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                >
                  <NavAvatar user={user} profile={profile} size={30} />
                  <span className="text-[12px] text-off hidden lg:block max-w-[100px] truncate">
                    {displayName}
                  </span>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    className="text-muted"
                    style={{
                      transform: userMenuOpen ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <path
                      d="M1 3l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute right-0 top-full mt-2 w-[200px] rounded-[6px] border border-border overflow-hidden
                  transition-all duration-200 ${userMenuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}
                  style={{
                    background: "#111",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
                  }}
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-[13px] font-semibold text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-muted truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[12px] text-off hover:text-white hover:bg-white/5
                                 no-underline transition-colors duration-150 cursor-pointer"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      My Profile
                    </Link>
                    <Link
                      to="/shop"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[12px] text-off hover:text-white hover:bg-white/5
                                 no-underline transition-colors duration-150 cursor-pointer"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      >
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      Shop
                    </Link>
                  </div>
                  <div className="border-t border-border py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-[12px] text-muted hover:text-red hover:bg-red/5
                                 transition-colors duration-150 cursor-pointer text-left"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-ghost"
                style={{ padding: "8px 16px", fontSize: "11px" }}
              >
                Sign In
              </Link>
            )}

            <Link
              to="/shop"
              className="btn-primary"
              style={{ padding: "10px 22px", fontSize: "11px" }}
            >
              Order Now
            </Link>
          </div>

          {/* Hamburger */}
          <button
            onClick={toggleDrawer}
            aria-label="Toggle menu"
            aria-expanded={drawerOpen}
            className="md:hidden absolute right-0 flex flex-col justify-center items-end gap-[5px] w-10 h-10 bg-transparent border-none cursor-pointer p-1"
          >
            <span
              className={`block h-[1.5px] bg-white rounded-full transition-all duration-300 origin-center
              ${hamburgerOpen ? "w-5 translate-y-[6.5px] rotate-45" : "w-5"}`}
            />
            <span
              className={`block h-[1.5px] bg-white rounded-full transition-all duration-200
              ${hamburgerOpen ? "w-0 opacity-0" : "w-3.5 opacity-100"}`}
            />
            <span
              className={`block h-[1.5px] bg-white rounded-full transition-all duration-300 origin-center
              ${hamburgerOpen ? "w-5 -translate-y-[6.5px] -rotate-45" : "w-5"}`}
            />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <nav
        aria-label="Mobile navigation"
        className={`md:hidden fixed left-0 right-0 z-[999] bg-[rgba(6,6,6,0.98)] backdrop-blur-[20px]
          border-b border-border flex flex-col transition-all duration-300
          ${drawerOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-3 pointer-events-none"}`}
        style={{ top: "var(--nav-h)" }}
      >
        {/* User info strip (mobile) */}
        {user && (
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#1a1a1a]">
            <NavAvatar user={user} profile={profile} size={36} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-muted truncate">{user.email}</p>
            </div>
            <Link
              to="/profile"
              onClick={() => {
                setDrawerOpen(false);
                setHamburgerOpen(false);
              }}
              className="text-[10px] uppercase tracking-wider2 text-muted hover:text-white transition-colors duration-150 no-underline flex-shrink-0"
            >
              Edit
            </Link>
          </div>
        )}

        <div className="px-6 pt-4 pb-2">
          {homeLinks.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => smoothTo(e, l.href)}
              className="flex items-center justify-between text-[12px] font-semibold tracking-wider2 uppercase
                         text-off no-underline py-4 border-b border-[#1a1a1a] hover:text-white transition-colors duration-200 group"
            >
              <span>{l.label}</span>
              <span className="text-[#333] text-[10px] group-hover:text-red transition-colors duration-200">
                0{i + 1}
              </span>
            </a>
          ))}
          <Link
            to="/shop"
            onClick={() => {
              setDrawerOpen(false);
              setHamburgerOpen(false);
            }}
            className={`flex items-center justify-between text-[12px] font-semibold tracking-wider2 uppercase
                       no-underline py-4 border-b border-[#1a1a1a] transition-colors duration-200 group
                       ${location.pathname.startsWith("/shop") ? "text-red" : "text-off hover:text-white"}`}
          >
            <span>Shop</span>
            <span className="text-[#333] text-[10px] group-hover:text-red transition-colors duration-200">
              0{homeLinks.length + 1}
            </span>
          </Link>
        </div>

        <div className="px-6 py-4 space-y-3">
          <Link
            to="/shop"
            onClick={() => {
              setDrawerOpen(false);
              setHamburgerOpen(false);
            }}
            className="flex items-center justify-center w-full text-[12px] font-semibold tracking-wider2 uppercase
                       text-white no-underline py-4 bg-red hover:bg-[#a30e19] transition-colors duration-200 rounded-[2px]"
          >
            Order Now — ৳449
          </Link>
          {!user && (
            <Link
              to="/login"
              onClick={() => {
                setDrawerOpen(false);
                setHamburgerOpen(false);
              }}
              className="flex items-center justify-center w-full text-[12px] font-semibold tracking-wider2 uppercase
                         text-off no-underline py-3 border border-border hover:border-white hover:text-white
                         transition-colors duration-200 rounded-[2px]"
            >
              Sign In
            </Link>
          )}
          {user && (
            <button
              onClick={async () => {
                setDrawerOpen(false);
                setHamburgerOpen(false);
                await logout();
                navigate("/");
              }}
              className="flex items-center justify-center w-full text-[12px] font-semibold tracking-wider2 uppercase
                         text-muted py-3 border border-border hover:border-red hover:text-red
                         transition-colors duration-200 rounded-[2px] bg-transparent cursor-pointer"
            >
              Sign Out
            </button>
          )}
        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
