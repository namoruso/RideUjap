# RideUJAP — Backend

API REST del proyecto RideUJAP, construida con **Node.js + Express + TypeScript**, usando **Prisma ORM con SQLite** como capa de persistencia.

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
| `DATABASE_URL` | Ruta al archivo SQLite de Prisma         | `file:./rideujap.db`            |

## Ejecución en desarrollo

```bash
pnpm dev
```

El servidor quedará activo en `http://localhost:3001`.

## Base de datos

La BD es SQLite gestionada por Prisma. Después de clonar el repo, ejecuta:

```bash
npx prisma db push
```

Esto crea/actualiza el archivo `rideujap.db` según el schema definido en `prisma/schema.prisma`.

---

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
