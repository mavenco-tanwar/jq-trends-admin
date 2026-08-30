# Mavenco Commerce — Superadmin & Merchant Admin Engine

**Mavenco Commerce Admin** is a unified multi-tenant control plane featuring a **Superadmin Platform Console** for platform operators and an isolated **Merchant Admin Experience** for store owners.

---

## 🚀 Key Features

### 👑 1. Superadmin Platform Control Plane (`/platform`)
- **Global Platform KPIs**: Real-time MRR, active vs. trial vs. suspended tenants, total products & orders processed across all databases.
- **5-Step Store Provisioning Wizard**: Automated tenant database creation, schema initialization, default CMS seeding, and domain binding.
- **Secure Impersonation Mode**: One-click login into any merchant store with top audit banner and security logging.
- **SaaS Subscription Plans & Feature Flags**: Starter ($29/mo), Professional ($79/mo), Enterprise ($249/mo).
- **Domains & Multi-Tenant URL Manager**: Complete DNS setup and routing hub.

### 🏬 2. Merchant Admin Experience
- **Store Switcher Dropdown**: Instant switching between provisioned stores.
- **Full Catalog Management**: Products, Categories, Collections, Inventory Matrix.
- **Visual Drag & Drop CMS**: Homepage builder, pages, scheduled blocks, device visibility toggles.
- **Digital Asset Management**: Isolated media library with phone/computer file upload.
- **Store & Theme Customizer**: Brand colors, fonts, taxes, shipping, payment gateways, staff RBAC.

---

## 🛠️ Multi-Tenant URL Routing

| Store | Merchant Admin URL |
| :--- | :--- |
| **JQ Trends** | `/stores/jqtrends` or `admin.jqtrends.com` |
| **Aura Living** | `/stores/auraliving` or `admin.auraliving.com` |
| **Apex Athletics** | `/stores/apexathletics` or `admin.apexathletics.com` |

---

## 💻 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **State & Theme**: Custom SaaS Multi-Tenant Engine
- **Deployment**: Vercel Serverless
