import type {
  AcademicCourse,
  AttendanceEntry,
  CourseAssignment,
} from 'platform-storage'

export interface StudentCourseProgress {
  completedSessions: number
  totalSessions: number
  courseProgress: number
  attendedSessions: number
  attendancePercentage: number
  gradedAssignments: number
  publishedAssignments: number
  finalGrade: number
  requiredWorkComplete: boolean
  approved: boolean
  result: 'aprobado' | 'no_aprobado' | 'en_riesgo' | 'pendiente'
}

const attendanceValue = (value: boolean | AttendanceEntry | undefined): number => {
  if (typeof value === 'boolean') return value ? 1 : 0
  if (!value) return 0
  if (value.status === 'presente' || value.status === 'excusa') return 1
  if (value.status === 'tarde') return 0.5
  return 0
}

export const assignmentScore = (
  assignment: CourseAssignment,
  studentId: string
): number | null => {
  const grade = assignment.grades[studentId]
  if (grade === null || grade === undefined) return null
  return Math.max(0, Math.min(100, (grade / (assignment.maxScore ?? 100)) * 100))
}

export const calculateStudentProgress = (
  course: AcademicCourse,
  studentId: string
): StudentCourseProgress => {
  const validSessions = course.sessions.filter(session => session.status !== 'cancelada')
  const completedSessions = validSessions.filter(session => session.status === 'completada')
  const attendedSessions = completedSessions.reduce(
    (total, session) => total + attendanceValue(session.attendance[studentId]),
    0
  )
  const attendancePercentage = completedSessions.length
    ? (attendedSessions / completedSessions.length) * 100
    : 0
  const publishedAssignments = course.assignments.filter(
    assignment => assignment.status === 'publicada'
  )
  const gradedAssignments = publishedAssignments.filter(
    assignment => assignmentScore(assignment, studentId) !== null
  )
  const configuredWeight = publishedAssignments.reduce(
    (total, assignment) => total + (assignment.weight ?? 0),
    0
  )
  const weightedGrade = publishedAssignments.reduce((total, assignment) => {
    const score = assignmentScore(assignment, studentId)
    return total + (score ?? 0) * (assignment.weight ?? 0)
  }, 0)
  const finalGrade = configuredWeight > 0 ? weightedGrade / configuredWeight : 0
  const requiredWorkComplete =
    publishedAssignments.length > 0 &&
    gradedAssignments.length === publishedAssignments.length &&
    configuredWeight >= 99.99
  const requirementsMet =
    finalGrade >= course.passingGrade &&
    attendancePercentage >= course.minimumAttendance &&
    requiredWorkComplete
  const finished = course.status === 'finalizado'
  const approved = finished && requirementsMet
  const result = finished
    ? approved
      ? 'aprobado'
      : 'no_aprobado'
    : completedSessions.length || gradedAssignments.length
      ? requirementsMet
        ? 'pendiente'
        : 'en_riesgo'
      : 'pendiente'

  return {
    completedSessions: completedSessions.length,
    totalSessions: validSessions.length,
    courseProgress: validSessions.length
      ? (completedSessions.length / validSessions.length) * 100
      : 0,
    attendedSessions,
    attendancePercentage,
    gradedAssignments: gradedAssignments.length,
    publishedAssignments: publishedAssignments.length,
    finalGrade,
    requiredWorkComplete,
    approved,
    result,
  }
}

export const courseAverageProgress = (course: AcademicCourse): number => {
  if (!course.studentIds.length) return 0
  return course.studentIds.reduce(
    (total, studentId) => total + calculateStudentProgress(course, studentId).courseProgress,
    0
  ) / course.studentIds.length
}
