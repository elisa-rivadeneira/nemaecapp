import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Edit2, Calendar, User, Camera, Shield, X, Maximize2 } from 'lucide-react'
import OfflineBanner from '../components/OfflineBanner'

export default function HistorialAvancesPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const partida = state?.partida

  const { comisariaSeleccionada, comisariaSeleccionadaObj, usuario, getAvancesPartida } = useAppStore()
  const comisaria = comisariaSeleccionadaObj

  const avances = getAvancesPartida(comisariaSeleccionada, partida?.codigo)
  const [avanceSeleccionado, setAvanceSeleccionado] = useState(null)
  const [imagenExpandida, setImagenExpandida] = useState(null)

  useEffect(() => {
    if (!partida) navigate('/partidas')
  }, [partida, navigate])

  if (!partida) return null

  const avancesOrdenados = [...avances].sort((a, b) => {
    const fechaA = new Date(a.fecha + ' ' + a.hora)
    const fechaB = new Date(b.fecha + ' ' + b.hora)
    return fechaB - fechaA
  })

  const misAvances = avancesOrdenados.filter(a => a.monitor === usuario?.login)
  const otrosAvances = avancesOrdenados.filter(a => a.monitor !== usuario?.login)

  const ultimoAcumulado = avances.length > 0
    ? avances[avances.length - 1].acumulado
    : 0

  function getEstadoAvance(avance) {
    if (avance.verificado) {
      return {
        color: 'green',
        icono: CheckCircle,
        texto: 'Verificado',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700'
      }
    }
    if (avance.rolRegistrador === 'residente') {
      return {
        color: 'yellow',
        icono: Clock,
        texto: 'Pendiente',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-700'
      }
    }
    return {
      color: 'blue',
      icono: CheckCircle,
      texto: 'Monitor',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700'
    }
  }

  function puedeEditar(avance) {
    const esMonitor = usuario?.rol === 'monitor'
    const esMiRegistro = avance.monitor === usuario?.login
    const noVerificado = !avance.verificado

    // Monitor puede editar cualquier avance
    if (esMonitor) return true

    // Residente solo puede editar sus propios avances no verificados
    if (esMiRegistro && noVerificado) return true

    return false
  }

  function AvanceCard({ avance, esMio }) {
    const estado = getEstadoAvance(avance)
    const Icono = estado.icono
    const editable = puedeEditar(avance)

    return (
      <div
        className={`${estado.bgColor} ${estado.borderColor} border rounded-xl p-3 mb-3`}
        onClick={() => setAvanceSeleccionado(avance)}
      >
        <div className="flex items-start gap-3">
          <div className={`${estado.bgColor} rounded-full p-1.5`}>
            <Icono size={16} className={estado.textColor} />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="text-xs text-gray-500">
                  {avance.fecha} • {avance.hora}
                </span>
                {esMio && (
                  <span className="ml-2 text-xs font-medium text-brand-600">
                    Mi registro
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${estado.textColor}`}>
                  +{avance.porcentajeDia}%
                </span>
                {editable && (
                  <button
                    className="p-1.5 rounded-lg bg-white/80 hover:bg-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate('/partidas/editar', { state: { avance, partida } })
                    }}
                  >
                    <Edit2 size={14} className="text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <User size={10} />
                {avance.rolRegistrador === 'residente' ? 'Residente' : 'Monitor'}
              </span>
              {avance.foto && (
                <span className="flex items-center gap-1">
                  <Camera size={10} />
                  Foto
                </span>
              )}
              <span className="font-medium">
                Acum: {avance.acumulado}%
              </span>
            </div>

            {avance.obs && (
              <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                {avance.obs}
              </p>
            )}

            {/* Thumbnails de imágenes */}
            {((avance.fotos && avance.fotos.length > 0) || avance.foto) && (
              <div className="mt-2 flex gap-1 flex-wrap">
                {(avance.fotos || [avance.foto].filter(Boolean)).map((foto, idx) => (
                  <div key={idx} className="relative inline-block">
                    <img
                      src={foto}
                      alt={`Evidencia ${idx + 1}`}
                      className="h-14 w-16 object-cover rounded-lg cursor-pointer border border-gray-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        setImagenExpandida(foto)
                      }}
                    />
                    {idx === 0 && (
                      <button
                        className="absolute top-0.5 right-0.5 bg-black/50 text-white p-0.5 rounded"
                        onClick={(e) => {
                          e.stopPropagation()
                          setImagenExpandida(foto)
                        }}
                      >
                        <Maximize2 size={8} />
                      </button>
                    )}
                  </div>
                ))}
                {(avance.fotos || []).length > 3 && (
                  <span className="text-xs text-gray-500 self-center ml-1">
                    +{(avance.fotos || []).length - 3} más
                  </span>
                )}
              </div>
            )}

            {avance.verificado && avance.monitorVerificador && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <Shield size={10} />
                  Verificado por {avance.monitorVerificador}
                </p>
                {!avance.acuerdoConAvance && avance.porcentajeDiaMonitor && (
                  <p className="text-xs text-orange-600 mt-1">
                    Ajustado: {avance.porcentajeDiaMonitor}%
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <OfflineBanner />

      {/* Header */}
      <div className="bg-brand-800 text-white px-4 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/partidas', { state: { partida } })}
            className="p-1.5 rounded-lg bg-white/10 active:bg-white/20"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-blue-200 text-xs">Historial de avances</p>
            <h1 className="font-bold text-sm leading-tight truncate">
              {comisaria?.nombre}
            </h1>
          </div>
        </div>
      </div>

      {/* Info partida */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              {partida.codigo}
            </span>
            <p className="font-semibold text-gray-900 mt-1 text-sm">
              {partida.partida}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-700">{ultimoAcumulado}%</p>
            <p className="text-[10px] text-gray-400">acumulado</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 rounded-full transition-all"
            style={{ width: `${ultimoAcumulado}%` }}
          />
        </div>
      </div>

      {/* Lista de avances */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {avancesOrdenados.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay avances registrados</p>
            <button
              onClick={() => navigate('/partidas/registrar', { state: { partida } })}
              className="mt-4 bg-brand-700 text-white px-6 py-2 rounded-xl font-medium text-sm"
            >
              Registrar primer avance
            </button>
          </div>
        ) : (
          <div>
            {/* Mis avances */}
            {misAvances.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                  Mis Registros ({misAvances.length})
                </h2>
                {misAvances.map(avance => (
                  <AvanceCard key={avance.id} avance={avance} esMio={true} />
                ))}
              </div>
            )}

            {/* Otros avances */}
            {otrosAvances.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                  Otros Registros ({otrosAvances.length})
                </h2>
                {otrosAvances.map(avance => (
                  <AvanceCard key={avance.id} avance={avance} esMio={false} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botón flotante para nuevo registro */}
      <div className="p-4 bg-white border-t border-gray-200">
        <button
          onClick={() => navigate('/partidas/registrar', { state: { partida } })}
          className="w-full bg-brand-700 text-white py-3 rounded-xl font-semibold"
        >
          Registrar nuevo avance
        </button>
      </div>

      {/* Modal de detalle */}
      {avanceSeleccionado && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setAvanceSeleccionado(null)}
        >
          <div
            className="bg-white rounded-t-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold">Detalle del avance</h3>
              <button
                onClick={() => setAvanceSeleccionado(null)}
                className="text-gray-500 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Fecha y hora</p>
                <p className="font-medium">
                  {avanceSeleccionado.fecha} • {avanceSeleccionado.hora}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Registrado por</p>
                <p className="font-medium">
                  {avanceSeleccionado.monitor} ({avanceSeleccionado.rolRegistrador})
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Avance del día</p>
                <p className="text-2xl font-bold text-brand-700">
                  +{avanceSeleccionado.porcentajeDia}%
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Acumulado</p>
                <p className="text-xl font-bold text-green-600">
                  {avanceSeleccionado.acumulado}%
                </p>
              </div>

              {avanceSeleccionado.obs && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Observaciones</p>
                  <p className="text-sm">{avanceSeleccionado.obs}</p>
                </div>
              )}

              {avanceSeleccionado.foto && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Fotografía</p>
                  <img
                    src={avanceSeleccionado.foto}
                    alt="Evidencia"
                    className="w-full rounded-lg"
                  />
                </div>
              )}

              {avanceSeleccionado.verificado && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-700">
                    ✓ Verificado por {avanceSeleccionado.monitorVerificador}
                  </p>
                  {avanceSeleccionado.fechaVerificacion && (
                    <p className="text-xs text-green-600 mt-1">
                      {avanceSeleccionado.fechaVerificacion}
                    </p>
                  )}
                </div>
              )}

              {!avanceSeleccionado.verificado && avanceSeleccionado.rolRegistrador === 'residente' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-700">
                    ⏳ Pendiente de verificación
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de imagen expandida */}
      {imagenExpandida && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setImagenExpandida(null)}
        >
          <button
            onClick={() => setImagenExpandida(null)}
            className="absolute top-4 right-4 bg-white/20 text-white p-2 rounded-full"
          >
            <X size={24} />
          </button>
          <img
            src={imagenExpandida}
            alt="Imagen completa"
            className="max-w-full max-h-full object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}