# AURIX — Premium Headphone E-Commerce Platform

<div align="center">

![AURIX](https://img.shields.io/badge/AURIX-Premium%20Headphones-C1121F?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?style=for-the-badge&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)

**A full-stack, production-ready e-commerce platform for premium headphones — built with React, Firebase, and Tailwind CSS.**

[Live Demo](https://aurix-get-your-gadget.vercel.app) · [Admin Dashboard](#admin-dashboard) · [Owner Dashboard](#owner-dashboard)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Firebase Setup](#firebase-setup)
- [User Roles](#user-roles)
- [Admin Dashboard](#admin-dashboard)
- [Owner Dashboard](#owner-dashboard)
- [Security](#security)
- [Firestore Collections](#firestore-collections)
- [Screenshots](#screenshots)

---

## 🎯 Overview

AURIX is a complete e-commerce solution for a premium headphone brand. It includes a customer-facing storefront, a full-featured Admin Dashboard, and a separate Owner Dashboard — all built on top of Firebase for real-time data, authentication, and security.

**Currency:** Bangladeshi Taka (৳)  
**Timezone:** Asia/Dhaka (Bangladesh)  
**Payment:** bKash & Nagad (mobile banking)

---

## ✨ Features

### Customer Side
- 🛍️ **Shop** — Product grid with category filters, coupon marquee, real-time stock
- 📦 **Product Detail** — Full specs, features, exploded view animation, customer reviews
- 🛒 **Cart** — Slide-out drawer, qty controls, real-time subtotal
- 💳 **Checkout** — bKash/Nagad payment, delivery zone selection, TRX ID validation, coupon codes
- ✅ **Order Success** — Full receipt with COD amount, tracking info
- 📋 **My Orders** — Real-time order tracking with 5-step progress bar
- 👤 **Profile** — Avatar upload, name/phone edit, real-time save
- ⭐ **Reviews** — Star rating system with admin replies
- 🔐 **Auth** — Email/Password + Google login

### Admin Dashboard (`/admin`)
- 📊 **Dashboard** — Real-time BD clock, stats cards, charts, low stock alerts
- 📦 **Orders** — Table, search, status updates, `handledBy` tracking, printable cash memo
- 🏪 **Products** — Full CRUD, stock management, category assignment, image upload
- 🏷️ **Categories** — Create/edit/delete, Shop page filter integration
- ⭐ **Reviews** — All reviews, admin reply system
- 👥 **Users & CRM** — Customer list, live presence, edit details, order history
- 🎫 **Coupons** — Create/toggle coupons, live marquee on Shop
- 💰 **Billings** — Order billing history, date range filter, print
- 📈 **Analytics** — Revenue charts, order funnel, product performance
- 📄 **Monthly Reports** — Printable PDF, date range, CEO signature option
- 🛡️ **Admin Management** — Read-only admin profiles with NID verification
- ⚙️ **Admin Profile** — Separate profile with NID upload

### Owner Dashboard (`/owner`)
- 👑 **Overview** — Business metrics, real-time charts, admin presence widget
- 📦 **All Orders** — Read-only company-wide order monitoring
- 👥 **Admin Management** — Promote/demote users, real-time role changes
- 📈 **Admin Performance** — Per-admin order handling stats
- 🏪 **Inventory** — Stock monitoring, low stock alerts
- 👤 **Customer Insights** — Customer analytics, order history
- 🎫 **Coupon Overview** — Usage stats, savings tracking
- 💰 **Finance & Revenue** — Revenue breakdown, monthly trends
- 📄 **Reports** — Printable reports with CEO sign option
- ⚙️ **Owner Profile** — Separate owner profile

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18 | UI framework |
| Vite | 5 | Build tool |
| Tailwind CSS | 3 | Styling |
| Firebase Auth | 12 | Authentication |
| Firestore | 12 | Database |
| React Router DOM | 7 | Routing |
| Recharts | 3 | Charts |
| GSAP | 3 | Animations |
| react-hot-toast | 2 | Notifications |
| react-to-print | 2 | Print/PDF |

---

## 📁 Project Structure

```
src/
├── admin/                    # Admin Dashboard
│   ├── AdminLayout.jsx       # Sidebar + header + auth guard
│   ├── components/
│   │   ├── AdminBDClock.jsx
│   │   └── AdminNotificationBell.jsx
│   └── pages/
│       ├── AdminDashboard.jsx
│       ├── AdminOrders.jsx
│       ├── AdminProducts.jsx
│       ├── AdminCategories.jsx
│       ├── AdminReviews.jsx
│       ├── AdminUsers.jsx
│       ├── AdminCoupons.jsx
│       ├── AdminBillings.jsx
│       ├── AdminAnalytics.jsx
│       ├── AdminReports.jsx
│       ├── AdminManagement.jsx
│       └── AdminProfile.jsx
├── owner/                    # Owner Dashboard
│   ├── OwnerLayout.jsx
│   ├── components/
│   │   └── OwnerBDClock.jsx
│   └── pages/
│       ├── OwnerOverview.jsx
│       ├── OwnerOrders.jsx
│       ├── OwnerAdminManagement.jsx
│       ├── OwnerAdminPerformance.jsx
│       ├── OwnerInventory.jsx
│       ├── OwnerCustomers.jsx
│       ├── OwnerCoupons.jsx
│       ├── OwnerFinance.jsx
│       ├── OwnerReports.jsx
│       └── OwnerProfile.jsx
├── components/               # Shared components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── Hero.jsx
│   ├── CartDrawer.jsx
│   ├── CouponMarquee.jsx
│   └── ...
├── context/
│   ├── AuthContext.jsx       # Auth + presence
│   └── CartContext.jsx
├── pages/                    # Customer pages
│   ├── Home.jsx
│   ├── Shop.jsx
│   ├── ProductDetail.jsx
│   ├── Checkout.jsx
│   ├── OrderSuccess.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Profile.jsx
│   └── MyOrders.jsx
├── utils/
│   └── security.js           # Sanitize, rate limiter, validators
├── firebase.js
└── App.jsx
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/aurix.git
cd aurix

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Fill in your Firebase config values

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🔥 Firebase Setup

### 1. Authentication
Enable in Firebase Console:
- Email/Password
- Google
- Anonymous (for product seeding script)

### 2. Firestore Database
Create database and deploy security rules from `firestore.rules`

### 3. Seed Products
```bash
node scripts/seed-products.mjs
```

### 4. Set User Roles
In Firebase Console → Firestore → `users/{uid}`:
- Admin: `role: "admin"`
- Owner: `role: "owner"`

---

## 👥 User Roles

| Role | Access | How to set |
|------|--------|-----------|
| `customer` | Customer website, My Orders, Profile | Default on register |
| `admin` | Admin Dashboard (`/admin`) | Firestore: `role: "admin"` or Owner promotes |
| `owner` | Owner Dashboard (`/owner`) | Firestore: `role: "owner"` (manual) |

---

## 🛡️ Admin Dashboard

Access: `/admin` — Login with **Admin** tab on login page

### Key Features
- Real-time Bangladesh time clock
- Order status flow: `Pending → Confirmed → Preparing → Shipped → Delivered`
- `handledBy` field tracks which admin updated each order
- Cash memo printing (Customer Copy + Company Copy)
- Low stock alerts (≤5 units)
- Real-time notification bell for new orders and reviews

---

## 👑 Owner Dashboard

Access: `/owner` — Login with **Owner** tab on login page

### Key Features
- Full Admin Management: promote users, demote admins
- Real-time role changes — demoted admin is auto-logged out
- Read-only company-wide order monitoring
- Revenue analytics and monthly reports
- Admin performance tracking via `handledBy` field

---

## 🔐 Security

### Implemented
- **Firestore Rules** — Role field locked, order validation, ownership checks
- **Input Sanitization** — HTML/JS stripped from all user inputs
- **Rate Limiting** — Login (5/30s), Register (3/60s), Checkout (3/60s), Reviews (2/60s)
- **Security Headers** — X-Frame-Options, CSP, XSS-Protection, Referrer-Policy
- **No SQL Injection** — Firestore NoSQL, auto-safe
- **No XSS** — React auto-escaping + sanitization
- **No CSRF** — Firebase Bearer tokens, no cookies

### Protected Against
| Attack | Protection |
|--------|-----------|
| XSS / Script injection | React + sanitize() |
| Role escalation | Firestore rules lock |
| Login brute force | Rate limiting + Firebase lockout |
| Fake order spam | Rate limit + field validation |
| Clickjacking | X-Frame-Options: DENY |
| Unauthorized data access | Firestore ownership rules |

---

## 🗄️ Firestore Collections

| Collection | Description |
|-----------|-------------|
| `users` | Customer + admin profiles, roles |
| `products` | Product catalog (slug = document ID) |
| `orders` | All customer orders |
| `categories` | Product filter categories |
| `coupons` | Discount codes |
| `admins` | Admin-specific profiles (NID, etc.) |
| `owners` | Owner profile |
| `presence` | Real-time admin online status |
| `reviews` | Top-level review mirror for notifications |
| `products/{id}/reviews` | Per-product reviews subcollection |

---

## 📦 Order Data Structure

```js
{
  orderId: "AX-XXXXXXX",
  status: "pending",           // pending → confirmed → preparing → shipped → delivered
  createdAt: Timestamp,
  customerName: String,
  customerPhone: String,
  deliveryAddress: String,
  userId: String | null,       // null for guest orders
  userEmail: String,
  deliveryZone: "dhaka" | "outside",
  deliveryFee: Number,         // 80 or 130
  paymentMethod: "bkash" | "nagad",
  senderNumber: String,
  trxId: String,
  items: [{ name, price, qty, subtotal, image }],
  subtotal: Number,            // product total
  discount: Number,            // coupon discount
  totalAmount: Number,         // final total
  couponCode: String | null,
  handledBy: { uid, name, email },  // set when admin updates status
  updatedAt: Timestamp
}
```

---

## 🚢 Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

The project is optimized for Vercel deployment. All Firebase keys are stored as environment variables.

---

## �‍💻 Developer

<div align="center">

| | |
|---|---|
| **Name** | Sk.Yeasin Arafat |
| **Degree** | BSc in Computer Science & Engineering |
| **University** | Daffodil International University |
| **Semester** | 6th Semester |
| **Project** | AURIX — Premium Headphone E-Commerce Platform |

</div>

---

## ⚖️ License & Legal

**Copyright © 2026 Sk.Yeasin Arafat. All Rights Reserved.**

This project and its source code are the **exclusive intellectual property** of Sk.Yeasin Arafat.

### ❌ Strictly Prohibited
- Copying, cloning, or forking this repository
- Using any part of this codebase in personal or commercial projects
- Redistributing, reselling, or sublicensing the code
- Reproducing the design, architecture, or business logic
- Claiming ownership of any portion of this work

### ⚠️ Legal Warning
> Any unauthorized copying, cloning, reproduction, or distribution of this codebase — in whole or in part — **will be treated as intellectual property theft** and may result in **civil and criminal legal action** under applicable copyright and intellectual property laws.

### ✅ Permitted
- Viewing the repository for educational reference only
- Raising issues or suggestions via GitHub Issues

**By accessing this repository, you agree to respect these terms.**

---

<div align="center">
  <p>Built with ❤️ for AURIX Premium Headphones</p>
  <p><strong>AUR<span>I</span>X</strong> — Silence the noise. Feel everything.</p>
  <br/>
  <p>© 2026 <strong>Sk.Yeasin Arafat</strong> · BSc CSE · Daffodil International University</p>
  <p><em>Unauthorized use of this codebase is strictly prohibited and subject to legal action.</em></p>
</div>
