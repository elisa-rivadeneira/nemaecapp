import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { HardHat, Eye, EyeOff, AlertCircle, MapPin, Loader2, ShieldAlert, RefreshCw } from 'lucide-react'

// Estados del flujo de GPS
const GPS_IDLE = 'idle'
const GPS_REQUESTING = 'requesting'
const GPS_OK = 'ok'
const GPS_DENIED = 'denied'
const GPS_UNAVAILABLE = 'unavailable'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, setUbicacion, setLoginUbicacion } = useAppStore()
  const [form, setForm] = useState({ login: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [gpsEstado, setGpsEstado] = useState(GPS_IDLE)
  const [pendingNavigate, setPendingNavigate] = useState(false)

  function pedirGps(onSuccess, onFail) {
    if (!navigator.geolocation) {
      setGpsEstado(GPS_UNAVAILABLE)
      onFail()
      return
    }
    setGpsEstado(GPS_REQUESTING)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const ub = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          timestamp: new Date().toISOString(),
        }
        setUbicacion(ub)
        setLoginUbicacion(ub)
        setGpsEstado(GPS_OK)
        onSuccess(ub)
      },
      err => {
        // err.code: 1=PERMISSION_DENIED, 2=UNAVAILABLE, 3=TIMEOUT
        setGpsEstado(err.code === 1 ? GPS_DENIED : GPS_UNAVAILABLE)
        onFail(err)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setPendingNavigate(true)

    const ok = await login(form.login.trim().toLowerCase(), form.password.trim())
    if (!ok) {
      setPendingNavigate(false)
      setError('Usuario o contraseña incorrectos')
      return
    }

    pedirGps(
      () => navigate('/comisaria'),
      () => { setPendingNavigate(false) }
    )
  }

  function handleReintentar() {
    setPendingNavigate(true)
    pedirGps(
      () => navigate('/comisaria'),
      () => setPendingNavigate(false)
    )
  }

  function handleContinuarSinGps() {
    setLoginUbicacion(null)
    navigate('/comisaria')
  }

  const cargando = pendingNavigate && gpsEstado === GPS_REQUESTING
  const mostrarModalGps = gpsEstado === GPS_DENIED || gpsEstado === GPS_UNAVAILABLE

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-800 to-brand-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-2xl mb-4">
            <HardHat className="text-white" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-white">Monitor de Obra</h1>
          <p className="text-blue-200 text-sm mt-1">NEMAEC — Sistema de Avance de Partidas</p>
        </div>

        {/* Modal advertencia GPS — se superpone sobre el form */}
        {mostrarModalGps && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-4">
            <div className="bg-orange-500 px-5 py-4 flex items-center gap-3">
              <ShieldAlert className="text-white flex-shrink-0" size={28} />
              <div>
                <p className="text-white font-bold text-base leading-tight">Ubicación requerida</p>
                <p className="text-orange-100 text-xs mt-0.5">
                  {gpsEstado === GPS_DENIED ? 'Bloqueaste el permiso de GPS' : 'GPS no disponible en este dispositivo'}
                </p>
              </div>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className="text-gray-700 text-sm leading-relaxed">
                Esta app <strong>registra tu ubicación al ingresar</strong> para verificar que el avance se reporta desde la comisaría correspondiente y prevenir registros fraudulentos.
              </p>
              <p className="text-gray-500 text-xs leading-relaxed">
                {gpsEstado === GPS_DENIED
                  ? 'Para activarlo: ve a Configuración de tu navegador → Privacidad → Permisos de ubicación → Permitir para este sitio.'
                  : 'Tu dispositivo no pudo obtener la señal GPS. Verifica que el GPS esté activado en la configuración del dispositivo.'}
              </p>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={handleReintentar}
                  disabled={pendingNavigate}
                  className="w-full flex items-center justify-center gap-2 bg-brand-700 text-white py-3 rounded-xl font-semibold text-sm active:bg-brand-800 disabled:opacity-50"
                >
                  {pendingNavigate
                    ? <><Loader2 size={16} className="animate-spin" /> Solicitando GPS...</>
                    : <><RefreshCw size={16} /> Reintentar activar GPS</>}
                </button>
                <button
                  onClick={handleContinuarSinGps}
                  className="w-full text-center text-orange-600 py-2.5 rounded-xl text-sm font-medium border border-orange-200 active:bg-orange-50"
                >
                  Continuar sin GPS (bajo mi responsabilidad)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Overlay cargando GPS */}
        {cargando && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-4 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 bg-brand-100 rounded-full flex items-center justify-center">
              <MapPin className="text-brand-700 animate-pulse" size={28} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Obteniendo ubicación...</p>
              <p className="text-gray-500 text-sm mt-0.5">Acepta el permiso de GPS en tu navegador</p>
            </div>
            <Loader2 className="text-brand-600 animate-spin" size={20} />
          </div>
        )}

        {/* Form de login — se oculta mientras carga GPS o muestra modal */}
        {!cargando && !mostrarModalGps && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input
                type="text"
                placeholder="ej. nquispe"
                autoCapitalize="none"
                autoCorrect="off"
                value={form.login}
                onChange={e => setForm(f => ({ ...f, login: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña (DNI)</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Tu número de DNI"
                  inputMode="numeric"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-3 py-2 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Aviso GPS previo al login */}
            <div className="flex items-start gap-2 bg-blue-50 rounded-xl px-3 py-2.5">
              <MapPin size={14} className="text-brand-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-brand-700">
                Al ingresar se solicitará tu <strong>ubicación GPS</strong> para verificar que estás en la comisaría.
              </p>
            </div>

            <button
              type="submit"
              disabled={!form.login || !form.password}
              className="w-full bg-brand-700 text-white py-3 rounded-xl font-semibold text-base active:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Ingresar
            </button>
          </form>
        )}

        {/* Demo hint */}
        {!cargando && !mostrarModalGps && (
          <div className="mt-4 bg-white/10 rounded-xl p-3 text-blue-100 text-xs space-y-1">
            <p className="font-semibold text-white text-xs">Monitores de obra:</p>
            <p>nquispe / 45678901 · cflores / 39821456</p>
            <p className="font-semibold text-white text-xs pt-1">Residentes de obra:</p>
            <p>rperez / 72345678 · lguerrero / 94567890</p>
          </div>
        )}
      </div>
    </div>
  )
}
