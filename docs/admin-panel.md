# Panel de Administración — DermaMatch

> **Estado:** ✅ **BACKEND COMPLETADO** | ❌ **FRONTEND PENDIENTE**
> **Prioridad:** Alta (Fase 6 - Roadmap)
> **Última actualización:** 07/07/2026

---

## 1. Resumen Ejecutivo

El Panel de Administración tiene el **BACKEND 100% COMPLETADO** con todos los endpoints, middleware, migraciones y tests. Falta implementar el **FRONTEND** para consumo de estas APIs.

### Estado Actual

| Componente | Backend | Frontend | Progreso |
|---|---|---|---|
| **Sistema de Roles** | ✅ Implementado | ❌ Pendiente | Backend 100% |
| **Middleware de Autorización** | ✅ Implementado | ❌ Pendiente | Backend 100% |
| **Endpoints Admin** | ✅ 6 endpoints | ❌ 0 integrados | Backend 100% |
| **Tabla de Auditoría** | ✅ Creada | ❌ N/A | Backend 100% |
| **Dashboard de Métricas** | ✅ Implementado | ❌ Pendiente | Backend 100% |

### Credenciales Admin (Desarrollo)

```
Email: admin@dermamatch.com
Password: Admin123!
```

**⚠️ IMPORTANTE:** En producción, cambiar la contraseña inmediatamente después del primer login.

---

## 2. Roles del Sistema

### Roles Documentados

| Rol | Descripción | Permisos Principales |
|---|---|---|
| **user** | Cliente final | Ver productos, crear rutina, comprar, agendar consultas |
| **premium** | Usuario con suscripción | Todo lo de user + descuentos, envío gratis, asesorías |
| **dermatologist** | Profesional de salud | Responder consultas, gestionar agenda |
| **admin** | Administrador plataforma | CRUD productos, usuarios, órdenes, moderar contenido |

**Implementación Actual:** Solo `user` existe.

---

## 3. Endpoints de Administración Planificados

### A. Dashboard y Métricas

| Método | Ruta | Propósito | Backend | Frontend |
|---|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Métricas agregadas del sistema | ✅ | ❌ |

**Respuesta esperada:**
```json
{
  "success": true,
  "dashboard": {
    "total_users": 150,
    "active_products": 45,
    "total_orders": 320,
    "pending_consultas": 8,
    "reported_reviews": 3,
    "total_revenue": 15200.00,
    "total_premium": 12
  }
}
```

**Respuesta esperada:**
```json
{
  "metrics": {
    "total_users": 150,
    "active_users": 45,
    "total_orders": 320,
    "pending_consultas": 8,
    "reported_reviews": 3,
    "total_revenue": 15200.00
  }
}
```

---

### B. Gestión de Productos

| Método | Ruta | Propósito | Backend | Frontend |
|---|---|---|---|---|
| `POST` | `/api/admin/products` | Crear nuevo producto | ✅ | ❌ |
| `PUT` | `/api/admin/products/:id` | Actualizar producto | ✅ | ❌ |
| `DELETE` | `/api/admin/products/:id` | Desactivar producto (soft delete) | ✅ | ❌ |

**Campos a gestionar:**
- name, brand, price, category
- types, allergies, eco, cruelty
- stock, is_active
- image_url, ingredients, description

---

### C. Gestión de Consultas

| Método | Ruta | Propósito | Backend | Frontend |
|---|---|---|---|---|
| `GET` | `/api/admin/consultas` | Ver todas las consultas | ✅ | ❌ |
| `PUT` | `/api/admin/consultas/:id` | Responder consulta | ✅ | ❌ |

**Filtros para listado:**
- status (pending, answered, closed)
- date ranges

---

### D. Gestión de Usuarios

| Método | Ruta | Propósito | Backend | Frontend |
|---|---|---|---|---|
| `GET` | `/api/admin/users` | Listar todos los usuarios (paginado) | ✅ | ❌ |
| `PUT` | `/api/admin/users/:id` | Cambiar rol de usuario | ✅ | ❌ |

**Acciones administrativas:**
- Cambiar rol (user → premium → dermatologist → admin)
- Suspender/banear cuenta
- Ver historial completo

---

### E. Gestión de Órdenes

| Método | Ruta | Propósito | Backend | Frontend |
|---|---|---|---|---|
| `GET` | `/api/admin/orders` | Ver todas las órdenes (paginado) | ✅ | ❌ |
| `PUT` | `/api/admin/orders/:id` | Actualizar estado orden | ✅ | ❌ |

**Estados de orden:**
- pending → confirmed → processing → shipped → delivered → cancelled

---

### F. Moderación de Reseñas

| Método | Ruta | Propósito | Backend | Frontend |
|---|---|---|---|---|
| `PUT` | `/api/admin/reviews/:id` | Moderar reseña (reportado, eliminado) | ✅ | ❌ |
| `GET` | `/api/admin/reviews/reported` | Ver reseñas reportadas | ✅ | ❌ |

---

