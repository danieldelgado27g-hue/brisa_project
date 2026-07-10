# Reporte de Cobertura de Tests — DermaMatch Backend

> **Última actualización:** 07/07/2026
> **Total de tests:** 120+ casos distribuidos en 17 archivos
> **Cobertura global estimada:** 78%

---

## 1. Resumen Ejecutivo

| Métrica | Valor | Objetivo | Estado |
|---|---|---|---|
| **Archivos de test** | 17 | — | ✅ |
| **Casos de prueba** | ~120 | 150+ | ⚠️ |
| **Endpoints cubiertos** | 38/60 | 50+ | ⚠️ |
| **Cobertura código** | ~78% | 80% | ⚠️ |
| **Tests pasando** | ✅ All | 100% | ✅ |

---

## 2. Cobertura por Módulo

### A. Autenticación (auth.test.js)

| Endpoint | Tests | Cobertura | Estado |
|---|---|---|---|
| `POST /api/auth/register` | 5 | 95% | ✅ |
| `POST /api/auth/login` | 5 | 95% | ✅ |
| `GET /api/auth/me` | 3 | 90% | ✅ |
| `POST /api/auth/logout` | 2 | 80% | ✅ |
| `POST /api/auth/recover` | 3 | 70% | ✅ |

**Casos probados:**
- ✅ Registro con datos válidos
- ✅ Validación de campos requeridos
- ✅ Email duplicado (409)
- ✅ Login con credenciales correctas
- ✅ Login con credenciales incorrectas
- ✅ Perfil de usuario autenticado
- ✅ Rechazo sin token
- ✅ Token inválido/expirado
- ✅ Logout
- ✅ Recuperación de contraseña

**Falta:**
- ⚠️ Validación de formato de email
- ⚠️ Validación de fortaleza de contraseña
- ⚠️ Token expirado (test real con tiempo)

---

### B. Perfiles (profiles.test.js)

| Endpoint | Tests | Cobertura | Estado |
|---|---|---|---|
| `GET /api/profiles/:id` | 4 | 85% | ✅ |
| `PUT /api/profiles/:id` | 5 | 85% | ✅ |

**Casos probados:**
- ✅ Obtener perfil propio
- ✅ Obtener perfil de otro usuario (403)
- ✅ Actualizar nombre y teléfono
- ✅ Actualizar routine_config
- ✅ Rechazo sin autenticación
- ✅ Validación de ID inválido

**Falta:**
- ⚠️ Actualizar avatar_url
- ⚠️ Validación de phone format

---

### C. Diagnóstico (diagnosis.test.js)

| Endpoint | Tests | Cobertura | Estado |
|---|---|---|---|
| `POST /api/diagnosis` | 4 | 80% | ✅ |
| `GET /api/diagnosis` | 3 | 80% | ✅ |

**Casos probados:**
- ✅ Crear perfil de piel
- ✅ Actualizar perfil existente (UPSERT)
- ✅ Obtener perfil activo
- ✅ Error si no hay perfil
- ✅ Rechazo sin autenticación

**Falta:**
- ⚠️ Validación de type_id
- ⚠️ Validación de concerns array
- ⚠️ Regla de 90 días (no implementada)

---

### D. Productos (products.test.js)

| Endpoint | Tests | Cobertura | Estado |
|---|---|---|---|
| `GET /api/products` | 8 | 90% | ✅ |
| `GET /api/products/:id` | 4 | 90% | ✅ |

**Casos probados:**
- ✅ Listado básico
- ✅ Búsqueda por nombre
- ✅ Filtro por tipo de piel
- ✅ Filtro por categoría
- ✅ Filtro por presupuesto
- ✅ Filtro por marca
- ✅ Filtros combinados
- ✅ Paginación
- ✅ Ordenamiento
- ✅ Detalle de producto
- ✅ Producto no encontrado (404)

**Falta:**
- ⚠️ Filtro eco/cruelty
- ⚠️ Búsqueda por ingrediente
- ⚠️ Productos con stock = 0

---

