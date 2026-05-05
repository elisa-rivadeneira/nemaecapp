import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import {
  ChevronLeft,
  Plus,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  Eye,
  Filter,
  Search
} from 'lucide-react'
import OfflineBanner from '../components/OfflineBanner'

export default function CuadernoListPage() {
  const navigate = useNavigate()
  const {
    comisariaSeleccionadaObj,
    comisariaSeleccionada,
    usuario,
    asientosCuaderno,
    cargarAsientosCuaderno
  } = useAppStore()
  const [filtroActivo, setFiltroActivo] = useState('todos') // todos, borradores, pendientes, firmados
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarDatos() {
      if (comisariaSeleccionada) {
        setLoading(true)
        await cargarAsientosCuaderno(comisariaSeleccionada)
        setLoading(false)
      }
    }
    cargarDatos()
  }, [comisariaSeleccionada])

  const asientosFiltrados = (asientosCuaderno || []).filter(asiento => {
    switch (filtroActivo) {
      case 'borradores':
        return asiento.estado === 'BORRADOR'
      case 'pendientes':
        return asiento.estado === 'PENDIENTE_FIRMAS'
      case 'firmados':
        return asiento.estado === 'COMPLETO_FIRMADO'
      default:
        return true
    }
  })

  const getEstadoConfig = (estado) => {
    switch (estado) {
      case 'BORRADOR':
        return {
          badge: 'Borrador',
          badgeColor: 'bg-gray-100 text-gray-700',
          accion: 'Continuar'
        }
      case 'PENDIENTE_FIRMAS':
        return {
          badge: 'Pendiente',
          badgeColor: 'bg-amber-100 text-amber-800',
          accion: 'Ver firmas'
        }
      case 'COMPLETO_FIRMADO':
        return {
          badge: 'Firmado',
          badgeColor: 'bg-green-100 text-green-800',
          accion: 'Ver detalles'
        }
      case 'OBSERVADO':
        return {
          badge: 'Observado',
          badgeColor: 'bg-red-100 text-red-800',
          accion: 'Ver observaciones'
        }
      default:
        return {
          badge: estado,
          badgeColor: 'bg-gray-100 text-gray-700',
          accion: 'Ver'
        }
    }
  }

  const formatFecha = (fechaISO) => {
    const fecha = new Date(fechaISO)
    const hoy = new Date()
    const ayer = new Date()
    ayer.setDate(ayer.getDate() - 1)

    if (fecha.toDateString() === hoy.toDateString()) {
      return `Hoy ${fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}pm`
    } else if (fecha.toDateString() === ayer.toDateString()) {
      return `Ayer ${fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}pm`
    } else {
      return fecha.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <OfflineBanner />

      {/* Header */}
      <div className="bg-amber-600 text-white px-4 pt-4 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate('/comisaria/modulos')}
            className="p-1.5 -ml-1.5 rounded-lg active:bg-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Cuaderno de obra</h1>
            <p className="text-amber-100 text-xs mt-0.5">
              {comisariaSeleccionadaObj?.nombre} · {comisariaSeleccionadaObj?.codigo}
            </p>
          </div>
          <button
            onClick={() => navigate('/cuaderno/nuevo')}
            className="p-2.5 bg-white/20 rounded-xl active:bg-white/30"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'todos', label: 'Todos', count: (asientosCuaderno || []).length },
            { key: 'pendientes', label: 'Pendientes', count: (asientosCuaderno || []).filter(a => a.estado === 'PENDIENTE_FIRMAS').length },
            { key: 'borradores', label: 'Borradores', count: (asientosCuaderno || []).filter(a => a.estado === 'BORRADOR').length },
            { key: 'firmados', label: 'Firmados', count: (asientosCuaderno || []).filter(a => a.estado === 'COMPLETO_FIRMADO').length }
          ].map(filtro => (
            <button
              key={filtro.key}
              onClick={() => setFiltroActivo(filtro.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filtroActivo === filtro.key
                  ? 'bg-white text-amber-700'
                  : 'bg-amber-700/30 text-amber-100 active:bg-amber-700/50'
              }`}
            >
              {filtro.label} ({filtro.count})
            </button>
          ))}
        </div>
      </div>

      {/* Botón Nuevo asiento del día */}
      <div className="px-4 -mt-3 mb-4">
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
                <p className="font-semibold">Nuevo asiento del día</p>
                <p className="text-xs text-white/80 mt-0.5">
                  Auto-precarga tus avances de hoy
                </p>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Lista de asientos */}
      <div className="flex-1 px-4 pb-6">
        {filtroActivo !== 'todos' && (
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            {filtroActivo}
          </p>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : asientosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">
              {filtroActivo === 'todos' ? 'No hay asientos registrados' : `No hay asientos en ${filtroActivo}`}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {filtroActivo === 'todos' ? 'Crea tu primer asiento del día' : 'Cambia el filtro para ver otros asientos'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Seccionar por estado */}
            {filtroActivo === 'todos' && (
              <>
                {/* Pendientes de firma */}
                {(asientosCuaderno || []).filter(a => a.estado === 'PENDIENTE_FIRMAS').length > 0 && (
                  <>
                    <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-2">
                      Pendientes de firma
                    </p>
                    {asientosCuaderno
                      .filter(a => a.estado === 'PENDIENTE_FIRMAS')
                      .map(asiento => (
                        <AsientoCard key={asiento.id} asiento={asiento} navigate={navigate} />
                      ))}
                  </>
                )}

                {/* Borradores */}
                {(asientosCuaderno || []).filter(a => a.estado === 'BORRADOR').length > 0 && (
                  <>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 mt-4">
                      Borradores
                    </p>
                    {asientosCuaderno
                      .filter(a => a.estado === 'BORRADOR')
                      .map(asiento => (
                        <AsientoCard key={asiento.id} asiento={asiento} navigate={navigate} />
                      ))}
                  </>
                )}

                {/* Firmados */}
                {(asientosCuaderno || []).filter(a => a.estado === 'COMPLETO_FIRMADO').length > 0 && (
                  <>
                    <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-2 mt-4">
                      Firmados
                    </p>
                    {asientosCuaderno
                      .filter(a => a.estado === 'COMPLETO_FIRMADO')
                      .map(asiento => (
                        <AsientoCard key={asiento.id} asiento={asiento} navigate={navigate} />
                      ))}
                  </>
                )}
              </>
            )}

            {/* Lista filtrada */}
            {filtroActivo !== 'todos' &&
              asientosFiltrados.map(asiento => (
                <AsientoCard key={asiento.id} asiento={asiento} navigate={navigate} />
              ))
            }
          </div>
        )}
      </div>
    </div>
  )
}

// Componente individual de asiento
function AsientoCard({ asiento, navigate }) {
  const getEstadoConfig = (estado) => {
    switch (estado) {
      case 'BORRADOR':
        return {
          badge: 'Borrador',
          badgeColor: 'bg-gray-100 text-gray-700',
          accion: 'Continuar'
        }
      case 'PENDIENTE_FIRMAS':
        return {
          badge: 'Pendiente',
          badgeColor: 'bg-amber-100 text-amber-800',
          accion: 'Ver firmas'
        }
      case 'COMPLETO_FIRMADO':
        return {
          badge: 'Firmado',
          badgeColor: 'bg-green-100 text-green-800',
          accion: 'Ver detalles'
        }
      case 'OBSERVADO':
        return {
          badge: 'Observado',
          badgeColor: 'bg-red-100 text-red-800',
          accion: 'Ver observaciones'
        }
      default:
        return {
          badge: estado,
          badgeColor: 'bg-gray-100 text-gray-700',
          accion: 'Ver'
        }
    }
  }

  const estadoConfig = getEstadoConfig(asiento.estado)

  const getIconoEstado = (estado) => {
    switch (estado) {
      case 'BORRADOR':
        return <Clock size={16} className="text-gray-500" />
      case 'PENDIENTE_FIRMAS':
        return <Users size={16} className="text-amber-600" />
      case 'COMPLETO_FIRMADO':
        return <CheckCircle size={16} className="text-green-600" />
      case 'OBSERVADO':
        return <AlertCircle size={16} className="text-red-600" />
      default:
        return <BookOpen size={16} className="text-gray-500" />
    }
  }

  const formatFecha = (fechaISO) => {
    const fecha = new Date(fechaISO)
    const hoy = new Date()
    const ayer = new Date()
    ayer.setDate(ayer.getDate() - 1)

    if (fecha.toDateString() === hoy.toDateString()) {
      return `Hoy ${fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}pm`
    } else if (fecha.toDateString() === ayer.toDateString()) {
      return `Ayer ${fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}pm`
    } else {
      return fecha.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  return (
    <button
      onClick={() => navigate(`/cuaderno/${asiento.id}`)}
      className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-left active:bg-gray-50 transition-colors"
    >
      <div className="flex gap-3">
        {/* Icono del estado */}
        <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
          {getIconoEstado(asiento.estado)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 text-sm">
                  Asiento N°{asiento.numero_asiento}
                </p>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${estadoConfig.badgeColor}`}>
                  {estadoConfig.badge}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {asiento.resumen}
              </p>
            </div>
            <Eye size={16} className="text-gray-400 flex-shrink-0" />
          </div>

          {/* Info del autor y fecha */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{asiento.autor_nombre} · {asiento.autor_rol}</span>
            <span>{formatFecha(asiento.fecha_creacion)}</span>
          </div>

          {/* Estado de firmas */}
          {asiento.estado === 'PENDIENTE_FIRMAS' && (
            <div className="flex gap-2 mt-2">
              <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                ✓ {asiento.firmas_completadas} firmadas
              </span>
              <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                ⏳ {asiento.firmas_pendientes} pendientes
              </span>
            </div>
          )}

          {asiento.estado === 'COMPLETO_FIRMADO' && (
            <div className="flex gap-2 mt-2">
              <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                ✓ {asiento.firmas_completadas} firmas RENIEC
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}