import { Box, Text } from 'components'
import { Reveal } from 'components/reveal'
import { Container } from 'layout'
import { asset } from 'paths'

// Respaldo de la norma OSHA 1910.178
export const OshaSection = (): JSX.Element => (
  <Box className='osha-section'>
    <Container>
      <Reveal>
        <Box className='osha-content'>
          <img src={asset('/images/logo-osha.png')} alt='OSHA' />
          <Box>
            <Text as='span'>Respaldo y seguridad</Text>
            <Text as='h2'>
              Estamos certificados bajo la norma <strong>OSHA 1910.178</strong>
            </Text>
            <Text as='p'>
              Esta norma establece los requisitos de seguridad para la operación
              de montacargas en el lugar de trabajo.
            </Text>
          </Box>
        </Box>
      </Reveal>
    </Container>
  </Box>
)
