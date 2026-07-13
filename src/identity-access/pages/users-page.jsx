import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { identityApi } from '../application/identity-api'
import { useSession } from '../application/session-store'
import Notification from '../../shared/components/notification'

const initial = { nombres: '', apellidos: '', correo: '', password: '', rol: 'VENDEDOR' }

function UsersPage() {
  const navigate = useNavigate()
  const { user: currentUser, logout } = useSession()
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(initial)
  const [open, setOpen] = useState(false)
  const [notice, setNotice] = useState({ message: '', type: 'success' })
  const [security, setSecurity] = useState(null)
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try { setUsers((await identityApi.listUsers()).data) }
    catch (error) { setNotice({ message: error.response?.data?.message || 'No se pudieron cargar los usuarios.', type: 'error' }) }
  }
  useEffect(() => {
    identityApi.listUsers()
      .then(response => setUsers(response.data))
      .catch(error => setNotice({ message: error.response?.data?.message || 'No se pudieron cargar los usuarios.', type: 'error' }))
  }, [])

  const create = async (event) => {
    event.preventDefault()
    try {
      await identityApi.createUser(form)
      setForm(initial); setOpen(false)
      setNotice({ message: 'Empleado creado correctamente.', type: 'success' })
      load()
    } catch (error) { setNotice({ message: error.response?.data?.message || 'No se pudo crear el empleado.', type: 'error' }) }
  }

  const executeStateChange = async (target, estado, authorizationPassword) => {
    setSubmitting(true)
    try {
      await identityApi.updateStatus(target.id, estado, authorizationPassword)
      if (String(target.id) === String(currentUser?.id) && estado !== 'activo') {
        logout()
        navigate('/login', { replace: true, state: { message: 'Tu cuenta fue desactivada y la sesión se cerró correctamente.' } })
        return
      }
      setNotice({ message: `Usuario ${estado} correctamente.`, type: 'success' })
      setSecurity(null); setPassword(''); await load()
    } catch (error) {
      setNotice({ message: error.response?.data?.message || 'No se pudo actualizar el usuario.', type: 'error' })
    } finally { setSubmitting(false) }
  }

  const requestStateChange = (target, estado) => {
    if (String(target.id) === String(currentUser?.id) && estado !== 'activo') {
      setPassword(''); setSecurity({ target, estado }); return
    }
    executeStateChange(target, estado)
  }

  return <section>
    <Notification {...notice} />
    <div className="mb-6 flex items-center justify-between"><div><h1 className="text-2xl font-semibold text-gray-900">Gestión de empleados</h1><p className="mt-1 text-sm text-gray-500">Roles, bloqueo administrativo y acceso 2FA.</p></div><button onClick={() => setOpen(!open)} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">{open ? 'Cancelar' : '+ Nuevo empleado'}</button></div>
    {open && <form onSubmit={create} className="mb-6 grid gap-4 rounded-lg bg-white p-6 shadow-md md:grid-cols-3">{['nombres', 'apellidos', 'correo', 'password'].map(name => <input key={name} className="rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" type={name === 'password' ? 'password' : name === 'correo' ? 'email' : 'text'} placeholder={name === 'password' ? 'Contraseña' : name[0].toUpperCase() + name.slice(1)} minLength={name === 'password' ? 8 : 2} required value={form[name]} onChange={event => setForm({ ...form, [name]: event.target.value })} />)}<select className="rounded-lg border border-gray-300 px-4 py-3" value={form.rol} onChange={event => setForm({ ...form, rol: event.target.value })}><option>VENDEDOR</option><option>ADMIN</option><option>AUDITOR</option></select><button className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700">Guardar empleado</button></form>}
    <div className="overflow-x-auto rounded-lg bg-white shadow-md"><table className="min-w-full"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{['Empleado', 'Correo', 'Rol', '2FA', 'Estado', 'Acciones'].map(header => <th key={header} className="px-5 py-3 text-left">{header}</th>)}</tr></thead><tbody>{users.map(user => <tr key={user.id} className="border-t border-gray-100"><td className="px-5 py-4 font-semibold">{user.nombres} {user.apellidos}{String(user.id) === String(currentUser?.id) && <span className="ml-2 text-xs text-blue-600">Tú</span>}</td><td className="px-5 py-4 text-sm">{user.correo}</td><td className="px-5 py-4 text-sm">{user.rol_nombre}</td><td className="px-5 py-4 text-sm">{user.two_factor_enabled ? 'Activo' : 'No'}</td><td className="px-5 py-4"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${user.estado === 'activo' ? 'bg-emerald-100 text-emerald-800' : user.estado === 'bloqueado' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}`}>{user.estado}</span></td><td className="space-x-2 px-5 py-4"><button onClick={() => requestStateChange(user, user.estado === 'activo' ? 'inactivo' : 'activo')} className="rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-gray-100">{user.estado === 'activo' ? 'Desactivar' : 'Activar'}</button><button onClick={() => requestStateChange(user, 'bloqueado')} disabled={user.estado === 'bloqueado'} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">Bloquear</button></td></tr>)}</tbody></table></div>
    {security && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" role="dialog" aria-modal="true" aria-labelledby="security-title"><form onSubmit={event => { event.preventDefault(); executeStateChange(security.target, security.estado, password) }} className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-700">!</div><h2 id="security-title" className="text-xl font-bold text-gray-900">Confirmación de seguridad requerida</h2><p className="mt-2 text-sm leading-6 text-gray-600">Vas a {security.estado === 'bloqueado' ? 'bloquear' : 'desactivar'} tu propia cuenta. Ingresa tu contraseña para autorizar esta acción.</p><label className="mt-5 block text-sm font-semibold text-gray-700">Contraseña<input autoFocus type="password" required value={password} onChange={event => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" /></label><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => { setSecurity(null); setPassword('') }} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100">Cancelar</button><button disabled={submitting} className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-60">{submitting ? 'Validando...' : 'Confirmar'}</button></div></form></div>}
  </section>
}

export default UsersPage
