import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { ArrowLeft, CheckCircle, AlertCircle, XCircle, Camera, MessageSquare } from 'lucide-react'

// Partidas validables por comisario (aspectos visuales/funcionales)
const PARTIDAS_VALIDABLES_COMISARIO = [
  '04.01.01', // PISO PORCELANATO
  '04.03.04', // PINTURA CIELORRASO
  '04.04.01', // PUERTA CONTRAPLACADA
  '04.04.02', // PUERTA CONTRAPLACADA C/LUNETA
  '02.16',    // DESMONTAJE DE LUMINARIAS
]

// Preguntas de validación por tipo de partida
const PREGUNTAS_VALIDACION = {
  '04.01.01': {
    titulo: 'Piso Porcelanato',
    preguntas: [
      '¿El piso está completamente instalado?',
      '¿El acabado es uniforme sin desniveles?',
      '¿No hay baldosas rotas o manchadas?'
    ]
  },
  '04.03.04': {
    titulo: 'Pintura de Cielorraso',
    preguntas: [
      '¿La pintura está completa en toda el área?',
      '¿El color es uniforme sin manchas?',
      '¿No hay goteos ni imperfecciones visibles?'
    ]
  },
  '04.04.01': {
    titulo: 'Puertas',
    preguntas: [
      '¿Las puertas están instaladas correctamente?',
      '¿Abren y cierran sin problemas?',
      '¿Las chapas funcionan correctamente?'
    ]
  },
  '04.04.02': {
    titulo: 'Puertas con Luneta',
    preguntas: [
      '¿Las puertas están instaladas correctamente?',
      '¿Los vidrios de las lunetas están sin roturas?',
      '¿Abren y cierran sin problemas?'
    ]
  },
  '02.16': {
    titulo: 'Luminarias',
    preguntas: [
      '¿Las luminarias están correctamente instaladas?',
      '¿Todas las luces funcionan?',
      '¿La iluminación es adecuada para el ambiente?'
    ]
  }
}

export default function ValidacionesComisarioPage() {
  const navigate = useNavigate()
  const { usuario, comisariaSeleccionada, getPartidasComisaria, getAcumuladoPartida } = useAppStore()
  const [partidasPendientes, setPartidasPendientes] = useState([])
  const [partidaSeleccionada, setPartidaSeleccionada] = useState(null)
  const [respuestas, setRespuestas] = useState({})
  const [observaciones, setObservaciones] = useState('')
  const [foto, setFoto] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  useEffect(() => {
    // Filtrar partidas al 100% que son validables por el comisario
    const partidas = getPartidasComisaria(comisariaSeleccionada)
    const pendientes = partidas.filter(p => {
      const acumulado = getAcumuladoPartida(comisariaSeleccionada, p.codigo)
      return acumulado >= 100 && PARTIDAS_VALIDABLES_COMISARIO.includes(p.codigo)
    })
    setPartidasPendientes(pendientes)
  }, [comisariaSeleccionada])

  const iniciarValidacion = (partida) => {
    setPartidaSeleccionada(partida)
    setMostrarFormulario(true)
    setRespuestas({})
    setObservaciones('')
    setFoto(null)
  }

  const handleRespuesta = (preguntaIdx, valor) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaIdx]: valor
    }))
  }

  const handleFoto = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setFoto(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const guardarValidacion = () => {
    const todasConforme = Object.values(respuestas).every(r => r === true)
    const estado = todasConforme ? 'CONFORME' :
                   Object.values(respuestas).some(r => r === false) ? 'NO_CONFORME' :
                   'CON_OBSERVACIONES'

    // Aquí guardaríamos en el store/backend
    console.log('Validación guardada:', {
      partida: partidaSeleccionada.codigo,
      estado,
      respuestas,
      observaciones,
      foto
    })

    alert(`Validación guardada: ${estado}`)
    setMostrarFormulario(false)
    setPartidaSeleccionada(null)
  }

  const esComisario = usuario?.rol === 'comisario'

  if (!esComisario) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6 text-center">
          <AlertCircle className="text-yellow-500 mx-auto mb-3" size={48} />
          <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
          <p className="text-gray-600 mb-4">Esta sección es exclusiva para Comisarios</p>
          <button
            onClick={() => navigate('/comisaria/modulos')}
            className="px-4 py-2 bg-brand-700 text-white rounded-lg"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-800 text-white p-4 flex items-center gap-3">
        <button onClick={() => navigate('/comisaria/modulos')} className="p-1">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold">Validaciones Pendientes</h1>
          <p className="text-xs opacity-90">Comisario: {usuario?.nombre}</p>
        </div>
      </div>

      {!mostrarFormulario ? (
        // Lista de partidas pendientes
        <div className="p-4 space-y-3">
          {partidasPendientes.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-center">
              <CheckCircle className="text-green-500 mx-auto mb-3" size={48} />
              <p className="text-gray-600">No hay partidas pendientes de validación</p>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <p className="text-blue-800 font-medium">
                  {partidasPendientes.length} partidas completadas esperan su validación
                </p>
              </div>

              {partidasPendientes.map((partida) => {
                const config = PREGUNTAS_VALIDACION[partida.codigo]
                return (
                  <div
                    key={partida.codigo}
                    className="bg-white rounded-lg shadow p-4 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {partida.codigo} - {config?.titulo || partida.partida}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {partida.partida}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
                          <CheckCircle size={14} />
                          <span>Completado al 100%</span>
                        </div>
                      </div>
                      <button
                        onClick={() => iniciarValidacion(partida)}
                        className="px-4 py-2 bg-brand-700 text-white rounded-lg text-sm font-medium"
                      >
                        Validar
                      </button>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      ) : (
        // Formulario de validación
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold text-lg mb-3">
              Validar: {PREGUNTAS_VALIDACION[partidaSeleccionada.codigo]?.titulo}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {partidaSeleccionada.partida}
            </p>

            {/* Preguntas de validación */}
            <div className="space-y-4">
              {PREGUNTAS_VALIDACION[partidaSeleccionada.codigo]?.preguntas.map((pregunta, idx) => (
                <div key={idx} className="border rounded-lg p-3">
                  <p className="text-sm font-medium mb-2">{pregunta}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespuesta(idx, true)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        respuestas[idx] === true
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <CheckCircle className="inline mr-1" size={16} />
                      Sí
                    </button>
                    <button
                      onClick={() => handleRespuesta(idx, false)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        respuestas[idx] === false
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <XCircle className="inline mr-1" size={16} />
                      No
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Observaciones */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">
                <MessageSquare className="inline mr-1" size={16} />
                Observaciones (opcional)
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full p-3 border rounded-lg text-sm"
                rows={3}
                placeholder="Agregue cualquier observación adicional..."
              />
            </div>

            {/* Foto */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">
                <Camera className="inline mr-1" size={16} />
                Evidencia fotográfica (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFoto}
                className="w-full text-sm"
              />
              {foto && (
                <img src={foto} alt="Evidencia" className="mt-2 rounded-lg max-h-40 object-cover" />
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setMostrarFormulario(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={guardarValidacion}
                disabled={Object.keys(respuestas).length === 0}
                className="flex-1 py-3 bg-brand-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                Guardar Validación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}