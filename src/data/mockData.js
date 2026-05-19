// Fechas en Excel serial → convertidas a ISO
// Base Excel: 30 dic 1899
function excelDateToISO(serial) {
  const d = new Date(Date.UTC(1899, 11, 30) + serial * 86400000)
  return d.toISOString().split('T')[0]
}

export const COMISARIAS = [
  { id: 'ENS', nombre: 'LA ENSENADA', lat: -11.8752, lng: -77.1126, proveedor: 'CORPORACION GRUPO SOBRADO SAC' },
  { id: 'CAR', nombre: 'CARABAYLLO', lat: -11.8910, lng: -77.0332, proveedor: 'CONSTRUCTORA ABC SAC' },
  { id: 'SMP', nombre: 'SAN MARTIN DE PORRES', lat: -12.0217, lng: -77.0636, proveedor: 'INGENIERIA XYZ EIRL' },
  { id: 'VES', nombre: 'VILLA EL SALVADOR', lat: -12.2143, lng: -76.9405, proveedor: 'CONSTRUCTORA DEF SAC' },
  { id: 'SCA', nombre: 'SAN CAYETANO', lat: -11.9800, lng: -77.0700, proveedor: 'OBRAS PERU SAC' },
]

export const USUARIOS = [
  // Monitores de obra - credenciales reales de la BD
  { id: 1, nombre: 'Luis Callupe', login: 'lcallupe', dni: '123456', rol: 'monitor', comisariasAsignadas: ['ENS', 'CAR'] },
  { id: 2, nombre: 'Nivardo Quispe', login: 'nquispe', dni: '123456', rol: 'monitor', comisariasAsignadas: ['ENS', 'CAR'] },
  { id: 3, nombre: 'Marlenne Bustamante', login: 'mbustamante', dni: '123456', rol: 'monitor', comisariasAsignadas: ['SCA', 'ENS'] },
  { id: 4, nombre: 'Rosemary Valdivia', login: 'rvaldivia', dni: '123456', rol: 'monitor', comisariasAsignadas: ['CAR', 'SMP', 'VES'] },
  { id: 5, nombre: 'Sandy Arbieto', login: 'sarbieto', dni: '123456', rol: 'monitor', comisariasAsignadas: ['SMP', 'VES'] },
  // Residentes de obra - credenciales reales de la BD
  { id: 6, nombre: 'Gerardo Rodriguez', login: 'grodriguez', dni: '123465', rol: 'residente', comisariasAsignadas: ['ENS', 'CAR'] },
  { id: 7, nombre: 'Cesar Vera', login: 'cvera', dni: '123456', rol: 'residente', comisariasAsignadas: ['SCA', 'ENS'] },
  // Comisarios - nuevos usuarios
  { id: 8, nombre: 'Mayor Juan Rojas', login: 'jrojas', dni: '123457', rol: 'comisario', comisariasAsignadas: ['ENS'] },
  { id: 9, nombre: 'Capitán María Silva', login: 'msilva', dni: '123458', rol: 'comisario', comisariasAsignadas: ['CAR'] },
  { id: 10, nombre: 'Mayor Carlos Pérez', login: 'cperez', dni: '123459', rol: 'comisario', comisariasAsignadas: ['SMP'] },
  // Coordinador NEMAEC
  { id: 11, nombre: 'Ing. Ana Gutierrez', login: 'agutierrez', dni: '123460', rol: 'coordinador', comisariasAsignadas: ['ENS', 'CAR', 'SMP', 'VES', 'SCA'] },
]

// Alias de compatibilidad
export const MONITORS = USUARIOS

