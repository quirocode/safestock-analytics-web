import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { identityApi } from '../application/identity-api'
import { useSession } from '../application/session-store'

const initial = { nombreEmpresa: '', nombreAdministrador: '', correo: '', password: '' }

function RegistrationPage() {
  const navigate = useNavigate()
  const { refresh } = useSession()
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault(); setError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) { setError('Ingresa un correo electrónico válido.'); return }
    if (form.password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }
    setLoading(true)
    try {
      const response = await identityApi.register(form)
      localStorage.setItem('safestock_token', response.data.token)
      localStorage.setItem('safestock_user', JSON.stringify(response.data.usuario))
      await refresh()
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo completar la creación de la cuenta.')
    } finally { setLoading(false) }
  }

  return <main className="grid min-h-screen bg-gray-100 lg:grid-cols-2">
    <section className="flex items-center justify-center px-6 py-12"><div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">SafeStock Analytics</p><h1 className="mt-3 text-3xl font-bold text-gray-900">Crea tu empresa</h1><p className="mt-2 text-sm text-gray-500">Comienza con el plan Emprendedor por S/ 29 al mes.</p>
      <form className="mt-8 grid gap-5" onSubmit={submit}>
        <label className="text-sm font-semibold text-gray-700">Nombre de la empresa<input autoFocus className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" required minLength="2" value={form.nombreEmpresa} onChange={event => setForm({ ...form, nombreEmpresa: event.target.value })} /></label>
        <label className="text-sm font-semibold text-gray-700">Nombre del administrador<input className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" required minLength="2" value={form.nombreAdministrador} onChange={event => setForm({ ...form, nombreAdministrador: event.target.value })} /></label>
        <label className="text-sm font-semibold text-gray-700">Correo electrónico<input className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" type="email" required value={form.correo} onChange={event => setForm({ ...form, correo: event.target.value })} /></label>
        <label className="text-sm font-semibold text-gray-700">Contraseña<input className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" type="password" required minLength="8" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} /><span className="mt-1 block text-xs font-normal text-gray-500">Mínimo 8 caracteres.</span></label>
        {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
        <button disabled={loading} className="rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{loading ? 'Creando cuenta...' : 'Registrarse'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">¿Ya tienes una cuenta? <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800">Inicia sesión</Link></p>
    </div></section>
    <aside className="hidden items-center bg-slate-900 p-14 text-white lg:flex"><div className="max-w-xl"><p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">Creación segura</p><h2 className="mt-6 text-5xl font-bold leading-tight">Tu operación, lista para crecer.</h2><p className="mt-6 text-lg leading-8 text-slate-300">Configura tu organización y administra ventas, productos e inventario desde una plataforma auditable.</p><div className="mt-10 rounded-xl border border-slate-700 bg-slate-800 p-6"><p className="font-semibold">Plan Emprendedor incluido</p><p className="mt-2 text-sm leading-6 text-slate-300">1 local, hasta 2 usuarios y alertas visuales de stock.</p></div></div></aside>
  </main>
}

export default RegistrationPage
