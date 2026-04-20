import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('silkthread_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('silkthread_token');
      localStorage.removeItem('silkthread_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Typed API helpers ───────────────────────────────────────

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; phone?: string; password: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Orders
export const ordersAPI = {
  list: () => api.get('/orders'),
  get: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: string, status: string, note?: string) =>
    api.patch(`/orders/${id}/status`, { status, note }),
  assign: (id: string, tailor_id: string) =>
    api.patch(`/orders/${id}/assign`, { tailor_id }),
  getMessages: (id: string) => api.get(`/orders/${id}/messages`),
  sendMessage: (id: string, content: string) =>
    api.post(`/orders/${id}/messages`, { content }),
};

// Garments
export const garmentsAPI = {
  list: () => api.get('/garments'),
  listAll: () => api.get('/garments/all'),
  get: (id: string) => api.get(`/garments/${id}`),
  create: (data: any) => api.post('/garments', data),
  update: (id: string, data: any) => api.put(`/garments/${id}`, data),
  remove: (id: string) => api.delete(`/garments/${id}`),
};

// Measurements
export const measurementsAPI = {
  saveMine: (data: any) => api.put('/measurements/mine', data),
  getMine: () => api.get('/measurements/mine'),
  getUser: (userId: string) => api.get(`/measurements/user/${userId}`),
  saveUser: (userId: string, data: any) => api.put(`/measurements/user/${userId}`, data),
};

// Tailors
export const tailorsAPI = {
  list: () => api.get('/tailors'),
  create: (data: any) => api.post('/tailors', data),
  update: (id: string, data: any) => api.put(`/tailors/${id}`, data),
  remove: (id: string) => api.delete(`/tailors/${id}`),
};
// Customers
export const customersAPI = {
  list: () => api.get('/customers'),
  get: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  remove: (id: string) => api.delete(`/customers/${id}`),
};

// Fabrics
export const fabricsAPI = {
  list: () => api.get('/fabrics'),
  create: (data: any) => api.post('/fabrics', data),
  update: (id: string, data: any) => api.put(`/fabrics/${id}`, data),
  remove: (id: string) => api.delete(`/fabrics/${id}`),
};

// Customizations
export const customizationsAPI = {
  list: () => api.get('/customizations'),
  create: (data: any) => api.post('/customizations', data),
  update: (id: string, data: any) => api.put(`/customizations/${id}`, data),
  remove: (id: string) => api.delete(`/customizations/${id}`),
};

// Analytics
export const analyticsAPI = {
  dashboard: () => api.get('/analytics/dashboard'),
};

// Upload
export const uploadAPI = {
  image: (file: File) => {
    const form = new FormData();
    form.append('image', file);
    return api.post<{ url: string; filename: string }>('/upload', form);
  },
};
