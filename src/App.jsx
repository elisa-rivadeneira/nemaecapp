import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store/appStore'
import LoginPage from './pages/LoginPage'
import SelectComisariaPage from './pages/SelectComisariaPage'
import ComisariaModulosPage from './pages/ComisariaModulosPage'
import PartidasPage from './pages/PartidasPage'
import RegistrarAvancePage from './pages/RegistrarAvancePage'
import VerificarAvancePage from './pages/VerificarAvancePage'
import HistorialAvancesPage from './pages/HistorialAvancesPage'
import EditarAvancePage from './pages/EditarAvancePage'
import DashboardPage from './pages/DashboardPage'
import CuadernoListPage from './pages/CuadernoListPage'
import AsientoNuevoPage from './pages/AsientoNuevoPage'
import AsientoDetallePage from './pages/AsientoDetallePage'
import InformesPage from './pages/InformesPage'
import ValidacionesComisarioPage from './pages/ValidacionesComisarioPage'

function RequireAuth({ children }) {
  const usuario = useAppStore(s => s.usuario)
  if (!usuario) return <Navigate to="/login" replace />
  return children
}

function RequireComisaria({ children }) {
  const comisariaSeleccionada = useAppStore(s => s.comisariaSeleccionada)
  if (!comisariaSeleccionada) return <Navigate to="/comisarias" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/comisarias" element={<RequireAuth><SelectComisariaPage /></RequireAuth>} />
        <Route path="/comisaria/modulos" element={<RequireAuth><RequireComisaria><ComisariaModulosPage /></RequireComisaria></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/partidas" element={<RequireAuth><RequireComisaria><PartidasPage /></RequireComisaria></RequireAuth>} />
        <Route path="/partidas/registrar" element={<RequireAuth><RequireComisaria><RegistrarAvancePage /></RequireComisaria></RequireAuth>} />
        <Route path="/partidas/historial" element={<RequireAuth><RequireComisaria><HistorialAvancesPage /></RequireComisaria></RequireAuth>} />
        <Route path="/partidas/editar" element={<RequireAuth><RequireComisaria><EditarAvancePage /></RequireComisaria></RequireAuth>} />
        <Route path="/registrar" element={<RequireAuth><RequireComisaria><RegistrarAvancePage /></RequireComisaria></RequireAuth>} />
        <Route path="/verificar" element={<RequireAuth><RequireComisaria><VerificarAvancePage /></RequireComisaria></RequireAuth>} />

        {/* Rutas del Cuaderno */}
        <Route path="/cuaderno" element={<RequireAuth><RequireComisaria><CuadernoListPage /></RequireComisaria></RequireAuth>} />
        <Route path="/cuaderno/nuevo" element={<RequireAuth><RequireComisaria><AsientoNuevoPage /></RequireComisaria></RequireAuth>} />
        <Route path="/cuaderno/editar/:id" element={<RequireAuth><RequireComisaria><AsientoNuevoPage /></RequireComisaria></RequireAuth>} />
        <Route path="/cuaderno/:id" element={<RequireAuth><RequireComisaria><AsientoDetallePage /></RequireComisaria></RequireAuth>} />

        {/* Ruta de Informes */}
        <Route path="/informes" element={<RequireAuth><RequireComisaria><InformesPage /></RequireComisaria></RequireAuth>} />

        {/* Ruta de Validaciones del Comisario */}
        <Route path="/validaciones-comisario" element={<RequireAuth><RequireComisaria><ValidacionesComisarioPage /></RequireComisaria></RequireAuth>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
