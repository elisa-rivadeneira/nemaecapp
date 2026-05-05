import { useState } from 'react'
import {
  X,
  Lock,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  FileText,
  User,
  Calendar,
  Hash
} from 'lucide-react'

export default function FirmaModal({ asiento, usuario, onFirmar, onCancelar }) {
  const [pin, setPin] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [step, setStep] = useState('pin') // 'pin' | 'confirm' | 'loading'
  const [error, setError] = useState('')

  const handlePinChange = (value) => {
    // Solo permitir números y máximo 6 dígitos
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6)
    setPin(numericValue)
    setError('')
  }

  const handleContinuar = () => {
    if (pin.length < 4) {
      setError('El PIN debe tener al menos 4 dígitos')
      return
    }
    setStep('confirm')
  }

  const handleConfirmar = async () => {
    if (!pin) {
      setError('Ingresa tu PIN para firmar')
      return
    }

    setStep('loading')
    setError('')

    try {
      // Simular validación del PIN y firma
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Aquí se haría la llamada real al API
      await onFirmar(pin, observaciones.trim() || null)
    } catch (err) {
      setError('Error al procesar la firma. Intenta nuevamente.')
      setStep('confirm')
    }
  }

  const formatFecha = (fechaISO) => {
    const fecha = new Date(fechaISO)
    return fecha.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const cargoUsuario = asiento.firmas_requeridas.find(f => f.usuario_id === usuario.id)?.cargo

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Firmar Asiento</h2>
            <p className="text-xs text-gray-500">Asiento N°{asiento.numero_asiento} · Folio {asiento.folio}</p>
          </div>
          <button
            onClick={onCancelar}
            className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {step === 'pin' && (
          <div className="p-4 space-y-4">
            {/* Info del usuario */}
            <div className="bg-blue-50 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <User size={20} className="text-blue-700" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{usuario.nombre}</p>
                  <p className="text-xs text-blue-600">{cargoUsuario}</p>
                </div>
              </div>
            </div>

            {/* Información del asiento */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FileText size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Resumen</p>
                  <p className="text-xs text-gray-600">{asiento.resumen}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Fecha de creación</p>
                  <p className="text-xs text-gray-600">{formatFecha(asiento.fecha_creacion)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Hash size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Hash de integridad</p>
                  <p className="text-xs font-mono text-gray-500 break-all">
                    {asiento.hash_contenido.slice(0, 32)}...
                  </p>
                </div>
              </div>
            </div>

            {/* Input PIN */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Ingresa tu PIN personal
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  maxLength={6}
                />
                <button
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-3.5 p-1 text-gray-400 hover:text-gray-600"
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Mínimo 4 dígitos. El PIN debe coincidir con el registrado en tu perfil.
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onCancelar}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium active:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleContinuar}
                disabled={pin.length < 4}
                className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed active:bg-amber-700 transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="p-4 space-y-4">
            {/* Confirmación */}
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock size={24} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Confirmar Firma Digital</h3>
              <p className="text-sm text-gray-600">
                Estás a punto de firmar digitalmente este asiento. Esta acción es irreversible.
              </p>
            </div>

            {/* Datos de la firma */}
            <div className="bg-amber-50 rounded-xl p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Asiento:</span>
                <span className="text-sm font-medium text-gray-900">N°{asiento.numero_asiento}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cargo:</span>
                <span className="text-sm font-medium text-gray-900">{cargoUsuario}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fecha:</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            {/* Observaciones opcionales */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Observaciones (opcional)
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ingresa cualquier observación sobre este asiento..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500">
                {observaciones.length}/500 caracteres
              </p>
            </div>

            {/* Warning */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
              <div className="flex gap-2">
                <AlertTriangle size={16} className="text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-800">Importante</p>
                  <p className="text-xs text-orange-700">
                    Una vez firmado, el asiento quedará registrado permanentemente en el sistema.
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep('pin')}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium active:bg-gray-50 transition-colors"
              >
                Volver
              </button>
              <button
                onClick={handleConfirmar}
                className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl font-medium active:bg-amber-700 transition-colors"
              >
                Firmar Ahora
              </button>
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircle size={24} className="text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Procesando Firma...</h3>
            <p className="text-sm text-gray-600 mb-4">
              Validando PIN y registrando la firma digital en el sistema.
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              No cierres esta ventana mientras se procesa la firma.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}