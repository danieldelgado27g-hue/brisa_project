# Roadmap de Implementación — DermaMatch Backend

## Estado Actual (Julio 2026)

| Fase | Nombre | Estado | Progreso |
|---|---|---|---|
| 1 | Fundación | ✅ **Completada** | 100% |
| 2 | Catálogo de Productos | ✅ **Completada** | 100% |
| 3 | Diagnóstico + Rutina Personalizada | ⚠️ **Parcial** | ~60% |
| 4 | E-commerce (Carrito + Pagos) | ⚠️ **Parcial** | ~70% |
| 5 | Social + Engagement | ✅ **Completada** | 100% |
| 6 | Suscripciones + Admin | ❌ **Pendiente** | 0% |
| 7 | Optimización | ❌ **Pendiente** | 0% |

### Leyenda
- ✅ Completada — Todos los endpoints funcionales
- ⚠️ Parcial — Funcionalidad base lista, faltan features avanzados
- ❌ Pendiente — No iniciado

---

## Resumen de Fases

| Fase | Nombre | Semanas estimadas | Depende de |
|---|---|---|---|
| 1 | Fundación | 1-2 | — |
| 2 | Catálogo de Productos | 3-4 | Fase 1 |
| 3 | Diagnóstico + Rutina Personalizada | 5-6 | Fase 2 |
| 4 | E-commerce (Carrito + Pagos) | 7-9 | Fase 2 |
| 5 | Social + Engagement | 10-11 | Fase 1 |
| 6 | Suscripciones + Admin | 12-14 | Fase 4 |
| 7 | Optimización | 15+ | Todas |

---

## Lo que YA está implementado (Julio 2026)

### Fase 1 — Fundación ✅
```
Backend: Express + PostgreSQL + JWT
Hosting: Netlify Functions / Docker
BD: 15 tablas creadas en init.sql
Seed: 12 productos iniciales
```

**Endpoints:**
- `POST /api/auth/register` — Registro con bcrypt
- `POST /api/auth/login` — Login con JWT
- `GET /api/auth/me` — Perfil propio
- `GET /api/profiles/:id` — Obtener perfil
- `PUT /api/profiles/:id` — Actualizar perfil (incluye routine_config)

### Fase 2 — Catálogo de Productos ✅
**Endpoints:**
- `GET /api/products` — Listado con filtros y paginación
- `GET /api/products/:id` — Detalle completo

**Filtros soportados:** search, type, category, budget, brand, eco, cruelty, minPrice, maxPrice, sortBy, order, page, limit

### Fase 3 — Diagnóstico + Rutina ⚠️
**Implementado:**
- `POST /api/diagnosis` — Crear/actualizar perfil de piel
- `GET /api/diagnosis` — Obtener perfil activo
- `POST /api/routines/generate` — Generar rutina
- `GET /api/routines` — Listar rutinas
- `GET /api/routines/:id` — Detalle de rutina

**Pendiente:**
- Scoring avanzado (actualmente selecciona primer match por categoría)
- `PUT /api/routines/:id/swap` — Cambiar producto en rutina
- `GET /api/routines/:id/alternatives` — Alternativas para un paso
- Regla de 90 días para re-evaluación

### Fase 4 — E-commerce ⚠️
**Implementado:**
- `GET /api/cart` — Carrito con JOIN a productos
- `POST /api/cart` — Agregar item (o incrementar)
- `PUT /api/cart/:productId` — Actualizar cantidad
- `DELETE /api/cart/:productId` — Eliminar item
- `POST /api/orders` — Crear orden desde carrito
- `GET /api/orders` — Historial
- `GET /api/orders/:id` — Detalle con items

**Pendiente:**
- Integración Stripe real (solo hay mock `POST /api/payment`)
- `POST /api/create-payment-intent`
- `POST /api/confirm-payment`
- `POST /api/stripe-webhook`

### Fase 5 — Social + Engagement ✅
**Endpoints:**
- `GET/POST/DELETE /api/favorites` — Favoritos
- `POST/GET/GET/DELETE /api/diary` — Skin diary
- `GET /api/dermatologists` — Lista de dermatólogos
- `POST/GET /api/consultas` — Consultas
- `POST/GET/PUT/DELETE /api/products/:id/reviews` — Reseñas
- `POST/GET/DELETE /api/community-routines` — Rutinas comunidad
- `POST /api/contact` — Contacto (sin email real)

**Pendiente:**
- `GET /api/diary-entries/stats` — Estadísticas del diario
- `POST /api/community-routines/:id/like` — Likes
- `POST /api/product-reviews/:id/report` — Reportar reseña
- Compra verificada en reseñas

---

### Fase 6 — Suscripciones + Admin ❌ PENDIENTE

**Documentación:** Ver [`admin-panel.md`](./admin-panel.md) para detalles completos.

#### 6A. Panel de Administración (TDD)

