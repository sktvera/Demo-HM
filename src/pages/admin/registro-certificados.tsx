import type { ReactElement } from 'react'
import { useMemo, useState } from 'react'
import Head from 'next/head'
import { Box, Flex, Text } from 'components'
import { AdminGuard } from 'components/admin-guard'
import { AdminShell } from 'layout/admin-shell'
import { useCertificateRecords } from 'platform-storage'
import type { CertificateRecord } from 'platform-storage'

import type { NextPageWithLayout } from '../_app'

const today = (): string => new Date().toISOString().slice(0, 10)

const oneYearFromToday = (): string => {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 1)
  return date.toISOString().slice(0, 10)
}

const createRecord = (): CertificateRecord => ({
  id: `certificate-${Date.now()}`,
  fullName: '',
  documentType: 'Cédula de ciudadanía',
  documentNumber: '',
  equipment: 'Montacargas contrabalanceada',
  trainingHours: 8,
  equipmentBrand: '',
  instructor: '',
  issuedAt: today(),
  certificationType: 'certificacion',
  limitedUse: '',
  expiresAt: oneYearFromToday(),
  contactInfo: 'HM Maquinaria · 304 242 5384',
  createdAt: new Date().toISOString(),
})

const inputStyle = {
  width: '100%',
  border: '1px solid #d9dce1',
  borderRadius: 10,
  padding: '11px 12px',
}

