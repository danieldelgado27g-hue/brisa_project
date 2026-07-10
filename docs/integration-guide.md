# Guía de Integración Frontend-Backend — DermaMatch

> **Fecha:** 07/07/2026
> **Estado:** ✅ Integración completa (52 endpoints + 13 admin endpoints)

---

## Arquitectura de la Integración

```
┌─────────────────┐         HTTP/JSON          ┌──────────────────┐
│   Frontend      │ ────────────────────────────> │   Backend API    │
│  (Vanilla JS)   │                              │  (Express/Node)  │
│                 │ <──────────────────────────── │                  │
│  - api-client.js │    Respuestas JSON           │  - Netlify Fns   │
│  - products.js   │                              │  - PostgreSQL     │
│  - profile.js    │                              │  - JWT Auth       │
│  - storage.js    │                              │                  │
└─────────────────┘                              └──────────────────┘
```

---

## 1. ApiClient - Módulo de Comunicación

**Ubicación:** `js/api-client.js`

El ApiClient es el módulo central para todas las comunicaciones con el backend.

### Instalación

```html
<script src="js/api-client.js"></script>
```

### Configuración

```javascript
// Desarrollo (por defecto)
const API_BASE_URL = 'http://localhost:3000/api';

// Producción (configurar antes de cargar)
window.API_BASE_URL = 'https://api.dermamatch.pe/api';
```

### Uso Básico

```javascript
// GET request
window.api.get('/products', { type: 'oily' })
  .then(data => console.log(data.products));

// POST request
window.api.post('/auth/login', { email: '...', password: '...' })
  .then(data => console.log(data.token));

// PUT request
window.api.put('/profiles/1', { routine_config: {...} })
  .then(data => console.log(data.success));

// DELETE request
window.api.delete('/cart/1')
  .then(data => console.log(data.success));
```

### Manejo de Autenticación

```javascript
// El ApiClient maneja tokens automáticamente
// Guardar token (después de login/registro)
window.api.setToken(token);

// Verificar si está autenticado
if (window.api.isAuthenticated()) {
  // Usuario logueado
}

// Limpiar token (logout)
window.api.clearToken();
```

---

## 2. Mapeo de Funciones Frontend → Endpoints Backend

### Autenticación

| Función Frontend | Endpoint Backend | Archivo |
|------------------|------------------|--------|
| `Storage.login()` | `POST /api/auth/login` | `storage.js` |
| `Storage.register()` | `POST /api/auth/register` | `storage.js` |
| `Storage.logout()` | `POST /api/auth/logout` | `storage.js` |
| - | `GET /api/auth/me` | - |

**Ejemplo:**
```javascript
Storage.login(email, password).then(result => {
  if (result.ok) {
    console.log('Usuario:', result.user);
  }
});
```

### Productos

| Función Frontend | Endpoint Backend | Archivo |
|------------------|------------------|--------|
| `Products.getAll(params)` | `GET /api/products` | `products.js` |
| `Products.getById(id)` | `GET /api/products/:id` | `products.js` |
| `Products.getReviews(id)` | `GET /api/products/:id/reviews` | `products.js` |
| `Products.addReview(id, data)` | `POST /api/products/:id/reviews` | `products.js` |
| `Products.updateReview(id, data)` | `PUT /api/products/:id/reviews` | `products.js` |
| `Products.deleteReview(id)` | `DELETE /api/products/:id/reviews` | `products.js` |

**Ejemplo:**
```javascript
Products.getAll({ type: 'oily', budget: 'medium' })
  .then(products => console.log(products));
```

### Diagnóstico y Perfiles

| Función Frontend | Endpoint Backend | Archivo |
|------------------|------------------|--------|
| `Storage.saveDiagnosisToBackend(profile)` | `POST /api/diagnosis` | `storage.js` |
| `Storage.loadDiagnosisFromBackend()` | `GET /api/diagnosis` | `storage.js` |
| `Profile.saveConfig()` | `PUT /api/profiles/:id` | `profile.js` |

**Ejemplo:**
```javascript
var profile = {
  typeName: 'Grasa con Acné',
  concerns: ['acné', 'poros dilatados'],
  allergies: ['oil-free'],
  description: '...',
  answers: { q1: 'brillante', q2: 'alta' }
};

Storage.saveDiagnosisToBackend(profile).then(result => {
  if (result.ok) console.log('Diagnóstico guardado');
});
```

### Rutinas