// Partidas reales de LA ENSENADA — fechas ajustadas al contexto actual (abr-jun 2026)
const PARTIDAS_ENSENADA = [
  { codigo: '01.01', partida: 'ALMACEN Y OFICINA PROVISIONAL', und: 'MES', metrado: 1.5, pu: 500.00, parcial: 750.00, inicio: '2026-03-17', fin: '2026-06-10', programado: 750.00 },
  { codigo: '01.02', partida: 'MOVILIZACION Y DESMOVILIZACION DE EQUIPOS Y HERRAMIENTAS', und: 'GBL', metrado: 1.0, pu: 500.00, parcial: 500.00, inicio: '2026-03-17', fin: '2026-06-10', programado: 500.00 },
  { codigo: '01.03', partida: 'SUMINISTRO DE ENERGIA ELECTRICA PROVISIONAL', und: 'GBL', metrado: 1.0, pu: 593.04, parcial: 593.04, inicio: '2026-03-17', fin: '2026-06-10', programado: 593.04 },
  { codigo: '01.04', partida: 'ELABORACION E IMPLEMENTACION DE PLAN DE SEGURIDAD', und: 'GBL', metrado: 1.0, pu: 3000.00, parcial: 3000.00, inicio: '2026-03-16', fin: '2026-03-18', programado: 3000.00 },
  { codigo: '01.05', partida: 'EQUIPOS DE PROTECCION INDIVIDUAL', und: 'GBL', metrado: 1.0, pu: 4433.00, parcial: 4433.00, inicio: '2026-03-16', fin: '2026-06-09', programado: 4433.00 },
  { codigo: '01.06', partida: 'EQUIPOS DE PROTECCION COLECTIVA', und: 'GBL', metrado: 1.0, pu: 883.50, parcial: 883.50, inicio: '2026-03-17', fin: '2026-06-10', programado: 883.50 },
  { codigo: '01.07', partida: 'RECURSOS PARA RESPUESTAS ANTE EMERGENCIAS', und: 'GBL', metrado: 1.0, pu: 603.80, parcial: 603.80, inicio: '2026-03-17', fin: '2026-06-10', programado: 603.80 },
  { codigo: '02.01', partida: 'LIMPIEZA DURANTE LA EJECUCION', und: 'M2', metrado: 748.59, pu: 1.77, parcial: 1325.00, inicio: '2026-03-17', fin: '2026-06-10', programado: 1325.00 },
  { codigo: '02.02', partida: 'TRAZO, NIVELES Y REPLANTEO DE AREAS A INTERVENIR', und: 'M2', metrado: 748.59, pu: 0.92, parcial: 688.70, inicio: '2026-03-17', fin: '2026-04-20', programado: 688.70 },
  { codigo: '02.03', partida: 'DESMONTAJE DE COBERTURA EXISTENTE', und: 'M2', metrado: 172.72, pu: 2.12, parcial: 366.17, inicio: '2026-03-21', fin: '2026-04-05', programado: 366.17 },
  { codigo: '02.04', partida: 'DESMONTAJE DE ESTRUCTURA DE MADERA PARA COBERTURA', und: 'M2', metrado: 15.46, pu: 2.12, parcial: 32.78, inicio: '2026-03-28', fin: '2026-04-15', programado: 32.78 },
  { codigo: '02.05', partida: 'DESMONTAJE DE VENTANA', und: 'M2', metrado: 36.93, pu: 7.59, parcial: 280.30, inicio: '2026-03-28', fin: '2026-04-25', programado: 280.30 },
  { codigo: '02.06', partida: 'DESMONTAJE DE PUERTA', und: 'M2', metrado: 32.30, pu: 8.85, parcial: 285.86, inicio: '2026-04-01', fin: '2026-05-03', programado: 285.86 },
  { codigo: '02.07', partida: 'REMOCION DE LUNA', und: 'M2', metrado: 22.87, pu: 19.69, parcial: 450.31, inicio: '2026-04-05', fin: '2026-05-10', programado: 450.31 },
  { codigo: '02.08', partida: 'REMOCION DE MARCO DE ACERO', und: 'M2', metrado: 22.63, pu: 16.99, parcial: 384.48, inicio: '2026-04-10', fin: '2026-05-20', programado: 384.48 },
  { codigo: '02.09', partida: 'REMOCION DE ENCHAPE CERAMICO O PORCELANATO', und: 'M2', metrado: 373.26, pu: 16.62, parcial: 6203.58, inicio: '2026-04-15', fin: '2026-05-25', programado: 6203.58 },
  { codigo: '02.10', partida: 'REMOCION DE AREAS VERDES', und: 'M2', metrado: 31.21, pu: 4.24, parcial: 132.33, inicio: '2026-04-20', fin: '2026-05-10', programado: 132.33 },
  { codigo: '02.16', partida: 'DESMONTAJE DE LUMINARIAS', und: 'UNI', metrado: 67.0, pu: 6.95, parcial: 465.65, inicio: '2026-04-10', fin: '2026-05-09', programado: 465.65 },
  { codigo: '02.21', partida: 'DEMOLICION DE MESA DE CONCRETO', und: 'M3', metrado: 2.83, pu: 76.19, parcial: 215.62, inicio: '2026-04-15', fin: '2026-05-07', programado: 215.62 },
  { codigo: '02.34', partida: 'ELIMINACION FINAL DE MATERIAL DE DEMOLICION', und: 'GBL', metrado: 1.0, pu: 600.00, parcial: 600.00, inicio: '2026-05-10', fin: '2026-05-20', programado: 600.00 },
  { codigo: '03.01.01.01', partida: 'PROVISION DE ACERO PARA ESTRUCTURAS', und: 'KGS', metrado: 826.05, pu: 10.51, parcial: 8681.79, inicio: '2026-03-20', fin: '2026-04-10', programado: 8681.79 },
  { codigo: '03.01.02.01', partida: 'INSTALACION DE COLUMNA METALICO', und: 'UNI', metrado: 24.0, pu: 109.74, parcial: 2633.76, inicio: '2026-04-05', fin: '2026-04-25', programado: 2633.76 },
  { codigo: '03.01.02.02', partida: 'MONTAJE DE VIGUETA METALICO', und: 'KGS', metrado: 617.67, pu: 21.35, parcial: 13187.25, inicio: '2026-04-05', fin: '2026-05-05', programado: 13187.25 },
  { codigo: '04.01.01', partida: 'SUMINISTRO E INSTALACION DE PISO PORCELANATO 0.6x0.6 M', und: 'M2', metrado: 204.88, pu: 69.97, parcial: 14335.45, inicio: '2026-05-01', fin: '2026-05-30', programado: 14335.45 },
  { codigo: '04.02.01', partida: 'SUMINISTRO E INSTALACION ZOCALO DE PORCELANATO 0.60x0.60 M', und: 'M2', metrado: 166.50, pu: 69.97, parcial: 11650.01, inicio: '2026-05-01', fin: '2026-05-30', programado: 11650.01 },
  { codigo: '04.03.01', partida: 'LIMPIEZA Y TRATAMIENTO DE SALITRE EN CIELO RASO', und: 'M2', metrado: 76.06, pu: 33.47, parcial: 2545.73, inicio: '2026-04-10', fin: '2026-05-13', programado: 2545.73 },
  { codigo: '04.03.04', partida: 'PINTURA LATEX EN CIELORRASO (2 MANOS)', und: 'M2', metrado: 204.87, pu: 9.65, parcial: 1977.00, inicio: '2026-05-10', fin: '2026-05-25', programado: 1977.00 },
  { codigo: '04.04.01', partida: 'PUERTA CONTRAPLACADA DE MADERA S/LUNETA', und: 'M2', metrado: 8.78, pu: 285.53, parcial: 2506.95, inicio: '2026-04-10', fin: '2026-05-20', programado: 2506.95 },
  { codigo: '04.04.02', partida: 'PUERTA CONTRAPLACADA DE MADERA C/LUNETA', und: 'M2', metrado: 20.48, pu: 285.46, parcial: 5846.22, inicio: '2026-04-10', fin: '2026-05-06', programado: 5846.22 },
]

