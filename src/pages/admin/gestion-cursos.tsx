import type { ReactElement } from 'react'
import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Box, Flex, Text } from 'components'
import { AdminGuard } from 'components/admin-guard'
import { AdminShell } from 'layout/admin-shell'
import { useAccessManagement, useAcademicCourses } from 'platform-storage'
import type { AcademicCourse, AdminUser } from 'platform-storage'
import { readCertificationTemplates } from 'certification-templates'
import type { CertificationTemplate } from 'certification-templates'

import type { NextPageWithLayout } from '../_app'

interface Associate { id: string; name: string; taxId: string; active: boolean }
type Tab = 'basic' | 'students' | 'certifications' | 'schedule' | 'academic'
const ASSOCIATES_KEY = 'hm_business_associates'
const PAGE_SIZE = 7
const uid = (prefix: string): string => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
const today = (): string => new Date().toISOString().slice(0, 10)
const emptyCourse = (): AcademicCourse => ({ id: uid('course'), title: '', description: '', syllabus: [], teacherId: '', organization: '', studentIds: [], studentOrganizations: {}, sessions: [], assignments: [], passingGrade: 70, minimumAttendance: 80, certifiedStudentIds: [], status: 'borrador', createdAt: new Date().toISOString(), associateId: '', startDate: today(), certificationTemplateIds: [], studentRecertifications: {}, scheduleBlocks: [] })
const weekdays = [{ value: 1, label: 'Lun' }, { value: 2, label: 'Mar' }, { value: 3, label: 'Mié' }, { value: 4, label: 'Jue' }, { value: 5, label: 'Vie' }, { value: 6, label: 'Sáb' }, { value: 0, label: 'Dom' }]
const hoursBetween = (start: string, end: string): number => {
  const [startHour, startMinute] = start.split(':').map(Number)
  const [endHour, endMinute] = end.split(':').map(Number)
  return Math.max(0, ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / 60)
}
const scheduleFor = (course: AcademicCourse, templates: CertificationTemplate[]): { sessions: AcademicCourse['sessions']; endDate: string; plannedByCertification: Record<string, number> } => {
  if (!course.startDate) return { sessions: [], endDate: '', plannedByCertification: {} }
  const generated: AcademicCourse['sessions'] = []
  const plannedByCertification: Record<string, number> = {}
  let finalDate = ''
  for (const certificationId of course.certificationTemplateIds ?? []) {
    const required = templates.find(item => item.id === certificationId)?.hours ?? 0
    const blocks = (course.scheduleBlocks ?? []).filter(block => block.certificationTemplateId === certificationId && block.weekdays.length && hoursBetween(block.startTime, block.endTime) > 0)
    let accumulated = 0
    const cursor = new Date(`${course.startDate}T12:00:00`)
    let safety = 0
    while (accumulated < required && blocks.length && safety < 730) {
      for (const block of blocks.filter(item => item.weekdays.includes(cursor.getDay()))) {
        if (accumulated >= required) break
        const duration = hoursBetween(block.startTime, block.endTime)
        generated.push({ id: `${course.id}-${certificationId}-${cursor.toISOString().slice(0, 10)}-${block.startTime}`, title: templates.find(item => item.id === certificationId)?.name ?? 'Sesión', date: cursor.toISOString().slice(0, 10), startTime: block.startTime, endTime: block.endTime, certificationTemplateId: certificationId, attendance: course.sessions.find(session => session.date === cursor.toISOString().slice(0, 10) && session.startTime === block.startTime && session.certificationTemplateId === certificationId)?.attendance ?? {} })
        accumulated += duration
        finalDate = !finalDate || cursor.toISOString().slice(0, 10) > finalDate ? cursor.toISOString().slice(0, 10) : finalDate
      }
      cursor.setDate(cursor.getDate() + 1)
      safety += 1
    }
    plannedByCertification[certificationId] = accumulated
  }
  return { sessions: generated, endDate: finalDate, plannedByCertification }
}

