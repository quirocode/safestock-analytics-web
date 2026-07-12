import api from '../../shared/infrastructure/api-client'
export const subscriptionApi = {
  listPlans: () => api.get('/suscripcion/planes'),
  active: () => api.get('/suscripcion/actual'),
}
