import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productApi } from '../application/product-api'

const initialForm = {
  sku: '',
  nombre: '',
  precio: '',
  stock: '',
}

function Catalogo() {
  const [searchParams] = useSearchParams()
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState(searchParams.get('search') || '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editForm, setEditForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchProductos = async () => {
    setIsLoading(true)
    try {
      const response = await productApi.list()
      setProductos(response.data || [])
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        'No se pudo cargar el catálogo de productos.'

      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    productApi.list().then((response) => setProductos(response.data || [])).catch((requestError) => setError(requestError.response?.data?.message || 'No se pudo cargar el catálogo de productos.')).finally(() => setIsLoading(false))
  }, [])

  const productosFiltrados = useMemo(() => {
    const criterio = busqueda.trim().toLowerCase()

    if (!criterio) {
      return productos
    }

    return productos.filter((producto) => {
      const nombre = String(producto.nombre || '').toLowerCase()
      const sku = String(producto.sku || '').toLowerCase()

      return nombre.includes(criterio) || sku.includes(criterio)
    })
  }, [busqueda, productos])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleEditInputChange = (event) => {
    const { name, value } = event.target
    setEditForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleCreateProduct = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      await productApi.create({
        sku: form.sku,
        nombre: form.nombre,
        precio: Number(form.precio),
        stock: Number(form.stock),
      })

      setSuccess('Producto registrado correctamente.')
      setForm(initialForm)
      setShowForm(false)
      await fetchProductos()
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        'No se pudo registrar el producto.'

      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (producto) => {
    const stockActual = Number(producto.stock_actual ?? producto.stock ?? 0)
    setEditingProduct(producto)
    setEditForm({
      sku: producto.sku || '',
      nombre: producto.nombre || '',
      precio: producto.precio || '',
      stock: String(stockActual),
    })
    setError('')
    setSuccess('')
  }

  const closeEditModal = () => {
    setEditingProduct(null)
    setEditForm(initialForm)
  }

  const handleUpdateProduct = async (event) => {
    event.preventDefault()

    if (!editingProduct) {
      return
    }

    setError('')
    setSuccess('')
    setIsUpdating(true)

    try {
      await productApi.update(editingProduct.id, {
        nombre: editForm.nombre,
        categoria: editingProduct.categoria || 'General',
        precio: Number(editForm.precio),
        stock: Number(editForm.stock),
      })

      closeEditModal()
      setSuccess('Producto actualizado correctamente.')
      await fetchProductos()
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        'No se pudo actualizar el producto.'

      setError(message)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteProduct = async (producto) => {
    setError('')
    setSuccess('')

    try {
      await productApi.remove(producto.id)
      setSuccess('Producto eliminado del catálogo activo.')
      await fetchProductos()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo eliminar el producto.')
    }
  }

  const handleImport = async (event) => {
    const archivo = event.target.files?.[0]
    if (!archivo) return
    setError('')
    try {
      const response = await productApi.importExcel(archivo)
      setSuccess(`${response.data.importados} productos importados correctamente.`)
      await fetchProductos()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo importar el archivo Excel.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Catálogo de productos
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestión de inventario conectada a PostgreSQL
          </p>
        </div>

        <div className="flex gap-3">
          <label className="cursor-pointer rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
            Importar Excel
            <input className="hidden" type="file" accept=".xlsx,.xls" onChange={handleImport} />
          </label>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700" onClick={() => setShowForm((value) => !value)} type="button">
            {showForm ? 'Cancelar' : '+ Nuevo producto'}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
          onSubmit={handleCreateProduct}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700" htmlFor="sku">
                SKU
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                id="sku"
                name="sku"
                onChange={handleInputChange}
                required
                value={form.sku}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700" htmlFor="nombre">
                Nombre
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                id="nombre"
                name="nombre"
                onChange={handleInputChange}
                required
                value={form.nombre}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700" htmlFor="precio">
                Precio
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                id="precio"
                min="0"
                name="precio"
                onChange={handleInputChange}
                required
                step="0.01"
                type="number"
                value={form.precio}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700" htmlFor="stock">
                Stock
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                id="stock"
                min="0"
                name="stock"
                onChange={handleInputChange}
                required
                step="1"
                type="number"
                value={form.stock}
              />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar producto'}
            </button>
          </div>
        </form>
      )}

      <div className="mb-6">
        <input
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Buscar por nombre o código SKU..."
          type="text"
          value={busqueda}
        />
      </div>

      {success && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 shadow-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 shadow-sm">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                {['SKU', 'Producto', 'Precio', 'Stock', 'Acciones'].map((header) => (
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide"
                    key={header}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white">
              {isLoading && (
                <tr>
                  <td className="px-6 py-6 text-sm text-gray-500" colSpan="5">
                    Cargando productos...
                  </td>
                </tr>
              )}

              {!isLoading && productosFiltrados.length === 0 && (
                <tr>
                  <td className="px-6 py-6 text-sm text-gray-500" colSpan="5">
                    No hay productos para mostrar.
                  </td>
                </tr>
              )}

              {!isLoading &&
                productosFiltrados.map((producto) => {
                  const stockActual = Number(producto.stock_actual ?? producto.stock ?? 0)
                  const precio = Number(producto.precio || 0)
                  const isLowStock = stockActual <= 10

                  return (
                    <tr
                      className="border-b border-gray-100 transition last:border-b-0 hover:bg-gray-50"
                      key={producto.id || producto.sku}
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                        {producto.sku}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {producto.nombre}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                        S/ {precio.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                        <span
                          className={[
                            'rounded-full px-2 py-1 text-xs font-semibold',
                            isLowStock
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800',
                          ].join(' ')}
                        >
                          {stockActual} {isLowStock ? 'bajo' : 'normal'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            className="rounded-lg px-3 py-2 font-semibold text-blue-700 transition hover:bg-blue-50 hover:text-blue-800"
                            onClick={() => openEditModal(producto)}
                            type="button"
                          >
                            Editar
                          </button>
                          <button
                            className="rounded-lg px-3 py-2 font-semibold text-red-700 transition hover:bg-red-50 hover:text-red-800"
                            onClick={() => handleDeleteProduct(producto)}
                            type="button"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </section>

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Editar producto
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  SKU {editForm.sku}
                </p>
              </div>
              <button
                className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100"
                onClick={closeEditModal}
                type="button"
              >
                Cerrar
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleUpdateProduct}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700" htmlFor="edit-sku">
                  SKU
                </label>
                <input
                  className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500"
                  disabled
                  id="edit-sku"
                  name="sku"
                  value={editForm.sku}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700" htmlFor="edit-nombre">
                  Producto
                </label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  id="edit-nombre"
                  name="nombre"
                  onChange={handleEditInputChange}
                  required
                  value={editForm.nombre}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700" htmlFor="edit-precio">
                    Precio
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    id="edit-precio"
                    min="0"
                    name="precio"
                    onChange={handleEditInputChange}
                    required
                    step="0.01"
                    type="number"
                    value={editForm.precio}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700" htmlFor="edit-stock">
                    Stock
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    id="edit-stock"
                    min="0"
                    name="stock"
                    onChange={handleEditInputChange}
                    required
                    step="1"
                    type="number"
                    value={editForm.stock}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  onClick={closeEditModal}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isUpdating}
                  type="submit"
                >
                  {isUpdating ? 'Actualizando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}

export default Catalogo
