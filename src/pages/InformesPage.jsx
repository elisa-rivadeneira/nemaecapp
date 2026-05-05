import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import {
  ChevronLeft,
  FileText,
  Calendar,
  Download,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  FileDown,
  Zap,
  Filter,
  MessageSquare
} from 'lucide-react'
import OfflineBanner from '../components/OfflineBanner'

export default function InformesPage() {
  const navigate = useNavigate()
  const {
    comisariaSeleccionadaObj,
    comisariaSeleccionada,
    usuario
  } = useAppStore()

  const [tipoInforme, setTipoInforme] = useState('semanal')
  const [generando, setGenerando] = useState(false)
  const [procesoId, setProcesoId] = useState(null)
  const [preguntas, setPreguntas] = useState([])
  const [respuestas, setRespuestas] = useState({})
  const [borrador, setBorrador] = useState(null)
  const [informeFinal, setInformeFinal] = useState(null)
  const [paso, setPaso] = useState('inicial') // inicial, preguntas, borrador, final
  const [informesAnteriores, setInformesAnteriores] = useState([])

  // Cargar informes anteriores
  useEffect(() => {
    cargarInformesAnteriores()
  }, [comisariaSeleccionada])

  const cargarInformesAnteriores = async () => {
    // Simular informes anteriores
    setInformesAnteriores([
      {
        id: 1,
        numero: '03-2026-NEMAEC-MON',
        fecha: '2026-03-15',
        tipo: 'semanal',
        estado: 'completo'
      },
      {
        id: 2,
        numero: '02-2026-NEMAEC-MON',
        fecha: '2026-03-08',
        tipo: 'semanal',
        estado: 'completo'
      }
    ])
  }

  const iniciarGeneracion = async () => {
    setGenerando(true)
    setPaso('preguntas')

    try {
      const erpUrl = import.meta.env.VITE_ERP_URL || 'http://localhost:8000'

      // Calcular fechas según tipo de informe
      const fechaFin = new Date()
      const fechaInicio = new Date()

      if (tipoInforme === 'semanal') {
        fechaInicio.setDate(fechaFin.getDate() - 7)
      } else if (tipoInforme === 'mensual') {
        fechaInicio.setDate(fechaFin.getDate() - 30)
      } else {
        fechaInicio.setDate(fechaFin.getDate() - 15)
      }

      // Iniciar proceso de generación
      const response = await fetch(`${erpUrl}/api/v1/informes/iniciar-generacion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Usuario-Id': usuario.id.toString()
        },
        body: JSON.stringify({
          comisaria_id: comisariaSeleccionada,
          tipo_informe: tipoInforme,
          fecha_inicio: fechaInicio.toISOString().split('T')[0],
          fecha_fin: fechaFin.toISOString().split('T')[0],
          rol_autor: usuario.rol,
          incluir_fotos: true,
          incluir_cuaderno: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        setProcesoId(data.contexto_analizado.proceso_id)
        setPreguntas(data.preguntas || [])

        // Si no hay preguntas, generar borrador directamente
        if (!data.preguntas || data.preguntas.length === 0) {
          generarBorrador(data.contexto_analizado.proceso_id, [])
        }
      }
    } catch (error) {
      console.error('Error iniciando generación:', error)
      alert('Error al iniciar la generación del informe')
      setPaso('inicial')
    } finally {
      setGenerando(false)
    }
  }

  const responderPregunta = (preguntaId, respuesta) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: respuesta
    }))
  }

  const generarBorrador = async (procesoIdParam = null, respuestasParam = null) => {
    setGenerando(true)
    setPaso('borrador')

    try {
      const erpUrl = import.meta.env.VITE_ERP_URL || 'http://localhost:8000'
      const idProceso = procesoIdParam || procesoId
      const respuestasFormateadas = respuestasParam || Object.entries(respuestas).map(([preguntaId, respuesta]) => ({
        pregunta_id: preguntaId,
        respuesta: respuesta
      }))

      const response = await fetch(`${erpUrl}/api/v1/informes/generar-borrador`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Usuario-Id': usuario.id.toString()
        },
        body: JSON.stringify({
          proceso_id: idProceso,
          respuestas: respuestasFormateadas
        })
      })

      if (response.ok) {
        const data = await response.json()
        setBorrador(data)
      } else {
        const errorData = await response.text()
        console.error('Error del servidor:', response.status, errorData)
        alert(`Error al generar el borrador: ${response.status} - ${errorData}`)
        setPaso('preguntas') // Volver al paso anterior
      }
    } catch (error) {
      console.error('Error generando borrador:', error)
      alert('Error de conexión al generar el borrador')
      setPaso('preguntas') // Volver al paso anterior
    } finally {
      setGenerando(false)
    }
  }

  const finalizarInforme = async () => {
    setGenerando(true)
    setPaso('final')

    try {
      const erpUrl = import.meta.env.VITE_ERP_URL || 'http://localhost:8000'

      const response = await fetch(`${erpUrl}/api/v1/informes/finalizar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Usuario-Id': usuario.id.toString()
        },
        body: JSON.stringify({
          proceso_id: procesoId,
          confirmar: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        setInformeFinal(data)
      }
    } catch (error) {
      console.error('Error finalizando informe:', error)
      alert('Error al finalizar el informe')
    } finally {
      setGenerando(false)
    }
  }

  const generacionRapida = async () => {
    setGenerando(true)

    try {
      const erpUrl = import.meta.env.VITE_ERP_URL || 'http://localhost:8000'

      const response = await fetch(`${erpUrl}/api/v1/informes/generar-rapido`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Usuario-Id': usuario.id.toString()
        },
        body: JSON.stringify({
          comisaria_id: comisariaSeleccionada,
          tipo_informe: tipoInforme
        })
      })

      if (response.ok) {
        const data = await response.json()
        setInformeFinal(data)
        setPaso('final')
      }
    } catch (error) {
      console.error('Error en generación rápida:', error)
      alert('Error al generar el informe rápido')
    } finally {
      setGenerando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <OfflineBanner />

      {/* Header */}
      <div className="bg-indigo-600 text-white px-4 pt-4 pb-6">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate('/comisaria/modulos')}
            className="p-1.5 -ml-1.5 rounded-lg active:bg-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Generador de Informes</h1>
            <p className="text-indigo-100 text-xs mt-0.5">
              {comisariaSeleccionadaObj?.nombre} · {usuario?.rol === 'monitor' ? 'Monitor' : 'Residente'}
            </p>
          </div>
          <Sparkles size={20} className="text-indigo-200" />
        </div>
      </div>

      {/* Contenido según paso */}
      <div className="flex-1 px-4 py-4">
        {paso === 'inicial' && (
          <>
            {/* Selector de tipo de informe */}
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-700 mb-3">Tipo de Informe</p>
              <div className="grid grid-cols-3 gap-2">
                {['semanal', 'quincenal', 'mensual'].map(tipo => (
                  <button
                    key={tipo}
                    onClick={() => setTipoInforme(tipo)}
                    className={`py-2 rounded-xl text-sm font-medium transition-colors ${
                      tipoInforme === tipo
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                    }`}
                  >
                    {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Botones de generación */}
            <div className="space-y-3">
              {/* Generación con IA */}
              <button
                onClick={iniciarGeneracion}
                disabled={generando}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-4 shadow-lg active:scale-95 transition-transform disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Sparkles size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Generación con IA</p>
                      <p className="text-xs text-white/80">
                        Informe personalizado con preguntas
                      </p>
                    </div>
                  </div>
                  <ChevronLeft size={20} className="rotate-180" />
                </div>
              </button>

              {/* Generación rápida */}
              <button
                onClick={generacionRapida}
                disabled={generando}
                className="w-full bg-white border-2 border-indigo-200 text-indigo-600 rounded-2xl p-4 active:bg-indigo-50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Zap size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Generación Rápida</p>
                      <p className="text-xs text-gray-600">
                        Informe estándar sin preguntas
                      </p>
                    </div>
                  </div>
                  <ChevronLeft size={20} className="rotate-180" />
                </div>
              </button>
            </div>

            {/* Informes anteriores */}
            {informesAnteriores.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Informes Anteriores</p>
                <div className="space-y-2">
                  {informesAnteriores.map(informe => (
                    <button
                      key={informe.id}
                      className="w-full bg-white rounded-xl p-3 border border-gray-200 text-left active:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {informe.numero}
                            </p>
                            <p className="text-xs text-gray-500">
                              {informe.fecha} · {informe.tipo}
                            </p>
                          </div>
                        </div>
                        <Download size={16} className="text-indigo-600" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {paso === 'preguntas' && preguntas.length > 0 && (
          <div className="space-y-4">
            <div className="bg-indigo-50 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <MessageSquare size={20} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-indigo-900">La IA necesita más información</p>
                  <p className="text-sm text-indigo-700 mt-1">
                    Responde estas preguntas para mejorar tu informe
                  </p>
                </div>
              </div>
            </div>

            {preguntas.map((pregunta, index) => (
              <div key={pregunta.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-sm font-medium text-gray-900 mb-3">
                  {index + 1}. {pregunta.pregunta}
                </p>

                {pregunta.tipo === 'texto' && (
                  <textarea
                    value={respuestas[pregunta.id] || ''}
                    onChange={e => responderPregunta(pregunta.id, e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none"
                    rows="3"
                  />
                )}

                {pregunta.tipo === 'seleccion' && (
                  <div className="space-y-2">
                    {pregunta.opciones?.map(opcion => (
                      <button
                        key={opcion}
                        onClick={() => responderPregunta(pregunta.id, opcion)}
                        className={`w-full px-3 py-2 rounded-xl text-sm text-left transition-colors ${
                          respuestas[pregunta.id] === opcion
                            ? 'bg-indigo-100 text-indigo-700 font-medium'
                            : 'bg-gray-50 text-gray-700 active:bg-gray-100'
                        }`}
                      >
                        {opcion}
                      </button>
                    ))}
                  </div>
                )}

                {pregunta.tipo === 'si_no' && (
                  <div className="grid grid-cols-2 gap-2">
                    {['Sí', 'No'].map(opcion => (
                      <button
                        key={opcion}
                        onClick={() => responderPregunta(pregunta.id, opcion)}
                        className={`py-2 rounded-xl text-sm font-medium transition-colors ${
                          respuestas[pregunta.id] === opcion
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                        }`}
                      >
                        {opcion}
                      </button>
                    ))}
                  </div>
                )}

                {pregunta.requerida && !respuestas[pregunta.id] && (
                  <p className="text-xs text-red-500 mt-2">* Respuesta requerida</p>
                )}
              </div>
            ))}

            <button
              onClick={() => generarBorrador()}
              disabled={generando || preguntas.some(p => p.requerida && !respuestas[p.id])}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold active:bg-indigo-700 disabled:opacity-50"
            >
              {generando ? 'Generando borrador...' : 'Generar Borrador'}
            </button>
          </div>
        )}

        {paso === 'borrador' && borrador && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-3">{borrador.titulo}</h2>

              <div className="prose prose-sm text-gray-700 max-w-none">
                <div dangerouslySetInnerHTML={{
                  __html: borrador.contenido_markdown
                    .replace(/^# /gm, '<h3 class="text-lg font-bold mt-4 mb-2">')
                    .replace(/^## /gm, '<h4 class="text-base font-semibold mt-3 mb-2">')
                    .replace(/^### /gm, '<h5 class="text-sm font-semibold mt-2 mb-1">')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^- /gm, '<li class="ml-4">')
                    .replace(/\n\n/g, '</p><p class="mb-3">')
                    .replace(/^([^<])/gm, '<p class="mb-3">$1')
                    .replace(/(<p[^>]*>)+$/g, '')
                }} />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPaso('preguntas')}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold active:bg-gray-300"
              >
                Revisar
              </button>
              <button
                onClick={finalizarInforme}
                disabled={generando}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold active:bg-indigo-700 disabled:opacity-50"
              >
                {generando ? 'Finalizando...' : 'Confirmar y Finalizar'}
              </button>
            </div>
          </div>
        )}

        {paso === 'final' && informeFinal && (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <CheckCircle size={24} className="text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Informe Generado</p>
                  <p className="text-sm text-green-700">{informeFinal.numero_informe}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-3">{informeFinal.titulo}</h2>

              <div className="space-y-2 text-sm text-gray-600">
                <p>📅 Período: {informeFinal.periodo_inicio} al {informeFinal.periodo_fin}</p>
                <p>👤 Autor: {informeFinal.autor_nombre}</p>
                <p>🏢 Comisaría: {informeFinal.comisaria_nombre}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Descargar:</p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-red-50 text-red-600 py-2 rounded-xl text-sm font-medium active:bg-red-100">
                    📄 PDF
                  </button>
                  <button className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-xl text-sm font-medium active:bg-blue-100">
                    📝 Word
                  </button>
                  <button className="flex-1 bg-green-50 text-green-600 py-2 rounded-xl text-sm font-medium active:bg-green-100">
                    📧 Enviar
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setPaso('inicial')
                setBorrador(null)
                setInformeFinal(null)
                setPreguntas([])
                setRespuestas({})
              }}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold active:bg-indigo-700"
            >
              Generar Nuevo Informe
            </button>
          </div>
        )}
      </div>
    </div>
  )
}