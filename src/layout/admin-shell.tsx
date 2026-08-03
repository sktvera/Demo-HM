import type { PropsWithChildren } from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { AdminGuard } from 'components/admin-guard'
import { Box, Image } from 'components'
import { currentUser, hasPermission, logout } from 'platform-storage'
import type { AdminUser, Permission } from 'platform-storage'

interface NavigationItem {
  href: string
  label: string
  short: string
  description: string
  permission?: Permission
}

const navigationGroups: Array<{ label: string; items: NavigationItem[] }> = [
  {
    label: 'Principal',
    items: [
      { href: '/admin', label: 'Inicio', short: 'IN', description: 'Resumen de operación' },
      { href: '/admin/cotizaciones', label: 'Cotizaciones', short: 'CO', description: 'Propuestas comerciales', permission: 'quotes.manage' },
      { href: '/admin/cotizacion-asociada', label: 'Cotización asociada', short: 'CA', description: 'Propuestas para asociados', permission: 'quotes.manage' },
      { href: '/admin/biblioteca-cotizaciones', label: 'Biblioteca de plantillas', short: 'BP', description: 'Plantillas reutilizables', permission: 'quotes.manage' },
      { href: '/admin/oportunidades-negocio', label: 'Oportunidades', short: 'OP', description: 'Aprobaciones comerciales', permission: 'quotes.manage' },
    ],
  },
  {
    label: 'Operación académica',
    items: [
      { href: '/admin/gestion-cursos', label: 'Gestión de cursos', short: 'CU', description: 'Cursos, alumnos y notas', permission: 'academic.manage' },
      { href: '/admin/biblioteca-certificaciones', label: 'Biblioteca certificados', short: 'BC', description: 'Plantillas de certificación', permission: 'academic.manage' },
      { href: '/admin/certificados', label: 'Emitir certificados', short: 'EC', description: 'Generación de documentos', permission: 'certificates.manage' },
      { href: '/admin/registro-certificados', label: 'Registro de certificados', short: 'RC', description: 'Historial y vigencias', permission: 'certificates.manage' },
    ],
  },
  {
    label: 'Relaciones y seguridad',
    items: [
      { href: '/admin/asociados-negocio', label: 'Asociados de negocio', short: 'AN', description: 'Empresas e instituciones', permission: 'academic.manage' },
      { href: '/admin/accesos', label: 'Usuarios y accesos', short: 'UA', description: 'Roles, permisos y equipos', permission: 'users.manage' },
    ],
  },
]

const pageMeta = navigationGroups.flatMap(group => group.items)

export const AdminShell = ({ children }: PropsWithChildren): JSX.Element => {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [user, setUser] = useState<AdminUser>()
  const meta = pageMeta.find(item => item.href === router.pathname) ?? pageMeta[0]

  useEffect(() => {
    setUser(currentUser())
    setMobileOpen(false)
    setProfileOpen(false)
  }, [router.pathname])

  const signOut = (): void => {
    logout()
    void router.push('/admin/login')
  }

  return (
    <AdminGuard>
      <Box className='admin-app-shell'>
        {mobileOpen && <button className='admin-sidebar-scrim' aria-label='Cerrar menú' onClick={() => setMobileOpen(false)} />}
        <Box as='aside' className={mobileOpen ? 'admin-sidebar is-open' : 'admin-sidebar'}>
          <Box className='admin-brand'>
            <Image src='/images/logo-horizontal.png' alt='HM Maquinaria' />
            <button className='admin-sidebar-close' aria-label='Cerrar navegación' onClick={() => setMobileOpen(false)}>×</button>
          </Box>

          <Box className='admin-workspace'>
            <span>HM Maquinaria</span>
            <strong>Centro administrativo</strong>
            <i>HM</i>
          </Box>

          <nav className='admin-navigation' aria-label='Navegación administrativa'>
            {navigationGroups.map(group => {
              const availableItems = group.items.filter(item => !item.permission || hasPermission(item.permission))
              if (!availableItems.length) return null
              return <Box className='admin-nav-group' key={group.label}>
                <p>{group.label}</p>
                {availableItems.map(item => {
                  const active = router.pathname === item.href
                  return <NextLink href={item.href} key={item.href}>
                    <a className={active ? 'admin-nav-item active' : 'admin-nav-item'} aria-current={active ? 'page' : undefined}>
                      <span className='admin-nav-glyph'>{item.short}</span>
                      <span><strong>{item.label}</strong><small>{item.description}</small></span>
                      <b>›</b>
                    </a>
                  </NextLink>
                })}
              </Box>
            })}
          </nav>

          <NextLink href='/'><a className='admin-public-link'><span>↗</span><span><strong>Ver sitio público</strong><small>Abrir landing page</small></span></a></NextLink>
        </Box>

        <Box className='admin-shell-content'>
          <header className='admin-topbar'>
            <Box className='admin-topbar-title'>
              <button className='admin-menu-trigger' aria-label='Abrir navegación' onClick={() => setMobileOpen(true)}><span /><span /><span /></button>
              <Box>
                <div className='admin-breadcrumb'><span>Administración</span><b>/</b>{meta.label}</div>
                <h2>{meta.label}</h2>
              </Box>
            </Box>
            <Box className='admin-header-actions'>
              <NextLink href='/'><a className='admin-header-public' title='Ver sitio público'>↗</a></NextLink>
              <Box className='admin-profile-wrap'>
                <button className='admin-profile-button' onClick={() => setProfileOpen(!profileOpen)}>
                  <span className='admin-avatar'>{(user?.name ?? 'HM').split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()}</span>
                  <span className='admin-profile-copy'><strong>{user?.name ?? 'Administrador HM'}</strong><small>{user?.email ?? 'Sesión administrativa'}</small></span>
                  <b>⌄</b>
                </button>
                {profileOpen && <Box className='admin-profile-menu'>
                  <Box><strong>{user?.name ?? 'Administrador HM'}</strong><small>Cuenta activa</small></Box>
                  <button onClick={signOut}><span>↪</span>Cerrar sesión</button>
                </Box>}
              </Box>
            </Box>
          </header>
          <main className='admin-main-content'>{children}</main>
        </Box>
      </Box>
    </AdminGuard>
  )
}
