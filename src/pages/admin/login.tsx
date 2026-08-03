import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Box, Flex, Image, Text } from 'components'
import { demoUser, isAuthenticated, login } from 'platform-storage'
import { asset } from 'paths'

const inputStyle = {
  width: '100%',
  border: '1px solid #d7d9dd',
  borderRadius: 12,
  padding: '13px 14px',
  marginTop: 6,
  outlineColor: '#ff6600',
}

const LoginPage = (): JSX.Element => {
  const router = useRouter()
  const [email, setEmail] = useState(demoUser.email)
  const [password, setPassword] = useState(demoUser.password)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated()) void router.replace('/admin')
  }, [router])

  const destination =
    typeof router.query.next === 'string' &&
    router.query.next.startsWith('/admin')
      ? router.query.next
      : '/admin'

  return (
    <>
      <Head>
        <title>Acceso administrativo | HM Maquinaria</title>
      </Head>
      <Box css={{ minHeight: '100vh', background: '#f3f4f6' }}>
        <Box
          css={{
            minHeight: '100vh',
            display: 'grid',
            '@desktop': { gridTemplateColumns: '1.05fr .95fr' },
          }}
        >
          <Flex
            direction='column'
            justify='between'
            css={{
              display: 'none',
              padding: '$8',
              color: '$white',
              backgroundImage: `linear-gradient(120deg, rgba(0,0,0,.95), rgba(0,0,0,.45)), url("${asset(
                '/images/banner-home.png'
              )}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              '@desktop': { display: 'flex' },
            }}
          >
            <Image
              src='/images/logo-horizontal.png'
              alt='HM Maquinaria'
              css={{ width: 180 }}
            />
            <Box css={{ maxWidth: 580 }}>
              <Text as='h1' css={{ fontSize: '$8', lineHeight: 1.05 }}>
                Controle su oferta de formación.
              </Text>
              <Text
                css={{ color: '$shade200', fontSize: '$4', marginTop: '$4' }}
              >
                Una demostración administrativa segura y sencilla, almacenada
                únicamente en este navegador.
              </Text>
            </Box>
          </Flex>
          <Flex align='center' justify='center' css={{ padding: '$5' }}>
            <Box
              css={{
                width: '100%',
                maxWidth: 480,
                background: '$white',
                borderRadius: 24,
                boxShadow: '0 24px 70px rgba(0,0,0,.10)',
                padding: '$7',
              }}
            >
              <Image
                src='/images/logo.png'
                alt='HM Maquinaria'
                css={{
                  width: 120,
                  marginBottom: '$6',
                  '@desktop': { display: 'none' },
                }}
              />
              <Text as='h1' css={{ fontSize: '$7' }}>
                Bienvenido
              </Text>
              <Text css={{ color: '$shade300', margin: '$2 0 $6' }}>
                Ingrese para administrar el contenido público.
              </Text>
              <form
                onSubmit={event => {
                  event.preventDefault()
                  setError('')
                  if (!login(email, password)) {
                    setError('El correo o la contraseña no son correctos.')
                    return
                  }
                  void router.push(destination)
                }}
              >
                <label>
                  <Text css={{ fontSize: '$2', fontWeight: '$bold' }}>
                    Correo
                  </Text>
                  <input
                    type='email'
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    style={inputStyle}
                    required
                  />
                </label>
                <label style={{ display: 'block', marginTop: 18 }}>
                  <Text css={{ fontSize: '$2', fontWeight: '$bold' }}>
                    Contraseña
                  </Text>
                  <input
                    type='password'
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    style={inputStyle}
                    required
                  />
                </label>
                {error && (
                  <Text
                    css={{ color: '#b42318', fontSize: '$2', marginTop: '$3' }}
                  >
                    {error}
                  </Text>
                )}
                <button
                  type='submit'
                  style={{
                    width: '100%',
                    border: 0,
                    borderRadius: 999,
                    padding: 14,
                    marginTop: 24,
                    background: '#ff6600',
                    color: 'white',
                    fontWeight: 650,
                    cursor: 'pointer',
                  }}
                >
                  Ingresar al panel
                </button>
              </form>
              <Box
                css={{
                  marginTop: '$5',
                  padding: '$4',
                  borderRadius: 12,
                  background: '#fff7ed',
                }}
              >
                <Text css={{ fontSize: '$2', fontWeight: '$bold' }}>
                  Credenciales de demostración
                </Text>
                <Text css={{ fontSize: '$2', marginTop: '$1' }}>
                  {demoUser.email}
                </Text>
                <Text css={{ fontSize: '$2' }}>{demoUser.password}</Text>
              </Box>
            </Box>
          </Flex>
        </Box>
      </Box>
    </>
  )
}

export default LoginPage
