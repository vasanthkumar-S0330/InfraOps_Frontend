import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

import AppLayout from '../layouts/AppLayout.vue';
import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import MonitoringDashboardView from '../views/MonitoringDashboardView.vue';
import AssetsView from '../views/AssetsView.vue';
import TicketsView from '../views/TicketsView.vue';
import UsersView from '../views/UsersView.vue';
import ProfileView from '../views/ProfileView.vue';
import OAuth2RedirectHandler from '../views/OAuth2RedirectHandler.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/oauth2/redirect',
    name: 'OAuth2Redirect',
    component: OAuth2RedirectHandler,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'Dashboard', component: DashboardView },
      { path: 'monitoring', name: 'Monitoring', component: MonitoringDashboardView },
      { path: 'assets', name: 'Assets', component: AssetsView },
      { path: 'tickets', name: 'Tickets', component: TicketsView },
      { path: 'users', name: 'Users', component: UsersView, meta: { requiresAdmin: true } },
      { path: 'profile', name: 'Profile', component: ProfileView },
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login');
  }
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return next('/dashboard');
  }
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next('/dashboard');
  }

  next();
});

export default router;
