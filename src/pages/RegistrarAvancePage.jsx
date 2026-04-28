import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import GeoStatus, { calcularDistancia } from '../components/GeoStatus'
import OfflineBanner from '../components/OfflineBanner'
import { ArrowLeft, Camera, MapPin, CheckCircle, AlertTriangle, Info } from 'lucide-react'

export default function RegistrarAvancePage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const partida = state?.partida

  const { comisariaSeleccionada, comisariaSeleccionadaObj, usuario, registrarAvance, getAcumuladoPartida, setUbicacion, ubicacionActual } = useAppStore()
  const comisaria = comisariaSeleccionadaObj

  const acumuladoActual = getAcumuladoPartida(comisariaSeleccionada, partida?.codigo)
  const [porcentaje, setPorcentaje] = useState('')
  const [observaciones, setObs] = useState('')
  const [foto, setFoto] = useState(null)
  const [geoError, setGeoError] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [advertenciaGeo, setAdvertenciaGeo] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    if (!partida) navigate('/partidas')
  }, [partida, navigate])

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => {
        const ub = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUbicacion(ub)
      },
      () => setGeoError(true),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [setUbicacion])

  if (!partida) return null

  const maxPermitido = 100 - acumuladoActual
  const porcentajeNum = parseFloat(porcentaje) || 0
  const nuevoAcumulado = Math.min(acumuladoActual + porcentajeNum, 100)
  const distancia = calcularDistancia(ubicacionActual, comisariaSeleccionada)
  const fueraDeRango = distancia !== null && distancia > 0.5

  function handleFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setFoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (porcentajeNum <= 0 || porcentajeNum > maxPermitido) return
    if (fueraDeRango && !advertenciaGeo) {
      setAdvertenciaGeo(true)
      return
    }
    registrarAvance({
      comisariaId: comisariaSeleccionada,
      codigo: partida.codigo,
      porcentajeDia: porcentajeNum,
      observaciones,
      foto,
      lat: ubicacionActual?.lat,
      lng: ubicacionActual?.lng,
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="text-green-600" size={40} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">¡Avance registrado!</h2>
        <p className="text-gray-500 text-sm mb-1">{partida.partida}</p>
        <div className="flex gap-4 mt-3 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-700">+{porcentajeNum}%</p>
            <p className="text-xs text-gray-400">del día</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{nuevoAcumulado}%</p>
            <p className="text-xs text-gray-400">total acumulado</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/partidas')}
          className="w-full max-w-xs bg-brand-700 text-white py-3 rounded-xl font-semibold"
        >
          Volver a partidas
        </button>
        <button
          onClick={() => { setSubmitted(false); setPorcentaje(''); setObs(''); setFoto(null); setAdvertenciaGeo(false) }}
          className="w-full max-w-xs mt-2 text-brand-700 py-3 rounded-xl font-medium text-sm"
        >
          Registrar otra partida
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
            <p className="text-blue-200 text-xs">
          {usuario?.rol === 'residente' ? 'Registrar avance — Residente' : 'Registrar avance — Monitor'}
        </p>
            <h1 className="font-bold text-sm leading-tight truncate">{comisaria?.nombre}</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-4 py-4 space-y-4 pb-8">
        {/* Info partida */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{partida.codigo}</span>
          <p className="font-semibold text-gray-900 mt-1 text-sm leading-tight">{partida.partida}</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-700">{acumuladoActual}%</p>
              <p className="text-[10px] text-gray-400">acumulado</p>
            </div>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full"
                style={{ width: `${acumuladoActual}%` }}
              />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-brand-700">{maxPermitido}%</p>
              <p className="text-[10px] text-gray-400">disponible</p>
            </div>
          </div>
        </div>

        {/* Geolocalización */}
        <div className={`rounded-2xl p-3 border flex items-center gap-2 ${
          geoError ? 'bg-gray-50 border-gray-200' :
          fueraDeRango ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'
        }`}>
          <MapPin size={16} className={fueraDeRango ? 'text-orange-500' : 'text-green-600'} />
          <div className="flex-1">
            <GeoStatus ubicacion={ubicacionActual} comisariaId={comisariaSeleccionada} />
            {geoError && <p className="text-xs text-gray-500 mt-0.5">Activa el GPS para verificar tu ubicación</p>}
          </div>
        </div>

        {/* Advertencia fuera de rango */}
        {advertenciaGeo && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 flex gap-2">
            <AlertTriangle size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-800">Estás fuera de la comisaría</p>
              <p className="text-xs text-orange-700 mt-0.5">Tu ubicación no coincide con la comisaría. El registro quedará marcado. ¿Confirmar de todos modos?</p>
              <div className="flex gap-2 mt-2">
                <button type="submit" className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                  Confirmar igual
                </button>
                <button type="button" onClick={() => setAdvertenciaGeo(false)} className="text-orange-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-orange-300">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Porcentaje del día */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            ¿Cuánto avanzaron hoy? (%)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max={maxPermitido}
              step="1"
              placeholder="0"
              value={porcentaje}
              onChange={e => setPorcentaje(e.target.value)}
              className="w-24 text-center text-2xl font-bold border-2 border-brand-300 rounded-xl py-3 focus:outline-none focus:border-brand-600"
            />
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                Acumulado nuevo: <span className="font-bold text-green-600">{nuevoAcumulado}%</span>
              </p>
              <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${nuevoAcumulado}%` }} />
              </div>
              {porcentajeNum > maxPermitido && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <Info size={10} /> Máximo disponible: {maxPermitido}%
                </p>
              )}
            </div>
          </div>

          {/* Botones rápidos */}
          <div className="flex gap-2 mt-3">
            {[5, 10, 15, 20, 25].filter(v => v <= maxPermitido).map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setPorcentaje(String(v))}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  porcentajeNum === v
                    ? 'bg-brand-700 text-white border-brand-700'
                    : 'bg-gray-50 text-gray-700 border-gray-200 active:bg-gray-100'
                }`}
              >
                {v}%
              </button>
            ))}
            {maxPermitido > 0 && maxPermitido <= 100 && (
              <button
                type="button"
                onClick={() => setPorcentaje(String(maxPermitido))}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  porcentajeNum === maxPermitido
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-green-50 text-green-700 border-green-200'
                }`}
              >
                100%
              </button>
            )}
          </div>
        </div>

        {/* Observaciones */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-800 mb-2">Observaciones (opcional)</label>
          <textarea
            rows={3}
            placeholder="Ej: Se completó la excavación del sector norte..."
            value={observaciones}
            onChange={e => setObs(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>

        {/* Foto */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-800 mb-2">Foto de evidencia (opcional)</label>
          {foto ? (
            <div className="relative">
              <img src={foto} alt="Evidencia" className="w-full h-40 object-cover rounded-xl" />
              <button
                type="button"
                onClick={() => setFoto(null)}
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
          disabled={porcentajeNum <= 0 || porcentajeNum > maxPermitido}
          className="w-full bg-brand-700 text-white py-4 rounded-2xl font-bold text-base active:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-brand-200"
        >
          Registrar {porcentajeNum > 0 ? `${porcentajeNum}%` : ''} de avance
        </button>
      </form>
    </div>
  )
}