### E. Rutinas (routines.test.js)

| Endpoint | Tests | Cobertura | Estado |
|---|---|---|---|
| `POST /api/routines/generate` | 5 | 70% | ⚠️ |
| `GET /api/routines` | 3 | 80% | ✅ |
| `GET /api/routines/:id` | 3 | 80% | ✅ |

**Casos probados:**
- ✅ Generar rutina con perfil válido
- ✅ Error sin diagnóstico previo
- ✅ Listar rutinas del usuario
- ✅ Obtener rutina específica
- ✅ Acceso denegado a rutina de otro
- ✅ Respuesta incluye morning/night/summary

**Falta:**
- ❌ Scoring avanzado (no implementado)
- ❌ Validación de productos duplicados
- ❌ Validación de productos esenciales
- ❌ Prueba con diferentes budgets
- ❌ Prueba con allergies
- ❌ `PUT /api/routines/:id/swap` (no implementado)
- ❌ `GET /api/routines/:id/alternatives` (no implementado)

---

### F. Carrito (cart.test.js)

| Endpoint | Tests | Cobertura | Estado |
|---|---|---|---|
| `POST /api/cart` | 4 | 85% | ✅ |
| `GET /api/cart` | 3 | 85% | ✅ |
| `PUT /api/cart/:productId` | 3 | 85% | ✅ |
| `DELETE /api/cart/:productId` | 3 | 85% | ✅ |

**Casos probados:**
- ✅ Agregar producto
- ✅ Incrementar cantidad si existe
- ✅ Validar product_id requerido
- ✅ Listar carrito con JOIN a productos
- ✅ Actualizar cantidad
- ✅ Eliminar producto
- ✅ Rechazo sin autenticación

**Falta:**
- ⚠️ Validación de stock
- ⚠️ Validación de qty > 0
- ⚠️ Carrito vacío retorna array vacío

---

### G. Órdenes (orders.test.js)

| Endpoint | Tests | Cobertura | Estado |
|---|---|---|---|
| `POST /api/orders` | 5 | 85% | ✅ |
| `GET /api/orders` | 3 | 85% | ✅ |
| `GET /api/orders/:id` | 3 | 85% | ✅ |

**Casos probados:**
- ✅ Crear orden desde carrito
- ✅ La orden vacía el carrito
- ✅ Incluir items en la respuesta
- ✅ Historial de órdenes
- ✅ Detalle de orden específica
- ✅ Acceso denegado a orden de otro usuario

**Falta:**
- ⚠️ Validación de payment_method
- ⚠️ Validación de delivery_option
- ⚠️ Orden con carrito vacío
- ⚠️ Cálculo correcto del total

---

### H. Favoritos (favorites.test.js)

| Endpoint | Tests | Cobertura | Estado |
|---|---|---|---|
| `POST /api/favorites` | 3 | 85% | ✅ |
| `GET /api/favorites` | 3 | 85% | ✅ |
| `DELETE /api/favorites/:productId` | 3 | 85% | ✅ |

**Casos probados:**
- ✅ Agregar a favoritos
- ✅ Evitar duplicados
- ✅ Listar favoritos con datos de producto
- ✅ Quitar de favoritos
- ✅ Rechazo sin autenticación

**Falta:**
- ⚠️ Agregar favorito duplicado (409 expected)
- ⚠️ Eliminar favorito que no existe

---

### I. Diario (diary.test.js)

| Endpoint | Tests | Cobertura | Estado |
|---|---|---|---|
| `POST /api/diary` | 4 | 80% | ✅ |
| `GET /api/diary` | 2 | 80% | ✅ |
| `GET /api/diary/:date` | 2 | 80% | ✅ |
| `DELETE /api/diary/:date` | 2 | 80% | ✅ |

**Casos probados:**
- ✅ Crear entrada
- ✅ UPSERT por fecha
- ✅ Listar historial
- ✅ Obtener entrada por fecha
- ✅ Eliminar entrada
- ✅ Validación de fecha

