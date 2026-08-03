import type { ReactElement, ReactNode } from 'react'
import Head from 'next/head'
import NextLink from 'next/link'
import { Box, Flex, Text } from 'components'
import { Reveal } from 'components/reveal'
import { FloatingWhatsApp } from 'components/floating-whatsapp'
import { ContactWhatsApp } from 'components/contact-whatsapp'
import { keyframes, styled } from 'stitches.config'
import { Shell, Container } from 'layout'
import { useManagedCourses } from 'platform-storage'
import { asset } from 'paths'

import type { NextPageWithLayout } from './_app'

const drift = keyframes({
  '0%, 100%': { transform: 'translate3d(0,0,0) rotate(-3deg)' },
  '50%': { transform: 'translate3d(0,-16px,0) rotate(2deg)' },
})

const pulse = keyframes({
  '0%, 100%': { opacity: 0.35, transform: 'scale(1)' },
  '50%': { opacity: 0.7, transform: 'scale(1.08)' },
})

const Hero = styled('section', {
  position: 'relative',
  minHeight: 'calc(100vh - 105px)',
  display: 'flex',
  alignItems: 'flex-end',
  overflow: 'hidden',
  color: '$white',
  isolation: 'isolate',
  background: '#080808',
  '&::before': {
    content: '',
    position: 'absolute',
    inset: 0,
    zIndex: -2,
    backgroundImage: `linear-gradient(90deg, rgba(4,4,4,.97) 0%, rgba(4,4,4,.78) 47%, rgba(4,4,4,.12) 78%), url("${asset(
      '/images/hero-training-2026.jpg'
    )}")`,
    backgroundSize: 'cover',
    backgroundPosition: '68% center',
    animation: 'heroZoom 13s cubic-bezier(.2,.7,.2,1) both',
  },
  '&::after': {
    content: '',
    position: 'absolute',
    inset: 0,
    zIndex: -1,
    background:
      'radial-gradient(circle at 69% 52%, rgba(255,102,0,.19), transparent 28%), linear-gradient(0deg, rgba(0,0,0,.62), transparent 40%)',
  },
  '@desktop': { alignItems: 'center', minHeight: 790 },
})

const Cta = styled('a', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$3',
  minHeight: 56,
  padding: '$3 $6',
  borderRadius: '$pill',
  fontWeight: '$bold',
  transition: 'transform .25s ease, background .25s ease, color .25s ease',
  '&:hover': { textDecoration: 'none', transform: 'translateY(-3px)' },
  variants: {
    tone: {
      orange: {
        background: '$orange200',
        color: '$white',
        boxShadow: '0 12px 35px rgba(255,102,0,.3)',
        '&:hover': { background: '$orange300' },
      },
      light: { background: '$white', color: '$black' },
      outline: {
        color: '$white',
        border: '1px solid rgba(255,255,255,.5)',
        backdropFilter: 'blur(12px)',
        '&:hover': { background: '$white', color: '$black' },
      },
    },
  },
  defaultVariants: { tone: 'orange' },
})

const CourseCard = styled('article', {
  position: 'relative',
  overflow: 'hidden',
  minHeight: 590,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 28,
  color: '$white',
  background: '#141414',
  boxShadow: '0 24px 70px rgba(0,0,0,.22)',
  transform: 'translateZ(0)',
  '& .course-image': {
    transition: 'transform .75s cubic-bezier(.2,.7,.2,1)',
  },
  '& .course-arrow': {
    transition: 'transform .25s ease',
  },
  '&:hover .course-image': { transform: 'scale(1.07)' },
  '&:hover .course-arrow': { transform: 'translateX(7px)' },
})

const SectionTitle = ({
  overline,
  children,
  light = false,
}: {
  overline: string
  children: ReactNode
  light?: boolean
}): JSX.Element => (
  <Box css={{ maxWidth: 900, marginBottom: '$7' }}>
    <Text
      as='span'
      css={{
        display: 'flex',
        alignItems: 'center',
        gap: '$3',
        color: '$orange200',
        textTransform: 'uppercase',
        letterSpacing: '.16em',
        fontSize: '$2',
        fontWeight: '$bold',
        '&::before': {
          content: '',
          width: 32,
          height: 2,
          background: '$orange200',
        },
      }}
    >
      {overline}
    </Text>
    <Text
      as='h2'
      css={{
        color: light ? '$white' : '$black',
        fontSize: '$7',
        lineHeight: 1.02,
        letterSpacing: '-.035em',
        marginTop: '$4',
        '@desktop': { fontSize: '$9' },
      }}
    >
      {children}
    </Text>
  </Box>
)

