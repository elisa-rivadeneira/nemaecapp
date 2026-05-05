import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import {
  ChevronLeft,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  User,
  Calendar,
  Hash,
  AlertTriangle,
  Download,
  Share,
  Edit3,
  Trash2
} from 'lucide-react'
import OfflineBanner from '../components/OfflineBanner'
import FirmaModal from '../components/FirmaModal'

export default function AsientoDetallePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { comisariaSeleccionadaObj, usuario, obtenerAsiento, firmarAsiento } = useAppStore()

  const [asiento, setAsiento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showFirmaModal, setShowFirmaModal] = useState(false)
  const [expandedSection, setExpandedSection] = useState(null)

  // Cargar asiento desde API
  useEffect(() => {
    async function cargarAsiento() {
      if (id) {
        setLoading(true)
        const asientoData = await obtenerAsiento(id)
        if (asientoData) {
          setAsiento(asientoData)
        } else {
          // Fallback con datos mock para demo
          const mockAsiento = {
      id: id,
      numero_asiento: 47,
      folio: '047',
      fecha_creacion: '2026-05-01T09:30:00',
      fecha_cierre: id === '1' ? null : '2026-05-01T17:45:00',
      tipo_asiento: 'diario',
      estado: id === '1' ? 'PENDIENTE_FIRMAS' : 'COMPLETO_FIRMADO',
      autor: {
        id: 1,
        nombre: 'Ing. Luis Callupe',
        rol: 'residente',
        email: 'lcallupe@nemaec.com'
      },
      resumen: 'Avances + ocurrencias del día',
      hash_contenido: 'a1b2c3d4e5f6789012345678901234567890abcd',
      hash_anterior: '9876543210fedcba0987654321abcdef12345678',

      // Contenido del asiento
      contenido: {
        datos_generales: {
          condiciones_climaticas: 'Soleado, 28°C',
          personal_presente: 15,
          equipos_operando: 'Excavadora, volquete, compactadora',
          observaciones_generales: 'Día productivo con buen avance en todas las actividades.'
        },
        avances_partidas: [
          {
            partida_id: 'P001',
            partida_nombre: 'Excavación masiva',
            unidad: 'm³',
            metrado_contrato: 1500.0,
            avance_anterior: 850.5,
            avance_dia: 125.3,
            avance_acumulado: 975.8,
            porcentaje: 65.1,
            observaciones: 'Excavación en zona rocosa, avance según cronograma'
          },
          {
            partida_id: 'P002',
            partida_nombre: 'Relleno compactado',
            unidad: 'm³',
            metrado_contrato: 800.0,
            avance_anterior: 245.2,
            avance_dia: 89.4,
            avance_acumulado: 334.6,
            porcentaje: 41.8,
            observaciones: 'Compactación con humedad óptima'
          }
        ],
        ocurrencias: [
          {
            tipo: 'incidente',
            descripcion: 'Menor derrame de combustible en zona de abastecimiento. Se procedió con limpieza inmediata según protocolo ambiental.',
            hora: '14:30'
          }
        ],
        consultas: [
          {
            dirigido_a: 'Supervisor',
            asunto: 'Aprobación de cambio de trazo',
            descripcion: 'Se requiere aprobación para modificar trazo en progresiva 2+150 debido a interferencia subterránea no prevista.',
            urgencia: 'media'
          }
        ]
      },

      // Sistema de firmas
      firmas_requeridas: [
        { cargo: 'Residente de Obra', usuario_id: 1, requerida: true },
        { cargo: 'Supervisor NEMAEC', usuario_id: 2, requerida: true },
        { cargo: 'Inspector MTC', usuario_id: 3, requerida: true }
      ],
      firmas_completadas: id === '1' ? [
        {
          cargo: 'Residente de Obra',
          usuario_id: 1,
          usuario_nombre: 'Ing. Luis Callupe',
          fecha_firma: '2026-05-01T09:35:00',
          hash_firma: 'firma123abc',
          observaciones: null
        }
      ] : [
        {
          cargo: 'Residente de Obra',
          usuario_id: 1,
          usuario_nombre: 'Ing. Luis Callupe',
          fecha_firma: '2026-05-01T09:35:00',
          hash_firma: 'firma123abc'
        },
        {
          cargo: 'Supervisor NEMAEC',
          usuario_id: 2,
          usuario_nombre: 'Ing. María Flores',
          fecha_firma: '2026-05-01T15:22:00',
          hash_firma: 'firma456def'
        },
        {
          cargo: 'Inspector MTC',
          usuario_id: 3,
          usuario_nombre: 'Ing. Carlos Mendoza',
          fecha_firma: '2026-05-01T17:45:00',
          hash_firma: 'firma789ghi'
        }
      ]
    }

          setAsiento(mockAsiento)
        }
        setLoading(false)
      }
    }
    cargarAsiento()
  }, [id])

  const getEstadoConfig = (estado) => {
    switch (estado) {
      case 'borrador':
        return {
          badge: 'Borrador',
          badgeColor: 'bg-gray-100 text-gray-700',
          icon: <Edit3 size={16} className="text-gray-500" />
        }
      case 'pendiente_firmas':
        return {
          badge: 'Pendiente de firmas',
          badgeColor: 'bg-amber-100 text-amber-800',
          icon: <Clock size={16} className="text-amber-600" />
        }
      case 'completo_firmado':
        return {
          badge: 'Completo y firmado',
          badgeColor: 'bg-green-100 text-green-800',
          icon: <CheckCircle size={16} className="text-green-600" />
        }
      case 'observado':
        return {
          badge: 'Observado',
          badgeColor: 'bg-red-100 text-red-800',
          icon: <XCircle size={16} className="text-red-600" />
        }
      default:
        return {
          badge: estado,
          badgeColor: 'bg-gray-100 text-gray-700',
          icon: <FileText size={16} className="text-gray-500" />
        }
    }
  }

  const formatFecha = (fechaISO) => {
    const fecha = new Date(fechaISO)
    return fecha.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFechaCorta = (fechaISO) => {
    const fecha = new Date(fechaISO)
    return fecha.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const puedeFirearUsuario = () => {
    if (!asiento || asiento.estado !== 'PENDIENTE_FIRMAS') return false

    // Verificar si el usuario actual tiene una firma pendiente
    const firmaRequerida = asiento.firmas_requeridas.find(f => f.usuario_id === usuario.id)
    const yaFirmo = asiento.firmas_completadas.find(f => f.usuario_id === usuario.id)

    return firmaRequerida && !yaFirmo
  }

  const puedeEditarAsiento = () => {
    return asiento && asiento.estado === 'BORRADOR' && asiento.autor_id === usuario.id
  }

  const handleFirmar = () => {
    setShowFirmaModal(true)
  }

  const handleFirmaCompleta = async (pin, observaciones) => {
    try {
      await firmarAsiento(id, pin, observaciones)
      setShowFirmaModal(false)
      // Recargar datos del asiento
      const asientoActualizado = await obtenerAsiento(id)
      if (asientoActualizado) {
        setAsiento(asientoActualizado)
      }
    } catch (error) {
      console.error('Error firmando asiento:', error)
      alert('Error al firmar el asiento. Verifica tu PIN e intenta nuevamente.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando asiento...</p>
        </div>
      </div>
    )
  }

  if (!asiento) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto text-red-400 mb-4" />
          <p className="text-gray-500">Asiento no encontrado</p>
          <button
            onClick={() => navigate('/cuaderno')}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg"
          >
            Volver al cuaderno
          </button>
        </div>
      </div>
    )
  }

  const estadoConfig = getEstadoConfig(asiento.estado)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <OfflineBanner />

      {/* Header */}
      <div className="bg-amber-600 text-white px-4 pt-4 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate('/cuaderno')}
            className="p-1.5 -ml-1.5 rounded-lg active:bg-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Asiento N°{asiento.numero_asiento}</h1>
            <p className="text-amber-100 text-xs mt-0.5">
              {comisariaSeleccionadaObj?.nombre} · Folio {asiento.folio}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {puedeEditarAsiento() && (
              <button
                onClick={() => navigate(`/cuaderno/editar/${asiento.id}`)}
                className="p-2.5 bg-white/20 rounded-xl active:bg-white/30"
              >
                <Edit3 size={18} />
              </button>
            )}
            <button className="p-2.5 bg-white/20 rounded-xl active:bg-white/30">
              <Share size={18} />
            </button>
            <button className="p-2.5 bg-white/20 rounded-xl active:bg-white/30">
              <Download size={18} />
            </button>
          </div>
        </div>

        {/* Estado y fecha */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {estadoConfig.icon}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoConfig.badgeColor}`}>
              {estadoConfig.badge}
            </span>
          </div>
          <span className="text-xs text-amber-100">
            {formatFechaCorta(asiento.fecha_creacion)}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 px-4 pb-6 space-y-4">

        {/* Info del autor */}
        <div className="bg-white rounded-2xl p-4 -mt-3 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <User size={20} className="text-blue-700" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{asiento.autor_nombre}</p>
              <p className="text-xs text-gray-500">{asiento.autor_rol}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Creado</p>
              <p className="text-xs font-medium text-gray-900">{formatFechaCorta(asiento.fecha_creacion)}</p>
            </div>
          </div>
        </div>

        {/* Hash de integridad */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Hash size={20} className="text-purple-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 mb-1">Hash de integridad</p>
              <p className="text-xs font-mono text-gray-600 break-all bg-gray-50 p-2 rounded">
                {asiento.hash_contenido}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Hash anterior: <span className="font-mono">{asiento.hash_anterior?.slice(0, 16)}...</span>
              </p>
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-2">Resumen del día</h3>
          <p className="text-sm text-gray-700">{asiento.resumen}</p>
        </div>

        {/* Datos Generales */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'generales' ? null : 'generales')}
            className="w-full p-4 text-left flex items-center justify-between active:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-blue-600" />
              <span className="font-medium text-gray-900">Datos Generales</span>
            </div>
            <ChevronLeft
              size={18}
              className={`text-gray-400 transition-transform ${
                expandedSection === 'generales' ? 'rotate-90' : '-rotate-90'
              }`}
            />
          </button>
          {expandedSection === 'generales' && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500 font-medium">Condiciones climáticas</p>
                <p className="text-sm text-gray-900">{asiento.contenido.datos_generales.condiciones_climaticas}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Personal presente</p>
                <p className="text-sm text-gray-900">{asiento.contenido.datos_generales.personal_presente} personas</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Equipos operando</p>
                <p className="text-sm text-gray-900">{asiento.contenido.datos_generales.equipos_operando}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Observaciones generales</p>
                <p className="text-sm text-gray-900">{asiento.contenido.datos_generales.observaciones_generales}</p>
              </div>
            </div>
          )}
        </div>

        {/* Avances de Partidas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'avances' ? null : 'avances')}
            className="w-full p-4 text-left flex items-center justify-between active:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600" />
              <span className="font-medium text-gray-900">Avances de Partidas</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {asiento.contenido.avances_partidas.length} partidas
              </span>
            </div>
            <ChevronLeft
              size={18}
              className={`text-gray-400 transition-transform ${
                expandedSection === 'avances' ? 'rotate-90' : '-rotate-90'
              }`}
            />
          </button>
          {expandedSection === 'avances' && (
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
              {asiento.contenido.avances_partidas.map((partida, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-sm text-gray-900 mb-1">{partida.partida_nombre}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Avance del día:</span>
                      <span className="ml-1 font-medium">{partida.avance_dia} {partida.unidad}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Acumulado:</span>
                      <span className="ml-1 font-medium">{partida.avance_acumulado} {partida.unidad}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Progreso:</span>
                      <span className="ml-1 font-medium text-green-600">{partida.porcentaje}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Meta:</span>
                      <span className="ml-1 font-medium">{partida.metrado_contrato} {partida.unidad}</span>
                    </div>
                  </div>
                  {partida.observaciones && (
                    <p className="text-xs text-gray-600 mt-2 italic">{partida.observaciones}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ocurrencias */}
        {asiento.contenido.ocurrencias?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'ocurrencias' ? null : 'ocurrencias')}
              className="w-full p-4 text-left flex items-center justify-between active:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-orange-600" />
                <span className="font-medium text-gray-900">Ocurrencias</span>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                  {asiento.contenido.ocurrencias.length}
                </span>
              </div>
              <ChevronLeft
                size={18}
                className={`text-gray-400 transition-transform ${
                  expandedSection === 'ocurrencias' ? 'rotate-90' : '-rotate-90'
                }`}
              />
            </button>
            {expandedSection === 'ocurrencias' && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                {asiento.contenido.ocurrencias.map((ocurrencia, index) => (
                  <div key={index} className="bg-orange-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-medium">
                        {ocurrencia.tipo}
                      </span>
                      <span className="text-xs text-gray-500">{ocurrencia.hora}</span>
                    </div>
                    <p className="text-sm text-gray-700">{ocurrencia.descripcion}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Consultas */}
        {asiento.contenido.consultas?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'consultas' ? null : 'consultas')}
              className="w-full p-4 text-left flex items-center justify-between active:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Users size={20} className="text-blue-600" />
                <span className="font-medium text-gray-900">Consultas</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {asiento.contenido.consultas.length}
                </span>
              </div>
              <ChevronLeft
                size={18}
                className={`text-gray-400 transition-transform ${
                  expandedSection === 'consultas' ? 'rotate-90' : '-rotate-90'
                }`}
              />
            </button>
            {expandedSection === 'consultas' && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                {asiento.contenido.consultas.map((consulta, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-blue-600 font-medium">Para: {consulta.dirigido_a}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        consulta.urgencia === 'alta' ? 'bg-red-200 text-red-800' :
                        consulta.urgencia === 'media' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-200 text-green-800'
                      }`}>
                        {consulta.urgencia}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{consulta.asunto}</p>
                    <p className="text-sm text-gray-700">{consulta.descripcion}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sistema de Firmas */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Sistema de Firmas</h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {asiento.firmas_completadas.length}/{asiento.firmas_requeridas.length} firmadas
            </span>
          </div>

          <div className="space-y-3">
            {asiento.firmas_requeridas.map((firmaReq, index) => {
              const firmaComp = asiento.firmas_completadas.find(f => f.usuario_id === firmaReq.usuario_id)

              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {firmaComp ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <Clock size={20} className="text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{firmaReq.cargo}</p>
                    {firmaComp ? (
                      <div>
                        <p className="text-xs text-gray-600">{firmaComp.usuario_nombre}</p>
                        <p className="text-xs text-green-600">Firmado el {formatFechaCorta(firmaComp.fecha_firma)}</p>
                        {firmaComp.observaciones && (
                          <p className="text-xs text-gray-500 italic mt-1">{firmaComp.observaciones}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-amber-600">Pendiente de firma</p>
                    )}
                  </div>
                  {firmaReq.usuario_id === usuario.id && !firmaComp && asiento.estado === 'PENDIENTE_FIRMAS' && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                      Tu turno
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Botón de Firma */}
        {puedeFirearUsuario() && (
          <button
            onClick={handleFirmar}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-4 font-semibold active:scale-95 transition-transform"
          >
            Firmar Asiento
          </button>
        )}
      </div>

      {/* Modal de Firma */}
      {showFirmaModal && (
        <FirmaModal
          asiento={asiento}
          usuario={usuario}
          onFirmar={handleFirmaCompleta}
          onCancelar={() => setShowFirmaModal(false)}
        />
      )}
    </div>
  )
}