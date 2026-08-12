let nombre: string = 'Nick'
let edad: number = 22
let esMayorDeEdad: boolean = edad >= 18
let listaDeNumeros: number[] = [1, 2, 3, 4, 5]
let listaDeStrings: string[] = ['A', 'B', 'C']
let listaDeBooleans: boolean[] = [true, false, true]
let listaDeObjetos: { nombre: string; edad: number }[] = [
  { nombre: 'A', edad: 20 },
  { nombre: 'B', edad: 21 },
  { nombre: 'C', edad: 22 },
]

console.log(
  nombre,
  edad,
  esMayorDeEdad,
  listaDeNumeros,
  listaDeStrings,
  listaDeBooleans,
  listaDeObjetos,
)

function obtenerNombre(nombre: string): string {
  return 'Hola, ' + nombre
}

console.log(obtenerNombre('Nick'))

function obtenerEdad(edad: number): number {
  return edad
}

console.log(obtenerEdad(22))
