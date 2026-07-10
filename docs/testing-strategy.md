# Estrategia de Testing TDD — DermaMatch Backend

> **Última actualización:** 07/07/2026
> **Enfoque:** Test-Driven Development (TDD) + Testing Pyramid

---

## 1. Filosofía de Testing

DermaMatch Backend sigue un enfoque **TDD (Test-Driven Development)** donde:

1. **Primero escribimos el test** → Define el comportamiento esperado
2. **Luego escribimos el código** → Para que el test pase
3. **Finalmente refactorizamos** → Mejoramos el código manteniendo los tests verdes

```mermaid
graph LR
    A[Red: Escribir test que falla] --> B[Green: Escribir código mínimo]
    B --> C[Refactor: Mejorar código]
    C --> A
```

---

## 2. Testing Pyramid

Nuestra estrategia sigue la pirámide de testing:

```
        ▲
       / \  ← E2E Tests (futuro)
      /   \
     /─────\ ← Integration Tests (Jest + Supertest)
    /       \
   /─────────\ ← Unit Tests (Jest)
  /___________\
```

| Nivel | Herramienta | Proporción | Ejemplos |
|---|---|---|---|
| **E2E** | Playwright (futuro) | 5% | Flujos completos usuario |
| **Integración** | Jest + Supertest | 70% | Tests de endpoints API |
| **Unitarios** | Jest | 25% | Helpers, utilidades |

---

## 3. Stack de Testing

| Componente | Tecnología | Versión | Propósito |
|---|---|---|---|
| **Runner** | Jest | 30.4.2 | Ejecutar tests |
| **HTTP assertions** | Supertest | 7.2.2 | Probar endpoints API |
| **Coverage** | Jest (built-in) | — | Medir cobertura |
| **Base de datos** | PostgreSQL (test) | 16+ | BD aislada para tests |
| **Coderesh** | Built-in | — | Velocidad en desarrollo |

---

## 4. Tipos de Tests

### A. Unit Tests

Tests de funciones aisladas sin dependencias externas.

**Cuándo usar:**
- Lógica de negocio pura
- Helpers y utilidades
- Algoritmos (scoring de rutinas)
- Validaciones

**Ejemplo:**
```javascript
describe("calculateProductScore", () => {
  it("debe dar 100 puntos para producto perfecto", () => {
    const result = calculateProductScore({
      types: ["oily"],
      allergies: ["fragrance-free"],
      price: 20,
      rating: 5
    }, {
      skin_type: "oily",
      allergies: ["fragrance-free"],
      budget: "medium"
    });
    expect(result).toBe(100);
  });
});
```

### B. Integration Tests

Tests de endpoints API con base de datos real.

**Cuándo usar:**
- **Todos los endpoints CRUD**
- Autenticación/autorización
- Flujos multi-endpoint
- Validaciones de BD

**Estructura típica:**
```javascript
describe("POST /api/products/:id/reviews", () => {
  let token;

  beforeEach(async () => {
    // Setup: crear usuario y obtener token
    const res = await request(app)
      .post("/api/auth/register")
      .seedUser();
    token = res.body.token;
  });

  it("debe crear reseña con 201", async () => {
    const res = await request(app)
      .post("/api/products/1/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({ stars: 5, comment: "Excelente" });

    expect(res.status).toBe(201);
    expect(res.body.review).toHaveProperty("id");
  });

  it("debe rechazar sin token", async () => {
    const res = await request(app)
      .post("/api/products/1/reviews")
      .send({ stars: 5 });

    expect(res.status).toBe(401);
  });
});
```

### C. E2E Tests (Futuro)

Tests de flujos completos de usuario.

**Planned:**
- Registro → Diagnóstico → Generar rutina → Comprar
- Login → Agregar favoritos → Crear orden

---

## 5. Organización de Tests

```
tests/
├── setup.js              # BD global (pool)
├── setup-env.js          # Variables de entorno
├── helpers.js            # Utilidades para tests
│
├── auth.test.js          # POST register, login, GET me, logout, recover
├── profiles.test.js      # GET/PUT /api/profiles/:id
├── diagnosis.test.js     # POST/GET /api/diagnosis
├── products.test.js      # GET /api/products, GET /:id
├── routines.test.js      # POST generate, GET list, GET :id
├── cart.test.js          # POST/GET/PUT/DELETE /api/cart
├── orders.test.js        # POST/GET orders, GET :id
├── favorites.test.js     # POST/GET/DELETE favorites
├── diary.test.js         # POST/GET/DELETE diary
├── dermatologists.test.js # GET dermatologists
├── consultas.test.js     # POST/GET consultas
├── reviews.test.js       # POST/GET/PUT/DELETE reviews
├── community.test.js     # POST/GET/DELETE community-routines
├── contact.test.js       # POST contact
└── payment.test.js       # POST payment (mock)
```

---

## 6. Configuración de Tests

### jest.config.js

```javascript
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  setupFiles: ["./tests/setup-env.js"],
  maxWorkers: 1,        // Evita colisiones en BD
  verbose: true,
  forceExit: true,      // Cierra proceso después de tests
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

### setup-env.js

```javascript
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ||
  "postgresql://brisa:brisa123@localhost:5433/brisa_db_test";
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";
```

### setup.js

```javascript
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

beforeAll(async () => {
  // Conexión global
  await pool.connect();
});

afterAll(async () => {
  await pool.end();
});

module.exports = { pool };
```

### helpers.js

```javascript
const request = require("supertest");
const app = require("../server");
const { pool } = require("./setup");

