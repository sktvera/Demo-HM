import { asset } from 'paths'

export interface Course {
  slug: string
  eyebrow: string
  title: string
  shortTitle: string
  price: string
  duration: string
  audience: string
  description: string
  image: string
  imagePosition?: string
  featured?: boolean
  active?: boolean
  benefits: string[]
  requirements: string[]
  includes: string[]
}

export const courses: Course[] = [
  {
    slug: 'recertificacion-montacargas',
    eyebrow: 'Actualización de competencias',
    title: 'Re-Certificación en operación segura de montacargas',
    shortTitle: 'Re-Certificación',
    price: '$ 362.000',
    duration: '4 horas',
    audience: 'Para operadores con experiencia y certificado por actualizar',
    description:
      'Actualice sus competencias y aptitudes laborales como operador de montacarga mediante una jornada teórico-práctica.',
    image: asset('/images/course-recertification-2026.jpg'),
    imagePosition: 'center',
    benefits: [
      'Nivelación de conocimientos en teoría y práctica.',
      'Evaluación de competencias laborales.',
      'Docentes expertos y altamente certificados.',
      'Certificado válido por 1 año.',
    ],
    requirements: [
      'Contar con mínimo 1 año de experiencia como montacarguista.',
      'Tener experiencia en el equipo a re-certificar: pasillo angosto o contrabalanceada.',
      'Acreditar experiencia laboral y conocimiento previo para aprobar el curso.',
    ],
    includes: [
      'Actualización normativa y de operación segura.',
      'Evaluación teórica.',
      'Evaluación práctica en el equipo seleccionado.',
      'Certificado al aprobar el proceso.',
    ],
  },
  {
    slug: 'curso-montacarguista-desde-cero',
    eyebrow: 'Formación inicial',
    title: 'Conviértase en montacarguista',
    shortTitle: 'Montacarguista desde cero',
    price: '$ 1.200.000',
    duration: '16 horas',
    audience: 'Para personas sin experiencia en equipos logísticos',
    description:
      'Prepárese desde cero para operar un equipo logístico y conozca los fundamentos del flujo seguro de mercancías.',
    image: asset('/images/course-beginner-2026.jpg'),
    imagePosition: 'center',
    featured: true,
    benefits: [
      'Formación desde cero, sin experiencia previa.',
      'Introducción al flujo y manejo de mercancías.',
      'Práctica de conducción y operación segura.',
      'Acompañamiento de instructores especializados.',
    ],
    requirements: [
      'No requiere experiencia previa como montacarguista.',
      'Disposición para completar los módulos teóricos y prácticos.',
      'Cumplir las indicaciones de seguridad durante las prácticas.',
    ],
    includes: [
      'Fundamentos del equipo y sus componentes.',
      'Inspección preoperacional.',
      'Principios de estabilidad y manejo de carga.',
      'Práctica guiada de operación.',
    ],
  },
  {
    slug: 'certificacion-operacion-segura',
    eyebrow: 'Validación de competencias',
    title: 'Certificación en operación segura de montacarga',
    shortTitle: 'Certificación',
    price: '$ 412.000',
    duration: '8 horas',
    audience: 'Para operadores con mínimo 1 año de experiencia',
    description:
      'Refuerce sus conocimientos y demuestre sus competencias como operador mediante evaluación teórica y práctica.',
    image: asset('/images/course-certification-2026.jpg'),
    imagePosition: 'center',
    benefits: [
      'Refuerzo de conocimientos de operación segura.',
      'Evaluación de competencias laborales.',
      'Docentes expertos y altamente certificados.',
      'Certificado válido por 1 año.',
    ],
    requirements: [
      'Contar con mínimo 1 año de experiencia como montacarguista.',
      'Acreditar conocimiento previo del equipo.',
      'Aprobar la evaluación teórica y práctica.',
    ],
    includes: [
      'Nivelación de conceptos de seguridad.',
      'Evaluación teórica.',
      'Evaluación práctica.',
      'Certificado al aprobar el proceso.',
    ],
  },
]

export const getCourse = (slug?: string): Course | undefined =>
  courses.find(course => course.slug === slug)
