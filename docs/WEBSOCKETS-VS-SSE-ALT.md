# Alternativa de foro: SSE en RideUJAP (otra mirada)

**Proyecto:** RideUJAP  
**Nota:** Esta es una segunda versión de la respuesta, con otra funcionalidad y otro enfoque, para no repetir el argumento del chat con WebSockets.

---

Si tuviera que priorizar **una** tecnología de push para lo que RideUJAP ya opera hoy (publicar ruta, unirse, ver cupos y lista de pasajeros), me quedaría con **Server-Sent Events (SSE)** para la función de **actualizar en vivo el panel del conductor cuando cambia el cupo o la lista de unidos**.

El escenario es concreto: el conductor tiene abierta “Mis viajes” o el detalle de su ruta. Un compañero con correo `@ujap.edu.ve` se une (o abandona) desde otra sesión. El servidor ya conoce ese hecho al persistir la unión; lo que falta es **avisar al navegador del conductor** sin obligarlo a recargar. Ahí el flujo es casi siempre **unidireccional**: el backend emite un evento (`pasajero_unido`, `cupos_disponibles`, `viaje_lleno`) y el cliente solo lo consume para refrescar la UI. El pasajero no necesita un canal duplex con el conductor solo por haberse unido; la acción de unirse ya viajó por un `POST` REST normal.

SSE encaja porque abre un stream HTTP durable, el servidor empuja texto tipado y el navegador reacciona. No mantengo estado full-duplex ni protocolo de frames como en WebSockets. Para un MVP académico de carpooling, eso baja complejidad operativa (proxies, balanceo, reconexión) sin sacrificar la sensación de “acabo de ver que se ocupó un asiento”.

¿Dónde no usaría SSE como primera carta? En un **chat** o en **compartir ubicación segundo a segundo** camino al portón: ahí sí hace falta que el cliente **envíe** con frecuencia y el servidor **reparta** a otro cliente. Eso es bidireccional y empuja hacia WebSockets (o WebRTC, fuera de alcance). Pero la pregunta pide una funcionalidad específica: la mía es **sincronizar cupos/pasajeros en el panel del conductor**, y para eso **solo recibir actualizaciones** basta.

## Comentario a otro equipo

Al compañero de **SplitUJAP** que plantea **WebSockets** para que todos vean al instante cuando alguien marca un gasto como “pagado”: **no estoy del todo de acuerdo** para ese caso. Marcar un pago es un comando puntual (un request), y el resto del grupo solo necesita enterarse del nuevo estado del split. Eso es el mismo patrón que nuestros cupos: **escritura por HTTP + lectura en vivo por SSE** (o incluso polling corto). Reservaría WebSockets para cuando SplitUJAP agregue discusión en hilo o edición colaborativa concurrente del mismo ítem; si el evento es “el estado cambió, míralo”, SSE suele ser suficiente y más simple de operar detrás del mismo API Express/Nest que ya exponen.
