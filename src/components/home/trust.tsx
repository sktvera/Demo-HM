import { Box, Flex, Text } from 'components'
import { Reveal } from 'components/reveal'
import { Container } from 'layout'

import { SectionTitle } from './section-title'

const TRUST_MARKS = [
  'LOGÍSTICA',
  'INDUSTRIA',
  'CONSTRUCCIÓN',
  'ALIMENTOS',
  'DISTRIBUCIÓN',
]

const SECTORS = [
  'Logística',
  'Industria',
  'Construcción',
  'Alimentos',
  'Distribución',
]

// Empresas y sectores que confían en HM, con marquesina de sectores
export const TrustSection = (): JSX.Element => (
  <Box css={{ padding: '$10 $5', background: '$white', overflow: 'hidden' }}>
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
            {TRUST_MARKS.map((sector, index) => (
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
        {/* Se duplica el grupo para que el desplazamiento sea continuo */}
        {[0, 1].map(copy => (
          <Flex key={copy} className='sector-group' aria-hidden={copy === 1}>
            {SECTORS.map(sector => (
              <Text as='span' key={sector}>
                {sector}
              </Text>
            ))}
          </Flex>
        ))}
      </Box>
    </Box>
  </Box>
)
