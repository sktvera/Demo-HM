// import { useState, useEffect } from 'react'
import NextLink from 'next/link'
// import { HamburgerMenuIcon } from '@radix-ui/react-icons'
import { Flex, Button, Box, Image, Link } from 'components'
import { Container } from 'layout'
// import { styled } from 'stitches.config'
import { asset } from 'paths'

// const StyledMenu = styled(Flex, {
//   background: '$white',
//   position: 'fixed',
//   top: 0,
//   left: 0,
//   width: '100%',
//   height: '100%',
//   paddingY: '$7',
//   fontSize: '$2',
//   '@desktop': {
//     padding: '$0',
//     position: 'relative',
//     width: 'auto',
//   },
//   variants: {
//     open: {
//       false: {
//         showOn: 'desktop',
//       },
//     },
//   },
// })

// const StyledCloseMenu = styled(Button, {
//   size: 30,
//   overflow: 'hidden',
//   position: 'fixed',
//   top: '$3',
//   right: '$3',
//   hideOn: 'desktop',
// })

// const StyledHambugerMenuIcon = styled(HamburgerMenuIcon, {
//   cursor: 'pointer',
//   size: 24,
//   color: '$black',
//   hideOn: 'desktop',
// })

export const Header = (): JSX.Element => {
  // const [openMenu, setOpenMenu] = useState(false)

  // const listener = (): void => {
  //   setOpenMenu(open => !open)
  // }

  // useEffect(() => {
  //   window.addEventListener('popstate', listener)

  //   return () => window.removeEventListener('popstate', listener)
  // }, [])
  console.log('HM Maquinaria')

  return (
    <Box css={{ background: '$white' }}>
      <Container css={{ padding: '$4' }}>
        <Flex gap='2' align='center' justify='between'>
          <NextLink href='/'>
            <a>
              <Image
                src={asset('/images/logo.png')}
                alt='HM Maquinaria'
                css={{
                  width: 100,
                  '@desktop': { width: 150 },
                }}
              />
            </a>
          </NextLink>
          {/* <StyledMenu
            open={openMenu}
            gap='6'
            direction={{
              '@initial': 'column',
              '@desktop': 'row',
            }}
            align='center'
          >
            <Link href='/empresa'>Empresa</Link>
            <Link href='/certificaciones'>Certificaciones</Link>
            <Link href='/mantenimientos'>Mantenimientos</Link>
            <Link href='/equipos'>Equipos</Link>
            <Link href='/contacto'>Contacto</Link>
            <Link href='tel:3003674450'>
              <Button css={{ alignItems: 'center' }}>
                <Box
                  as='span'
                  css={{
                    fontSize: '$5',
                    lineHeight: 0,
                    marginRight: '$2',
                    marginTop: -2,
                  }}
                >
                  ✆
                </Box>
                300 367 4450
              </Button>
            </Link>
            <StyledCloseMenu
              onClick={() => {
                history.pushState({}, '')
                setOpenMenu(false)
              }}
            >
              X
            </StyledCloseMenu>
          </StyledMenu>
          <StyledHambugerMenuIcon
            onClick={() => {
              history.pushState({}, '')
              setOpenMenu(true)
            }}
          /> */}
          <Link
            href='https://wa.me/573042425384'
            aria-label='Contactar por WhatsApp al 304 242 5384'
            style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Button css={{ alignItems: 'center' }}>
              <Box
                as='span'
                css={{
                  fontSize: '$5',
                  lineHeight: 0,
                  marginRight: '$2',
                  marginTop: -2,
                }}
                aria-hidden
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 256 256'
                  width='24'
                  height='24'
                >
                  <rect width='256' height='256' fill='none' />
                  <path
                    fill='white'
                    d='M152.58,145.23l23,11.48A24,24,0,0,1,152,176a72.08,72.08,0,0,1-72-72A24,24,0,0,1,99.29,80.46l11.48,23L101,118a8,8,0,0,0-.73,7.51,56.47,56.47,0,0,0,30.15,30.15A8,8,0,0,0,138,155ZM232,128A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Zm-40,24a8,8,0,0,0-4.42-7.16l-32-16a8,8,0,0,0-8,.5l-14.69,9.8a40.55,40.55,0,0,1-16-16l9.8-14.69a8,8,0,0,0,.5-8l-16-32A8,8,0,0,0,104,64a40,40,0,0,0-40,40,88.1,88.1,0,0,0,88,88A40,40,0,0,0,192,152Z'
                  />
                </svg>
              </Box>
              304 242 5384
            </Button>

            {/* LABEL PROFESIONAL */}
            <span
              style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#666',
                fontWeight: 500,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                fontFamily:
                  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              atención solo por wpp
            </span>
          </Link>
        </Flex>
      </Container>
    </Box>
  )
}
