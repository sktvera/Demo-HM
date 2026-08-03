import type { ReactElement } from 'react'
import type { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import NextLink from 'next/link'
import { Box, Flex, Text } from 'components'
import { styled } from 'stitches.config'
import { Shell, Container } from 'layout'
import { courses } from 'course-data'
import type { Course } from 'course-data'

import type { NextPageWithLayout } from '../_app'

const Action = styled('a', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 54,
  padding: '$3 $6',
  borderRadius: '$pill',
  background: '$orange200',
  color: '$white',
  fontWeight: '$bold',
  '&:hover': { textDecoration: 'none', background: '$orange300' },
})

const DetailCard = styled('section', {
  padding: '$6',
  borderRadius: 20,
  border: '1px solid #e7e8eb',
  background: '$white',
  h2: { fontSize: '$5', marginBottom: '$4' },
  ul: { margin: 0, paddingLeft: '$5' },
  li: { marginBottom: '$3', color: '$shade300' },
})

const Page: NextPageWithLayout<{ course: Course }> = ({ course }) => {
  const message = encodeURIComponent(
    `Hola, quiero información sobre el programa: ${course.title}`
  )

  return (
    <>
      <Head>
        <title>{`${course.title} | HM Maquinaria`}</title>
        <meta name='description' content={course.description} />
      </Head>
      <Box css={{ background: '$black', color: '$white', padding: '$8 $5 $9' }}>
        <Container>
          <NextLink href='/#programas'>
            <a style={{ color: 'rgba(255,255,255,.7)' }}>← Volver a programas</a>
          </NextLink>
          <Box
            css={{
              display: 'grid',
              gap: '$7',
              alignItems: 'center',
              marginTop: '$6',
              '@desktop': { gridTemplateColumns: '1.08fr .92fr' },
            }}
          >
            <Box>
              <Text
                as='span'
                css={{
                  color: '$orange100',
                  textTransform: 'uppercase',
                  letterSpacing: '.12em',
                  fontSize: '$2',
                  fontWeight: '$bold',
                }}
              >
                {course.eyebrow}
              </Text>
              <Text
                as='h1'
                css={{
                  fontSize: '$7',
                  lineHeight: 1.04,
                  margin: '$4 0',
                  '@desktop': { fontSize: '$9' },
                }}
              >
                {course.title}
              </Text>
              <Text css={{ color: '$shade200', fontSize: '$4', maxWidth: 700 }}>
                {course.description}
              </Text>
              <Flex gap='6' css={{ margin: '$6 0', flexWrap: 'wrap' }}>
                <Box>
                  <Text css={{ color: '$shade200', fontSize: '$2' }}>Inversión</Text>
                  <Text css={{ fontSize: '$7', fontWeight: '$bold' }}>{course.price}</Text>
                </Box>
                <Box>
                  <Text css={{ color: '$shade200', fontSize: '$2' }}>Duración</Text>
                  <Text css={{ fontSize: '$6', fontWeight: '$bold' }}>{course.duration}</Text>
                </Box>
              </Flex>
              <Action href={`https://wa.me/573042425384?text=${message}`}>
                Quiero inscribirme por WhatsApp
              </Action>
            </Box>
            <Box
              css={{
                minHeight: 420,
                borderRadius: 28,
                backgroundImage: `linear-gradient(0deg, rgba(0,0,0,.35), transparent), url("${course.image}")`,
                backgroundSize: 'cover',
                backgroundPosition: course.imagePosition,
              }}
            />
          </Box>
        </Container>
      </Box>

      <Box css={{ background: '#f5f6f8', padding: '$8 $5' }}>
        <Container>
          <Box
            css={{
              display: 'grid',
              gap: '$5',
              '@desktop': { gridTemplateColumns: 'repeat(3, 1fr)' },
            }}
          >
            <DetailCard>
              <Text as='h2'>Lo que logrará</Text>
              <ul>{course.benefits.map(item => <li key={item}>{item}</li>)}</ul>
            </DetailCard>
            <DetailCard>
              <Text as='h2'>Requisitos</Text>
              <ul>{course.requirements.map(item => <li key={item}>{item}</li>)}</ul>
            </DetailCard>
            <DetailCard>
              <Text as='h2'>El programa incluye</Text>
              <ul>{course.includes.map(item => <li key={item}>{item}</li>)}</ul>
            </DetailCard>
          </Box>

          <Box
            css={{
              marginTop: '$7',
              padding: '$7',
              borderRadius: 24,
              background: '$white',
              display: 'grid',
              gap: '$5',
              alignItems: 'center',
              '@desktop': { gridTemplateColumns: '1fr auto' },
            }}
          >
            <Box>
              <Text as='h2' css={{ fontSize: '$6' }}>¿Este programa es para usted?</Text>
              <Text css={{ color: '$shade300', marginTop: '$2' }}>{course.audience}</Text>
            </Box>
            <Action href={`https://wa.me/573042425384?text=${message}`}>
              Resolver mis dudas
            </Action>
          </Box>

          <Box css={{ marginTop: '$8' }}>
            <Text as='h2' css={{ fontSize: '$6', marginBottom: '$5' }}>
              También puede interesarle
            </Text>
            <Flex gap='4' css={{ flexWrap: 'wrap' }}>
              {courses
                .filter(item => item.slug !== course.slug)
                .map(item => (
                  <NextLink key={item.slug} href={`/programas/${item.slug}`} passHref>
                    <Action css={{ background: '$black' }}>
                      {item.shortTitle} · {item.price}
                    </Action>
                  </NextLink>
                ))}
            </Flex>
          </Box>
        </Container>
      </Box>
    </>
  )
}

Page.getLayout = (page: ReactElement) => <Shell>{page}</Shell>

export default Page

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: courses.map(course => ({ params: { slug: course.slug } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps<{ course: Course }> = async context => {
  const course = courses.find(item => item.slug === context.params?.slug)

  if (!course) return { notFound: true }

  return { props: { course } }
}
