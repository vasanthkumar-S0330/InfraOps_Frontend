import api from './api';

export default {
  getSummary() {
    return api.get('/dashboard/summary');
  },
  getAssets() {
    return api.get('/dashboard/assets');
  },
  getTickets() {
    return api.get('/dashboard/tickets');
  },
  getHealth() {
    return api.get('/dashboard/health');
  }
};
