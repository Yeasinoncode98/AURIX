# AURIX — Premium Headphone E-Commerce Platform

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
</div>
