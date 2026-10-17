import { Box, Text } from 'components'
import { Reveal } from 'components/reveal'
import { Container } from 'layout'
import { asset } from 'paths'

import { SectionTitle } from './section-title'

const SERVICES = [
  {
    number: '01',
    title: 'Certificación',
    copy: 'Formación, evaluación y certificación de operadores de montacargas con enfoque teórico-práctico.',
    image: asset('/images/service-certification-2026.jpg'),
    href: '#programas',
  },
  {
    number: '02',
    title: 'Mantenimiento',
    copy: 'Inspección y mantenimiento para conservar sus equipos seguros, disponibles y productivos.',
    image: asset('/images/mechanic.png'),
    href: '#contacto',
  },
  {
    number: '03',
    title: 'Alquiler de maquinaria',
    copy: 'Equipos logísticos para responder a las necesidades operativas de su empresa.',
    image: asset('/images/service-rental-2026.jpg'),
    href: '#contacto',
  },
]

// Tarjetas de servicios: certificación, mantenimiento y alquiler
export const ServicesSection = (): JSX.Element => (
  <Box css={{ background: '#f1f0ed', padding: '$10 $5' }}>
    <Container>
      <Reveal>
        <SectionTitle overline='Soluciones integrales'>
          Mucho más que formación.
        </SectionTitle>
      </Reveal>
      <Box className='services-grid'>
        {SERVICES.map((service, index) => (
          <Reveal key={service.title} delay={index * 120}>
            <a href={service.href} className='service-card'>
              <Box
                className='service-image'
                css={{
                  backgroundImage: `linear-gradient(0deg, rgba(0,0,0,.82), transparent 70%), url("${service.image}")`,
                }}
              />
              <Text className='service-number'>{service.number}</Text>
              <Box className='service-copy'>
                <Text as='h3'>{service.title}</Text>
                <Text>{service.copy}</Text>
                <span>Conocer más →</span>
              </Box>
            </a>
          </Reveal>
        ))}
      </Box>
    </Container>
  </Box>
)
