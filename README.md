<!-- # AURIX — Premium Headphone E-Commerce Platform

<div align="center">

![AURIX](https://img.shields.io/badge/AURIX-Premium%20Headphones-C1121F?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?style=for-the-badge&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)

**A full-stack, production-ready e-commerce platform for premium headphones — built with React, Firebase, and Tailwind CSS.**

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [User Roles](#user-roles)
- [Security](#security)
- [Developer](#developer)
- [License](#license)

---

## 🎯 Overview

AURIX is a complete e-commerce solution for a premium headphone brand. It includes a customer-facing storefront, a full-featured Admin Dashboard, and a separate Owner Dashboard — all powered by Firebase for real-time data and authentication.

**Currency:** Bangladeshi Taka (৳)  
**Timezone:** Asia/Dhaka (Bangladesh)

---

## ✨ Features

### Customer Side
- 🛍️ **Shop** — Product grid with category filters and coupon system
- 📦 **Product Detail** — Full specs, features, interactive animation, customer reviews
- 🛒 **Cart** — Slide-out drawer with qty controls and real-time subtotal
- 💳 **Checkout** — Mobile payment integration, delivery zone selection, coupon codes
- ✅ **Order Tracking** — Real-time 5-step order progress tracker
- 👤 **Profile** — Avatar upload, name/phone edit
- ⭐ **Reviews** — Star rating system with admin replies
- 🔐 **Auth** — Email/Password + Google login

### Admin Dashboard
- 📊 Real-time stats, charts, low stock alerts, BD clock
- 📦 Order management with status flow and cash memo printing
- 🏪 Product CRUD with stock management and category assignment
- 👥 Customer CRM with live presence tracking
- 🎫 Coupon management with live Shop marquee
- 📈 Analytics, billing history, and monthly reports
- 🛡️ Admin profile management

### Owner Dashboard
- 👑 Business overview with real-time metrics
- 👥 Admin management — promote/demote with real-time session control
- 📈 Admin performance tracking
- 💰 Revenue analytics and financial reports
- 🏪 Inventory and customer insights

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
│   ├── AdminLayout.jsx
│   ├── components/
│   └── pages/
├── owner/                    # Owner Dashboard
│   ├── OwnerLayout.jsx
│   ├── components/
│   └── pages/
├── components/               # Shared UI components
├── context/                  # Auth + Cart context
├── pages/                    # Customer-facing pages
├── utils/
│   └── security.js           # Sanitization + rate limiting
├── firebase.js
└── App.jsx
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Firebase project with Firestore and Authentication enabled

### Installation

```bash
# Install dependencies
npm install

# Configure environment variables
# Create .env file with your Firebase credentials (see .env.example)

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> ⚠️ Never commit your `.env` file. It is already included in `.gitignore`.

---

## 👥 User Roles

The application supports three role levels managed securely through Firebase:

| Role | Dashboard Access |
|------|----------------|
| Customer | Storefront, Orders, Profile |
| Admin | Admin Dashboard |
| Owner | Owner Dashboard |

> Role assignment and management details are intentionally not documented publicly for security reasons.

---

## 🔐 Security

This application implements multiple layers of security:

- **Server-side rules** — Firestore security rules enforce data ownership and role-based access
- **Input sanitization** — All user inputs are sanitized before database writes
- **Rate limiting** — Login, registration, checkout, and review forms are rate-limited
- **Security headers** — CSP, X-Frame-Options, XSS-Protection, Referrer-Policy
- **Role protection** — Roles cannot be self-assigned or escalated via the client
- **No SQL injection** — Firestore NoSQL is inherently safe from SQL injection
- **CSRF safe** — Firebase uses Bearer token authentication

---

## 👨‍💻 Developer

<div align="center">

| | |
|---|---|
| **Name** | Sk.Yeasin Arafat |
| **Degree** | BSc in Computer Science & Engineering |
| **University** | Daffodil International University |
| **Semester** | 6th Semester |

</div>

---

## ⚖️ License & Legal

**Copyright © 2026 Sk.Yeasin Arafat. All Rights Reserved.**

This project and its entire source code are the **exclusive intellectual property** of Sk.Yeasin Arafat.

### ❌ Strictly Prohibited
- Copying, cloning, or forking this repository
- Using any part of this codebase in personal or commercial projects
- Redistributing, reselling, or sublicensing the code
- Reproducing the design, architecture, or business logic
- Claiming ownership of any portion of this work

### ⚠️ Legal Warning

> Any unauthorized copying, cloning, reproduction, or distribution of this codebase — in whole or in part — **will be treated as intellectual property theft** and may result in **civil and criminal legal action** under applicable copyright and intellectual property laws.

### ✅ Permitted
- Viewing the repository for reference only
- Raising issues or suggestions via GitHub Issues

**By accessing this repository, you agree to respect these terms.**

---

<div align="center">
  <p>Built with ❤️ for AURIX Premium Headphones</p>
  <p><strong>AURIX</strong> — Silence the noise. Feel everything.</p>
  <br/>
  <p>© 2026 <strong>Sk.Yeasin Arafat</strong> · BSc CSE · Daffodil International University</p>
  <p><em>Unauthorized use of this codebase is strictly prohibited and subject to legal action.</em></p>
</div> -->


<!-- 2...............\ -->
<div align="center">

# 🎧 AURIX

### Premium Headphone E-Commerce Platform

*Engineered for sound. Designed for those who listen closely.*

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)

</div>

---

## 📖 Overview

**AURIX** is a full-stack, premium headphone e-commerce platform built for the Bangladeshi market. It pairs a cinematic, dark-themed storefront with a complete back-office: a role-based **Admin Dashboard** for daily operations and an **Owner Dashboard** for oversight, finance, and reporting.

All prices are in **Bangladeshi Taka (৳)**, and the checkout is tailored for local mobile-payment workflows and delivery zones.

---

## ✨ Features

### 🛍️ Customer Storefront
- **Cinematic landing page** with Hero, Product Reveal, Sound, Engineering, Craftsmanship, Specifications, and CTA sections
- **Shop** with an animated headphone intro, premium product cards, and category filters
- **Product detail pages** with full specs, features, what's-in-the-box, and related products
- **Reviews & ratings** with live updates and admin replies
- **Cart drawer** with quantity controls and live subtotal
- **Checkout** with delivery zones (Dhaka / Outside Dhaka), mobile-payment verification, and coupon support
- **Order confirmation** page with a complete receipt and "Amount to Pay at Door"
- **Order confirmation emails** sent automatically to logged-in customers
- **My Orders** with real-time status and a visual 5-step order tracker
- **Order cancellation** for pending or confirmed orders, with an automatic refund request
- **Live refund status** visible to the customer
- **Profile** with avatar upload and editable name and phone
- **Responsive design** with a mobile-first navbar and slide-in drawer

### 🛠️ Admin Dashboard
| Module | Highlights |
|---|---|
| **Dashboard** | Live Bangladesh clock, real-time stat cards, low-stock alerts, order and revenue trends, top products, order-status breakdown |
| **Orders** | Search by ID, name, or phone; status workflow; "handled by" tracking; printable cash memos (customer copy or both copies) |
| **Products** | Full CRUD, stock management, device upload or external image URL |
| **Categories** | Icon and color accent, live filter preview, product counts |
| **Reviews** | All reviews in real time with admin replies |
| **Refunds** | Review cancelled-order refunds, record transaction details, notify the customer |
| **Users / CRM** | All customers, live presence, editable customer details, order history |
| **Coupons** | Percentage or fixed discounts, active/inactive toggle, live marquee on the Shop page |
| **Billings** | Billing history with date filters and printing |
| **Analytics** | KPIs, charts, and a conversion funnel |
| **Monthly Reports** | Month, year, or custom range reports, printable/PDF, CEO signature option |
| **Admin Profile & Management** | Each admin maintains their own verified profile; super-admin view is read-only |
| **Notifications** | Real-time bell with toast alerts for new orders and reviews |
| **IP Tracking** | Order origin details with the ability to block abusive IPs |

### 👑 Owner Dashboard
A read-focused executive console for business oversight:

- **Overview**: real-time metrics, charts, and admin presence
- **Orders**: read-only order explorer with search, date filter, and detail drawer
- **Admin Management**: promote or demote admins
- **Admin Performance**: per-admin handling stats with date ranges
- **Inventory**: read-only products and stock alerts
- **Customers**: customer list with order statistics
- **Coupons**: coupon overview with usage counts
- **Finance**: revenue breakdown, monthly chart, payment-method split
- **Reports**: printable reports with optional CEO signature
- **Profile**: personal owner profile

### 🔐 Authentication
- Email/password and Google sign-in for customers
- Separate **Admin** and **Owner** login tabs with server-verified role checks
- Real-time role watcher that signs out an admin automatically if their access is removed

### 🛡️ Security Practices
- Input sanitization on all user-facing forms
- Client-side rate limiting on login, registration, checkout, and reviews
- Hardened database security rules with role and ownership validation
- Security headers (CSP, X-Frame-Options, Referrer-Policy, and more)
- Environment-based configuration; secrets are never committed

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router DOM, Vite |
| **Styling** | Tailwind CSS (custom dark theme) |
| **Animation** | GSAP |
| **Backend as a Service** | Firebase Authentication, Cloud Firestore |
| **Charts** | Recharts |
| **Notifications** | react-hot-toast |
| **Printing** | react-to-print |
| **Email** | EmailJS |
| **Hosting** | Vercel |

---

## 📁 Project Structure

```
src/
├── App.jsx                # Routing (public, /admin/*, /owner/*)
├── main.jsx               # App entry: Router + providers
├── firebase.js            # Firebase initialization (env-based)
├── context/               # Auth and Cart providers
├── pages/                 # Customer-facing pages
├── components/            # Shared UI (Navbar, CartDrawer, sections...)
├── admin/                 # Admin layout and dashboard pages
├── owner/                 # Owner layout and dashboard pages
└── utils/                 # Security and helper utilities
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or later
- A Firebase project (Authentication and Firestore enabled)

### Installation

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd aurix

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Fill in your own Firebase and EmailJS credentials

# 4. Start the development server
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

---

## 🗺️ Roadmap

- [x] Storefront, checkout, and order tracking
- [x] Admin Dashboard with full operations suite
- [x] Owner Dashboard with finance and reporting
- [x] Security hardening
- [x] Order emails, cancellation, and refunds
- [ ] Further Owner Dashboard enhancements
- [ ] Server-side session revocation and admin provisioning via Cloud Functions

---

## 👨‍💻 Developer

**Sk. Yeasin Arafat**
BSc in Computer Science & Engineering
Daffodil International University, 6th Semester

---

## ⚖️ Copyright & Legal Notice

**© AURIX. All rights reserved.**

This project, including its source code, design, branding, and assets, is proprietary. Copying, cloning, redistributing, reselling, or reusing any part of it, in whole or in part, without prior written permission from the author is strictly prohibited and may result in legal action.

The repository is shared for portfolio and review purposes only.