**Endpoints a implementar:**
- `GET /api/admin/dashboard` — Métricas agregadas
- `POST /api/admin/products` — Crear producto
- `PUT /api/admin/products/:id` — Actualizar producto
- `DELETE /api/admin/products/:id` — Desactivar producto
- `GET /api/admin/consultas` — Ver todas las consultas
- `PUT /api/admin/consultas/:id` — Responder consulta
- `GET /api/admin/users` — Listar usuarios
- `PUT /api/admin/users/:id` — Gestionar usuario/rol
- `GET /api/admin/orders` — Ver todas las órdenes
- `PUT /api/admin/orders/:id` — Actualizar estado orden
- `PUT /api/admin/reviews/:id` — Moderar reseña

**Infraestructura requerida:**
- Campo `role` en tabla users
- Tabla `admin_audit_log` para auditoría
- Middleware `verifyRole` en utils/admin.js
- Actualizar JWT payload para incluir role
- 41 tests TDD en 8 archivos nuevos

**Estructura modular:**
```
netlify/functions/
├── admin-dashboard.js   # GET /api/admin/dashboard
├── admin-products.js     # POST/PUT/DELETE /api/admin/products
├── admin-consultas.js    # GET/PUT /api/admin/consultas
├── admin-users.js        # GET/PUT /api/admin/users
├── admin-orders.js       # GET/PUT /api/admin/orders
└── admin-reviews.js      # PUT /api/admin/reviews
```

#### 6B. Suscripciones (Stripe)

**Endpoints a implementar:**
- `GET /api/subscription-plans` — Listar planes (S/9.99 Pro, S/19.99 Premium)
- `POST /api/create-checkout-session` — Stripe Checkout
- `POST /api/cancel-subscription` — Cancelar suscripción
- `GET /api/subscription-status` — Estado de suscripción
- `POST /api/stripe-subscription-webhook` — Webhook Stripe

**Tablas requeridas:**
- `subscription_plans` — Planes disponibles
- `user_subscriptions` — Suscripciones activas

**Nota:** Stripe tiene modo test para desarrollo sin cargos reales.

---

## Próximos Pasos ADMIN (Fase 6) (Con Enfoque TDD)

### Prioridad 0: Fortalecer Tests Existentes (TDD Foundation)
```diff
+ Completar coverage de routines.test.js (scoring tests): 70% → 90%
+ Agregar tests edge cases en products.test.js: filtros eco/cruelty
+ Tests de validación de stock en cart.test.js
+ Tests de integración multi-endpoint (flujo completo)
+ Setup de CI/CD con tests automatizados
```

### Prioridad 1: Completar Fase 4 (E-commerce real)
```diff
+ Stripe: create-payment-intent, confirm-payment, stripe-webhook
+ Reemplazar mock de payment.js con integración real
+ Validación de stock antes de confirmar orden
+ Tests de Stripe con modo test
```

### Prioridad 2: Mejorar Fase 3 (Rutina avanzada)
```diff
+ Migrar algoritmo de scoring del frontend (routineEngine.js) al backend
+ Swapp de productos en rutina
+ Endpoint de alternativas
+ Regla de 90 días server-side
+ Tests de scoring avanzado (unit tests del algoritmo)
```

### Prioridad 3: Fase 6 (Suscripciones + Admin)
```diff
+ GET /api/subscription-plans
+ POST /api/create-checkout-session (Stripe)
+ POST /api/cancel-subscription
+ GET /api/subscription-status
+ POST /api/stripe-subscription-webhook
+ Panel admin endpoints
+ Email real con SendGrid/Resend
+ Tests de autorización por rol admin
```

### Prioridad 4: Fase 7 (Optimización)
```diff
+ Tests E2E con Playwright
+ Cache con Edge Functions
+ Analytics (PostHog)
+ Rate limiting
+ Tests de carga y performance
```

---

## Fase TDD: Estrategia de Testing por Fase

### Tests por Fase de Desarrollo

| Fase | Tests Unitarios | Tests Integración | Tests E2E | Cobertura Objetivo |
|---|---|---|---|---|
| **1. Fundación** | ✅ JWT helpers, bcrypt | ✅ Auth endpoints | ❌ | 90% |
| **2. Catálogo** | ✅ Filtros, búsqueda | ✅ Products endpoints | ❌ | 85% |
| **3. Rutina** | ⚠️ Scoring (pendiente) | ⚠️ Routines endpoints | ❌ | 80% → 90% |
| **4. E-commerce** | ✅ Cálculos carrito | ✅ Cart/Orders endpoints | ❌ | 85% |
| **5. Social** | ✅ Validaciones | ✅ Social endpoints | ❌ | 80% |
| **6. Admin** | ❌ Pendiente | ❌ Pendiente | ❌ | 70% |
| **7. Optimización** | ❌ Pendiente | ❌ Pendiente | ✅ | 75% |

### Tests Pendientes por Fase

