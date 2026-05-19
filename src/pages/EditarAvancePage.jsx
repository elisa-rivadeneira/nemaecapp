import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import GeoStatus, { calcularDistancia } from '../components/GeoStatus'
import OfflineBanner from '../components/OfflineBanner'
import { ArrowLeft, Camera, MapPin, Save, Trash2, X, Maximize2, AlertCircle, Plus } from 'lucide-react'

export default function EditarAvancePage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const avance = state?.avance
  const partida = state?.partida

  const {
    comisariaSeleccionada,
    comisariaSeleccionadaObj,
    usuario,
    editarAvance,
    getAcumuladoPartida,
    setUbicacion,
    ubicacionActual
  } = useAppStore()

  const comisaria = comisariaSeleccionadaObj
  const fileRef = useRef()

  // Estado inicial con datos del avance
  const [porcentaje, setPorcentaje] = useState(avance?.porcentajeDia?.toString() || '')
  const [observaciones, setObs] = useState(avance?.obs || '')
  const [fotos, setFotos] = useState(avance?.fotos || (avance?.foto ? [avance.foto] : []))
  const [nuevasFotos, setNuevasFotos] = useState([])
  const [geoError, setGeoError] = useState(false)
  const [advertenciaGeo, setAdvertenciaGeo] = useState(false)
  const [imagenExpandida, setImagenExpandida] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  // Calcular acumulados sin contar este avance
  const getAcumuladoSinEsteAvance = () => {
    const acumuladoTotal = getAcumuladoPartida(comisariaSeleccionada, partida?.codigo)
    return Math.max(0, acumuladoTotal - (avance?.porcentajeDia || 0))
  }

  const acumuladoBase = getAcumuladoSinEsteAvance()
  const maxPermitido = 100 - acumuladoBase
  const porcentajeNum = parseFloat(porcentaje) || 0
  const nuevoAcumulado = Math.min(acumuladoBase + porcentajeNum, 100)

  // Verificar permisos
  const puedeEditar = () => {
    const esMonitor = usuario?.rol === 'monitor'
    const esMiRegistro = avance?.monitor === usuario?.login
    const noVerificado = !avance?.verificado

    if (esMonitor) return true
    if (esMiRegistro && noVerificado) return true
    return false
  }

  useEffect(() => {
    if (!avance || !partida) {
      navigate('/partidas')
      return
    }
    if (!puedeEditar()) {
      setError('No tienes permisos para editar este avance')
    }
  }, [avance, partida])

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

  if (!avance || !partida) return null

  const distancia = calcularDistancia(ubicacionActual, comisariaSeleccionada)
  const fueraDeRango = distancia !== null && distancia > 0.5

  function handleFoto(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return

    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        setFotos(prev => [...prev, ev.target.result])
        setNuevasFotos(prev => [...prev, ev.target.result])
      }
      reader.readAsDataURL(file)
    })
  }

  function eliminarFoto(index) {
    setFotos(prev => prev.filter((_, i) => i !== index))
    // Si era una foto nueva, también quitarla de nuevasFotos
    const fotoEliminada = fotos[index]
    if (nuevasFotos.includes(fotoEliminada)) {
      setNuevasFotos(prev => prev.filter(f => f !== fotoEliminada))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!puedeEditar()) {
      setError('No tienes permisos para editar este avance')
      return
    }

    if (porcentajeNum <= 0 || porcentajeNum > maxPermitido) {
      setError(`El porcentaje debe estar entre 1 y ${maxPermitido}`)
      return
    }

    if (fueraDeRango && !advertenciaGeo) {
      setAdvertenciaGeo(true)
      return
    }

    setGuardando(true)
    try {
      await editarAvance(avance.id, {
        porcentajeDia: porcentajeNum,
        observaciones: observaciones.trim(),
        fotos: fotos,
        lat: ubicacionActual?.lat,
        lng: ubicacionActual?.lng,
        editadoPor: usuario?.login,
        fechaEdicion: new Date().toISOString()
      })

      navigate('/partidas/historial', { state: { partida } })
    } catch (err) {
      setError('Error al guardar los cambios')
      setGuardando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <OfflineBanner />

      {/* Header */}
      <div className="bg-brand-800 text-white px-4 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/partidas/historial', { state: { partida } })}
            className="p-1.5 rounded-lg bg-white/10 active:bg-white/20"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-blue-200 text-xs">Editar avance</p>
            <h1 className="font-bold text-sm leading-tight truncate">{comisaria?.nombre}</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-4 py-4 space-y-4 pb-8">
        {/* Alerta de permisos */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3 flex gap-2">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Info del avance original */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
          <p className="text-xs font-medium text-blue-800 mb-1">Información original</p>
          <div className="text-xs text-blue-700 space-y-0.5">
            <p>Fecha: {avance.fecha} • {avance.hora}</p>
            <p>Registrado por: {avance.monitor} ({avance.rolRegistrador})</p>
            {avance.verificado && (
              <p className="text-green-700 font-medium">✓ Verificado por {avance.monitorVerificador}</p>
            )}
          </div>
        </div>

        {/* Info partida */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            {partida.codigo}
          </span>
          <p className="font-semibold text-gray-900 mt-1 text-sm leading-tight">{partida.partida}</p>

          <div className="flex items-center gap-4 mt-3">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-700">{acumuladoBase}%</p>
              <p className="text-[10px] text-gray-400">base sin este</p>
            </div>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full"
                style={{ width: `${acumuladoBase}%` }}
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
            <AlertCircle size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-800">Estás fuera de la comisaría</p>
              <p className="text-xs text-orange-700 mt-0.5">
                Tu ubicación no coincide con la comisaría. El registro quedará marcado. ¿Confirmar de todos modos?
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                >
                  Confirmar igual
                </button>
                <button
                  type="button"
                  onClick={() => setAdvertenciaGeo(false)}
                  className="text-orange-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-orange-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Porcentaje del día */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Porcentaje de avance (%)
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
              disabled={!puedeEditar()}
            />
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                Acumulado nuevo: <span className="font-bold text-green-600">{nuevoAcumulado}%</span>
              </p>
              <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${nuevoAcumulado}%` }}
                />
              </div>
            </div>
          </div>

          {/* Botones rápidos */}
          <div className="flex gap-2 mt-3">
            {[5, 10, 15, 20, 25].filter(v => v <= maxPermitido).map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setPorcentaje(String(v))}
                disabled={!puedeEditar()}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  porcentajeNum === v
                    ? 'bg-brand-700 text-white border-brand-700'
                    : 'bg-gray-50 text-gray-700 border-gray-200 active:bg-gray-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {v}%
              </button>
            ))}
          </div>
        </div>

        {/* Observaciones */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Observaciones
          </label>
          <textarea
            rows={4}
            placeholder="Ej: Se completó la excavación del sector norte..."
            value={observaciones}
            onChange={e => setObs(e.target.value)}
            disabled={!puedeEditar()}
            className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Fotos */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Fotografías de evidencia - {fotos.length}/5
          </label>

          {/* Grid de miniaturas */}
          {fotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {fotos.map((foto, index) => (
                <div key={index} className="relative group">
                  <img
                    src={foto}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg cursor-pointer border border-gray-200"
                    onClick={() => setImagenExpandida(foto)}
                  />
                  <button
                    type="button"
                    onClick={() => setImagenExpandida(foto)}
                    className="absolute top-1 left-1 bg-black/50 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Maximize2 size={12} />
                  </button>
                  {puedeEditar() && (
                    <button
                      type="button"
                      onClick={() => eliminarFoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  )}
                  {nuevasFotos.includes(foto) && (
                    <span className="absolute bottom-1 left-1 bg-green-500 text-white text-[10px] px-1 rounded">
                      Nueva
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Indicador de fotos nuevas */}
          {nuevasFotos.length > 0 && (
            <p className="text-xs text-green-600 font-medium mb-2">
              ✓ {nuevasFotos.length} foto{nuevasFotos.length > 1 ? 's' : ''} nueva{nuevasFotos.length > 1 ? 's' : ''}
            </p>
          )}

          {/* Botón agregar foto */}
          {fotos.length < 5 && puedeEditar() && (
            <button
              type="button"
              onClick={() => fileRef.current.click()}
              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <Plus size={20} />
              <span className="text-sm font-medium">Agregar foto</span>
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={handleFoto}
            disabled={!puedeEditar()}
          />
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/partidas/historial', { state: { partida } })}
            className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold text-base"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!puedeEditar() || guardando || porcentajeNum <= 0 || porcentajeNum > maxPermitido}
            className="flex-1 bg-brand-700 text-white py-4 rounded-2xl font-bold text-base active:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-brand-200 flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>

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