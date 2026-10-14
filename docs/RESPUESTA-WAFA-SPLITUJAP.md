# Respuesta corta a Wafa Alhamra (SplitUJAP)

Wafa, **no estoy de acuerdo** con que sincronizar gastos en SplitUJAP exija WebSockets.

Agregar un ticket o marcar un pago es una **acción puntual**: va por HTTP. Lo que los demás necesitan es **enterarse del nuevo saldo**, y eso es **unidireccional** → con **SSE** (o un refetch) alcanza. WebSockets aportan cuando hay ida y vuelta continua (p. ej. chat); aquí no. Evitar pagos duplicados se resuelve con **reglas e idempotencia en el servidor**, no con el tipo de conexión.
