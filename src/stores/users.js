import { defineStore } from 'pinia';
import userService from '../services/userService';

export const useUserStore = defineStore('users', {
  state: () => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null,
    successMessage: null,
    pagination: {
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    }
  }),
  actions: {
    _parsePagination(data) {
      this.users = data.content || data;
      if (data.page) {
        this.pagination.page = data.page.number;
        this.pagination.size = data.page.size;
        this.pagination.totalElements = data.page.totalElements;
        this.pagination.totalPages = data.page.totalPages;
      }
    },

    async fetchUsers(page = 0, size = 10, sortBy = 'firstName', sortDir = 'asc', email = '') {
      this.loading = true;
      this.error = null;
      try {
        const response = await userService.getAll(page, size, sortBy, sortDir, email);
        this._parsePagination(response.data);
      } catch (error) {
        this.error = 'Failed to load users.';
      } finally {
        this.loading = false;
      }
    },

    async fetchUser(id) {
      this.loading = true;
      try {
        const response = await userService.getById(id);
        this.currentUser = response.data;
        return response.data;
      } catch (error) {
        this.error = 'Failed to fetch user.';
      } finally {
        this.loading = false;
      }
    },

    async createUser(data) {
      try {
        await userService.create(data);
        this.successMessage = 'User created successfully!';
        await this.fetchUsers();
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create user.';
        throw error;
      }
    },

    async updateUser(id, data) {
      try {
        await userService.update(id, data);
        this.successMessage = 'User updated successfully!';
        await this.fetchUsers(this.pagination.page);
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update user.';
        throw error;
      }
    },

    async deleteUser(id) {
      try {
        await userService.delete(id);
        this.successMessage = 'User deleted successfully!';
        await this.fetchUsers(this.pagination.page);
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete user.';
        throw error;
      }
    },

    clearMessages() {
      this.error = null;
      this.successMessage = null;
    }
  }
});
