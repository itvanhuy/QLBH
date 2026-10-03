import api from './api'

const reservationService = {
  // Customer
  create:            (data)          => api.post('/reservations', data),
  getMy:             (params)        => api.get('/reservations/my', { params }),
  cancel:            (id)            => api.delete(`/reservations/${id}`),

  // Admin / Staff
  getAll:            (params)        => api.get('/reservations', { params }),
  getById:           (id)            => api.get(`/reservations/${id}`),
  updateStatus:      (id, body)      => api.patch(`/reservations/${id}/status`, body),
  checkIn:           (id, body)      => api.post(`/reservations/${id}/check-in`, body || {}),
}

export default reservationService