**Falta:**
- ⚠️ Validación de mood values
- ⚠️ Una entrada por día (unique constraint)
- ⚠️ Formato de fecha YYYY-MM-DD

---

### J. Dermatólogos (dermatologists.test.js)

| Endpoint | Tests | Cobertura | Estado |
|---|---|---|---|
| `GET /api/dermatologists` | 4 | 90% | ✅ |
| `GET /api/dermatologists/:id` | 3 | 90% | ✅ |

**Casos probados:**
- ✅ Listar dermatólogos
- ✅ Listar solo activos
- ✅ Detalle de dermatólogo
- ✅ 404 si no existe
- ✅ Endpoint público (sin auth)

**Falta:**
- ⚠️ Paginación de listado
- ⚠️ Filtros (especialidad, clínica)

---

### K. Consultas (consultas.test.js)

| Endpoint | Tests | Cobertura | Estado |
|---|---|---|---|
| `POST /api/consultas` | 3 | 80% | ✅ |
| `GET /api/consultas` | 3 | 80% | ✅ |
| `GET /api/consultas/:id` | 2 | 80% | ✅ |

**Casos probados:**
- ✅ Enviar consulta
- ✅ Listar consultas propias
- ✅ Ver consulta específica
- ✅ Rechazo sin autenticación
- ✅ Acceso denegado a consulta de otro

**Falta:**
- ⚠️ Validación de subject/message
- ⚠️ Consulta respondida muestra answer
- ⚠️ Marcar como resuelta

---

### L. Reseñas (reviews.test.js)

| Endpoint | Tests | Cobertura | Estado |
|---|---|---|---|
| `POST /api/products/:id/reviews` | 4 | 85% | ✅ |
| `GET /api/products/:id/reviews` | 2 | 85% | ✅ |
| `PUT /api/products/:id/reviews` | 3 | 85% | ✅ |
| `DELETE /api/products/:id/reviews` | 2 | 85% | ✅ |

**Casos probados:**
- ✅ Crear reseña
- ✅ Una reseña por producto/usuario
- ✅ Listar reseñas de producto
- ✅ Actualizar reseña propia
- ✅ Eliminar reseña propia
- ✅ Endpoint público para listar
- ✅ Validación de stars (1-5)

**Falta:**
- ⚠️ Verified purchase (no implementado)
- ⚠️ Reportar reseña inapropiada
- ⚠️ Reseña con purchase verified badge

---

### M. Comunidad (community.test.js)

| Endpoint | Tests | Cobertura | Estado |
|---|---|---|---|
| `POST /api/community-routines` | 3 | 80% | ✅ |
| `GET /api/community-routines` | 2 | 80% | ✅ |
| `GET /api/community-routines/:id` | 2 | 80% | ✅ |
| `DELETE /api/community-routines/:id` | 2 | 80% | ✅ |

**Casos probados:**
- ✅ Compartir rutina
- ✅ Listar rutinas comunidad
- ✅ Ver rutina específica
- ✅ Eliminar rutina propia
- ✅ Rechazo al eliminar rutina de otro

**Falta:**
- ❌ Dar like a rutina (no implementado)
- ⚠️ Validación de avatar_emoji
- ⚠️ Filtros por skin_type

---

### N. Contacto (contact.test.js)

| Endpoint | Tests | Cobertura | Estado |
|---|---|---|---|
| `POST /api/contact` | 2 | 70% | ✅ |

**Casos probados:**
- ✅ Enviar mensaje de contacto
- ✅ Validación de campos requeridos

**Falta:**
- ⚠️ Validación de formato de email
- ⚠️ Test de envío real de email (no implementado)

---

### O. Pagos (payment.test.js)

| Endpoint | Tests | Cobertura | Estado |
|---|---|---|---|
| `POST /api/payment` | 2 | 60% | ⚠️ |

**Casos probados:**
- ✅ Procesar pago mock
- ✅ Guardar en tabla payments

**Falta:**
- ❌ Stripe real (no implementado)
- ❌ Payment intent
- ❌ Webhook handling
- ❌ Validación de card number