#### Fase 3 - Rutina (⚠️ Críticos)
```javascript
// Unit tests del scoring algoritmo
describe("calculateRoutineScore", () => {
  it("debe calcular score base + match piel + alergias + precio + rating");
  it("deve penalizar productos con alergias del usuario");
  it("debe priorizar productos dentro del presupuesto");
  it("deve elegir mejor rating si hay empate");
});

// Integration tests
describe("POST /api/routines/generate", () => {
  it("deve generar rutina con scoring real");
  it("deve fallback a productos alternativos si no hay match");
  it("deve validar mínimo 3 productos por turno");
});
```

#### Fase 4 - E-commerce (⚠️ Importantes)
```javascript
// Stripe integration tests
describe("POST /api/create-payment-intent", () => {
  it("deve crear payment intent en Stripe test mode");
  it("deve incluir monto correcto y metadata");
  it("deve manejar error de Stripe");
});

// Stock validation
describe("POST /api/cart", () => {
  it("deve rechazar producto sin stock");
  it("deve validar qty disponible");
});
```

#### Fase 6 - Admin (❌ Pendiente)
```javascript
// Role-based auth tests
describe("Admin Endpoints", () => {
  it("deve rechazar usuario sin rol admin");
  it("deve permitir acceso a admin");
  it("deve auditar acciones administrativas");
});
```

---

## Roadmap TDD (Siguientes 4 semanas)

### Semana 1: Completar Tests Existentes
- [ ] routines.test.js: scoring tests (8 tests)
- [ ] products.test.js: edge cases (5 tests)
- [ ] cart.test.js: stock validation (3 tests)
- [ ] Setup de GitHub Actions para CI

### Semana 2: Stripe Tests
- [ ] payment.test.js: integración Stripe real (6 tests)
- [ ] orders.test.js: flujo completo payment (4 tests)
- [ ] webhook handler tests (3 tests)

### Semana 3: Admin Tests
- [ ] Crear tests/admin.test.js (10 tests)
- [ ] Tests de autorización por rol (5 tests)
- [ ] Tests de moderación (3 tests)

### Semana 4: E2E Tests
- [ ] Setup Playwright
- [ ] Flujo completo: registro → diagnóstico → rutina → compra
- [ ] Flujo admin: login → moderar reseña → actualizar orden
- [ ] Setup de tests en pipeline CI/CD

---

## Métricas TDD Actuales

| Métrica | Valor Actual | Objetivo Q3 | Gap |
|---|---|---|---|
| **Tests totales** | ~120 | 200+ | -80 |
| **Cobertura global** | 78% | 85% | -7% |
| **Endpoints con tests** | 38/60 | 55/60 | -17 |
| **Tests rotos** | 0 | 0 | ✅ |
| **Tiempo ejecución** | ~8s | <15s | ✅ |
| **CI/CD** | ❌ | ✅ | - |

---

## Documentación TDD Disponible

| Documento | Propósito | Ubicación |
|---|---|---|
| **testing-strategy.md** | Estrategia y filosofía TDD | `/docs/testing-strategy.md` |
| **test-coverage.md** | Reporte detallado de cobertura | `/docs/test-coverage.md` |
| **test-guide.md** | Guía práctica para escribir tests | `/docs/test-guide.md` |
| **api-reference.md (Sección 7)** | Casos de prueba por endpoint | `/docs/api-reference.md` |

---

---

## Resumen de Entregables por Fase

| Fase | Entregable | ¿Qué puede hacer el usuario? | Estado |
|---|---|---|---|
| 1 | Backend funcional + BD | Registrarse, iniciar sesión, ver su perfil | ✅ |
| 2 | Catálogo digital | Explorar productos, filtrar, buscar | ✅ |
| 3 | Diagnóstico + rutina | Hacerse el test, recibir rutina personalizada | ⚠️ (sin swapp ni scoring) |
| 4 | Tienda online | Agregar al carrito, crear orden (sin pago real) | ⚠️ (sin Stripe) |
| 5 | Funcionalidades sociales | Favoritos, diario, consultas, reseñas, comunidad | ✅ |
| 6 | Monetización + admin | Suscripciones Pro/Premium, panel admin | ❌ |
| 7 | Producción lista | Cache, CDN, analytics, SEO, tests | ❌ |

---

## Estimación para Completar

| Lo que falta | Esfuerzo estimado |
|---|---|
| Stripe real (payment intent + webhook) | 3-4 días |
| Routine Engine avanzado (scoring + swapp) | 3-4 días |
| Suscripciones (Stripe Subscriptions) | 4-5 días |
| Panel admin (dashboard + CRUD) | 5-7 días |
| Email real (SendGrid/Resend) | 1 día |
| Stats diary + likes + report reviews | 2 días |
| Tests automatizados | 3 días |
| Rate limiting + cache | 2 días |
| **Total restante** | **~23-28 días** |

---

*Documento de planificación actualizado al 07/07/2026 reflejando el estado real de implementación.*