const Page: NextPageWithLayout = () => {
  const router = useRouter()
  const { users, roles, teams, saveUser } = useAccessManagement()
  const { courses, saveCourse, deleteCourse } = useAcademicCourses()
  const [associates, setAssociates] = useState<Associate[]>([])
  const [certifications, setCertifications] = useState<CertificationTemplate[]>([])
  const [editing, setEditing] = useState<AcademicCourse | null>(null)
  const [tab, setTab] = useState<Tab>('basic')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [associateFilter, setAssociateFilter] = useState('')
  const [page, setPage] = useState(1)
  const [studentForm, setStudentForm] = useState({ name: '', email: '', documentType: 'Cédula de ciudadanía', documentNumber: '', birthDate: '' })
  const [showStudentForm, setShowStudentForm] = useState(false)
  const [syllabusDraft, setSyllabusDraft] = useState('')
  const [deleting, setDeleting] = useState<AcademicCourse | null>(null)

  useEffect(() => {
    setAssociates((JSON.parse(localStorage.getItem(ASSOCIATES_KEY) ?? '[]') as Associate[]).filter(item => item.active))
    setCertifications(readCertificationTemplates())
  }, [])

  const filtered = useMemo(() => courses.filter(course => {
    const text = search.trim().toLowerCase()
    return (!text || course.title.toLowerCase().includes(text) || course.description.toLowerCase().includes(text)) &&
      (!statusFilter || course.status === statusFilter) && (!associateFilter || course.associateId === associateFilter)
  }), [associateFilter, courses, search, statusFilter])
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const openCourse = (course: AcademicCourse): void => {
    setEditing({ ...course, associateId: course.associateId ?? '', startDate: course.startDate ?? '', certificationTemplateIds: course.certificationTemplateIds ?? [], studentRecertifications: course.studentRecertifications ?? {}, scheduleBlocks: course.scheduleBlocks ?? [], syllabus: [...course.syllabus], studentIds: [...course.studentIds] })
    setTab('basic')
    setSyllabusDraft(course.syllabus.join('\n'))
    setShowStudentForm(false)
  }
  const persist = (): void => {
    if (!editing?.title.trim() || !editing.teacherId || !editing.associateId) return
    const associate = associates.find(item => item.id === editing.associateId)
    const schedule = scheduleFor(editing, certifications)
    saveCourse({ ...editing, organization: associate?.name ?? editing.organization, syllabus: syllabusDraft.split('\n').map(value => value.trim()).filter(Boolean), sessions: schedule.sessions })
    setEditing(null)
  }
  const createStudent = (): void => {
    if (!editing || !studentForm.name.trim() || !studentForm.email.trim() || !studentForm.documentNumber.trim()) return
    const user: AdminUser = { id: uid('user'), name: studentForm.name.trim(), email: studentForm.email.trim(), password: `HM${studentForm.documentNumber}`, active: true, documentType: studentForm.documentType, documentNumber: studentForm.documentNumber.trim(), birthDate: studentForm.birthDate, assignments: [{ id: uid('assignment'), roleId: roles[0]?.id ?? '', teamId: teams[0]?.id ?? '' }] }
    saveUser(user)
    setEditing({ ...editing, studentIds: [...editing.studentIds, user.id], studentOrganizations: { ...editing.studentOrganizations, [user.id]: associates.find(item => item.id === editing.associateId)?.name ?? '' } })
    setStudentForm({ name: '', email: '', documentType: 'Cédula de ciudadanía', documentNumber: '', birthDate: '' })
    setShowStudentForm(false)
  }
  const schedulePreview = editing ? scheduleFor(editing, certifications) : { sessions: [], endDate: '', plannedByCertification: {} }

  return <AdminGuard permission='academic.manage'>
    <Head><title>Gestión de cursos | Administración HM</title></Head>
    <Flex className='course-management-heading' justify='between' align='end'><Box><Text as='h1' css={{ fontSize: '$7' }}>Gestión de cursos</Text><Text css={{ color: '$shade300' }}>Administre programación, participantes y certificaciones.</Text></Box><button className='admin-primary-button' onClick={() => openCourse(emptyCourse())}>+ Crear curso</button></Flex>
    <Box className='associate-kpis'><Box><span>Total cursos</span><strong>{courses.length}</strong><small>Programaciones registradas</small></Box><Box><span>Activos</span><strong>{courses.filter(course => course.status === 'activo').length}</strong><small>Actualmente en formación</small></Box><Box><span>Alumnos</span><strong>{new Set(courses.flatMap(course => course.studentIds)).size}</strong><small>Participantes únicos</small></Box><Box><span>Certificaciones</span><strong>{courses.reduce((sum, course) => sum + (course.certificationTemplateIds?.length ?? 0), 0)}</strong><small>Configuradas en cursos</small></Box></Box>
    <Box className='access-table-panel'>
      <Box className='access-filters course-management-filters'><input value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} placeholder='Buscar curso o descripción…' /><select value={associateFilter} onChange={event => { setAssociateFilter(event.target.value); setPage(1) }}><option value=''>Todos los asociados</option>{associates.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setPage(1) }}><option value=''>Todos los estados</option><option value='borrador'>Borrador</option><option value='activo'>Activo</option><option value='finalizado'>Finalizado</option></select></Box>
      <Box className='access-table-scroll'><table className='access-table course-management-table'><thead><tr><th>Curso</th><th>Asociado</th><th>Inicio</th><th>Instructor</th><th>Alumnos</th><th>Certificaciones</th><th>Estado</th><th /></tr></thead><tbody>{visible.map(course => <tr key={course.id}><td><strong>{course.title}</strong><small className='access-code'>{course.description ?? 'Sin descripción'}</small></td><td><strong>{associates.find(item => item.id === course.associateId)?.name ?? course.organization ?? 'Sin asociado'}</strong></td><td>{course.startDate ?? 'Sin fecha'}</td><td>{users.find(user => user.id === course.teacherId)?.name ?? 'Sin instructor'}</td><td><span className='access-count'>{course.studentIds.length}</span></td><td><strong>{course.certificationTemplateIds?.length ?? 0}</strong></td><td><span className={`course-status ${course.status}`}>{course.status}</span></td><td><Box className='course-row-actions'><button className='course-manage-action' onClick={() => { void router.push(`/admin/cursos/${course.id}`) }}>Gestionar</button><button className='access-action' onClick={() => openCourse(course)}>Editar</button><button className='course-delete-action' onClick={() => setDeleting(course)} aria-label={`Eliminar ${course.title}`}>Eliminar</button></Box></td></tr>)}</tbody></table></Box>
      {!visible.length && <Box className='access-empty'><strong>No hay cursos para mostrar</strong><p>Cambie los filtros o cree una nueva programación.</p></Box>}
      <Flex className='access-pagination' justify='between' align='center'><Text>Mostrando {visible.length} de {filtered.length} cursos</Text><Flex gap='2' css={{ width: 'auto' }}><button disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button><span>Página {page} de {pages}</span><button disabled={page === pages} onClick={() => setPage(page + 1)}>Siguiente</button></Flex></Flex>
    </Box>

    {editing && <Box className='admin-modal access-drawer course-drawer' onClick={() => setEditing(null)}><Box className='admin-modal-card' onClick={event => event.stopPropagation()}>
      <Box className='course-drawer-head'><Flex justify='between' align='center'><Box><span>Programación académica</span><Text as='h2'>{courses.some(course => course.id === editing.id) ? 'Editar curso' : 'Nuevo curso'}</Text><Text css={{ color: '$shade300', fontSize: '$2' }}>{editing.title || 'Configure la información del curso.'}</Text></Box><button className='drawer-close' onClick={() => setEditing(null)}>×</button></Flex><Box className='course-drawer-tabs'>{([['basic', 'Datos básicos'], ['students', 'Alumnos'], ['certifications', 'Certificaciones'], ['schedule', 'Horarios'], ['academic', 'Contenido']] as Array<[Tab, string]>).map(([value, label]) => <button key={value} className={tab === value ? 'active' : ''} onClick={() => setTab(value)}>{label}</button>)}</Box></Box>
      <Box className='course-drawer-body'>
        {tab === 'basic' && <Box className='associate-form-grid'><label className='admin-field wide'>Nombre del curso *<input value={editing.title} onChange={event => setEditing({ ...editing, title: event.target.value })} /></label><label className='admin-field wide'>Descripción<textarea rows={3} value={editing.description} onChange={event => setEditing({ ...editing, description: event.target.value })} /></label><label className='admin-field'>Asociado de negocio *<select value={editing.associateId ?? ''} onChange={event => setEditing({ ...editing, associateId: event.target.value })}><option value=''>Seleccione un asociado existente</option>{associates.map(item => <option key={item.id} value={item.id}>{item.name} · {item.taxId}</option>)}</select></label><label className='admin-field'>Fecha de inicio *<input type='date' value={editing.startDate ?? ''} onChange={event => setEditing({ ...editing, startDate: event.target.value })} /></label><label className='admin-field'>Instructor *<select value={editing.teacherId} onChange={event => setEditing({ ...editing, teacherId: event.target.value })}><option value=''>Seleccione instructor</option>{users.filter(user => user.active).map(user => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label><label className='admin-field'>Estado<select value={editing.status} onChange={event => setEditing({ ...editing, status: event.target.value as AcademicCourse['status'] })}><option value='borrador'>Borrador</option><option value='activo'>Activo</option><option value='finalizado'>Finalizado</option></select></label></Box>}
        {tab === 'students' && <Box><Flex justify='between' align='center'><Box><strong>Participantes del curso</strong><Text css={{ color: '$shade300', fontSize: '$2' }}>{editing.studentIds.length} alumnos seleccionados</Text></Box><button className='admin-secondary-button' onClick={() => setShowStudentForm(!showStudentForm)}>+ Registrar usuario</button></Flex>{showStudentForm && <Box className='course-new-student'><Box className='associate-form-grid'><label className='admin-field wide'>Nombre completo *<input value={studentForm.name} onChange={event => setStudentForm({ ...studentForm, name: event.target.value })} /></label><label className='admin-field'>Correo electrónico *<input type='email' value={studentForm.email} onChange={event => setStudentForm({ ...studentForm, email: event.target.value })} /></label><label className='admin-field'>Tipo de documento<select value={studentForm.documentType} onChange={event => setStudentForm({ ...studentForm, documentType: event.target.value })}><option>Cédula de ciudadanía</option><option>Cédula de extranjería</option><option>Pasaporte</option><option>Permiso por protección temporal</option></select></label><label className='admin-field'>Número de documento *<input value={studentForm.documentNumber} onChange={event => setStudentForm({ ...studentForm, documentNumber: event.target.value })} /></label><label className='admin-field'>Fecha de nacimiento<input type='date' value={studentForm.birthDate} onChange={event => setStudentForm({ ...studentForm, birthDate: event.target.value })} /></label></Box><Flex justify='end'><button className='admin-primary-button' disabled={!studentForm.name || !studentForm.email || !studentForm.documentNumber} onClick={createStudent}>Guardar y agregar al curso</button></Flex></Box>}<Box className='course-student-picker'>{users.filter(user => user.id !== editing.teacherId).map(user => <Box key={user.id}><label><input type='checkbox' checked={editing.studentIds.includes(user.id)} onChange={event => setEditing({ ...editing, studentIds: event.target.checked ? [...editing.studentIds, user.id] : editing.studentIds.filter(id => id !== user.id) })} /><span className='associate-mini-avatar'>{user.name.slice(0, 2).toUpperCase()}</span><span><strong>{user.name}</strong><small>{user.email} · {user.documentNumber ?? 'Sin documento'}</small></span></label>{editing.studentIds.includes(user.id) && <label className='course-recertification'><input type='checkbox' checked={editing.studentRecertifications?.[user.id] ?? false} onChange={event => setEditing({ ...editing, studentRecertifications: { ...editing.studentRecertifications, [user.id]: event.target.checked } })} /> Aplica re-certificación</label>}</Box>)}</Box></Box>}
        {tab === 'certifications' && <Box><Box className='course-certification-intro'><strong>Certificaciones del curso</strong><p>Seleccione una o varias certificaciones de la biblioteca. Cada alumno podrá estar marcado como certificación o re-certificación.</p></Box><Box className='course-certification-picker'>{certifications.filter(item => item.active).map(item => <label key={item.id}><input type='checkbox' checked={editing.certificationTemplateIds?.includes(item.id) ?? false} onChange={event => setEditing({ ...editing, certificationTemplateIds: event.target.checked ? [...(editing.certificationTemplateIds ?? []), item.id] : (editing.certificationTemplateIds ?? []).filter(id => id !== item.id) })} /><Box><strong>{item.name}</strong><small>{item.equipment} · {item.hours} horas · {item.equipmentBrand || 'Todas las marcas'}</small><p>{item.description}</p></Box></label>)}</Box></Box>}
        {tab === 'schedule' && <Box className='course-scheduler'>
          <Box className='course-scheduler-hero'>
            <Box><span className='course-scheduler-eyebrow'>Planificador inteligente</span><strong>Construya el calendario del curso</strong><p>Defina jornadas por certificación. La plataforma calcula la fecha final y crea automáticamente las sesiones de asistencia.</p></Box>
            <Box className='course-scheduler-start'><span>Fecha de inicio</span><strong>{editing.startDate ? new Date(`${editing.startDate}T12:00:00`).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin definir'}</strong><small>Configurada en Datos básicos</small></Box>
          </Box>
          <Box className='course-schedule-overview'>
            <Box><i>01</i><span>Carga académica</span><strong>{(editing.certificationTemplateIds ?? []).reduce((sum, id) => sum + (certifications.find(item => item.id === id)?.hours ?? 0), 0)} horas</strong><small>Horas totales requeridas</small></Box>
            <Box><i>02</i><span>Agenda proyectada</span><strong>{schedulePreview.sessions.length} sesiones</strong><small>Registros de asistencia</small></Box>
            <Box className={schedulePreview.endDate ? 'ready' : ''}><i>03</i><span>Finalización estimada</span><strong>{schedulePreview.endDate ? new Date(`${schedulePreview.endDate}T12:00:00`).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Por calcular'}</strong><small>{schedulePreview.endDate ? 'Calendario completo' : 'Complete las jornadas'}</small></Box>
          </Box>
          {!(editing.certificationTemplateIds ?? []).length ? <Box className='course-scheduler-empty'><span>◷</span><strong>Aún no hay certificaciones seleccionadas</strong><p>Vaya al tab Certificaciones, seleccione al menos una y regrese para construir su horario.</p><button className='admin-primary-button' onClick={() => setTab('certifications')}>Seleccionar certificaciones →</button></Box> : <Box>
            <Flex className='course-schedule-title' justify='between' align='center'><Box><span>Paso 1</span><strong>Configure las jornadas</strong><small>Puede crear horarios diferentes para cada certificación.</small></Box><button className='course-add-schedule' onClick={() => setEditing({ ...editing, scheduleBlocks: [...(editing.scheduleBlocks ?? []), { id: uid('schedule'), certificationTemplateId: editing.certificationTemplateIds?.[0] ?? '', weekdays: [], startTime: '07:00', endTime: '08:00' }] })}><b>＋</b><span>Agregar jornada<small>Nuevo bloque de días y horas</small></span></button></Flex>
            {!(editing.scheduleBlocks ?? []).length && <Box className='course-schedule-first'><span>＋</span><Box><strong>Agregue su primera jornada</strong><p>Ejemplo: lunes, miércoles y viernes de 7:00 a. m. a 8:00 a. m.</p></Box></Box>}
            <Box className='course-schedule-list'>{(editing.scheduleBlocks ?? []).map((block, blockIndex) => {
              const certification = certifications.find(item => item.id === block.certificationTemplateId)
              const dailyHours = hoursBetween(block.startTime, block.endTime)
              const weeklyHours = dailyHours * block.weekdays.length
              const invalidTime = dailyHours <= 0
              return <Box key={block.id} className={invalidTime || !block.weekdays.length ? 'needs-attention' : ''}>
                <Box className='course-schedule-card-head'><Box className='course-schedule-number'>{String(blockIndex + 1).padStart(2, '0')}</Box><label><span>Esta jornada aplica para</span><select value={block.certificationTemplateId} onChange={event => setEditing({ ...editing, scheduleBlocks: (editing.scheduleBlocks ?? []).map(item => item.id === block.id ? { ...item, certificationTemplateId: event.target.value } : item) })}>{(editing.certificationTemplateIds ?? []).map(id => <option value={id} key={id}>{certifications.find(item => item.id === id)?.name}</option>)}</select></label><button title='Eliminar jornada' onClick={() => setEditing({ ...editing, scheduleBlocks: (editing.scheduleBlocks ?? []).filter(item => item.id !== block.id) })}>×</button></Box>
                <Box className='course-schedule-card-body'>
                  <Box className='course-day-selector'><Box><strong>Días de clase</strong><small>Seleccione uno o varios días</small></Box><Box className='course-weekdays'>{weekdays.map(day => <label className={block.weekdays.includes(day.value) ? 'active' : ''} key={day.value}><input type='checkbox' checked={block.weekdays.includes(day.value)} onChange={event => setEditing({ ...editing, scheduleBlocks: (editing.scheduleBlocks ?? []).map(item => item.id === block.id ? { ...item, weekdays: event.target.checked ? [...item.weekdays, day.value] : item.weekdays.filter(value => value !== day.value) } : item) })} /><span>{day.label.slice(0, 1)}</span><small>{day.label}</small></label>)}</Box></Box>
                  <Box className='course-time-range'><Box className='course-time-title'><strong>Horario de la jornada</strong><small>Defina la duración de cada sesión</small></Box><label><span>Hora de inicio</span><input type='time' value={block.startTime} onChange={event => setEditing({ ...editing, scheduleBlocks: (editing.scheduleBlocks ?? []).map(item => item.id === block.id ? { ...item, startTime: event.target.value } : item) })} /></label><span>→</span><label><span>Hora de cierre</span><input type='time' value={block.endTime} onChange={event => setEditing({ ...editing, scheduleBlocks: (editing.scheduleBlocks ?? []).map(item => item.id === block.id ? { ...item, endTime: event.target.value } : item) })} /></label><Box className='course-weekly-result'><span>Intensidad semanal</span><strong>{invalidTime ? 'Horario inválido' : `${weeklyHours} h / semana`}</strong><small>{dailyHours > 0 ? `${dailyHours} h por sesión · ${block.weekdays.length} ${block.weekdays.length === 1 ? 'día' : 'días'}` : 'La hora final debe ser posterior'}</small></Box></Box>
                  {(!block.weekdays.length || invalidTime) && <Box className='course-schedule-warning'>! {!block.weekdays.length ? 'Seleccione al menos un día para generar las sesiones.' : 'Revise la hora de inicio y cierre de esta jornada.'}</Box>}
                </Box>
              </Box>
            })}</Box>
            <Box className='course-schedule-results'>
              <Box className='course-hour-progress'><Box className='course-results-title'><span>Paso 2</span><strong>Cobertura por certificación</strong><small>Validación automática de las horas requeridas.</small></Box>{(editing.certificationTemplateIds ?? []).map(id => {
                const certification = certifications.find(item => item.id === id)
                const planned = schedulePreview.plannedByCertification[id] ?? 0
                const required = certification?.hours ?? 0
                const remaining = Math.max(0, required - planned)
                const percentage = Math.min(100, planned / Math.max(1, required) * 100)
                return <Box key={id}><Flex justify='between'><Box><strong>{certification?.name}</strong><small>{required} horas requeridas</small></Box><span className={remaining ? 'pending' : 'complete'}>{remaining > 0 ? `${remaining} h pendientes` : '✓ Programación completa'}</span></Flex><div><i style={{ width: `${percentage}%` }} /></div><small>{Math.round(percentage)}% cubierto</small></Box>
              })}</Box>
              <Box className='course-schedule-preview'><Box className='course-results-title'><span>Paso 3</span><strong>Próximas sesiones</strong><small>Vista previa de asistencias.</small></Box>{schedulePreview.sessions.length ? <Box className='course-session-timeline'>{schedulePreview.sessions.slice(0, 5).map((session, index) => <Box key={`${session.date}-${session.startTime}-${index}`}><time><strong>{new Date(`${session.date}T12:00:00`).toLocaleDateString('es-CO', { day: '2-digit' })}</strong><span>{new Date(`${session.date}T12:00:00`).toLocaleDateString('es-CO', { month: 'short' })}</span></time><i /><Box><strong>{weekdays.find(day => day.value === new Date(`${session.date}T12:00:00`).getDay())?.label}</strong><small>{session.startTime} – {session.endTime} · {certifications.find(item => item.id === session.certificationTemplateId)?.name}</small></Box></Box>)}</Box> : <Box className='course-preview-placeholder'><span>◷</span><p>Las sesiones aparecerán al completar una jornada válida.</p></Box>}{schedulePreview.sessions.length > 5 && <small className='course-more-sessions'>+ {schedulePreview.sessions.length - 5} sesiones adicionales</small>}</Box>
            </Box>
            {schedulePreview.endDate && <Box className='course-end-date'><span>✓</span><Box><small>PROGRAMACIÓN COMPLETA</small><strong>El curso finalizará el {new Date(`${schedulePreview.endDate}T12:00:00`).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong><p>Al guardar se crearán {schedulePreview.sessions.length} sesiones listas para registrar la asistencia de los alumnos.</p></Box></Box>}
          </Box>}
        </Box>}
        {tab === 'academic' && <Box><label className='admin-field'>Temario / pensum<textarea rows={9} value={syllabusDraft} onChange={event => setSyllabusDraft(event.target.value)} placeholder={'Un tema por línea\nSeguridad operacional\nInspección preoperacional'} /></label><Box className='associate-form-grid'><label className='admin-field'>Nota mínima<input type='number' value={editing.passingGrade} onChange={event => setEditing({ ...editing, passingGrade: Number(event.target.value) })} /></label><label className='admin-field'>Asistencia mínima (%)<input type='number' value={editing.minimumAttendance} onChange={event => setEditing({ ...editing, minimumAttendance: Number(event.target.value) })} /></label></Box><Box className='course-content-stats'><Box><strong>{editing.sessions.length}</strong><span>Sesiones</span></Box><Box><strong>{editing.assignments.length}</strong><span>Tareas / entregables</span></Box><Box><strong>{syllabusDraft.split('\n').filter(Boolean).length}</strong><span>Temas</span></Box></Box></Box>}
      </Box>
      <Flex className='course-drawer-footer' justify='between' align='center'><Text>{tab === 'basic' ? '1' : tab === 'students' ? '2' : tab === 'certifications' ? '3' : tab === 'schedule' ? '4' : '5'} de 5 secciones</Text><Flex gap='3' css={{ width: 'auto' }}><button className='admin-secondary-button' onClick={() => setEditing(null)}>Cancelar</button><button className='admin-primary-button' disabled={!editing.title.trim() || !editing.teacherId || !editing.associateId || !editing.startDate} onClick={persist}>Guardar curso</button></Flex></Flex>
    </Box></Box>}

    {deleting && <Box className='admin-modal course-delete-modal' onClick={() => setDeleting(null)}><Box className='admin-modal-card' onClick={event => event.stopPropagation()}>
      <span>Acción irreversible</span>
      <Text as='h2'>¿Eliminar este curso?</Text>
      <Text>Se eliminará <strong>{deleting.title}</strong> y todos sus registros académicos asociados.</Text>
      <Box className='course-delete-summary'>
        <Box><strong>{deleting.studentIds.length}</strong><span>matrículas</span></Box>
        <Box><strong>{deleting.sessions.length}</strong><span>sesiones y asistencias</span></Box>
        <Box><strong>{deleting.assignments.length}</strong><span>tareas y calificaciones</span></Box>
      </Box>
      <Text className='course-delete-note'>Los usuarios y alumnos no serán eliminados, porque podrían estar vinculados a otros cursos.</Text>
      <Flex justify='end' gap='3'><button className='admin-secondary-button' onClick={() => setDeleting(null)}>Cancelar</button><button className='course-confirm-delete' onClick={() => { deleteCourse(deleting.id); setDeleting(null); setPage(1) }}>Sí, eliminar curso</button></Flex>
    </Box></Box>}
  </AdminGuard>
}

Page.getLayout = (page: ReactElement) => <AdminShell>{page}</AdminShell>
export default Page
