import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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

      // Datos
      avances: AVANCES_INICIALES,
      pendienteSync: [],
      isOnline: navigator.onLine,

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
          if (res.status === 401) return false  // Credenciales incorrectas, no hacer fallback
        } catch {
          // Sin conexión al ERP → fallback a usuarios locales (offline)
          const usuario = USUARIOS.find(u => u.login === login && u.dni === password)
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
          set({ partidasComisaria: partidas })
        } catch {
          set({ partidasComisaria: [] })
        }
      },

      seleccionarComisaria(comisariaId, comisariaObj = null) {
        set({ comisariaSeleccionada: comisariaId, comisariaSeleccionadaObj: comisariaObj })
      },

      registrarAvance({ comisariaId, codigo, porcentajeDia, observaciones, foto, lat, lng }) {
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
          foto: foto || null,
          // Verificación: residentes quedan pendientes, monitores ya están verificados
          verificado: !esResidente,
          monitorVerificador: null,
          acuerdoConAvance: null,
          porcentajeDiaMonitor: null,
          acumuladoMonitor: null,
          obsMonitor: null,
          fotoMonitor: null,
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
        const verificados = avances.filter(a => a.verificado)
        const count = await sincronizarLoteERP(verificados)
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
        const { partidasComisaria } = get()
        return partidasComisaria.length > 0 ? partidasComisaria : (PARTIDAS_POR_COMISARIA[comisariaId] || [])
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
        const { partidasComisaria } = get()
        const partidas = partidasComisaria.length > 0 ? partidasComisaria : (PARTIDAS_POR_COMISARIA[comisariaId] || [])
        const totalPartidas = partidas.length
        const completadas = partidas.filter(p => get().getAcumuladoPartida(comisariaId, p.codigo) >= 100).length
        const sinIniciar = partidas.filter(p => get().getAcumuladoPartida(comisariaId, p.codigo) === 0).length
        const enCurso = totalPartidas - completadas - sinIniciar
        const avanceGeneral = totalPartidas > 0
          ? partidas.reduce((sum, p) => sum + get().getAcumuladoPartida(comisariaId, p.codigo), 0) / totalPartidas
          : 0
        return { totalPartidas, completadas, sinIniciar, enCurso, avanceGeneral: Math.round(avanceGeneral) }
      }
    }),
    {
      name: 'monitor-obra-storage',
      partialize: (state) => ({
        usuario: state.usuario,
        avances: state.avances,
        pendienteSync: state.pendienteSync,
        comisariaSeleccionada: state.comisariaSeleccionada,
        loginUbicacion: state.loginUbicacion,
      }),
    }
  )
)