---

## 3. Tests Pendientes por Prioridad

### 🔴 Alta Prioridad (Críticos)

| Test | Motivo | Estimación |
|---|---|---|
| Validación de stock en cart | Edge case crítico | 30 min |
| Rutina scoring avanzado | Feature principal incompleta | 2 horas |
| Stripe payment intent | Feature de pagos faltante | 3 horas |
| Verified purchase en reviews | Feature de confianza | 1 hora |

### 🟡 Media Prioridad

| Test | Motivo | Estimación |
|---|---|---|
| Formato de teléfono en profiles | Validación de datos | 30 min |
| Filtros eco/cruelty en products | Feature documentada | 30 min |
| Paginación dermatologists | Performance | 30 min |
| Report review | Moderación | 45 min |

### 🟢 Baja Prioridad

| Test | Motivo | Estimación |
|---|---|---|
| Email real en contact | Feature no implementada | — |
| Like en community routines | Feature no implementada | — |
| Swap/alternatives en routines | Feature no implementada | — |

---

## 5. Tests de Administración (PENDIENTE - 0% Implementado)

> **Estado:** ❌ No implementado
> **Documentación:** Ver [`admin-panel.md`](./admin-panel.md)
> **Prioridad:** Alta (Fase 6)

### Tests por Módulo Admin

#### A. Autenticación y Autorización

| Test | Estado | Prioridad |
|---|---|---|
| verifyRole debe permitir rol correcto | ❌ Pendiente | 🔴 Crítica |
| verifyRole debe rechazar rol incorrecto | ❌ Pendiente | 🔴 Crítica |
| verifyRole debe rechazar sin rol | ❌ Pendiente | 🔴 Crítica |
| requireAuthWithRole (401 sin token) | ❌ Pendiente | 🔴 Crítica |
| requireAuthWithRole (403 rol inválido) | ❌ Pendiente | 🔴 Crítica |
| JWT payload incluye role | ❌ Pendiente | 🔴 Crítica |
| Tokens de usuarios vs admins | ❌ Pendiente | 🔴 Crítica |

#### B. Dashboard

| Test | Estado | Prioridad |
|---|---|---|
| GET /api/admin/dashboard (métricas) | ❌ Pendiente | 🟡 Importante |
| Cálculo correcto total_users | ❌ Pendiente | 🟡 Importante |
| Cálculo correcto total_orders | ❌ Pendiente | 🟡 Importante |
| Cálculo correcto total_revenue | ❌ Pendiente | 🟡 Importante |
| Rechazo sin auth admin (401) | ❌ Pendiente | 🔴 Crítica |
| Rechazo usuario normal (403) | ❌ Pendiente | 🔴 Crítica |

#### C. Productos Admin

| Test | Estado | Prioridad |
|---|---|---|
| POST /api/admin/products (crear) | ❌ Pendiente | 🔴 Crítica |
| Validación campos requeridos | ❌ Pendiente | 🔴 Crítica |
| Registro en audit log | ❌ Pendiente | 🟡 Importante |
| PUT /api/admin/products/:id (actualizar) | ❌ Pendiente | 🔴 Crítica |
| old_values/new_values en log | ❌ Pendiente | 🟡 Importante |
| DELETE /api/admin/products/:id (soft delete) | ❌ Pendiente | 🟡 Importante |

#### D. Consultas Admin

| Test | Estado | Prioridad |
|---|---|---|
| GET /api/admin/consultas (todas) | ❌ Pendiente | 🟡 Importante |
| Filtro por status=pending | ❌ Pendiente | 🟢 Deseable |
| PUT /api/admin/consultas/:id (responder) | ❌ Pendiente | 🟡 Importante |
| Asignar dermatólogo | ❌ Pendiente | 🟢 Deseable |

#### E. Usuarios Admin

