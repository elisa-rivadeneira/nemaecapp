import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AVANCES_INICIALES, MONITORS, COMISARIAS, PARTIDAS_POR_COMISARIA } from '../data/mockData'

function getNextId(avances) {
  return avances.length > 0 ? Math.max(...avances.map(a => a.id)) + 1 : 1
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Auth
      usuario: null,
      comisariaSeleccionada: null,

      // Datos
      avances: AVANCES_INICIALES,
      pendienteSync: [],    // avances offline pendientes de sincronizar
      isOnline: navigator.onLine,

      // Geolocation
      ubicacionActual: null,
      loginUbicacion: null,   // ubicación capturada al momento del login

      login(login, password) {
        const monitor = MONITORS.find(m => m.login === login && m.dni === password)
        if (!monitor) return false
        set({ usuario: monitor, comisariaSeleccionada: null })
        return true
      },

      logout() {
        set({ usuario: null, comisariaSeleccionada: null })
      },

      seleccionarComisaria(comisariaId) {
        set({ comisariaSeleccionada: comisariaId })
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

        const nuevo = {
          id: getNextId(get().avances),
          comisariaId,
          codigo,
          fecha: new Date().toISOString().split('T')[0],
          hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          porcentajeDia,
          acumulado: nuevoAcumulado,
          monitor: usuario?.login,
          obs: observaciones,
          foto: foto || null,
          lat,
          lng,
          sincronizado: isOnline,
        }

        set(state => ({
          avances: [...state.avances, nuevo],
          pendienteSync: isOnline ? state.pendienteSync : [...state.pendienteSync, nuevo.id],
        }))

        return nuevo
      },

      setOnline(online) {
        set({ isOnline: online })
        if (online) get().sincronizarPendientes()
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
        return PARTIDAS_POR_COMISARIA[comisariaId] || []
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
        const partidas = PARTIDAS_POR_COMISARIA[comisariaId] || []
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
