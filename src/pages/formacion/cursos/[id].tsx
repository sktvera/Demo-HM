import { useMemo, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Box, Flex, Image, Text } from 'components'
import { calculateStudentProgress } from 'course-progress'
import { readAccessData, useAcademicCourses } from 'platform-storage'

const formatDate = (value?: string): string =>
  value
    ? new Date(`${value}T12:00:00`).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Sin fecha'

const StudentCoursePage = (): JSX.Element => {
  const router = useRouter()
  const { courses, saveCourse } = useAcademicCourses()
  const [delivery, setDelivery] = useState<{ assignmentId: string; text: string } | null>(null)
  const courseId = typeof router.query.id === 'string' ? router.query.id : ''
  const requestedStudent = typeof router.query.student === 'string' ? router.query.student : ''
  const course = courses.find(item => item.id === courseId)
  const users = useMemo(() => readAccessData().users, [])
  const studentId = requestedStudent ?? course?.studentIds[0] ?? ''
  const student = users.find(item => item.id === studentId)

  if (!router.isReady || !course || !student || !course.studentIds.includes(student.id)) {
    return <Box className='student-portal-empty'><Image src='/images/logo-horizontal.png' alt='HM Maquinaria' /><strong>{router.isReady ? 'No encontramos esta matrícula.' : 'Cargando formación…'}</strong><p>Solicite al coordinador el enlace personal de acceso al curso.</p></Box>
  }

  const progress = calculateStudentProgress(course, student.id)
  const assignments = course.assignments.filter(item => item.status !== 'borrador')
  const nextSession = course.sessions
    .filter(item => item.status === 'programada' && item.date >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  const submitDelivery = (): void => {
    if (!delivery?.text.trim()) return
    saveCourse({
      ...course,
      assignments: course.assignments.map(assignment =>
        assignment.id === delivery.assignmentId
          ? {
              ...assignment,
              submissions: {
                ...assignment.submissions,
                [student.id]: {
                  text: delivery.text.trim(),
                  submittedAt: new Date().toISOString(),
                },
              },
            }
          : assignment
      ),
    })
    setDelivery(null)
  }

  return (
    <Box className='student-portal'>
      <Head><title>{course.title} | Mi formación HM</title></Head>
      <header className='student-portal-header'>
        <Image src='/images/logo-horizontal.png' alt='HM Maquinaria' />
        <Box><span>Portal del alumno</span><strong>{student.name}</strong></Box>
      </header>
      <main>
        <Box className='student-course-hero'>
          <span>Mi curso</span>
          <Text as='h1'>{course.title}</Text>
          <Text>{course.organization} · Inicio {formatDate(course.startDate)}</Text>
          <Box className='student-main-progress'><Flex justify='between'><strong>Progreso general</strong><span>{Math.round(progress.courseProgress)}%</span></Flex><div><i style={{ width: `${progress.courseProgress}%` }} /></div><small>{progress.completedSessions} de {progress.totalSessions} sesiones completadas</small></Box>
        </Box>

        <Box className='student-kpis'>
          <Box><span>Asistencia</span><strong>{Math.round(progress.attendancePercentage)}%</strong><small>Requerida: {course.minimumAttendance}%</small></Box>
          <Box><span>Nota acumulada</span><strong>{progress.finalGrade.toFixed(1)}</strong><small>Requerida: {course.passingGrade}</small></Box>
          <Box><span>Evaluaciones</span><strong>{progress.gradedAssignments}/{progress.publishedAssignments}</strong><small>Calificadas</small></Box>
          <Box><span>Estado</span><strong className={`student-result ${progress.result}`}>{progress.result.replace('_', ' ')}</strong><small>{course.status === 'finalizado' ? 'Resultado definitivo' : 'Resultado provisional'}</small></Box>
        </Box>

        <Box className='student-portal-grid'>
          <Box className='student-panel'>
            <span>Agenda</span><Text as='h2'>Próxima sesión</Text>
            {nextSession ? <Box className='student-next-session'><time><strong>{new Date(`${nextSession.date}T12:00:00`).getDate()}</strong><span>{new Date(`${nextSession.date}T12:00:00`).toLocaleDateString('es-CO', { month: 'short' })}</span></time><Box><strong>{nextSession.title}</strong><p>{nextSession.startTime}–{nextSession.endTime}</p><small>{nextSession.topic ?? 'El instructor informará el tema de la sesión.'}</small></Box></Box> : <Box className='student-empty-state'>No hay próximas sesiones programadas.</Box>}
            <Box className='student-session-history'>
              <strong>Historial de sesiones</strong>
              {course.sessions.filter(item => item.status === 'completada').map(session => {
                const raw = session.attendance[student.id]
                const status = typeof raw === 'boolean' ? (raw ? 'presente' : 'ausente') : raw?.status ?? 'sin registro'
                return <Box key={session.id}><span>{formatDate(session.date)}</span><strong>{session.title}</strong><span className={`attendance-status ${status}`}>{status}</span></Box>
              })}
            </Box>
          </Box>

          <Box className='student-panel'>
            <span>Mi desempeño</span><Text as='h2'>Tareas y evaluaciones</Text>
            <Box className='student-assignment-list'>
              {assignments.map(assignment => {
                const submission = assignment.submissions?.[student.id]
                const grade = assignment.grades[student.id]
                return <Box key={assignment.id}>
                  <Flex justify='between' align='start'><Box><span className={`assignment-type ${assignment.type ?? 'tarea'}`}>{assignment.type ?? 'tarea'}</span><strong>{assignment.title}</strong></Box><Box className='student-grade'><strong>{grade ?? '—'}</strong><small>/{assignment.maxScore ?? 100}</small></Box></Flex>
                  <p>{assignment.description}</p>
                  <small>Fecha límite: {formatDate(assignment.dueDate)} · Peso: {assignment.weight ?? 0}%</small>
                  {assignment.feedback?.[student.id] && <blockquote>Retroalimentación: {assignment.feedback[student.id]}</blockquote>}
                  {assignment.deliverable && assignment.status === 'publicada' && <button onClick={() => setDelivery({ assignmentId: assignment.id, text: submission?.text ?? '' })}>{submission ? 'Actualizar entrega' : 'Realizar entrega'}</button>}
                  {submission && <span className='student-submitted'>✓ Entregado el {new Date(submission.submittedAt).toLocaleString('es-CO')}</span>}
                </Box>
              })}
              {!assignments.length && <Box className='student-empty-state'>Todavía no hay evaluaciones publicadas.</Box>}
            </Box>
          </Box>
        </Box>
      </main>

      {delivery && (
        <Box className='student-delivery-modal' onClick={() => setDelivery(null)}>
          <Box onClick={event => event.stopPropagation()}>
            <Flex justify='between' align='center'><Box><span>Entrega de actividad</span><Text as='h2'>{assignments.find(item => item.id === delivery.assignmentId)?.title}</Text></Box><button onClick={() => setDelivery(null)}>×</button></Flex>
            <label>Respuesta o enlace de evidencia<textarea rows={8} value={delivery.text} onChange={event => setDelivery({ ...delivery, text: event.target.value })} placeholder='Escriba su respuesta o pegue el enlace de la evidencia…' /></label>
            <Flex justify='end' gap='3'><button onClick={() => setDelivery(null)}>Cancelar</button><button className='primary' disabled={!delivery.text.trim()} onClick={submitDelivery}>Enviar actividad</button></Flex>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default StudentCoursePage
