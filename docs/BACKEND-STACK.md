# Backend stack — Docker, PostgreSQL, Clerk, Google Maps

Orden de trabajo (no saltar pasos):

1. PostgreSQL + API en Docker (este doc, sección A)
2. Frontend conectado (`pnpm dev` + `VITE_API_URL`)
3. Clerk (Allowlist `@ujap.edu.ve`)
4. Google Maps (origen / destino)

JWT local sigue funcionando sin Clerk ni Maps. Así Avance 2 no depende de keys externas.

---

## A. Docker + PostgreSQL

### Arranque

```bash
# Solo DB (recomendado mientras desarrollas la API con pnpm en el host)
docker compose up -d db

# API + DB
docker compose up -d --build
```

### API en el host (hot reload)

```bash
docker compose up -d db
cd server
cp .env.example .env   # si aún no tienes .env
pnpm install
pnpm run db:setup
pnpm run dev
```

Health: `http://localhost:3001/api/health`

Usuario seed: `prueba@ujap.edu.ve` / `Ujap2026!`

### Credenciales Postgres (compose)

| Variable | Valor |
|----------|--------|
| user | `rideujap` |
| password | `rideujap` |
| db | `rideujap` |
| host (desde host) | `localhost:5433` (mapeado; evita choque con Postgres local) |
| host (desde container `api`) | `db:5432` |

`DATABASE_URL=postgresql://rideujap:rideujap@localhost:5433/rideujap?schema=public`

---

## B. Clerk (`@ujap.edu.ve`) — estrategia gratis (sin Pro)

La **Allowlist** del Dashboard es Pro. No la uses. En su lugar:

1. Access mode: **Open**
2. Email: require + **Verify at sign-up** (código OTP) — ya lo tienes
3. Desactiva OAuth social (Google, etc.)
4. Keys en `.env` / `server/.env`
5. El backend (`POST /api/auth/clerk/sync`) rechaza correos que no sean `@ujap.edu.ve`
6. El frontend hace **signOut** si el sync falla

Así la verificación de identidad la hace Clerk; la exclusividad institucional la hace RideUJAP.

---

## C. Google Maps (interactivo) + prettymaps (bonito / estático)

Son **dos herramientas distintas**:

| | Google Maps JS | [prettymaps](https://github.com/marceloprates/prettymaps) |
|--|----------------|----------------------------------------------------------|
| Para qué | Clic origen/destino, markers, polyline en la app Vue | Dibujar mapas artísticos desde OpenStreetMap (Python) |
| Runtime | Navegador (`VITE_GOOGLE_MAPS_API_KEY`) | Script Python / Colab / Streamlit, genera PNG/SVG |
| En RideUJAP | `MapaTrayecto.vue` (Publicar + Detalle) | Hero/landing, posters, assets exportados |

### C1. Obtener la API key de Google Maps

1. Entra a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea o elige un proyecto (ej. `rideujap`).
3. **APIs & Services → Library** → habilita:
   - **Maps JavaScript API** (obligatoria)
   - **Places API** (opcional, autocompletado de direcciones)
   - **Directions API** (opcional, rutas alternativas más adelante)
4. **APIs & Services → Credentials → Create credentials → API key**.
5. Restringe la key:
   - Application restrictions → **HTTP referrers**
   - Añade: `http://localhost:5173/*` y tu dominio de deploy si tienes
   - API restrictions → solo las APIs de arriba
6. En la **raíz** del repo (`.env`):

```bash
VITE_GOOGLE_MAPS_API_KEY=AIza...
```

7. Reinicia Vite (`pnpm dev`). Sin reiniciar, Vite no lee el `.env`.

En **Publicar viaje** verás el mapa (clics A/B). En **Detalle**, si el viaje tiene coordenadas, se dibuja el trayecto.

### C2. prettymaps (opcional, para estética)

[prettymaps](https://github.com/marceloprates/prettymaps) **no sustituye** Google Maps en el formulario: genera figuras bonitas (OSM + matplotlib). Uso recomendado en RideUJAP:

1. Generar offline un mapa de San Diego / Valencia / campus UJAP.
2. Exportar PNG/SVG a `src/assets/maps/` o `public/`.
3. Usarlo en la landing / empty states (marca visual Carabobo).

Ejemplo rápido (Python, fuera del contenedor Node):

```bash
pip install prettymaps
python -c "import prettymaps; prettymaps.plot('Universidad José Antonio Páez, San Diego, Carabobo, Venezuela', radius=1200)"
```

O en Colab / `streamlit run app.py` según el [README del repo](https://github.com/marceloprates/prettymaps).

Licencia AGPL-3.0: si lo integras en un servicio que genera mapas al vuelo, hay obligaciones de open-source; para **assets estáticos** pre-generados en el frontend suele ser el camino más simple en un proyecto de clase.

**Orden práctico:** primero Google Maps (flujo producto) → después un asset prettymaps para la landing si quieres el look artístico.

---

## D. Checklist Avance 2

- [ ] `GET /api/viajes` y `GET /api/viajes/:id` con loading/error en la UI
- [ ] Navegación lista → detalle sin recarga (`/viajes/:id`)
- [ ] Commits del equipo visibles en GitHub
- [ ] (Bonus) Docker DB arriba + health OK
