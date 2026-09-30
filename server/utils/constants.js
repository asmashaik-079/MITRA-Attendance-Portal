/**
 * Shared Database and Schema Constants
 * Can be used by Express controllers/services to ensure data consistency.
 */

const ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student'
};

const TEAMS = {
  VC: 'VC',
  IC: 'IC',
  AI: 'AI',
  MK: 'MK',
  UNASSIGNED: 'UNASSIGNED'
};

const TEAM_NAMES = {
  [TEAMS.VC]: 'Vibe Coding',
  [TEAMS.IC]: 'Industry Connect',
  [TEAMS.AI]: 'Artificial Intelligence',
  [TEAMS.MK]: 'Marketing',
  [TEAMS.UNASSIGNED]: 'Unassigned'
};

const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent'
};

const LEAVE_REQUEST_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

const AUDIT_ACTIONS = {
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

const COLLECTIONS = {
  USERS: 'users',
  STUDENTS: 'students',
  GROUPS: 'groups',
  ATTENDANCE: 'attendance',
  TEAM_MEMBERSHIPS: 'teamMemberships',
  AUDIT_LOGS: 'auditLogs'
};

module.exports = {
  ROLES,
  TEAMS,
  TEAM_NAMES,
  ATTENDANCE_STATUS,
  LEAVE_REQUEST_STATUSES,
  AUDIT_ACTIONS,
  COLLECTIONS
};
