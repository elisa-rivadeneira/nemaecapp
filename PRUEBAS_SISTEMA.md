# 🧪 GUÍA DE PRUEBAS - SISTEMA DE VALIDACIONES NEMAEC

## 🚀 **Servicios Activos**

| Servicio | URL | Estado |
|----------|-----|--------|
| NEMAEC APP (Móvil) | http://localhost:5173 | ✅ Activo |
| NEMAEC ERP (Admin) | http://localhost:3000 | ✅ Activo |
| API Backend | http://localhost:8000 | ✅ Activo |

## 👥 **USUARIOS DE PRUEBA**

### 1. **MONITORES** (Validan avances del residente)
```
Usuario: lcallupe
Contraseña: 123456
Comisarías: LA ENSENADA, CARABAYLLO

Usuario: nquispe
Contraseña: 123456
Comisarías: LA ENSENADA, CARABAYLLO
```

### 2. **RESIDENTES** (Registran avances)
```
Usuario: grodriguez
Contraseña: 123465
Comisarías: LA ENSENADA, CARABAYLLO

Usuario: cvera
Contraseña: 123456
Comisarías: SAN CAYETANO, LA ENSENADA
```

### 3. **COMISARIOS** (Validan partidas al 100%)
```
Usuario: jrojas
Contraseña: 123457
Comisaría: LA ENSENADA

Usuario: msilva
Contraseña: 123458
Comisaría: CARABAYLLO
```

### 4. **COORDINADOR** (Dashboard ejecutivo)
```
Usuario: agutierrez
Contraseña: 123460
Acceso: Todas las comisarías
```

---

## 📋 **CASOS DE PRUEBA**

### **TEST 1: Flujo Residente → Monitor**

1. **Login como Residente (grodriguez)**
   - Ir a: http://localhost:5173
   - Login: grodriguez / 123465
   - Aceptar permisos GPS (o continuar sin GPS)

2. **Registrar Avance**
   - Seleccionar: LA ENSENADA
   - Ir a: "Registrar Avances"
   - Seleccionar partida: "01.01 ALMACEN Y OFICINA"
   - Registrar: 10% de avance
   - Agregar observación: "Avance del día"
   - Guardar

3. **Login como Monitor (nquispe)**
   - Logout y login: nquispe / 123456
   - Seleccionar: LA ENSENADA
   - Ir a: "Validar Avances"

4. **Validar/Corregir Avance**
   - Ver avance pendiente del residente
   - Opciones:
     - ✅ Validar si está de acuerdo
     - ✏️ Corregir si hay diferencia

**Resultado esperado:** El monitor puede ver y validar los avances del residente.

---

### **TEST 2: Flujo Comisario - Validación de Partidas al 100%**

1. **Preparación: Simular partida al 100%**
   - Como monitor, registrar avances hasta que una partida llegue al 100%
   - Partidas validables por comisario:
     - 04.01.01 - Piso Porcelanato
     - 04.03.04 - Pintura Cielorraso
     - 04.04.01 - Puertas
     - 02.16 - Luminarias

2. **Login como Comisario (jrojas)**
   - Ir a: http://localhost:5173
   - Login: jrojas / 123457
   - Seleccionar: LA ENSENADA

3. **Validar Partidas**
   - Ir a: "Validaciones Pendientes"
   - Ver lista de partidas al 100%
   - Seleccionar una partida
   - Responder preguntas simples:
     - ¿Está instalado correctamente? Sí/No
     - ¿Funciona bien? Sí/No
     - ¿El acabado es uniforme? Sí/No
   - Agregar observaciones (opcional)
   - Tomar foto (opcional)
   - Guardar validación

**Resultado esperado:**
- Estado: CONFORME (todas las respuestas "Sí")
- Estado: CON_OBSERVACIONES (algunas respuestas "No")
- Estado: NO_CONFORME (mayoría respuestas "No")

---

### **TEST 3: Dashboard del Coordinador**

1. **Login como Coordinador (agutierrez)**
   - Ir a: http://localhost:5173
   - Login: agutierrez / 123460

2. **Acceder al Dashboard Ejecutivo**
   - Seleccionar cualquier comisaría
   - Click en: "Dashboard Ejecutivo"
   - Se abre: http://localhost:3000/dashboard-coordinador

3. **Verificar Métricas**
   El coordinador debe ver:
   - Obras con atraso >15%
   - Monitores inactivos >3 días
   - Validaciones pendientes de comisarios
   - Avance promedio nacional

**Resultado esperado:** Vista ejecutiva con todas las métricas en tiempo real.

---

## 🔍 **VERIFICACIÓN DE ROLES**

### **Comportamiento por Rol:**

| Rol | Ve en Módulos | Acciones Principales |
|-----|--------------|----------------------|
| **Residente** | "Registrar Avances" | Registra avances diarios |
| **Monitor** | "Validar Avances" | Valida/corrige avances del residente |
| **Comisario** | "Validaciones Pendientes" | Valida partidas al 100% (aspectos visuales) |
| **Coordinador** | "Dashboard Ejecutivo" | Supervisa todo el sistema |

---

## 🐛 **PROBLEMAS COMUNES Y SOLUCIONES**

### **Error: "No hay partidas"**
- **Causa:** No se cargaron partidas desde el ERP
- **Solución:** Verificar que el backend esté corriendo en :8000

### **Error: "Usuario no encontrado"**
- **Causa:** Credenciales incorrectas
- **Solución:** Usar usuarios/contraseñas exactos de esta guía

### **GPS bloqueado**
- **Solución:** Click en "Continuar sin GPS (bajo mi responsabilidad)"

### **Validaciones no aparecen para Comisario**
- **Causa:** No hay partidas al 100% o no son del tipo validable
- **Solución:** Como monitor, llevar estas partidas al 100%:
  - 04.01.01, 04.03.04, 04.04.01, 02.16

---

## ✅ **CHECKLIST DE VALIDACIÓN**

- [ ] Residente puede registrar avances
- [ ] Monitor puede ver avances del residente
- [ ] Monitor puede validar o corregir avances
- [ ] Comisario solo ve partidas al 100% validables
- [ ] Comisario puede responder preguntas simples
- [ ] Coordinador accede al dashboard ejecutivo
- [ ] Los roles ven opciones diferenciadas
- [ ] La navegación funciona correctamente
- [ ] Los datos se persisten en localStorage

---

## 📊 **FLUJO COMPLETO DEL SISTEMA**

```
1. RESIDENTE registra avance (80% de partida)
          ↓
2. MONITOR valida/corrige el avance
          ↓
3. Partida llega al 100%
          ↓
4. COMISARIO valida aspectos visuales/funcionales
          ↓
5. COORDINADOR supervisa todo en dashboard
```

---

## 🚦 **ESTADO ACTUAL**

| Funcionalidad | Estado | Notas |
|--------------|--------|-------|
| Login con 4 roles | ✅ Implementado | Funciona con usuarios mock |
| Vista Residente | ✅ Implementado | Registra avances |
| Vista Monitor | ✅ Implementado | Valida avances del residente |
| Vista Comisario | ✅ Implementado | Valida partidas al 100% |
| Vista Coordinador | 🔄 Parcial | Redirige a ERP, falta dashboard |
| Sincronización Backend | 🔄 Parcial | Funciona en modo offline |
| Notificaciones | ⏳ Pendiente | WhatsApp/Push |

---

**Última actualización:** 17/05/2026
**Versión:** 1.0.0-beta