import axios from 'axios';

// All API calls route through this single instance so the base URL
// and future cross-cutting concerns (auth headers, request tracing)
// change in exactly one place instead of scattered across every component.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
});

// ── Students ──────────────────────────────────────────────────────────────────
export const studentApi = {
  getAll: ()         => api.get('/students/get'),
  getOne: (id)       => api.get(`/students/get/${id}`),
  create: (data)     => api.post('/students/create', data),
  update: (id, data) => api.put(`/students/update/${id}`, data),
  remove: (id)       => api.delete(`/students/delete/${id}`),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const userApi = {
  getAll: ()         => api.get('/users/get'),
  create: (data)     => api.post('/users/create', data),
  update: (id, data) => api.put(`/users/update/${id}`, data),
  remove: (id)       => api.delete(`/users/delete/${id}`),
};

// ── Roles ─────────────────────────────────────────────────────────────────────
export const roleApi = {
  getAll: ()         => api.get('/roles/get'),
  create: (data)     => api.post('/roles/create', data),
  update: (id, data) => api.put(`/roles/update/${id}`, data),
  remove: (id)       => api.delete(`/roles/delete/${id}`),
};

// ── Admin Groups ──────────────────────────────────────────────────────────────
export const adminGroupApi = {
  getAll: ()         => api.get('/admin-groups/get'),
  create: (data)     => api.post('/admin-groups/create', data),
  update: (id, data) => api.put(`/admin-groups/update/${id}`, data),
  remove: (id)       => api.delete(`/admin-groups/delete/${id}`),
};

// ── Services ──────────────────────────────────────────────────────────────────
export const serviceApi = {
  getAll: ()         => api.get('/services/get'),
  create: (data)     => api.post('/services/create', data),
  update: (id, data) => api.put(`/services/update/${id}`, data),
  remove: (id)       => api.delete(`/services/delete/${id}`),
};

// ── Permissions ───────────────────────────────────────────────────────────────
export const permissionApi = {
  getAll: ()         => api.get('/permissions/get'),
  create: (data)     => api.post('/permissions/create', data),
  update: (id, data) => api.put(`/permissions/update/${id}`, data),
  remove: (id)       => api.delete(`/permissions/delete/${id}`),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  stats:  () => api.get('/admin/stats'),
  // Fetches the live route registry from the server so the dashboard
  // never falls out of sync when new endpoints are added to the backend.
  routes: () => api.get('/admin/routes'),
};

export default api;
