import { useCallback, useEffect, useState } from 'react'
import { courses as defaultCourses } from 'course-data'
import type { Course } from 'course-data'

export const AUTH_KEY = 'hm_admin_session'
export const COURSES_KEY = 'hm_courses'
export const STORAGE_EVENT = 'hm-storage-change'
export const USERS_KEY = 'hm_admin_users'
export const ROLES_KEY = 'hm_admin_roles'
export const TEAMS_KEY = 'hm_admin_teams'
export const CERTIFICATE_RECORDS_KEY = 'hm_certificate_records'
export const PENDING_CERTIFICATES_KEY = 'hm_pending_certificates'
export const ACADEMIC_COURSES_KEY = 'hm_academic_courses'

export type Permission =
  | 'dashboard.view'
  | 'courses.manage'
  | 'quotes.manage'
  | 'certificates.manage'
  | 'academic.manage'
  | 'users.manage'
  | 'roles.manage'
  | 'teams.manage'

export interface AdminRole {
  id: string
  name: string
  description: string
  permissions: Permission[]
}

export interface WorkTeam {
  id: string
  name: string
  description: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  password: string
  assignments: AccessAssignment[]
  roleId?: string
  teamId?: string
  active: boolean
  documentType?: string
  documentNumber?: string
  birthDate?: string
}

export interface AccessAssignment {
  id: string
  roleId: string
  teamId: string
}

export interface CertificateRecord {
  id: string
  fullName: string
  documentType: string
  documentNumber: string
  equipment: string
  trainingHours: number
  equipmentBrand: string
  instructor: string
  issuedAt: string
  certificationType: 'certificacion' | 'recertificacion'
  limitedUse: string
  expiresAt: string
  contactInfo: string
  createdAt: string
}

export interface AcademicCourse {
  id: string
  title: string
  description: string
  syllabus: string[]
  teacherId: string
  organization: string
  studentIds: string[]
  studentOrganizations: Record<string, string>
  sessions: CourseSession[]
  assignments: CourseAssignment[]
  passingGrade: number
  minimumAttendance: number
  certifiedStudentIds: string[]
  status: 'borrador' | 'activo' | 'finalizado'
  createdAt: string
  associateId?: string
  startDate?: string
  certificationTemplateIds?: string[]
  studentRecertifications?: Record<string, boolean>
  scheduleBlocks?: Array<{ id: string; certificationTemplateId: string; weekdays: number[]; startTime: string; endTime: string }>
}

export type AttendanceStatus = 'presente' | 'ausente' | 'tarde' | 'excusa'

export interface AttendanceEntry {
  status: AttendanceStatus
  observation: string
  recordedAt: string
  recordedBy: string
}

export interface CourseSession {
  id: string
  title: string
  date: string
  attendance: Record<string, boolean | AttendanceEntry>
  startTime?: string
  endTime?: string
  certificationTemplateId?: string
  status?: 'programada' | 'completada' | 'cancelada'
  topic?: string
  notes?: string
  completedAt?: string
}

export interface CourseAssignment {
  id: string
  sessionId?: string
  title: string
  description: string
  deliverable: boolean
  grades: Record<string, number | null>
  type?: 'tarea' | 'examen' | 'practica' | 'participacion'
  dueDate?: string
  maxScore?: number
  weight?: number
  status?: 'borrador' | 'publicada' | 'cerrada'
  feedback?: Record<string, string>
  submissions?: Record<string, { text: string; submittedAt: string }>
}

export const demoUser = {
  id: 'user-admin',
  email: 'admin@hm-maquinaria.com',
  password: 'Admin123*',
  name: 'Administrador HM',
}

export const permissionLabels: Record<Permission, string> = {
  'dashboard.view': 'Ver panel administrativo',
  'courses.manage': 'Administrar programas',
  'quotes.manage': 'Crear y administrar cotizaciones',
  'certificates.manage': 'Crear y administrar certificados',
  'academic.manage': 'Administrar cursos, asistencia y calificaciones',
  'users.manage': 'Administrar usuarios',
  'roles.manage': 'Administrar roles y permisos',
  'teams.manage': 'Administrar equipos de trabajo',
}

