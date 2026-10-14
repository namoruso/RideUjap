/** Fecha local (no UTC) en formato YYYY-MM-DD. */
export function hoyIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** True si fecha (YYYY-MM-DD) + hora (HH:MM) todavía no han pasado en la hora local del navegador. */
export function salidaEsFutura(fecha: string, hora: string): boolean {
  const salida = new Date(`${fecha}T${hora}:00`)
  return !Number.isNaN(salida.getTime()) && salida.getTime() > Date.now()
}