// Partidas para CARABAYLLO (simplificadas)
const PARTIDAS_CARABAYLLO = [
  { codigo: '01.01', partida: 'ALMACEN Y OFICINA PROVISIONAL', und: 'MES', metrado: 1.5, pu: 500.00, parcial: 750.00, inicio: '2026-03-17', fin: '2026-06-10', programado: 750.00 },
  { codigo: '01.05', partida: 'EQUIPOS DE PROTECCION INDIVIDUAL', und: 'GBL', metrado: 1.0, pu: 3200.00, parcial: 3200.00, inicio: '2026-03-17', fin: '2026-06-09', programado: 3200.00 },
  { codigo: '02.01', partida: 'LIMPIEZA DURANTE LA EJECUCION', und: 'M2', metrado: 620.00, pu: 1.77, parcial: 1097.40, inicio: '2026-03-17', fin: '2026-06-10', programado: 1097.40 },
  { codigo: '02.02', partida: 'TRAZO, NIVELES Y REPLANTEO DE AREAS A INTERVENIR', und: 'M2', metrado: 620.00, pu: 0.92, parcial: 570.40, inicio: '2026-03-17', fin: '2026-04-20', programado: 570.40 },
  { codigo: '02.05', partida: 'DESMONTAJE DE VENTANA', und: 'M2', metrado: 28.50, pu: 7.59, parcial: 216.32, inicio: '2026-04-01', fin: '2026-05-03', programado: 216.32 },
  { codigo: '02.09', partida: 'REMOCION DE ENCHAPE CERAMICO O PORCELANATO', und: 'M2', metrado: 290.00, pu: 16.62, parcial: 4819.80, inicio: '2026-04-15', fin: '2026-05-25', programado: 4819.80 },
  { codigo: '03.01.01.01', partida: 'PROVISION DE ACERO PARA ESTRUCTURAS', und: 'KGS', metrado: 650.00, pu: 10.51, parcial: 6831.50, inicio: '2026-03-20', fin: '2026-04-30', programado: 6831.50 },
  { codigo: '04.01.01', partida: 'SUMINISTRO E INSTALACION DE PISO PORCELANATO 0.6x0.6 M', und: 'M2', metrado: 180.00, pu: 69.97, parcial: 12594.60, inicio: '2026-05-01', fin: '2026-05-30', programado: 12594.60 },
  { codigo: '04.03.04', partida: 'PINTURA LATEX EN CIELORRASO (2 MANOS)', und: 'M2', metrado: 180.00, pu: 9.65, parcial: 1737.00, inicio: '2026-05-10', fin: '2026-05-25', programado: 1737.00 },
  { codigo: '04.04.01', partida: 'PUERTA CONTRAPLACADA DE MADERA S/LUNETA', und: 'M2', metrado: 7.20, pu: 285.53, parcial: 2055.82, inicio: '2026-04-10', fin: '2026-05-20', programado: 2055.82 },
]

