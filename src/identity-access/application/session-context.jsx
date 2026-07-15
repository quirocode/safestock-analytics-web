import { useCallback, useEffect, useMemo, useState } from 'react'
import { identityApi } from './identity-api'
import { subscriptionApi } from '../../subscription-management/application/subscription-api'
import { SessionContext } from './session-store'

export function SessionProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('safestock_user') || 'null'))
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('safestock_token')))
  const logout = useCallback(() => {
    localStorage.removeItem('safestock_token'); localStorage.removeItem('safestock_user')
    setUser(null); setPlan(null); setLoading(false)
  }, [])
  const refresh = useCallback(async () => {
    const token = localStorage.getItem('safestock_token')
    if (!token) { setLoading(false); return false }
    setLoading(true)
    try {
      const [verification, subscription] = await Promise.all([identityApi.verify(), subscriptionApi.active()])
      const currentUser = verification.data.usuario
      setUser(currentUser); setPlan(subscription.data)
      localStorage.setItem('safestock_user', JSON.stringify(currentUser))
      return true
    } catch { logout(); return false } finally { setLoading(false) }
  }, [logout])
  useEffect(() => { const validate = async () => { await refresh() }; validate() }, [refresh])
  const value = useMemo(() => ({ user, plan, loading, refresh, logout, setUser, setPlan }), [user, plan, loading, refresh, logout])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