const Page: NextPageWithLayout = () => {
  const { records, saveRecord, deleteRecord } = useCertificateRecords()
  const [editing, setEditing] = useState<CertificateRecord | null>(null)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('todos')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [equipmentFilter, setEquipmentFilter] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 7

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return records.filter(record => {
      const matchesQuery =
        normalizedQuery === '' ||
        record.fullName.toLowerCase().includes(normalizedQuery) ||
        record.documentNumber.toLowerCase().includes(normalizedQuery) ||
        record.equipment.toLowerCase().includes(normalizedQuery)
      const matchesType =
        typeFilter === 'todos' || record.certificationType === typeFilter
      const active = record.expiresAt >= today()
      const matchesStatus = statusFilter === 'todos' || (statusFilter === 'vigente' ? active : !active)
      const matchesEquipment = !equipmentFilter || record.equipment === equipmentFilter
      return matchesQuery && matchesType && matchesStatus && matchesEquipment
    })
  }, [equipmentFilter, query, records, statusFilter, typeFilter])
  const equipmentOptions = Array.from(new Set(records.map(record => record.equipment))).filter(Boolean)
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize))
  const visibleRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize)

  const activeCount = records.filter(record => record.expiresAt >= today()).length
  const expiredCount = records.length - activeCount

  return (
    <AdminGuard permission='certificates.manage'>
      <Head><title>Registro de certificados | Administración HM</title></Head>
      <Box>
        <Flex justify='between' align='end' gap='4' css={{ flexWrap: 'wrap' }}>
          <Box>
            <Text as='h1' css={{ fontSize: '$7' }}>Registro de certificados emitidos</Text>
            <Text css={{ color: '$shade300' }}>
              Consulte y administre el historial de operadores certificados.
            </Text>
          </Box>
          <button type='button' className='admin-primary-button' onClick={() => setEditing(createRecord())}>
            + Registrar certificado
          </button>
        </Flex>

        <Box className='certificate-stats'>
          <Box><Text as='strong'>{records.length}</Text><Text>Total emitidos</Text></Box>
          <Box><Text as='strong'>{activeCount}</Text><Text>Vigentes</Text></Box>
          <Box><Text as='strong'>{expiredCount}</Text><Text>Vencidos</Text></Box>
        </Box>

        <Box className='certificate-filters certificate-filters-pro'>
          <input
            value={query}
            onChange={event => { setQuery(event.target.value); setPage(1) }}
            placeholder='Buscar por nombre, documento o equipo…'
          />
          <select value={typeFilter} onChange={event => { setTypeFilter(event.target.value); setPage(1) }}>
            <option value='todos'>Todos los tipos</option>
            <option value='certificacion'>Certificación</option>
            <option value='recertificacion'>Re-certificación</option>
          </select>
          <select value={equipmentFilter} onChange={event => { setEquipmentFilter(event.target.value); setPage(1) }}><option value=''>Todos los equipos</option>{equipmentOptions.map(equipment => <option key={equipment}>{equipment}</option>)}</select>
          <select value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setPage(1) }}><option value='todos'>Todos los estados</option><option value='vigente'>Vigentes</option><option value='vencido'>Vencidos</option></select>
        </Box>

        <Box className='certificate-table-wrap certificate-register-table'>
          <table className='certificate-table'>
            <thead>
              <tr>
                <th>Operador</th>
                <th>Documento</th>
                <th>Certificado</th>
                <th>Equipo</th>
                <th>Emisión</th>
                <th>Caducidad</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visibleRecords.map(record => {
                const active = record.expiresAt >= today()
                return (
                  <tr key={record.id}>
                    <td><strong>{record.fullName}</strong><small>{record.instructor}</small></td>
                    <td>{record.documentType}<small>{record.documentNumber}</small></td>
                    <td>{record.certificationType === 'recertificacion' ? 'Re-certificación' : 'Certificación'}<small>{record.trainingHours} horas</small></td>
                    <td>{record.equipment}<small>{record.equipmentBrand || 'Marca no especificada'}</small></td>
                    <td>{record.issuedAt}</td>
                    <td>{record.expiresAt}</td>
                    <td><span className={active ? 'status-pill active' : 'status-pill expired'}>{active ? 'Vigente' : 'Vencido'}</span></td>
                    <td><button type='button' className='admin-secondary-button' onClick={() => setEditing({ ...record })}>Editar</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {visibleRecords.length === 0 && (
            <Box css={{ padding: '$8', textAlign: 'center', color: '$shade300' }}>
              No hay certificados que coincidan con la búsqueda.
            </Box>
          )}
          <Flex className='access-pagination' justify='between' align='center'>
            <Text>Mostrando {visibleRecords.length} de {filteredRecords.length} certificados</Text>
            <Flex gap='2' css={{ width: 'auto' }}><button disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button><span>Página {page} de {totalPages}</span><button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Siguiente</button></Flex>
          </Flex>
        </Box>

        {editing && (
          <Box className='admin-modal access-drawer certificate-register-drawer' onClick={() => setEditing(null)}>
            <Box className='admin-modal-card certificate-modal' onClick={event => event.stopPropagation()}>
              <Flex className='certificate-drawer-head' justify='between' align='center'>
                <Box><span>Registro documental</span><Text as='h2'>{records.some(record => record.id === editing.id) ? 'Editar certificado' : 'Nuevo certificado'}</Text><Text css={{ color: '$shade300', fontSize: '$2' }}>Información del operador, capacitación y vigencia.</Text></Box>
                <button type='button' className='drawer-close' onClick={() => setEditing(null)}>×</button>
              </Flex>
              <Box className='certificate-drawer-scroll'><Box className='certificate-form-grid'>
                <label className='admin-field certificate-span-2'>Nombre completo
                  <input value={editing.fullName} onChange={event => setEditing({ ...editing, fullName: event.target.value })} style={inputStyle} />
                </label>
                <label className='admin-field'>Tipo de documento
                  <select value={editing.documentType} onChange={event => setEditing({ ...editing, documentType: event.target.value })} style={inputStyle}>
                    <option>Cédula de ciudadanía</option>
                    <option>Cédula de extranjería</option>
                    <option>Pasaporte</option>
                    <option>Permiso por protección temporal</option>
                  </select>
                </label>
                <label className='admin-field'>Número de documento
                  <input value={editing.documentNumber} onChange={event => setEditing({ ...editing, documentNumber: event.target.value })} style={inputStyle} />
                </label>
                <label className='admin-field'>Tipo de certificación
                  <select
                    value={editing.certificationType}
                    onChange={event =>
                      setEditing({
                        ...editing,
                        certificationType: event.target.value as CertificateRecord['certificationType'],
                        trainingHours: event.target.value === 'recertificacion' ? 4 : 8,
                      })
                    }
                    style={inputStyle}
                  >
                    <option value='certificacion'>Certificación normal</option>
                    <option value='recertificacion'>Re-certificación</option>
                  </select>
                </label>
                <label className='admin-field'>Horas de capacitación
                  <input type='number' min='1' value={editing.trainingHours} onChange={event => setEditing({ ...editing, trainingHours: Number(event.target.value) })} style={inputStyle} />
                </label>
                <label className='admin-field'>Equipo a certificar
                  <input value={editing.equipment} onChange={event => setEditing({ ...editing, equipment: event.target.value })} style={inputStyle} />
                </label>
                <label className='admin-field'>Marca del equipo (si aplica)
                  <input value={editing.equipmentBrand} onChange={event => setEditing({ ...editing, equipmentBrand: event.target.value })} style={inputStyle} />
                </label>
                <label className='admin-field certificate-span-2'>Instructor
                  <input value={editing.instructor} onChange={event => setEditing({ ...editing, instructor: event.target.value })} style={inputStyle} />
                </label>
                <label className='admin-field'>Fecha de emisión
                  <input type='date' value={editing.issuedAt} onChange={event => setEditing({ ...editing, issuedAt: event.target.value })} style={inputStyle} />
                </label>
                <label className='admin-field'>Fecha de caducidad
                  <input type='date' value={editing.expiresAt} onChange={event => setEditing({ ...editing, expiresAt: event.target.value })} style={inputStyle} />
                </label>
                <label className='admin-field certificate-span-2'>Uso limitado por
                  <textarea rows={3} value={editing.limitedUse} onChange={event => setEditing({ ...editing, limitedUse: event.target.value })} style={inputStyle} />
                </label>
                <label className='admin-field certificate-span-2'>Información de contacto del certificado
                  <textarea rows={3} value={editing.contactInfo} onChange={event => setEditing({ ...editing, contactInfo: event.target.value })} style={inputStyle} />
                </label>
              </Box></Box>
              <Flex className='certificate-drawer-footer' justify='between' gap='3'>
                {records.some(record => record.id === editing.id) ? (
                  <button
                    type='button'
                    className='admin-danger-button'
                    onClick={() => {
                      if (window.confirm('¿Eliminar este registro de certificado?')) {
                        deleteRecord(editing.id)
                        setEditing(null)
                      }
                    }}
                  >
                    Eliminar registro
                  </button>
                ) : <span />}
                <Flex gap='3' css={{ width: 'auto' }}>
                  <button type='button' className='admin-secondary-button' onClick={() => setEditing(null)}>Cancelar</button>
                  <button
                    type='button'
                    className='admin-primary-button'
                    disabled={!editing.fullName || !editing.documentNumber || !editing.instructor}
                    onClick={() => {
                      saveRecord(editing)
                      setEditing(null)
                    }}
                  >
                    Guardar certificado
                  </button>
                </Flex>
              </Flex>
            </Box>
          </Box>
        )}
      </Box>
    </AdminGuard>
  )
}

Page.getLayout = (page: ReactElement) => <AdminShell>{page}</AdminShell>

export default Page
