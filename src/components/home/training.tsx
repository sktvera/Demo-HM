import { Box, Flex, Text } from 'components'
import { Reveal } from 'components/reveal'
import { Container } from 'layout'

import { SectionTitle } from './section-title'

const STEPS = [
  ['01', 'Inspección preoperacional'],
  ['02', 'Estabilidad y manejo de carga'],
  ['03', 'Evaluación práctica'],
]

// Bloque oscuro "Aprender haciendo" con pasos y foto
export const TrainingSection = (): JSX.Element => (
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
            {STEPS.map(([number, label]) => (
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
)
