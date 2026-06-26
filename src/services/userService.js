import api from './api';

export default {
  getAll(page = 0, size = 10, sortBy = 'firstName', sortDir = 'asc', email = '') {
    const params = { page, size, sortBy, sortDir };
    if (email) params.email = email;
    return api.get('/users', { params });
  },
  getById(id) {
    return api.get(`/users/${id}`);
  },
  create(data) {
    return api.post('/users', data);
  },
  update(id, data) {
    return api.put(`/users/${id}`, data);
  },
  delete(id) {
    return api.delete(`/users/${id}`);
  }
};
