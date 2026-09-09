/** Normalize place text for consistent zone / filter matching (accents, case, spaces). */
export function normalizarLugar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Known campus / Valencia-area aliases so chips and free text stay aligned. */
const ALIAS_POR_CLAVE: Record<string, string[]> = {
  'san diego': ['san diego', 'el morro'],
  naguanagua: ['naguanagua'],
  'valencia centro': ['valencia centro', 'valencia', 'casco central'],
  prebo: ['prebo'],
  'el trigal': ['el trigal', 'trigal'],
  'campus ujap': [
    'campus ujap',
    'campus',
    'ujap',
    'entrada ujap',
    'universidad jose antonio paez',
    'univ jose antonio paez',
  ],
  'los guayos': ['los guayos', 'guayos'],
}

function variantesConsulta(query: string): string[] {
  const q = normalizarLugar(query)
  if (!q) return []

  const out = new Set<string>([q])
  const exact = ALIAS_POR_CLAVE[q]
  if (exact) exact.forEach((a) => out.add(a))

  for (const [clave, aliases] of Object.entries(ALIAS_POR_CLAVE)) {
    if (q.includes(clave) || clave.includes(q) || aliases.some((a) => a === q || q.includes(a))) {
      out.add(clave)
      aliases.forEach((a) => out.add(a))
    }
  }

  return [...out]
}

/** True if `haystack` (any place field blob) matches the user/chip query. */
export function lugarCoincide(haystack: string, query: string): boolean {
  const texto = normalizarLugar(haystack)
  if (!query.trim()) return true
  if (!texto) return false
  return variantesConsulta(query).some((v) => texto.includes(v))
}

export function blobLugaresViaje(viaje: {
  origen: string
  destino: string
  puntoEncuentro?: string | null
}): string {
  return [viaje.origen, viaje.destino, viaje.puntoEncuentro ?? ''].filter(Boolean).join(' ')
}
