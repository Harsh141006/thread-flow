# ThreadFlow — Embroidery Order & Production Management System

ThreadFlow is a complete, full-stack Next.js application designed to digitize the workflow of an embroidery and apparel personalization company. It tracks orders from design approval through production, quality control, and delivery.

## 🚀 Features

### Core Modules
* **RBAC Authentication**: Secure access with distinct roles (`admin`, `sales`, `designer`, `production`, `qc`, `customer`).
* **Dashboard & Analytics**: Real-time stats on production utilization, revenue, and order statuses.
* **Customer Management**: CRM for tracking clients, contact info, and order history.
* **Order Management**: Detailed specification tracking including garment types, thread colors, and dimensions.
* **Design Portal**: Upload artwork versions; customers can approve or request revisions via their dedicated portal.
* **Production Kanban**: Live tracking of orders assigned to specific embroidery machines with a visual Kanban board.
* **Inventory Control**: Track threads and materials with automatic low-stock alerts.
* **Quality Control (QC)**: Digital checklist ensuring exact dimensions, colors, and quality before packing.
* **Payments & Billing**: Track partial and full payments against orders.

### Technical Stack
* **Frontend/Backend**: Next.js 14 (App Router)
* **Database**: MongoDB (Mongoose with Serverless singleton connection)
* **Styling**: Tailwind CSS v4 (Custom Design System tokens in globals.css)
* **Auth**: NextAuth.js (Credentials Provider)
* **Icons & Charts**: Lucide React, Recharts

## 🛠 Setup & Installation

1. **Clone & Install**
   ```bash
   git clone <repository>
   cd CollegeProject/frontend
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file in the `frontend/` directory using `.env.example`:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_super_secret_string
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **Seed the Database** (Optional but recommended)
   Open a new terminal and run the backend seed script to populate demo data:
   ```bash
   cd CollegeProject/backend
   npm install
   npm run seed
   ```

4. **Run the Application**
   ```bash
   cd CollegeProject/frontend
   npm run dev
   ```

## 👥 Demo Accounts (Seeded)

The seed script creates the following demo users with password `password123`:
* `admin@threadflow.com` (Admin)
* `sales@threadflow.com` (Sales)
* `designer@threadflow.com` (Designer)
* `production@threadflow.com` (Production)
* `qc@threadflow.com` (Quality Control)
* `customer@threadflow.com` (Customer Portal access)

## 🎨 Design Philosophy
ThreadFlow employs a premium B2B SaaS aesthetic. It avoids overly playful or generic SaaS styles, favoring a clean, high-contrast, utility-first design with neutral backgrounds, crisp typography, and restrained use of accent colors.

## 📄 License
MIT
