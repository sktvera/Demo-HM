import { Box, Flex, Text } from 'components'
import { keyframes, styled } from 'stitches.config'
import { Container } from 'layout'
import { asset } from 'paths'

import { Cta } from './cta'

const drift = keyframes({
  '0%, 100%': { transform: 'translate3d(0,0,0) rotate(-3deg)' },
  '50%': { transform: 'translate3d(0,-16px,0) rotate(2deg)' },
})

const pulse = keyframes({
  '0%, 100%': { opacity: 0.35, transform: 'scale(1)' },
  '50%': { opacity: 0.7, transform: 'scale(1.08)' },
})

const HeroWrapper = styled('section', {
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

export const HeroSection = (): JSX.Element => (
  <HeroWrapper>
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
          Certificación, re-certificación y formación desde cero con práctica
          real, docentes expertos y enfoque en operación segura.
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
  </HeroWrapper>
)
