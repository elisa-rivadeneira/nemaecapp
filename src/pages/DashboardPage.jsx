import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { COMISARIAS, calcularProgramadoHoy, getEstadoSemaforo } from '../data/mockData'
import { ArrowLeft, Building2, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

const SEMAFORO_STYLE = {
  completado: 'bg-blue-100 text-blue-700 border-blue-200',
  ok: 'bg-green-100 text-green-700 border-green-200',
  alerta: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  critico: 'bg-red-100 text-red-700 border-red-200',
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { getPartidasComisaria, getAcumuladoPartida, avances } = useAppStore()

  const resumenGlobal = COMISARIAS.map(com => {
    const partidas = getPartidasComisaria(com.id)
    const stats = { total: partidas.length, completadas: 0, ok: 0, alerta: 0, critico: 0 }
    let sumaAvance = 0

    partidas.forEach(p => {
      const avance = getAcumuladoPartida(com.id, p.codigo)
      const prog = calcularProgramadoHoy(p)
      const estado = getEstadoSemaforo(avance, prog)
      stats[estado] = (stats[estado] || 0) + 1
      sumaAvance += avance
    })

    const avanceGeneral = partidas.length > 0 ? Math.round(sumaAvance / partidas.length) : 0
    return { ...com, ...stats, avanceGeneral }
  }).filter(c => getPartidasComisaria(c.id).length > 0)

  const totalAvances = avances.length
  const hoy = new Date().toISOString().split('T')[0]
  const avancesHoy = avances.filter(a => a.fecha === hoy).length

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-brand-800 text-white px-4 pt-5 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg bg-white/10 active:bg-white/20">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-blue-200 text-xs">Supervisión general</p>
            <h1 className="font-bold text-base">Dashboard de avance</h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Tarjetas resumen */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500">Registros totales</p>
            <p className="text-2xl font-bold text-brand-700">{totalAvances}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{avancesHoy} hoy</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500">Comisarías activas</p>
            <p className="text-2xl font-bold text-brand-700">{COMISARIAS.length}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{resumenGlobal.length} con datos</p>
          </div>
        </div>

        {/* Por comisaría */}
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Building2 size={14} />
            Estado por comisaría
          </h2>

          <div className="space-y-3">
            {resumenGlobal.sort((a, b) => a.avanceGeneral - b.avanceGeneral).map(com => (
              <div key={com.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{com.nombre}</p>
                    <p className="text-[10px] text-gray-400 truncate">{com.proveedor}</p>
                  </div>
                  <span className="flex-shrink-0 text-xl font-bold text-brand-700 ml-2">{com.avanceGeneral}%</span>
                </div>

                {/* Barra */}
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all ${
                      com.avanceGeneral >= 80 ? 'bg-green-500' :
                      com.avanceGeneral >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${com.avanceGeneral}%` }}
                  />
                </div>

                {/* Semáforo partidas */}
                <div className="flex gap-2 flex-wrap">
                  {com.completadas > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1">
                      <CheckCircle size={10} />{com.completadas} completadas
                    </span>
                  )}
                  {com.ok > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                      <TrendingUp size={10} />{com.ok} al día
                    </span>
                  )}
                  {com.alerta > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium bg-yellow-100 text-yellow-700 border-yellow-200 flex items-center gap-1">
                      <AlertTriangle size={10} />{com.alerta} alerta
                    </span>
                  )}
                  {com.critico > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium bg-red-100 text-red-700 border-red-200 flex items-center gap-1">
                      <AlertTriangle size={10} />{com.critico} critico
                    </span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium bg-gray-100 text-gray-600 border-gray-200 flex items-center gap-1">
                    <Clock size={10} />{com.total} total
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Últimos registros */}
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-2">Últimos registros</h2>
          <div className="space-y-2">
            {[...avances].reverse().slice(0, 10).map(av => {
              const com = COMISARIAS.find(c => c.id === av.comisariaId)
              return (
                <div key={av.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    !av.sincronizado ? 'bg-orange-100 text-orange-700' :
                    av.rolRegistrador === 'residente' && !av.verificado ? 'bg-yellow-100 text-yellow-700' :
                    'bg-brand-100 text-brand-700'
                  }`}>
                    +{av.porcentajeDia}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{av.codigo} — {com?.nombre}</p>
                    <p className="text-[10px] text-gray-400">
                      {av.fecha} · {av.monitor}
                      {av.rolRegistrador === 'residente' ? ' (residente)' : ''}
                    </p>
                    {av.verificado && av.acuerdoConAvance === false && (
                      <p className="text-[9px] text-orange-600 font-medium">Corregido por {av.monitorVerificador}: {av.porcentajeDiaMonitor}%</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">{av.acumulado}%</p>
                    {!av.sincronizado && <p className="text-[9px] text-orange-500">Pendiente sync</p>}
                    {av.rolRegistrador === 'residente' && !av.verificado && (
                      <p className="text-[9px] text-yellow-600 font-medium">Sin verificar</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
