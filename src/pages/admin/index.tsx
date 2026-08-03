import type { ReactElement } from 'react'
import { useState } from 'react'
import Head from 'next/head'
import { Box, Flex, Text } from 'components'
import { AdminShell } from 'layout/admin-shell'
import { useManagedCourses } from 'platform-storage'
import type { Course } from 'course-data'

import type { NextPageWithLayout } from '../_app'

const fieldStyle = {
  width: '100%',
  padding: '11px 12px',
  border: '1px solid #d9dce1',
  borderRadius: 10,
}

const Page: NextPageWithLayout = () => {
  const { courses, updateCourse, restoreCourses } = useManagedCourses()
  const [editing, setEditing] = useState<Course | null>(null)
  const [notice, setNotice] = useState('')

  const save = (): void => {
    if (!editing) return
    updateCourse(editing)
    setEditing(null)
    setNotice('Los cambios se guardaron en este navegador.')
    window.setTimeout(() => setNotice(''), 3000)
  }

  return (
    <>
      <Head><title>Programas | Administración HM</title></Head>
      <Flex
        justify='between'
        align='end'
        gap='4'
        css={{ marginBottom: '$6', flexWrap: 'wrap' }}
      >
        <Box>
          <Text as='h1' css={{ fontSize: '$7' }}>Programas de formación</Text>
          <Text css={{ color: '$shade300' }}>
            Edite precios, duración, textos y visibilidad del landing.
          </Text>
        </Box>
        <button
          type='button'
          onClick={() => {
            restoreCourses()
            setNotice('Se restauró el contenido original.')
          }}
          style={{ border: '1px solid #ddd', background: 'white', borderRadius: 999, padding: '11px 16px', cursor: 'pointer' }}
        >
          Restaurar contenido
        </button>
      </Flex>

      {notice && (
        <Box css={{ background: '#ecfdf3', color: '#027a48', borderRadius: 12, padding: '$4', marginBottom: '$5' }}>
          {notice}
        </Box>
      )}

      <Box css={{ display: 'grid', gap: '$4' }}>
        {courses.map(course => (
          <Box
            key={course.slug}
            css={{
              display: 'grid',
              gap: '$4',
              alignItems: 'center',
              padding: '$4',
              borderRadius: 18,
              background: '$white',
              border: '1px solid #e5e7eb',
              '@desktop': { gridTemplateColumns: '110px 1fr auto auto' },
            }}
          >
            <Box
              css={{
                height: 82,
                borderRadius: 12,
                backgroundImage: `url("${course.image}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <Box>
              <Text css={{ fontWeight: '$bold' }}>{course.title}</Text>
              <Text css={{ color: '$shade300', fontSize: '$2' }}>{course.duration} · {course.price}</Text>
            </Box>
            <Text
              as='span'
              css={{
                width: 'fit-content',
                borderRadius: '$pill',
                padding: '$2 $3',
                fontSize: '$2',
                color: course.active === false ? '#b42318' : '#027a48',
                background: course.active === false ? '#fef3f2' : '#ecfdf3',
              }}
            >
              {course.active === false ? 'Oculto' : 'Publicado'}
            </Text>
            <button
              type='button'
              onClick={() => setEditing({ ...course })}
              style={{ border: 0, borderRadius: 999, padding: '11px 18px', background: '#111', color: 'white', cursor: 'pointer' }}
            >
              Editar
            </button>
          </Box>
        ))}
      </Box>

      {editing && (
        <Box
          css={{
            position: 'fixed',
            inset: 0,
            zIndex: 20,
            display: 'grid',
            placeItems: 'center',
            padding: '$4',
            background: 'rgba(0,0,0,.65)',
          }}
          onClick={() => setEditing(null)}
        >
          <Box
            css={{ width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'auto', background: '$white', borderRadius: 22, padding: '$6' }}
            onClick={event => event.stopPropagation()}
          >
            <Flex justify='between' align='center' css={{ marginBottom: '$5' }}>
              <Text as='h2' css={{ fontSize: '$6' }}>Editar programa</Text>
              <button type='button' onClick={() => setEditing(null)} style={{ border: 0, background: 'none', fontSize: 24, cursor: 'pointer' }}>×</button>
            </Flex>
            {[
              ['Título', 'title'],
              ['Precio', 'price'],
              ['Duración', 'duration'],
              ['Público objetivo', 'audience'],
            ].map(([label, key]) => (
              <label key={key} style={{ display: 'block', marginBottom: 16 }}>
                <Text css={{ fontSize: '$2', fontWeight: '$bold', marginBottom: '$1' }}>{label}</Text>
                <input
                  value={String(editing[key as keyof Course] ?? '')}
                  onChange={event => setEditing({ ...editing, [key]: event.target.value })}
                  style={fieldStyle}
                />
              </label>
            ))}
            <label style={{ display: 'block', marginBottom: 16 }}>
              <Text css={{ fontSize: '$2', fontWeight: '$bold', marginBottom: '$1' }}>Descripción</Text>
              <textarea
                value={editing.description}
                onChange={event => setEditing({ ...editing, description: event.target.value })}
                rows={4}
                style={fieldStyle}
              />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
              <input
                type='checkbox'
                checked={editing.active !== false}
                onChange={event => setEditing({ ...editing, active: event.target.checked })}
              />
              Mostrar este programa en el landing
            </label>
            <Flex gap='3' justify='end'>
              <button type='button' onClick={() => setEditing(null)} style={{ border: '1px solid #ddd', borderRadius: 999, padding: '12px 18px', background: 'white', cursor: 'pointer' }}>Cancelar</button>
              <button type='button' onClick={save} style={{ border: 0, borderRadius: 999, padding: '12px 20px', background: '#ff6600', color: 'white', fontWeight: 650, cursor: 'pointer' }}>Guardar cambios</button>
            </Flex>
          </Box>
        </Box>
      )}
    </>
  )
}

Page.getLayout = (page: ReactElement) => <AdminShell>{page}</AdminShell>

export default Page
