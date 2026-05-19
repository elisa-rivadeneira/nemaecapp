import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AVANCES_INICIALES, USUARIOS, COMISARIAS, PARTIDAS_POR_COMISARIA } from '../data/mockData'
import { sincronizarAvanceERP, sincronizarLoteERP } from '../services/erpSync'

function getNextId(avances) {
  return avances.length > 0 ? Math.max(...avances.map(a => a.id)) + 1 : 1
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Auth
      usuario: null,
      comisariaSeleccionada: null,
      comisariaSeleccionadaObj: null,  // objeto completo de la comisaría

      // Datos ERP (cargados desde API)
      comisariasUsuario: [],           // comisarías asignadas al usuario logueado
      partidasComisaria: [],           // partidas de la comisaría seleccionada
      partidasCache: {},                // cache de partidas por comisaría {comisariaId: partidas[]}

      // Datos (iniciales vacíos, se cargan desde persist)
      avances: [],
      pendienteSync: [],
      isOnline: navigator.onLine,

      // Cuaderno de Obra
      asientosCuaderno: [],
      asientoBorrador: null,

      // Geolocation
      ubicacionActual: null,
      loginUbicacion: null,

      async login(login, password) {
        const erpUrl = import.meta.env.VITE_ERP_URL || 'http://localhost:8000'
        try {
          // Intenta autenticar contra el ERP (fuente de verdad)
          const res = await fetch(`${erpUrl}/api/v1/usuarios-obra/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: login.trim().toLowerCase(), password: password.trim() }),
          })
          if (res.ok) {
            const usuario = await res.json()
            set({ usuario, comisariaSeleccionada: null })
            return true
          }
          if (res.status === 401) return false  // Credenciales incorrectas - NO hacer fallback
        } catch (error) {
          // Error de red/conexión - usar fallback para desarrollo
          console.warn('No se pudo conectar al servidor ERP, usando modo offline:', error.message)
          const usuario = USUARIOS.find(u => u.login === login.trim().toLowerCase() && u.dni === password.trim())
          if (!usuario) return false
          set({ usuario, comisariaSeleccionada: null })
          return true
        }
        return false
      },

      logout() {
        set({ usuario: null, comisariaSeleccionada: null, comisariaSeleccionadaObj: null, comisariasUsuario: [], partidasComisaria: [] })
      },

      async cargarComisariasUsuario() {
        const { usuario } = get()
        if (!usuario?.login) return
        const erpUrl = import.meta.env.VITE_ERP_URL || 'http://localhost:8000'
        try {
          // Obtener asignaciones del usuario
          const res = await fetch(`${erpUrl}/api/v1/usuarios-obra/?login=${encodeURIComponent(usuario.login)}`)
          if (!res.ok) return
          const asignaciones = await res.json()

          // Obtener detalle de cada comisaría
          const ids = [...new Set(asignaciones.map(a => a.comisaria_id).filter(Boolean))]
          const comisariasRes = await fetch(`${erpUrl}/api/v1/comisarias/`)
          if (!comisariasRes.ok) return
          const todasComisarias = await comisariasRes.json()
          const misComisarias = todasComisarias.filter(c => ids.includes(c.id))
          set({ comisariasUsuario: misComisarias })
        } catch {
          // offline: queda con lo que había
        }
      },

      async cargarPartidasComisaria(comisariaId) {
        const erpUrl = import.meta.env.VITE_ERP_URL || 'http://localhost:8000'
        try {
          const res = await fetch(`${erpUrl}/api/v1/cronogramas/comisaria/${comisariaId}/detalle`)
          if (!res.ok) return
          const data = await res.json()
          const todasPartidas = data.partidas || []
          // Solo partidas hoja (sin hijos) = trabajo real
          const codigoPadres = new Set(todasPartidas.map(p => p.partida_padre).filter(Boolean))
          const partidas = todasPartidas
            .filter(p => !codigoPadres.has(p.codigo_partida))
            .map(p => ({
              codigo: p.codigo_partida,
              partida: p.descripcion,
              unidad: p.unidad || '-',
              metrado: p.metrado || 0,
              inicio: p.fecha_inicio ? p.fecha_inicio.split('T')[0] : null,
              fin: p.fecha_fin ? p.fecha_fin.split('T')[0] : null,
            }))
          // Guardar en cache y en partidasComisaria
          set(state => ({
            partidasComisaria: partidas,
            partidasCache: { ...state.partidasCache, [comisariaId]: partidas }
          }))
        } catch {
          // Si falla, NO cargar nada (sin datos de prueba)
          set(state => ({
            partidasComisaria: [],
            partidasCache: { ...state.partidasCache, [comisariaId]: [] }
          }))
        }
      },

      seleccionarComisaria(comisariaId, comisariaObj = null) {
        set({ comisariaSeleccionada: comisariaId, comisariaSeleccionadaObj: comisariaObj })
      },

      registrarAvance({ comisariaId, codigo, porcentajeDia, observaciones, fotos, lat, lng }) {
        const { avances, usuario, isOnline } = get()
        const registrosAnteriores = avances.filter(
          a => a.comisariaId === comisariaId && a.codigo === codigo
        )
        const acumuladoAnterior = registrosAnteriores.length > 0
          ? registrosAnteriores[registrosAnteriores.length - 1].acumulado
          : 0
        const nuevoAcumulado = Math.min(acumuladoAnterior + porcentajeDia, 100)
        const esResidente = usuario?.rol === 'residente'

        const nuevo = {
          id: getNextId(get().avances),
          comisariaId,
          codigo,
          fecha: new Date().toISOString().split('T')[0],
          hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          porcentajeDia,
          acumulado: nuevoAcumulado,
          monitor: usuario?.login,
          rolRegistrador: usuario?.rol || 'monitor',
          obs: observaciones,
          fotos: fotos || [],
          // Verificación: residentes quedan pendientes, monitores ya están verificados
          verificado: !esResidente,
          monitorVerificador: null,
          acuerdoConAvance: null,
          porcentajeDiaMonitor: null,
          acumuladoMonitor: null,
          obsMonitor: null,
          fotosMonitor: null,
          fechaVerificacion: null,
          lat,
          lng,
          sincronizado: isOnline,
        }

        set(state => ({
          avances: [...state.avances, nuevo],
          pendienteSync: isOnline ? state.pendienteSync : [...state.pendienteSync, nuevo.id],
        }))

        // Si es monitor, sincroniza inmediatamente al ERP (ya está verificado)
        if (!esResidente && isOnline) sincronizarAvanceERP(nuevo)

        return nuevo
      },

      editarAvance(avanceId, datosActualizados) {
        const { avances, usuario, isOnline } = get()
        const avance = avances.find(a => a.id === avanceId)
        if (!avance) return false

        // Recalcular acumulado si cambió el porcentaje
        let nuevoAcumulado = avance.acumulado
        if (datosActualizados.porcentajeDia !== undefined && datosActualizados.porcentajeDia !== avance.porcentajeDia) {
          const anteriores = avances.filter(
            a => a.comisariaId === avance.comisariaId && a.codigo === avance.codigo && a.id < avanceId
          )
          const acumuladoAnterior = anteriores.length > 0 ? anteriores[anteriores.length - 1].acumulado : 0
          nuevoAcumulado = Math.min(acumuladoAnterior + datosActualizados.porcentajeDia, 100)
        }

        const avanceEditado = {
          ...avance,
          porcentajeDia: datosActualizados.porcentajeDia || avance.porcentajeDia,
          acumulado: nuevoAcumulado,
          obs: datosActualizados.observaciones !== undefined ? datosActualizados.observaciones : avance.obs,
          fotos: datosActualizados.fotos !== undefined ? datosActualizados.fotos : (avance.fotos || avance.foto ? [avance.foto].filter(Boolean) : []),
          lat: datosActualizados.lat || avance.lat,
          lng: datosActualizados.lng || avance.lng,
          editadoPor: usuario?.login,
          fechaEdicion: new Date().toISOString(),
          sincronizado: false
        }

        set(state => ({
          avances: state.avances.map(a => a.id !== avanceId ? a : avanceEditado),
          pendienteSync: isOnline ? state.pendienteSync : [...state.pendienteSync, avanceId]
        }))

        // Sincronizar si está online
        if (isOnline) sincronizarAvanceERP(avanceEditado)

        return true
      },

      verificarAvance(avanceId, { acuerdoConAvance, porcentajeDiaMonitor, obsMonitor, fotoMonitor }) {
        const { usuario, avances } = get()
        const avance = avances.find(a => a.id === avanceId)
        if (!avance) return

        let nuevoAcumulado = avance.acumulado
        if (!acuerdoConAvance && porcentajeDiaMonitor != null) {
          const anteriores = avances.filter(
            a => a.comisariaId === avance.comisariaId && a.codigo === avance.codigo && a.id < avanceId
          )
          const acumuladoAnterior = anteriores.length > 0 ? anteriores[anteriores.length - 1].acumulado : 0
          nuevoAcumulado = Math.min(acumuladoAnterior + porcentajeDiaMonitor, 100)
        }

        const avanceActualizado = {
          ...avance,
          verificado: true,
          monitorVerificador: usuario?.login,
          acuerdoConAvance,
          porcentajeDiaMonitor: acuerdoConAvance ? null : porcentajeDiaMonitor,
          acumuladoMonitor: acuerdoConAvance ? null : nuevoAcumulado,
          obsMonitor: obsMonitor || null,
          fotoMonitor: fotoMonitor || null,
          fechaVerificacion: new Date().toISOString().split('T')[0],
          acumulado: acuerdoConAvance ? avance.acumulado : nuevoAcumulado,
        }

        set(state => ({
          avances: state.avances.map(a => a.id !== avanceId ? a : avanceActualizado)
        }))

        // Sincronizar avance verificado al ERP
        if (get().isOnline) sincronizarAvanceERP(avanceActualizado)
      },

      setOnline(online) {
        set({ isOnline: online })
        if (online) get().sincronizarPendientes()
      },

      async sincronizarTodosAlERP() {
        const { avances } = get()
        // Enviar TODOS los avances (verificados y borradores)
        // Los borradores solo serán visibles para monitores en el ERP
        const count = await sincronizarLoteERP(avances)
        return count
      },

      sincronizarPendientes() {
        const { pendienteSync, avances } = get()
        if (pendienteSync.length === 0) return
        // En prototipo: marcamos como sincronizados
        set(state => ({
          avances: state.avances.map(a =>
            state.pendienteSync.includes(a.id) ? { ...a, sincronizado: true } : a
          ),
          pendienteSync: [],
        }))
      },

      setUbicacion(ubicacion) {
        set({ ubicacionActual: ubicacion })
      },

      setLoginUbicacion(ubicacion) {
        set({ loginUbicacion: ubicacion })
      },

      getPartidasComisaria(comisariaId) {
        const { partidasComisaria, partidasCache, comisariaSeleccionada } = get()
        // Si es la comisaría seleccionada actual, usar partidasComisaria
        if (comisariaSeleccionada === comisariaId && partidasComisaria.length > 0) {
          return partidasComisaria
        }
        // Si está en cache, usar cache
        if (partidasCache[comisariaId]) {
          return partidasCache[comisariaId]
        }
        // Si no hay datos, devolver array vacío (NO usar mockData)
        return []
      },

      getAvancesPartida(comisariaId, codigo) {
        return get().avances.filter(a => a.comisariaId === comisariaId && a.codigo === codigo)
      },

      getAcumuladoPartida(comisariaId, codigo) {
        const registros = get().getAvancesPartida(comisariaId, codigo)
        if (registros.length === 0) return 0
        return registros[registros.length - 1].acumulado
      },

      getResumenComisaria(comisariaId) {
        // Usar getPartidasComisaria que maneja el cache correctamente
        const partidas = get().getPartidasComisaria(comisariaId)
        const totalPartidas = partidas.length
        const completadas = partidas.filter(p => get().getAcumuladoPartida(comisariaId, p.codigo) >= 100).length
        const sinIniciar = partidas.filter(p => get().getAcumuladoPartida(comisariaId, p.codigo) === 0).length
        const enCurso = totalPartidas - completadas - sinIniciar
        const avanceGeneral = totalPartidas > 0
          ? partidas.reduce((sum, p) => sum + get().getAcumuladoPartida(comisariaId, p.codigo), 0) / totalPartidas
          : 0
        return { totalPartidas, completadas, sinIniciar, enCurso, avanceGeneral: Math.round(avanceGeneral) }
      },

      // ===== CUADERNO DE OBRA =====

      async precargarAsiento(comisariaId) {
        const erpUrl = import.meta.env.VITE_ERP_URL || 'http://localhost:8000'
        const { usuario } = get()
        try {
          const res = await fetch(`${erpUrl}/api/v1/cuaderno/asientos/precargar`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-ID': usuario.id.toString()
            },
            body: JSON.stringify({
              comisaria_id: comisariaId,
              fecha: new Date().toISOString().split('T')[0]
            })
          })
          if (res.ok) {
            const borrador = await res.json()
            set({ asientoBorrador: borrador })
            return borrador
          }
        } catch (error) {
          console.error('Error precargando asiento:', error)
        }
        // Fallback con datos mock
        return {
          datos_generales: {
            condiciones_climaticas: '',
            personal_presente: 0,
            equipos_operando: '',
            observaciones_generales: ''
          },
          contenido: {
            avances_partidas: [],
            ocurrencias: [],
            consultas: []
          },
          metadata: {
            cantidad_avances: 0,
            cantidad_ocurrencias: 0,
            cantidad_consultas: 0
          }
        }
      },

      async cargarAsientosCuaderno(comisariaId) {
        const erpUrl = import.meta.env.VITE_ERP_URL || 'http://localhost:8000'
        try {
          // Usar endpoint simple que funciona
          const res = await fetch(`${erpUrl}/api/v1/cuaderno/asientos-simple?comisaria_id=${comisariaId}`)
          if (res.ok) {
            const asientos = await res.json()
            set({ asientosCuaderno: asientos || [] })
            return asientos || []
          }
        } catch (error) {
          console.error('Error cargando asientos:', error)
        }
        set({ asientosCuaderno: [] })
        return []
      },

      async obtenerAsiento(asientoId) {
        const erpUrl = import.meta.env.VITE_ERP_URL || 'http://localhost:8000'
        try {
          const res = await fetch(`${erpUrl}/api/v1/cuaderno/asientos/${asientoId}`)
          if (res.ok) {
            return await res.json()
          }
        } catch (error) {
          console.error('Error obteniendo asiento:', error)
        }
        return null
      },

      async guardarAsiento(asientoData) {
        const erpUrl = import.meta.env.VITE_ERP_URL || 'http://localhost:8000'
        const { usuario, ubicacionActual } = get()
        try {
          // Transformar la estructura para que coincida con CrearAsientoRequest del backend
          const payload = {
            comisaria_id: asientoData.comisaria_id,
            tipo_asiento: asientoData.tipo_asiento?.toUpperCase() || 'DIARIO',
            contenido: {
              avances: asientoData.contenido?.avances_partidas || [],
              clima: asientoData.contenido?.datos_generales?.condiciones_climaticas || null,
              temperatura: null,
              personal: [],
              equipos: [],
              materiales: [],
              ocurrencias: asientoData.contenido?.datos_generales?.observaciones_generales || asientoData.contenido?.ocurrencias?.map(o => o.descripcion).join('; ') || null,
              consultas: asientoData.contenido?.consultas?.map(c => c.descripcion).join('; ') || null,
              observaciones: asientoData.resumen || null,
              adjuntos: []
            },
            geolocalizacion_lat: ubicacionActual?.lat || null,
            geolocalizacion_lng: ubicacionActual?.lng || null
          }

          console.log('DEBUG: guardarAsiento payload:', JSON.stringify(payload, null, 2))

          const res = await fetch(`${erpUrl}/api/v1/cuaderno/asientos`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Usuario-Id': usuario.id.toString()
            },
            body: JSON.stringify(payload)
          })

          if (res.ok) {
            const nuevoAsiento = await res.json()
            set(state => ({
              asientosCuaderno: [...(state.asientosCuaderno || []), nuevoAsiento],
              asientoBorrador: null
            }))
            return nuevoAsiento
          }
        } catch (error) {
          console.error('Error guardando asiento:', error)
        }
        throw new Error('No se pudo guardar el asiento')
      },

      async cerrarAsiento(asientoId) {
        const erpUrl = import.meta.env.VITE_ERP_URL || 'http://localhost:8000'
        const { usuario } = get()
        try {
          const res = await fetch(`${erpUrl}/api/v1/cuaderno/asientos/${asientoId}/cerrar`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Usuario-Id': usuario.id.toString()
            }
          })

          if (res.ok) {
            const asientoActualizado = await res.json()
            set(state => ({
              asientosCuaderno: (state.asientosCuaderno || []).map(a =>
                a.id === asientoId ? asientoActualizado : a
              )
            }))
            return asientoActualizado
          }
        } catch (error) {
          console.error('Error cerrando asiento:', error)
        }
        throw new Error('No se pudo cerrar el asiento')
      },

      async firmarAsiento(asientoId, pin, observaciones = null) {
        const erpUrl = import.meta.env.VITE_ERP_URL || 'http://localhost:8000'
        const { usuario } = get()
        try {
          const res = await fetch(`${erpUrl}/api/v1/cuaderno/asientos/${asientoId}/firmar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              usuario_id: usuario.id,
              pin,
              observaciones
            })
          })

          if (res.ok) {
            const asientoActualizado = await res.json()
            set(state => ({
              asientosCuaderno: (state.asientosCuaderno || []).map(a =>
                a.id === asientoId ? asientoActualizado : a
              )
            }))
            return asientoActualizado
          }
        } catch (error) {
          console.error('Error firmando asiento:', error)
        }
        throw new Error('No se pudo firmar el asiento')
      },

      clearAsientoBorrador() {
        set({ asientoBorrador: null })
      }
    }),
    {
      name: 'monitor-obra-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        usuario: state.usuario,
        avances: state.avances,
        pendienteSync: state.pendienteSync,
        comisariaSeleccionada: state.comisariaSeleccionada,
        loginUbicacion: state.loginUbicacion,
        partidasCache: state.partidasCache,
        asientosCuaderno: state.asientosCuaderno,
        asientoBorrador: state.asientoBorrador,
      }),
      onRehydrateStorage: () => (state) => {
        // NO cargar datos iniciales - empezar completamente vacío
        if (state && (!state.avances || state.avances.length === 0)) {
          state.avances = [] // Array vacío, sin datos de prueba
        }
        // NO pre-cargar partidas - se cargarán del API cuando sea necesario
        if (state && (!state.partidasCache || Object.keys(state.partidasCache).length === 0)) {
          state.partidasCache = {}
        }
      },
    }
  )
)
