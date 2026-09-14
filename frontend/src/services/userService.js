import api from './api'

const userService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  lock: (id) => api.patch(`/users/${id}/lock`),
  unlock: (id) => api.patch(`/users/${id}/unlock`),
  changeRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
}

export default userService
