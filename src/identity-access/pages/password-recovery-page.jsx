import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { identityApi } from '../application/identity-api'

function PasswordRecoveryPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ correo: '', codigo: '', passwordNueva: '', confirmar: '' })
  const [resetToken, setResetToken] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (event) => {
    event.preventDefault(); setError(''); setMessage(''); setLoading(true)
    try {
      if (step === 1) {
        const response = await identityApi.requestRecovery(form.correo)
        setMessage(response.data.codigoSimulado ? `Entorno local: código ${response.data.codigoSimulado}` : 'Revisa tu correo electrónico.')
        setStep(2)
      } else if (step === 2) {
        const response = await identityApi.verifyRecoveryCode({ correo: form.correo, codigo: form.codigo })
        setResetToken(response.data.resetToken); setStep(3)
      } else {
        if (form.passwordNueva !== form.confirmar) throw new Error('Las contraseñas no coinciden.')
        await identityApi.resetPassword({ resetToken, passwordNueva: form.passwordNueva })
        navigate('/login', { replace: true, state: { message: 'Contraseña actualizada. Ya puedes iniciar sesión.' } })
      }
    } catch (requestError) { setError(requestError.response?.data?.message || requestError.message || 'No se pudo completar la recuperación.') }
    finally { setLoading(false) }
  }
  return <main className="flex min-h-screen items-center justify-center bg-gray-100 px-5"><section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">SafeStock Analytics</p><h1 className="mt-3 text-2xl font-bold text-gray-900">Recuperar contraseña</h1><p className="mt-2 text-sm text-gray-500">Paso {step} de 3: {step===1?'identifica tu cuenta':step===2?'verifica el código':'crea una contraseña nueva'}.</p><form onSubmit={submit} className="mt-7 space-y-4">{step===1&&<input className="w-full rounded-lg border border-gray-300 px-4 py-3" type="email" placeholder="nombre@empresa.com" required value={form.correo} onChange={e=>setForm({...form,correo:e.target.value})}/>} {step===2&&<input className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-2xl font-bold tracking-[0.35em]" inputMode="numeric" maxLength="6" placeholder="000000" required value={form.codigo} onChange={e=>setForm({...form,codigo:e.target.value.replace(/\D/g,'')})}/>} {step===3&&<><input className="w-full rounded-lg border border-gray-300 px-4 py-3" type="password" minLength="8" placeholder="Nueva contraseña" required value={form.passwordNueva} onChange={e=>setForm({...form,passwordNueva:e.target.value})}/><input className="w-full rounded-lg border border-gray-300 px-4 py-3" type="password" minLength="8" placeholder="Confirmar contraseña" required value={form.confirmar} onChange={e=>setForm({...form,confirmar:e.target.value})}/></>}{message&&<p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{message}</p>}{error&&<p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white disabled:opacity-60" disabled={loading}>{loading?'Procesando...':step===1?'Enviar código':step===2?'Verificar código':'Cambiar contraseña'}</button></form><Link to="/login" className="mt-5 block text-center text-sm font-semibold text-blue-700">Volver al inicio de sesión</Link></section></main>
}
export default PasswordRecoveryPage
