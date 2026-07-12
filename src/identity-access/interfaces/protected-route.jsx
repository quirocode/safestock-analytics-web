import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '../application/session-store'
function ProtectedRoute(){const{user,loading}=useSession();if(loading)return <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm font-semibold text-gray-600">Validando sesión...</div>;return user?<Outlet/>:<Navigate to="/login" replace/>}
export default ProtectedRoute
