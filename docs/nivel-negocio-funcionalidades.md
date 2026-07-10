# Documentación de Negocio — Funcionalidades Backend DermaMatch

> **Estado de implementación backend (07/2026):**
> - ✅ **Completo** — API implementada y funcional
> - ⚠️ **Parcial** — Implementado con limitaciones
> - ❌ **Pendiente** — No implementado

## Índice de Funcionalidades

1. [Autenticación y Gestión de Usuarios](#1-autenticación-y-gestión-de-usuarios) ✅
2. [Diagnóstico de Piel (Skin Profile / Quiz)](#2-diagnóstico-de-piel-skin-profile--quiz) ✅
3. [Catálogo de Productos](#3-catálogo-de-productos) ✅
4. [Motor de Rutinas Personalizadas (Routine Engine)](#4-motor-de-rutinas-personalizadas-routine-engine) ⚠️
5. [Carrito de Compras y Checkout](#5-carrito-de-compras-y-checkout) ⚠️
6. [Favoritos / Wishlist](#6-favoritos--wishlist) ✅
7. [Skin Diary (Diario de Piel)](#7-skin-diary-diario-de-piel) ✅
8. [Consultas y Dermatólogos](#8-consultas-y-dermatólogos) ✅
9. [Planes de Suscripción (Pro / Premium)](#9-planes-de-suscripción-pro--premium) ❌
10. [Formulario de Contacto](#10-formulario-de-contacto) ⚠️
11. [Reseñas de Productos](#11-reseñas-de-productos) ✅
12. [Rutinas de la Comunidad](#12-rutinas-de-la-comunidad) ⚠️
13. [Configuración de Rutina del Usuario](#13-configuración-de-rutina-del-usuario) ✅
14. [Búsqueda y Filtrado de Productos](#14-búsqueda-y-filtrado-de-productos) ✅
15. [Panel de Administración](#15-panel-de-administración) ❌

---

## 1. Autenticación y Gestión de Usuarios ✅

### Implementación Backend
- `POST /api/auth/register` — Registro con bcrypt + JWT
- `POST /api/auth/login` — Login con verificación de hash
- `GET /api/auth/me` — Datos del usuario autenticado
- ❌ `POST /api/auth/logout` — No implementado (sesión stateless)
- ❌ `POST /api/auth/recover` — No implementado

### Historia de Usuario
> Como usuaria de DermaMatch, quiero crear una cuenta e iniciar sesión para guardar mi progreso, mis productos favoritos y mi rutina personalizada en la nube, accediendo desde cualquier dispositivo.

### Flujo de Interacción del Usuario

```
1. Usuario llega a la landing page
2. Hace clic en "🔑 Iniciar sesión" (header)
3. Se abre modal con opciones: Login / Registro
4. Si NO tiene cuenta:
   a. Hace clic en "Regístrate aquí"
   b. Completa: Nombre, Email, Contraseña
   c. Hace clic en "Crear cuenta"
   d. Sistema: valida email único, crea cuenta, inicia sesión automáticamente
   e. Redirige al home con sesión iniciada
5. Si YA tiene cuenta:
   a. Completa: Email, Contraseña
   b. Hace clic en "Iniciar sesión"
   c. Sistema: valida credenciales
   d. Redirige al home con sesión iniciada
6. Usuario puede cerrar sesión desde el botón del header
```

### Reglas de Negocio

| Regla | Descripción |
|---|---|
| **Email único** | No pueden existir dos cuentas con el mismo email |
| **Contraseña segura** | Mínimo 6 caracteres |
| **Sesión persistente** | La sesión se mantiene activa por 7 días (token JWT) |
| **Perfil automático** | Al registrarse se crea automáticamente un perfil de usuario vacío |
| **Recuperación** | El usuario puede solicitar recuperación de contraseña por email |
| **Eliminación de cuenta** | El usuario puede solicitar la eliminación de su cuenta y todos sus datos asociados |

### Roles del Sistema

| Rol | Descripción | Permisos |
|---|---|---|
| **Usuario** | Cliente final de DermaMatch | Ver productos, crear rutina, comprar, agendar consultas |
| **Usuario Premium** | Usuario con suscripción paga | Todo lo de Usuario + asesorías virtuales, envío gratis |
| **Dermatólogo** | Profesional de la salud | Responder consultas, gestionar agenda |
| **Admin** | Administrador de la plataforma | CRUD productos, usuarios, órdenes, moderar reseñas |

### Indicadores de Negocio (KPI)

- Tasa de conversión registro → diagnóstico completado
- Tasa de retención a 7, 30, 90 días
- Usuarios activos por día/semana/mes
- Tasa de recuperación de contraseña

---

## 2. Diagnóstico de Piel (Skin Profile / Quiz) ✅

### Implementación Backend
- `POST /api/diagnosis` — Crear o actualizar perfil de piel (UPSERT)
- `GET /api/diagnosis` — Obtener perfil activo del usuario
- El diagnóstico se calcula en el frontend (`quiz.js`), el backend solo almacena el resultado

### Historia de Usuario
> Como usuaria, quiero responder un cuestionario sobre mi piel para descubrir mi tipo de piel y obtener recomendaciones personalizadas de productos.

### Flujo de Interacción del Usuario

```
1. Usuario navega a "Test" desde el menú o desde CTA del home
2. Pantalla de bienvenida con info del test (7 preguntas, respaldado por dermatólogos)
3. Hace clic en "Comenzar mi diagnóstico"
4. Responde 7 preguntas una por una:
   P1: ¿Cómo se siente tu piel al despertar? (Tirante/Normal/Brillante/Mixta)
   P2: ¿Frecuencia de sensibilidad? (Alta/A veces/Nunca)
   P3: ¿Cómo son tus poros? (Grandes/Pequeños/Normales)
   P4: ¿Tendencia a acné? (Frecuente/Ocasional/No)
   P5: ¿Reacción al sol? (Quemadizo/Normal/Resistente)
   P6: ¿Líneas de expresión? (Visibles/Solo al gesticular/No)
   P7: ¿Manchas o hiperpigmentación? (Varias/Algunas/No)
5. Puede retroceder a preguntas anteriores
6. Al terminar, pantalla de "Analizando tu piel..." (loading de 1.5s)
7. Resultado: muestra tipo de piel + descripción + preocupaciones detectadas
8. Botones: "Ver mis productos" → catálogo filtrado | "Ir a mi perfil"
```

### Reglas de Negocio

| Regla | Descripción |
|---|---|
| **Tipos de piel resultantes** | Normal, Seca, Grasa, Mixta, Sensible, y combinaciones (Seca Sensible, Grasa con Acné, etc.) |
| **Algoritmo de mapeo** | Combinación de respuestas → typeName + concerns + description (ver `quiz.js:42-75`) |
| **Re-evaluación** | El usuario puede repetir el test solo después de 90 días desde el último |
| **Preocupaciones detectadas** | Se generan automáticamente según respuestas (deshidratación, acné, hiperpigmentación, etc.) |
| **Rediagnóstico forzado** | Si el usuario quiere reevaluar antes de 90 días, se muestra confirmación advirtiendo que se borrará el perfil actual |
| **Alergias** | Se detectan por pregunta de sensibilidad y se almacenan para filtrar productos |

### Decisiones de Negocio en Backend

- **Cachear resultado de diagnóstico** para reuso sin recalcular
- **Perfil vs Usuario**: un usuario puede tener múltiples diagnósticos históricos pero solo UNO activo
- **Regla de 90 días**: existe para evitar cambios frecuentes de perfil que afecten la consistencia de recomendaciones

---

## 3. Catálogo de Productos ✅

### Implementación Backend
- `GET /api/products` — Listado con filtros: tipo, categoría, presupuesto, búsqueda, eco, cruelty, paginación
- `GET /api/products/:id` — Detalle completo del producto
- 12 productos en seed data (expansible)

### Historia de Usuario
> Como usuaria, quiero explorar productos de skincare filtrando por mi tipo de piel, presupuesto, ingredientes y marcas para encontrar los que mejor se adaptan a mí.

### Flujo de Interacción del Usuario

```
1. Usuario navega a "Productos" desde el menú
2. Vista general: muestra grid con tarjetas de productos recomendados para su tipo de piel (si tiene perfil) o todos
3. Puede filtrar por tipo de piel: chips de "Normal/Seca/Grasa/Mixta/Sensible/Todos"
4. Puede buscar por nombre o marca en el campo de búsqueda
5. Cada tarjeta de producto muestra: nombre, marca, precio, badges (eco/cruelty-free), rating
6. Puede marcar como favorito (♥) desde la tarjeta
7. Al hacer clic en una tarjeta, navega a detalle del producto:
   - Imagen del producto
   - Nombre, marca, precio
   - Rating con estrellas
   - Ingredientes (formateados como tags)
   - Descripción + "¿Cómo ayuda a mi piel?"
   - Badges (eco, cruelty-free)
   - Botón favorito
   - Botón "Contactar tienda" → WhatsApp
   - Sección de reseñas
```

### Reglas de Negocio

| Regla | Descripción |
|---|---|
| **Categorías** | cleanser, moisturizer, treatment, spf, toner, serum, eye_care, mask, exfoliant |
| **Compatibilidad** | Cada producto lista los tipos de piel para los que es apto (campo `types`) |
| **Sellos de alergia** | fragrance-free, oil-free, non-comedogenic, hypoallergenic |
| **Stock** | Productos con stock = 0 se muestran como "Agotado" |
| **Precios** | En Soles peruanos (S/.) |
| **Tiendas externas** | Cada producto tiene links a tiendas (Amazon, Sephora, etc.) |
| **Productos dupe** | Cada producto puede tener alternativas más económicas (`dues`) |
| **Imágenes** | Actualmente son SVG generados inline. En backend: URLs de Supabase Storage |

### Campos del Producto (desde perspectiva de negocio)

| Campo | ¿Para qué sirve? |
|---|---|
| `name` | Nombre comercial del producto |
| `brand` | Marca fabricante |
| `price` | Precio de venta sugerido en S/. |
| `category` | Tipo de producto (define en qué paso de la rutina va) |
| `types` | Tipos de piel compatibles (motor de rutina lo usa para scoring) |
| `allergies` | Sellos de alergia (filtro de seguridad) |
| `eco` | ¿Es ecológico/sostenible? (badge) |
| `cruelty` | ¿Libre de crueldad animal? (badge) |
| `rating` | Calificación promedio (1-5) |
| `ingredients` | Lista de ingredientes (mostrados como tags) |
| `store_links` | Links de compra externa (afiliados) |
| `dues` | Alternativas económicas (para función "swap" en rutina) |

---

## 4. Motor de Rutinas Personalizadas (Routine Engine) ⚠️

### Implementación Backend
- `POST /api/routines/generate` — Genera rutina según perfil + config del usuario
- `GET /api/routines` — Lista rutinas del usuario
- `GET /api/routines/:id` — Detalle de rutina

### Limitaciones actuales
- El algoritmo actual es **simple**: solo asigna el primer producto disponible por categoría en orden fijo
- ❌ No tiene el scoring avanzado del frontend (compatibilidad 30% + alergias 20% + precio 15% + rating 10%)
- ❌ No implementa `PUT /api/routines/:id/swap` (cambiar producto)
- ❌ No implementa `GET /api/routines/:id/alternatives` (alternativas)
- El verdadero motor de rutina sigue en el frontend (`routineEngine.js`)

### Historia de Usuario
> Como usuaria que ya completó su diagnóstico, quiero que el sistema genere una rutina diurna y nocturna personalizada con productos compatibles con mi piel, presupuesto y preferencias de marca.

### Flujo de Interacción del Usuario

```
1. Usuario va a "Mi Perfil" → sección "Configuración de Tu Rutina"
2. Configura parámetros:
   a. Presupuesto por producto: Económico (< S/15) / Medio (< S/25) / Premium (< S/50) / Sin límite
   b. Prioridad de optimización: Precio más bajo / Mejor calidad / Balanceado
   c. Marcas preferidas (opcional): selecciona checkboxes
   d. Alergias adicionales (opcional): parabenos, aceites esenciales, alcohol, sulfatos, etc.
3. Hace clic en "Generar Rutina" (botón en la UI)
4. Sistema ejecuta algoritmo de selección:
   a. Para cada categoría (cleanser, treatment, moisturizer, spf):
      - Filtra productos por: categoría, presupuesto, marcas, alergias
      - Calcula score: compatibilidad piel (+30) + seguridad alergias (+20) + precio (+15) + rating (+10)
      - Selecciona el producto con mayor score
   b. Asegura mínimo 3 productos por turno (mañana/noche)
   c. Si faltan productos, busca alternativas en otras categorías
5. Muestra resultado:
   - Pestañas: ☀️ Rutina Diurna | 🌙 Rutina Nocturna
   - Cada paso con: producto, marca, precio, % compatibilidad, guía de aplicación
   - Resumen: inversión inicial, costo mensual, duración estimada
   - Botón "Cambiar producto" para swapp manual
   - Botón "Exportar rutina" (copia al portapapeles o descarga .txt)
   - Botón "Regenerar" con diferente configuración
```

### Reglas de Negocio

| Regla | Descripción |
|---|---|
| **Mínimo de productos** | 3 productos por turno (mañana y noche) |
| **Sin duplicados** | Un mismo producto no puede repetirse en mañana y noche |
| **SPP esencial en mañana** | Toda rutina diurna debe incluir protector solar |
| **Limpiador esencial** | Toda rutina (mañana y noche) debe incluir limpiador |
| **Hidratante esencial** | Toda rutina debe incluir hidratante |
| **Template por tipo de piel** | Cada tipo de piel tiene un template de categorías prioritarias (ver `routineEngine.js:5-42`) |
| **Scoring** | Score máximo = 100 (50 base + 30 match piel + 20 alergias + 15 precio + 10 rating) |
| **Swap manual** | Usuario puede cambiar cualquier producto por una alternativa de la misma categoría |
| **Sin repetición** | Productos únicos entre día y noche (no se cuenta doble en inversión total) |
| **Costo mensual estimado** | Inversión inicial / 2 (cada producto dura ~2 meses) |

### Algoritmo de Selección (Business Logic)

```
Por cada turno (mañana/noche):
  1. Tomar template de categorías según tipo de piel
  2. Para cada categoría en orden de prioridad:
     a. Buscar todos los productos de esa categoría
     b. Filtrar por: compatibilidad con piel + alergias seguras + presupuesto + marcas
     c. Calcular score a cada candidato
     d. Seleccionar el de mayor score
  3. Si hay menos de 3 productos, buscar en categorías adicionales
  4. Validar: sin duplicados, productos esenciales presentes
  5. Calcular totales financieros
```

---

## 5. Carrito de Compras y Checkout ⚠️

### Implementación Backend
- `GET /api/cart` — Carrito con datos de producto (JOIN)
- `POST /api/cart` — Agregar item (o incrementar si existe)
- `PUT /api/cart/:productId` — Actualizar cantidad
- `DELETE /api/cart/:productId` — Eliminar item
- `POST /api/orders` — Crear orden desde carrito (vacía carrito automáticamente)
- `GET /api/orders` — Historial de órdenes
- `GET /api/orders/:id` — Detalle de orden con items

### Limitaciones
- ❌ **Sin pasarela de pago real** — Stripe no integrado
- `POST /api/payment` es un **mock** que solo guarda en tabla `payments`
- ❌ No hay `POST /api/create-payment-intent`
- ❌ No hay `POST /api/confirm-payment`
- ❌ No hay webhook de Stripe
- El flujo de compra termina en la creación de la orden sin verificar pago real

### Historia de Usuario
> Como usuaria, quiero agregar productos a un carrito, elegir método de entrega y pago, y completar mi compra de forma segura para recibir mis productos en casa.

### Flujo de Interacción del Usuario

```
1. Usuario ve un producto en catálogo o detalle
2. Hace clic en "Agregar al carrito" (desde detalle de producto)
3. Badge del carrito en el header se actualiza
4. Usuario navega al carrito (icono en header o menú)
5. Ve lista de productos agregados con: imagen, nombre, precio, cantidad, botón eliminar
6. Ve el total de la compra
7. Selecciona opción de entrega:
   a. 🚚 Delivery a domicilio → muestra campos: dirección, ciudad, teléfono, notas
   b. 🏪 Recojo en tienda
8. Selecciona método de pago:
   a. 💳 Tarjeta de crédito/débito
   b. 💵 Efectivo
   c. 📱 Yape
   d. 📱 Plin
   e. 🏦 Transferencia bancaria
9. Hace clic en "Finalizar compra"
10. Sistema procesa pago (integración con Stripe/Mercado Pago)
11. Muestra confirmación: método de pago + tipo de entrega
12. Carrito se vacía
13. Redirige al home
```

### Reglas de Negocio

| Regla | Descripción |
|---|---|
| **Stock** | Validar stock disponible antes de confirmar compra |
| **Precio congelado** | El precio se congela al agregar al carrito, no cambia si el producto sube después |
| **Mínimo de compra** | S/ 10 para delivery (opcional, definir según negocio) |
| **Delivery gratis** | Para usuarios Premium en pedidos > S/ 50 |
| **Cambio de método pago** | No se puede cambiar después de confirmar |
| **Tipos de pago en Perú** | Yape y Plin son billeteras digitales peruanas. Transferencia bancaria a cuenta de la empresa |
| **Orden pendiente** | Si el pago falla, la orden queda como "pending" por 24h |

### Estados de una Orden

```
pending → confirmed → processing → shipped → delivered
    ↓          ↓
cancelled   cancelled
```

---

## 6. Favoritos / Wishlist ✅

### Implementación Backend
- `GET /api/favorites` — Lista favoritos con datos de producto
- `POST /api/favorites` — Agregar a favoritos
- `DELETE /api/favorites/:productId` — Quitar de favoritos

### Historia de Usuario
> Como usuaria, quiero marcar productos como favoritos para encontrarlos rápidamente después y decidir si los compro más adelante.

### Flujo de Interacción del Usuario

```
1. Usuario ve una tarjeta de producto en grid o detalle
2. Hace clic en el corazón (♡ → ♥)
3. Producto se agrega a favoritos
4. Badge de favoritos en header se actualiza
5. Usuario puede ir a "Favoritos" desde el menú o badge
6. Ve grid de todos sus productos favoritos
7. Puede quitar favoritos (♥ → ♡) desde cualquier vista
```

### Reglas de Negocio

| Regla | Descripción |
|---|---|
| **Límite** | Sin límite de favoritos |
| **Persistencia** | Los favoritos se guardan en la nube, no se pierden al cambiar de dispositivo |
| **Notificación** | (Futuro) Notificar al usuario cuando un producto favorito está en oferta |
| **Compartir** | (Futuro) Compartir lista de favoritos |

---

## 7. Skin Diary (Diario de Piel) ✅

### Implementación Backend
- `POST /api/diary` — Crear o actualizar entrada (upsert por fecha)
- `GET /api/diary` — Listar historial completo
- `GET /api/diary/:date` — Obtener entrada de fecha específica
- `DELETE /api/diary/:date` — Eliminar entrada
- ❌ `GET /api/diary-entries/stats` — No implementado (rachas, % estados)

### Historia de Usuario
> Como usuaria, quiero registrar diariamente el estado de mi piel para hacer seguimiento de mi evolución y detectar patrones (qué productos funcionan, qué factores afectan mi piel).

### Flujo de Interacción del Usuario

```
1. Usuario navega a "Skin-Diary" desde el menú lateral
2. Ve el formulario para registrar el día de hoy:
   a. Selector: ¿Cómo está tu piel hoy?
      - 🌟 Buena — radiante y tranquila
      - 🙃 Regular — algunos brotes o sequedad
      - 😞 Mala — irritada, brotes o sensible
   b. Campo opcional de notas: "¿Algo que destacar? ¿Usaste algún producto nuevo?"
3. Hace clic en "Guardar entrada"
4. La entrada se agrega al historial (más reciente primero)
5. El historial muestra: fecha, estado (color-coded), notas
6. (Futuro) Estadísticas: racha actual, días buenos vs malos, gráfica mensual
```

### Reglas de Negocio

| Regla | Descripción |
|---|---|
| **Una entrada por día** | Solo se puede registrar una vez por día (fecha única) |
| **Edición** | Usuario puede editar la entrada del día actual (no anteriores) |
| **Historial** | Se muestran todas las entradas ordenadas por fecha descendente |
| **Fotos** | (Futuro) Adjuntar foto del rostro para comparación visual |
| **Recordatorio** | (Futuro) Notificación push diaria recordando registrar |

### Indicadores de Negocio

- Racha actual de registro (streak)
- % de días "buenos" vs "regulares" vs "malos" en el último mes
- Correlación entre cambio de productos y estado de la piel

---

## 8. Consultas y Dermatólogos ✅

### Implementación Backend
- `GET /api/dermatologists` — Lista de dermatólogos (público)
- `GET /api/dermatologists/:id` — Detalle de dermatólogo
- `POST /api/consultas` — Enviar consulta
- `GET /api/consultas` — Listar consultas del usuario
- `GET /api/consultas/:id` — Detalle de consulta
- ❌ `appointments` — Tabla de citas no implementada

### Historia de Usuario
> Como usuaria, quiero enviar consultas sobre mi piel a expertos y agendar citas con dermatólogos certificados para recibir orientación profesional.

### Flujo de Interacción del Usuario

```
Enviar consulta:
1. Usuario navega a "Consultas" desde el menú
2. Sección "Enviar consulta": completa Asunto + Mensaje
3. Hace clic en "Enviar consulta"
4. Consulta queda como "Pendiente"
5. Un dermatólogo responde (desde admin)
6. Usuario ve la respuesta en su historial de consultas

Agendar cita:
1. Usuario ve lista de dermatólogos recomendados con: nombre, especialidad, clínica, distancia, rating, teléfono
2. Puede llamar directamente (📞) o agendar cita (📅)
3. Al agendar: sistema muestra confirmación "Te contactaremos para confirmar"

Ver historial:
1. En la misma página, sección "Mis consultas" muestra consultas previas con estado (Pendiente/Resuelta)
```

### Reglas de Negocio

| Regla | Descripción |
|---|---|
| **Consulta sin registro** | ¿Se permite enviar consultas sin iniciar sesión? (decisión de negocio) |
| **Tiempo de respuesta** | Máximo 48h hábiles para responder consultas |
| **Dermatólogos** | Son datos estáticos en la BD, gestionados por admin |
| **Citas** | La confirmación de cita es manual (el dermatólogo confirma disponibilidad) |
| **Tipos de especialidad** | Dermatóloga clínica, estética, pediátrica, especialista en acné, piel sensible |
| **Historial** | Las consultas y respuestas se mantienen visibles para el usuario |

---

## 9. Planes de Suscripción (Pro / Premium) ❌

### Implementación Backend
**No implementado.** No existen endpoints ni tablas para suscripciones.

| Endpoint | Estado |
|---|---|
| `GET /api/subscription-plans` | ❌ |
| `POST /api/create-checkout-session` | ❌ |
| `POST /api/cancel-subscription` | ❌ |
| `GET /api/subscription-status` | ❌ |

El campo `subscription_plan` en `users` existe en la BD pero no se actualiza automáticamente.

### Historia de Usuario
> Como usuaria, quiero suscribirme a un plan premium para acceder a beneficios exclusivos como descuentos, envío gratis y asesorías virtuales con expertos.

### Flujo de Interacción del Usuario

```
1. Usuario ve planes desde:
   - Botón "Plan Best ✨" en el hero del home
   - Sección de planes en perfil
2. Modal muestra 3 planes:
   | Básico (Gratis) | Pro (S/9.99/mes) | Premium (S/19.99/mes) |
   | Diagnóstico     | Todo Básico +     | Todo Pro +            |
   | Recomendaciones | Rutina personalizada | 1 asesoría virtual/mes |
   | Skin-Diary      | Consultas expertos | Envío gratis          |
   |                 | Descuentos         | Lanzamientos exclusivos |
3. Usuario selecciona "Elegir plan" (Pro o Premium)
4. Sistema redirige a checkout de Stripe
5. Usuario completa pago con tarjeta
6. Suscripción se activa inmediatamente
7. (Futuro) Factura mensual automática, cancelación en cualquier momento
```

### Reglas de Negocio

| Regla | Descripción |
|---|---|
| **Plan Básico** | Siempre gratuito, sin fecha de expiración |
| **Pro** | S/9.99/mes — facturación recurrente mensual |
| **Premium** | S/19.99/mes — facturación recurrente mensual |
| **Cancelación** | El usuario puede cancelar en cualquier momento. El acceso continúa hasta el final del período facturado |
| **Descuentos** | Los descuentos en productos son un beneficio del plan Pro (definir % después) |
| **Asesoría virtual** | 1 sesión por mes para Premium (vía videollamada) |
| **Upgrade/Downgrade** | Usuario puede cambiar de plan en cualquier momento (prorrateo) |
| **Período de prueba** | (Futuro) 7 días gratis para Pro/Premium |

### Beneficios por Plan

| Beneficio | Básico | Pro | Premium |
|---|---|---|---|
| Diagnóstico de piel | ✅ | ✅ | ✅ |
| Recomendaciones básicas | ✅ | ✅ | ✅ |
| Skin-Diary | ✅ | ✅ | ✅ |
| Rutina personalizada | — | ✅ | ✅ |
| Consultas con expertos | — | ✅ | ✅ |
| Descuentos en productos | — | ✅ (10%) | ✅ (20%) |
| Asesoría virtual mensual | — | — | ✅ |
| Envío gratis | — | — | ✅ (pedidos > S/30) |
| Acceso lanzamientos exclusivos | — | — | ✅ |

---

## 10. Formulario de Contacto ⚠️

### Implementación Backend
- `POST /api/contact` — Recibe y guarda el mensaje en tabla `contacts`
- **No envía email real** — Solo almacena en BD. Pendiente integración con SendGrid/Resend

### Historia de Usuario
> Como usuaria o visitante, quiero enviar un mensaje de contacto para hacer consultas generales, sugerencias o reportar problemas.

### Flujo de Interacción del Usuario

```
1. Usuario navega a "Contacto" desde footer o menú
2. Completa: Nombre, Email, Mensaje
3. Hace clic en "Enviar mensaje"
4. Sistema envía email de notificación al equipo de DermaMatch
5. Muestra confirmación en pantalla
6. (Futuro) Auto-respuesta por email confirmando recepción
```

### Reglas de Negocio

| Regla | Descripción |
|---|---|
| **Campos requeridos** | Nombre, Email, Mensaje (todos obligatorios) |
| **Validación de email** | Formato de email válido |
| **Respuesta** | El equipo responde manualmente al email del remitente |
| **Spam** | Protección con Netlify Forms reCAPTCHA o similar |

---

## 11. Reseñas de Productos ✅

### Implementación Backend
- `POST /api/products/:productId/reviews` — Crear reseña (una por usuario/producto)
- `GET /api/products/:productId/reviews` — Listar reseñas de un producto
- `PUT /api/products/:productId/reviews` — Actualizar reseña propia
- `DELETE /api/products/:productId/reviews` — Eliminar reseña propia
- ❌ `POST /api/product-reviews/:id/report` — No implementado

### Historia de Usuario
> Como usuaria, quiero leer reseñas de otros usuarios sobre un producto para tomar una decisión informada, y también quiero dejar mi propia reseña para ayudar a otras personas.

### Flujo de Interacción del Usuario

```
Leer reseñas:
1. Usuario ve detalle de producto
2. Sección de reseñas muestra: autor, estrellas, comentario, fecha
3. (Futuro) Ordenar por: más recientes, mejor rating, peor rating

Escribir reseña:
1. Usuario debe haber iniciado sesión y comprado el producto (verified purchase)
2. Selecciona: 1-5 estrellas + comentario opcional
3. Hace clic en "Enviar reseña"
4. Reseña se publica inmediatamente (o con moderación previa)
```

### Reglas de Negocio

| Regla | Descripción |
|---|---|
| **Una reseña por producto** | Un usuario solo puede dejar una reseña por producto |
| **Compra verificada** | La reseña muestra badge "Compra verificada" si el usuario compró el producto |
| **Moderación** | Admin puede ocultar reseñas inapropiadas (is_reported) |
| **Reportar** | Usuarios pueden reportar reseñas ofensivas |
| **Rating global** | El rating del producto es el promedio de todas sus reseñas |

---

## 12. Rutinas de la Comunidad ⚠️

### Implementación Backend
- `GET /api/community-routines` — Listar rutinas compartidas
- `POST /api/community-routines` — Compartir rutina
- `GET /api/community-routines/:id` — Detalle de rutina
- `DELETE /api/community-routines/:id` — Eliminar rutina propia
- ❌ `POST /api/community-routines/:id/like` — Likes no implementados

### Historia de Usuario
> Como usuaria, quiero ver rutinas que otras personas con mi tipo de piel han creado para inspirarme y descubrir nuevas combinaciones de productos.

### Flujo de Interacción del Usuario

```
1. Usuario navega a sección "Rutinas de la Comunidad" (desde perfil o menú)
2. Ve tarjetas de rutinas compartidas: usuario, tipo de piel, alergias, productos, likes
3. Puede dar "Me gusta" a las rutinas que le parecen útiles
4. (Futuro) Compartir su propia rutina generada
5. (Futuro) Filtrar por tipo de piel o presupuesto
```

### Reglas de Negocio

| Regla | Descripción |
|---|---|
| **Rutina propia** | Solo se puede compartir la rutina generada por el sistema, no una personalizada manualmente |
| **Anonimato** | Se muestra solo el nombre de usuario (sin email ni datos personales) |
| **Likes** | Un usuario puede dar like a múltiples rutinas |
| **Reportar** | Rutinas inapropiadas pueden ser reportadas |

---

## 13. Configuración de Rutina del Usuario ✅

### Implementación Backend
- Se almacena como campo `routine_config` (JSONB) dentro de `users`
- Se actualiza vía `PUT /api/profiles/:id` junto con otros datos del perfil
- No tiene endpoint separado

### Historia de Usuario
> Como usuaria, quiero configurar mis preferencias de presupuesto, marcas y alergias para que el sistema genere rutinas que realmente se ajusten a mis necesidades.

### Flujo de Interacción del Usuario

```
1. Usuario va a "Mi Perfil"
2. Sección "Configuración de Tu Rutina" con:
   a. Presupuesto: botones Económico/Medio/Premium/Sin límite
   b. Optimización: select con Precio bajo/Calidad/Balanceado
   c. Marcas preferidas: checkboxes con brands disponibles
   d. Alergias del perfil: muestra las detectadas en el diagnóstico (solo lectura)
   e. Alergias adicionales: checkboxes (parabenos, alcohol, sulfatos, etc.)
3. Cada cambio se guarda automáticamente
4. Configuración persiste entre sesiones
5. Al generar rutina, se usa esta configuración + perfil de piel
```

### Reglas de Negocio

| Regla | Descripción |
|---|---|
| **Guardado automático** | Cada cambio en la configuración se persiste inmediatamente (no hay botón "guardar") |
| **Fusión de alergias** | Las alergias del perfil (diagnóstico) + alergias adicionales (configuración) se fusionan para filtrar productos |
| **Configuración por defecto** | Sin límite de presupuesto, optimización balanceada, sin marcas ni alergias adicionales |

### Mapeo de Alergias Adicionales

| Alergia en UI | Etiqueta interna del producto |
|---|---|
| Parabenos | paraben-free |
| Metilisotiazolinona | mi-free |
| Aceites esenciales | fragrance-free |
| Alcohol | alcohol-free |
| Sulfatos | sulfate-free |
| Silicona | silicone-free |

---

## 14. Búsqueda y Filtrado de Productos ✅

### Implementación Backend
- Integrado en `GET /api/products` con parámetros: `search`, `type`, `category`, `budget`, `brand`, `eco`, `cruelty`, `minPrice`, `maxPrice`, `sortBy`, `order`, `page`, `limit`
- Búsqueda por LIKE en `name` y `brand` (no FTS)

### Historia de Usuario
> Como usuaria, quiero buscar productos por nombre, marca o ingrediente, y filtrar por tipo de piel, presupuesto, y características (eco, cruelty-free) para encontrar exactamente lo que necesito.

### Flujo de Interacción del Usuario

```
Búsqueda:
1. Usuario escribe en el campo de búsqueda en la página de productos
2. Presiona Enter
3. Resultados se actualizan en tiempo real mostrando productos que coinciden
4. Búsqueda por: nombre del producto, marca

Filtros:
1. Chips de tipo de piel: Normal, Seca, Grasa, Mixta, Sensible, Todos
2. Al hacer clic en un chip, se filtran los productos visibles
3. (Futuro) Filtros adicionales: rango de precio, categoría, eco, cruelty-free
```

### Reglas de Negocio

| Regla | Descripción |
|---|---|
| **Búsqueda parcial** | La búsqueda encuentra coincidencias parciales (ej: "cera" encuentra "CeraVe") |
| **Sin resultados** | Si no hay resultados, se muestra mensaje "No se encontraron productos" |
| **Filtro acumulativo** | Los filtros se pueden combinar (tipo de piel + búsqueda) |
| **Orden por defecto** | Los resultados se ordenan por rating descendente |

---

## 15. Panel de Administración ❌

### Implementación Backend
**No implementado.** No existen endpoints protegidos por rol admin.

### Historia de Usuario
> Como administradora de DermaMatch, quiero gestionar productos, usuarios, órdenes, consultas y reseñas desde un panel centralizado para mantener la plataforma actualizada y responder a las necesidades de las usuarias.

### Funcionalidades Administrativas

#### Gestión de Productos
- Agregar, editar, eliminar productos del catálogo
- Subir imágenes de productos
- Gestionar stock
- Activar/desactivar productos
- Actualizar precios

#### Gestión de Órdenes
- Ver todas las órdenes con filtros (estado, fecha, usuario)
- Actualizar estado de órdenes
- Procesar reembolsos
- Ver detalles de pago

#### Gestión de Consultas
- Ver consultas de usuarios pendientes
- Asignar a dermatólogo
- Responder consultas
- Marcar como resueltas

#### Gestión de Usuarios
- Ver listado de usuarios
- Ver perfil de cada usuario
- Gestionar suscripciones
- Suspender/eliminar cuentas

#### Moderación de Reseñas
- Ver reseñas reportadas
- Ocultar/mostrar reseñas
- Bloquear usuarios que infringen normas

#### Dashboard de Métricas
- Usuarios totales y activos
- Órdenes por día/semana/mes
- Ingresos totales
- Productos más vendidos
- Distribución de tipos de piel
- Tasa de conversión

### Reglas de Negocio (Admin)

| Regla | Descripción |
|---|---|
| **Acceso restringido** | Solo usuarios con rol "admin" pueden acceder al panel |
| **Auditoría** | Todas las acciones administrativas quedan registradas (log) |
| **Eliminación lógica** | Los productos se desactivan, no se eliminan de la BD (para mantener integridad de órdenes pasadas) |

---

## Matriz de Funcionalidades por Rol

| Funcionalidad | Visitante | Usuario | Premium | Admin |
|---|---|---|---|---|
| Ver landing page | ✅ | ✅ | ✅ | ✅ |
| Ver productos | ✅ | ✅ | ✅ | ✅ |
| Diagnóstico de piel | ✅ | ✅ | ✅ | ✅ |
| Ver perfil de piel | — | ✅ | ✅ | ✅ |
| Configurar rutina | — | ✅ | ✅ | ✅ |
| Generar rutina | — | ✅ | ✅ | ✅ |
| Agregar favoritos | — | ✅ | ✅ | ✅ |
| Skin Diary | — | ✅ | ✅ | ✅ |
| Enviar consulta | — | ✅ | ✅ | ✅ |
| Agendar cita | — | ✅ | ✅ | ✅ |
| Comprar productos | ✅ | ✅ | ✅ | ✅ |
| Escribir reseñas | — | ✅ | ✅ | ✅ |
| Suscripción Pro | — | ✅ | ✅ | — |
| Suscripción Premium | — | — | ✅ | — |
| Asesoría virtual | — | — | ✅ | — |
| Envío gratis | — | — | ✅ | — |
| Panel admin | — | — | — | ✅ |
| Gestionar productos | — | — | — | ✅ |
| Responder consultas | — | — | — | ✅ |

---

## Glosario de Términos de Negocio

| Término | Definición |
|---|---|
| **Skin Profile** | Perfil de piel del usuario resultante del diagnóstico (tipo, preocupaciones, alergias) |
| **Routine** | Conjunto de productos ordenados para uso diurno y nocturno |
| **Swapp** | Acción de cambiar un producto en la rutina por una alternativa |
| **Dupe** | Producto alternativo más económico que cumple función similar |
| **Score** | Puntaje de compatibilidad producto-usuario (0-100) |
| **Template** | Plantilla de categorías prioritarias por tipo de piel |
| **Yape/Plin** | Billeteras digitales peruanas para pagos móviles |
| **RLS** | Row Level Security — seguridad a nivel de fila en base de datos |
| **Checkout** | Proceso de finalización de compra |
| **Stripe** | Pasarela de pagos internacional (tarjetas) |
| **Mercado Pago** | Pasarela de pagos latinoamericana (soporta Yape, Plin, transferencias) |
