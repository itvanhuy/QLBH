import api from './api'

const dashboardService = {
  getStatistics: () => api.get('/dashboard/statistics'),
  getRevenue: (params) => api.get('/dashboard/revenue', { params }),
  getRevenueMonthly: (year) => api.get('/dashboard/revenue/monthly', { params: { year } }),
  getTopProducts: (limit = 10) => api.get('/dashboard/top-products', { params: { limit } }),
}

export default dashboardService
