# Guía de Tests — DermaMatch Backend

> **Última actualización:** 07/07/2026
> **Enfoque:** TDD + Integration Testing con Jest + Supertest

---

## Índice

1. [Setup Inicial](#1-setup-inicial)
2. [Ejecutar Tests](#2-ejecutar-tests)
3. [Escribir Tests TDD](#3-escribir-tests-tdd)
4. [Helpers y Utilidades](#4-helpers-y-utilidades)
5. [Patrones Comunes](#5-patrones-comunes)
6. [Debugging](#6-debugging)
7. [CI/CD](#7-cicd)

---

## 1. Setup Inicial

### Requisitos Previos

```bash
# Node.js 18+
node --version

# PostgreSQL 16+ (para tests)
psql --version

# Docker (opcional, para BD containerizada)
docker --version
```

### Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd brisa_project_backend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Configurar BD de tests
# En .env:
TEST_DATABASE_URL=postgresql://brisa:brisa123@localhost:5433/brisa_db_test
```

### Base de Datos de Tests

```bash
# Opción 1: Usar Docker (recomendado)
docker compose up -d db

# Opción 2: BD local
createdb brisa_db_test

# Ejecutar migrations en BD de tests
psql brisa_db_test < db/init.sql
```

---

## 2. Ejecutar Tests

### Comandos Básicos

```bash
# Ejecutar todos los tests
npm test

# Watch mode (desarrollo)
npm run test:watch

# Coverage report
npm test -- --coverage

# Coverage en HTML
npm test -- --coverage --coverageReporters=html
open coverage/lcov-report/index.html

# Tests específicos
npm test -- auth.test.js
npm test -- --testNamePattern="debe rechazar"

# Verbose con stack traces
npm test -- --verbose
```

### Opciones Útiles de Jest

```bash
# Actualizar snapshots
npm test -- -u

# Ejecutar tests que coinciden con patrón
npm test -- --testNamePattern="POST /api/auth"

# Max workers (para tests paralelos)
npm test -- --maxWorkers=2

# Mostrar coverage de archivos específicos
npm test -- --coverage --collectCoverageFrom="netlify/functions/*.js"
```

---

## 3. Escribir Tests TDD

### Ciclo Red-Green-Refactor

```javascript
// 1. RED: Escribir test que falla
describe("POST /api/auth/register", () => {
  it("debe rechazar email inválido", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Test", email: "invalido", password: "123" });

    expect(res.status).toBe(400);  // ← Va a fallar primero
    expect(res.body.error).toMatch(/email/);
  });
});

// 2. GREEN: Escribir código mínimo para que pase
// En auth.js:
if (!email.includes("@")) {
  return json(400, { error: "Email inválido" });
}

// 3. REFACTOR: Mejorar el código
// Extraer a función validateEmail() si se reutiliza
```

### Estructura de un Test File

```javascript
const request = require("supertest");
const app = require("../server");
const { cleanDb, createTestUser } = require("./helpers");

// Setup global
beforeAll(async () => {
  await initDb();
});

beforeEach(async () => {
  await cleanDb();
});

// Tests agrupados por endpoint
describe("POST /api/endpoint", () => {
  let token;

  beforeEach(async () => {
    // Setup específico del grupo
    token = (await createTestUser()).token;
  });

  // Casos positivos
  describe("casos exitosos", () => {
    it("debe crear recurso", async () => {
      const res = await request(app)
        .post("/api/endpoint")
        .set("Authorization", `Bearer ${token}`)
        .send(validData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
    });
  });

  // Casos de error
  describe("validaciones", () => {
    it("debe rechazar sin auth", async () => {
      const res = await request(app).post("/api/endpoint");
      expect(res.status).toBe(401);
    });

    it("debe validar campos", async () => {
      const res = await request(app)
        .post("/api/endpoint")
        .send({});  // Datos vacíos

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });
});
```

### Patrones de Assertion

```javascript
// Status codes
expect(res.status).toBe(200);
expect(res.status).toBeGreaterThanOrEqual(200);
expect(res.status).toBeLessThan(300);

// Respuestas
expect(res.body).toMatchObject({ id: 1, name: "Test" });
expect(res.body).toHaveProperty("token");
expect(res.body.success).toBe(true);

// Arrays
expect(res.body.items.length).toBeGreaterThan(0);
expect(res.body.items).toEqual(
  expect.arrayContaining([
    expect.objectContaining({ id: 1 })
  ])
);

// Strings
expect(res.body.error).toMatch(/requerido/);
expect(res.body.email).toContain("@");

// Números
expect(res.body.total).toBe(100);
expect(res.body.price).toBeCloseTo(25.50, 2);
```

---

## 4. Helpers y Utilidades

### helpers.js

```javascript
const request = require("supertest");
const app = require("../server");
const { pool } = require("./setup");

// Limpiar BD entre tests
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

// Crear usuario de test
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

// Crear producto de test
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
      JSON.stringify(overrides.types || ["normal"]),
      JSON.stringify(overrides.allergies || [])
    ]
  );
  return res.rows[0];
}

// Crear perfil de piel
async function createTestProfile(userId, overrides = {}) {
  const res = await pool.query(
    `INSERT INTO skin_profiles
      (user_id, type_id, type_name, concerns, allergies, is_active)
     VALUES ($1, $2, $3, $4, $5, true)
     RETURNING *`,
    [
      userId,
      overrides.type_id || "normal",
      overrides.type_name || "Normal",
      JSON.stringify(overrides.concerns || []),
      JSON.stringify(overrides.allergies || [])
    ]
  );
  return res.rows[0];
}

// Agregar al carrito
async function addToCart(userId, productId, qty = 1) {
  await pool.query(
    `INSERT INTO cart_items (user_id, product_id, qty, price_at_add)
     VALUES ($1, $2, $3, (SELECT price FROM products WHERE id = $2))
     ON CONFLICT (user_id, product_id)
     DO UPDATE SET qty = cart_items.qty + $3`,
    [userId, productId, qty]
  );
}

module.exports = {
  cleanDb,
  createTestUser,
  createTestProduct,
  createTestProfile,
  addToCart,
  request: () => request(app)
};
```

### Uso de Helpers en Tests

```javascript
const { cleanDb, createTestUser, createTestProduct } = require("./helpers");

describe("POST /api/favorites", () => {
  beforeEach(async () => {
    await cleanDb();
  });

  it("debe agregar favorito", async () => {
    const { token } = await createTestUser();
    const product = await createTestProduct();

    const res = await request(app)
      .post("/api/favorites")
      .set("Authorization", `Bearer ${token}`)
      .send({ product_id: product.id });

    expect(res.status).toBe(201);
  });
});
```

---

## 5. Patrones Comunes

### Pattern 1: Autenticación

```javascript
describe("Endpoints protegidos", () => {
  let token, userId;

  beforeEach(async () => {
    const { user, token: t } = await createTestUser();
    token = t;
    userId = user.id;
  });

  const withAuth = (method, url, data = {}) => {
    return request(app)
      [method.toLowerCase()](url)
      .set("Authorization", `Bearer ${token}`)
      .send(data);
  };

  it("debe acceder con token válido", async () => {
    const res = await withAuth("GET", "/api/favorites");
    expect(res.status).toBe(200);
  });
});
```

### Pattern 2: Resources CRUD

```javascript
describe("CRUD /api/products", () => {
  let productId;

  describe("POST", () => {
    it("debe crear producto", async () => {
      const res = await request(app)
        .post("/api/products")
        .send(validProduct);

      expect(res.status).toBe(201);
      productId = res.body.product.id;
    });
  });

  describe("GET", () => {
    it("debe listar productos", async () => {
      const res = await request(app).get("/api/products");
      expect(res.status).toBe(200);
    });
  });

  describe("PUT", () => {
    it("debe actualizar producto", async () => {
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .send({ price: 30 });

      expect(res.status).toBe(200);
    });
  });

  describe("DELETE", () => {
    it("debe eliminar producto", async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`);

      expect(res.status).toBe(200);
    });
  });
});
```

### Pattern 3: Validaciones

```javascript
describe("validaciones de entrada", () => {
  const requiredFields = ["name", "email", "password"];

  requiredFields.forEach((field) => {
    it(`debe requerir ${field}`, async () => {
      const payload = { name: "T", email: "t@t.com", password: "123" };
      delete payload[field];

      const res = await request(app)
        .post("/api/auth/register")
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(new RegExp(field));
    });
  });
});
```

### Pattern 4: Estados de Recursos

```javascript
describe("estados de orden", () => {
  it("debe crear orden como pending", async () => {
    const res = await createOrder();
    expect(res.body.order.status).toBe("pending");
  });

  it("debe actualizar a confirmed", async () => {
    await createOrder();
    const res = await request(app)
      .put("/api/admin/orders/1")
      .send({ status: "confirmed" });

    expect(res.body.order.status).toBe("confirmed");
  });
});
```

---

## 6. Debugging

### Debug Mode

```bash
# Ejecutar con debug output
NODE_ENV=test node --inspect-brk node_modules/.bin/jest --runInBand

# Luego en Chrome:
chrome://inspect
```

### Console.log en Tests

```javascript
it("debug response", async () => {
  const res = await request(app).get("/api/products");
  console.log("STATUS:", res.status);
  console.log("BODY:", JSON.stringify(res.body, null, 2));
  console.log("HEADERS:", res.headers);
});
```

### Ver Queries SQL

```javascript
// En db.js, agregar logging:
pool.query = (...args) => {
  console.log("SQL:", args[0]);
  console.log("PARAMS:", args[1]);
  return originalQuery.apply(pool, args);
};
```

### Timeout en Tests Lentos

```javascript
it("test lento", async () => {
  // ...
}, 30000);  // 30 segundos timeout
```

---

## 7. CI/CD

### GitHub Actions (Futuro)

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: brisa
          POSTGRES_PASSWORD: brisa123
          POSTGRES_DB: brisa_db_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        env:
          TEST_DATABASE_URL: postgresql://brisa:brisa123@localhost:5432/brisa_db_test
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 8. Checklist para Nuevo Test

Antes de commitear un nuevo test, verificar:

- [ ] El test falla primero (RED)
- [ ] El test pasa después del código (GREEN)
- [ ] El código está refactorizado (REFACTOR)
- [ ] El test es independiente (puede correr solo)
- [ ] El test limpia sus datos (beforeEach/afterEach)
- [ ] El test tiene nombre descriptivo
- [ ] El test tiene un solo assert principal
- [ ] El test no tiene hardcoded values frágiles
- [ ] El test cubre edge cases

---

## 9. Troubleshooting

### Tests fallan aleatoriamente

```javascript
// Asegurar orden de ejecución
jest.setTimeout(10000);

// Usar maxWorkers: 1 en jest.config.js
```

### BD bloqueada

```bash
# Matar conexiones zombie
psql brisa_db_test -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'brisa_db_test';"
```

### Tests lentos

```javascript
// Reusar conexiones en setup
beforeAll(async () => {
  pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
  await pool.connect();
});
```

---

## 10. Recursos Adicionales

- [Jest Docs](https://jestjs.io/docs/getting-started)
- [Supertest Docs](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

*Guía de tests actualizada para DermaMatch Backend.*