// Avances pre-cargados (histórico de ejemplo)
export const AVANCES_INICIALES = [
  // ENS - avances históricos de monitores (legacy, sin flujo de verificación)
  { id: 1, comisariaId: 'ENS', codigo: '01.04', fecha: '2026-03-17', porcentajeDia: 100, acumulado: 100, monitor: 'nquispe', rolRegistrador: 'monitor', obs: 'Plan de seguridad aprobado', foto: null, verificado: true, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8752, lng: -77.1126, sincronizado: true },
  { id: 2, comisariaId: 'ENS', codigo: '01.01', fecha: '2026-03-18', porcentajeDia: 15, acumulado: 15, monitor: 'nquispe', rolRegistrador: 'monitor', obs: 'Inicio de obras', foto: null, verificado: true, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8752, lng: -77.1126, sincronizado: true },
  { id: 3, comisariaId: 'ENS', codigo: '01.01', fecha: '2026-03-25', porcentajeDia: 20, acumulado: 35, monitor: 'nquispe', rolRegistrador: 'monitor', obs: '', foto: null, verificado: true, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8752, lng: -77.1126, sincronizado: true },
  { id: 4, comisariaId: 'ENS', codigo: '01.01', fecha: '2026-04-08', porcentajeDia: 20, acumulado: 55, monitor: 'nquispe', rolRegistrador: 'monitor', obs: '', foto: null, verificado: true, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8752, lng: -77.1126, sincronizado: true },
  { id: 5, comisariaId: 'ENS', codigo: '02.02', fecha: '2026-03-18', porcentajeDia: 50, acumulado: 50, monitor: 'nquispe', rolRegistrador: 'monitor', obs: 'Replanteo sector A iniciado', foto: null, verificado: true, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8752, lng: -77.1126, sincronizado: true },
  { id: 6, comisariaId: 'ENS', codigo: '02.02', fecha: '2026-03-25', porcentajeDia: 30, acumulado: 80, monitor: 'nquispe', rolRegistrador: 'monitor', obs: '', foto: null, verificado: true, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8752, lng: -77.1126, sincronizado: true },
  { id: 7, comisariaId: 'ENS', codigo: '02.03', fecha: '2026-03-22', porcentajeDia: 60, acumulado: 60, monitor: 'nquispe', rolRegistrador: 'monitor', obs: 'Cobertura norte desmontada', foto: null, verificado: true, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8752, lng: -77.1126, sincronizado: true },
  { id: 8, comisariaId: 'ENS', codigo: '02.03', fecha: '2026-03-28', porcentajeDia: 40, acumulado: 100, monitor: 'nquispe', rolRegistrador: 'monitor', obs: 'Desmontaje completado', foto: null, verificado: true, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8752, lng: -77.1126, sincronizado: true },
  { id: 9, comisariaId: 'ENS', codigo: '03.01.01.01', fecha: '2026-03-21', porcentajeDia: 50, acumulado: 50, monitor: 'nquispe', rolRegistrador: 'monitor', obs: '', foto: null, verificado: true, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8752, lng: -77.1126, sincronizado: true },
  { id: 10, comisariaId: 'ENS', codigo: '03.01.01.01', fecha: '2026-03-28', porcentajeDia: 40, acumulado: 90, monitor: 'nquispe', rolRegistrador: 'monitor', obs: '', foto: null, verificado: true, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8752, lng: -77.1126, sincronizado: true },
  { id: 11, comisariaId: 'ENS', codigo: '02.09', fecha: '2026-04-16', porcentajeDia: 15, acumulado: 15, monitor: 'cflores', rolRegistrador: 'monitor', obs: 'Inicio remoción porcelanato', foto: null, verificado: true, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8752, lng: -77.1126, sincronizado: true },
  { id: 12, comisariaId: 'ENS', codigo: '02.09', fecha: '2026-04-22', porcentajeDia: 10, acumulado: 25, monitor: 'cflores', rolRegistrador: 'monitor', obs: 'Lento por falta de materiales', foto: null, verificado: true, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8752, lng: -77.1126, sincronizado: true },
  { id: 13, comisariaId: 'ENS', codigo: '04.03.01', fecha: '2026-04-11', porcentajeDia: 20, acumulado: 20, monitor: 'cflores', rolRegistrador: 'monitor', obs: '', foto: null, verificado: true, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8752, lng: -77.1126, sincronizado: true },
  { id: 14, comisariaId: 'ENS', codigo: '04.03.01', fecha: '2026-04-18', porcentajeDia: 15, acumulado: 35, monitor: 'cflores', rolRegistrador: 'monitor', obs: '', foto: null, verificado: true, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8752, lng: -77.1126, sincronizado: true },
  // CAR - avances históricos
  { id: 15, comisariaId: 'CAR', codigo: '01.01', fecha: '2026-03-18', porcentajeDia: 20, acumulado: 20, monitor: 'atorres', rolRegistrador: 'monitor', obs: 'Inicio de obra', foto: null, verificado: true, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8910, lng: -77.0332, sincronizado: true },
  { id: 16, comisariaId: 'CAR', codigo: '01.01', fecha: '2026-04-01', porcentajeDia: 20, acumulado: 40, monitor: 'atorres', rolRegistrador: 'monitor', obs: '', foto: null, verificado: true, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8910, lng: -77.0332, sincronizado: true },
  { id: 17, comisariaId: 'CAR', codigo: '02.02', fecha: '2026-03-18', porcentajeDia: 60, acumulado: 60, monitor: 'atorres', rolRegistrador: 'monitor', obs: '', foto: null, verificado: true, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8910, lng: -77.0332, sincronizado: true },
  { id: 18, comisariaId: 'CAR', codigo: '02.02', fecha: '2026-03-25', porcentajeDia: 40, acumulado: 100, monitor: 'atorres', rolRegistrador: 'monitor', obs: 'Replanteo completado', foto: null, verificado: true, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8910, lng: -77.0332, sincronizado: true },
  { id: 19, comisariaId: 'CAR', codigo: '03.01.01.01', fecha: '2026-03-21', porcentajeDia: 30, acumulado: 30, monitor: 'atorres', rolRegistrador: 'monitor', obs: '', foto: null, verificado: true, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8910, lng: -77.0332, sincronizado: true },
  { id: 20, comisariaId: 'CAR', codigo: '02.05', fecha: '2026-04-02', porcentajeDia: 25, acumulado: 25, monitor: 'atorres', rolRegistrador: 'monitor', obs: '', foto: null, verificado: true, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8910, lng: -77.0332, sincronizado: true },
  // Avances de residentes pendientes de verificación (nuevos)
  { id: 21, comisariaId: 'ENS', codigo: '02.06', fecha: '2026-04-27', hora: '09:30', porcentajeDia: 35, acumulado: 35, monitor: 'rperez', rolRegistrador: 'residente', obs: 'Desmontaje de puerta completado en sector A', foto: null, verificado: false, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8752, lng: -77.1126, sincronizado: true },
  { id: 22, comisariaId: 'ENS', codigo: '02.07', fecha: '2026-04-27', hora: '10:15', porcentajeDia: 25, acumulado: 25, monitor: 'rperez', rolRegistrador: 'residente', obs: 'Removidas 5 lunas del sector norte', foto: null, verificado: false, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8752, lng: -77.1126, sincronizado: true },
  { id: 23, comisariaId: 'CAR', codigo: '02.09', fecha: '2026-04-27', hora: '08:45', porcentajeDia: 40, acumulado: 40, monitor: 'rperez', rolRegistrador: 'residente', obs: 'Se removió el enchape del baño principal', foto: null, verificado: false, monitorVerificador: null, acuerdoConAvance: null, porcentajeDiaMonitor: null, acumuladoMonitor: null, obsMonitor: null, fotoMonitor: null, fechaVerificacion: null, lat: -11.8910, lng: -77.0332, sincronizado: true },
]

