import api from '../../shared/infrastructure/api-client'
export const analyticsApi = {
  summary: () => api.get('/dashboard/resumen'),
  advanced: (dias = 30) => api.get('/dashboard/avanzado', { params: { dias } }),
  consolidated: (params) => api.get('/dashboard/analitico', { params }),
  stockAlerts: () => api.get('/alertas/stock'),
  suspiciousAlerts: () => api.get('/alertas/sospechosas'),
  employeeRisk: (params) => api.get('/analytics/employee-risk', { params }),
  stockZeroAlerts: (params) => api.get('/alertas/stock-cero', { params }),
  exportSales: (params) => api.get('/reportes/ventas.csv', { params, responseType: 'blob' }),
}
