# API Reference — DermaMatch Backend

Documentación para integración frontend ↔ backend.

> **Estado de implementación:**
> - ✅ **Implementado** — Endpoint funcional en el backend actual
> - ❌ **Pendiente** — Endpoint documentado pero NO implementado aún

---

## 1. Información General

### Base URL

| Entorno | URL |
|---|---|
| Desarrollo (local) | `http://localhost:3000/api` |
| Docker | `http://localhost:3000/api` |
| Netlify Dev | `http://localhost:8888/api` |
| Producción | `https://api.dermamatch.pe/api` |

### Autenticación

La mayoría de endpoints requieren un token JWT en el header:

```
Authorization: Bearer <jwt_token>
```

El token se obtiene al registrarse (`POST /api/auth/register`) o iniciar sesión (`POST /api/auth/login`).

**Payload del JWT:**
```json
{
  "id": 1,
  "email": "maria@ejemplo.com",
  "iat": 1700000000,
  "exp": 1700604800
}
```

Duración del token: **7 días**.

### Tecnología

| Componente | Tecnología |
|---|---|
| Runtime | Node.js + Express |
| Base de datos | PostgreSQL (16+) |
| Conexión BD | `pg` (node-postgres) |
| Auth | JWT + bcryptjs |
| Hosting | Netlify Functions / Docker |

### Formato de Respuestas

**Éxito:**
```json
{
  "statusCode": 200,
  "body": {
    "data": { ... }
  }
}
```

**Error:**
```json
{
  "statusCode": 400,
  "body": {
    "error": "mensaje descriptivo"
  }
}
```

### Códigos HTTP

| Código | Significado |
|---|---|
| `200` | OK |
| `201` | Creado |
| `400` | Bad Request — datos inválidos o faltantes |
| `401` | Unauthorized — token faltante o expirado |
| `403` | Forbidden — sin permisos |
| `404` | Not Found — recurso no existe |
| `405` | Method Not Allowed |
| `409` | Conflict — recurso duplicado |
| `500` | Internal Server Error |

---

## 2. Endpoints

### A. Autenticación ✅

---

#### `POST /api/auth/register` ✅

Registrar un nuevo usuario.

**Auth:** No requerida

**Request:**
```json
{
  "name": "María García",
  "email": "maria@ejemplo.com",
  "password": "miClave123"
}
```

**Response 201:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "María García",
    "email": "maria@ejemplo.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 400:**
```json
{
  "error": "Campos requeridos: name, email, password"
}
```

**Response 409:**
```json
{
  "error": "El email ya está registrado"
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"María García","email":"maria@ejemplo.com","password":"miClave123"}'
```

---

#### `POST /api/auth/login` ✅

Iniciar sesión.

**Auth:** No requerida

**Request:**
```json
{
  "email": "maria@ejemplo.com",
  "password": "miClave123"
}
```

**Response 200:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "María García",
    "email": "maria@ejemplo.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 401:**
```json
{
  "error": "Credenciales inválidas"
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@ejemplo.com","password":"miClave123"}'
```

---

#### `GET /api/auth/me` ✅

Obtener datos del usuario autenticado.

**Auth:** Bearer token

**Response 200:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "María García",
    "email": "maria@ejemplo.com",
    "avatar_url": null,
    "phone": null,
    "subscription_plan": "basic",
    "subscription_status": "active",
    "created_at": "2026-07-07T12:00:00.000Z"
  }
}
```

**curl:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

#### `POST /api/auth/logout` ❌ Pendiente

Cerrar sesión (invalida el token).

**Auth:** Bearer token

**Request:** Vacío

**Response 200:**
```json
{
  "success": true,
  "message": "Sesión cerrada"
}
```

---

#### `POST /api/auth/recover` ❌ Pendiente

Solicitar recuperación de contraseña.

**Auth:** No requerida

**Request:**
```json
{
  "email": "maria@ejemplo.com"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Si el email existe, recibirás instrucciones"
}
```

---

### B. Perfiles de Usuario ✅

---

#### `GET /api/profiles/:id` ✅

Obtener perfil del usuario.

**Auth:** Bearer token (solo propio perfil)

**Response 200:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "María García",
    "email": "maria@ejemplo.com",
    "avatar_url": null,
    "phone": null,
    "subscription_plan": "basic",
    "subscription_status": "active",
    "routine_config": {},
    "created_at": "2026-07-07T12:00:00.000Z",
    "updated_at": "2026-07-07T12:00:00.000Z"
  }
}
```

**curl:**
```bash
curl -X GET http://localhost:3000/api/profiles/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

#### `PUT /api/profiles/:id` ✅

Actualizar perfil del usuario.

> Nota: `routine_config` se almacena como JSONB dentro del usuario.

**Auth:** Bearer token

**Request:**
```json
{
  "name": "María García Updated",
  "avatar_url": "https://...",
  "phone": "999888777",
  "routine_config": {
    "budget": "medium",
    "optimization": "balanced",
    "brands": ["CeraVe", "La Roche-Posay"],
    "additionalAllergies": ["paraben-free"]
  }
}
```

**Response 200:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "María García Updated",
    "email": "maria@ejemplo.com",
    "routine_config": { "budget": "medium", ... },
    ...
  }
}
```

**curl:**
```bash
curl -X PUT http://localhost:3000/api/profiles/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"name":"María Updated","phone":"999888777"}'
```

---

### C. Diagnóstico de Piel ✅

---

#### `POST /api/diagnosis` ✅

> **Ruta real:** `/api/diagnosis` (NO `/api/skin-profiles` como en versiones anteriores)

Crear o actualizar el perfil de piel del usuario. Si ya existe un perfil activo, lo actualiza; si no, crea uno nuevo.

**Auth:** Bearer token

**Request:**
```json
{
  "type_name": "Grasa con Acné",
  "type_id": "oily",
  "concerns": ["acné", "poros dilatados", "brillo excesivo"],
  "allergies": ["fragrance-free", "oil-free"],
  "description": "Tu piel tiende a producir exceso de sebo...",
  "answers": {
    "q1": "brillante",
    "q2": "alta",
    "q3": "grandes",
    "q4": "frecuente",
    "q5": "quemadizo",
    "q6": "visibles",
    "q7": "algunas"
  }
}
```

**Response 201 (nuevo):**
```json
{
  "success": true,
  "profile": {
    "id": 1,
    "type_name": "Grasa con Acné",
    "type_id": "oily",
    "concerns": ["acné", "poros dilatados"],
    "allergies": ["fragrance-free"],
    "description": "...",
    "answers": { "q1": "brillante", ... },
    "is_active": true
  }
}
```

