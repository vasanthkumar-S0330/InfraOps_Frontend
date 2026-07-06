<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-logo">
        <span class="sidebar-logo-icon"><Zap :size="20" /></span>
        <span class="sidebar-logo-text">InfraOps</span>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon"><LayoutDashboard :size="18" /></span>
          <span class="nav-label">Dashboard</span>
        </router-link>
        <router-link to="/monitoring" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon"><Activity :size="18" /></span>
          <span class="nav-label">Monitoring</span>
        </router-link>
        <router-link to="/assets" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon"><Monitor :size="18" /></span>
          <span class="nav-label">Assets</span>
        </router-link>
        <router-link to="/tickets" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon"><Ticket :size="18" /></span>
          <span class="nav-label">Tickets</span>
        </router-link>
        <router-link v-if="authStore.isAdmin" to="/users" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon"><Users :size="18" /></span>
          <span class="nav-label">Users</span>
        </router-link>
      </nav>

      <div class="sidebar-bottom">
        <router-link to="/profile" class="sidebar-user" active-class="sidebar-user--active">
          <div class="user-avatar">{{ userInitials }}</div>
          <div class="user-info">
            <span class="user-name">{{ authStore.fullName || authStore.user?.email }}</span>
            <span class="user-role" :class="`role-${authStore.user?.role?.toLowerCase()}`">
              {{ authStore.user?.role }}
            </span>
          </div>
        </router-link>
        <button class="logout-btn" @click="logout" title="Logout">
          <LogOut :size="16" />
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <Transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>

    <ToastNotification ref="toastRef" />
  </div>
</template>

<script setup>
import { ref, computed, provide } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import ToastNotification from '../components/ToastNotification.vue';
import { Zap, LayoutDashboard, Monitor, Ticket, Users, LogOut, Activity } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const toastRef = ref(null);
const sidebarCollapsed = ref(false);

const userInitials = computed(() => {
  const u = authStore.user;
  if (!u) return '?';
  if (u.firstName && u.lastName) return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
  if (u.email) return u.email[0].toUpperCase();
  return '?';
});

const toast = {
  success: (msg) => toastRef.value?.addToast(msg, 'success'),
  error: (msg) => toastRef.value?.addToast(msg, 'error'),
  info: (msg) => toastRef.value?.addToast(msg, 'info'),
  warning: (msg) => toastRef.value?.addToast(msg, 'warning'),
};

provide('toast', toast);

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg);
}

/* ---- Sidebar ---- */
.sidebar {
  width: var(--sidebar-width);
  background: var(--color-bg-alt);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: 0;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px 20px;
  border-bottom: 1px solid var(--color-border);
}
.sidebar-logo-icon {
  font-size: 1.5rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-dim);
  border-radius: var(--radius-md);
}
.sidebar-logo-text {
  font-size: 1.1rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

/* Navigation */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 12px;
  flex: 1;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition);
}
.nav-item:hover {
  background: var(--color-surface-hover);
  color: var(--text-primary);
}
.nav-item--active {
  background: var(--color-primary-dim);
  color: var(--color-primary) !important;
}
.nav-icon { font-size: 1.1rem; width: 20px; text-align: center; }
.nav-label { font-weight: 500; }

/* Bottom section */
.sidebar-bottom {
  border-top: 1px solid var(--color-border);
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: background var(--transition);
  flex: 1;
  min-width: 0;
}
.sidebar-user:hover, .sidebar-user--active {
  background: var(--color-surface-hover);
}
.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-violet));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}
.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.user-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-role {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.role-admin    { color: var(--color-violet); }
.role-engineer { color: var(--color-info); }

.logout-btn {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all var(--transition);
  flex-shrink: 0;
}
.logout-btn:hover {
  background: var(--color-danger-dim);
  color: var(--color-danger);
  border-color: rgba(244, 63, 94, 0.3);
}

/* Main content */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  min-width: 0;
}

/* Page transition */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
