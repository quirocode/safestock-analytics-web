import { BrowserRouter, Route, Routes } from 'react-router-dom'
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

function App(){return <BrowserRouter><Routes><Route path="/" element={<LoginPage/>}/><Route element={<ProtectedRoute/>}><Route element={<Layout/>}><Route path="/dashboard" element={<DashboardPage/>}/><Route path="/catalogo" element={<ProductCatalogPage/>}/><Route path="/inventario" element={<InventoryPage/>}/><Route path="/pos" element={<PosPage/>}/><Route path="/ventas" element={<SalesHistoryPage/>}/><Route path="/usuarios" element={<UsersPage/>}/><Route path="/configuracion" element={<SettingsPage/>}/></Route></Route><Route path="*" element={<LoginPage/>}/></Routes></BrowserRouter>}
export default App