async function cleanDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      TRUNCATE TABLE
        order_items, orders, cart_items, favorites,
        diary_entries, consultas, product_reviews,
        community_routines, routines, skin_profiles,
        users CASCADE
    `);
  } finally {
    client.release();
  }
}

async function createTestUser(overrides = {}) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Test User",
      email: `test-${Date.now()}@example.com`,
      password: "test123",
      ...overrides
    });
  return {
    user: res.body.user,
    token: res.body.token
  };
}

async function createTestProduct(overrides = {}) {
  const res = await pool.query(
    `INSERT INTO products
      (name, brand, price, category, types, allergies)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      overrides.name || "Test Product",
      overrides.brand || "Test Brand",
      overrides.price || 25,
      overrides.category || "cleanser",
      JSON.stringify(overrides.types || ["normal", "dry"]),
      JSON.stringify(overrides.allergies || [])
    ]
  );
  return res.rows[0];
}

module.exports = {
  cleanDb,
  createTestUser,
  createTestProduct,
  request: () => request(app)
};
```

---

## 7. Ciclo de Vida de Tests

### beforeAll()
```javascript
beforeAll(async () => {
  // Conectar a BD de tests
  // Ejecutar migrations
  // Cargar datos semilla
});
```

### beforeEach()
```javascript
beforeEach(async () => {
  // Limpiar tablas
  // Crear usuario base
});
``### afterEach()
```javascript
afterEach(async () => {
  // Limpiar datos del test
});
```

### afterAll()
```javascript
afterAll(async () => {
  // Cerrar conexiones
  // Limpiar BD
});
```

---

## 8. Patrones de Testing

### Pattern 1: Setup de Autenticación

```javascript
describe("Endpoints protegidos", () => {
  let token, userId;

  beforeEach(async () => {
    const { user, token: t } = await createTestUser();
    token = t;
    userId = user.id;
  });

  it("debe rechazar sin token", async () => {
    const res = await request(app).get("/api/favorites");
    expect(res.status).toBe(401);
  });

  it("debe responder con datos", async () => {
    const res = await request(app)
      .get("/api/favorites")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
```

### Pattern 2: Test de Errores

```javascript
it("debe validar campos requeridos", async () => {
  const res = await request(app)
    .post("/api/cart")
    .send({});  // Falta product_id

  expect(res.status).toBe(400);
  expect(res.body.error).toMatch(/product_id/);
});

it("debe rechazar recurso no encontrado", async () => {
  const res = await request(app)
    .get("/api/products/99999");

  expect(res.status).toBe(404);
});
```

### Pattern 3: Test de Autorización

```javascript
it("debe rechazar acceso a datos de otro usuario", async () => {
  const otherToken = (await createTestUser({
    email: "other@test.com"
  })).token;

  const res = await request(app)
    .get("/api/routines/1")
    .set("Authorization", `Bearer ${otherToken}`);

  expect(res.status).toBe(403);
  expect(res.body.error).toMatch(/no tienes acceso/i);
});
```

---

## 9. Cobertura Objetivo

| Módulo | Cobertura mínima | Estado actual |
|---|---|---|
| auth.js | 90% | ✅ ~95% |
| profiles.js | 80% | ✅ ~85% |
| diagnosis.js | 80% | ✅ ~80% |
| products.js | 85% | ✅ ~90% |
| routines.js | 75% | ⚠️ ~70% |
| cart.js | 85% | ✅ ~85% |
| orders.js | 85% | ✅ ~85% |
| favorites.js | 85% | ✅ ~85% |
| diary.js | 80% | ✅ ~80% |
| reviews.js | 85% | ✅ ~85% |
| community.js | 80% | ✅ ~80% |

**Objetivo global:** 80% cobertura

---

## 10. Comandos de Testing

```bash
# Ejecutar todos los tests
npm test

# Watch mode (desarrollo)
npm run test:watch

# Coverage report
npm test -- --coverage

# Tests específicos
npm test -- auth.test.js
npm test -- --testNamePattern="POST /api/auth/login"

# Verbose
npm test -- --verbose

# Actualizar snapshots (cuando se agreguen)
npm test -- -u
```

---

## 11. Buenas Prácticas TDD

### ✅ HACER

1. **Escribir el test ANTES del código**
   ```javascript
   // 1. Escribir test (falla → RED)
   it("debe validar email único", async () => {
     await createTestUser({ email: "dup@test.com" });
     const res = await createTestUser({ email: "dup@test.com" });
     expect(res.status).toBe(409);
   });

   // 2. Escribir código (pasa → GREEN)
   // 3. Refactorizar (sigue pasando)
   ```

2. **Un assert por test** (principalmente)
   ```javascript
   it("debe devolver status 201", () => {
     expect(res.status).toBe(201);
   });

   it("debe devolver token", () => {
     expect(res.body).toHaveProperty("token");
   });
   ```

3. **Tests independientes**
   - Cada test debe poder ejecutarse solo
   - Usar `beforeEach` para setup

4. **Nombres descriptivos**
   ```javascript
   it("debe rechazar registro con email duplicado")
   it("debe crear orden vacía si carrito está vacío")
   ```

### ❌ EVITAR

1. **Tests que dependen del orden**
2. **Hardcoded de IDs que pueden cambiar**
3. **Sleeps/waits innecesarios**
4. **Demasiados asserts en un test**
5. **No limpiar después del test**

---

## 12. Próximos Pasos (Roadmap TDD)

| Prioridad | Tarea | Estado |
|---|---|---|
| **Alta** | Completar coverage de routines.test.js (scoring) | ⚠️ En progreso |
| **Alta** | Agregar tests de edge cases en products.test.js | ⚠️ Pendiente |
| **Media** | Tests de carga/estrés en endpoints críticos | ❌ Pendiente |
| **Media** | Setup de E2E tests con Playwright | ❌ Pendiente |
| **Baja** | CI/CD con tests automatizados | ❌ Pendiente |

---

*Documento de estrategia de testing TDD para DermaMatch Backend.*