**Response 200 (actualización):**
```json
{
  "success": true,
  "profile": { ... }
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/diagnosis \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"type_name":"Grasa","type_id":"oily","concerns":["acné"],"allergies":["fragrance-free"],"answers":{"q1":"brillante"}}'
```

---

#### `GET /api/diagnosis` ✅

Obtener el perfil de piel activo del usuario.

**Auth:** Bearer token

**Response 200:**
```json
{
  "profile": {
    "id": 1,
    "type_name": "Grasa con Acné",
    "type_id": "oily",
    "concerns": ["acné", "poros dilatados"],
    "allergies": ["fragrance-free"],
    "description": "...",
    "answers": { "q1": "brillante", ... },
    "is_active": true,
    "created_at": "2026-07-07T12:00:00.000Z",
    "updated_at": "2026-07-07T12:00:00.000Z"
  }
}
```

**Response 404:**
```json
{
  "error": "No hay perfil de piel registrado"
}
```

**curl:**
```bash
curl -X GET http://localhost:3000/api/diagnosis \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### D. Productos (Catálogo) ✅

---

#### `GET /api/products` ✅

Listar productos con filtros opcionales. Implementa búsqueda por texto parcial, filtros y paginación.

**Auth:** No requerida

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `search` | string | Búsqueda por nombre o marca (LIKE %text%) |
| `type` | string | Tipo de piel: `normal`, `dry`, `oily`, `mixed`, `sensitive` |
| `category` | string | `cleanser`, `moisturizer`, `treatment`, `spf`, `toner`, `serum`, `eye_care`, `mask`, `exfoliant` |
| `budget` | string | `low` (< S/15), `medium` (< S/25), `premium` (< S/50), `unlimited` |
| `brand` | string | Nombre de marca (búsqueda parcial) |
| `eco` | boolean | Solo ecológicos |
| `cruelty` | boolean | Solo cruelty-free |
| `minPrice` | number | Precio mínimo |
| `maxPrice` | number | Precio máximo |
| `sortBy` | string | `rating`, `price`, `name` |
| `order` | string | `asc`, `desc` |
| `page` | integer | Número de página (default: 1) |
| `limit` | integer | Items por página (default: 20, max: 100) |

**Response 200:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Limpiador Facial CeraVe",
      "brand": "CeraVe",
      "price": 25.00,
      "category": "cleanser",
      "types": ["normal", "dry"],
      "allergies": ["fragrance-free"],
      "eco": false,
      "cruelty": true,
      "rating": 4.5,
      "image_url": "https://...",
      "ingredients": "Agua, Glicerina, ...",
      "stock": 50
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "totalPages": 1
  }
}
```

> **Nota:** El endpoint NO devuelve `description`, `how_helps`, `store_links` ni `dues` en el listado. Esos campos solo vienen en el detalle.

**curl:**
```bash
curl -X GET "http://localhost:3000/api/products?type=oily&budget=medium&sortBy=rating&order=desc"
```

---

#### `GET /api/products/:id` ✅

Obtener detalle completo de un producto.

**Auth:** No requerida

**Response 200:**
```json
{
  "success": true,
  "product": {
    "id": 1,
    "name": "Limpiador Facial CeraVe",
    "brand": "CeraVe",
    "price": 25.00,
    "category": "cleanser",
    "types": ["normal", "dry"],
    "allergies": ["fragrance-free"],
    "eco": false,
    "cruelty": true,
    "rating": 4.5,
    "image_url": "https://...",
    "ingredients": "Agua, Glicerina, ...",
    "description": "Limpiador suave que respeta la barrera cutánea.",
    "how_helps": "Limpia sin resecar, ideal para piel sensible.",
    "store_links": [{"store": "Amazon", "url": "https://..."}],
    "dues": [],
    "stock": 50,
    "is_active": true
  }
}
```

**curl:**
```bash
curl -X GET http://localhost:3000/api/products/1
```

---

### E. Rutina Personalizada ✅

---

#### `POST /api/routines/generate` ✅

Generar una rutina personalizada basada en el perfil de piel del usuario autenticado y su configuración guardada.

> Usa automáticamente el perfil activo del usuario y su `routine_config`. No requiere body.

**Auth:** Bearer token

**Response 201:**
```json
{
  "success": true,
  "routine": {
    "id": 1,
    "config": {
      "skin_type": "oily",
      "budget": "medium",
      "concerns": ["acné"]
    },
    "morning": [
      {
        "id": 1,
        "name": "Limpiador Facial CeraVe",
        "brand": "CeraVe",
        "price": 25.00,
        "category": "cleanser",
        "step": "Limpieza"
      },
      {
        "id": 5,
        "name": "Niacinamide 10% + Zinc 1%",
        "brand": "The Ordinary",
        "price": 12.00,
        "category": "treatment",
        "step": "Tratamiento"
      },
      {
        "id": 7,
        "name": "Crema Hidratante La Roche-Posay",
        "brand": "La Roche-Posay",
        "price": 28.00,
        "category": "moisturizer",
        "step": "Hidratación"
      },
      {
        "id": 2,
        "name": "Protector Solar ISDIN Fusion Water",
        "brand": "ISDIN",
        "price": 35.00,
        "category": "spf",
        "step": "Protección Solar"
      }
    ],
    "night": [
      {
        "id": 10,
        "name": "Bálsamo Desmaquillante",
        "brand": "CeraVe",
        "price": 18.00,
        "category": "cleanser",
        "step": "Limpieza"
      },
      {
        "id": 8,
        "name": "Effaclar Duo+",
        "brand": "La Roche-Posay",
        "price": 32.00,
        "category": "treatment",
        "step": "Tratamiento"
      },
      {
        "id": 6,
        "name": "Ácido Hialurónico 2% + B5",
        "brand": "The Ordinary",
        "price": 10.00,
        "category": "serum",
        "step": "Sérum"
      },
      {
        "id": 7,
        "name": "Crema Hidratante La Roche-Posay",
        "brand": "La Roche-Posay",
        "price": 28.00,
        "category": "moisturizer",
        "step": "Hidratación"
      }
    ],
    "summary": {
      "skin_type": "oily",
      "config_used": { "budget": "medium" },
      "total_steps": 8,
      "total_cost": 188.00
    },
    "generated_at": "2026-07-07T12:00:00.000Z"
  }
}
```

