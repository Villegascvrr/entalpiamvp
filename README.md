# Entalpia MVP 🚀

**Industrial Supplies Management Dashboard**

![Status](https://img.shields.io/badge/Status-Development-blue)
![Tech](https://img.shields.io/badge/Stack-React_|_Vite_|_Supabase-green)

A comprehensive B2B dashboard for managing industrial supplies orders, pricing, and customer relationships. Built for efficiency, transparency, and real-time control.

## 🌟 Key Features

### 📊 Dashboard & Analytics
- **Real-time Overview**: Instant visibility into active orders, critical stock levels, and sales performance.
- **Role-Based Views**: Tailored dashboards for **Admins** (Strategic view) and **Customers** (Operational view).

### 📦 Order Management
- **Active vs. History**: Clear separation of ongoing orders and historical archives.
- **Order Timeline**: Visual tracking of every order stage from *Draft* to *Delivered*.
- **Detailed Order View**: comprehensive breakdown of line items, delivery details, and status history.

### 💰 Pricing Engine
- **LME Integration**: Real-time copper price tracking from the London Metal Exchange.
- **FX Rate Control**: Manual management of **USD/EUR exchange rates** to calculate final prices accurately.
- **Dynamic Pricing**: `Base Price ($) * FX Rate * Index * Margin = Final Price (€)`.
- **Margin Management**: Granular control over product margins and global market indices.

### 🔐 Security & Access
- **RBAC**: Strict role-based access control (Admin, Commercial, Customer).
- **Supabase Auth**: Secure authentication and session management.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn UI, Lucide Icons
- **Backend / BaaS**: Supabase (PostgreSQL, Auth, Realtime)
- **State Management**: React Context API
- **Routing**: React Router DOM

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd entalpiamvp
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  **Open in your browser**
    Navigate to `http://localhost:5173`

## 📂 Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── layout/        # App shell, Sidebar, Header
│   ├── orders/        # Order specific components (Timeline, Tables)
│   └── ui/            # Shadcn UI primitives
├── contexts/          # React Contexts (ActorContext, etc.)
├── data/              # Data Layer
│   ├── repositories/  # Repository Pattern implementation
│   └── types.ts       # TypeScript definitions
├── hooks/             # Custom React hooks (useOrders, etc.)
├── pages/             # Route components (AdminPricing, MyOrders, etc.)
└── lib/               # Utilities (Supabase client, utils)
```

## ✨ Feature Highlights

### Order Timeline
visualizes the lifecycle of an order. It shows:
- Status changes (e.g., *Confirmed* -> *Preparing*)
- Timestamps
- The actor who performed the action (User or Admin)

### FX Rate Control (`/admin/pricing`)
Allows admins to:
1.  Input the current **USD/EUR** exchange rate.
2.  Update the **LME Copper** price in USD.
3.  Automatically recalculate all product prices in EUR based on the defined formula.

---
*Built with ❤️ for Entalpia*
