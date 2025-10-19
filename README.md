# 🚗 CenasOcta.lv — Auto Insurance Comparison Platform

CenasOcta.lv is a modern Latvian insurance comparison platform developed by MIĶEĻBAUDAS SIA.
The platform allows customers to compare OCTA insurance offers, register, manage their policies, and receive cashback for purchases.

## 🏗️ Project Overview

CenasOcta.lv simplifies the process of finding and purchasing car insurance in Latvia.
The system integrates multiple insurance providers through APIs, compares offers, and allows users to buy policies directly online.

## 🌐 Core Idea

**"Fast, transparent, and customer-friendly insurance service — with real cashback."**

## 🧩 Main Features

### 👤 User Portal

Registered users can:

- View purchase and insurance history
- Download and store policies, invoices, and receipts
- Manage personal or company details
- Track the status of insurance policies (active / expired / pending payment)
- Receive renewal reminders and notifications
- Use the built-in cashback system
- View and download credit notes for refunds
- Contact support directly from their account

### 🏢 Admin Panel (MIĶEĻBAUDAS SIA)

Administrators can:

- Manage users and their policies
- View and export SEPA XML files for cashback or refunds
- Connect and configure insurance company APIs
- Access transaction logs and analytics
- Approve or reject cashback requests
- Manage system-wide settings and content

## ⚙️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React, Vite, Tailwind, NativeWind |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **Auth** | Supabase Email/Password (JWT) |
| **Hosting** | Vercel + Supabase Cloud |
| **Payments** | Montonio API (planned integration) |
| **Data Exports** | SEPA XML (manual or automated mode) |

## 🗂️ Folder Structure

```
CenasOcta.lv/
│
├── OCTA/                  # Frontend application (React/Vite)
│   ├── src/
│   │   ├── components/    # UI components (Forms, Tables, etc.)
│   │   ├── pages/         # Main pages (Home, Login, Dashboard)
│   │   ├── lib/           # API and Supabase client
│   │   ├── assets/        # Images, icons, and styles
│   │   └── App.jsx
│   └── package.json
│
├── SERVER/                # Backend logic (Node.js, optional API proxy)
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── index.js
│   └── package.json
│
└── README.md
```

## 🔐 Environment Variables

Set up the following in your `.env.local` or in Vercel → Project Settings → Environment Variables:

| Name | Description | Example |
|------|-------------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase API endpoint | `Example` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key | `Example` |
| `VITE_SUPABASE_URL` | (Compatibility variable) | same as above |
| `VITE_SUPABASE_ANON_KEY` | (Compatibility variable) | same as above |

## 🚀 Deployment

### Frontend:
- Hosted automatically via Vercel
- Branch → `master` → triggers build & deploy.

### Backend (optional):
- Node.js server hosted on Vercel Functions or external VPS.

### Database & Auth:
- Managed by Supabase Cloud

## 💳 Payments & Cashback Logic

1. Client purchases insurance directly through the website (via partner APIs)
2. MIĶEĻBAUDAS SIA issues an invoice and records transaction
3. Cashback calculated as difference between insurance base price and sale price
4. Refunds processed automatically or via SEPA XML batch upload to bank

## 📈 Roadmap

- ✅ Connect Supabase (Database & Auth)
- ✅ Deploy on Vercel with custom domain
- 🟡 Implement login & profile dashboard
- 🟡 Integrate Montonio for payments
- 🟡 Add insurance provider APIs
- ⬜ Launch Beta version for testing
- ⬜ Integrate admin panel & SEPA exports
- ⬜ Public launch of cenasocta.lv

## 🏢 Company Information

**MIĶEĻBAUDAS SIA**  
Reg. Nr.: LV40203355985  
Address: Miķeļbaudas, Olaines novads, Olaines pagasts, Jaunolaine, LV-2127  
Email: info@cenasocta.lv  
Website: https://www.cenasocta.lv