> **Algoritmo actual:** Busca el primer producto disponible por categoría según el orden definido en `MORNING_ORDER` y `NIGHT_ORDER`. Filtra por `type_id` del perfil y presupuesto. **NO implementa scoring avanzado** ni swapp de productos.

**curl:**
```bash
curl -X POST http://localhost:3000/api/routines/generate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

#### `GET /api/routines` ✅

Listar rutinas generadas del usuario.

**Auth:** Bearer token

**Response 200:**
```json
{
  "routines": [
    {
      "id": 1,
      "config": { "skin_type": "oily", "budget": "medium" },
      "summary": { "total_steps": 8, "total_cost": 188.00 },
      "generated_at": "2026-07-07T12:00:00.000Z",
      "created_at": "2026-07-07T12:00:00.000Z"
    }
  ]
}
```

**curl:**
```bash
curl -X GET http://localhost:3000/api/routines \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

#### `GET /api/routines/:id` ✅

Obtener detalle de una rutina específica.

**Auth:** Bearer token (solo rutinas propias)

**Response 200:**
```json
{
  "routine": {
    "id": 1,
    "config": { ... },
    "morning": [...],
    "night": [...],
    "summary": { ... },
    "generated_at": "2026-07-07T12:00:00.000Z"
  }
}
```

**curl:**
```bash
curl -X GET http://localhost:3000/api/routines/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

#### `PUT /api/routines/:id/swap` ❌ Pendiente

Cambiar un producto de la rutina por uno alternativo.

**Request:**
```json
{
  "turn": "morning",
  "stepIndex": 0,
  "newProductId": 10
}
```

---

#### `GET /api/routines/:id/alternatives` ❌ Pendiente

Obtener productos alternativos para un paso específico.

**Query:** `?turn=morning&stepIndex=0`

---

### F. Carrito de Compras ✅

---

#### `GET /api/cart` ✅

Obtener el carrito del usuario con detalles de producto (JOIN con products).

**Auth:** Bearer token

**Response 200:**
```json
{
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "qty": 2,
      "price_at_add": 25.00,
      "product": {
        "id": 1,
        "name": "Limpiador Facial CeraVe",
        "brand": "CeraVe",
        "price": 25.00,
        "image_url": "https://...",
        "category": "cleanser",
        "stock": 50
      }
    }
  ]
}
```

**curl:**
```bash
curl -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

#### `POST /api/cart` ✅

Agregar un producto al carrito (si ya existe, incrementa cantidad).

**Auth:** Bearer token

**Request:**
```json
{
  "product_id": 1,
  "qty": 1
}
```

**Response 201:**
```json
{
  "success": true,
  "item": {
    "id": 1,
    "product_id": 1,
    "qty": 1,
    "created_at": "2026-07-07T12:00:00.000Z"
  }
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"qty":1}'
```

---

#### `PUT /api/cart/:productId` ✅

Actualizar cantidad de un producto en el carrito.

**Auth:** Bearer token

**Request:**
```json
{
  "qty": 3
}
```

**Response 200:**
```json
{
  "success": true,
  "item": { "id": 1, "product_id": 1, "qty": 3 }
}
```

**curl:**
```bash
curl -X PUT http://localhost:3000/api/cart/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"qty":3}'
```

---

#### `DELETE /api/cart/:productId` ✅

Eliminar un producto del carrito.

**Auth:** Bearer token

**Response 200:**
```json
{
  "success": true
}
```

**curl:**
```bash
curl -X DELETE http://localhost:3000/api/cart/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### G. Órdenes / Checkout ✅

---

#### `POST /api/orders` ✅

Crear una orden a partir del carrito actual del usuario. Toma los items del carrito, calcula total, vacía el carrito.

**Auth:** Bearer token

**Request:**
```json
{
  "payment_method": "card",
  "delivery_option": "delivery",
  "notes": "Dejar en portería"
}
```

**Response 201:**
```json
{
  "success": true,
  "order": {
    "id": 1,
    "status": "pending",
    "total": 50.00,
    "payment_method": "card",
    "delivery_option": "delivery",
    "notes": "Dejar en portería",
    "created_at": "2026-07-07T12:00:00.000Z",
    "items": [
      {
        "product_id": 1,
        "product_name": "Limpiador Facial CeraVe",
        "product_price": 25.00,
        "qty": 2,
        "subtotal": 50.00
      }
    ]
  }
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"payment_method":"card","delivery_option":"delivery"}'
```

---

#### `GET /api/orders` ✅

Listar órdenes del usuario.

**Auth:** Bearer token

**Response 200:**
```json
{
  "orders": [
    {
      "id": 1,
      "status": "pending",
      "total": 50.00,
      "payment_method": "card",
      "delivery_option": "delivery",
      "created_at": "2026-07-07T12:00:00.000Z"
    }
  ]
}
```

**curl:**
```bash
curl -X GET http://localhost:3000/api/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

#### `GET /api/orders/:id` ✅

Obtener detalle de una orden con sus items.

**Auth:** Bearer token

**curl:**
```bash
curl -X GET http://localhost:3000/api/orders/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

#### `POST /api/create-payment-intent` ❌ Pendiente

Crear intención de pago en Stripe.

---

#### `POST /api/confirm-payment` ❌ Pendiente

Confirmar pago y asociar a orden.

---

#### `POST /api/stripe-webhook` ❌ Pendiente

Webhook de Stripe para actualizar estados.

---

### H. Favoritos / Wishlist ✅

---

#### `GET /api/favorites` ✅

Listar favoritos del usuario con detalles de producto.

**Auth:** Bearer token

**Response 200:**
```json
{
  "favorites": [
    {
      "id": 1,
      "product_id": 1,
      "created_at": "2026-07-07T12:00:00.000Z",
      "product": {
        "id": 1,
        "name": "Limpiador Facial CeraVe",
        "brand": "CeraVe",
        "price": 25.00,
        "image_url": "https://...",
        "category": "cleanser",
        "rating": 4.5
      }
    }
  ]
}
```

**curl:**
```bash
curl -X GET http://localhost:3000/api/favorites \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

#### `POST /api/favorites` ✅

Agregar producto a favoritos.

**Auth:** Bearer token

**Request:**
```json
{ "product_id": 1 }
```

**Response 201:**
```json
{
  "success": true,
  "favorite": {
    "id": 1,
    "user_id": 1,
    "product_id": 1,
    "created_at": "2026-07-07T12:00:00.000Z"
  }
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/favorites \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"product_id":1}'
```

