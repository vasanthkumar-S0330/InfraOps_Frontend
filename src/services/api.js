import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ticketsAPI = {
  getTickets: () => api.get('/tickets'),
  getTicket: (id) => api.get(`/tickets/${id}`),
  createTicket: (ticket) => api.post('/tickets', ticket),
  updateTicketStatus: (id, status, notes) => api.patch(`/tickets/${id}/status`, { status, resolutionNotes: notes })
};

export const serversAPI = {
  getServers: () => api.get('/servers'),
  addServer: (server) => api.post('/servers', server)
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Auth endpoints don't require the token
    if (token && !config.url.startsWith('/auth')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Redirect to login if unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
