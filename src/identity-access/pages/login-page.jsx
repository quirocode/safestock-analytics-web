import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { identityApi } from '../application/identity-api'
import { useSession } from '../application/session-store'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { refresh } = useSession()
  const [form, setForm] = useState({ correo: '', password: '', codigo: '' })
  const [challengeToken, setChallengeToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true)
    try {
      const response = challengeToken
        ? await identityApi.verifyTwoFactor({ challengeToken, codigo: form.codigo })
        : await identityApi.login({ correo: form.correo, password: form.password })
      if (response.data.requiresTwoFactor) { setChallengeToken(response.data.challengeToken); return }
      localStorage.setItem('safestock_token', response.data.token)
      localStorage.setItem('safestock_user', JSON.stringify(response.data.usuario))
      await refresh()
      navigate('/dashboard')
    } catch (e) { setError(e.response?.data?.message || 'No se pudo iniciar sesión.') }
    finally { setLoading(false) }
  }
  return <main className="grid min-h-screen bg-gray-100 lg:grid-cols-2">
    <section className="flex items-center justify-center px-6 py-12"><div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">SafeStock Analytics</p>
      <h1 className="mt-3 text-3xl font-bold text-gray-900">{challengeToken ? 'Verificación 2FA' : 'Acceso operativo'}</h1>
      <p className="mt-2 text-sm text-gray-500">{challengeToken ? 'Ingresa el código de seis dígitos de tu autenticador.' : 'Control seguro de ventas, inventario y auditoría.'}</p>
      {location.state?.message&&<p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{location.state.message}</p>}
      <form className="mt-8 space-y-5" onSubmit={submit}>
        {!challengeToken
          ? <><label className="block text-sm font-semibold text-gray-700">Correo<input className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" type="email" required value={form.correo} onChange={e=>setForm({...form,correo:e.target.value})}/></label><label className="block text-sm font-semibold text-gray-700">Contraseña<input className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label><Link className="block text-right text-sm font-semibold text-blue-700" to="/recuperar-password">¿Olvidaste tu contraseña?</Link></>
          : <input className="w-full rounded-lg border border-gray-300 px-4 py-4 text-center text-2xl font-bold tracking-[0.35em]" inputMode="numeric" maxLength="6" required value={form.codigo} onChange={e=>setForm({...form,codigo:e.target.value.replace(/\D/g,'')})}/>}
        {error&&<div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
        <button className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60" disabled={loading}>{loading?'Validando...':challengeToken?'Verificar código':'Iniciar sesión'}</button>
      </form>
      {!challengeToken && <p className="mt-6 text-center text-sm text-gray-600">¿No tienes una cuenta? <Link to="/registro" className="font-semibold text-blue-700 hover:text-blue-800">Regístrate aquí</Link></p>}
    </div></section>
    <aside className="hidden items-center bg-slate-900 p-14 text-white lg:flex"><div className="max-w-xl"><p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">DataNova Solutions</p><h2 className="mt-6 text-5xl font-bold leading-tight">Inventario confiable. Operaciones auditables.</h2><p className="mt-6 text-lg leading-8 text-slate-300">Detección temprana de riesgos, trazabilidad estricta y decisiones basadas en datos para MYPES.</p><div className="mt-10 grid grid-cols-3 gap-4">{['2FA seguro','Stock atómico','Auditoría real'].map(x=><div key={x} className="rounded-lg border border-slate-700 bg-slate-800 p-4 text-sm font-semibold">{x}</div>)}</div></div></aside>
  </main>
}
export default LoginPage
