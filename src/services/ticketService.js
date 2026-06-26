import api from './api';

export default {
  getAll(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') {
    return api.get('/tickets', { params: { page, size, sortBy, sortDir } });
  },
  getById(id) {
    return api.get(`/tickets/${id}`);
  },
  create(data) {
    return api.post('/tickets', data);
  },
  update(id, data) {
    return api.put(`/tickets/${id}`, data);
  },
  updateStatus(id, status) {
    return api.put(`/tickets/${id}/status`, { status });
  },
  delete(id) {
    return api.delete(`/tickets/${id}`);
  }
};
