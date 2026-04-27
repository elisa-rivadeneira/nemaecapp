import { useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'
import { useAppStore } from '../store/appStore'

export default function OfflineBanner() {
  const { isOnline, setOnline, pendienteSync } = useAppStore()

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline])

  if (isOnline && pendienteSync.length === 0) return null

  return (
    <div className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${
      isOnline ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'
    }`}>
      {isOnline ? (
        <>
          <Wifi size={14} />
          <span>Sincronizando {pendienteSync.length} registro(s)...</span>
        </>
      ) : (
        <>
          <WifiOff size={14} />
          <span>Sin conexión — los registros se guardarán y sincronizarán al reconectar ({pendienteSync.length} pendiente{pendienteSync.length !== 1 ? 's' : ''})</span>
        </>
      )}
    </div>
  )
}