const Page: NextPageWithLayout = () => {
  const { courses } = useManagedCourses()
  const publicCourses = courses.filter(course => course.active !== false)

  return (
    <>
      <Head>
        <title>Certificación de montacarguistas | HM Maquinaria</title>
        <meta
          name='description'
          content='Cursos de certificación, re-certificación y formación de montacarguistas con evaluación teórica y práctica.'
        />
      </Head>

      <Hero>
        <Box className='hm-grid-lines' />
        <Box
          css={{
            position: 'absolute',
            width: 440,
            height: 440,
            right: '-12%',
            top: '12%',
            border: '1px solid rgba(255,102,0,.25)',
            borderRadius: '$half',
            animation: `${pulse} 6s ease-in-out infinite`,
            '&::after': {
              content: '',
              position: 'absolute',
              inset: 55,
              border: '1px solid rgba(255,255,255,.15)',
              borderRadius: '$half',
            },
          }}
        />
        <Container
          css={{
            width: '100%',
            position: 'relative',
            padding: '$8 $5',
            '@desktop': { padding: '$9 $5' },
          }}
        >
          <Box css={{ maxWidth: 850 }}>
            <Text className='hero-kicker' as='span'>
              Formación industrial · Medellín
            </Text>
            <Text className='hero-title' as='h1'>
              <span>Domine la</span>
              <span className='outline-word'>máquina.</span>
              <span>Eleve su futuro.</span>
            </Text>
            <Text
              className='hero-copy'
              as='p'
              css={{
                maxWidth: 660,
                color: 'rgba(255,255,255,.75)',
                fontSize: '$4',
                margin: '$5 0 $6',
              }}
            >
              Certificación, re-certificación y formación desde cero con
              práctica real, docentes expertos y enfoque en operación segura.
            </Text>
            <Flex className='hero-actions' gap='3' css={{ flexWrap: 'wrap' }}>
              <Cta href='#programas'>
                Explorar programas <span>↓</span>
              </Cta>
              <Cta
                tone='outline'
                href='https://wa.me/573042425384?text=Hola%2C%20quiero%20asesor%C3%ADa%20sobre%20los%20cursos%20de%20montacargas'
              >
                Hablar con un experto
              </Cta>
            </Flex>
          </Box>
          <Box
            css={{
              position: 'absolute',
              right: '$5',
              bottom: '$7',
              display: 'none',
              width: 150,
              height: 150,
              borderRadius: '$half',
              background: '$orange200',
              color: '$white',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              fontSize: '$2',
              fontWeight: '$bold',
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              animation: `${drift} 5s ease-in-out infinite`,
              '@desktop': { display: 'flex' },
            }}
          >
            Teoría
            <br />+ práctica
          </Box>
        </Container>
      </Hero>

      <Box className='marquee' aria-label='Características de HM Maquinaria'>
        <Box className='marquee-track'>
          {[0, 1].map(copy => (
            <Flex key={copy} className='marquee-group' aria-hidden={copy === 1}>
              {[
                'Operación segura',
                'Práctica real',
                'Docentes expertos',
                'Competencias laborales',
              ].map(item => (
                <Text as='span' key={item}>
                  {item}
                  <b>✦</b>
                </Text>
              ))}
            </Flex>
          ))}
        </Box>
      </Box>

      <Box id='programas' css={{ background: '#f1f0ed', padding: '$10 $5' }}>
        <Container>
          <Reveal>
            <SectionTitle overline='Elija su ruta'>
              No todos parten del mismo punto. Todos pueden llegar más lejos.
            </SectionTitle>
          </Reveal>
          <Box
            css={{
              display: 'grid',
              gap: '$5',
              '@desktop': { gridTemplateColumns: 'repeat(3, 1fr)' },
            }}
          >
            {publicCourses.map((course, index) => (
              <Reveal key={course.slug} delay={index * 130}>
                <CourseCard>
                  <Box
                    className='course-image'
                    css={{
                      height: 280,
                      flexShrink: 0,
                      backgroundImage: `linear-gradient(180deg, transparent 45%, #141414 100%), url("${course.image}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: course.imagePosition,
                    }}
                  />
                  <Box
                    css={{
                      padding: '$5 $6 $6',
                      marginTop: -18,
                      position: 'relative',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Flex justify='between' align='center' gap='3'>
                      <Text
                        as='span'
                        css={{
                          color: '$orange100',
                          fontSize: '$2',
                          fontWeight: '$bold',
                          textTransform: 'uppercase',
                          letterSpacing: '.1em',
                        }}
                      >
                        {course.eyebrow}
                      </Text>
                      <Text css={{ color: '$shade200', fontSize: '$2' }}>
                        {course.duration}
                      </Text>
                    </Flex>
                    <Text
                      as='h3'
                      css={{ fontSize: '$6', lineHeight: 1.08, margin: '$4 0' }}
                    >
                      {course.title}
                    </Text>
                    <Text css={{ color: '$shade200', fontSize: '$2' }}>
                      {course.description}
                    </Text>
                    <Flex
                      justify='between'
                      align='end'
                      css={{ marginTop: 'auto', paddingTop: '$5' }}
                    >
                      <Text css={{ fontSize: '$6', fontWeight: '$bold' }}>
                        {course.price}
                      </Text>
                      <NextLink href={`/programas/${course.slug}`} passHref>
                        <Cta
                          aria-label={`Ver detalles de ${course.shortTitle}`}
                        >
                          Ver <span className='course-arrow'>→</span>
                        </Cta>
                      </NextLink>
                    </Flex>
                  </Box>
                </CourseCard>
              </Reveal>
            ))}
          </Box>
        </Container>
      </Box>

      <Box
        css={{
          background: '$black',
          color: '$white',
          padding: '$10 $5',
          overflow: 'hidden',
        }}
      >
        <Container>
          <Box
            css={{
              display: 'grid',
              gap: '$7',
              alignItems: 'center',
              '@desktop': { gridTemplateColumns: '.85fr 1.15fr' },
            }}
          >
            <Reveal>
              <SectionTitle overline='Aprender haciendo' light>
                La seguridad se entrena. La confianza también.
              </SectionTitle>
              <Text css={{ color: '$shade200', fontSize: '$4', maxWidth: 600 }}>
                Cada jornada combina conocimiento, evaluación y práctica para
                responder mejor frente a situaciones reales de operación.
              </Text>
              <Box css={{ marginTop: '$7' }}>
                {[
                  ['01', 'Inspección preoperacional'],
                  ['02', 'Estabilidad y manejo de carga'],
                  ['03', 'Evaluación práctica'],
                ].map(([number, label]) => (
                  <Flex
                    key={number}
                    gap='5'
                    align='center'
                    css={{ padding: '$4 0', borderTop: '1px solid $shade400' }}
                  >
                    <Text css={{ color: '$orange200', fontWeight: '$bold' }}>
                      {number}
                    </Text>
                    <Text css={{ fontSize: '$4' }}>{label}</Text>
                  </Flex>
                ))}
              </Box>
            </Reveal>
            <Reveal delay={180}>
              <Box className='training-photo'>
                <Box className='training-photo-image' />
                <Box className='training-badge'>
                  <Text
                    css={{ fontSize: '$8', lineHeight: 1, fontWeight: '$bold' }}
                  >
                    100%
                  </Text>
                  <Text css={{ fontSize: '$2', marginTop: '$2' }}>
                    enfoque práctico
                  </Text>
                </Box>
              </Box>
            </Reveal>
          </Box>
        </Container>
      </Box>

      <Box css={{ background: '#f1f0ed', padding: '$10 $5' }}>
        <Container>
          <Reveal>
            <SectionTitle overline='Soluciones integrales'>
              Mucho más que formación.
            </SectionTitle>
          </Reveal>
          <Box className='services-grid'>
            {[
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
            ].map((service, index) => (
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

      <Box className='osha-section'>
        <Container>
          <Reveal>
            <Box className='osha-content'>
              <img src={asset('/images/logo-osha.png')} alt='OSHA' />
              <Box>
                <Text as='span'>Respaldo y seguridad</Text>
                <Text as='h2'>
                  Estamos certificados bajo la norma{' '}
                  <strong>OSHA 1910.178</strong>
                </Text>
                <Text as='p'>
                  Esta norma establece los requisitos de seguridad para la
                  operación de montacargas en el lugar de trabajo.
                </Text>
              </Box>
            </Box>
          </Reveal>
        </Container>
      </Box>

      <Box
        css={{ background: '$orange200', color: '$white', padding: '$8 $5' }}
      >
        <Container>
          <Reveal>
            <Flex
              direction={{ '@initial': 'column', '@desktop': 'row' }}
              align='center'
              justify='between'
              gap='5'
            >
              <Box>
                <Text
                  as='span'
                  css={{
                    textTransform: 'uppercase',
                    letterSpacing: '.14em',
                    fontSize: '$2',
                    fontWeight: '$bold',
                  }}
                >
                  Verificación inmediata
                </Text>
                <Text
                  as='h2'
                  css={{ fontSize: '$7', lineHeight: 1.05, marginTop: '$2' }}
                >
                  Consulte su certificado en línea
                </Text>
              </Box>
              <NextLink href='/consultar-certificado' passHref>
                <Cta tone='light'>Consultar ahora →</Cta>
              </NextLink>
            </Flex>
          </Reveal>
        </Container>
      </Box>

      <Box
        css={{ padding: '$10 $5', background: '$white', overflow: 'hidden' }}
      >
        <Container>
          <Reveal>
            <SectionTitle overline='Confían en nuestra experiencia'>
              Movemos el talento que mueve a las empresas.
            </SectionTitle>
          </Reveal>
          <Reveal delay={100}>
            <Box className='trust-panel'>
              <Box>
                <Text as='strong'>Empresas que confían en nosotros</Text>
                <Text>
                  Programas para equipos operativos de diferentes industrias.
                </Text>
              </Box>
              <Box className='trust-marks'>
                {[
                  'LOGÍSTICA',
                  'INDUSTRIA',
                  'CONSTRUCCIÓN',
                  'ALIMENTOS',
                  'DISTRIBUCIÓN',
                ].map((sector, index) => (
                  <Box key={sector}>
                    <span>HM·{String(index + 1).padStart(2, '0')}</span>
                    <Text>{sector}</Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </Reveal>
        </Container>
        <Box className='sector-marquee'>
          <Box className='sector-track'>
            {[0, 1].map(copy => (
              <Flex
                key={copy}
                className='sector-group'
                aria-hidden={copy === 1}
              >
                {[
                  'Logística',
                  'Industria',
                  'Construcción',
                  'Alimentos',
                  'Distribución',
                ].map(sector => (
                  <Text as='span' key={sector}>
                    {sector}
                  </Text>
                ))}
              </Flex>
            ))}
          </Box>
        </Box>
      </Box>

      <Box id='contacto' css={{ padding: '$10 $5', background: '#f1f0ed' }}>
        <Container>
          <Box className='contact-layout'>
            <Reveal>
              <SectionTitle overline='Hablemos'>
                Cuéntenos qué necesita. Nosotros le orientamos.
              </SectionTitle>
              <Text css={{ color: '$shade300', fontSize: '$4', maxWidth: 560 }}>
                Complete sus datos y enviaremos la solicitud directamente a
                nuestro equipo mediante WhatsApp.
              </Text>
            </Reveal>
            <Reveal delay={150}>
              <ContactWhatsApp />
            </Reveal>
          </Box>
        </Container>
      </Box>

      <Box className='final-cta'>
        <Box className='final-cta-word'>AVANCE</Box>
        <Container css={{ position: 'relative', zIndex: 1 }}>
          <Reveal>
            <Text
              as='span'
              css={{
                textTransform: 'uppercase',
                letterSpacing: '.15em',
                fontSize: '$2',
                fontWeight: '$bold',
              }}
            >
              Su siguiente nivel comienza aquí
            </Text>
            <Text
              as='h2'
              css={{
                maxWidth: 850,
                fontSize: '$8',
                lineHeight: 1,
                letterSpacing: '-.04em',
                margin: '$4 0 $6',
                '@desktop': { fontSize: '$10' },
              }}
            >
              Convierta la experiencia en una oportunidad.
            </Text>
            <Cta
              tone='light'
              href='https://wa.me/573042425384?text=Hola%2C%20quiero%20elegir%20mi%20programa%20de%20montacargas'
            >
              Elegir mi programa →
            </Cta>
          </Reveal>
        </Container>
      </Box>
      <FloatingWhatsApp />
    </>
  )
}

Page.getLayout = (page: ReactElement) => <Shell>{page}</Shell>

export default Page
