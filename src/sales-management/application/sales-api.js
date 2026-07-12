import api from '../../shared/infrastructure/api-client'
export const salesApi = {
  products: () => api.get('/productos'),
  register: (productos) => api.post('/ventas', { productos }),
  list: (params) => api.get('/ventas', { params }),
  cancel: (id, motivo) => api.put(`/ventas/${id}/anular`, { motivo }),
  receipt: (id) => api.get(`/ventas/${id}/comprobante`, { responseType: 'blob' }),
}
