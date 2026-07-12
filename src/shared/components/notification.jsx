function Notification({ message, type = 'success' }) {
  if (!message) return null
  return <div className={`fixed right-6 top-6 z-50 rounded-lg border px-4 py-3 text-sm font-semibold shadow-lg ${type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{message}</div>
}
export default Notification
