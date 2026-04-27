import { MapPin, AlertTriangle, CheckCircle } from 'lucide-react'
import { COMISARIAS } from '../data/mockData'

function distanciaKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export function calcularDistancia(ubicacion, comisariaId) {
  if (!ubicacion) return null
  const comisaria = COMISARIAS.find(c => c.id === comisariaId)
  if (!comisaria) return null
  return distanciaKm(ubicacion.lat, ubicacion.lng, comisaria.lat, comisaria.lng)
}

export default function GeoStatus({ ubicacion, comisariaId, className = '' }) {
  if (!ubicacion) {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-gray-500 ${className}`}>
        <MapPin size={12} />
        <span>Ubicación no disponible</span>
      </div>
    )
  }

  const distancia = calcularDistancia(ubicacion, comisariaId)
  const enComisaria = distancia !== null && distancia < 0.5 // 500 metros

  return (
    <div className={`flex items-center gap-1.5 text-xs ${enComisaria ? 'text-green-600' : 'text-orange-500'} ${className}`}>
      {enComisaria ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
      <span>
        {enComisaria
          ? `En comisaría (${Math.round(distancia * 1000)}m)`
          : distancia !== null
            ? `A ${distancia < 1 ? Math.round(distancia * 1000) + 'm' : distancia.toFixed(1) + 'km'} de la comisaría`
            : 'Verificando ubicación...'}
      </span>
    </div>
  )
}
