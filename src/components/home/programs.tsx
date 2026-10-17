import NextLink from 'next/link'
import { Box, Flex, Text } from 'components'
import { Reveal } from 'components/reveal'
import { styled } from 'stitches.config'
import { Container } from 'layout'
import { useManagedCourses } from 'platform-storage'

import { Cta } from './cta'
import { SectionTitle } from './section-title'

const CourseCard = styled('article', {
  position: 'relative',
  overflow: 'hidden',
  minHeight: 590,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 28,
  color: '$white',
  background: '#141414',
  boxShadow: '0 24px 70px rgba(0,0,0,.22)',
  transform: 'translateZ(0)',
  '& .course-image': {
    transition: 'transform .75s cubic-bezier(.2,.7,.2,1)',
  },
  '& .course-arrow': {
    transition: 'transform .25s ease',
  },
  '&:hover .course-image': { transform: 'scale(1.07)' },
  '&:hover .course-arrow': { transform: 'translateX(7px)' },
})

// Tarjetas de cursos activos (ancla #programas)
export const ProgramsSection = (): JSX.Element => {
  const { courses } = useManagedCourses()
  const publicCourses = courses.filter(course => course.active !== false)

  return (
    <Box id='programas' css={{ background: '#f1f0ed', padding: '$10 $5' }}>
      <Container>
        <Reveal>
          <SectionTitle overline='Elija su ruta'>
            No todos parten del mismo punto. Todos pueden llegar más lejos.
          </SectionTitle>
        </Reveal>
        <Box
          css={{
            display: 'grid',
            gap: '$5',
            '@desktop': { gridTemplateColumns: 'repeat(3, 1fr)' },
          }}
        >
          {publicCourses.map((course, index) => (
            <Reveal key={course.slug} delay={index * 130}>
              <CourseCard>
                <Box
                  className='course-image'
                  css={{
                    height: 280,
                    flexShrink: 0,
                    backgroundImage: `linear-gradient(180deg, transparent 45%, #141414 100%), url("${course.image}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: course.imagePosition,
                  }}
                />
                <Box
                  css={{
                    padding: '$5 $6 $6',
                    marginTop: -18,
                    position: 'relative',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Flex justify='between' align='center' gap='3'>
                    <Text
                      as='span'
                      css={{
                        color: '$orange100',
                        fontSize: '$2',
                        fontWeight: '$bold',
                        textTransform: 'uppercase',
                        letterSpacing: '.1em',
                      }}
                    >
                      {course.eyebrow}
                    </Text>
                    <Text css={{ color: '$shade200', fontSize: '$2' }}>
                      {course.duration}
                    </Text>
                  </Flex>
                  <Text
                    as='h3'
                    css={{ fontSize: '$6', lineHeight: 1.08, margin: '$4 0' }}
                  >
                    {course.title}
                  </Text>
                  <Text css={{ color: '$shade200', fontSize: '$2' }}>
                    {course.description}
                  </Text>
                  <Flex
                    justify='between'
                    align='end'
                    css={{ marginTop: 'auto', paddingTop: '$5' }}
                  >
                    <Text css={{ fontSize: '$6', fontWeight: '$bold' }}>
                      {course.price}
                    </Text>
                    <NextLink href={`/programas/${course.slug}`} passHref>
                      <Cta aria-label={`Ver detalles de ${course.shortTitle}`}>
                        Ver <span className='course-arrow'>→</span>
                      </Cta>
                    </NextLink>
                  </Flex>
                </Box>
              </CourseCard>
            </Reveal>
          ))}
        </Box>
      </Container>
    </Box>
  )
}
