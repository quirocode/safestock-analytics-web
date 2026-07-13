import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './identity-access/interfaces/protected-route'
import LoginPage from './identity-access/pages/login-page'
import UsersPage from './identity-access/pages/users-page'
import SettingsPage from './identity-access/pages/settings-page'
import ProductCatalogPage from './product-catalog/pages/product-catalog-page'
import InventoryPage from './inventory-management/pages/inventory-page'
import PosPage from './sales-management/pages/pos-page'
import SalesHistoryPage from './sales-management/pages/sales-history-page'
import DashboardPage from './monitoring-analytics/pages/dashboard-page'
import AnalyticsDashboardPage from './monitoring-analytics/pages/analytics-dashboard-page'
import PasswordRecoveryPage from './identity-access/pages/password-recovery-page'
import SubscriptionPage from './subscription-management/pages/subscription-page'
import RegistrationPage from './identity-access/pages/registration-page'
import { SessionProvider } from './identity-access/application/session-context'

function App(){return <BrowserRouter><SessionProvider><Routes><Route path="/" element={<Navigate to="/login" replace/>}/><Route path="/login" element={<LoginPage/>}/><Route path="/registro" element={<RegistrationPage/>}/><Route path="/recuperar-password" element={<PasswordRecoveryPage/>}/><Route element={<ProtectedRoute/>}><Route element={<Layout/>}><Route path="/dashboard" element={<DashboardPage/>}/><Route path="/analitica" element={<AnalyticsDashboardPage/>}/><Route path="/catalogo" element={<ProductCatalogPage/>}/><Route path="/inventario" element={<InventoryPage/>}/><Route path="/pos" element={<PosPage/>}/><Route path="/ventas" element={<SalesHistoryPage/>}/><Route path="/usuarios" element={<UsersPage/>}/><Route path="/configuracion" element={<SettingsPage/>}/><Route path="/suscripcion" element={<SubscriptionPage/>}/></Route></Route><Route path="*" element={<Navigate to="/login" replace/>}/></Routes></SessionProvider></BrowserRouter>}
export default App
