# RideUJAP — arquitectura UX y flujo

La app tiene **dos capas**: marketing (entender) y producto (hacer). Nadie aterriza directo en un listado sin saber qué es esto.

## Principios

1. **Explicar antes de pedir.** La primera pantalla cuenta el problema (transporte caro, impuntual, ir solo) y la promesa (viajar con gente de la UJAP).
2. **Una decisión por pantalla.** Registrarse, buscar asiento o publicar ruta. No mezclar los tres en el hero.
3. **Confianza primero.** Comunidad cerrada, correo institucional, nunca “sube al carro de un desconocido”.
4. **Mobile-first.** Pulgar: CTAs de 44px+, una columna, menú hamburguesa.
5. **Paleta fija.** Solo `--ride-green` y derivados. Sin colores nuevos de marca.
6. **Movimiento con propósito.** Entradas suaves (fade + 12px). Cero loops. Respetar `prefers-reduced-motion`.
7. **Microcopy humano.** Frases de campus (“el 7:15 de San Diego”), no jerga de producto.

## Mapa de pantallas

```
Invitado                         Sesión iniciada
────────                         ──────────────
/  Landing                       /  Landing (sigue accesible)
   ├ sección Cómo funciona       /inicio  Panel
   ├ Beneficios                  /viajes  Buscar
   └ CTA registro / ver viajes   /viajes/:id
/viajes  Explorar (solo lectura) /publicar
/login                           /mis-viajes
/registro
/recuperar
/about   Contexto académico
```

## Flujo feliz

1. **Aterriza** en `/` → entiende qué es, cómo funciona, por qué es seguro.
2. **Explora** `/viajes` sin cuenta (curiosidad, prueba social).
3. **Al unirse o publicar** → `/login` (mensaje: “Para reservar un asiento entra con tu correo UJAP”).
4. Tras login/registro → **`/inicio`** (panel), no de vuelta a la landing.
5. Conductor publica → listado. Pasajero abre detalle → unirse.
6. **Salir** → landing otra vez (cierre limpio).

## Voz y mensajes

| Situación | Evitar | Preferir |
|-----------|--------|----------|
| Hero | “Gestiona tus viajes” | “Llega al campus con compañeros, no con desconocidos” |
| Vacío | “No hay datos” | “Aún no hay rutas a esta hora. Publica la tuya o prueba otro filtro.” |
| Error API | “Error 500” | “No pudimos cargar los viajes. Reintenta en un momento.” |
| Unirse | “OK” | “Asiento reservado. Coordina el punto de encuentro con el conductor.” |
| Logout | — | Vuelve a la landing, no a un panel vacío |

## Motion

- Duración: 200–500 ms, easing `cubic-bezier(0.22, 1, 0.36, 1)`.
- Hero y bloques: `fade-up` al cargar, stagger 60–80 ms.
- Hover en cards: 2px translateY + borde, no sombras pesadas.
- Sin animar layout que empuje contenido (evita CLS).
