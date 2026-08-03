import type { ReactElement } from 'react'
import { useMemo, useState } from 'react'
import Head from 'next/head'
import { Box, Flex, Text } from 'components'
import { AdminGuard } from 'components/admin-guard'
import { AdminShell } from 'layout/admin-shell'
import {
  permissionLabels,
  useAccessManagement,
} from 'platform-storage'
import type {
  AdminRole,
  AdminUser,
  Permission,
  WorkTeam,
} from 'platform-storage'

import type { NextPageWithLayout } from '../_app'

type Tab = 'users' | 'roles' | 'teams'

const inputStyle = {
  width: '100%',
  border: '1px solid #d9dce1',
  borderRadius: 10,
  padding: '11px 12px',
}

const createId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`

const Page: NextPageWithLayout = () => {
  const { users, roles, teams, saveUser, saveRole, saveTeam } = useAccessManagement()
  const [tab, setTab] = useState<Tab>('users')
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null)
  const [editingTeam, setEditingTeam] = useState<WorkTeam | null>(null)
  const [search, setSearch] = useState('')
  const [teamFilter, setTeamFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [roleSearch, setRoleSearch] = useState('')
  const [permissionFilter, setPermissionFilter] = useState('')
  const [rolePage, setRolePage] = useState(1)
  const [teamSearch, setTeamSearch] = useState('')
  const [teamSizeFilter, setTeamSizeFilter] = useState('all')
  const [teamPage, setTeamPage] = useState(1)
  const pageSize = 6
  const filteredUsers = useMemo(() => users.filter(user => {
    const text = search.trim().toLowerCase()
    return (!text || user.name.toLowerCase().includes(text) || user.email.toLowerCase().includes(text)) &&
      (!teamFilter || user.assignments.some(item => item.teamId === teamFilter)) &&
      (!roleFilter || user.assignments.some(item => item.roleId === roleFilter)) &&
      (statusFilter === 'all' || (statusFilter === 'active' ? user.active : !user.active))
  }), [roleFilter, search, statusFilter, teamFilter, users])
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const visibleUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize)
  const filteredRoles = useMemo(() => roles.filter(role => {
    const text = roleSearch.trim().toLowerCase()
    return (!text || role.name.toLowerCase().includes(text) || role.description.toLowerCase().includes(text)) &&
      (!permissionFilter || role.permissions.includes(permissionFilter as Permission))
  }), [permissionFilter, roleSearch, roles])
  const roleTotalPages = Math.max(1, Math.ceil(filteredRoles.length / pageSize))
  const visibleRoles = filteredRoles.slice((rolePage - 1) * pageSize, rolePage * pageSize)
  const filteredTeams = useMemo(() => teams.filter(team => {
    const text = teamSearch.trim().toLowerCase()
    const members = users.filter(user => user.assignments.some(assignment => assignment.teamId === team.id)).length
    return (!text || team.name.toLowerCase().includes(text) || team.description.toLowerCase().includes(text)) &&
      (teamSizeFilter === 'all' || (teamSizeFilter === 'with' ? members > 0 : members === 0))
  }), [teamSearch, teamSizeFilter, teams, users])
  const teamTotalPages = Math.max(1, Math.ceil(filteredTeams.length / pageSize))
  const visibleTeams = filteredTeams.slice((teamPage - 1) * pageSize, teamPage * pageSize)

  const panelTitle = tab === 'users' ? 'Usuarios' : tab === 'roles' ? 'Roles y permisos' : 'Equipos de trabajo'

  return (
    <AdminGuard permission='users.manage'>
      <Head><title>Usuarios y accesos | Administración HM</title></Head>
      <Box>
        <Text as='h1' css={{ fontSize: '$7' }}>Usuarios y control de acceso</Text>
        <Text css={{ color: '$shade300', marginTop: '$2' }}>
          Cada usuario pertenece a un equipo y recibe permisos mediante un rol.
        </Text>

        <Flex gap='2' css={{ margin: '$6 0', flexWrap: 'wrap' }}>
          {([
            ['users', 'Usuarios'],
            ['roles', 'Roles y permisos'],
            ['teams', 'Equipos'],
          ] as Array<[Tab, string]>).map(([value, label]) => (
            <button
              type='button'
              key={value}
              onClick={() => setTab(value)}
              className={tab === value ? 'access-tab active' : 'access-tab'}
            >
              {label}
            </button>
          ))}
        </Flex>

        <Flex justify='between' align='center' css={{ marginBottom: '$4' }}>
          <Text as='h2' css={{ fontSize: '$6' }}>{panelTitle}</Text>
          <button
            type='button'
            className='admin-primary-button'
            onClick={() => {
              if (tab === 'users') {
                setEditingUser({
                  id: createId('user'),
                  name: '',
                  email: '',
                  password: '',
                  assignments: [
                    {
                      id: createId('assignment'),
                      roleId: roles[0]?.id ?? '',
                      teamId: teams[0]?.id ?? '',
                    },
                  ],
                  active: true,
                })
              } else if (tab === 'roles') {
                setEditingRole({ id: createId('role'), name: '', description: '', permissions: ['dashboard.view'] })
              } else {
                setEditingTeam({ id: createId('team'), name: '', description: '' })
              }
            }}
          >
            + Crear {tab === 'users' ? 'usuario' : tab === 'roles' ? 'rol' : 'equipo'}
          </button>
        </Flex>

        {tab === 'users' && (
          <Box className='access-table-panel'>
            <Box className='access-filters'>
              <input value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} placeholder='Buscar por nombre o correo…' />
              <select value={teamFilter} onChange={event => { setTeamFilter(event.target.value); setPage(1) }}><option value=''>Todos los equipos</option>{teams.map(team => <option value={team.id} key={team.id}>{team.name}</option>)}</select>
              <select value={roleFilter} onChange={event => { setRoleFilter(event.target.value); setPage(1) }}><option value=''>Todos los roles</option>{roles.map(role => <option value={role.id} key={role.id}>{role.name}</option>)}</select>
              <select value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setPage(1) }}><option value='all'>Todos los estados</option><option value='active'>Activos</option><option value='inactive'>Inactivos</option></select>
            </Box>
            <Box className='access-table-scroll'><table className='access-table'>
              <thead><tr><th>Usuario</th><th>Asignaciones</th><th>Equipos y roles</th><th>Estado</th><th /></tr></thead>
              <tbody>{visibleUsers.map(user => (
                <tr key={user.id}>
                  <td><Flex align='center' gap='3'><Box className='user-avatar'>{user.name.slice(0, 2).toUpperCase()}</Box><Box>
                    <Text css={{ fontWeight: '$bold' }}>{user.name}</Text>
                    <Text css={{ color: '$shade300', fontSize: '$2' }}>{user.email}</Text>
                  </Box></Flex></td>
                  <td><strong>{user.assignments.length}</strong> asignación{user.assignments.length === 1 ? '' : 'es'}</td>
                  <td><Box className='assignment-summary'>
                    {user.assignments.slice(0, 2).map(assignment => (
                      <span key={assignment.id}>
                        {teams.find(team => team.id === assignment.teamId)?.name ?? 'Equipo'} ·{' '}
                        {roles.find(role => role.id === assignment.roleId)?.name ?? 'Rol'}
                      </span>
                    ))}
                  </Box></td>
                  <td><span className={user.active ? 'access-status active' : 'access-status inactive'}>{user.active ? 'Activo' : 'Inactivo'}</span></td>
                  <td><button type='button' className='access-action' onClick={() => setEditingUser({ ...user })}>Editar →</button></td>
                </tr>
              ))}</tbody></table></Box>
            {visibleUsers.length === 0 && <Box className='access-empty'><strong>Sin resultados</strong><p>Pruebe limpiando o cambiando los filtros.</p></Box>}
            <Flex className='access-pagination' justify='between' align='center'>
              <Text>Mostrando {visibleUsers.length} de {filteredUsers.length} usuarios</Text>
              <Flex gap='2' css={{ width: 'auto' }}><button disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button><span>Página {page} de {totalPages}</span><button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Siguiente</button></Flex>
            </Flex>
          </Box>
        )}

        {tab === 'roles' && (
          <Box className='access-table-panel'>
            <Box className='access-filters access-filters-roles'>
              <input value={roleSearch} onChange={event => { setRoleSearch(event.target.value); setRolePage(1) }} placeholder='Buscar rol o descripción…' />
              <select value={permissionFilter} onChange={event => { setPermissionFilter(event.target.value); setRolePage(1) }}>
                <option value=''>Todos los permisos</option>
                {(Object.entries(permissionLabels) as Array<[Permission, string]>).map(([permission, label]) => <option value={permission} key={permission}>{label}</option>)}
              </select>
            </Box>
            <Box className='access-table-scroll'><table className='access-table'>
              <thead><tr><th>Rol</th><th>Descripción</th><th>Permisos</th><th>Usuarios</th><th /></tr></thead>
              <tbody>{visibleRoles.map(role => {
                const assignedUsers = users.filter(user => user.assignments.some(assignment => assignment.roleId === role.id)).length
                return <tr key={role.id}>
                  <td><strong>{role.name}</strong><small className='access-code'>{role.id}</small></td>
                  <td className='access-description'>{role.description || 'Sin descripción'}</td>
                  <td><span className='access-count'>{role.permissions.length}</span> permisos</td>
                  <td><strong>{assignedUsers}</strong> usuario{assignedUsers === 1 ? '' : 's'}</td>
                  <td><button type='button' className='access-action' onClick={() => setEditingRole({ ...role })}>Configurar →</button></td>
                </tr>
              })}</tbody>
            </table></Box>
            {visibleRoles.length === 0 && <Box className='access-empty'><strong>Sin roles encontrados</strong><p>Cambie la búsqueda o el filtro de permisos.</p></Box>}
            <Flex className='access-pagination' justify='between' align='center'>
              <Text>Mostrando {visibleRoles.length} de {filteredRoles.length} roles</Text>
              <Flex gap='2' css={{ width: 'auto' }}><button disabled={rolePage === 1} onClick={() => setRolePage(rolePage - 1)}>Anterior</button><span>Página {rolePage} de {roleTotalPages}</span><button disabled={rolePage === roleTotalPages} onClick={() => setRolePage(rolePage + 1)}>Siguiente</button></Flex>
            </Flex>
          </Box>
        )}

        {tab === 'teams' && (
          <Box className='access-table-panel'>
            <Box className='access-filters access-filters-roles'>
              <input value={teamSearch} onChange={event => { setTeamSearch(event.target.value); setTeamPage(1) }} placeholder='Buscar equipo o descripción…' />
              <select value={teamSizeFilter} onChange={event => { setTeamSizeFilter(event.target.value); setTeamPage(1) }}>
                <option value='all'>Todos los equipos</option><option value='with'>Con integrantes</option><option value='without'>Sin integrantes</option>
              </select>
            </Box>
            <Box className='access-table-scroll'><table className='access-table'>
              <thead><tr><th>Equipo</th><th>Descripción</th><th>Integrantes</th><th>Roles utilizados</th><th /></tr></thead>
              <tbody>{visibleTeams.map(team => {
                const teamUsers = users.filter(user => user.assignments.some(assignment => assignment.teamId === team.id))
                const roleCount = new Set(teamUsers.flatMap(user => user.assignments.filter(assignment => assignment.teamId === team.id).map(assignment => assignment.roleId))).size
                return <tr key={team.id}>
                  <td><strong>{team.name}</strong><small className='access-code'>{team.id}</small></td>
                  <td className='access-description'>{team.description || 'Sin descripción'}</td>
                  <td><span className='access-count'>{teamUsers.length}</span> integrante{teamUsers.length === 1 ? '' : 's'}</td>
                  <td><strong>{roleCount}</strong> rol{roleCount === 1 ? '' : 'es'}</td>
                  <td><button type='button' className='access-action' onClick={() => setEditingTeam({ ...team })}>Editar →</button></td>
                </tr>
              })}</tbody>
            </table></Box>
            {visibleTeams.length === 0 && <Box className='access-empty'><strong>Sin equipos encontrados</strong><p>Cambie la búsqueda o el filtro de integrantes.</p></Box>}
            <Flex className='access-pagination' justify='between' align='center'>
              <Text>Mostrando {visibleTeams.length} de {filteredTeams.length} equipos</Text>
              <Flex gap='2' css={{ width: 'auto' }}><button disabled={teamPage === 1} onClick={() => setTeamPage(teamPage - 1)}>Anterior</button><span>Página {teamPage} de {teamTotalPages}</span><button disabled={teamPage === teamTotalPages} onClick={() => setTeamPage(teamPage + 1)}>Siguiente</button></Flex>
            </Flex>
          </Box>
        )}

        {editingUser && (
          <Box className='admin-modal access-drawer' onClick={() => setEditingUser(null)}>
            <Box className='admin-modal-card' onClick={event => event.stopPropagation()}>
              <Flex justify='between' align='center'><Box><Text as='h2'>Datos del usuario</Text><Text css={{ color: '$shade300', fontSize: '$2' }}>Perfil, estado y asignaciones de acceso.</Text></Box><button className='drawer-close' onClick={() => setEditingUser(null)}>×</button></Flex>
              {[
                ['Nombre', 'name', 'text'],
                ['Correo', 'email', 'email'],
                ['Contraseña local', 'password', 'password'],
              ].map(([label, key, type]) => (
                <label className='admin-field' key={key}>
                  {label}
                  <input type={type} value={String(editingUser[key as keyof AdminUser])} onChange={event => setEditingUser({ ...editingUser, [key]: event.target.value })} style={inputStyle} required />
                </label>
              ))}
              <Flex justify='between' align='center' css={{ marginTop: '$5' }}>
                <Box>
                  <Text css={{ fontWeight: '$bold' }}>Roles por equipo</Text>
                  <Text css={{ color: '$shade300', fontSize: '$2' }}>
                    Agregue todas las combinaciones que necesite.
                  </Text>
                </Box>
                <button
                  type='button'
                  className='admin-secondary-button'
                  onClick={() =>
                    setEditingUser({
                      ...editingUser,
                      assignments: [
                        ...editingUser.assignments,
                        {
                          id: createId('assignment'),
                          teamId: teams[0]?.id ?? '',
                          roleId: roles[0]?.id ?? '',
                        },
                      ],
                    })
                  }
                >
                  + Agregar rol
                </button>
              </Flex>
              <Box className='assignment-editor'>
                {editingUser.assignments.map((assignment, assignmentIndex) => (
                  <Box className='assignment-editor-row' key={assignment.id}>
                    <label className='admin-field'>Equipo
                      <select
                        value={assignment.teamId}
                        onChange={event =>
                          setEditingUser({
                            ...editingUser,
                            assignments: editingUser.assignments.map(item =>
                              item.id === assignment.id ? { ...item, teamId: event.target.value } : item
                            ),
                          })
                        }
                        style={inputStyle}
                      >
                        {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                      </select>
                    </label>
                    <label className='admin-field'>Rol
                      <select
                        value={assignment.roleId}
                        onChange={event =>
                          setEditingUser({
                            ...editingUser,
                            assignments: editingUser.assignments.map(item =>
                              item.id === assignment.id ? { ...item, roleId: event.target.value } : item
                            ),
                          })
                        }
                        style={inputStyle}
                      >
                        {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                      </select>
                    </label>
                    <button
                      type='button'
                      aria-label={`Eliminar asignación ${assignmentIndex + 1}`}
                      className='assignment-remove'
                      disabled={editingUser.assignments.length === 1}
                      onClick={() =>
                        setEditingUser({
                          ...editingUser,
                          assignments: editingUser.assignments.filter(item => item.id !== assignment.id),
                        })
                      }
                    >
                      ×
                    </button>
                  </Box>
                ))}
              </Box>
              <label className='admin-check'><input type='checkbox' checked={editingUser.active} onChange={event => setEditingUser({ ...editingUser, active: event.target.checked })} /> Usuario activo</label>
              <Flex gap='3' justify='end'>
                <button className='admin-secondary-button' onClick={() => setEditingUser(null)}>Cancelar</button>
                <button className='admin-primary-button' onClick={() => { saveUser(editingUser); setEditingUser(null) }}>Guardar usuario</button>
              </Flex>
            </Box>
          </Box>
        )}

        {editingRole && (
          <Box className='admin-modal access-drawer' onClick={() => setEditingRole(null)}>
            <Box className='admin-modal-card' onClick={event => event.stopPropagation()}>
              <Flex justify='between' align='center'><Box><Text as='h2'>Rol y permisos</Text><Text css={{ color: '$shade300', fontSize: '$2' }}>Defina el alcance de acceso para este rol.</Text></Box><button className='drawer-close' onClick={() => setEditingRole(null)}>×</button></Flex>
              <label className='admin-field'>Nombre<input value={editingRole.name} onChange={event => setEditingRole({ ...editingRole, name: event.target.value })} style={inputStyle} /></label>
              <label className='admin-field'>Descripción<textarea rows={3} value={editingRole.description} onChange={event => setEditingRole({ ...editingRole, description: event.target.value })} style={inputStyle} /></label>
              <Text css={{ fontWeight: '$bold', marginTop: '$4' }}>Permisos asignados</Text>
              {(Object.entries(permissionLabels) as Array<[Permission, string]>).map(([permission, label]) => (
                <label className='permission-option' key={permission}>
                  <input
                    type='checkbox'
                    checked={editingRole.permissions.includes(permission)}
                    onChange={event => setEditingRole({
                      ...editingRole,
                      permissions: event.target.checked
                        ? [...editingRole.permissions, permission]
                        : editingRole.permissions.filter(item => item !== permission),
                    })}
                  />
                  <span>{label}<small>{permission}</small></span>
                </label>
              ))}
              <Flex gap='3' justify='end' css={{ marginTop: '$5' }}>
                <button className='admin-secondary-button' onClick={() => setEditingRole(null)}>Cancelar</button>
                <button className='admin-primary-button' onClick={() => { saveRole(editingRole); setEditingRole(null) }}>Guardar rol</button>
              </Flex>
            </Box>
          </Box>
        )}

        {editingTeam && (
          <Box className='admin-modal access-drawer' onClick={() => setEditingTeam(null)}>
            <Box className='admin-modal-card' onClick={event => event.stopPropagation()}>
              <Flex justify='between' align='center'><Box><Text as='h2'>Equipo de trabajo</Text><Text css={{ color: '$shade300', fontSize: '$2' }}>Organice usuarios y responsabilidades.</Text></Box><button className='drawer-close' onClick={() => setEditingTeam(null)}>×</button></Flex>
              <label className='admin-field'>Nombre<input value={editingTeam.name} onChange={event => setEditingTeam({ ...editingTeam, name: event.target.value })} style={inputStyle} /></label>
              <label className='admin-field'>Descripción<textarea rows={4} value={editingTeam.description} onChange={event => setEditingTeam({ ...editingTeam, description: event.target.value })} style={inputStyle} /></label>
              <Flex gap='3' justify='end'>
                <button className='admin-secondary-button' onClick={() => setEditingTeam(null)}>Cancelar</button>
                <button className='admin-primary-button' onClick={() => { saveTeam(editingTeam); setEditingTeam(null) }}>Guardar equipo</button>
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
