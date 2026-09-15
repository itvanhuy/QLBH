import api from './api'

const orderService = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getActiveByTableId: (tableId) => api.get(`/orders/table/${tableId}/active`),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  transferTable: (id, tableId) => api.patch(`/orders/${id}/transfer`, { tableId }),
  delete: (id) => api.delete(`/orders/${id}`),
}

export default orderService
