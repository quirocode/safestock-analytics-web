import api from '../../shared/infrastructure/api-client'
export const analyticsApi = {
  summary: () => api.get('/dashboard/resumen'),
  advanced: (dias = 30) => api.get('/dashboard/avanzado', { params: { dias } }),
  stockAlerts: () => api.get('/alertas/stock'),
  suspiciousAlerts: () => api.get('/alertas/sospechosas'),
  exportSales: (params) => api.get('/reportes/ventas.csv', { params, responseType: 'blob' }),
}