---

#### `DELETE /api/favorites/:productId` ✅

Quitar producto de favoritos.

**Auth:** Bearer token

**Response 200:**
```json
{
  "success": true
}
```

**curl:**
```bash
curl -X DELETE http://localhost:3000/api/favorites/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### I. Skin Diary (Diario de Piel) ✅

---

#### `POST /api/diary` ✅

Crear o actualizar entrada del diario para una fecha específica. Si ya existe entrada para esa fecha, la actualiza.

**Auth:** Bearer token

**Request:**
```json
{
  "entry_date": "2026-07-07",
  "mood": "good",
  "notes": "Hoy mi piel se sintió muy bien, el nuevo serum está funcionando.",
  "photos": []
}
```

**Response 201 (nueva):**
```json
{
  "success": true,
  "entry": {
    "id": 1,
    "mood": "good",
    "notes": "Hoy mi piel se sintió muy bien...",
    "entry_date": "2026-07-07",
    "created_at": "2026-07-07T12:00:00.000Z"
  }
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/diary \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"entry_date":"2026-07-07","mood":"good","notes":"Mi piel está bien"}'
```

---

#### `GET /api/diary` ✅

Obtener historial completo del diario.

**Auth:** Bearer token

**Response 200:**
```json
{
  "entries": [
    {
      "id": 1,
      "mood": "good",
      "notes": "...",
      "photos": [],
      "entry_date": "2026-07-07",
      "created_at": "2026-07-07T12:00:00.000Z"
    }
  ]
}
```

**curl:**
```bash
curl -X GET http://localhost:3000/api/diary \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

#### `GET /api/diary/:date` ✅

Obtener entrada de una fecha específica.

**Auth:** Bearer token

**curl:**
```bash
curl -X GET http://localhost:3000/api/diary/2026-07-07 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

#### `DELETE /api/diary/:date` ✅

Eliminar entrada de una fecha.

**Auth:** Bearer token

**curl:**
```bash
curl -X DELETE http://localhost:3000/api/diary/2026-07-07 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

#### `GET /api/diary-entries/stats` ❌ Pendiente

Estadísticas del diario (racha, % estados, etc.).

---

### J. Dermatólogos ✅

---

#### `GET /api/dermatologists` ✅

Listar dermatólogos disponibles (público).

**Auth:** No requerida

**Response 200:**
```json
{
  "dermatologists": [
    {
      "id": 1,
      "name": "Dra. María Pérez",
      "specialty": "Dermatóloga Clínica",
      "clinic": "Clínica San Pablo",
      "distance_km": 2.5,
      "rating": 4.8,
      "phone": "999111222",
      "email": "maria.perez@clinica.pe",
      "photo_url": null,
      "available_slots": null
    }
  ]
}
```

**curl:**
```bash
curl -X GET http://localhost:3000/api/dermatologists
```

---

#### `GET /api/dermatologists/:id` ✅

Obtener detalle de un dermatólogo.

**Auth:** No requerida

**curl:**
```bash
curl -X GET http://localhost:3000/api/dermatologists/1
```

---

### K. Consultas ✅

---

#### `POST /api/consultas` ✅

Enviar una consulta a un dermatólogo.

**Auth:** Bearer token

**Request:**
```json
{
  "subject": "Irritación después de usar retinol",
  "message": "Llevo una semana usando retinol y mi piel está muy irritada."
}
```

**Response 201:**
```json
{
  "success": true,
  "consulta": {
    "id": 1,
    "subject": "Irritación después de usar retinol",
    "message": "Llevo una semana usando retinol...",
    "status": "pending",
    "created_at": "2026-07-07T12:00:00.000Z"
  }
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/consultas \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"subject":"Irritación con retinol","message":"Mi piel está muy irritada..."}'
```

---

#### `GET /api/consultas` ✅

Listar consultas del usuario.

**Auth:** Bearer token

**Response 200:**
```json
{
  "consultas": [
    {
      "id": 1,
      "subject": "Irritación con retinol",
      "message": "...",
      "status": "answered",
      "answer": "Recomiendo suspender por 3 días...",
      "created_at": "2026-07-07T12:00:00.000Z"
    }
  ]
}
```

**curl:**
```bash
curl -X GET http://localhost:3000/api/consultas \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

#### `GET /api/consultas/:id` ✅

Obtener detalle de una consulta específica.

**Auth:** Bearer token (solo consultas propias)

**curl:**
```bash
curl -X GET http://localhost:3000/api/consultas/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### L. Reseñas de Productos ✅

> **Ruta real:** `/api/products/:productId/reviews` (anidado bajo products)

---

#### `POST /api/products/:productId/reviews` ✅

Crear una reseña de producto.

**Auth:** Bearer token

**Request:**
```json
{
  "stars": 5,
  "comment": "Excelente producto, noté resultados desde la primera semana."
}
```

**Response 201:**
```json
{
  "success": true,
  "review": {
    "id": 1,
    "author": "María García",
    "stars": 5,
    "comment": "Excelente producto...",
    "is_verified_purchase": false,
    "created_at": "2026-07-07T12:00:00.000Z"
  }
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/products/1/reviews \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"stars":5,"comment":"Excelente producto"}'
```

---

#### `GET /api/products/:productId/reviews` ✅

Listar reseñas de un producto (público).

**Auth:** No requerida

**Response 200:**
```json
{
  "reviews": [
    {
      "id": 1,
      "author": "María García",
      "stars": 5,
      "comment": "Excelente producto",
      "is_verified_purchase": false,
      "created_at": "2026-07-07T12:00:00.000Z"
    }
  ]
}
```

**curl:**
```bash
curl -X GET http://localhost:3000/api/products/1/reviews
```

---

#### `PUT /api/products/:productId/reviews` ✅

Actualizar la reseña del usuario para un producto.

**Auth:** Bearer token

**curl:**
```bash
curl -X PUT http://localhost:3000/api/products/1/reviews \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"stars":4,"comment":"Actualizando mi reseña"}'
```

---

#### `DELETE /api/products/:productId/reviews` ✅

Eliminar la reseña del usuario para un producto.

**Auth:** Bearer token

