import { defineStore } from 'pinia';
import authService from '../services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'ADMIN',
    fullName: (state) => state.user ? `${state.user.firstName} ${state.user.lastName}` : '',
  },
  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const response = await authService.login(credentials);
        const { token, userId, email, role } = response.data;
        this.token = token;
        localStorage.setItem('token', token);
        // Store minimal user info from login response
        this.user = { id: userId, email, role, firstName: '', lastName: '' };
        localStorage.setItem('user', JSON.stringify(this.user));
        // Fetch full profile to get names
        await this.fetchProfile();
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed. Please check your credentials.';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async register(userData) {
      this.loading = true;
      this.error = null;
      try {
        await authService.register(userData);
      } catch (error) {
        this.error = error.response?.data?.message || 'Registration failed.';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchProfile() {
      try {
        const response = await authService.getProfile();
        this.user = response.data;
        localStorage.setItem('user', JSON.stringify(this.user));
      } catch (error) {
        // Non-critical — keep existing user object
      }
    },

    async updateProfile(data) {
      this.loading = true;
      this.error = null;
      try {
        const response = await authService.updateProfile(data);
        this.user = { ...this.user, ...response.data };
        localStorage.setItem('user', JSON.stringify(this.user));
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Profile update failed.';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});