| Función Frontend | Endpoint Backend | Archivo |
|------------------|------------------|--------|
| `Profile.generateRoutine()` | `POST /api/routines/generate` | `profile.js` |
| - | `GET /api/routines` | - |
| - | `GET /api/routines/:id` | - |

**Nota:** La lógica de generación de rutinas ahora está completamente en el backend. El frontend solo llama al endpoint y muestra el resultado.

### Carrito y Órdenes

| Función Frontend | Endpoint Backend | Archivo |
|------------------|------------------|--------|
| `Storage.addToCart(product)` | `POST /api/cart` | `storage.js` |
| `Storage.removeFromCart(id)` | `DELETE /api/cart/:id` | `storage.js` |
| `App.checkout()` | `POST /api/orders` | `app.js` |
| - | `GET /api/orders` | - |
| - | `GET /api/orders/:id` | - |

**Ejemplo:**
```javascript
Storage.addToCart(product).then(result => {
  console.log('Producto agregado al carrito');
});
```

### Favoritos

| Función Frontend | Endpoint Backend | Archivo |
|------------------|------------------|--------|
| `Storage.toggleFavorite(id)` | `POST /api/favorites` o `DELETE /api/favorites/:id` | `storage.js` |
| - | `GET /api/favorites` | - |

### Skin Diary

| Función Frontend | Endpoint Backend | Archivo |
|------------------|------------------|--------|
| `SkinDiary.saveEntry()` | `POST /api/diary` | `skin-diary.js` |
| `SkinDiary.deleteEntry(date)` | `DELETE /api/diary/:date` | `skin-diary.js` |
| `SkinDiary.loadEntriesFromBackend()` | `GET /api/diary` | `skin-diary.js` |

### Consultas

| Función Frontend | Endpoint Backend | Archivo |
|------------------|------------------|--------|
| `Consultas.sendConsulta()` | `POST /api/consultas` | `consultas.js` |
| `Consultas.loadConsultas()` | `GET /api/consultas` | `consultas.js` |
| `Consultas.loadDermatologists()` | `GET /api/dermatologists` | `consultas.js` |
| - | `GET /api/consultas/:id` | - |
| - | `GET /api/dermatologists/:id` | - |

### Comunidad

| Función Frontend | Endpoint Backend | Archivo |
|------------------|------------------|--------|
| `Storage.getCommunityRoutines()` | `GET /api/community-routines` | `storage.js` |
| - | `POST /api/community-routines` | - |
| - | `GET /api/community-routines/:id` | - |
| - | `DELETE /api/community-routines/:id` | - |

---

### Panel de Administración

> **Requiere:** Rol `admin` en JWT token

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

**Ejemplo:**
```javascript
// Verificar si es admin
if (Admin.isAdmin()) {
  // Cargar dashboard
  Admin.getDashboard().then(function(dashboard) {
    console.log('Usuarios:', dashboard.total_users);
    console.log('Ingresos:', dashboard.total_revenue);
  });
}
```

---

## 3. Manejo de Errores

### Errores Comunes

| Código HTTP | Significado | Manejo en ApiClient |
|-------------|--------------|----------------------|
| `401` | Token expirado o inválido | Redirigir a home, limpiar token |
| `403` | Sin permisos | Mostrar error de permisos |
| `404` | Recurso no encontrado | Mostrar error de recurso |
| `409` | Conflicto (duplicado) | Mostrar error específico |
| `500` | Error del servidor | Mostrar error genérico |

### Ejemplo de Manejo de Errores

```javascript
window.api.get('/products')
  .then(data => {
    // Éxito
    console.log(data.products);
  })
  .catch(error => {
    // Error
    console.error('Error:', error.error);

    if (error.error === 'Sesión expirada') {
      // Redirigir a login
      window.location.hash = '#home';
    }
  });
```

---

## 4. Flujo de Autenticación

```
1. Registro/Login
   └─> Frontend: Storage.register() / Storage.login()
   └─> Backend: POST /api/auth/register o /auth/login
   └─> Respuesta: { success, user, token }
   └─> Guardar token: window.api.setToken(token)

2. Requests Autenticados
   └─> ApiClient agrega: Authorization: Bearer <token>
   └─> Backend verifica token con JWT
   └─> Si token inválido: 401 → ApiClient limpia token

3. Logout
   └─> Frontend: Storage.logout()
   └─> Backend: POST /api/auth/logout (opcional)
   └─> Limpiar token: window.api.clearToken()
```

---

