/**
 * Sincronización de avances verificados hacia el ERP NEMAEC.
 * Solo se envían avances que ya pasaron por el flujo de verificación del monitor.
 */

const ERP_URL = import.meta.env.VITE_ERP_URL || 'http://localhost:8000'

function mapAvanceToERP(avance) {
  return {
    app_id: avance.id,
    comisaria_codigo: avance.comisariaId,
    codigo_partida: avance.codigo,
    fecha: avance.fecha,
    hora: avance.hora || null,
    porcentaje_dia: avance.porcentajeDia,
    acumulado: avance.acumulado,
    residente_login: avance.rolRegistrador === 'residente' ? avance.monitor : null,
    obs_residente: avance.rolRegistrador === 'residente' ? avance.obs : null,
    monitor_verificador: avance.monitorVerificador || (avance.rolRegistrador === 'monitor' ? avance.monitor : null),
    acuerdo_con_avance: avance.acuerdoConAvance,
    porcentaje_dia_monitor: avance.porcentajeDiaMonitor || null,
    acumulado_final: avance.acumulado,
    obs_monitor: avance.obsMonitor || null,
    fecha_verificacion: avance.fechaVerificacion || avance.fecha,
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
    return res.ok
  } catch {
    return false
  }
}

export async function sincronizarLoteERP(avances) {
  const resultados = await Promise.allSettled(avances.map(sincronizarAvanceERP))
  return resultados.filter(r => r.status === 'fulfilled' && r.value).length
}