export const PARTIDAS_POR_COMISARIA = {
  ENS: PARTIDAS_ENSENADA,
  CAR: PARTIDAS_CARABAYLLO,
  SMP: PARTIDAS_CARABAYLLO.map(p => ({ ...p, parcial: p.parcial * 1.1 })),
  VES: PARTIDAS_CARABAYLLO.map(p => ({ ...p, parcial: p.parcial * 0.9 })),
  SCA: PARTIDAS_ENSENADA.slice(0, 15).map(p => ({ ...p, metrado: p.metrado * 0.8, parcial: p.parcial * 0.8 })),
}

// Calcula % acumulado de una partida dada su lista de avances
export function calcularAcumulado(avances, comisariaId, codigo) {
  const registros = avances.filter(a => a.comisariaId === comisariaId && a.codigo === codigo)
  if (registros.length === 0) return 0
  return Math.min(registros[registros.length - 1].acumulado, 100)
}

// Calcula el avance programado esperado a la fecha de hoy
export function calcularProgramadoHoy(partida) {
  if (!partida.inicio || !partida.fin) return 0
  const hoy = new Date()
  const inicio = new Date(partida.inicio)
  const fin = new Date(partida.fin)
  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return 0
  if (hoy < inicio) return 0
  if (hoy >= fin) return 100
  const totalDias = (fin - inicio) / 86400000
  if (totalDias <= 0) return 100
  const diasTranscurridos = (hoy - inicio) / 86400000
  return Math.round((diasTranscurridos / totalDias) * 100)
}

export function getEstadoSemaforo(avanceReal, avanceProgramado) {
  const diff = avanceReal - avanceProgramado
  if (avanceReal >= 100) return 'completado'
  if (diff >= -5) return 'ok'
  if (diff >= -20) return 'alerta'
  return 'critico'
}
