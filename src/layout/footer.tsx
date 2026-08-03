import NextLink from 'next/link'
import { Link, Flex, Box, Image, Text } from 'components'
import { Container } from 'layout'
import { asset } from 'paths'

export const Footer = (): JSX.Element => (
  <>
    <Box
      css={{
        background: '$black',
        color: '$white',
        padding: '$7 $5',
        fontWeight: '$thin',
        [Link as any]: { color: '$white' },
      }}
    >
      <Container>
        <Flex
          gap='5'
          direction={{
            '@initial': 'column',
            '@desktop': 'row',
          }}
          justify='between'
        >
          <Box>
            <Text weight='bold'>Teléfono</Text>
            <br />
            <Link href='tel:320 398 01 61'>320 398 01 61</Link>
            {/*  <br />
            <Link href='tel:3003674450'>3</Link> */}
          </Box>

          <Box>
            <Text weight='bold'>Dirección</Text>
            <br />
            <Link href='https://goo.gl/maps/4XvEMiLnLZ1ioauw6'>
              Calle 36 sur # 44-37 Envigado Antioquia
            </Link>
          </Box>

          <Box>
            <Text weight='bold'>Horario de funcionamiento</Text>
            <br />
            Lunes a Viernes de las 8h a las 17h
          </Box>

          <Box>
            <Text weight='bold'>Escríbenos</Text>
            <br />
            <Link href='mailto:jaime.sst@hm-maquinaria.com'>
              jaime.sst@hm-maquinaria.com
            </Link>
          </Box>
        </Flex>
      </Container>
    </Box>
    <Box css={{ padding: '$7', background: '$white' }}>
      <Container>
        <Flex gap='5' align='center' direction='column'>
          <NextLink href='/'>
            <a>
              <Image
                src={asset('/images/logo-horizontal.png')}
                alt='HM Maquinaria'
                width={150}
              />
            </a>
          </NextLink>
          <Box>&copy; HM Maquinaria {new Date().getFullYear()}</Box>
        </Flex>
      </Container>
    </Box>
  </>
)