**curl:**
```bash
curl -X DELETE http://localhost:3000/api/products/1/reviews \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

#### `POST /api/product-reviews/:id/report` ❌ Pendiente

Reportar una reseña como inapropiada.

---

### M. Rutinas de la Comunidad ✅

---

#### `GET /api/community-routines` ✅

Listar rutinas compartidas por la comunidad.

**Auth:** No requerida

**Response 200:**
```json
{
  "routines": [
    {
      "id": 1,
      "skin_type": "Grasa",
      "allergies": [],
      "products": [],
      "likes_count": 15,
      "avatar_emoji": "🌸",
      "created_at": "2026-07-01T12:00:00.000Z"
    }
  ]
}
```

**curl:**
```bash
curl -X GET http://localhost:3000/api/community-routines
```

---

#### `POST /api/community-routines` ✅

Compartir una rutina en la comunidad.

**Auth:** Bearer token

**Request:**
```json
{
  "skin_type": "Grasa",
  "allergies": ["fragrance-free"],
  "products": [{"id": 1, "name": "Limpiador CeraVe"}],
  "avatar_emoji": "🌸"
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/community-routines \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"skin_type":"Grasa","products":[],"avatar_emoji":"🌸"}'
```

---

#### `DELETE /api/community-routines/:id` ✅

Eliminar rutina propia de la comunidad.

**Auth:** Bearer token

**curl:**
```bash
curl -X DELETE http://localhost:3000/api/community-routines/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

#### `POST /api/community-routines/:id/like` ❌ Pendiente

Dar "me gusta" a una rutina.

---

### N. Contacto ✅ (parcial)

---

#### `POST /api/contact` ✅

Enviar mensaje de contacto. Se almacena en BD pero **no envía email real**.

**Auth:** No requerida

**Request:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "message": "Tengo una sugerencia..."
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Gracias Juan, te responderemos pronto."
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan","email":"juan@ejemplo.com","message":"Hola"}'
```

---

### O. Pagos ✅ (mock)

---

#### `POST /api/payment` ✅

> ⚠️ **Mock:** No integra Stripe. Genera un ID de pago ficticio y guarda en tabla `payments`.

**Auth:** Bearer token

**Request:**
```json
{
  "cardNumber": "4111111111111111",
  "cardExpiry": "12/28",
  "cardCvc": "123",
  "cardName": "María García",
  "plan": "Premium"
}
```

**Response 200:**
```json
{
  "success": true,
  "paymentId": "PAY-1749254400000",
  "plan": "Premium",
  "message": "Pago procesado correctamente",
  "lastFour": "1111"
}
```

---

### P. Suscripciones ❌ Pendiente

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/subscription-plans` | Listar planes disponibles |
| `POST` | `/api/create-checkout-session` | Stripe Checkout Session |
| `POST` | `/api/cancel-subscription` | Cancelar suscripción |
| `GET` | `/api/subscription-status` | Estado de suscripción |
| `POST` | `/api/stripe-subscription-webhook` | Webhook Stripe |

---

### Q. Admin ❌ Pendiente

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/admin/dashboard` | Dashboard métricas |
| `POST/PUT/DELETE` | `/api/admin/products` | CRUD productos |
| `GET/PUT` | `/api/admin/consultas` | Gestionar consultas |
| `GET/PUT` | `/api/admin/orders` | Gestionar órdenes |
| `GET` | `/api/admin/users` | Listar usuarios |
| `PUT` | `/api/admin/reviews/:id` | Moderar reseñas |

---

### R. Endpoints Auxiliares

---

#### `GET /api/hello` ✅

Health check simple.

**Auth:** No requerida

**Response 200:**
```json
{
  "message": "DermaMatch API funcionando",
  "version": "1.0.0"
}
```

---

#### `GET /health` ✅

Health check del servidor Express.

**Auth:** No requerida

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-07T12:00:00.000Z"
}
```

---

## 3. Resumen de Implementación

| Área | Endpoints | Estado |
|---|---|---|
| Autenticación | 4 | ✅ 3 implementados / ❌ 1 pendiente |
| Perfiles | 2 | ✅ 2 implementados |
| Diagnóstico | 2 | ✅ 2 implementados |
| Productos | 2 | ✅ 2 implementados |
| Rutinas | 5 | ✅ 3 implementados / ❌ 2 pendientes |
| Carrito | 4 | ✅ 4 implementados |
| Órdenes | 3 | ✅ 3 implementados |
| Pagos | 4 | ✅ 1 mock / ❌ 3 pendientes |
| Favoritos | 3 | ✅ 3 implementados |
| Skin Diary | 5 | ✅ 4 implementados / ❌ 1 pendiente |
| Dermatólogos | 2 | ✅ 2 implementados |
| Consultas | 3 | ✅ 3 implementados |
| Reseñas | 5 | ✅ 4 implementados / ❌ 1 pendiente |
| Comunidad | 4 | ✅ 3 implementados / ❌ 1 pendiente |
| Contacto | 1 | ✅ 1 (sin email real) |
| Suscripciones | 5 | ❌ 0 implementados |
| Admin | 6+ | ❌ 0 implementados |
| **Total** | **~60** | **✅ 38 / ❌ 22** |

---

## 4. Diferencias con la Documentación Original

| Lo que decía la doc anterior | Lo que realmente hay |
|---|---|
| Base de datos: Supabase | PostgreSQL directo con `pg` |
| Auth: Netlify Identity | JWT custom con bcryptjs |
| `POST /api/skin-profiles` | `POST /api/diagnosis` |
| `GET /api/skin-profiles/:id` | No existe (solo el activo) |
| `PUT /api/routines/:id/swap` | No implementado |
| `GET /api/routines/:id/alternatives` | No implementado |
| `POST /api/create-payment-intent` | No implementado |
| Stripe integrado | Solo mock de pagos |
| `POST /api/product-reviews` | `POST /api/products/:id/reviews` |
| Suscripciones con Stripe | No implementado |
| Panel admin | No implementado |

---

## 5. Modelos de Datos