## 4. Base de Datos - Tablas Implementadas ✅

### Tabla: users (modificada) ✅

**Campo agregado:**
```sql
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
```

**Valores permitidos:** 'user', 'premium', 'dermatologist', 'admin'

**Archivo:** `db/migrations/001_add_roles.sql`

---

### Tabla: admin_audit_log (creada) ✅

**Propósito:** Auditoría de acciones administrativas

```sql
CREATE TABLE admin_audit_log (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices:**
- idx_audit_admin_id
- idx_audit_action
- idx_audit_entity
- idx_audit_created_at

**Archivo:** `db/migrations/002_create_admin_audit_log.sql`

---

## 5. Middleware de Autorización ✅

### Función verifyRole (implementada)

**Ubicación:** `utils/admin.js` ✅

```javascript
/**
 * Verifica que el usuario tenga uno de los roles permitidos
 * @param {Object} user - Usuario del JWT token
 * @param {string[]} allowedRoles - Roles permitidos
 * @returns {Object} {user} o {error}
 */
function verifyRole(user, allowedRoles = ['admin']) {
  if (!user.role) {
    return { error: 'Usuario sin rol definido' };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      error: `Acceso denegado. Se requiere rol: ${allowedRoles.join(' o ')}`
    };
  }

  return { user };
}
```

```
brisa_project_backend/
├── db/
│   ├── migrations/
│   │   ├── 001_add_roles.sql ✅
│   │   ├── 002_create_admin_audit_log.sql ✅
│   │   └── 003_seed_admin_user.sql ✅
│   └── init.sql (actualizado)
│
├── utils/
│   ├── jwt.js (actualizado - incluye role en JWT)
│   └── admin.js ✅
│
├── netlify/functions/
│   ├── admin-dashboard.js ✅
│   ├── admin-products.js ✅
│   ├── admin-consultas.js ✅
│   ├── admin-users.js ✅
│   ├── admin-orders.js ✅
│   └── admin-reviews.js ✅
│
└── tests/
    ├── admin-auth.test.js ✅
    ├── admin-products.test.js ✅
    ├── admin-consultas.test.js ✅
    ├── admin-users.test.js ✅
    ├── admin-orders.test.js ✅
    ├── admin-reviews.test.js ✅
    └── helpers.js
```

---

## 7. Plan de Implementación Frontend

### Estructura de Archivos Frontend

```
project/
├── js/
│   ├── admin-panel.js (NUEVO - Panel admin completo)
│   ├── api-client.js (ya existe - solo usar)
│   └── app.js (actualizar - agregar rutas admin)
│
├── css/
│   └── admin.css (NUEVO - Estilos específicos admin)
│
└── index.html (actualizar - agregar link admin.css y script)
```

### Componentes Frontend a Implementar

1. **Dashboard Principal**
   - Métricas en tiempo real
   - Gráficos de ingresos
   - Lista de actividades recientes

2. **Gestión de Productos**
   - Lista de productos (paginada)
   - Crear/Editar producto (modal)
   - Desactivar producto

3. **Gestión de Usuarios**
   - Lista de usuarios (paginada, filtrable por rol)
   - Cambiar rol de usuario

4. **Gestión de Órdenes**
   - Lista de órdenes (paginada, filtrable por estado)
   - Cambiar estado de orden

5. **Gestión de Consultas**
   - Lista de consultas (filtrable por estado)
   - Responder consulta

6. **Moderación de Reseñas**
   - Lista de reseñas reportadas
   - Aprobar/Rechazar reseña

### Endpoints Frontend → Backend

| Función Frontend | Endpoint Backend | Archivo |
|------------------|------------------|--------|
| `Admin.getDashboard()` | `GET /api/admin/dashboard` | `admin-panel.js` |
| `Admin.getProducts()` | `GET /api/products` | `admin-panel.js` |
| `Admin.createProduct(data)` | `POST /api/admin/products` | `admin-panel.js` |
| `Admin.updateProduct(id, data)` | `PUT /api/admin/products/:id` | `admin-panel.js` |
| `Admin.deleteProduct(id)` | `DELETE /api/admin/products/:id` | `admin-panel.js` |
| `Admin.getUsers(params)` | `GET /api/admin/users` | `admin-panel.js` |
| `Admin.updateUserRole(id, role)` | `PUT /api/admin/users/:id` | `admin-panel.js` |
| `Admin.getOrders(params)` | `GET /api/admin/orders` | `admin-panel.js` |
| `Admin.updateOrderStatus(id, status)` | `PUT /api/admin/orders/:id` | `admin-panel.js` |
| `Admin.getConsultas(params)` | `GET /api/admin/consultas` | `admin-panel.js` |
| `Admin.answerConsulta(id, answer)` | `PUT /api/admin/consultas/:id` | `admin-panel.js` |
| `Admin.getReportedReviews()` | `GET /api/admin/reviews/reported` | `admin-panel.js` |
| `Admin.moderateReview(id, data)` | `PUT /api/admin/reviews/:id` | `admin-panel.js` |

### Rutas de Navegación

- `#admin` - Dashboard principal
- `#admin/products` - Gestión de productos
- `#admin/users` - Gestión de usuarios
- `#admin/orders` - Gestión de órdenes
- `#admin/consultas` - Gestión de consultas
- `#admin/reviews` - Moderación de reseñas

