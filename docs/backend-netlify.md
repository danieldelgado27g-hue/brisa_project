# Documentación Técnica Backend — DermaMatch

> **Actualizado:** 07/07/2026 — Refleja la arquitectura real implementada.

---

## Arquitectura Real

```
Cliente (HTML/JS/CSS) → Netlify (Hosting)
                          ↑
                    API Express (Node.js)
                          ↑
                    PostgreSQL (Docker / Supabase)
```

### Stack Actual

| Componente | Tecnología | Estado |
|---|---|---|
| API Server | Node.js + Express 4 | ✅ Implementado |
| Base de Datos | PostgreSQL 16+ | ✅ Implementado |
| ORM | `pg` (directo, sin ORM) | ✅ Implementado |
| Autenticación | JWT + bcryptjs | ✅ Implementado |
| Hosting API | Netlify Functions / Docker | ✅ Configurado |
| Netlify Identity | No usado | ❌ Se usa JWT custom |
| Supabase | No usado | ❌ PostgreSQL directo |
| Stripe | No integrado | ❌ Solo mock |

---

## Estructura de Archivos

```
brisa_project_backend/
├── netlify.toml                  # Redirección /api/* → funciones
├── server.js                     # Express server (proxy a funciones)
├── db.js                         # Conexión PostgreSQL (Pool)
├── Dockerfile                    # Container para producción
├── docker-compose.yml            # App + PostgreSQL local
├── package.json                  # Dependencias
├── jest.config.js                # Config tests
│
├── netlify/functions/
│   ├── hello.js                  # Health check
│   ├── auth.js                   # register, login, me
│   ├── profiles.js               # CRUD perfil usuario
│   ├── diagnosis.js              # Skin profile CRUD
│   ├── products.js               # Catálogo + filtros
│   ├── routines.js               # Generar + listar rutinas
│   ├── cart.js                   # CRUD carrito
│   ├── orders.js                 # Crear orden desde carrito
│   ├── favorites.js              # CRUD favoritos
│   ├── diary.js                  # CRUD skin diary
│   ├── dermatologists.js         # Lista dermatólogos
│   ├── consultas.js              # CRUD consultas
│   ├── reviews.js                # CRUD reseñas
│   ├── community.js              # CRUD rutinas comunidad
│   ├── contact.js                # Formulario contacto
│   ├── payment.js                # Mock pago
│   └── user.js                   # (Legacy) Sin uso activo
│
├── db/
│   ├── init.sql                  # Schema completo (15 tablas)
│   └── seed.sql                  # Datos iniciales (12 productos)
│
├── utils/
│   └── jwt.js                    # Verificación de tokens
│
├── tests/                        # Tests Jest
│
└── .env.example                  # Variables de entorno
```

---

## Rutas en server.js

