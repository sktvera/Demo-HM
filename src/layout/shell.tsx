import type { PropsWithChildren } from 'react'
import Head from 'next/head'
import { Header, Footer } from 'layout'
import { Flex, Box } from 'components'

export const Shell = ({ children }: PropsWithChildren): JSX.Element => (
  <>
    <Head>
      <title>
        HM Maquinaria - Certificación de montacarguista OSHA, mantenimiento y
        venta de montacargas y estibadores
      </title>
      <meta name='viewport' content='width=device-width, initial-scale=1' />
    </Head>

    <Flex direction='column' css={{ height: '100%' }}>
      <Header />
      <Box fluid>{children}</Box>
      <Footer />
    </Flex>
  </>
)