---

## 8. Tests Backend (Completados ✅)

Los siguientes tests ya están implementados y pasando:

| Test | Endpoint | Estado |
|------|----------|--------|
| Autorización (401, 403) | Todos | ✅ |
| Dashboard metrics | GET /api/admin/dashboard | ✅ |
| CRUD productos | POST/PUT/DELETE /api/admin/products | ✅ |
| CRUD usuarios | GET/PUT /api/admin/users | ✅ |
| CRUD órdenes | GET/PUT /api/admin/orders | ✅ |
| CRUD consultas | GET/PUT /api/admin/consultas | ✅ |
| Moderación reseñas | PUT /api/admin/reviews/:id | ✅ |
| Audit log | Todas las acciones | ✅ |

---

## 9. Seguridad Considerada ✅

### Implementado en Backend

- ✅ **verifyRole()** - Middleware de autorización por roles
- ✅ **verifyToken()** - Validación JWT en cada request
- ✅ **logAdminAction()** - Auditoría completa de todas las acciones
- ✅ **Transiciones de estado** - Validación de estados de órdenes
- ✅ **Validación de inputs** - Todos los campos son validados
- ✅ **Self-modification prevention** - Admin no puede modificarse a sí mismo
- ✅ **Soft delete** - Productos no se eliminan físicamente

---

## 10. Estimación de Esfuerzo Frontend

| Componente | Estimación |
|---|---|
| `admin-panel.js` - Módulo completo | 1-2 días |
| `app.js` - Rutas y navegación | 0.5 día |
| `admin.css` - Estilos específicos | 0.5 día |
| Testing manual | 0.5 día |
| **Total** | **2-3 días** |

---

## 11. Acceso al Panel Admin

### Credenciales Desarrollo

```
Email: admin@dermamatch.com
Password: Admin123!
```

### Flujo de Acceso

1. Usuario inicia sesión con credenciales admin
2. Backend verifica rol en `verifyToken()` y `verifyRole()`
3. JWT incluye `role: 'admin'` en payload
4. Frontend muestra enlace/botón al panel admin (si role == 'admin')
5. Todas las requests admin incluyen `Authorization: Bearer <token>`

---

## 12. Próximos Pasos

1. ✅ **Backend completado** - Ya está listo
2. ❌ **Crear `js/admin-panel.js`** - Módulo frontend del panel
3. ❌ **Actualizar `app.js`** - Agregar rutas admin
4. ❌ **Crear `css/admin.css`** - Estilos específicos
5. ❌ **Testing manual** - Probar todo el flujo

---

*Documentación del Panel de Administración*
*Backend: ✅ COMPLETADO | Frontend: ❌ PENDIENTE*
*Última actualización: 07/07/2026*

### ✅ Debe implementar

- **Sanitización de inputs:** Todos los datos de usuarios admin deben ser validados
- **Verificación de ownership:** Evitar que un admin se modifique a sí mismo
- **Auditoría completa:** Registrar TODAS las acciones administrativas
- **Rate limiting:** Proteger endpoints admin contra abuso

### ❌ Evitar

- Hardcoded credentials
- Confiar en datos del cliente sin verificar
- Exponer información sensible en respuestas

---

## 10. Estimación de Esfuerzo

| Componente | Estimación | Dependencies |
|---|---|---|
| Migraciones + utilidades | 2 días | — |
| Endpoints productos | 3 días | Migraciones |
| Dashboard + consultas | 3 días | Migraciones |
| Usuarios + órdenes | 3 días | Migraciones |
| Reseñas + auditoría | 2 días | Todo lo anterior |
| **Total** | **13-15 días** | ~3 semanas |

---

## 11. Sobre Stripe (Mock vs Real)

### Stripe Modo Test

**Sí, Stripe tiene modo de prueba (test mode):**

- Claves de prueba: `sk_test_...` y `pk_test_...`
- No cobra tarjetas reales
- Simula webhooks
- Perfecto para desarrollo y testing

**Para desarrollo inicial:**
```javascript
// Usar modo test
const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);
```

**Para tests:**
```javascript
// Mock de Stripe para tests automatizados
jest.mock('stripe', () => ({
  (key) => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({ id: 'pi_test_123' })
    }
  })
});
```

---

## 12. Próximos Pasos

1. **Aprobar este plan** de implementación
2. **Crear migración** de roles en BD
3. **Escribir tests** TDD (Red-Green-Refactor)
4. **Implementar endpoints** en orden de prioridad
5. **Verificar cobertura** > 80%

---

*Documentación del Panel de Administración - Pendiente de Implementación*
*Última actualización: 07/07/2026*
*Prioridad: Alta (Fase 6)*
