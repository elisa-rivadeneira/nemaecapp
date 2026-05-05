import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Save,
  Send,
  MapPin,
  Calendar,
  User,
  ClipboardList,
  Cloud,
  Users,
  Wrench,
  Package,
  AlertTriangle,
  MessageSquare,
  Eye,
  Camera,
  Plus,
  X,
  Loader2
} from 'lucide-react'
import OfflineBanner from '../components/OfflineBanner'

export default function AsientoNuevoPage() {
  const navigate = useNavigate()
  const {
    comisariaSeleccionadaObj,
    comisariaSeleccionada,
    usuario,
    ubicacionActual,
    precargarAsiento,
    guardarAsiento,
    asientoBorrador,
    clearAsientoBorrador
  } = useAppStore()

  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [borrador, setBorrador] = useState(null)
  const [secciones, setSecciones] = useState({
    avances: true,
    condiciones: false,
    ocurrencias: false,
    consultas: false,
    observaciones: false,
    adjuntos: false
  })

  // Estado del formulario
  const [formulario, setFormulario] = useState({
    clima: '',
    temperatura: '',
    personal: [],
    equipos: [],
    materiales: [],
    ocurrencias: '',
    consultas: '',
    observaciones: ''
  })

  // Precargar datos del día
  useEffect(() => {
    cargarBorrador()
  }, [comisariaSeleccionada])

  const cargarBorrador = async () => {
    try {
      setLoading(true)
      if (comisariaSeleccionada) {
        const datos = await precargarAsiento(comisariaSeleccionada)
        setBorrador(datos)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error cargando borrador:', error)
      setLoading(false)
    }
  }

  const toggleSeccion = (seccion) => {
    setSecciones(prev => ({
      ...prev,
      [seccion]: !prev[seccion]
    }))
  }

  const actualizarNota = (codigoPartida, nuevaNota) => {
    setBorrador(prev => ({
      ...prev,
      contenido: {
        ...prev.contenido,
        avances: prev.contenido.avances.map(avance =>
          avance.codigo === codigoPartida
            ? { ...avance, nota: nuevaNota }
            : avance
        )
      }
    }))
  }

  const agregarPersonal = () => {
    const nuevoPersonal = { nombre: '', cargo: '', presente: true }
    setFormulario(prev => ({
      ...prev,
      personal: [...prev.personal, nuevoPersonal]
    }))
  }

  const eliminarPersonal = (index) => {
    setFormulario(prev => ({
      ...prev,
      personal: prev.personal.filter((_, i) => i !== index)
    }))
  }

  const actualizarPersonal = (index, campo, valor) => {
    setFormulario(prev => ({
      ...prev,
      personal: prev.personal.map((persona, i) =>
        i === index ? { ...persona, [campo]: valor } : persona
      )
    }))
  }

  const guardarBorrador = async () => {
    try {
      setGuardando(true)

      const datosAsiento = {
        comisaria_id: comisariaSeleccionada,
        tipo_asiento: 'diario',
        resumen: formulario.observaciones || 'Asiento del día',
        contenido: {
          datos_generales: {
            condiciones_climaticas: `${formulario.clima} ${formulario.temperatura}`,
            personal_presente: formulario.personal.filter(p => p.presente).length,
            equipos_operando: formulario.equipos.join(', '),
            observaciones_generales: formulario.observaciones
          },
          avances_partidas: borrador?.contenido?.avances || [],
          ocurrencias: formulario.ocurrencias ? [{
            tipo: 'observacion',
            descripcion: formulario.ocurrencias,
            hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
          }] : [],
          consultas: formulario.consultas ? [{
            dirigido_a: 'Supervisor',
            asunto: 'Consulta del día',
            descripcion: formulario.consultas,
            urgencia: 'media'
          }] : []
        }
      }

      await guardarAsiento(datosAsiento)
      clearAsientoBorrador()
      navigate('/cuaderno')
    } catch (error) {
      console.error('Error guardando borrador:', error)
      alert('Error al guardar el asiento. Intenta nuevamente.')
    } finally {
      setGuardando(false)
    }
  }

  const cerrarYSolicitarFirmas = async () => {
    try {
      setGuardando(true)

      // Primero guardar como borrador
      const datosAsiento = {
        comisaria_id: comisariaSeleccionada,
        tipo_asiento: 'diario',
        resumen: formulario.observaciones || 'Asiento del día',
        contenido: {
          datos_generales: {
            condiciones_climaticas: `${formulario.clima} ${formulario.temperatura}`,
            personal_presente: formulario.personal.filter(p => p.presente).length,
            equipos_operando: formulario.equipos.join(', '),
            observaciones_generales: formulario.observaciones
          },
          avances_partidas: borrador?.contenido?.avances || [],
          ocurrencias: formulario.ocurrencias ? [{
            tipo: 'observacion',
            descripcion: formulario.ocurrencias,
            hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
          }] : [],
          consultas: formulario.consultas ? [{
            dirigido_a: 'Supervisor',
            asunto: 'Consulta del día',
            descripcion: formulario.consultas,
            urgencia: 'media'
          }] : []
        }
      }

      const nuevoAsiento = await guardarAsiento(datosAsiento)

      // Luego cerrar para solicitar firmas
      // await cerrarAsiento(nuevoAsiento.id)

      clearAsientoBorrador()
      navigate('/cuaderno')
    } catch (error) {
      console.error('Error cerrando asiento:', error)
      alert('Error al procesar el asiento. Intenta nuevamente.')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="mx-auto text-amber-600 animate-spin mb-3" />
          <p className="text-gray-600 font-medium">Generando borrador...</p>
          <p className="text-sm text-gray-500 mt-1">Precargando tus avances del día</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <OfflineBanner />

      {/* Header */}
      <div className="bg-amber-600 text-white px-4 pt-4 pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/cuaderno')}
            className="p-1.5 -ml-1.5 rounded-lg active:bg-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Asiento del día</h1>
            <p className="text-amber-100 text-xs mt-0.5">
              Asiento N°{borrador?.datos_generales?.numero_asiento} · {borrador?.datos_generales?.folio}
            </p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 pb-20">
        {/* Datos generales */}
        <div className="bg-white border-b border-gray-100 px-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <div>
                <p className="text-gray-500 text-xs">Fecha</p>
                <p className="font-medium">{new Date().toLocaleDateString('es-PE')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <div>
                <p className="text-gray-500 text-xs">Autor</p>
                <p className="font-medium">{borrador?.datos_generales?.autor?.nombre}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección Avances del día */}
        <SeccionAvances
          avances={borrador?.contenido?.avances || []}
          expandida={secciones.avances}
          onToggle={() => toggleSeccion('avances')}
          onActualizarNota={actualizarNota}
          metadata={borrador?.metadata}
        />

        {/* Sección Condiciones */}
        <SeccionCondiciones
          personal={formulario.personal}
          equipos={formulario.equipos}
          materiales={formulario.materiales}
          clima={formulario.clima}
          temperatura={formulario.temperatura}
          expandida={secciones.condiciones}
          onToggle={() => toggleSeccion('condiciones')}
          onActualizarFormulario={(campo, valor) => setFormulario(prev => ({ ...prev, [campo]: valor }))}
          onAgregarPersonal={agregarPersonal}
          onEliminarPersonal={eliminarPersonal}
          onActualizarPersonal={actualizarPersonal}
        />

        {/* Sección Ocurrencias */}
        <SeccionTexto
          titulo="Ocurrencias relevantes"
          icono={<AlertTriangle size={16} />}
          placeholder="¿Hubo paralizaciones, accidentes, problemas de calidad, visitas externas, llegada de materiales esperados?"
          valor={formulario.ocurrencias}
          expandida={secciones.ocurrencias}
          onToggle={() => toggleSeccion('ocurrencias')}
          onChange={(valor) => setFormulario(prev => ({ ...prev, ocurrencias: valor }))}
        />

        {/* Sección Consultas */}
        <SeccionTexto
          titulo="Consultas al supervisor"
          icono={<MessageSquare size={16} />}
          placeholder="Escribe aquí las consultas técnicas o administrativas que requieran respuesta..."
          valor={formulario.consultas}
          expandida={secciones.consultas}
          onToggle={() => toggleSeccion('consultas')}
          onChange={(valor) => setFormulario(prev => ({ ...prev, consultas: valor }))}
        />

        {/* Sección Observaciones */}
        <SeccionTexto
          titulo="Observaciones"
          icono={<Eye size={16} />}
          placeholder="Observaciones adicionales, notas importantes, comentarios generales..."
          valor={formulario.observaciones}
          expandida={secciones.observaciones}
          onToggle={() => toggleSeccion('observaciones')}
          onChange={(valor) => setFormulario(prev => ({ ...prev, observaciones: valor }))}
        />
      </div>

      {/* Footer fijo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        {/* Geolocalización */}
        {ubicacionActual && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <MapPin size={12} />
            <span>Registrado en: {ubicacionActual.lat?.toFixed(5)}, {ubicacionActual.lng?.toFixed(5)}</span>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-2">
          <button
            onClick={guardarBorrador}
            disabled={guardando}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white py-3 rounded-xl font-medium active:bg-gray-700 disabled:opacity-50"
          >
            <Save size={18} />
            <span>{guardando ? 'Guardando...' : 'Guardar borrador'}</span>
          </button>
          <button
            onClick={cerrarYSolicitarFirmas}
            disabled={guardando}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-600 text-white py-3 rounded-xl font-medium active:bg-amber-700 disabled:opacity-50"
          >
            <Send size={18} />
            <span>{guardando ? 'Cerrando...' : 'Cerrar y solicitar firmas'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Componente para la sección de avances
function SeccionAvances({ avances, expandida, onToggle, onActualizarNota, metadata }) {
  return (
    <div className="bg-white border-b border-gray-100">
      <button
        onClick={onToggle}
        className="w-full px-4 py-4 flex items-center justify-between active:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <ClipboardList size={20} className="text-amber-600" />
          <div className="text-left">
            <h3 className="font-medium text-gray-900">Avances del día</h3>
            <p className="text-xs text-green-600 mt-0.5">
              ✓ {avances.length} partidas precargadas desde tus avances de hoy
            </p>
          </div>
        </div>
        {expandida ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
      </button>

      {expandida && (
        <div className="px-4 pb-4">
          {metadata && (
            <div className="bg-green-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-green-700">
                💡 Esta sección se generó analizando {metadata.avances_precargados} avances registrados en el sistema móvil
              </p>
            </div>
          )}

          <div className="space-y-3">
            {avances.map((avance, index) => (
              <div key={avance.codigo} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{avance.codigo}</p>
                    <p className="text-xs text-gray-600">{avance.descripcion}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>{avance.porcentaje_dia}% del día</span>
                      <span>·</span>
                      <span>{avance.porcentaje_acumulado}% acumulado</span>
                      {avance.tiene_foto && (
                        <>
                          <span>·</span>
                          <span className="text-blue-600">📷 Con foto</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nota específica del asiento */}
                <div className="mt-3">
                  <label className="block text-xs text-gray-600 mb-1">Nota para este asiento:</label>
                  <textarea
                    value={avance.nota}
                    onChange={(e) => onActualizarNota(avance.codigo, e.target.value)}
                    placeholder="Agregar comentario específico para este asiento..."
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 resize-none"
                    rows="2"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Componente para secciones de texto
function SeccionTexto({ titulo, icono, placeholder, valor, expandida, onToggle, onChange }) {
  return (
    <div className="bg-white border-b border-gray-100">
      <button
        onClick={onToggle}
        className="w-full px-4 py-4 flex items-center justify-between active:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <div className="text-gray-600">{icono}</div>
          <h3 className="font-medium text-gray-900">{titulo}</h3>
        </div>
        {expandida ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
      </button>

      {expandida && (
        <div className="px-4 pb-4">
          <textarea
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-gray-200 rounded-lg p-3 resize-none text-sm"
            rows="4"
          />
        </div>
      )}
    </div>
  )
}

// Componente para condiciones del día
function SeccionCondiciones({
  personal, equipos, materiales, clima, temperatura,
  expandida, onToggle, onActualizarFormulario,
  onAgregarPersonal, onEliminarPersonal, onActualizarPersonal
}) {
  return (
    <div className="bg-white border-b border-gray-100">
      <button
        onClick={onToggle}
        className="w-full px-4 py-4 flex items-center justify-between active:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <Cloud size={20} className="text-blue-500" />
          <h3 className="font-medium text-gray-900">Condiciones</h3>
        </div>
        {expandida ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
      </button>

      {expandida && (
        <div className="px-4 pb-4 space-y-4">
          {/* Clima */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Clima</label>
            <select
              value={clima}
              onChange={(e) => onActualizarFormulario('clima', e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2 text-sm"
            >
              <option value="">Seleccionar clima</option>
              <option value="despejado">☀️ Despejado</option>
              <option value="nublado">☁️ Nublado</option>
              <option value="lluvioso">🌧️ Lluvioso</option>
              <option value="tormenta">⛈️ Tormenta</option>
              <option value="neblina">🌫️ Neblina</option>
            </select>
          </div>

          {/* Personal en obra */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Personal en obra</label>
              <button
                onClick={onAgregarPersonal}
                className="p-1 text-blue-600 active:text-blue-800"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {personal.map((persona, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={persona.nombre}
                    onChange={(e) => onActualizarPersonal(index, 'nombre', e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg p-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Cargo"
                    value={persona.cargo}
                    onChange={(e) => onActualizarPersonal(index, 'cargo', e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg p-2 text-xs"
                  />
                  <button
                    onClick={() => onEliminarPersonal(index)}
                    className="p-1 text-red-500 active:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}