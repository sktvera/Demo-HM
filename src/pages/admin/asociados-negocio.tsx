import type { ReactElement } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { Box, Flex, Text } from 'components'
import { AdminGuard } from 'components/admin-guard'
import { AdminShell } from 'layout/admin-shell'
import { readAccessData, readAcademicCourses, readCertificateRecords, readPendingCertificates, savePendingCertificates } from 'platform-storage'
import type { CertificateRecord } from 'platform-storage'
import { calculateStudentProgress } from 'course-progress'

import type { NextPageWithLayout } from '../_app'

interface Quote { id: string; number: string; amount: number; order: string; collected: boolean }
interface Associate {
  id: string
  name: string
  kind: string
  taxId: string
  contact: string
  email: string
  phone: string
  address: string
  city: string
  website: string
  sector: string
  notes: string
  active: boolean
  userIds: string[]
  quotes: Quote[]
}
interface AssociatedQuote {
  id: string
  associateId: string
  number: string
  total: number
  sentAt: string
  status: 'pendiente' | 'aprobada' | 'rechazada'
  client: { company: string }
  rejectionReason?: string
  purchaseOrder?: { number: string; comment: string; registeredAt: string }
  collections?: Array<{ id: string; amount: number; registeredAt: string }>
}
type DrawerTab = 'basic' | 'contacts' | 'academic' | 'commercial'

const KEY = 'hm_business_associates'
const ASSOCIATED_QUOTES_KEY = 'hm_associated_quotes'
const PAGE_SIZE = 7
const emptyAssociate = (): Associate => ({
  id: `associate-${Date.now()}`, name: '', kind: 'Empresa', taxId: '', contact: '', email: '', phone: '',
  address: '', city: '', website: '', sector: '', notes: '', active: true, userIds: [], quotes: [],
})

