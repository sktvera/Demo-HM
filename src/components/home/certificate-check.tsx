import NextLink from 'next/link'
import { Box, Flex, Text } from 'components'
import { Reveal } from 'components/reveal'
import { Container } from 'layout'

import { Cta } from './cta'

// Banda naranja que lleva a /consultar-certificado
export const CertificateCheckSection = (): JSX.Element => (
  <Box css={{ background: '$orange200', color: '$white', padding: '$8 $5' }}>
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
)