export const defaultRoles: AdminRole[] = [
  {
    id: 'role-superadmin',
    name: 'Superadministrador',
    description: 'Acceso completo a la plataforma.',
    permissions: Object.keys(permissionLabels) as Permission[],
  },
  {
    id: 'role-editor',
    name: 'Editor de programas',
    description: 'Gestiona la oferta comercial del landing.',
    permissions: ['dashboard.view', 'courses.manage'],
  },
  {
    id: 'role-consultor',
    name: 'Consultor',
    description: 'Acceso de solo consulta al panel.',
    permissions: ['dashboard.view'],
  },
]

export const defaultTeams: WorkTeam[] = [
  { id: 'team-admin', name: 'Administración', description: 'Gestión general y configuración.' },
  { id: 'team-training', name: 'Formación', description: 'Certificación y entrenamiento de operadores.' },
  { id: 'team-commercial', name: 'Comercial', description: 'Ventas y atención a empresas.' },
]

export const defaultUsers: AdminUser[] = [
  {
    id: demoUser.id,
    name: demoUser.name,
    email: demoUser.email,
    password: demoUser.password,
    assignments: [
      {
        id: 'assignment-admin',
        roleId: 'role-superadmin',
        teamId: 'team-admin',
      },
    ],
    active: true,
  },
]

const inBrowser = (): boolean => typeof window !== 'undefined'

export const isAuthenticated = (): boolean => {
  if (!inBrowser()) return false
  return window.localStorage.getItem(AUTH_KEY) !== null
}

export const login = (email: string, password: string): boolean => {
  const user = readAccessData().users.find(
    item => item.email.toLowerCase() === email.toLowerCase() && item.password === password && item.active
  )
  if (!user) return false

  window.localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({ userId: user.id, email: user.email, name: user.name, loginAt: Date.now() })
  )
  return true
}

export const logout = (): void => {
  window.localStorage.removeItem(AUTH_KEY)
}

const readList = <T,>(key: string, fallback: T[]): T[] => {
  if (!inBrowser()) return fallback
  const value = window.localStorage.getItem(key)
  if (!value) return fallback
  try {
    return JSON.parse(value) as T[]
  } catch {
    return fallback
  }
}

export const readAccessData = (): {
  users: AdminUser[]
  roles: AdminRole[]
  teams: WorkTeam[]
} => ({
  users: readList(USERS_KEY, defaultUsers).map(user => ({
    ...user,
    assignments:
      user.assignments?.length > 0
        ? user.assignments
        : user.roleId && user.teamId
          ? [{ id: `assignment-${user.id}`, roleId: user.roleId, teamId: user.teamId }]
          : [],
  })),
  roles: readList(ROLES_KEY, defaultRoles).map(role =>
    role.id === 'role-superadmin'
      ? {
          ...role,
          permissions: Array.from(
            new Set([
              ...role.permissions,
              ...(Object.keys(permissionLabels) as Permission[]),
            ])
          ),
        }
      : role
  ),
  teams: readList(TEAMS_KEY, defaultTeams),
})

export const currentUser = (): AdminUser | undefined => {
  if (!inBrowser()) return undefined
  const session = window.localStorage.getItem(AUTH_KEY)
  if (!session) return undefined
  try {
    const { userId } = JSON.parse(session) as { userId?: string }
    return readAccessData().users.find(user => user.id === (userId ?? demoUser.id))
  } catch {
    return undefined
  }
}

export const hasPermission = (permission: Permission): boolean => {
  const data = readAccessData()
  const user = currentUser()
  if (!user) return false
  return user.assignments.some(assignment =>
    data.roles
      .find(role => role.id === assignment.roleId)
      ?.permissions.includes(permission)
  )
}

