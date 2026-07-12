import api from '../../shared/infrastructure/api-client'
export const productApi = {
  list: (params) => api.get('/productos', { params }),
  create: (payload) => api.post('/productos', payload),
  update: (id, payload) => api.put(`/productos/${id}`, payload),
  remove: (id) => api.delete(`/productos/${id}`),
  importExcel: (archivo) => {
    const data = new FormData()
    data.append('archivo', archivo)
    return api.post('/productos/importar', data)
  },
}