### User
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string; // hash bcrypt
  avatar_url?: string;
  phone?: string;
  subscription_plan: 'basic' | 'pro' | 'premium';
  subscription_status: 'active' | 'cancelled' | 'past_due';
  routine_config: RoutineConfig;
  created_at: string;
  updated_at: string;
}
```

### SkinProfile
```typescript
interface SkinProfile {
  id: number;
  user_id: number;
  type_name: string;
  type_id: string;
  concerns: string[];
  allergies: string[];
  description?: string;
  answers: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Product
```typescript
interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  category: string;
  types: string[];
  allergies: string[];
  eco: boolean;
  cruelty: boolean;
  rating: number;
  image_url?: string;
  ingredients?: string;
  description?: string;
  how_helps?: string;
  store_links: { store: string; url: string }[];
  dues: { id: number; name: string; price: number }[];
  stock?: number;
  is_active: boolean;
}
```

### Routine
```typescript
interface Routine {
  id: number;
  config: {
    skin_type: string;
    budget: string;
    concerns: string[];
  };
  morning: RoutineStep[];
  night: RoutineStep[];
  summary: {
    skin_type: string;
    config_used: object;
    total_steps: number;
    total_cost: number;
  };
  generated_at: string;
}

interface RoutineStep {
  id: number;
  name: string;
  brand: string;
  price: number;
  category: string;
  image_url?: string;
  step: string;
  eco?: boolean;
  cruelty?: boolean;
}
```

### RoutineConfig
```typescript
interface RoutineConfig {
  budget: 'low' | 'medium' | 'premium' | 'unlimited';
  optimization: 'lowest_price' | 'best_quality' | 'balanced';
  brands: string[];
  additionalAllergies: string[];
}
```

### CartItem
```typescript
interface CartItem {
  id: number;
  product_id: number;
  qty: number;
  price_at_add: number;
  product: {
    id: number;
    name: string;
    brand: string;
    price: number;
    image_url?: string;
    category: string;
    stock: number;
  };
}
```

### Order
```typescript
interface Order {
  id: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  payment_method?: string;
  payment_intent_id?: string;
  delivery_option: 'delivery' | 'pickup';
  delivery_address?: object;
  delivery_phone?: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
}

interface OrderItem {
  product_id: number;
  product_name: string;
  product_price: number;
  qty: number;
  subtotal: number;
}
```

### DiaryEntry
```typescript
interface DiaryEntry {
  id: number;
  mood: string;
  notes?: string;
  photos: string[];
  entry_date: string; // YYYY-MM-DD
  created_at: string;
}
```

### Consulta
```typescript
interface Consulta {
  id: number;
  subject: string;
  message: string;
  status: 'pending' | 'answered' | 'closed';
  answer?: string;
  answered_by?: number;
  answered_at?: string;
  created_at: string;
}
```

### Dermatologist
```typescript
interface Dermatologist {
  id: number;
  name: string;
  specialty: string;
  clinic: string;
  distance_km?: number;
  rating?: number;
  phone?: string;
  email?: string;
  photo_url?: string;
  available_slots?: string[];
  is_active: boolean;
}
```

### ProductReview
```typescript
interface ProductReview {
  id: number;
  product_id: number;
  user_id: number;
  author: string;
  stars: number; // 1-5
  comment?: string;
  is_verified_purchase: boolean;
  is_reported: boolean;
  created_at: string;
}
```

### CommunityRoutine
```typescript
interface CommunityRoutine {
  id: number;
  skin_type: string;
  allergies: string[];
  products: object[];
  likes_count: number;
  avatar_emoji?: string;
  created_at: string;
}
```

---

## 6. Flujos de Integración Frontend

### 6.1 Flujo de Diagnóstico + Rutina

```
Frontend                         Backend
   │                               │
   │ POST /api/diagnosis           │
   │ { type_name, type_id,         │
   │   concerns, allergies,        │
   │   answers }                   │
   │ ─────────────────────────────>│
   │                               │  Validar campos
   │                               │  UPSERT en skin_profiles
   │ { profile }                   │
   │ <─────────────────────────────│
   │                               │
   │ PUT /api/profiles/:id         │
   │ { routine_config }            │
   │ ─────────────────────────────>│
   │ { user }                      │
   │ <─────────────────────────────│
   │                               │
   │ POST /api/routines/generate   │
   │ ─────────────────────────────>│
   │                               │  Leer perfil activo + config
   │                               │  Filtrar productos por tipo/presupuesto
   │                               │  Asignar por orden de categorías
   │ { routine }                   │
   │ <─────────────────────────────│
```

### 6.2 Flujo de Compra (sin Stripe)

```
Frontend                         Backend
   │                               │
   │ POST /api/cart                │
   │ { product_id, qty }           │
   │ ─────────────────────────────>│
   │ <─────────────────────────────│
   │                               │
   │ GET /api/cart                 │
   │ ─────────────────────────────>│
   │ { items }                     │
   │ <─────────────────────────────│
   │                               │
   │ POST /api/orders              │
   │ { payment_method,             │
   │   delivery_option }           │
   │ ─────────────────────────────>│
   │                               │  Tomar items del carrito
   │                               │  Calcular total
   │                               │  Crear orden + order_items
   │                               │  Vaciar carrito
   │ { order }                     │
   │ <─────────────────────────────│
```

---

## 7. Casos de Prueba TDD por Endpoint

### A. Autenticación

| Caso de prueba | Endpoint | Input esperado | Output esperado |
|---|---|---|---|
| Registro exitoso | `POST /register` | `{name, email, password}` válidos | `201` + token |
| Email duplicado | `POST /register` | Email existente | `409` "El email ya está registrado" |
| Campo faltante | `POST /register` | Sin `name` | `400` "name requerido" |
| Login correcto | `POST /login` | Credenciales válidas | `200` + token |
| Password incorrecto | `POST /login` | Password inválido | `401` "Credenciales inválidas" |
| Perfil autenticado | `GET /me` | Token válido | `200` + user data |
| Sin token | `GET /me` | Sin header Auth | `401` "Token requerido" |
| Logout exitoso | `POST /logout` | Token válido | `200` "Sesión cerrada" |
| Recuperar password | `POST /recover` | Email válido | `200` (siempre 200 por seguridad) |

**Test file:** `tests/auth.test.js` (120+ líneas)

---

### B. Perfiles

| Caso de prueba | Endpoint | Input esperado | Output esperado |
|---|---|---|---|
| Obtener perfil propio | `GET /profiles/:id` | Token + id propio | `200` + user |
| Actualizar nombre | `PUT /profiles/:id` | `{name: "Nuevo"}` | `200` + user actualizado |
| Actualizar routine_config | `PUT /profiles/:id` | `{routine_config: {...}}` | `200` + config guardada |
| Acceder perfil ajeno | `GET /profiles/:id` | Token de otro usuario | `403` "No tienes permiso" |
| ID inválido | `GET /profiles/999` | ID no existente | `404` "Usuario no encontrado" |

**Test file:** `tests/profiles.test.js`

---

### C. Diagnóstico

| Caso de prueba | Endpoint | Input esperado | Output esperado |
|---|---|---|---|
| Crear perfil | `POST /diagnosis` | `{type_id, concerns, answers}` | `201` + profile |
| Actualizar existente | `POST /diagnosis` | Perfil ya activo | `200` (UPSERT) |
| Obtener activo | `GET /diagnosis` | Token válido | `200` + profile |
| Sin perfil | `GET /diagnosis` | Usuario sin diagnóstico | `404` "No hay perfil" |
| Validación type_id | `POST /diagnosis` | Sin `type_id` | `400` "type_id requerido" |

**Test file:** `tests/diagnosis.test.js`

---

### D. Productos

| Caso de prueba | Endpoint | Input esperado | Output esperado |
|---|---|---|---|
| Listado básico | `GET /products` | - | `200` + array |
| Búsqueda | `GET /products?search=x` | Query string | `200` + resultados |
| Filtro tipo piel | `GET /products?type=oily` | Query param | `200` + filtrados |
| Filtro categoría | `GET /products?category=spf` | Query param | `200` + filtrados |
| Filtro presupuesto | `GET /products?budget=medium` | Query param | `200` + filtrados |
| Paginación | `GET /products?page=1&limit=10` | Query params | `200` + metadata |
| Ordenamiento | `GET /products?sortBy=price` | Query param | `200` + ordenados |
| Detalle producto | `GET /products/:id` | ID válido | `200` + product completo |
| Producto inexistente | `GET /products/999` | ID inválido | `404` "Producto no encontrado" |

**Test file:** `tests/products.test.js`

---

### E. Rutinas

| Caso de prueba | Endpoint | Input esperado | Output esperado |
|---|---|---|---|
| Generar rutina | `POST /routines/generate` | Token con perfil | `201` + routine |
| Sin diagnóstico | `POST /routines/generate` | Usuario sin perfil | `400` "Completa diagnóstico" |
| Listar rutinas | `GET /routines` | Token válido | `200` + array |
| Detalle rutina | `GET /routines/:id` | ID válido | `200` + routine completa |
| Acceso denegado | `GET /routines/:id` | Rutina de otro usuario | `403` "No tienes acceso" |
| Swap producto | `PUT /routines/:id/swap` | `{turn, stepIndex, newProductId}` | ❌ No implementado |
| Alternativas | `GET /routines/:id/alternatives` | Query params | ❌ No implementado |

**Test file:** `tests/routines.test.js`

**⚠️ Nota:** Scoring avanzado no implementado. Actualmente selecciona primer match por categoría.

---

### F. Carrito

| Caso de prueba | Endpoint | Input esperado | Output esperado |
|---|---|---|---|
| Agregar item | `POST /cart` | `{product_id, qty}` | `201` + item |
| Incrementar cantidad | `POST /cart` | Producto ya en carrito | `201` + qty incrementada |
| Listar carrito | `GET /cart` | Token válido | `200` + items con JOIN |
| Actualizar cantidad | `PUT /cart/:productId` | `{qty: 3}` | `200` + item actualizado |
| Eliminar item | `DELETE /cart/:productId` | Token válido | `200` |
| Validación stock | `POST /cart` | Producto sin stock | ⚠️ No validado |
| Product ID inválido | `POST /cart` | `{product_id: 999}` | `404` "Producto no encontrado" |

**Test file:** `tests/cart.test.js`

---

### G. Órdenes

| Caso de prueba | Endpoint | Input esperado | Output esperado |
|---|---|---|---|
| Crear orden | `POST /orders` | `{payment_method, delivery}` | `201` + order + items |
| Carrito a orden | `POST /orders` | Items en carrito | Orden creada + carrito vacío |
| Listar órdenes | `GET /orders` | Token válido | `200` + array |
| Detalle orden | `GET /orders/:id` | ID válido propio | `200` + order completa |
| Acceso orden ajena | `GET /orders/:id` | Orden de otro usuario | `403` |
| Orden vacía | `POST /orders` | Carrito vacío | `400` "Carrito vacío" |
| Validación payment | `POST /orders` | `payment_method` inválido | ⚠️ No validado |

**Test file:** `tests/orders.test.js`

---

### H. Favoritos

| Caso de prueba | Endpoint | Input esperado | Output esperado |
|---|---|---|---|
| Agregar favorito | `POST /favorites` | `{product_id}` | `201` + favorite |
| Evitar duplicados | `POST /favorites` | Producto ya favorito | `409` ⚠️ No implementado |
| Listar favoritos | `GET /favorites` | Token válido | `200` + con datos producto |
| Eliminar favorito | `DELETE /favorites/:id` | Token válido | `200` |
| Sin autenticación | `GET /favorites` | Sin token | `401` |

**Test file:** `tests/favorites.test.js`

---

### I. Diario

| Caso de prueba | Endpoint | Input esperado | Output esperado |
|---|---|---|---|
| Crear entrada | `POST /diary` | `{entry_date, mood, notes}` | `201` + entry |
| UPSERT por fecha | `POST /diary` | Fecha ya existe | `200` (actualiza) |
| Listar historial | `GET /diary` | Token válido | `200` + array |
| Entrada por fecha | `GET /diary/:date` | Fecha válida | `200` + entry |
| Eliminar entrada | `DELETE /diary/:date` | Token válido | `200` |
| Formato fecha | `GET /diary/invalid` | Fecha no YYYY-MM-DD | `400` ⚠️ No validado |

**Test file:** `tests/diary.test.js`

---

### J. Dermatólogos

| Caso de prueba | Endpoint | Input esperado | Output esperado |
|---|---|---|---|
| Listar todos | `GET /dermatologists` | - | `200` + array |
| Solo activos | `GET /dermatologists` | - | `200` + is_active=true |
| Detalle | `GET /dermatologists/:id` | ID válido | `200` + dermatólogo |
| No encontrado | `GET /dermatologists/999` | ID inválido | `404` |
| Público sin auth | `GET /dermatologists` | Sin token | `200` (público) |

**Test file:** `tests/dermatologists.test.js`

---

### K. Consultas

| Caso de prueba | Endpoint | Input esperado | Output esperado |
|---|---|---|---|
| Enviar consulta | `POST /consultas` | `{subject, message}` | `201` + consulta |
| Listar propias | `GET /consultas` | Token válido | `200` + array |
| Ver consulta | `GET /consultas/:id` | ID propio | `200` + completa |
| Consulta ajena | `GET /consultas/:id` | ID de otro usuario | `403` |
| Sin autenticación | `POST /consultas` | Sin token | `401` |
| Respondida | `GET /consultas/:id` | Con respuesta | `200` + answer field |

**Test file:** `tests/consultas.test.js`

---

### L. Reseñas

| Caso de prueba | Endpoint | Input esperado | Output esperado |
|---|---|---|---|
| Crear reseña | `POST /products/:id/reviews` | `{stars, comment}` | `201` + review |
| Una por usuario | `POST /products/:id/reviews` | Segunda reseña | `409` "Ya existe reseña" |
| Listar reseñas | `GET /products/:id/reviews` | - | `200` + array |
| Actualizar reseña | `PUT /products/:id/reviews` | `{stars, comment}` | `200` + actualizada |
| Eliminar reseña | `DELETE /products/:id/reviews` | Token propio | `200` |
| Validación stars | `POST /products/:id/reviews` | `stars: 6` | `400` "stars debe ser 1-5" |
| Verificado | `POST /products/:id/reviews` | Con compra previa | ⚠️ No implementado |
| Reportar reseña | `POST /product-reviews/:id/report` | - | ❌ No implementado |

**Test file:** `tests/reviews.test.js`

---

### M. Comunidad

| Caso de prueba | Endpoint | Input esperado | Output esperado |
|---|---|---|---|
| Compartir rutina | `POST /community-routines` | `{skin_type, products}` | `201` + routine |
| Listar rutinas | `GET /community-routines` | - | `200` + array |
| Ver rutina | `GET /community-routines/:id` | ID válido | `200` + completa |
| Eliminar propia | `DELETE /community-routines/:id` | Token propio | `200` |
| Eliminar ajena | `DELETE /community-routines/:id` | Token de otro | `403` |
| Dar like | `POST /community-routines/:id/like` | - | ❌ No implementado |

**Test file:** `tests/community.test.js`

---

### N. Contacto

| Caso de prueba | Endpoint | Input esperado | Output esperado |
|---|---|---|---|
| Enviar mensaje | `POST /contact` | `{name, email, message}` | `200` + confirmación |
| Validación campos | `POST /contact` | Sin `email` | `400` "email requerido" |
| Email formato inválido | `POST /contact` | `email: "invalido"` | ⚠️ No validado |
| Guarda en BD | `POST /contact` | Datos válidos | ✅ Guarda en `contacts` |
| Envío real | `POST /contact` | Datos válidos | ❌ Solo mock |

**Test file:** `tests/contact.test.js`

---

### O. Pagos

| Caso de prueba | Endpoint | Input esperado | Output esperado |
|---|---|---|---|
| Pago mock | `POST /payment` | `{cardNumber, ...}` | `200` + paymentId |
| Guarda en BD | `POST /payment` | Datos válidos | ✅ Guarda en `payments` |
| Stripe real | `POST /create-payment-intent` | - | ❌ No implementado |
| Webhook Stripe | `POST /stripe-webhook` | - | ❌ No implementado |
| Confirmar pago | `POST /confirm-payment` | - | ❌ No implementado |

**Test file:** `tests/payment.test.js`

**⚠️ Nota:** Solo implementación mock. Stripe real pendiente.

---

### Resumen de Cobertura

| Endpoint | Tests | Casos cubiertos | Edge cases | Estado |
|---|---|---|---|---|
| Auth | 5 | ✅ Todos | ⚠️ Email format | ✅ |
| Profiles | 5 | ✅ Todos | ⚠️ Phone format | ✅ |
| Diagnosis | 4 | ✅ Básicos | ❌ 90 días rule | ⚠️ |
| Products | 8 | ✅ Filtros | ⚠️ Stock = 0 | ✅ |
| Routines | 5 | ⚠️ Básico | ❌ Scoring real | ⚠️ |
| Cart | 4 | ✅ CRUD | ⚠️ Stock valid | ✅ |
| Orders | 5 | ✅ CRUD | ⚠️ Payment valid | ✅ |
| Favorites | 4 | ✅ CRUD | ⚠️ Duplicate 409 | ✅ |
| Diary | 5 | ✅ CRUD | ⚠️ Date format | ✅ |
| Reviews | 5 | ✅ CRUD | ❌ Verified | ⚠️ |
| Community | 4 | ✅ CRUD | ❌ Likes | ⚠️ |
| Contact | 2 | ✅ Básico | ❌ Email real | ⚠️ |
| Payment | 1 | ⚠️ Mock | ❌ Stripe real | ❌ |

**Total tests:** ~120 casos distribuidos en 17 archivos

---

## 8. Base de Datos

### Esquema (tablas existentes en `db/init.sql`)

| Tabla | Descripción | Implementada |
|---|---|---|
| `users` | Usuarios registrados | ✅ |
| `skin_profiles` | Perfiles de diagnóstico de piel | ✅ |
| `products` | Catálogo de productos | ✅ |
| `routines` | Rutinas generadas | ✅ |
| `cart_items` | Items en carrito por usuario | ✅ |
| `orders` | Órdenes de compra | ✅ |
| `order_items` | Items de cada orden | ✅ |
| `favorites` | Productos favoritos por usuario | ✅ |
| `diary_entries` | Entradas del diario de piel | ✅ |
| `dermatologists` | Dermatólogos disponibles | ✅ |
| `consultas` | Consultas de usuarios a dermatólogos | ✅ |
| `product_reviews` | Reseñas de productos | ✅ |
| `community_routines` | Rutinas compartidas en comunidad | ✅ |
| `contacts` | Mensajes de contacto | ✅ |
| `payments` | Pagos procesados (mock) | ✅ |
| `appointments` | Citas agendadas | ❌ Pendiente |
| `subscription_plans` | Planes de suscripción | ❌ Pendiente |

---

## 8. Errores Comunes de Integración

| Error | Causa | Solución |
|---|---|---|
| `401 Token no proporcionado` | Falta header Authorization | Agregar `Authorization: Bearer <token>` |
| `403 No tienes permiso` | Token de otro usuario | Verificar que el ID del perfil coincida con el token |
| `409 El email ya está registrado` | Email duplicado | Usar otro email o hacer login |
| `400 type_id es requerido` | Falta campo en diagnosis | Enviar `type_id` en el body |
| Sin productos en rutina | No hay productos compatibles | Verificar que existan productos para ese `type_id` y presupuesto |

---

*Documento generado para integración frontend ↔ backend. Versión 2.0 — actualizado con estado real de implementación.*
