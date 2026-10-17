import { Box, Text } from 'components'
import { Reveal } from 'components/reveal'
import { Container } from 'layout'

import { Cta } from './cta'

// Llamado final a la acción antes del footer
export const FinalCtaSection = (): JSX.Element => (
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
)
