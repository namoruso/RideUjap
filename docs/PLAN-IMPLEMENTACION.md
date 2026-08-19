# RideUJAP — plan de implementación

Red de transporte colaborativo **cerrada** para la comunidad de la Universidad José Antonio Páez. Primera entrega: **frontend usable con datos mock**, responsive en cualquier dispositivo. Verificación institucional, chat real y pagos se pulen en fases posteriores.

**Rama de trabajo:** `feat/fase-1-frontend`  
**Paleta:** no cambiar. Tokens actuales `--ride-green` (`#0b6e4f`), `--ride-green-hover`, `--ride-green-light`, `--ride-green-border`. Dark mode ya definido en `src/assets/base.css`.  
**Package manager:** solo `pnpm`.  
**Commits:** conventional en español (`feat()`, `fix()`, `style()`, `refactor()`, `docs()`).

---

## Norte del producto

Conectar estudiantes, profesores y personal que comparten rutas hacia/desde el campus para viajar juntos: más barato que taxi, más puntual que el transporte público, menos autos en el estacionamiento, comunidad de confianza (compañeros UJAP, no desconocidos).

Flujo de la idea (referencia):

1. Registro y verificación (correo `@ujap.edu.ve` / carnet).
2. Publicación de rutas (origen, destino, hora, cupos, aporte).
3. Búsqueda y reserva (filtros → match → solicitud → el conductor acepta).
4. Coordinación (chat, punto de encuentro, pago).
5. Calificación mutua 1–5.

---

## Qué ya existe en `main`

| Capacidad | Estado | Notas |
|-----------|--------|--------|
| Shell, dark mode, nav móvil | Listo | `App.vue` |
| Home, listado, detalle, publicar, mis viajes | Listo | Rutas en `src/router/index.ts` |
| Login / registro / recuperar | Parcial | UI existe; depende de `localhost:3001` |
| Unirse / abandonar | Parcial | Join inmediato, no hay solicitud+aceptación |
| Tipos `Usuario` / `Viaje` | Parcial | Falta rol, facultad, tarifa, vehículo, calificación |
| Chat, pagos, estrellas | No | Fuera de la entrega 1 |

Hoy los stores (`auth`, `viajes`) llaman a `VITE_API_URL`. Si el backend no corre, el listado queda vacío. **Eso es el primer problema a resolver.**

---

## Fases

Cada fase cierra con pantallas usables. El backend real entra en la fase 5; hasta entonces hay un **adapter** (mock vs API) para no reescribir vistas.

### Fase 1 — Frontend MVP con mock (esta rama / entrega 1)

App navegable **sin servidor**. Pinia + `localStorage`, seed de viajes UJAP, auth local. Responsive mobile-first en todas las vistas.

**Criterio de done:** un compañero clona, corre `pnpm install && pnpm dev`, se registra, publica un viaje, se une a otro y lo ve en Mis viajes — sin API.

Cortes internos (un commit por corte):

| Corte | Commit sugerido | Alcance |
|-------|-----------------|--------|
| 1.1 Modelos | `feat(types): ampliar entidades del dominio` | Rol, facultad, tarifa, vehículo, solicitud |
| 1.2 Datos mock | `feat(store): capa mock con localStorage` | Seed; fallback si el API falla; auth local |
| 1.3 Home | `feat(ux): landing explicativa y flujo de navegación` | Landing en `/`, panel en `/inicio` |
| 1.4 Auth UI | `feat(auth): registro y login sin servidor` | Validar `@ujap.edu.ve` en cliente |
| 1.5 Viajes | `refactor(viajes): listado estable con mock` | Filtros / vacío / loading independientes de `:3001` |
| 1.6 Responsive | `style(ui): mobile-first en todas las vistas` | 360 / 768 / 1024; toques ≥ 44px |

**Fuera de fase 1 (a propósito):** carnet, correo real, chat, pago móvil, estrellas persistidas, geo real.

### Fase 2 — Flujo conductor / pasajero

Tarifa sugerida, vehículo, estados de viaje (`disponible` → `en curso` → `finalizado`). Solicitud de asiento que el conductor acepta o rechaza (dejar el join instantáneo).

### Fase 3 — Perfil y comunidad

Foto, facultad, rol (`conductor` \| `pasajero` \| `ambos`). Perfil público. UI de calificación 1–5 con comentarios mock.

### Fase 4 — Coordinación

Chat temporal mock, punto exacto de encuentro, selector visual de pago (efectivo / pago móvil / saldo).

### Fase 5 — Backend real

JWT, verificación de correo institucional, carnet, persistencia, chat y ratings reales. El frontend ya habla contra el adapter.

### Fase 6 — Pulido

Vitest de stores y componentes críticos, a11y, PWA opcional, performance.

---

## Responsive — contrato

| Viewport | Comportamiento |
|----------|----------------|
| &lt; 768px | Una columna, hamburguesa, cards apiladas, formularios full-width |
| ≥ 768px | Nav desktop, grid 2 columnas en listados, filtros en fila |
| ≥ 1024px | Contenido max ~960–1100px; detalle = principal + aside |

---

## Arquitectura de datos (fase 1)

Las vistas **solo** hablan con stores. Detrás, `src/services/` (mock ahora, HTTP después).

| Store | Hoy | En fase 1 |
|-------|-----|-----------|
| `auth` | `fetch /api/auth/*` | Login/registro local; token fake; persistir usuario |
| `viajes` | `fetch /api/viajes` | CRUD sobre array seed; unirse decrementa cupos |
| `data/ejemplos.ts` | Casi vacío | Seed: San Diego, Naguanagua, campus, Prebo, Valencia centro |
