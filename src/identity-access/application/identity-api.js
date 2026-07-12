import api from '../../shared/infrastructure/api-client'
export const identityApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  verifyTwoFactor: (payload) => api.post('/auth/2fa/verificar', payload),
  setupTwoFactor: () => api.post('/auth/2fa/configurar'),
  enableTwoFactor: (codigo) => api.post('/auth/2fa/activar', { codigo }),
  changePassword: (payload) => api.put('/usuarios/password', payload),
  listUsers: () => api.get('/usuarios'),
  createUser: (payload) => api.post('/usuarios', payload),
  updateStatus: (id, estado) => api.put(`/usuarios/${id}/estado`, { estado }),
  accessHistory: () => api.get('/usuarios/accesos/historial'),
}
