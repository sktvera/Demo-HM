import { asset } from 'paths'

//  Brands
export const brands = ['crown', 'still', 'reflex'] as const
export type Brands = typeof brands[number]

export const brandsNaming: { [Key in Brands]: string } = {
  crown: 'Crown',
  still: 'Still',
  reflex: 'Reflex',
}

//  Forklifts
export const forklifts = [
  'mcecmpa',
  'combustion',
  'manual-stapelaar',
  'electric-stapelaar',
  'electric-pallettruck',
  'manual-pallettruck',
  // Agregados recientemente
  'scissor-lift',
  'ride-on-pallettruck',
  'earthmoving-equipment',
  'crane-equipment',
  '',
  // Opcionales:
  'electric-lp',
  'narrow-aisle',
  // 'counter-balanced',
] as const

export type Forklifts = typeof forklifts[number]

export const forkliftsNaming: { [Key in Forklifts]: string } = {
  // Montacargas contrabalanceada eléctrica y combustión

  mcecmpa:
    'MONTACARGAS CONTRABALANCEADA ELÉCTRICA COMBUSTIÓN Y MONTACARGA PASILLO ANGOSTO',

  combustion: 'Montacargas contrabalanceada eléctrica y combustión',
  'manual-stapelaar': 'Apilador elevador manual',
  'electric-stapelaar': 'Apilador elevador eléctrico',
  'electric-pallettruck': 'Estibador eléctrico operador caminando',
  'manual-pallettruck': 'Estibador manual',
  // Agregados recientemente
  'scissor-lift': 'Plataforma elevadora tipo tijera',

  'ride-on-pallettruck': 'Estibador eléctrico hombre a bordo',
  'earthmoving-equipment':
    'Equipos de movimiento de tierra según norma OSHA 29 CFR 1926.602',
  'crane-equipment': 'Equipos de izaje, puente grúa',
  'narrow-aisle': 'Montacargas de pasillo angosto',
  '': '',

  // Opcionales:
  // 'counter-balanced': 'Montacargas eléctrica contrabalanceada',
  'electric-lp': 'Estibador eléctrico operador caminando',
}

//  Instructors
export interface Instructor {
  name: string
  signature: string
}

export const instructors: Instructor[] = [
  {
    name: 'Cesar Augusto Castaño Ramirez',
    signature: asset('/images/cesar-augusto-castaño-ramirez.png'),
  },
  {
    name: 'Esteban Muelas Motato',
    signature: asset('/images/esteban-muelas.png'),
  },
  {
    name: 'Giovanni Antonio Guerrero',
    signature: asset('/images/giovanni-antonio-guerrero.png'),
  },
  {
    name: 'Andrés Felipe Castrillón Díaz',
    signature: asset('/images/andres-felipe-castrillon.png'),
  },
  {
    name: 'León Darío Pineda Ruiz',
    signature: asset('/images/leon-dario-pineda.png'),
  },
  {
    name: 'Jaime Alexander Villa Godoy',
    signature: asset('/images/jaime-alexander-villa.png'),
  },
  {
    name: 'María Camila Villareal',
    signature: asset('/images/maria-camila-villareal.png'),
  },
  {
    name: 'José Aldemar Carrillo Murillo',
    signature: asset('/images/jose-aldemar-carrillo.png'),
  },
  {
    name: 'Jonathan Moreno Peña',
    signature: asset('/images/jonathan-moreno.png'),
  },
  {
    name: 'Carlos Andrés Roca Sánchez',
    signature: asset('/images/carlos-andres-roca.jpeg'),
  },
  /* PENDIENTE DE RECIBIR IMAGEN
  {
    name: 'Oscar Vélez',
    signature: asset('/images/oscar-velez.png'),
  },
  */

  // Instructores anteriores (comentados):
  // {
  //   name: 'Andres Arroyave Eusse',
  //   signature: asset('/images/signature-andres.png'),
  // },
  // {
  //   name: 'Hernando Montoya',
  //   signature: asset('/images/signature-hernando.png'),
  // },
  // {
  //   name: 'Yonis Alfredo Martinez',
  //   signature: asset('/images/signature-yonis.jpg'),
  // },
]
