import api from '../../shared/infrastructure/api-client'
export const inventoryApi = {
  list: () => api.get('/inventario'),
  movements: () => api.get('/inventario/movimientos'),
  register: (payload) => api.post('/inventario/movimientos', payload),
  bulkAdjust: (ajustes, motivo) => api.post('/inventario/ajustes-masivos', { ajustes, motivo }),
}
