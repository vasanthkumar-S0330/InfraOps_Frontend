import { defineStore } from 'pinia';
import assetService from '../services/assetService';

export const useAssetStore = defineStore('assets', {
  state: () => ({
    assets: [],
    currentAsset: null,
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
      this.assets = data.content || data;
      if (data.page) {
        this.pagination.page = data.page.number;
        this.pagination.size = data.page.size;
        this.pagination.totalElements = data.page.totalElements;
        this.pagination.totalPages = data.page.totalPages;
      }
    },

    async fetchAssets(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') {
      this.loading = true;
      this.error = null;
      try {
        const response = await assetService.getAll(page, size, sortBy, sortDir);
        this._parsePagination(response.data);
      } catch (error) {
        this.error = 'Failed to load assets.';
      } finally {
        this.loading = false;
      }
    },

    async searchAssets(query, page = 0, size = 10) {
      this.loading = true;
      this.error = null;
      try {
        const response = await assetService.search(query, page, size);
        this._parsePagination(response.data);
      } catch (error) {
        this.error = 'Search failed.';
      } finally {
        this.loading = false;
      }
    },

    async fetchAsset(id) {
      this.loading = true;
      try {
        const response = await assetService.getById(id);
        this.currentAsset = response.data;
        return response.data;
      } catch (error) {
        this.error = `Failed to fetch asset.`;
      } finally {
        this.loading = false;
      }
    },

    async createAsset(data) {
      try {
        await assetService.create(data);
        this.successMessage = 'Asset created successfully!';
        await this.fetchAssets();
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create asset.';
        throw error;
      }
    },

    async updateAsset(id, data) {
      try {
        await assetService.update(id, data);
        this.successMessage = 'Asset updated successfully!';
        await this.fetchAssets(this.pagination.page);
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update asset.';
        throw error;
      }
    },

    async deleteAsset(id) {
      try {
        await assetService.delete(id);
        this.successMessage = 'Asset deleted successfully!';
        await this.fetchAssets(this.pagination.page);
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete asset.';
        throw error;
      }
    },

    clearMessages() {
      this.error = null;
      this.successMessage = null;
    }
  }
});
