# RideUJAP — Backend

API REST del proyecto RideUJAP, construida con **Node.js + Express + TypeScript**, usando **Prisma ORM con PostgreSQL** (Docker local o Supabase) y **MongoDB** para las notificaciones.

## Requisitos

- Node.js v18+
- pnpm (o npm)

## Instalación

```bash
pnpm install
```

## Configuración

Copia `.env.example` a `.env` y ajusta los valores:

```bash
cp .env.example .env
```

Variables requeridas:

| Variable       | Descripción                              | Ejemplo                          |
|----------------|------------------------------------------|----------------------------------|
| `PORT`         | Puerto del servidor                      | `3001`                           |
| `JWT_SECRET`   | Clave secreta para firmar JWT            | `mi-clave-super-secreta`         |
| `DATABASE_URL` | PostgreSQL (con Supabase: pooler, puerto 6543, `?pgbouncer=true`) | `postgresql://...` |
| `DIRECT_URL`   | PostgreSQL directo (puerto 5432), para `db push` / migraciones | igual a `DATABASE_URL` en local |
| `MONGODB_URI`  | MongoDB Atlas (opcional). Vacío = sin notificaciones | `mongodb+srv://...` |
| `MONGODB_DB`   | Nombre de la base Mongo                  | `rideujap`                       |

## Ejecución en desarrollo

```bash
pnpm dev
```

El servidor quedará activo en `http://localhost:3001`.

## Base de datos

**PostgreSQL** (usuarios, viajes, pasajeros) gestionado por Prisma. En local: `pnpm docker:db` desde la raíz.
Para **Supabase**: crea el proyecto, copia las cadenas de *Connect → ORMs → Prisma* a `DATABASE_URL` (pooler) y `DIRECT_URL` (directa) y ejecuta:

```bash
pnpm db:setup   # prisma generate + db push + seed
```

**MongoDB** (colección `notificaciones`, índice `{idUsuario, creadoEn}` y TTL de 90 días): se crea sola al arrancar si `MONGODB_URI` está definida.

---

## Notificaciones (`/api/notificaciones`, requieren auth)

| Método | Ruta                  | Descripción                                             |
|--------|-----------------------|---------------------------------------------------------|
| GET    | `/`                   | Lista paginada (`?limite=20&antes=<_id>`) + `noLeidas`  |
| PATCH  | `/:id/leida`          | Marca una como leída                                    |
| PATCH  | `/leidas`             | Marca todas como leídas                                 |
| GET    | `/stream`             | SSE en vivo (consumir con `fetch` + `Authorization`)    |

Se generan al unirse/abandonar un viaje (conductor) y al editar, cambiar la hora o eliminar un viaje (pasajeros).

## Pruebas

```bash
pnpm test                # unitarias (validador de viajes), sin base de datos
pnpm test:integration    # API real contra Postgres local (pnpm docker:db); crea y borra sus datos
MONGODB_TEST_URI=mongodb://localhost:27018 pnpm test:integration   # incluye notificaciones/SSE
```

## Endpoints

### Autenticación (`/api/auth`)

| Método | Ruta                                | Auth | Descripción                          |
|--------|-------------------------------------|------|--------------------------------------|
| POST   | `/api/auth/registro`                | No   | Registrar nuevo usuario              |
| POST   | `/api/auth/login`                   | No   | Iniciar sesión, devuelve JWT         |
| POST   | `/api/auth/recuperar`               | No   | Solicitar código de recuperación     |
| POST   | `/api/auth/verificar-codigo`        | No   | Verificar código, devuelve token tmp |
| POST   | `/api/auth/restablecer-contrasena`  | No   | Cambiar contraseña con token tmp     |

### Viajes (`/api/viajes`)

| Método | Ruta                            | Auth      | Descripción                                     |
|--------|---------------------------------|-----------|-------------------------------------------------|
| GET    | `/api/viajes`                   | No        | Listar viajes disponibles (soporta filtros por `origen` y `destino`)  |
| GET    | `/api/viajes/:id`               | No        | Ver detalle de un viaje                         |
| POST   | `/api/viajes`                   | Sí        | Publicar nuevo viaje (solo conductores)         |
| DELETE | `/api/viajes/:id`               | Sí        | Eliminar viaje (solo el conductor creador)       |
| PATCH  | `/api/viajes/:id/hora`          | Sí        | Actualizar hora del viaje (solo el conductor)    |
| GET    | `/api/viajes/conductor/:id`     | Sí        | Listar todos los viajes de un conductor         |
| POST   | `/api/viajes/:id/unirse`        | Sí        | Unirse a un viaje como pasajero                 |
| DELETE | `/api/viajes/:id/unirse`        | Sí        | Abandonar un viaje como pasajero                |
| GET    | `/api/viajes/:id/pasajeros`     | Sí        | Ver lista de pasajeros (solo el conductor)       |

### Usuarios (`/api/usuarios`)

| Método | Ruta                | Auth | Descripción                   |
|--------|---------------------|------|-------------------------------|
| GET    | `/api/usuarios/:id` | No   | Ver perfil público de usuario |

---

## Arquitectura

```
server/
├── prisma/
│   ├── schema.prisma    # Modelos: Usuario, Viaje, PasajeroViaje
│   └── rideujap.db      # Archivo SQLite (generado por Prisma)
└── src/
    ├── db.ts            # Singleton de PrismaClient
    ├── index.ts         # Configuración de Express + todas las rutas de viajes/usuarios
    ├── types.ts         # JwtPayload, JwtResetPayload
    ├── email.ts         # Envío de correos de recuperación
    ├── middleware/
    │   └── auth.ts      # Middleware verificarToken (JWT)
    └── routes/
        └── auth.ts      # Rutas de autenticación
```
