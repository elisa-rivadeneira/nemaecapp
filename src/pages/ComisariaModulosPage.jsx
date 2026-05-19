import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import {
  ChevronLeft,
  ClipboardList,
  BookOpen,
  FileText,
  Calendar,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Shield,
  BarChart3
} from 'lucide-react'
import OfflineBanner from '../components/OfflineBanner'

export default function ComisariaModulosPage() {
  const navigate = useNavigate()
  const {
    usuario,
    comisariaSeleccionadaObj,
    comisariaSeleccionada,
    getResumenComisaria
  } = useAppStore()

  useEffect(() => {
    if (!comisariaSeleccionada) {
      navigate('/comisarias')
    }
  }, [comisariaSeleccionada])

  const resumen = getResumenComisaria(comisariaSeleccionada)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <OfflineBanner />

      {/* Header con datos de comisaría */}
      <div className="bg-brand-700 text-white px-4 pt-4 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate('/comisarias')}
            className="p-1.5 -ml-1.5 rounded-lg active:bg-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold leading-tight">
              {comisariaSeleccionadaObj?.nombre || 'Comisaría'}
            </h1>
            <p className="text-blue-200 text-xs mt-0.5">
              {comisariaSeleccionadaObj?.codigo} · Avance {resumen.avanceGeneral}%
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="bg-blue-900/30 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-blue-200">Progreso general</span>
            <span className="text-sm font-bold">{resumen.avanceGeneral}%</span>
          </div>
          <div className="h-2 bg-blue-900/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-300 rounded-full transition-all"
              style={{ width: `${resumen.avanceGeneral}%` }}
            />
          </div>
          <div className="flex gap-3 mt-2 text-[10px]">
            <span className="text-green-200">{resumen.completadas} completadas</span>
            <span className="text-yellow-200">{resumen.enCurso} en curso</span>
            <span className="text-blue-300">{resumen.sinIniciar} sin iniciar</span>
          </div>
        </div>
      </div>

      {/* Sección de Módulos */}
      <div className="px-4 -mt-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Módulos
        </p>

        <div className="space-y-3">
          {/* Card Avances - Para Monitor y Residente */}
          {(usuario?.rol === 'monitor' || usuario?.rol === 'residente') && (
            <button
              onClick={() => navigate('/partidas')}
              className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 active:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ClipboardList className="text-blue-700" size={24} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {usuario?.rol === 'residente' ? 'Registrar Avances' : 'Validar Avances'}
                    </h3>
                    <ArrowRight size={18} className="text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {resumen.totalPartidas} partidas
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      {resumen.completadas} completadas
                    </span>
                    <span className="text-[10px] text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                      {resumen.enCurso} en curso
                    </span>
                  </div>
                </div>
              </div>
            </button>
          )}

          {/* Card Validaciones - Para Comisario */}
          {usuario?.rol === 'comisario' && (
            <button
              onClick={() => navigate('/validaciones-comisario')}
              className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 active:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Shield className="text-green-700" size={24} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Validaciones Pendientes</h3>
                    <ArrowRight size={18} className="text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Partidas completadas al 100%
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      3 pendientes
                    </span>
                  </div>
                </div>
              </div>
            </button>
          )}

          {/* Card Dashboard - Para Coordinador */}
          {usuario?.rol === 'coordinador' && (
            <button
              onClick={() => window.open('http://localhost:3000/dashboard-coordinador', '_blank')}
              className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 active:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="text-purple-700" size={24} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Dashboard Ejecutivo</h3>
                    <ArrowRight size={18} className="text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Vista nacional en tiempo real
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                      132 comisarías
                    </span>
                  </div>
                </div>
              </div>
            </button>
          )}

          {/* Card Cuaderno de Obra - NUEVO */}
          <button
            onClick={() => navigate('/cuaderno')}
            className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 active:bg-gray-50 transition-colors relative overflow-hidden"
          >
            {/* Badge NUEVO */}
            <div className="absolute top-3 right-3">
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                NUEVO
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <BookOpen className="text-amber-700" size={24} />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Cuaderno de obra</h3>
                  <ArrowRight size={18} className="text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  12 asientos firmados
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    2 pendientes de firma
                  </span>
                </div>
              </div>
            </div>
          </button>

          {/* Card Informes con IA - Habilitado */}
          <button
            onClick={() => navigate('/informes')}
            className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 active:bg-gray-50 transition-colors relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
              <Sparkles size={10} />
              CON IA
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <FileText className="text-purple-700" size={24} />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Informes Inteligentes</h3>
                  <ArrowRight size={18} className="text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Genera informes {usuario?.rol === 'monitor' ? 'de monitoría' : 'de residencia'}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                    Semanal/Mensual
                  </span>
                  <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    Asistente IA
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Sección HOY - Acceso rápido */}
      <div className="px-4 mt-6 pb-6">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Hoy
        </p>

        <button
          onClick={() => navigate('/cuaderno/nuevo')}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-4 shadow-lg active:scale-95 transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Plus size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold">Cerrar día</p>
                <p className="text-xs text-white/80 mt-0.5">
                  Genera asiento con tus avances de hoy
                </p>
              </div>
            </div>
            <ArrowRight size={20} className="text-white/60" />
          </div>
        </button>

        {/* Resumen del día */}
        <div className="mt-4 bg-white rounded-xl p-3 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-700">
                {new Date().toLocaleDateString('es-PE', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-green-50 rounded-lg py-2">
              <CheckCircle size={16} className="text-green-600 mx-auto mb-1" />
              <p className="text-[10px] text-gray-600">3 avances</p>
            </div>
            <div className="bg-amber-50 rounded-lg py-2">
              <Clock size={16} className="text-amber-600 mx-auto mb-1" />
              <p className="text-[10px] text-gray-600">Sin cerrar</p>
            </div>
            <div className="bg-blue-50 rounded-lg py-2">
              <AlertCircle size={16} className="text-blue-600 mx-auto mb-1" />
              <p className="text-[10px] text-gray-600">2 consultas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}