const persistAccess = (
  key: typeof USERS_KEY | typeof ROLES_KEY | typeof TEAMS_KEY,
  value: AdminUser[] | AdminRole[] | WorkTeam[]
): void => {
  window.localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

export const useAccessManagement = (): {
  users: AdminUser[]
  roles: AdminRole[]
  teams: WorkTeam[]
  saveUser: (user: AdminUser) => void
  saveRole: (role: AdminRole) => void
  saveTeam: (team: WorkTeam) => void
} => {
  const [data, setData] = useState(readAccessData())
  const refreshAccess = useCallback(() => setData(readAccessData()), [])

  useEffect(() => {
    refreshAccess()
    window.addEventListener(STORAGE_EVENT, refreshAccess)
    return () => window.removeEventListener(STORAGE_EVENT, refreshAccess)
  }, [refreshAccess])

  return {
    ...data,
    saveUser: user => {
      const existing = readAccessData().users
      persistAccess(
        USERS_KEY,
        existing.some(item => item.id === user.id)
          ? existing.map(item => (item.id === user.id ? user : item))
          : [...existing, user]
      )
    },
    saveRole: role => {
      const existing = readAccessData().roles
      persistAccess(
        ROLES_KEY,
        existing.some(item => item.id === role.id)
          ? existing.map(item => (item.id === role.id ? role : item))
          : [...existing, role]
      )
    },
    saveTeam: team => {
      const existing = readAccessData().teams
      persistAccess(
        TEAMS_KEY,
        existing.some(item => item.id === team.id)
          ? existing.map(item => (item.id === team.id ? team : item))
          : [...existing, team]
      )
    },
  }
}

export const readCertificateRecords = (): CertificateRecord[] =>
  readList<CertificateRecord>(CERTIFICATE_RECORDS_KEY, [])

export const saveCertificateRecords = (records: CertificateRecord[]): void => {
  window.localStorage.setItem(CERTIFICATE_RECORDS_KEY, JSON.stringify(records))
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

export const readPendingCertificates = (): CertificateRecord[] =>
  readList<CertificateRecord>(PENDING_CERTIFICATES_KEY, [])

export const savePendingCertificates = (records: CertificateRecord[]): void => {
  window.localStorage.setItem(PENDING_CERTIFICATES_KEY, JSON.stringify(records))
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

export const useCertificateRecords = (): {
  records: CertificateRecord[]
  saveRecord: (record: CertificateRecord) => void
  deleteRecord: (recordId: string) => void
} => {
  const [records, setRecords] = useState<CertificateRecord[]>([])
  const refreshRecords = useCallback(
    () =>
      setRecords(
        readCertificateRecords().sort((a, b) =>
          b.issuedAt.localeCompare(a.issuedAt)
        )
      ),
    []
  )

  useEffect(() => {
    refreshRecords()
    window.addEventListener(STORAGE_EVENT, refreshRecords)
    return () => window.removeEventListener(STORAGE_EVENT, refreshRecords)
  }, [refreshRecords])

  return {
    records,
    saveRecord: record => {
      const existing = readCertificateRecords()
      const next = existing.some(item => item.id === record.id)
        ? existing.map(item => (item.id === record.id ? record : item))
        : [...existing, record]
      window.localStorage.setItem(CERTIFICATE_RECORDS_KEY, JSON.stringify(next))
      window.dispatchEvent(new Event(STORAGE_EVENT))
    },
    deleteRecord: recordId => {
      const next = readCertificateRecords().filter(item => item.id !== recordId)
      window.localStorage.setItem(CERTIFICATE_RECORDS_KEY, JSON.stringify(next))
      window.dispatchEvent(new Event(STORAGE_EVENT))
    },
  }
}

export const readAcademicCourses = (): AcademicCourse[] =>
  readList<AcademicCourse>(ACADEMIC_COURSES_KEY, []).map(course => ({
    ...course,
    organization: course.organization ?? '',
    studentOrganizations: course.studentOrganizations ?? {},
    associateId: course.associateId ?? '',
    startDate: course.startDate ?? '',
    certificationTemplateIds: course.certificationTemplateIds ?? [],
    studentRecertifications: course.studentRecertifications ?? {},
    scheduleBlocks: course.scheduleBlocks ?? [],
    sessions: (course.sessions ?? []).map(session => ({
      ...session,
      attendance: session.attendance ?? {},
      status: session.status ?? (Object.keys(session.attendance ?? {}).length > 0 ? 'completada' : 'programada'),
      topic: session.topic ?? '',
      notes: session.notes ?? '',
    })),
    assignments: (course.assignments ?? []).map(assignment => ({
      ...assignment,
      sessionId: assignment.sessionId ?? '',
      type: assignment.type ?? 'tarea',
      dueDate: assignment.dueDate ?? '',
      maxScore: assignment.maxScore ?? 100,
      weight: assignment.weight ?? 0,
      status: assignment.status === 'cerrada' ? 'publicada' : (assignment.status ?? 'borrador'),
      feedback: assignment.feedback ?? {},
      submissions: assignment.submissions ?? {},
    })),
  }))

export const useAcademicCourses = (): {
  courses: AcademicCourse[]
  saveCourse: (course: AcademicCourse) => void
  deleteCourse: (courseId: string) => void
} => {
  const [courses, setCourses] = useState<AcademicCourse[]>([])
  const refresh = useCallback(() => setCourses(readAcademicCourses()), [])

  useEffect(() => {
    refresh()
    window.addEventListener(STORAGE_EVENT, refresh)
    return () => window.removeEventListener(STORAGE_EVENT, refresh)
  }, [refresh])

  return {
    courses,
    saveCourse: course => {
      const existing = readAcademicCourses()
      const next = existing.some(item => item.id === course.id)
        ? existing.map(item => (item.id === course.id ? course : item))
        : [...existing, course]
      window.localStorage.setItem(ACADEMIC_COURSES_KEY, JSON.stringify(next))
      window.dispatchEvent(new Event(STORAGE_EVENT))
    },
    deleteCourse: courseId => {
      const next = readAcademicCourses().filter(course => course.id !== courseId)
      window.localStorage.setItem(ACADEMIC_COURSES_KEY, JSON.stringify(next))
      window.dispatchEvent(new Event(STORAGE_EVENT))
    },
  }
}

export const readCourses = (): Course[] => {
  if (!inBrowser()) return defaultCourses
  const stored = window.localStorage.getItem(COURSES_KEY)
  if (!stored) return defaultCourses

  try {
    const savedCourses = JSON.parse(stored) as Course[]
    return savedCourses.map(saved => {
      const current = defaultCourses.find(course => course.slug === saved.slug)
      return current ? { ...current, ...saved, image: current.image } : saved
    })
  } catch {
    return defaultCourses
  }
}

export const saveCourses = (nextCourses: Course[]): void => {
  window.localStorage.setItem(COURSES_KEY, JSON.stringify(nextCourses))
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

export const resetCourses = (): void => {
  window.localStorage.removeItem(COURSES_KEY)
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

export const useManagedCourses = (): {
  courses: Course[]
  updateCourse: (course: Course) => void
  restoreCourses: () => void
} => {
  const [managedCourses, setManagedCourses] = useState<Course[]>(defaultCourses)

  const refresh = useCallback(() => setManagedCourses(readCourses()), [])

  useEffect(() => {
    refresh()
    window.addEventListener('storage', refresh)
    window.addEventListener(STORAGE_EVENT, refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener(STORAGE_EVENT, refresh)
    }
  }, [refresh])

  const updateCourse = (course: Course): void => {
    const nextCourses = readCourses().map(item =>
      item.slug === course.slug ? course : item
    )
    saveCourses(nextCourses)
  }

  const restoreCourses = (): void => resetCourses()

  return { courses: managedCourses, updateCourse, restoreCourses }
}
