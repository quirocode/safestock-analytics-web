import { Navigate, Outlet } from 'react-router-dom'
function ProtectedRoute(){return localStorage.getItem('safestock_token')?<Outlet/>:<Navigate to="/" replace/>}
export default ProtectedRoute
