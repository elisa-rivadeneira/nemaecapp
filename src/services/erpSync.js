/**
 * Sincronización de avances hacia el ERP NEMAEC.
 * Se envían tanto avances verificados como no verificados (borradores).
 * Los no verificados solo son visibles para monitores en el ERP.
 */

const ERP_URL = import.meta.env.VITE_ERP_URL || 'http://localhost:8000'

// Mapeo de códigos de comisaría a IDs del ERP
const COMISARIA_ID_MAP = {
  'ENS': 67, // Ensenada
  'CAR': 63, // Carabayllo
  'SCA': 74, // San Cayetano
  'SMP': 999, // San Martin de Porres (ID temporal, actualizar con el correcto)
  'VES': 998, // Villa el Salvador (ID temporal, actualizar con el correcto)
}

function mapAvanceToERP(avance) {
  // Convertir código de comisaría a ID numérico
  const comisariaId = COMISARIA_ID_MAP[avance.comisariaId] || parseInt(avance.comisariaId) || 0
  // Mantener el código original (ENS, CAR, etc.)
  const comisariaCodigo = avance.comisariaId

  return {
    app_id: avance.id,
    comisaria_id: comisariaId,
    comisaria_codigo: comisariaCodigo,
    codigo_partida: avance.codigo,
    fecha: avance.fecha,
    hora: avance.hora || null,
    porcentaje_dia: avance.porcentajeDia,
    acumulado: avance.acumulado,
    residente_login: avance.rolRegistrador === 'residente' ? avance.monitor : null,
    obs_residente: avance.rolRegistrador === 'residente' ? avance.obs : null,
    foto_residente: avance.rolRegistrador === 'residente' ? avance.foto : null,
    monitor_verificador: avance.monitorVerificador || (avance.rolRegistrador === 'monitor' ? avance.monitor : null),
    acuerdo_con_avance: avance.acuerdoConAvance,
    porcentaje_dia_monitor: avance.porcentajeDiaMonitor || null,
    acumulado_final: avance.acumulado,
    obs_monitor: avance.obsMonitor || null,
    foto_monitor: avance.fotoMonitor || null,
    fecha_verificacion: avance.fechaVerificacion || avance.fecha,
    estado: avance.verificado ? 'verificado' : 'borrador',
    lat: avance.lat || null,
    lng: avance.lng || null,
  }
}

export async function sincronizarAvanceERP(avance) {
  try {
    const res = await fetch(`${ERP_URL}/api/v1/avances-app/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapAvanceToERP(avance)),
    })
    if (!res.ok) {
      const texto = await res.text().catch(() => '')
      console.error(`[ERP Sync] Error ${res.status} para avance id=${avance.id}:`, texto)
    }
    return res.ok
  } catch (e) {
    console.error(`[ERP Sync] Error de red para avance id=${avance.id}:`, e)
    return false
  }
}

export async function sincronizarLoteERP(avances) {
  const resultados = await Promise.allSettled(avances.map(sincronizarAvanceERP))
  return resultados.filter(r => r.status === 'fulfilled' && r.value).length
}
