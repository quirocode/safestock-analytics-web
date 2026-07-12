import { useEffect, useState } from 'react'
import { inventoryApi } from '../application/inventory-api'
import Notification from '../../shared/components/notification'

function InventoryPage() {
  const [products, setProducts] = useState([])
  const [movements, setMovements] = useState([])
  const [form, setForm] = useState({ productoId: '', tipoMovimiento: 'ENTRADA', cantidad: 1, motivo: '' })
  const [notice, setNotice] = useState({ message: '', type: 'success' })
  const load = async () => {
    try { const [stock, history] = await Promise.all([inventoryApi.list(), inventoryApi.movements()]); setProducts(stock.data); setMovements(history.data.movimientos || []) }
    catch (e) { setNotice({ message: e.response?.data?.message || 'No se pudo cargar inventario.', type: 'error' }) }
  }
  useEffect(() => { Promise.all([inventoryApi.list(), inventoryApi.movements()]).then(([stock, history]) => { setProducts(stock.data); setMovements(history.data.movimientos || []) }).catch((e) => setNotice({ message: e.response?.data?.message || 'No se pudo cargar inventario.', type: 'error' })) }, [])
  const submit = async (event) => { event.preventDefault(); try { await inventoryApi.register({ ...form, cantidad: Number(form.cantidad) }); setNotice({ message: 'Movimiento registrado.', type: 'success' }); await load() } catch (e) { setNotice({ message: e.response?.data?.message || 'No se pudo registrar.', type: 'error' }) } }
  return <section>
    <Notification {...notice} />
    <div className="mb-6"><p className="text-xs font-semibold uppercase text-blue-600">Trazabilidad operativa</p><h1 className="mt-2 text-2xl font-semibold text-gray-900">Control de inventario</h1></div>
    <form onSubmit={submit} className="grid gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-md md:grid-cols-5">
      <select className="rounded-lg border border-gray-300 px-3 py-2 md:col-span-2" value={form.productoId} onChange={(e)=>setForm({...form,productoId:e.target.value})} required><option value="">Selecciona producto</option>{products.map(p=><option key={p.id} value={p.id}>{p.sku} - {p.nombre} ({p.stock_actual})</option>)}</select>
      <select className="rounded-lg border border-gray-300 px-3 py-2" value={form.tipoMovimiento} onChange={(e)=>setForm({...form,tipoMovimiento:e.target.value})}><option>ENTRADA</option><option>SALIDA</option></select>
      <input className="rounded-lg border border-gray-300 px-3 py-2" type="number" min="1" value={form.cantidad} onChange={(e)=>setForm({...form,cantidad:e.target.value})}/>
      <button className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Registrar movimiento</button>
    </form>
    <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-md"><table className="min-w-full"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{['Fecha','Producto','Tipo','Cantidad','Responsable'].map(h=><th key={h} className="px-5 py-3 text-left">{h}</th>)}</tr></thead><tbody>{movements.map(m=><tr key={m.id} className="border-t border-gray-100"><td className="px-5 py-3 text-sm">{new Date(m.fecha_hora).toLocaleString('es-PE')}</td><td className="px-5 py-3 text-sm font-medium">{m.producto_sku} - {m.producto_nombre}</td><td className="px-5 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${m.tipo_movimiento==='ENTRADA'?'bg-emerald-100 text-emerald-800':'bg-amber-100 text-amber-800'}`}>{m.tipo_movimiento}</span></td><td className="px-5 py-3 text-sm">{m.cantidad}</td><td className="px-5 py-3 text-sm">{m.usuario_nombres} {m.usuario_apellidos}</td></tr>)}</tbody></table></div>
  </section>
}
export default InventoryPage
