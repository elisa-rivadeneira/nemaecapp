import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { calcularProgramadoHoy, getEstadoSemaforo } from '../data/mockData'
import ProgressBar from '../components/ProgressBar'
import OfflineBanner from '../components/OfflineBanner'
import { Search, ArrowLeft, CheckCircle2, Clock, AlertTriangle, XCircle, ShieldCheck, ClipboardList, History } from 'lucide-react'

const FILTROS = [
  { key: 'todos', label: 'Todos' },
  { key: 'critico', label: 'Atrasados' },
  { key: 'alerta', label: 'Alerta' },
  { key: 'ok', label: 'Al día' },
  { key: 'completado', label: 'Completos' },
]

const ESTADO_ICON = {
  completado: <CheckCircle2 size={14} className="text-blue-500" />,
  ok: <CheckCircle2 size={14} className="text-green-500" />,
  alerta: <AlertTriangle size={14} className="text-yellow-500" />,
  critico: <XCircle size={14} className="text-red-500" />,
}

export default function PartidasPage() {
  const navigate = useNavigate()
  const { comisariaSeleccionada, comisariaSeleccionadaObj, usuario, getPartidasComisaria, getAcumuladoPartida, getAvancesPartida } = useAppStore()
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [expandida, setExpandida] = useState(null)

  const esMonitor = !usuario?.rol || usuario?.rol === 'monitor'
  const comisaria = comisariaSeleccionadaObj
  const partidas = getPartidasComisaria(comisariaSeleccionada)

  function getAvancePendienteVerificacion(codigoPartida) {
    const avances = getAvancesPartida(comisariaSeleccionada, codigoPartida)
    return avances.find(a => a.rolRegistrador === 'residente' && a.verificado === false) || null
  }

  const partidasFiltradas = partidas.filter(p => {
    const avance = getAcumuladoPartida(comisariaSeleccionada, p.codigo)
    const prog = calcularProgramadoHoy(p)
    const estado = getEstadoSemaforo(avance, prog)
    const coincideBusqueda =
      !busqueda ||
      p.partida.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.includes(busqueda)
    const coincideFiltro = filtro === 'todos' || estado === filtro
    return coincideBusqueda && coincideFiltro
  })

  function handleRegistrar(partida) {
    navigate('/registrar', { state: { partida } })
  }

  function handleVerificar(partida) {
    const avance = getAvancePendienteVerificacion(partida.codigo)
    if (avance) navigate('/verificar', { state: { avance, partida } })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <OfflineBanner />

      {/* Header */}
      <div className="bg-brand-800 text-white px-4 pt-5 pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/comisaria')} className="p-1.5 rounded-lg bg-white/10 active:bg-white/20">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-blue-200 text-xs">Partidas de obra</p>
            <h1 className="font-bold text-base leading-tight truncate">{comisaria?.nombre}</h1>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar partida o código..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full bg-white text-gray-900 pl-9 pr-4 py-2.5 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none bg-white border-b border-gray-100 sticky top-[136px] z-10">
        {FILTROS.map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filtro === f.key
                ? 'bg-brand-700 text-white'
                : 'bg-gray-100 text-gray-600 active:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="flex-1 px-4 py-3 space-y-2 pb-24">
        <p className="text-xs text-gray-500">{partidasFiltradas.length} partidas</p>

        {partidasFiltradas.map(partida => {
          const avance = getAcumuladoPartida(comisariaSeleccionada, partida.codigo)
          const prog = calcularProgramadoHoy(partida)
          const estado = getEstadoSemaforo(avance, prog)
          const isOpen = expandida === partida.codigo
          const pendiente = esMonitor ? getAvancePendienteVerificacion(partida.codigo) : null

          return (
            <div
              key={partida.codigo}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <button
                className="w-full text-left p-4 active:bg-gray-50"
                onClick={() => setExpandida(isOpen ? null : partida.codigo)}
              >
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 mt-0.5">{ESTADO_ICON[estado]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{partida.codigo}</span>
                        <p className="text-sm font-medium text-gray-800 mt-0.5 leading-tight">{partida.partida}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="flex-shrink-0 text-lg font-bold text-brand-700">{avance}%</span>
                        {pendiente && (
                          <span className="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                            <Clock size={8} /> Pend. verificar
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <ProgressBar partida={partida} avanceReal={avance} showLabels />
                    </div>
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-1">
                    <div><span className="text-gray-400">Und:</span> {partida.und || partida.unidad || '—'}</div>
                    <div><span className="text-gray-400">Metrado:</span> {partida.metrado ?? '—'}</div>
                    <div><span className="text-gray-400">Inicio:</span> {partida.inicio || '—'}</div>
                    <div><span className="text-gray-400">Fin:</span> {partida.fin || '—'}</div>
                    <div><span className="text-gray-400">Monto:</span> {partida.parcial != null ? `S/ ${partida.parcial.toLocaleString('es-PE', { maximumFractionDigits: 2 })}` : '—'}</div>
                    <div><span className="text-gray-400">Prog. hoy:</span> {prog}%</div>
                  </div>

                  {/* Botón verificar — solo para monitores con avance pendiente */}
                  {esMonitor && pendiente && (
                    <button
                      onClick={() => handleVerificar(partida)}
                      className="w-full bg-yellow-500 text-white py-2.5 rounded-xl text-sm font-semibold active:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShieldCheck size={16} />
                      Verificar avance del residente (+{pendiente.porcentajeDia}%)
                    </button>
                  )}

                  <div className="flex gap-2">
                    {/* Botón historial */}
                    <button
                      onClick={() => navigate('/partidas/historial', { state: { partida } })}
                      className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-semibold active:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <History size={16} />
                      Ver historial
                    </button>

                    {/* Botón registrar — para todos */}
                    <button
                      onClick={() => handleRegistrar(partida)}
                      disabled={avance >= 100}
                      className="flex-1 bg-brand-700 text-white py-2.5 rounded-xl text-sm font-semibold active:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      <ClipboardList size={16} />
                      {avance >= 100 ? 'Completada' : 'Registrar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {partidasFiltradas.length === 0 && (
          <div className="text-center text-gray-400 mt-12">
            <Search size={36} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No se encontraron partidas</p>
          </div>
        )}
      </div>
    </div>
  )
}
