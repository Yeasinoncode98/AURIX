# AURIX Project Memory
Last updated: Session ongoing

## Project Overview
- **Name:** AURIX — Premium headphone e-commerce website
- **Stack:** React + Vite + Tailwind CSS + Firebase (Auth + Firestore)
- **Currency:** Bangladeshi Taka (৳) — NOT USD
- **Theme:** Dark, premium, red (#C1121F) accent

## Tech Stack
- React 18, React Router DOM, Vite
- Tailwind CSS (custom config — dark theme)
- Firebase: Auth (Email/Pass + Google) + Firestore
- GSAP for animations
- `react-router-dom` for routing

## File Structure (key files)
```
src/
  App.jsx               — Routes: /, /shop, /shop/:slug, /checkout, /order-success, /login, /register, /profile
  main.jsx              — BrowserRouter + AuthProvider + CartProvider
  firebase.js           — Firebase config (user fills in real values)
  context/
    CartContext.jsx     — Cart state (add/remove/inc/dec/clear)
    AuthContext.jsx     — Auth state (login/register/loginWithGoogle/loginAsAdmin/logout)
  pages/
    Home.jsx            — Landing page (all sections)
    Shop.jsx            — Product grid, intro animation, cart
    ProductDetail.jsx   — /shop/:slug — full product detail
    Checkout.jsx        — Delivery (Inside Dhaka ৳80 / Outside Dhaka ৳130), bKash/Nagad payment
    OrderSuccess.jsx    — Success page with order ID
    Login.jsx           — User/Admin tab login (Google for user)
    Register.jsx        — Email/pass + phone number registration
    Profile.jsx         — [TO BUILD] User profile with avatar, name, phone
  components/
    Navbar.jsx          — Nav with cart icon, auth state, Sign In / Sign Out
    CartDrawer.jsx      — Side drawer cart
    ShopIntro.jsx       — Headphone intro animation
    ProductReveal.jsx, Sound.jsx, Engineering.jsx, Craftsmanship.jsx
    Specifications.jsx, CTA.jsx, Footer.jsx, Hero.jsx
public/
  products.json         — 4 products with slug, specs, features, fullSpecs, inBox, rating
```

## Routing
| Path | Component |
|------|-----------|
| / | Home |
| /shop | Shop |
| /shop/:slug | ProductDetail |
| /checkout | Checkout |
| /order-success | OrderSuccess |
| /login | Login |
| /register | Register |
| /profile | Profile (to add) |

## Auth System
- Users register with email/pass + name + phone → role: 'customer' in Firestore
- Google login also creates Firestore doc (role: 'customer')
- Admin login tab: checks Firestore role === 'admin', else rejects
- Admin role assigned manually in Firestore console
- `/admin` route planned for admin dashboard (future)

## Firestore Rules (set by user)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow create: if request.auth != null && request.auth.uid == uid;
      allow read, update: if request.auth != null && request.auth.uid == uid;
    }
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

## Products (public/products.json)
4 products: AURIX Pro (৳449), AURIX Air (৳299), AURIX Sport (৳249), AURIX Studio (৳599)
Each has: id, slug, name, tagline, price, badge, color, image, specs, description, longDescription,
features, fullSpecs, inBox, rating, reviews

## Checkout Flow
- Customer fills: Name, Phone, Address, Delivery Location (Dhaka ৳80 / Outside ৳130)
- Payment: bKash (01869583817, TrxID 10-char alphanumeric) or Nagad (01627800198, TrxID 8-char)
- TrxID: uppercase alphanumeric (e.g. DIK9P12LHN for bKash, 75YQWZD5 for Nagad)
- On success → /order-success with orderId, total bill shown directly

## Tailwind Custom Colors
```js
black: '#080808', void: '#0c0c0c', surface: '#121212', card: '#161616',
border: '#222222', border2: '#2e2e2e', red: '#C1121F',
off: '#A3A3A3', muted: '#666666'
```
Custom letter spacing: wider2: 0.14em, wider3: 0.18em, wider4: 0.2em

## CSS Classes (index.css)
.eyebrow, .eyebrow-line, .eyebrow-text
.btn-primary, .btn-ghost
.section-title, .section-desc, .section-wrap
.container-inner, .spec-row, .spec-key, .spec-val

## Pending / Next Steps
- [ ] Profile page (avatar upload, name/phone edit)
- [ ] Admin dashboard
- [ ] Firestore products (replace products.json fetch)
- [ ] Orders saved to Firestore on checkout
- [ ] Navbar shows user avatar after login

## Session Notes
- User is Bangladeshi, building premium headphone brand "AURIX"
- Language: Bengali in chat, English in code
- User wants clean, professional, no breaking existing functionality
- Keep ৳ (taka) everywhere, not $
- Firebase config placeholder — user fills real values
- Login/Register confirmed working ✅
