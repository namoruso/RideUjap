# RideUJAP — Entrega laboratorio: CRUD + frontend + CORS

**Proyecto:** RideUJAP (carpooling UJAP)  
**Asignatura:** Electiva programación web  
**Tipo:** ejercicio práctico formativo (0%) — lista de cotejo  
**Criterio oficial:** la API REST propia reemplaza correctamente los datos simulados.

---

## 1. Check-in rápido

| Pregunta | Respuesta RideUJAP |
|---|---|
| ¿El servidor Express corre? | Sí. En `server/`: `pnpm run dev` (o `pnpm run server:dev` desde la raíz). |
| ¿Herramienta para probar endpoints? | Postman / Thunder Client / Insomnia. |
| ¿Puertos? | **Frontend (Vite):** `http://localhost:5173` · **API:** `http://localhost:3001` · Prefijo: `/api` |

Health check: `GET http://localhost:3001/api/health`

---

## 2. Variables de entorno (URL no “quemada”)

En el frontend (`.env`):

```env
VITE_API_URL=http://localhost:3001/api
```

En el código (Pinia `src/stores/viajes.ts`):

```ts
const API_URL = String(import.meta.env.VITE_API_URL || 'http://localhost:3001/api').trim()
const res = await fetch(`${API_URL}/viajes`)
```

**Ventaja:** en producción solo se cambia `.env`; no hay que buscar/reemplazar URLs en todo el código.

Ejemplo también en `.env.example` (sin secretos).

---

## 3. CORS

En `server/src/index.ts`:

```ts
import cors from 'cors'
app.use(cors()) // permite peticiones desde el origen del Vite (p. ej. :5173)
```

Así el navegador no bloquea `localhost:5173` → `localhost:3001`.

---

## 4. Las 5 rutas CRUD de la entidad `viajes`

| Verbo | Ruta | Operación | Auth |
|---|---|---|---|
| `GET` | `/api/viajes` | Read (todos) | público |
| `GET` | `/api/viajes/:id` | Read (uno) | público |
| `POST` | `/api/viajes` | Create | Bearer (conductor) |
| `PUT` | `/api/viajes/:id` | Update | Bearer (dueño del viaje) |
| `DELETE` | `/api/viajes/:id` | Delete | Bearer (dueño del viaje) |

> Extra del producto (no sustituyen el CRUD): `PATCH /api/viajes/:id/hora`, unirse/abandonar, pasajeros.

### Capas (MVC adaptado a API)

| Capa | En RideUJAP hoy |
|---|---|
| **Route** | Declaración en Express: `app.get/post/put/delete('/api/viajes…')` |
| **Controller** | Handlers async en `server/src/index.ts` (reciben `req`/`res`) |
| **Service / reglas** | Validaciones (cupos, dueño, perfil conductor) dentro de cada handler + middleware `auth` |
| **Model** | Prisma `Viaje` / `Usuario` (`server/prisma/schema.prisma`) → PostgreSQL |

---

## 5. Cómo probar el CRUD en Postman

Base: `http://localhost:3001/api`  
Header de auth (Create / Update / Delete): `Authorization: Bearer <token>` (login JWT o sesión Clerk sync).

### 1) Read todos
`GET /viajes` → 200 + arreglo JSON.

### 2) Read uno
`GET /viajes/1` → 200 + un viaje (o 404).

### 3) Create
`POST /viajes`  
Body JSON ejemplo:

```json
{
  "origen": "San Diego",
  "destino": "Campus UJAP",
  "puntoEncuentro": "Plaza Bolívar",
  "fecha": "2026-09-24",
  "hora": "07:15",
  "cuposDisponibles": 3,
  "descripcionVehiculo": "Toyota Corolla gris"
}
```

→ 201 + viaje creado.

### 4) Update
`PUT /viajes/1`  
Body con los mismos campos (valores editados).  
→ 200 + viaje actualizado.

### 5) Delete
`DELETE /viajes/1` → 200 `{ "message": "Viaje eliminado correctamente" }`.

---

## 6. Frontend sin “datos de mentira”

- El listado carga con `fetch(\`${import.meta.env.VITE_API_URL}/viajes\`)`.
- Publicar, unirse, abandonar, eliminar y **actualizar (PUT)** hablan a la API propia.
- Si el API está caído, el store puede mostrar un aviso/demo de respaldo; **con el servidor arriba**, `usandoDemo === false` y la UI refleja PostgreSQL vía Prisma.

Vistas conectadas: `/viajes`, `/viajes/:id`, `/publicar`, `/mis-viajes`.

---

## 7. Lista de cotejo (cómo se revisa hoy)

| # | Criterio | Cumple |
|---|---|---|
| 1 | Las 5 operaciones CRUD funcionan desde Postman | Sí (`GET` lista, `GET` uno, `POST`, `PUT`, `DELETE`) |
| 2 | El frontend ya no depende de mocks: los datos vienen de la API propia | Sí (vía `VITE_API_URL`) |
| 3 | CORS configurado; sin errores de origen cruzado en consola | Sí (`app.use(cors())`) |

---

## 8. Cómo levantar para la demo en clase

```bash
# Terminal A — base de datos (si usan Docker)
pnpm run docker:db

# Terminal B — API
pnpm run server:setup   # primera vez: generate + push + seed
pnpm run server:dev

# Terminal C — Vue
pnpm install
pnpm run dev
```

Abrir `http://localhost:5173/viajes` y confirmar en Network que las peticiones van a `http://localhost:3001/api/viajes`.

---

**Archivo único de entrega para este laboratorio.**  
Equipo RideUJAP.
