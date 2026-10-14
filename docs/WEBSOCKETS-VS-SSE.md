# WebSockets vs Server-Sent Events en RideUJAP

**Proyecto:** RideUJAP (carpooling institucional UJAP)  
**Fecha:** 2026-09-16

## Elección para nuestro proyecto

En **RideUJAP** usaría **WebSockets**, sobre todo para la funcionalidad de **chat de coordinación entre conductor y pasajero** (y, en la misma conexión, el flujo de **validación de abordaje** en el punto de encuentro).

Hoy el producto ya contempla unirse a un viaje, ver pasajeros y gestionar la ruta; el plan de implementación deja el chat real para una fase posterior. Esa pieza no es un “feed” de solo lectura: el conductor escribe, el pasajero responde, ambos confirman punto de encuentro y, en abordaje, pueden intercambiar confirmaciones (por ejemplo código OTP o “ya estoy en la garita”). Eso es **comunicación en dos direcciones** y casi en tiempo real. Con WebSockets el cliente abre un canal persistente, envía y recibe mensajes sin inventar un ciclo de `POST` + `GET`/`SSE` separados.

**¿Por qué no SSE aquí?** Server-Sent Events son excelentes cuando el servidor **empuja** actualizaciones y el cliente solo **escucha** (un solo sentido: servidor → navegador). Encajarían bien, por ejemplo, para notificar “alguien se unió a tu viaje” o “el viaje fue cancelado” en una lista de Mis viajes. Pero el chat y la confirmación de abordaje **necesitan que el cliente también hable** de forma continua; forzar eso con SSE implicaría HTTP aparte para cada mensaje saliente y perderíamos el modelo natural de conversación bidireccional que WebSockets ya resuelven.

En resumen: **WebSockets para chat + coordinación/abordaje (dos direcciones)**; SSE quedaría como opción futura solo para **notificaciones unidireccionales** de estado del viaje, si quisiéramos no abrir un socket para eventos tan simples.

## Respuesta a un compañero (otro equipo)

Respecto a la propuesta del equipo **ParkUJAP** de usar **solo Server-Sent Events** para avisar en vivo los cupos de estacionamiento: **estoy de acuerdo** en que SSE es la tecnología adecuada **para esa funcionalidad concreta**. Un tablero de “puestos libres / ocupados” es típicamente **servidor → cliente**: el backend detecta el cambio y empuja el nuevo conteo; el usuario no necesita un canal de ida y vuelta solo para mirar disponibilidad. Usar WebSockets ahí añadiría complejidad (conexión full-duplex, heartbeats, más estado en servidor) sin un beneficio claro si no hay chat ni comandos en tiempo real sobre el mismo canal.

Dicho eso, **discrepo** si esa misma decisión se generaliza a “SSE para todo el campus”. En RideUJAP (y en apps tipo LendIt/Split con negociación entre dos usuarios), en cuanto aparece **diálogo o confirmación mutua**, WebSockets (o un híbrido: SSE para avisos + REST para acciones) encaja mejor que insistir en SSE puro. La regla técnica es simple: **¿el cliente solo recibe, o también tiene que enviar de forma continua?** Solo recibir → SSE; ida y vuelta en vivo → WebSockets.
