import api from './api'

const paymentService = {
  create: (data) => api.post('/payments', data),
  getById: (id) => api.get(`/payments/${id}`),
  getByOrderId: (orderId) => api.get(`/payments/order/${orderId}`),
  confirm: (id) => api.patch(`/payments/${id}/confirm`),
}

export default paymentService
