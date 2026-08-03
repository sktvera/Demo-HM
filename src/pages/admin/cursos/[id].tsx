import type { ReactElement } from 'react'
import { useMemo, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Box, Flex, Text } from 'components'
import { AdminGuard } from 'components/admin-guard'
import { AdminShell } from 'layout/admin-shell'
import {
  currentUser,
  useAccessManagement,
  useAcademicCourses,
} from 'platform-storage'
import type {
  AcademicCourse,
  AttendanceEntry,
  AttendanceStatus,
  CourseAssignment,
  CourseSession,
} from 'platform-storage'
import {
  calculateStudentProgress,
  courseAverageProgress,
} from 'course-progress'

import type { NextPageWithLayout } from '../../_app'

type Tab = 'resumen' | 'sesiones' | 'evaluaciones' | 'calificaciones' | 'resultados'

const uid = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`

const emptyAssignment = (session?: CourseSession): CourseAssignment => ({
  id: uid('assignment'),
  sessionId: session?.id ?? '',
  title: '',
  description: '',
  deliverable: true,
  grades: {},
  type: 'tarea',
  dueDate: session?.date ?? '',
  maxScore: 100,
  weight: 0,
  status: 'borrador',
  feedback: {},
  submissions: {},
})

const attendanceEntry = (
  value: boolean | AttendanceEntry | undefined
): AttendanceEntry => {
  if (typeof value === 'boolean') {
    return {
      status: value ? 'presente' : 'ausente',
      observation: '',
      recordedAt: '',
      recordedBy: '',
    }
  }
  return value ?? {
    status: 'presente',
    observation: '',
    recordedAt: '',
    recordedBy: '',
  }
}

const formatDate = (value?: string): string =>
  value
    ? new Date(`${value}T12:00:00`).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Sin fecha'

const percent = (value: number): string => `${Math.round(value)}%`

const CourseOperationsPage: NextPageWithLayout = () => {
  const router = useRouter()
  const { courses, saveCourse } = useAcademicCourses()
  const { users } = useAccessManagement()
  const courseId = typeof router.query.id === 'string' ? router.query.id : ''
  const course = courses.find(item => item.id === courseId)
  const [tab, setTab] = useState<Tab>('resumen')
  const [sessionDraft, setSessionDraft] = useState<CourseSession | null>(null)
  const [assignmentDraft, setAssignmentDraft] = useState<CourseAssignment | null>(null)
  const [deletingAssignment, setDeletingAssignment] = useState<CourseAssignment | null>(null)
  const [assignmentError, setAssignmentError] = useState('')
  const [notice, setNotice] = useState('')

  const students = useMemo(
    () => course ? users.filter(user => course.studentIds.includes(user.id)) : [],
    [course, users]
  )

  if (!router.isReady || !course) {
    return (
      <AdminGuard permission='academic.manage'>
        <Box className='course-ops-empty'>
          <strong>{router.isReady ? 'Curso no encontrado' : 'Cargando curso…'}</strong>
          {router.isReady && <button onClick={() => { void router.push('/admin/gestion-cursos') }}>Volver a Gestión de cursos</button>}
        </Box>
      </AdminGuard>
    )
  }

  const save = (next: AcademicCourse, message: string): void => {
    saveCourse(next)
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2600)
  }

  const completedSessions = course.sessions.filter(session => session.status === 'completada').length
  const publishedAssignments = course.assignments.filter(item => item.status === 'publicada')
  const pendingGrades = publishedAssignments.reduce(
    (total, assignment) =>
      total + students.filter(student => assignment.grades[student.id] === null || assignment.grades[student.id] === undefined).length,
    0
  )
  const studentProgress = students.map(student => ({
    student,
    progress: calculateStudentProgress(course, student.id),
  }))
  const atRisk = studentProgress.filter(item => item.progress.result === 'en_riesgo').length
  const approved = studentProgress.filter(item => item.progress.approved).length
  const weightTotal = publishedAssignments.reduce((total, item) => total + (item.weight ?? 0), 0)
  const orderedSessions = course.sessions.slice().sort((a, b) => a.date.localeCompare(b.date))
  const lastSessionDate = orderedSessions[orderedSessions.length - 1]?.date ?? ''
  const pendingAcademicSessions = orderedSessions
    .map((session, index) => ({ session, index, activities: course.assignments.filter(item => item.sessionId === session.id) }))
    .filter(item => item.activities.length === 0)
  const weightIsComplete = weightTotal >= 99.99

  const persistSession = (): void => {
    if (!sessionDraft) return
    const now = new Date().toISOString()
    const actor = currentUser()?.id ?? ''
    const attendance = Object.fromEntries(
      students.map(student => {
        const entry = attendanceEntry(sessionDraft.attendance[student.id])
        return [student.id, { ...entry, recordedAt: now, recordedBy: actor }]
      })
    )
    const updated = {
      ...sessionDraft,
      attendance,
      status: 'completada' as const,
      completedAt: now,
    }
    save(
      { ...course, sessions: course.sessions.map(item => item.id === updated.id ? updated : item) },
      'Asistencia y sesión guardadas correctamente.'
    )
    setSessionDraft(null)
  }

  const persistAssignment = (): void => {
    if (!assignmentDraft?.title.trim()) return
    if (!assignmentDraft.sessionId) {
      setAssignmentError('Seleccione la sesión a la que pertenece esta evaluación.')
      return
    }
    if (lastSessionDate && assignmentDraft.dueDate && assignmentDraft.dueDate > lastSessionDate) {
      setAssignmentError(`La fecha límite no puede ser posterior a la última sesión (${formatDate(lastSessionDate)}).`)
      return
    }
    const exists = course.assignments.some(item => item.id === assignmentDraft.id)
    save(
      {
        ...course,
        assignments: exists
          ? course.assignments.map(item => item.id === assignmentDraft.id ? assignmentDraft : item)
          : [...course.assignments, assignmentDraft],
      },
      'Evaluación guardada correctamente.'
    )
    setAssignmentError('')
    setAssignmentDraft(null)
  }

  const updateGrade = (assignmentId: string, studentId: string, value: string): void => {
    const assignment = course.assignments.find(item => item.id === assignmentId)
    if (!assignment) return
    const grade = value === '' ? null : Math.max(0, Math.min(assignment.maxScore ?? 100, Number(value)))
    saveCourse({
      ...course,
      assignments: course.assignments.map(item =>
        item.id === assignmentId
          ? { ...item, grades: { ...item.grades, [studentId]: grade } }
          : item
      ),
    })
  }

  return (
    <AdminGuard permission='academic.manage'>
      <Head><title>{course.title} | Gestión académica</title></Head>
      <Box className='course-ops'>
        <Flex className='course-ops-hero' justify='between' align='end' gap='4'>
          <Box>
            <button className='course-ops-back' onClick={() => { void router.push('/admin/gestion-cursos') }}>← Gestión de cursos</button>
            <span>Centro de operación académica</span>
            <Text as='h1'>{course.title}</Text>
            <Text>{course.organization || 'Sin organización'} · {users.find(user => user.id === course.teacherId)?.name ?? 'Sin instructor'} · Inicio {formatDate(course.startDate)}</Text>
          </Box>
          <span className={`course-ops-state ${course.status}`}>{course.status}</span>
        </Flex>

        {notice && <Box className='course-ops-notice'>✓ {notice}</Box>}

        <Box className='course-ops-tabs'>
          {([
            ['resumen', 'Resumen'],
            ['sesiones', 'Sesiones y asistencia'],
            ['evaluaciones', 'Tareas y evaluaciones'],
            ['calificaciones', 'Calificaciones'],
            ['resultados', 'Resultados'],
          ] as Array<[Tab, string]>).map(([value, label]) => (
            <button key={value} className={tab === value ? 'active' : ''} onClick={() => setTab(value)}>{label}</button>
          ))}
        </Box>

        {tab === 'resumen' && (
          <Box>
            <Box className='course-ops-kpis'>
              <Box><span>Progreso del curso</span><strong>{percent(courseAverageProgress(course))}</strong><small>{completedSessions} de {course.sessions.length} sesiones completadas</small></Box>
              <Box><span>Participantes</span><strong>{students.length}</strong><small>{atRisk} requieren atención</small></Box>
              <Box><span>Por calificar</span><strong>{pendingGrades}</strong><small>Registros pendientes</small></Box>
              <Box><span>Aprobados</span><strong>{approved}</strong><small>Confirmados al finalizar</small></Box>
            </Box>
            <Box className='course-ops-grid'>
              <Box className='course-ops-panel'>
                <Flex justify='between' align='center'><Box><span>Próximas sesiones</span><Text as='h2'>Agenda del curso</Text></Box><button onClick={() => setTab('sesiones')}>Ver todas →</button></Flex>
                <Box className='course-ops-agenda'>
                  {course.sessions.slice().sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5).map(session => (
                    <Box key={session.id}>
                      <time><strong>{new Date(`${session.date}T12:00:00`).getDate()}</strong><span>{new Date(`${session.date}T12:00:00`).toLocaleDateString('es-CO', { month: 'short' })}</span></time>
                      <Box><strong>{session.title}</strong><small>{session.startTime}–{session.endTime} · {session.topic ?? 'Tema por registrar'}</small></Box>
                      <span className={`session-state ${session.status ?? 'programada'}`}>{session.status ?? 'programada'}</span>
                    </Box>
                  ))}
                  {!course.sessions.length && <Box className='course-ops-zero'>No hay sesiones programadas.</Box>}
                </Box>
              </Box>
              <Box className='course-ops-panel'>
                <Flex justify='between' align='center'><Box><span>Seguimiento</span><Text as='h2'>Alumnos en riesgo</Text></Box><button onClick={() => setTab('resultados')}>Ver resultados →</button></Flex>
                <Box className='course-risk-list'>
                  {studentProgress.filter(item => item.progress.result === 'en_riesgo').slice(0, 5).map(({ student, progress }) => (
                    <Box key={student.id}>
                      <span className='course-student-avatar'>{student.name.slice(0, 2).toUpperCase()}</span>
                      <Box><strong>{student.name}</strong><small>Asistencia {percent(progress.attendancePercentage)} · Nota {progress.finalGrade.toFixed(1)}</small></Box>
                      <span className='risk-pill'>En riesgo</span>
                    </Box>
                  ))}
                  {!atRisk && <Box className='course-ops-zero'>No hay alumnos en riesgo por ahora.</Box>}
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {tab === 'sesiones' && (
          <Box className='course-ops-panel course-sessions-panel'>
            <Box className='course-section-heading'><Box><span>Control diario</span><Text as='h2'>Sesiones y toma de asistencia</Text><Text>Complete cada sesión y registre el estado de todos los participantes.</Text></Box></Box>
            <Box className='course-session-list'>
              {course.sessions.slice().sort((a, b) => a.date.localeCompare(b.date)).map(session => (
                <Box key={session.id}>
                  <time><strong>{new Date(`${session.date}T12:00:00`).getDate()}</strong><span>{new Date(`${session.date}T12:00:00`).toLocaleDateString('es-CO', { month: 'short' })}</span></time>
                  <Box><strong>{session.title}</strong><small>{session.startTime}–{session.endTime} · {session.topic ?? 'Tema pendiente'}</small></Box>
                  <span className={`session-state ${session.status ?? 'programada'}`}>{session.status ?? 'programada'}</span>
                  <button onClick={() => setSessionDraft({ ...session, attendance: { ...session.attendance } })}>{session.status === 'completada' ? 'Revisar asistencia' : 'Tomar asistencia'}</button>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {tab === 'evaluaciones' && (
          <Box className='course-ops-panel'>
            <Flex className='course-section-heading' justify='between' align='end' gap='3'>
              <Box><span>Contenido evaluable</span><Text as='h2'>Tareas y evaluaciones</Text><Text>Los pesos publicados deben sumar 100% para calcular la nota definitiva.</Text></Box>
              <button className='admin-primary-button' disabled={!orderedSessions.length || weightIsComplete} onClick={() => { setAssignmentError(''); setAssignmentDraft(emptyAssignment(orderedSessions[0])) }}>+ Nueva evaluación</button>
            </Flex>
            {weightIsComplete ? <Box className='course-plan-complete'>
              <span>✓</span><Box><strong>Plan académico completado</strong><p>El peso configurado llegó al 100% de 100%. Todas las evaluaciones del curso ya están planificadas.</p></Box>
            </Box> : <Box className='course-evaluation-sessions'>
              <Box className='evaluation-session-heading'><Box><span>Plan académico</span><strong>Sesiones y actividades</strong></Box><small>La fecha máxima de entrega es {formatDate(lastSessionDate)}.</small></Box>
              <Box className='evaluation-session-grid'>
                {pendingAcademicSessions.map(({ session, index }) => <Box key={session.id}>
                  <Box className='evaluation-session-date'><span>Sesión {index + 1}</span><strong>{formatDate(session.date)}</strong><small>{session.startTime}–{session.endTime}</small></Box>
                  <Box><strong>{session.title}</strong><small>{session.topic ?? 'Tema pendiente por registrar'}</small><span>Sin actividades</span></Box>
                  <button onClick={() => { setAssignmentError(''); setAssignmentDraft(emptyAssignment(session)) }}>+ Agregar actividad</button>
                </Box>)}
                {!orderedSessions.length && <Box className='course-ops-zero'>Primero configure y guarde las sesiones del curso.</Box>}
                {!!orderedSessions.length && !pendingAcademicSessions.length && <Box className='course-ops-zero'>Todas las sesiones ya tienen actividades. Ajuste sus pesos para completar el plan académico.</Box>}
              </Box>
            </Box>}
            <Box className={`course-weight ${Math.round(weightTotal) === 100 ? 'complete' : ''}`}>
              <Box><span>Peso configurado</span><strong>{weightTotal}% de 100%</strong><small className='course-weight-note'>Solo las actividades publicadas suman al peso.</small></Box>
              <div><i style={{ width: `${Math.min(weightTotal, 100)}%` }} /></div>
            </Box>
            <Box className='course-assignment-list'>
              {course.assignments.map(assignment => (
                <Box key={assignment.id}>
                  <span className={`assignment-type ${assignment.type ?? 'tarea'}`}>{assignment.type ?? 'tarea'}</span>
                  <Box><strong>{assignment.title}</strong><small>{course.sessions.find(session => session.id === assignment.sessionId)?.title ?? 'Sesión sin asignar'} · {assignment.description || 'Sin descripción'} · Vence {formatDate(assignment.dueDate)}</small></Box>
                  <span><strong>{assignment.weight ?? 0}%</strong><small>{assignment.maxScore ?? 100} puntos</small></span>
                  <span className={`assignment-state ${assignment.status ?? 'borrador'}`}>{assignment.status ?? 'borrador'}</span>
                  <Box className='course-assignment-actions'><button onClick={() => { setAssignmentError(''); setAssignmentDraft({ ...assignment, grades: { ...assignment.grades }, feedback: { ...assignment.feedback }, submissions: { ...assignment.submissions } }) }}>Editar</button><button className='course-assignment-delete' onClick={() => setDeletingAssignment(assignment)}>Eliminar</button></Box>
                </Box>
              ))}
              {!course.assignments.length && <Box className='course-ops-zero'>Cree la primera evaluación del curso.</Box>}
            </Box>
          </Box>
        )}

        {tab === 'calificaciones' && (
          <Box className='course-ops-panel'>
            <Box className='course-section-heading'><Box><span>Libro de notas</span><Text as='h2'>Calificaciones del curso</Text><Text>Registre valores sobre el puntaje máximo definido en cada evaluación.</Text></Box></Box>
            <Box className='gradebook-scroll'>
              <table className='course-gradebook'>
                <thead><tr><th>Alumno</th>{publishedAssignments.map(item => <th key={item.id}>{item.title}<small>{item.weight ?? 0}% · máx. {item.maxScore ?? 100}</small></th>)}<th>Definitiva</th></tr></thead>
                <tbody>
                  {students.map(student => {
                    const progress = calculateStudentProgress(course, student.id)
                    return <tr key={student.id}>
                      <td><strong>{student.name}</strong><small>{student.documentNumber ?? student.email}</small></td>
                      {publishedAssignments.map(assignment => <td key={assignment.id}><input type='number' min='0' max={assignment.maxScore ?? 100} value={assignment.grades[student.id] ?? ''} placeholder='—' onChange={event => updateGrade(assignment.id, student.id, event.target.value)} /></td>)}
                      <td><strong className={progress.finalGrade >= course.passingGrade ? 'grade-pass' : 'grade-risk'}>{progress.finalGrade.toFixed(1)}</strong><small>Mín. {course.passingGrade}</small></td>
                    </tr>
                  })}
                </tbody>
              </table>
            </Box>
          </Box>
        )}

        {tab === 'resultados' && (
          <Box className='course-ops-panel'>
            <Box className='course-section-heading'><Box><span>Decisión académica</span><Text as='h2'>Resultados de los alumnos</Text><Text>La aprobación requiere nota mínima de {course.passingGrade}, asistencia mínima de {course.minimumAttendance}% y todas las evaluaciones calificadas.</Text></Box></Box>
            <Box className='course-result-list'>
              {studentProgress.map(({ student, progress }) => (
                <Box key={student.id}>
                  <span className='course-student-avatar'>{student.name.slice(0, 2).toUpperCase()}</span>
                  <Box><strong>{student.name}</strong><small>{student.documentNumber ?? student.email}</small></Box>
                  <Box><span>Progreso</span><strong>{percent(progress.courseProgress)}</strong></Box>
                  <Box><span>Asistencia</span><strong>{percent(progress.attendancePercentage)}</strong><small>Mín. {course.minimumAttendance}%</small></Box>
                  <Box><span>Nota final</span><strong>{progress.finalGrade.toFixed(1)}</strong><small>Mín. {course.passingGrade}</small></Box>
                  <span className={`course-result ${progress.result}`}>{progress.result.replace('_', ' ')}</span>
                  <button onClick={() => { void router.push(`/formacion/cursos/${course.id}?student=${student.id}`) }}>Vista alumno ↗</button>
                </Box>
              ))}
            </Box>
            <Flex className='course-close-actions' justify='between' align='center' gap='3'>
              <Text>{course.status === 'finalizado' ? 'El curso está cerrado y los resultados son definitivos.' : 'Finalice el curso cuando asistencia y calificaciones estén completas.'}</Text>
              {course.status !== 'finalizado' && <button className='admin-primary-button' disabled={!students.length || pendingGrades > 0 || Math.round(weightTotal) !== 100} onClick={() => save({ ...course, status: 'finalizado' }, 'Curso finalizado. Los resultados ya son definitivos.')}>Finalizar curso</button>}
            </Flex>
          </Box>
        )}
      </Box>

      {sessionDraft && (
        <Box className='admin-modal access-drawer course-operation-drawer' onClick={() => setSessionDraft(null)}>
          <Box className='admin-modal-card' onClick={event => event.stopPropagation()}>
            <Flex className='operation-drawer-head' justify='between' align='center'><Box><span>Registro de sesión</span><Text as='h2'>{sessionDraft.title}</Text><Text>{formatDate(sessionDraft.date)} · {sessionDraft.startTime}–{sessionDraft.endTime}</Text></Box><button className='drawer-close' onClick={() => setSessionDraft(null)}>×</button></Flex>
            <Box className='operation-drawer-body'>
              <Box className='operation-session-fields'><label className='admin-field'>Tema impartido<input value={sessionDraft.topic ?? ''} onChange={event => setSessionDraft({ ...sessionDraft, topic: event.target.value })} /></label><label className='admin-field'>Observaciones generales<textarea rows={3} value={sessionDraft.notes ?? ''} onChange={event => setSessionDraft({ ...sessionDraft, notes: event.target.value })} /></label></Box>
              <Flex className='attendance-heading' justify='between' align='center'><Box><strong>Asistencia</strong><small>{students.length} participantes</small></Box><button onClick={() => setSessionDraft({ ...sessionDraft, attendance: Object.fromEntries(students.map(student => [student.id, { ...attendanceEntry(sessionDraft.attendance[student.id]), status: 'presente' }])) })}>Marcar todos presentes</button></Flex>
              <Box className='attendance-list'>
                {students.map(student => {
                  const entry = attendanceEntry(sessionDraft.attendance[student.id])
                  return <Box key={student.id}>
                    <span className='course-student-avatar'>{student.name.slice(0, 2).toUpperCase()}</span>
                    <Box><strong>{student.name}</strong><small>{student.documentNumber ?? student.email}</small></Box>
                    <select value={entry.status} onChange={event => setSessionDraft({ ...sessionDraft, attendance: { ...sessionDraft.attendance, [student.id]: { ...entry, status: event.target.value as AttendanceStatus } } })}><option value='presente'>Presente</option><option value='tarde'>Tarde</option><option value='ausente'>Ausente</option><option value='excusa'>Excusa</option></select>
                    <input value={entry.observation} placeholder='Observación opcional' onChange={event => setSessionDraft({ ...sessionDraft, attendance: { ...sessionDraft.attendance, [student.id]: { ...entry, observation: event.target.value } } })} />
                  </Box>
                })}
              </Box>
            </Box>
            <Flex className='operation-drawer-footer' justify='end' gap='3'><button className='admin-secondary-button' onClick={() => setSessionDraft(null)}>Cancelar</button><button className='admin-primary-button' onClick={persistSession}>Guardar y completar sesión</button></Flex>
          </Box>
        </Box>
      )}

      {assignmentDraft && (
        <Box className='admin-modal access-drawer course-operation-drawer' onClick={() => setAssignmentDraft(null)}>
          <Box className='admin-modal-card' onClick={event => event.stopPropagation()}>
            <Flex className='operation-drawer-head' justify='between' align='center'><Box><span>Contenido evaluable</span><Text as='h2'>{course.assignments.some(item => item.id === assignmentDraft.id) ? 'Editar evaluación' : 'Nueva evaluación'}</Text><Text>Configure puntaje, peso y fecha de entrega.</Text></Box><button className='drawer-close' onClick={() => setAssignmentDraft(null)}>×</button></Flex>
            <Box className='operation-drawer-body assignment-form'>
              <Box className='assignment-session-context wide'>
                <span>Programación del curso</span>
                <strong>{orderedSessions.length} sesiones · última sesión {formatDate(lastSessionDate)}</strong>
                <small>Asigne la actividad a la sesión donde será explicada, realizada o evaluada.</small>
              </Box>
              <label className='admin-field wide'>Título *<input value={assignmentDraft.title} onChange={event => setAssignmentDraft({ ...assignmentDraft, title: event.target.value })} /></label>
              <label className='admin-field wide'>Descripción<textarea rows={5} value={assignmentDraft.description} onChange={event => setAssignmentDraft({ ...assignmentDraft, description: event.target.value })} /></label>
              <label className='admin-field wide'>Sesión asociada *<select value={assignmentDraft.sessionId ?? ''} onChange={event => { const selected = orderedSessions.find(session => session.id === event.target.value); setAssignmentError(''); setAssignmentDraft({ ...assignmentDraft, sessionId: event.target.value, dueDate: selected?.date ?? assignmentDraft.dueDate }) }}><option value=''>Seleccione una sesión</option>{orderedSessions.map((session, index) => <option key={session.id} value={session.id}>Sesión {index + 1} · {formatDate(session.date)} · {session.startTime}–{session.endTime} · {session.title}</option>)}</select></label>
              <label className='admin-field'>Tipo<select value={assignmentDraft.type} onChange={event => setAssignmentDraft({ ...assignmentDraft, type: event.target.value as CourseAssignment['type'] })}><option value='tarea'>Tarea</option><option value='examen'>Examen teórico</option><option value='practica'>Evaluación práctica</option><option value='participacion'>Participación</option></select></label>
              <label className='admin-field'>Fecha límite<input type='date' max={lastSessionDate || undefined} value={assignmentDraft.dueDate ?? ''} onChange={event => { setAssignmentError(''); setAssignmentDraft({ ...assignmentDraft, dueDate: event.target.value }) }} /><small>No puede superar {formatDate(lastSessionDate)}.</small></label>
              <label className='admin-field'>Puntaje máximo<input type='number' min='1' value={assignmentDraft.maxScore ?? 100} onChange={event => setAssignmentDraft({ ...assignmentDraft, maxScore: Number(event.target.value) })} /></label>
              <label className='admin-field'>Peso en nota final (%)<input type='number' min='0' max='100' value={assignmentDraft.weight ?? 0} onChange={event => setAssignmentDraft({ ...assignmentDraft, weight: Number(event.target.value) })} /></label>
              <label className='admin-field'>Estado<select value={assignmentDraft.status} onChange={event => setAssignmentDraft({ ...assignmentDraft, status: event.target.value as CourseAssignment['status'] })}><option value='borrador'>Borrador</option><option value='publicada'>Publicada</option></select></label>
              <label className='admin-check'><input type='checkbox' checked={assignmentDraft.deliverable} onChange={event => setAssignmentDraft({ ...assignmentDraft, deliverable: event.target.checked })} /> Permitir entrega del alumno</label>
              {assignmentError && <Box className='assignment-form-error wide'>{assignmentError}</Box>}
            </Box>
            <Flex className='operation-drawer-footer' justify='end' gap='3'><button className='admin-secondary-button' onClick={() => setAssignmentDraft(null)}>Cancelar</button><button className='admin-primary-button' disabled={!assignmentDraft.title.trim()} onClick={persistAssignment}>Guardar evaluación</button></Flex>
          </Box>
        </Box>
      )}

      {deletingAssignment && <Box className='admin-modal course-delete-modal' onClick={() => setDeletingAssignment(null)}><Box className='admin-modal-card' onClick={event => event.stopPropagation()}>
        <span>Eliminar actividad</span>
        <Text as='h2'>¿Eliminar “{deletingAssignment.title}”?</Text>
        <Text>Se eliminará esta actividad y se liberará su peso de <strong>{deletingAssignment.weight ?? 0}%</strong> para que pueda crear una nueva.</Text>
        <Text className='course-delete-note'>También se eliminarán las calificaciones, entregas y retroalimentaciones asociadas a esta actividad.</Text>
        <Flex justify='end' gap='3'><button className='admin-secondary-button' onClick={() => setDeletingAssignment(null)}>Cancelar</button><button className='course-confirm-delete' onClick={() => { save({ ...course, assignments: course.assignments.filter(item => item.id !== deletingAssignment.id) }, 'Actividad eliminada y peso liberado.'); setDeletingAssignment(null) }}>Sí, eliminar actividad</button></Flex>
      </Box></Box>}
    </AdminGuard>
  )
}

CourseOperationsPage.getLayout = (page: ReactElement) => <AdminShell>{page}</AdminShell>

export default CourseOperationsPage
