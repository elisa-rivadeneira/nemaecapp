import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store/appStore'
import LoginPage from './pages/LoginPage'
import SelectComisariaPage from './pages/SelectComisariaPage'
import PartidasPage from './pages/PartidasPage'
import RegistrarAvancePage from './pages/RegistrarAvancePage'
import DashboardPage from './pages/DashboardPage'

function RequireAuth({ children }) {
  const usuario = useAppStore(s => s.usuario)
  if (!usuario) return <Navigate to="/login" replace />
  return children
}

function RequireComisaria({ children }) {
  const comisariaSeleccionada = useAppStore(s => s.comisariaSeleccionada)
  if (!comisariaSeleccionada) return <Navigate to="/comisaria" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/comisaria" element={<RequireAuth><SelectComisariaPage /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/partidas" element={<RequireAuth><RequireComisaria><PartidasPage /></RequireComisaria></RequireAuth>} />
        <Route path="/registrar" element={<RequireAuth><RequireComisaria><RegistrarAvancePage /></RequireComisaria></RequireAuth>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
