import { useEffect, useState } from 'react'
import Notification from '../../shared/components/notification'
import { useSession } from '../../identity-access/application/session-store'
import { subscriptionApi } from '../application/subscription-api'

const planFeatures = (plan) => {
  if (plan.codigo === 'EMPRENDEDOR') {
    return [
      '1 local',
      'Hasta 2 usuarios',
      'Panel antifraude básico',
      'Alertas visuales de stock',
      'Soporte correo',
    ]
  }

  return [
    plan.maxLocales ? `${plan.maxLocales} local${plan.maxLocales > 1 ? 'es' : ''}` : 'Locales ilimitados',
    plan.maxUsuarios ? `Hasta ${plan.maxUsuarios} usuarios` : 'Usuarios ilimitados',
    plan.antifraudeHabilitado ? 'Control antifraude' : 'Alertas visuales de stock',
    plan.dashboardActividades ? 'Historial completo' : 'Operación esencial',
    `Soporte ${String(plan.nivelSoporte || '').replaceAll('_', ' ').toLowerCase()}`,
  ]
}
function SubscriptionPage() {
  const { plan: activePlan, setPlan, refresh } = useSession()
  const [plans, setPlans] = useState([])
  const [loadingCode, setLoadingCode] = useState('')
  const [notice, setNotice] = useState({ message: '', type: 'success' })
  const [error, setError] = useState('')

  useEffect(() => {
    subscriptionApi
      .listPlans()
      .then((response) => setPlans(response.data))
      .catch((err) => setError(err.response?.data?.message || 'No se pudieron cargar los planes.'))
  }, [])

  useEffect(() => {
    if (!notice.message) return undefined
    const timer = window.setTimeout(() => setNotice({ message: '', type: 'success' }), 3000)
    return () => window.clearTimeout(timer)
  }, [notice.message])

  const changePlan = async (planCode) => {
    setError('')
    setLoadingCode(planCode)
    try {
      const response = await subscriptionApi.changeCurrentPlan(planCode)
      const updatedPlan = response.data.plan
      setPlan(updatedPlan)
      await refresh()
      setNotice({ message: response.data.message || 'Plan actualizado correctamente.', type: 'success' })
    } catch (err) {
      setNotice({ message: err.response?.data?.message || 'No se pudo actualizar el plan.', type: 'error' })
    } finally {
      setLoadingCode('')
    }
  }

  return (
    <section>
      <Notification {...notice} />
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">SuscripciÃ³n SaaS</p>
      <h1 className="mt-2 text-3xl font-bold text-gray-900">El plan adecuado para cada etapa</h1>
      <p className="mt-2 text-gray-500">
        Tu plan actual es <strong>{activePlan?.nombre || 'cargando...'}</strong>.
      </p>

      {error && <p className="mt-5 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const isActive = activePlan?.codigo === plan.codigo
          const isLoading = loadingCode === plan.codigo

          return (
            <article
              key={plan.codigo}
              className={`flex flex-col rounded-lg border bg-white p-6 shadow-md transition ${
                isActive ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold">{plan.nombre}</h2>
                {isActive && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                    Plan actual
                  </span>
                )}
              </div>

              <p className="mt-4 text-4xl font-bold">
                S/ {Number(plan.precioMensual).toFixed(0)}
                <span className="text-sm font-normal text-gray-500">/mes</span>
              </p>

              <ul className="mt-6 flex-1 space-y-3 text-sm text-gray-600">
                {planFeatures(plan).map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="text-emerald-600">âœ“</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={isActive || isLoading}
                title={isActive ? 'Este es tu plan actual' : `Cambiar al plan ${plan.nombre}`}
                onClick={() => changePlan(plan.codigo)}
                className={`mt-7 w-full rounded-lg py-3 font-semibold transition ${
                  isActive
                    ? 'cursor-not-allowed bg-gray-200 text-gray-600'
                    : 'cursor-pointer bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md'
                } ${isLoading ? 'cursor-wait opacity-80' : ''}`}
              >
                {isActive ? 'Plan activo' : isLoading ? 'Actualizando...' : 'Solicitar cambio'}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default SubscriptionPage

