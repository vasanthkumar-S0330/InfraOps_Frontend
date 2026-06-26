import { defineStore } from 'pinia';
import ticketService from '../services/ticketService';

export const useTicketStore = defineStore('tickets', {
  state: () => ({
    tickets: [],
    currentTicket: null,
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
      this.tickets = data.content || data;
      if (data.page) {
        this.pagination.page = data.page.number;
        this.pagination.size = data.page.size;
        this.pagination.totalElements = data.page.totalElements;
        this.pagination.totalPages = data.page.totalPages;
      }
    },

    async fetchTickets(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') {
      this.loading = true;
      this.error = null;
      try {
        const response = await ticketService.getAll(page, size, sortBy, sortDir);
        this._parsePagination(response.data);
      } catch (error) {
        this.error = 'Failed to load tickets.';
      } finally {
        this.loading = false;
      }
    },

    async fetchTicket(id) {
      this.loading = true;
      try {
        const response = await ticketService.getById(id);
        this.currentTicket = response.data;
        return response.data;
      } catch (error) {
        this.error = 'Failed to fetch ticket.';
      } finally {
        this.loading = false;
      }
    },

    async createTicket(data) {
      try {
        await ticketService.create(data);
        this.successMessage = 'Ticket created successfully!';
        await this.fetchTickets();
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create ticket.';
        throw error;
      }
    },

    async updateTicket(id, data) {
      try {
        await ticketService.update(id, data);
        this.successMessage = 'Ticket updated successfully!';
        await this.fetchTickets(this.pagination.page);
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update ticket.';
        throw error;
      }
    },

    async updateTicketStatus(id, status) {
      try {
        await ticketService.updateStatus(id, status);
        this.successMessage = 'Status updated!';
        const ticket = this.tickets.find(t => t.id === id);
        if (ticket) ticket.status = status;
      } catch (error) {
        this.error = 'Failed to update ticket status.';
        await this.fetchTickets(this.pagination.page);
      }
    },

    async deleteTicket(id) {
      try {
        await ticketService.delete(id);
        this.successMessage = 'Ticket deleted successfully!';
        await this.fetchTickets(this.pagination.page);
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete ticket.';
        throw error;
      }
    },

    clearMessages() {
      this.error = null;
      this.successMessage = null;
    }
  }
});