| Método | Ruta | Handler | Estado |
|---|---|---|---|
| POST | `/api/auth/register` | `auth.js` | ✅ |
| POST | `/api/auth/login` | `auth.js` | ✅ |
| GET | `/api/auth/me` | `auth.js` | ✅ |
| GET | `/api/profiles/:id` | `profiles.js` | ✅ |
| PUT | `/api/profiles/:id` | `profiles.js` | ✅ |
| GET | `/api/products` | `products.js` | ✅ |
| GET | `/api/products/:id` | `products.js` | ✅ |
| POST | `/api/diagnosis` | `diagnosis.js` | ✅ |
| GET | `/api/diagnosis` | `diagnosis.js` | ✅ |
| POST | `/api/routines/generate` | `routines.js` | ✅ |
| GET | `/api/routines` | `routines.js` | ✅ |
| GET | `/api/routines/:id` | `routines.js` | ✅ |
| POST | `/api/cart` | `cart.js` | ✅ |
| GET | `/api/cart` | `cart.js` | ✅ |
| PUT | `/api/cart/:productId` | `cart.js` | ✅ |
| DELETE | `/api/cart/:productId` | `cart.js` | ✅ |
| POST | `/api/orders` | `orders.js` | ✅ |
| GET | `/api/orders` | `orders.js` | ✅ |
| GET | `/api/orders/:id` | `orders.js` | ✅ |
| POST | `/api/favorites` | `favorites.js` | ✅ |
| GET | `/api/favorites` | `favorites.js` | ✅ |
| DELETE | `/api/favorites/:productId` | `favorites.js` | ✅ |
| POST | `/api/diary` | `diary.js` | ✅ |
| GET | `/api/diary` | `diary.js` | ✅ |
| GET | `/api/diary/:date` | `diary.js` | ✅ |
| DELETE | `/api/diary/:date` | `diary.js` | ✅ |
| GET | `/api/dermatologists` | `dermatologists.js` | ✅ |
| GET | `/api/dermatologists/:id` | `dermatologists.js` | ✅ |
| POST | `/api/consultas` | `consultas.js` | ✅ |
| GET | `/api/consultas` | `consultas.js` | ✅ |
| GET | `/api/consultas/:id` | `consultas.js` | ✅ |
| POST | `/api/products/:productId/reviews` | `reviews.js` | ✅ |
| GET | `/api/products/:productId/reviews` | `reviews.js` | ✅ |
| PUT | `/api/products/:productId/reviews` | `reviews.js` | ✅ |
| DELETE | `/api/products/:productId/reviews` | `reviews.js` | ✅ |
| POST | `/api/community-routines` | `community.js` | ✅ |
| GET | `/api/community-routines` | `community.js` | ✅ |
| GET | `/api/community-routines/:id` | `community.js` | ✅ |
| DELETE | `/api/community-routines/:id` | `community.js` | ✅ |
| POST | `/api/payment` | `payment.js` | ✅ (mock) |
| POST | `/api/contact` | `contact.js` | ✅ (sin email) |
| GET | `/api/hello` | `hello.js` | ✅ |
| GET | `/health` | Express directo | ✅ |

---

## netlify.toml

```toml
[build]
  functions = "netlify/functions"
  publish = "."

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

---

## Base de Datos (PostgreSQL)

### Conexión (`db.js`)

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
    || `postgresql://${USER}:${PASSWORD}@${HOST}:${PORT}/${DB}`
});
```

### Tablas Implementadas

| # | Tabla | Propósito |
|---|---|---|
| 1 | `users` | Usuarios registrados con password hash |
| 2 | `skin_profiles` | Diagnósticos de piel (activo/inactivo) |
| 3 | `products` | Catálogo de productos |
| 4 | `routines` | Rutinas generadas |
| 5 | `cart_items` | Items en carrito |
| 6 | `orders` | Órdenes de compra |
| 7 | `order_items` | Items de órdenes |
| 8 | `favorites` | Favoritos por usuario |
| 9 | `diary_entries` | Entradas del skin diary |
| 10 | `dermatologists` | Dermatólogos |
| 11 | `consultas` | Consultas de usuarios |
| 12 | `product_reviews` | Reseñas de productos |
| 13 | `community_routines` | Rutinas compartidas |
| 14 | `contacts` | Mensajes de contacto |
| 15 | `payments` | Registro de pagos (mock) |

### Tablas Pendientes

| Tabla | Propósito |
|---|---|
| `appointments` | Citas agendadas con dermatólogos |
| `subscription_plans` | Planes Pro/Premium |
| `user_subscriptions` | Suscripciones activas por usuario |

---

## Variables de Entorno (`.env`)

```env
# Base de datos
DATABASE_URL=postgresql://brisa:brisa123@localhost:5432/brisa_db
POSTGRES_USER=brisa
POSTGRES_PASSWORD=brisa123
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=brisa_db

# JWT
JWT_SECRET=dev-secret-dermamatch

