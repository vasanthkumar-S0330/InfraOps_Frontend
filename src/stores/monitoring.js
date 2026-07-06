import { defineStore } from 'pinia';
import { serversAPI } from '../services/api';

export const useMonitoringStore = defineStore('monitoring', {
  state: () => ({
    servers: [],
    loading: false,
    error: null,
    lastUpdated: null,
  }),
  actions: {
    async fetchServers() {
      try {
        const response = await serversAPI.getServers();
        this.servers = response.data;
        this.lastUpdated = new Date();
        this.error = null;
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to fetch servers';
        console.error('Error fetching servers:', err);
      }
    },
    async addServer(serverData) {
      this.loading = true;
      try {
        const response = await serversAPI.addServer(serverData);
        this.servers.push(response.data);
        this.error = null;
        return response.data;
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to add server';
        console.error('Error adding server:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});