const Page: NextPageWithLayout = () => {
  const router = useRouter()
  const { users } = readAccessData()
  const courses = readAcademicCourses()
  const certificates = readCertificateRecords()
  const [items, setItems] = useState<Associate[]>([])
  const [associatedQuotes, setAssociatedQuotes] = useState<AssociatedQuote[]>([])
  const [editing, setEditing] = useState<Associate | null>(null)
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('basic')
  const [search, setSearch] = useState('')
  const [kindFilter, setKindFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [certificateNotice, setCertificateNotice] = useState('')

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '[]') as Array<Partial<Associate>>
    setItems(saved.map(item => ({ ...emptyAssociate(), ...item, id: item.id ?? `associate-${Date.now()}`, quotes: item.quotes ?? [], userIds: item.userIds ?? [] })))
    setAssociatedQuotes(JSON.parse(localStorage.getItem(ASSOCIATED_QUOTES_KEY) ?? '[]') as AssociatedQuote[])
  }, [])

  const saveAll = (next: Associate[]): void => {
    setItems(next)
    localStorage.setItem(KEY, JSON.stringify(next))
  }
  const persistEditing = (): void => {
    if (!editing || !editing.name.trim()) return
    saveAll(items.some(item => item.id === editing.id) ? items.map(item => item.id === editing.id ? editing : item) : [...items, editing])
    setEditing(null)
  }
  const filtered = useMemo(() => items.filter(item => {
    const text = search.trim().toLowerCase()
    return (!text || [item.name, item.taxId, item.contact, item.email].some(value => value.toLowerCase().includes(text))) &&
      (!kindFilter || item.kind === kindFilter) &&
      (statusFilter === 'all' || (statusFilter === 'active' ? item.active : !item.active))
  }), [items, kindFilter, search, statusFilter])
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const relatedCourses = editing ? courses.filter(course => course.associateId === editing.id || course.organization === editing.name || course.studentIds.some(id => editing.userIds.includes(id))) : []
  const relatedStudentIds = editing ? Array.from(new Set(relatedCourses.flatMap(course => course.studentIds))) : []

  const openDrawer = (associate: Associate): void => {
    setEditing({ ...associate, userIds: [...associate.userIds], quotes: associate.quotes.map(quote => ({ ...quote })) })
    setDrawerTab('basic')
  }
  const quotesForAssociate = editing
    ? associatedQuotes.filter(quote => quote.associateId === editing.id || quote.client.company === editing.name)
    : []
  const collectedFor = (quote: AssociatedQuote): number => (quote.collections ?? []).reduce((sum, collection) => sum + collection.amount, 0)
  const approvedForCourse = (course: typeof courses[number]): Array<{ id: string; name: string; documentType?: string; documentNumber?: string }> => course.status !== 'finalizado' ? [] : course.studentIds
    .map(studentId => users.find(user => user.id === studentId))
    .filter((user): user is typeof users[number] => Boolean(user))
    .filter(user => calculateStudentProgress(course, user.id).approved)
  const certifyCourse = (course: typeof courses[number]): void => {
    const approved = approvedForCourse(course)
    const existing = readPendingCertificates()
    const registered = readCertificateRecords()
    const issuedAt = new Date().toISOString().slice(0, 10)
    const expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1)
    const newRecords: CertificateRecord[] = approved
      .filter(user => !existing.some(record => record.id === `certificate-${course.id}-${user.id}` || (record.documentNumber === (user.documentNumber || '') && record.equipment === course.title)) && !registered.some(record => record.id === `certificate-${course.id}-${user.id}` || (record.documentNumber === (user.documentNumber || '') && record.equipment === course.title)))
      .map(user => ({
        id: `certificate-${course.id}-${user.id}`,
        fullName: user.name,
        documentType: user.documentType || 'Documento de identidad',
        documentNumber: user.documentNumber || '',
        equipment: course.title,
        trainingHours: Math.max(1, course.sessions.length),
        equipmentBrand: '',
        instructor: users.find(item => item.id === course.teacherId)?.name ?? 'Instructor del curso',
        issuedAt,
        certificationType: 'certificacion',
        limitedUse: `Certificación correspondiente al curso ${course.title}.`,
        expiresAt: expires.toISOString().slice(0, 10),
        contactInfo: course.organization || 'HM Maquinaria',
        createdAt: new Date().toISOString(),
      }))
    savePendingCertificates([...existing, ...newRecords])
    setCertificateNotice(newRecords.length ? `${newRecords.length} certificados listos para imprimir.` : 'Los certificados seleccionados ya tienen registro o están en la cola.')
    void router.push(`/admin/certificados?pending=${newRecords.length}&course=${encodeURIComponent(course.id)}`)
    window.setTimeout(() => setCertificateNotice(''), 3500)
  }

  return <AdminGuard permission='academic.manage'>
    {certificateNotice && <Box className='course-ops-notice'>{certificateNotice}</Box>}
    <Flex className='associate-heading' justify='between' align='end'>
      <Box><Text as='h1' css={{ fontSize: '$7' }}>Asociados de negocio</Text><Text css={{ color: '$shade300' }}>Directorio central de empresas, instituciones y relaciones comerciales.</Text></Box>
      <button className='admin-primary-button' onClick={() => openDrawer(emptyAssociate())}>+ Crear asociado</button>
    </Flex>

    <Box className='associate-kpis'>
      <Box><span>Total asociados</span><strong>{items.length}</strong><small>Directorio registrado</small></Box>
      <Box><span>Cursos activos</span><strong>{courses.filter(course => course.status === 'activo' && items.some(item => item.name === course.organization)).length}</strong><small>Operaciones en curso</small></Box>
      <Box><span>Cotizaciones</span><strong>{associatedQuotes.length}</strong><small>Gestiones comerciales</small></Box>
      <Box><span>Recaudadas</span><strong>{associatedQuotes.filter(quote => collectedFor(quote) >= quote.total && quote.total > 0).length}</strong><small>Pagos confirmados</small></Box>
    </Box>

    <Box className='access-table-panel associate-table-panel'>
      <Box className='access-filters associate-filters'>
        <input value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} placeholder='Buscar empresa, NIT, contacto o correo…' />
        <select value={kindFilter} onChange={event => { setKindFilter(event.target.value); setPage(1) }}><option value=''>Todos los tipos</option><option>Empresa</option><option>Institución</option><option>Persona natural</option></select>
        <select value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setPage(1) }}><option value='all'>Todos los estados</option><option value='active'>Activos</option><option value='inactive'>Inactivos</option></select>
      </Box>
      <Box className='access-table-scroll'><table className='access-table associate-table'>
        <thead><tr><th>Asociado</th><th>Contacto principal</th><th>Usuarios</th><th>Cursos activos</th><th>Estado comercial</th><th>Estado</th><th /></tr></thead>
        <tbody>{visible.map(item => {
          const activeCourses = courses.filter(course => course.status === 'activo' && (course.organization === item.name || course.studentIds.some(id => item.userIds.includes(id)))).length
          const ordered = item.quotes.filter(quote => quote.order).length
          const collected = item.quotes.filter(quote => quote.collected).length
          return <tr key={item.id}>
            <td><Flex align='center' gap='3'><span className='associate-logo'>{item.name.slice(0, 2).toUpperCase()}</span><Box><strong>{item.name}</strong><small className='access-code'>{item.kind} · {item.taxId || 'Sin identificación'}</small></Box></Flex></td>
            <td><strong>{item.contact || 'Sin contacto'}</strong><small className='access-code'>{item.email || item.phone || 'Sin datos de contacto'}</small></td>
            <td><span className='access-count'>{item.userIds.length}</span></td>
            <td><strong>{activeCourses}</strong></td>
            <td><span className={collected ? 'associate-stage paid' : ordered ? 'associate-stage running' : 'associate-stage quoted'}>{collected ? 'Recaudado' : ordered ? 'En curso' : item.quotes.length ? 'Cotizado' : 'Sin gestión'}</span></td>
            <td><span className={item.active ? 'access-status active' : 'access-status inactive'}>{item.active ? 'Activo' : 'Inactivo'}</span></td>
            <td><button className='access-action' onClick={() => openDrawer(item)}>Editar →</button></td>
          </tr>
        })}</tbody>
      </table></Box>
      {!visible.length && <Box className='access-empty'><strong>No hay asociados para mostrar</strong><p>Cambie los filtros o cree el primer registro.</p></Box>}
      <Flex className='access-pagination' justify='between' align='center'><Text>Mostrando {visible.length} de {filtered.length} asociados</Text><Flex gap='2' css={{ width: 'auto' }}><button disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button><span>Página {page} de {pages}</span><button disabled={page === pages} onClick={() => setPage(page + 1)}>Siguiente</button></Flex></Flex>
    </Box>

    {editing && <Box className='admin-modal access-drawer associate-drawer' onClick={() => setEditing(null)}>
      <Box className='admin-modal-card' onClick={event => event.stopPropagation()}>
        <Box className='associate-drawer-header'>
          <Flex justify='between' align='center'><Box><span className='associate-eyebrow'>{items.some(item => item.id === editing.id) ? 'Editar asociado' : 'Nuevo asociado'}</span><Text as='h2'>{editing.name || 'Información del asociado'}</Text><Text css={{ color: '$shade300', fontSize: '$2' }}>Gestione su perfil, operación y relación comercial.</Text></Box><button className='drawer-close' onClick={() => setEditing(null)}>×</button></Flex>
          <Box className='associate-drawer-tabs'>
            {([['basic', 'Datos básicos'], ['contacts', 'Contactos y usuarios'], ['academic', 'Cursos y certificados'], ['commercial', 'Gestión comercial']] as Array<[DrawerTab, string]>).map(([value, label]) => <button className={drawerTab === value ? 'active' : ''} onClick={() => setDrawerTab(value)} key={value}>{label}</button>)}
          </Box>
        </Box>
        <Box className='associate-drawer-body'>
          {drawerTab === 'basic' && <Box className='associate-form-grid'>
            <label className='admin-field wide'>Razón social / nombre *<input value={editing.name} onChange={event => setEditing({ ...editing, name: event.target.value })} /></label>
            <label className='admin-field'>Tipo<select value={editing.kind} onChange={event => setEditing({ ...editing, kind: event.target.value })}><option>Empresa</option><option>Institución</option><option>Persona natural</option></select></label>
            <label className='admin-field'>NIT / identificación<input value={editing.taxId} onChange={event => setEditing({ ...editing, taxId: event.target.value })} /></label>
            <label className='admin-field'>Sector económico<input value={editing.sector} onChange={event => setEditing({ ...editing, sector: event.target.value })} placeholder='Ej. Logística' /></label>
            <label className='admin-field'>Ciudad<input value={editing.city} onChange={event => setEditing({ ...editing, city: event.target.value })} /></label>
            <label className='admin-field wide'>Dirección<input value={editing.address} onChange={event => setEditing({ ...editing, address: event.target.value })} /></label>
            <label className='admin-field wide'>Sitio web<input value={editing.website} onChange={event => setEditing({ ...editing, website: event.target.value })} placeholder='https://' /></label>
            <label className='admin-field wide'>Notas internas<textarea rows={4} value={editing.notes} onChange={event => setEditing({ ...editing, notes: event.target.value })} /></label>
            <label className='admin-check wide'><input type='checkbox' checked={editing.active} onChange={event => setEditing({ ...editing, active: event.target.checked })} /> Asociado activo</label>
          </Box>}

          {drawerTab === 'contacts' && <Box>
            <Box className='associate-form-grid'>
              <label className='admin-field wide'>Contacto principal<input value={editing.contact} onChange={event => setEditing({ ...editing, contact: event.target.value })} /></label>
              <label className='admin-field'>Correo<input type='email' value={editing.email} onChange={event => setEditing({ ...editing, email: event.target.value })} /></label>
              <label className='admin-field'>Teléfono<input value={editing.phone} onChange={event => setEditing({ ...editing, phone: event.target.value })} /></label>
            </Box>
            <Box className='associate-section-title'><strong>Alumnos relacionados</strong><span>{relatedStudentIds.length} del curso</span></Box>
            <Box className='associate-student-visual-list'>{relatedStudentIds.map(userId => {
              const user = users.find(item => item.id === userId)
              if (!user) return null
              return <Box key={user.id} className='associate-student-visual-card'><span className='associate-mini-avatar'>{user.name.slice(0, 2).toUpperCase()}</span><Box><strong>{user.name}</strong><small>{user.documentType || 'Documento'} · {user.documentNumber || 'Sin documento'}</small><small>{user.email}</small></Box><span className='associate-student-badge'>Alumno</span></Box>
            })}{!relatedStudentIds.length && <Box className='access-empty'><strong>Sin alumnos relacionados</strong><p>Los alumnos seleccionados en el curso aparecerán aquí automáticamente.</p></Box>}</Box>
          </Box>}

          {drawerTab === 'academic' && <Box>
            <Box className='associate-inline-stats'><Box><strong>{relatedCourses.length}</strong><span>Cursos relacionados</span></Box><Box><strong>{relatedCourses.filter(course => course.status === 'activo').length}</strong><span>Cursos activos</span></Box><Box><strong>{relatedStudentIds.reduce((sum, id) => sum + certificates.filter(certificate => certificate.fullName === users.find(user => user.id === id)?.name).length, 0)}</strong><span>Certificados</span></Box></Box>
            <Box className='associate-section-title'><strong>Historial académico</strong><span>Información calculada automáticamente</span></Box>
            <Box className='associate-record-list'>{relatedCourses.map(course => {
              const approvedCount = approvedForCourse(course).length
              return <Box key={course.id}><span className={`associate-stage ${course.status === 'activo' ? 'running' : 'quoted'}`}>{course.status}</span><strong>{course.title}</strong><small>{course.studentIds.filter(id => relatedStudentIds.includes(id)).length} alumnos relacionados · {course.sessions.length} sesiones</small>{course.status === 'finalizado' && <button className='associate-certify-button' disabled={!approvedCount} onClick={() => certifyCourse(course)}>Certificar {approvedCount} {approvedCount === 1 ? 'usuario aprobado' : 'usuarios aprobados'}</button>}</Box>
            })}{!relatedCourses.length && <Box className='access-empty'><strong>Sin cursos relacionados</strong><p>Al relacionar usuarios o usar la razón social en un curso aparecerá aquí.</p></Box>}</Box>
          </Box>}

          {drawerTab === 'commercial' && <Box>
            <Flex className='associate-commercial-readonly' justify='between' align='center'><Box><strong>Historial comercial</strong><small>Información sincronizada desde Oportunidades de negocio.</small></Box><span>Solo lectura</span></Flex>
            <Box className='associate-commercial-summary'><Box><span>Cotizaciones</span><strong>{quotesForAssociate.length}</strong></Box><Box><span>Aprobadas</span><strong>{quotesForAssociate.filter(quote => quote.status === 'aprobada').length}</strong></Box><Box><span>Con orden de compra</span><strong>{quotesForAssociate.filter(quote => quote.purchaseOrder).length}</strong></Box><Box><span>Pagadas</span><strong>{quotesForAssociate.filter(quote => collectedFor(quote) >= quote.total && quote.total > 0).length}</strong></Box></Box>
            <Box className='associate-commercial-list'>{quotesForAssociate.map(quote => {
              const collected = collectedFor(quote)
              const balance = Math.max(0, quote.total - collected)
              return <Box key={quote.id}>
                <Flex justify='between' align='start'><Box><strong>{quote.number}</strong><small>Enviada el {new Date(quote.sentAt).toLocaleDateString('es-CO')}</small></Box><span className={`opportunity-status ${quote.status}`}>{quote.status === 'pendiente' ? 'Pendiente de aprobación' : quote.status === 'aprobada' ? 'Aprobada' : 'Rechazada'}</span></Flex>
                <Box className='associate-commercial-data'><Box><span>Valor</span><strong>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(quote.total)}</strong></Box><Box><span>Orden de compra</span><strong>{quote.purchaseOrder?.number ?? 'No registrada'}</strong><small>{quote.purchaseOrder?.comment}</small></Box><Box><span>Recaudado</span><strong>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(collected)}</strong></Box><Box><span>Saldo</span><strong>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(balance)}</strong></Box></Box>
                {quote.rejectionReason && <Box className='associate-commercial-reason'><strong>Motivo de rechazo:</strong> {quote.rejectionReason}</Box>}
              </Box>
            })}{!quotesForAssociate.length && <Box className='access-empty'><strong>Sin cotizaciones asociadas</strong><p>Las cotizaciones creadas y enviadas para este asociado aparecerán automáticamente aquí.</p></Box>}</Box>
          </Box>}
        </Box>
        <Flex className='associate-drawer-footer' justify='between' align='center'><Text>{drawerTab === 'basic' ? '1' : drawerTab === 'contacts' ? '2' : drawerTab === 'academic' ? '3' : '4'} de 4 secciones</Text><Flex gap='3' css={{ width: 'auto' }}><button className='admin-secondary-button' onClick={() => setEditing(null)}>Cancelar</button><button className='admin-primary-button' disabled={!editing.name.trim()} onClick={persistEditing}>Guardar asociado</button></Flex></Flex>
      </Box>
    </Box>}
  </AdminGuard>
}

Page.getLayout = (page: ReactElement) => <AdminShell>{page}</AdminShell>
export default Page