| Test | Estado | Prioridad |
|---|---|---|
| GET /api/admin/users (listar todos) | ❌ Pendiente | 🔴 Crítica |
| Filtro por role | ❌ Pendiente | 🟡 Importante |
| PUT /api/admin/users/:id (cambiar rol) | ❌ Pendiente | 🔴 Crítica |
| Rechazar rol inválido | ❌ Pendiente | 🔴 Crítica |
| Suspender/banear cuenta | ❌ Pendiente | 🟢 Deseable |

#### F. Órdenes Admin

| Test | Estado | Prioridad |
|---|---|---|
| GET /api/admin/orders (ver todas) | ❌ Pendiente | 🟡 Importante |
| PUT /api/admin/orders/:id (estado) | ❌ Pendiente | 🟡 Importante |
| Transición de estados válida | ❌ Pendiente | 🟢 Deseable |

#### G. Reseñas Admin

| Test | Estado | Prioridad |
|---|---|---|
| PUT /api/admin/reviews/:id (moderar) | ❌ Pendiente | 🟡 Importante |
| GET /api/admin/reviews/reported | ❌ Pendiente | 🟡 Importante |
| Ocultar/mostrar reseña | ❌ Pendiente | 🟢 Deseable |

#### H. Auditoría

| Test | Estado | Prioridad |
|---|---|---|
| GET /api/admin/audit-log | ❌ Pendiente | 🟢 Deseable |
| Registro de creación | ❌ Pendiente | 🟡 Importante |
| Registro de actualización | ❌ Pendiente | 🟡 Importante |
| Registro de eliminación | ❌ Pendiente | 🟡 Importante |
| IP y user agent en log | ❌ Pendiente | 🟢 Deseable |

### Resumen de Tests Admin

| Categoría | Tests Pendientes | Prioridad Alta | Prioridad Media | Prioridad Baja |
|---|---|---|---|---|
| Auth/Autorización | 7 | 7 | 0 | 0 |
| Dashboard | 6 | 3 | 3 | 0 |
| Productos Admin | 7 | 5 | 2 | 0 |
| Consultas Admin | 5 | 0 | 3 | 2 |
| Usuarios Admin | 5 | 3 | 2 | 0 |
| Órdenes Admin | 3 | 0 | 2 | 1 |
| Reseñas Admin | 3 | 0 | 2 | 1 |
| Auditoría | 5 | 0 | 3 | 2 |
| **TOTAL** | **41 tests** | **18** | **17** | **6** |

### Archivos de Tests Admin a Crear

```
tests/
├── admin-auth.test.js        (7 tests - autorización)
├── admin-dashboard.test.js   (6 tests - métricas)
├── admin-products.test.js    (7 tests - CRUD productos)
├── admin-consultas.test.js   (5 tests - gestión consultas)
├── admin-users.test.js       (5 tests - gestión usuarios)
├── admin-orders.test.js      (3 tests - gestión órdenes)
├── admin-reviews.test.js     (3 tests - moderación)
└── admin-audit.test.js       (5 tests - auditoría)
```

**Total tests admin nuevos:** 41 tests
**Proyección cobertura admin:** 85%+

---

## 6. Comando para Generar Reporte

```bash
# Generar reporte de cobertura completo
npm test -- --coverage --verbose

# Generar reporte en HTML
npm test -- --coverage --coverageReporters=html

# Abrir reporte
open coverage/lcov-report/index.html
```

---

## 5. Métricas de Calidad

| Métrica | Actual | Objetivo | Gap |
|---|---|---|---|---|
| Tests totales | ~120 | 150+ | -30 |
| Cobertura líneas | 78% | 80% | -2% |
| Endpoints cubiertos | 38/60 | 50+ | -12 |
| Tests rotos | 0 | 0 | ✅ |
| Tiempo ejecución | ~8s | <10s | ✅ |

---

## 6. Próximos Pasos

1. **Semana 1:** Completar tests de faltantes en routines (scoring)
2. **Semana 2:** Agregar tests de edge cases en cart y orders
3. **Semana 3:** Setup de E2E tests con Playwright
4. **Semana 4:** Integración en CI/CD

---

*Reporte de cobertura actualizado al 07/07/2026.*
