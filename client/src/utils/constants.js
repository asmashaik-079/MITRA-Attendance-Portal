/**
 * Shared Database and Schema Constants for the Frontend
 * Ensures UI consistency with backend rules.
 */

export const ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student'
};

export const TEAMS = {
  VC: 'VC',
  IC: 'IC',
  AI: 'AI',
  MK: 'MK',
  UNASSIGNED: 'UNASSIGNED'
};

export const TEAM_NAMES = {
  [TEAMS.VC]: 'Vibe Coding',
  [TEAMS.IC]: 'Industry Connect',
  [TEAMS.AI]: 'Artificial Intelligence',
  [TEAMS.MK]: 'Marketing',
  [TEAMS.UNASSIGNED]: 'Unassigned'
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent'
};

export const LEAVE_REQUEST_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const AUDIT_ACTIONS = {
  STUDENT_CREATED: 'STUDENT_CREATED',
  STUDENT_UPDATED: 'STUDENT_UPDATED',
  STUDENT_ACTIVATED: 'STUDENT_ACTIVATED',
  STUDENT_DEACTIVATED: 'STUDENT_DEACTIVATED',
  TEAM_ASSIGNED: 'TEAM_ASSIGNED',
  TEAM_CHANGED: 'TEAM_CHANGED',
  ATTENDANCE_MARKED: 'ATTENDANCE_MARKED',
  ATTENDANCE_UPDATED: 'ATTENDANCE_UPDATED',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  LEAVE_REQUEST_SUBMITTED: 'LEAVE_REQUEST_SUBMITTED',
  LEAVE_REQUEST_APPROVED: 'LEAVE_REQUEST_APPROVED',
  LEAVE_REQUEST_REJECTED: 'LEAVE_REQUEST_REJECTED'
};

export const COLLECTIONS = {
  USERS: 'users',
  STUDENTS: 'students',
  GROUPS: 'groups',
  ATTENDANCE: 'attendance',
  TEAM_MEMBERSHIPS: 'teamMemberships',
  AUDIT_LOGS: 'auditLogs'
};
