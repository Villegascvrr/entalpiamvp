

# Entalpia MVP 🚀

**Industrial Supplies Management Dashboard**

![Status](https://img.shields.io/badge/Status-Development-blue)
![Tech](https://img.shields.io/badge/Stack-React_|_Vite_|_Supabase-green)

A comprehensive B2B dashboard for managing industrial supplies orders, pricing, and customer relationships. Built for efficiency, transparency, and real-time control.


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


### Frontend setup

1.  **Install dependencies**
    ```bash
    npm install
    ```
2.  **Start the development server**
    ```bash
    npm run dev
    ```
3.  **Open in your browser**: `http://localhost:5173`


### Local supabase setup

1. `npx supabase login`
2. `npx supabase link --project-ref syqhaewpxflmpmtmjspa`
2. `npx supabase start`


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
