import { getEstadoSemaforo, calcularProgramadoHoy } from '../data/mockData'

const COLORS = {
  completado: 'bg-blue-500',
  ok: 'bg-green-500',
  alerta: 'bg-yellow-400',
  critico: 'bg-red-500',
}

const LABEL_COLORS = {
  completado: 'text-blue-700 bg-blue-100',
  ok: 'text-green-700 bg-green-100',
  alerta: 'text-yellow-700 bg-yellow-100',
  critico: 'text-red-700 bg-red-100',
}

const LABELS = {
  completado: '✓ Completado',
  ok: 'Al día',
  alerta: 'Leve retraso',
  critico: 'Atrasado',
}

export default function ProgressBar({ partida, avanceReal, showLabels = false }) {
  const programado = calcularProgramadoHoy(partida)
  const estado = getEstadoSemaforo(avanceReal, programado)
  const barColor = COLORS[estado]

  return (
    <div className="space-y-1">
      <div className="relative h-2.5 bg-gray-200 rounded-full overflow-hidden">
        {/* Barra programada (fondo) */}
        <div
          className="absolute inset-y-0 left-0 bg-gray-300 rounded-full"
          style={{ width: `${programado}%` }}
        />
        {/* Barra real */}
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${avanceReal}%` }}
        />
      </div>
      {showLabels && (
        <div className="flex items-center justify-between">
          <div className="flex gap-2 text-xs text-gray-500">
            <span>Real: <span className="font-semibold text-gray-800">{avanceReal}%</span></span>
            <span>Prog: <span className="font-medium">{programado}%</span></span>
          </div>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${LABEL_COLORS[estado]}`}>
            {LABELS[estado]}
          </span>
        </div>
      )}
    </div>
  )
}
