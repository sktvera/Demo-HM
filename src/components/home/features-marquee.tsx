import { Box, Flex, Text } from 'components'

const FEATURES = [
  'Operación segura',
  'Práctica real',
  'Docentes expertos',
  'Competencias laborales',
]

export const FeaturesMarquee = (): JSX.Element => (
  <Box className='marquee' aria-label='Características de HM Maquinaria'>
    <Box className='marquee-track'>
      {/* Se duplica el grupo para que el desplazamiento sea continuo */}
      {[0, 1].map(copy => (
        <Flex key={copy} className='marquee-group' aria-hidden={copy === 1}>
          {FEATURES.map(item => (
            <Text as='span' key={item}>
              {item}
              <b>✦</b>
            </Text>
          ))}
        </Flex>
      ))}
    </Box>
  </Box>
)
