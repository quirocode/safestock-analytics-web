import { useEffect, useMemo, useState } from 'react'
import { salesApi } from '../application/sales-api'

function VentasPOS() {
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [carrito, setCarrito] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await salesApi.products()
        setProductos(response.data || [])
      } catch (requestError) {
        const message =
          requestError.response?.data?.message ||
          'No se pudo cargar la lista de productos.'

        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductos()
  }, [])

  const productosFiltrados = useMemo(() => {
    const criterio = busqueda.trim().toLowerCase()

    if (!criterio) {
      return []
    }

    return productos
      .filter((producto) => {
        const nombre = String(producto.nombre || '').toLowerCase()
        const sku = String(producto.sku || '').toLowerCase()

        return nombre.includes(criterio) || sku.includes(criterio)
      })
      .slice(0, 6)
  }, [busqueda, productos])

  const totalCents = useMemo(
    () =>
      carrito.reduce(
        (acumulado, item) =>
          acumulado + Math.round(Number(item.producto.precio || 0) * 100) * item.cantidad,
        0,
      ),
    [carrito],
  )

  const subtotalCents = Math.round(totalCents / 1.18)
  const igvCents = totalCents - subtotalCents
  const total = totalCents / 100
  const subtotal = subtotalCents / 100
  const igv = igvCents / 100

  const formatCurrency = (value) => `S/ ${Number(value || 0).toFixed(2)}`

  const addProduct = (producto) => {
    setError('')
    setSuccess('')
    setCarrito((currentCart) => {
      const existingItem = currentCart.find((item) => item.producto.id === producto.id)

      if (existingItem) {
        return currentCart.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        )
      }

      return [...currentCart, { producto, cantidad: 1 }]
    })
    setBusqueda('')
  }

  const incrementItem = (productId) => {
    setCarrito((currentCart) =>
      currentCart.map((item) =>
        item.producto.id === productId
          ? { ...item, cantidad: item.cantidad + 1 }
          : item,
      ),
    )
  }

  const decrementItem = (productId) => {
    setCarrito((currentCart) =>
      currentCart
        .map((item) =>
          item.producto.id === productId
            ? { ...item, cantidad: item.cantidad - 1 }
            : item,
        )
        .filter((item) => item.cantidad > 0),
    )
  }

  const confirmSale = async () => {
    if (carrito.length === 0) {
      setError('Agrega al menos un producto antes de confirmar la venta.')
      return
    }

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      const productos = carrito.map((item) => ({
          productoId: item.producto.id,
          cantidad: item.cantidad,
        }))

      await salesApi.register(productos)
      setSuccess('Venta registrada correctamente. El stock fue actualizado.')
      setCarrito([])
      setBusqueda('')
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        'No se pudo registrar la venta.'

      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Registrar venta
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Terminal POS para registrar operaciones con descuento transaccional de stock.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 rounded-xl bg-white p-6 shadow-sm lg:col-span-8">
          <div className="mb-5">
            <label
              className="mb-2 block text-sm font-semibold text-gray-700"
              htmlFor="product-search"
            >
              Buscar producto
            </label>
            <div className="relative">
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <input
                className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                id="product-search"
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Escanear o buscar producto..."
                type="text"
                value={busqueda}
              />
            </div>
          </div>

          {busqueda && (
            <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
              {isLoading && (
                <div className="px-4 py-3 text-sm text-gray-500">
                  Cargando productos...
                </div>
              )}

              {!isLoading && productosFiltrados.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No se encontraron productos.
                </div>
              )}

              {!isLoading &&
                productosFiltrados.map((producto) => (
                  <button
                    className="flex w-full items-center justify-between border-b border-gray-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-gray-50"
                    key={producto.id}
                    onClick={() => addProduct(producto)}
                    type="button"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-gray-900">
                        {producto.nombre}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {producto.sku} | Stock {producto.stock_actual}
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {formatCurrency(producto.precio)}
                    </span>
                  </button>
                ))}
            </div>
          )}

          <div className="rounded-xl border border-gray-100">
            <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-700">
                Carrito actual
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {carrito.length === 0 && (
                <div className="px-4 py-10 text-center text-sm text-gray-500">
                  El carrito está vacío.
                </div>
              )}

              {carrito.map((item) => {
                const lineTotal = Number(item.producto.precio || 0) * item.cantidad

                return (
                  <div
                    className="flex items-center justify-between gap-4 px-4 py-4"
                    key={item.producto.id}
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.producto.nombre}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        x{item.cantidad} | {formatCurrency(item.producto.precio)} c/u
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center rounded-lg border border-gray-200">
                        <button
                          className="h-9 w-9 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                          onClick={() => decrementItem(item.producto.id)}
                          type="button"
                        >
                          -
                        </button>
                        <span className="min-w-9 border-x border-gray-200 px-3 text-center text-sm font-semibold text-gray-800">
                          {item.cantidad}
                        </span>
                        <button
                          className="h-9 w-9 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                          onClick={() => incrementItem(item.producto.id)}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                      <p className="w-28 text-right text-sm font-bold text-gray-900">
                        {formatCurrency(lineTotal)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <aside className="col-span-12 rounded-xl bg-white p-6 shadow-sm lg:col-span-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Resumen de pago
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Los precios ya incluyen IGV. El impuesto se muestra desglosado.
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">IGV (18%)</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(igv)}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-5">
              <div className="flex items-end justify-between">
                <span className="text-base font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-3xl font-bold text-gray-900">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>

          <button
            className="mt-8 flex w-full items-center justify-center rounded-lg bg-blue-600 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting || carrito.length === 0}
            onClick={confirmSale}
            type="button"
          >
            {isSubmitting ? 'Registrando venta...' : 'Confirmar venta'}
          </button>
        </aside>
      </div>
    </section>
  )
}

export default VentasPOS
