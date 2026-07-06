# InfraOps - Project Features Documentation

This document outlines the core features, architecture, and modules implemented in the **InfraOps Frontend** application.

## 🛠️ Technology Stack
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **HTTP Client**: Axios
- **Icons**: Lucide Vue Next
- **Styling**: Vanilla CSS (`style.css`)
- **Deployment**: Docker, Nginx, Docker Compose

---

## 🚀 Core Modules & Features

### 1. Authentication & Security (Role-Based Access Control)
- **Login System**: Secure user authentication via `LoginView.vue`.
- **Navigation Guards**: Route protection ensuring unauthenticated users cannot access internal pages and logged-in users bypass the login screen.
- **Admin Privileges**: Specific modules (like User Management) are locked behind a `requiresAdmin` flag, restricting access strictly to administrative personnel.
- **State Management**: Managed globally using Pinia (`authStore`).

### 2. Dashboard & Analytics
- **Overview Dashboard**: A centralized `DashboardView.vue` providing a high-level overview of system metrics.
- **Statistic Cards**: Reusable `StatCard.vue` component to beautifully display key performance indicators (KPIs) and counts.
- **API Integration**: Data fed dynamically through `dashboardService.js`.

### 3. IT Asset Management
- **Asset Registry**: Comprehensive view of all company IT infrastructure and assets via `AssetsView.vue`.
- **CRUD Operations**: Ability to Create, Read, Update, and Delete assets securely integrated with `assetService.js`.

### 4. Helpdesk & Ticketing System
- **Ticket Management**: A dedicated module (`TicketsView.vue`) for employees to raise and track IT support issues.
- **Service Integration**: Managed through `ticketService.js` to handle ticket lifecycle (creation, status updates, resolution).

### 5. User & Identity Management
- **Admin User Control**: A centralized `UsersView.vue` accessible only by administrators to manage employee accounts.
- **User Profiles**: Individual `ProfileView.vue` allowing standard users to view and update their personal account settings.

### 6. UI/UX & Reusable Components
- **Global Layout System**: `AppLayout.vue` structure providing a consistent sidebar and navigation experience across all authenticated pages.
- **Toast Notifications**: System-wide non-intrusive alerts (`ToastNotification.vue`) for success/error feedback on actions.
- **Interactive Modals**: Reusable `BaseModal.vue` for forms and data entry without leaving the current page context.
- **Confirmation Dialogs**: `ConfirmDialog.vue` to prevent accidental destructive actions (like deleting assets/users).

### 7. Containerization & Deployment Readiness
- **Dockerized Architecture**: A highly optimized, multi-stage `Dockerfile` that builds the Vue app and serves it using a lightweight Nginx web server.
- **Nginx Configured for SPA**: Custom `nginx.conf` designed specifically to route Single Page Application traffic cleanly.
- **Docker Compose**: Orchestration via `docker-compose.yml` for quick and reproducible local or server deployments.
- **Environment Configuration**: Robust handling of API routing using `.env.production`.
