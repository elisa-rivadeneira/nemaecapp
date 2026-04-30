import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { COMISARIAS, USUARIOS } from '../data/mockData'
import OfflineBanner from '../components/OfflineBanner'
import { ArrowLeft, ShieldCheck, ShieldAlert, Camera, CheckCircle, Info, User } from 'lucide-react'

export default function VerificarAvancePage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const avance = state?.avance
  const partida = state?.partida

  const { comisariaSeleccionada, verificarAvance, getAcumuladoPartida, getAvancesPartida } = useAppStore()
  const comisaria = COMISARIAS.find(c => c.id === comisariaSeleccionada)
  const residente = USUARIOS.find(u => u.login === avance?.monitor)

  const avancesAnteriores = getAvancesPartida(comisariaSeleccionada, partida?.codigo)
  const acumuladoActual = getAcumuladoPartida(comisariaSeleccionada, partida?.codigo)
  const acumuladoAnterior = acumuladoActual - avance?.porcentajeDia

  const [decision, setDecision] = useState(null) // 'confirmar' | 'corregir'
  const [porcentajeMonitor, setPorcentajeMonitor] = useState('')
  const [obsMonitor, setObsMonitor] = useState('')
  const [fotoMonitor, setFotoMonitor] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [resultado, setResultado] = useState(null)
  const fileRef = useRef()

  useEffect(() => {
    if (!avance || !partida) navigate('/partidas')
  }, [avance, partida, navigate])

  if (!avance || !partida) return null

  const maxPermitido = 100 - acumuladoAnterior
  const porcentajeNum = parseFloat(porcentajeMonitor) || 0
  const nuevoAcumulado = decision === 'confirmar' ? acumuladoActual : Math.min(acumuladoAnterior + porcentajeNum, 100)
  const esValido = decision === 'confirmar' || (decision === 'corregir' && porcentajeNum > 0 && porcentajeNum <= maxPermitido)

  function handleFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setFotoMonitor(ev.target.result)
    reader.readAsDataURL(file)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!esValido) return

    const acuerdoConAvance = decision === 'confirmar'
    verificarAvance(avance.id, {
      acuerdoConAvance,
      porcentajeDiaMonitor: acuerdoConAvance ? null : porcentajeNum,
      obsMonitor,
      fotoMonitor,
    })

    setResultado({ acuerdoConAvance, porcentajeNum })
    setSubmitted(true)
  }

  if (submitted && resultado) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
          resultado.acuerdoConAvance ? 'bg-green-100' : 'bg-orange-100'
        }`}>
          {resultado.acuerdoConAvance
            ? <ShieldCheck className="text-green-600" size={40} />
            : <ShieldAlert className="text-orange-500" size={40} />
          }
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {resultado.acuerdoConAvance ? '¡Avance verificado!' : 'Avance corregido'}
        </h2>
        <p className="text-gray-500 text-sm mb-1">{partida.partida}</p>

        {resultado.acuerdoConAvance ? (
          <p className="text-green-600 font-semibold mt-2">
            Confirmaste el {avance.porcentajeDia}% reportado por el residente
          </p>
        ) : (
          <div className="flex gap-4 mt-3">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-400 line-through">{avance.porcentajeDia}%</p>
              <p className="text-[10px] text-gray-400">reportado</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-orange-500">{resultado.porcentajeNum}%</p>
              <p className="text-[10px] text-gray-400">corregido</p>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/partidas')}
          className="w-full max-w-xs mt-6 bg-brand-700 text-white py-3 rounded-xl font-semibold"
        >
          Volver a partidas
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <OfflineBanner />

      {/* Header */}
      <div className="bg-brand-800 text-white px-4 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/partidas')} className="p-1.5 rounded-lg bg-white/10 active:bg-white/20">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-blue-200 text-xs">Verificar avance — Monitor</p>
            <h1 className="font-bold text-sm leading-tight truncate">{comisaria?.nombre}</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-4 py-4 space-y-4 pb-8">
        {/* Info de la partida */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{partida.codigo}</span>
          <p className="font-semibold text-gray-900 mt-1 text-sm leading-tight">{partida.partida}</p>
        </div>

        {/* Avance reportado por el residente */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <User size={14} className="text-blue-600" />
            <p className="text-xs font-semibold text-blue-800">
              Avance reportado por {residente?.nombre || avance.monitor}
            </p>
            <span className="text-[10px] text-blue-500 ml-auto">{avance.fecha} {avance.hora && `· ${avance.hora}`}</span>
          </div>

          <div className="space-y-3">
            {/* Progreso actual */}
            <div className="bg-white rounded-lg p-2">
              <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                <span>Avance anterior verificado:</span>
                <span className="font-semibold">{acumuladoAnterior}%</span>
              </div>
              <div className="flex justify-between items-center text-xs text-blue-600 mb-1">
                <span>Propone agregar hoy:</span>
                <span className="font-bold">+{avance.porcentajeDia}%</span>
              </div>
              <div className="border-t pt-1 flex justify-between items-center text-sm font-bold">
                <span className="text-gray-700">Total si se aprueba:</span>
                <span className="text-blue-700">{avance.acumulado}%</span>
              </div>
            </div>

            {/* Barra de progreso visual */}
            <div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden relative">
                {/* Avance verificado anterior */}
                <div className="absolute h-full bg-green-500 rounded-full" style={{ width: `${acumuladoAnterior}%` }} />
                {/* Avance propuesto por residente */}
                <div className="absolute h-full bg-blue-400 rounded-full opacity-70"
                     style={{ left: `${acumuladoAnterior}%`, width: `${avance.porcentajeDia}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-green-600">Verificado: {acumuladoAnterior}%</span>
                <span className="text-[10px] text-blue-600">Pendiente: +{avance.porcentajeDia}%</span>
              </div>
            </div>
          </div>

          {avance.obs ? (
            <div className="bg-white rounded-xl px-3 py-2 text-xs text-gray-700 border border-blue-100">
              <span className="text-gray-400 block mb-0.5">Observaciones del residente:</span>
              {avance.obs}
            </div>
          ) : null}

          {avance.foto && (
            <div className="mt-2">
              <p className="text-[10px] text-blue-500 mb-1">Foto del residente:</p>
              <img src={avance.foto} alt="Evidencia residente" className="w-full h-32 object-cover rounded-xl" />
            </div>
          )}
        </div>

        {/* Decisión del monitor */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm font-semibold text-gray-800 mb-3">¿El porcentaje reportado es correcto?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setDecision('confirmar'); setPorcentajeMonitor('') }}
              className={`py-3 rounded-xl text-sm font-semibold border-2 transition-colors flex flex-col items-center gap-1 ${
                decision === 'confirmar'
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-green-50 text-green-700 border-green-200 active:bg-green-100'
              }`}
            >
              <ShieldCheck size={20} />
              Sí, confirmo
            </button>
            <button
              type="button"
              onClick={() => setDecision('corregir')}
              className={`py-3 rounded-xl text-sm font-semibold border-2 transition-colors flex flex-col items-center gap-1 ${
                decision === 'corregir'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-orange-50 text-orange-700 border-orange-200 active:bg-orange-100'
              }`}
            >
              <ShieldAlert size={20} />
              No, corregir
            </button>
          </div>
        </div>

        {/* Input del % correcto — solo si decide corregir */}
        {decision === 'corregir' && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <label className="block text-sm font-semibold text-orange-800 mb-3">
              ¿Cuál es el porcentaje real avanzado hoy?
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max={maxPermitido}
                step="1"
                placeholder="0"
                value={porcentajeMonitor}
                onChange={e => setPorcentajeMonitor(e.target.value)}
                className="w-24 text-center text-2xl font-bold border-2 border-orange-300 rounded-xl py-3 focus:outline-none focus:border-orange-500 bg-white"
              />
              <div className="flex-1">
                <p className="text-xs text-orange-600">
                  Avance verificado anterior: <span className="font-semibold">{acumuladoAnterior}%</span>
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  Residente propuso: <span className="font-bold line-through">+{avance.porcentajeDia}%</span>
                </p>
                {porcentajeNum > 0 && (
                  <p className="text-sm text-orange-800 font-bold mt-1">
                    Nuevo total: {nuevoAcumulado}% (con +{porcentajeNum}%)
                  </p>
                )}
                {porcentajeNum > 100 && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <Info size={10} /> Máximo: 100%
                  </p>
                )}
              </div>
            </div>
            {/* Botones rápidos */}
            <div className="flex gap-2 mt-3">
              {[5, 10, 15, 20, 25, 30].filter(v => v < avance.porcentajeDia).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setPorcentajeMonitor(String(v))}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    porcentajeNum === v
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-orange-700 border-orange-200 active:bg-orange-50'
                  }`}
                >
                  {v}%
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Observaciones del monitor */}
        {decision && (
          <>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Tus observaciones {decision === 'corregir' ? '(explica la corrección)' : '(opcional)'}
              </label>
              <textarea
                rows={3}
                placeholder={decision === 'corregir'
                  ? 'Ej: El sector B aún no está terminado, solo avanzaron un 20%...'
                  : 'Ej: Se verificó in situ, el avance es correcto...'
                }
                value={obsMonitor}
                onChange={e => setObsMonitor(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>

            {/* Foto del monitor */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Tu foto de evidencia (opcional)</label>
              {fotoMonitor ? (
                <div className="relative">
                  <img src={fotoMonitor} alt="Evidencia monitor" className="w-full h-40 object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => setFotoMonitor(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                  >×</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current.click()}
                  className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 active:bg-gray-50"
                >
                  <Camera size={24} />
                  <span className="text-xs">Tomar foto o subir imagen</span>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFoto}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!esValido}
              className={`w-full py-4 rounded-2xl font-bold text-base transition-colors shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
                decision === 'confirmar'
                  ? 'bg-green-600 text-white active:bg-green-700 shadow-green-200'
                  : 'bg-orange-500 text-white active:bg-orange-600 shadow-orange-200'
              }`}
            >
              {decision === 'confirmar'
                ? `Confirmar ${avance.porcentajeDia}% de avance`
                : `Corregir a ${porcentajeNum > 0 ? porcentajeNum + '%' : '...'} de avance`
              }
            </button>
          </>
        )}
      </form>
    </div>
  )
}
