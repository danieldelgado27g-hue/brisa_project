# Índice de Documentación TDD — DermaMatch Backend

> **Documentación de Testing Test-Driven Development**
> Última actualización: 07/07/2026

---

## 📚 Documentación TDD Completa

### Documentos Principales

| Documento | Descripción | Para quién es |
|---|---|---|
| **[testing-strategy.md](./testing-strategy.md)** | Estrategia general, filosofía TDD, y stack de testing | Arquitectos, Tech Leads |
| **[test-coverage.md](./test-coverage.md)** | Reporte detallado de cobertura actual y métricas | PMs, QA, Developers |
| **[test-guide.md](./test-guide.md)** | Guía práctica paso a paso para escribir y ejecutar tests | Developers |
| **[api-reference.md](./api-reference.md)** (Sección 7) | Casos de prueba TDD por endpoint | Frontend/Backend Devs |
| **[roadmap.md](./roadmap.md)** (Sección TDD) | Roadmap de testing por fase y prioridades | PMs, Tech Leads |
| **[admin-panel.md](./admin-panel.md)** ⭐ | Panel de Administración: Pendiente TDD | Developers, Tech Leads |

---

## 🚀 Quick Start

### Para Desarrolladores Nuevos

```bash
# 1. Lee la guía práctica
# docs/test-guide.md

# 2. Setup inicial
npm install
cp .env.example .env

# 3. Ejecuta tests
npm test

# 4. Escribe tu primer test TDD
# docs/test-guide.md - Sección 3
```

### Para QA/Testers

```bash
# 1. Revisa el reporte de cobertura
# docs/test-coverage.md

# 2. Entiende los casos de prueba por endpoint
# docs/api-reference.md - Sección 7

# 3. Ejecuta tests específicos
npm test -- auth.test.js
```

### Para Tech Leads/Arquitectos

```bash
# 1. Revisa la estrategia
# docs/testing-strategy.md

# 2. Consulta el roadmap TDD
# docs/roadmap.md - Sección Fase TDD

# 3. Revisa métricas actuales
# docs/test-coverage.md - Sección 6
```

---

## 📊 Estado Actual

| Métrica | Valor | Objetivo | Nota |
|---|---|---|---|
| Tests escritos | 150 | 191+ | ✅ 150 pasando |
| Cobertura global | 78% | 85% | ⚠️ 7% gap |
| Endpoints con tests | 38/60 | 55/60 | ⚠️ 22 pendientes |
| Tests pasando | ✅ 100% | 100% | ✅ |
| Documentación TDD | ✅ Completa | ✅ | ✅ |
| **Tests Admin pendientes** | **0/41** | **41** | ❌ Fase 6 |

### Tests Pendientes por Fase

| Fase | Tests Pendientes | Prioridad |
|---|---|---|
| **Fase 6 - Admin** | 41 tests | 🔴 Alta |
| Fase 3 - Rutina avanzada | 8 tests | 🟡 Media |
| Fase 4 - Stripe real | 6 tests | 🟡 Media |
| Fase 7 - Optimización | 10+ tests | 🟢 Baja |

---

## 🔗 Recursos Relacionados

### Configuración
- **jest.config.js** - Configuración de Jest
- **tests/setup.js** - Setup global de BD
- **tests/helpers.js** - Utilidades para tests

### Scripts NPM
```bash
npm test              # Ejecutar todos los tests
npm run test:watch    # Modo watch (desarrollo)
npm test -- --coverage    # Reporte de cobertura
```

### Archivos de Tests
```
tests/
├── auth.test.js          # Autenticación (17 tests)
├── profiles.test.js      # Perfiles (9 tests)
├── diagnosis.test.js     # Diagnóstico (7 tests)
├── products.test.js      # Productos (12 tests)
├── routines.test.js      # Rutinas (11 tests)
├── cart.test.js          # Carrito (13 tests)
├── orders.test.js        # Órdenes (11 tests)
├── favorites.test.js     # Favoritos (8 tests)
├── diary.test.js         # Diario (10 tests)
├── dermatologists.test.js # Dermatólogos (7 tests)
├── consultas.test.js     # Consultas (8 tests)
├── reviews.test.js       # Reseñas (11 tests)
├── community.test.js      # Comunidad (9 tests)
├── contact.test.js       # Contacto (4 tests)
└── payment.test.js       # Pagos (2 tests)
```

---

## 🎯 Próximos Pasos TDD

### Inmediatos (Esta semana)
- [ ] Completar tests de scoring en routines.test.js
- [ ] Agregar tests de stock en cart.test.js
- [ ] Setup de GitHub Actions para CI

### Corto Plazo (Próximas 2 semanas)
- [ ] Tests de integración Stripe real
- [ ] Tests de autorización admin
- [ ] E2E tests con Playwright

### Largo Plazo (Próximo trimestre)
- [ ] Tests de carga y performance
- [ ] Tests de seguridad
- [ ] Coverage 85%+

---

## 📝 Convenciones de Nombres

### Test Files
- `auth.test.js` - Tests del módulo auth
- `routines.test.js` - Tests del módulo routines

### Test Descriptions
```javascript
// ✅ Buen nombre
it("debe rechazar email duplicado con 409", async () => {});

// ❌ Mal nombre
it("test 1", async () => {});
```

### Test Groups
```javascript
describe("POST /api/auth/register", () => {
  describe("casos exitosos", () => {
    it("debe crear usuario y devolver token");
  });

  describe("validaciones", () => {
    it("debe requerir email");
    it("debe requerir password");
  });
});
```

---

## 🐛 Debugging Tests

```bash
# Ejecutar un test específico
npm test -- -t "debe rechazar email duplicado"

# Ver output completo
npm test -- --verbose --no-coverage

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## 📞 Soporte

Para preguntas sobre testing en DermaMatch Backend:

1. Revisar `test-guide.md` - Guía completa
2. Revisar `test-coverage.md` - Tests existentes
3. Revisar archivos `.test.js` - Ejemplos reales

---

*Índice de documentación TDD actualizado al 07/07/2026.*