## 5. Fallback a SessionStorage

Para mejorar la experiencia de usuario, muchas funciones tienen fallback a sessionStorage si el backend falla:

- **Productos:** Cache local de 5 minutos
- **Carrito:** Sincronización local inmediata
- **Favoritos:** Toggle local con sync posterior
- **Diary:** Entradas se guardan localmente primero

Esto permite que la app funcione incluso si hay problemas de conexión.

---

## 6. Testing de la Integración

### Manual Testing Checklist

**Usuario Final:**
- [ ] Login/Registro funciona
- [ ] Productos se cargan desde backend
- [ ] Diagnóstico se guarda en backend
- [ ] Rutinas se generan correctamente
- [ ] Carrito funciona (agregar, eliminar, checkout)
- [ ] Favoritos funcionan
- [ ] Diary funciona (crear, eliminar)
- [ ] Consultas funcionan
- [ ] Token expirado redirige correctamente

**Panel Admin:**
- [ ] Login como admin funciona (admin@dermamatch.com / Admin123!)
- [ ] Dashboard muestra métricas correctas
- [ ] Gestión de productos (lista, crear, editar, desactivar)
- [ ] Gestión de usuarios (lista, cambiar rol)
- [ ] Gestión de órdenes (lista, cambiar estado)
- [ ] Gestión de consultas (lista, responder)
- [ ] Moderación de reseñas (lista, aprobar/rechazar)
- [ ] Solo usuarios con rol `admin` pueden acceder
- [ ] Usuarios sin rol ven error de permisos

### Testing con Backend Local

```bash
# Iniciar backend
cd C:\env\develop\brisa_project\brisa_project_backend
npm run docker:dev

# Backend estará en http://localhost:3000
```

### Testing con Producción

```bash
# Configurar variable de entorno
window.API_BASE_URL = 'https://api.dermamatch.pe/api';
```

---

## 7. Resumen de Cambios en Archivos

| Archivo | Cambios Principales |
|---------|---------------------|
| `js/api-client.js` | NUEVO - Módulo de API |
| `js/storage.js` | Auth, Cart, Favorites, Diary, Community con backend |
| `js/products.js` | Productos y reseñas con backend |
| `js/profile.js` | Configuración de rutina con backend |
| `js/quiz.js` | Guardado de diagnóstico con backend |
| `js/app.js` | Login/Register/Checkout con promises + rutas admin |
| `js/skin-diary.js` | CRUD diario con backend |
| `js/consultas.js` | Consultas y dermatólogos con backend |
| `js/admin-panel.js` | NUEVO - Panel de administración completo |
| `index.html` | Agregado script de api-client.js y admin-panel.js |

---

## 8. Variables de Entorno

### Desarrollo
```javascript
API_BASE_URL = 'http://localhost:3000/api'
```

### Producción
```javascript
API_BASE_URL = 'https://api.dermamatch.pe/api'
```

---

## 9. Panel de Administración

### Credenciales Admin (Desarrollo)

```
Email: admin@dermamatch.com
Password: Admin123!
```

**⚠️ IMPORTANTE:** En producción, cambiar la contraseña inmediatamente después del primer login.

### Rutas del Panel

- `#admin` - Dashboard principal con métricas
- `#admin-products` - Gestión de productos (CRUD)
- `#admin-users` - Gestión de usuarios (roles)
- `#admin-orders` - Gestión de órdenes (estados)
- `#admin-consultas` - Gestión de consultas (respuestas)
- `#admin-reviews` - Moderación de reseñas

### Acceso al Panel

El panel solo está disponible para usuarios con rol `admin`:
1. Iniciar sesión con credenciales admin
2. El enlace "Panel Admin" aparece en el sidebar automáticamente
3. Todas las requests admin incluyen `Authorization: Bearer <token>`
4. Backend verifica `role === 'admin'` en cada endpoint

---

## 10. Próximos Pasos

1. **Testing Completo:** Probar todos los flujos end-to-end (usuario + admin)
2. **Performance:** Implementar cache más agresivo si es necesario
3. **Offline Mode:** Considerar Service Worker para offline
4. **Error Tracking:** Integrar sistema de reporte de errores
5. **Analytics:** Integrar tracking de eventos
6. **Admin UI Mejoras:** Modales completos para crear/editar productos, cambiar roles, etc.

---

**Última actualización:** 07/07/2026
**Versión:** 2.0 (con Panel Admin)
**Autor:** Claude Code Integration