# Stripe (pendiente)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Server
PORT=3000
NODE_ENV=development
```

---

## Docker

### `docker-compose.yml`

```yaml
services:
  app:
    build:
      context: .
      target: ${NODE_ENV:-development}     # development | production
    container_name: brisa_backend
    ports: ["${PORT:-3000}:3000"]
    environment:
      - NODE_ENV=${NODE_ENV:-development}
      - PORT=3000
      - DATABASE_URL=postgresql://${POSTGRES_USER:-brisa}:${POSTGRES_PASSWORD:-brisa123}@db:5432/${POSTGRES_DB:-brisa_db}
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - .:/app                              # Hot reload en dev
      - /app/node_modules
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    container_name: brisa_postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-brisa}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-brisa123}
      POSTGRES_DB: ${POSTGRES_DB:-brisa_db}
    ports: ["${POSTGRES_HOST_PORT:-5433}:5432"]
    volumes:
      - pg_data:/var/lib/postgresql/data     # Persistencia
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-brisa} -d ${POSTGRES_DB:-brisa_db}"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pg_data:
```

### Comandos

| Comando | Descripción |
|---|---|
| `npm start` | Iniciar servidor Express local |
| `npm run dev` | Iniciar con Netlify Dev |
| `npm run docker:dev` | Docker compose (desarrollo) |
| `npm test` | Ejecutar tests Jest |
| `netlify dev` | Netlify Dev (emula Netlify Functions) |

---

## Tests (Jest + Supertest)

17 archivos de test cubriendo todos los endpoints:

| Archivo | Endpoints cubiertos |
|---|---|
| `tests/auth.test.js` | register, login, me |
| `tests/profiles.test.js` | GET/PUT profiles |
| `tests/products.test.js` | GET products, GET products/:id, filtros |
| `tests/diagnosis.test.js` | POST/GET diagnosis |
| `tests/routines.test.js` | generate, list, detail |
| `tests/cart.test.js` | POST/GET/PUT/DELETE cart |
| `tests/orders.test.js` | POST/GET orders |
| `tests/favorites.test.js` | POST/GET/DELETE favorites |
| `tests/diary.test.js` | POST/GET/GET/DELETE diary |
| `tests/dermatologists.test.js` | GET dermatologists |
| `tests/consultas.test.js` | POST/GET consultas |
| `tests/reviews.test.js` | POST/GET/PUT/DELETE reviews |
| `tests/community.test.js` | POST/GET/DELETE community-routines |
| `tests/contact.test.js` | POST contact |
| `tests/payment.test.js` | POST payment (mock) |

### Setup de Tests

```javascript
// tests/setup.js — Pool global con base de datos de test
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// tests/helpers.js — Funciones helper
module.exports = {
  createTestUser,     // Registra usuario + devuelve token
  testProductId,      // ID de producto seed
  request,            // supertest(app)
};
```

### Ejecutar

| Comando | Descripción |
|---|---|
| `npm test` | Suite completa (forza exit tras tests) |
| `npm run test:watch` | Watch mode |

### Configuración

```javascript
// jest.config.js
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  setupFiles: ["./tests/setup-env.js"],
  maxWorkers: 1,     // Evita colisión en BD de test
  verbose: true,
  forceExit: true,
};
```

---

## Patrón de Código

Todas las funciones siguen el mismo patrón:

```
exports.handler = async (event) => {
  // 1. Parsear path/ruta
  // 2. Verificar token (si aplica)
  // 3. Switch por método HTTP
  // 4. Handler específico con db.query()
  // 5. Return json(statusCode, data)
}
```

### Middleware de Autenticación

```javascript
const { verifyToken } = require("../../utils/jwt");

const auth = verifyToken(event);
if (auth.error) return json(401, { error: auth.error });
const userId = auth.user.id;
```

### Función Helper `json()`

```javascript
function json(statusCode, data) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}
```

---

## Funcionalidades NO Implementadas (Pendientes)

### Stripe / Pagos Reales
- `POST /api/create-payment-intent`
- `POST /api/confirm-payment`
- `POST /api/stripe-webhook`

### Suscripciones (Pro / Premium)
- `GET /api/subscription-plans`
- `POST /api/create-checkout-session`
- `POST /api/cancel-subscription`
- `GET /api/subscription-status`

### Admin Panel
- Dashboard con métricas
- CRUD productos, usuarios, órdenes
- Moderación de reseñas
- Responder consultas

### Mejoras a Funcionalidades Existentes
- **Routine Engine**: Implementar scoring real (actualmente solo primer match por categoría)
- **Swapp**: Endpoint para cambiar producto en rutina
- **Alternativas**: Endpoint para sugerir productos alternativos
- **Stats Diary**: Endpoint de estadísticas (rachas, % estados)
- **Email real**: Integración con SendGrid/Resend para contacto
- **Logout**: Invalidación de tokens
- **Recuperar contraseña**: Flujo de reset por email
- **Likes**: Endpoint para dar like a rutinas comunitarias
