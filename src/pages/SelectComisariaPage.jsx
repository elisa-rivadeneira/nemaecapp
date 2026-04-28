import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { Building2, ChevronRight, LogOut, BarChart2, MapPin, AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import OfflineBanner from '../components/OfflineBanner'

export default function SelectComisariaPage() {
  const navigate = useNavigate()
  const {
    usuario, logout,
    seleccionarComisaria, cargarComisariasUsuario, cargarPartidasComisaria,
    comisariasUsuario, getResumenComisaria, loginUbicacion, isOnline,
    sincronizarTodosAlERP,
  } = useAppStore()

  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState(null)

  useEffect(() => {
    cargarComisariasUsuario()
  }, [])

  async function handleSeleccionar(comisaria) {
    seleccionarComisaria(comisaria.id, comisaria)
    await cargarPartidasComisaria(comisaria.id)
    navigate('/partidas')
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  async function handleSyncERP() {
    if (syncing) return
    setSyncing(true)
    setSyncMsg(null)
    const count = await sincronizarTodosAlERP()
    setSyncing(false)
    setSyncMsg(`${count} avances enviados al ERP`)
    setTimeout(() => setSyncMsg(null), 4000)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <OfflineBanner />

      {/* Header */}
      <div className="bg-brand-800 text-white px-4 pt-6 pb-8">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-blue-200 text-xs uppercase tracking-wide">
              {usuario?.rol === 'residente' ? 'Residente de Obra' : 'Monitor de Obra'}
            </p>
            <h1 className="text-xl font-bold">{usuario?.nombre}</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-full bg-white/10 active:bg-white/20"
            >
              <BarChart2 size={20} />
            </button>
            <button
              onClick={handleSyncERP}
              disabled={syncing || !isOnline}
              title="Reenviar todos los avances al ERP"
              className="p-2 rounded-full bg-white/10 active:bg-white/20 disabled:opacity-40"
            >
              <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} />
            </button>
            <button onClick={handleLogout} className="p-2 rounded-full bg-white/10 active:bg-white/20">
              <LogOut size={20} />
            </button>
          </div>
        </div>
        <p className="text-blue-200 text-sm">Selecciona la comisaría a registrar</p>
        {syncMsg && (
          <p className="mt-2 text-green-200 text-xs font-medium">✓ {syncMsg}</p>
        )}

        <div className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs ${
          loginUbicacion ? 'bg-green-500/20 text-green-100' : 'bg-orange-500/30 text-orange-100'
        }`}>
          {loginUbicacion ? (
            <><MapPin size={12} className="flex-shrink-0" />
              <span>Ubicación registrada · {loginUbicacion.lat?.toFixed(5)}, {loginUbicacion.lng?.toFixed(5)}</span></>
          ) : (
            <><AlertTriangle size={12} className="flex-shrink-0" />
              <span>Ingresaste sin GPS activo</span></>
          )}
        </div>
      </div>

      {/* Lista comisarías */}
      <div className="flex-1 px-4 -mt-4 space-y-3 pb-8">
        {comisariasUsuario.length === 0 && (
          <div className="text-center text-gray-400 mt-12">
            {isOnline ? (
              <><Loader2 size={40} className="mx-auto mb-2 opacity-30 animate-spin" />
                <p>Cargando comisarías...</p></>
            ) : (
              <><Building2 size={40} className="mx-auto mb-2 opacity-30" />
                <p>Sin conexión — no se pudieron cargar tus comisarías</p></>
            )}
          </div>
        )}

        {comisariasUsuario.map(com => {
          const resumen = getResumenComisaria(com.id)
          return (
            <button
              key={com.id}
              onClick={() => handleSeleccionar(com)}
              className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-left active:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                  <Building2 className="text-brand-700" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 text-sm leading-tight">{com.nombre}</p>
                    <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{com.codigo}</p>

                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Avance general</span>
                      <span className="text-xs font-bold text-brand-700">{resumen.avanceGeneral}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-600 rounded-full transition-all" style={{ width: `${resumen.avanceGeneral}%` }} />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-2">
                    <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">{resumen.completadas} completadas</span>
                    <span className="text-[10px] text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full font-medium">{resumen.enCurso} en curso</span>
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{resumen.sinIniciar} sin iniciar</span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
