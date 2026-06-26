import api from './api';

export default {
  getAll(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') {
    return api.get(`/assets`, { params: { page, size, sortBy, sortDir } });
  },
  search(query, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') {
    return api.get(`/assets/search`, { params: { query, page, size, sortBy, sortDir } });
  },
  getById(id) {
    return api.get(`/assets/${id}`);
  },
  create(data) {
    return api.post('/assets', data);
  },
  update(id, data) {
    return api.put(`/assets/${id}`, data);
  },
  delete(id) {
    return api.delete(`/assets/${id}`);
  }
};
