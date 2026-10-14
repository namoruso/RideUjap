# Respuesta corta a Jonathan Tellez (LendIt UJAP)

Jonathan, **discrepo** en que el ciclo de préstamo de LendIt necesite WebSockets.

Solicitar, aceptar, reservar o avisar plazos son **cambios de estado que el cliente solo recibe** → eso es el caso de uso clásico de **SSE**. Confirmar recogida o devolución es un **POST/PATCH**, no un stream continuo del navegador. WebSockets tendrían sentido si hubiera chat o ubicación en vivo; para un tablero de estados, **REST + SSE** es más simple y suficiente.
