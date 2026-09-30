# MITRA Attendance Portal - Firestore Schema Documentation

## 1. users
**Purpose:** Store application-level user/role information for authenticated users.
**Document ID:** Firebase Authentication UID.

| Field       | Type      | Description                               |
|-------------|-----------|-------------------------------------------|
| `uid`       | string    | Firebase Auth UID                         |
| `role`      | string    | Allowed: 'admin', 'student'               |
| `email`     | string    | User's email address                      |
| `isActive`  | boolean   | Whether the account is active             |
| `createdAt` | timestamp | Document creation time                    |
| `updatedAt` | timestamp | Last update time                          |

## 2. students
**Purpose:** Store the official club student profile.
**Document ID:** Student's registration/roll number.

**Registration Number Rules:**
1. Must be treated as an alphanumeric STRING (e.g. `24PA1A05I7`).
2. Do NOT convert to a numeric value or remove letters.
3. Preserve the exact capitalization provided.
4. Registration/roll numbers must be unique.
5. Email is strictly `{rollNumber}@vishnu.edu.in`.

| Field         | Type      | Description                                                |
|---------------|-----------|------------------------------------------------------------|
| `studentId`   | string    | Roll number (same as Doc ID)                               |
| `rollNumber`  | string    | Roll number (Alphanumeric string)                          |
| `name`        | string    | Student's full name                                        |
| `email`       | string    | Must be `rollNumber@vishnu.edu.in`                         |
| `branch`      | string    | Student's branch (e.g. CSE, IT, ECE)                       |
| `currentTeam` | string    | Allowed: 'VC', 'IC', 'AI', 'MK', 'UNASSIGNED'              |
| `isActive`    | boolean   | Whether the student is active                              |
| `authUid`     | string    | Connects profile to Firebase Auth                          |
| `createdAt`   | timestamp | Document creation time                                     |
| `updatedAt`   | timestamp | Last update time                                           |

## 3. groups
**Purpose:** Fixed conceptual structure for the four club groups.
**Document ID:** Group ID (VC, IC, AI, MK).

| Field         | Type      | Description                               |
|---------------|-----------|-------------------------------------------|
| `groupId`     | string    | VC, IC, AI, MK                            |
| `name`        | string    | Vibe Coding, Industry Connect, etc.       |
| `description` | string    | Group description                         |
| `isActive`    | boolean   | Whether the group is currently active     |
| `createdAt`   | timestamp | Document creation time                    |
| `updatedAt`   | timestamp | Last update time                          |

## 4. attendance
**Purpose:** Store one attendance record for one student on one date.
**Document ID Format:** `{studentId}_{YYYY-MM-DD}` (e.g. `24PA1A42A3_2026-09-30`)

| Field                  | Type      | Description                                        |
|------------------------|-----------|----------------------------------------------------|
| `studentId`            | string    | Roll number                                        |
| `rollNumber`           | string    | Roll number                                        |
| `studentName`          | string    | Student's full name                                |
| `date`                 | string    | YYYY-MM-DD format                                  |
| `status`               | string    | Allowed: 'present', 'absent'                       |
| `teamAtAttendance`     | string    | Team ID at the time (Historical preserve)          |
| `groupNameAtAttendance`| string    | Team name at the time                              |
| `markedBy`             | string    | Admin UID who marked it                            |
| `markedAt`             | timestamp | Timestamp of marking                               |
| `updatedAt`            | timestamp | Last update time                                   |

## 5. teamMemberships
**Purpose:** Maintain the complete history of team changes.
**Document ID:** Auto-generated.

| Field         | Type      | Description                               |
|---------------|-----------|-------------------------------------------|
| `studentId`   | string    | Roll number                               |
| `team`        | string    | Team ID (VC, IC, AI, MK, UNASSIGNED)      |
| `startDate`   | timestamp | When the membership started               |
| `endDate`     | timestamp | When it ended (null if current)           |
| `changedBy`   | string    | Admin UID who made the change             |
| `changedAt`   | timestamp | Timestamp of change                       |
| `reason`      | string    | Reason for team change                    |

## 6. auditLogs
**Purpose:** Track important administrative actions.
**Document ID:** Auto-generated.

| Field         | Type      | Description                               |
|---------------|-----------|-------------------------------------------|
| `action`      | string    | e.g. STUDENT_CREATED, TEAM_CHANGED        |
| `targetType`  | string    | e.g. 'student', 'attendance'              |
| `targetId`    | string    | ID of the modified document               |
| `studentId`   | string    | Associated student ID (if applicable)     |
| `performedBy` | string    | Admin UID who performed the action        |
| `performedAt` | timestamp | Timestamp of action                       |
| `oldValue`    | object    | Previous state data                       |
| `newValue`    | object    | New state data                            |
| `reason`      | string    | Optional reason for action                |
| `metadata`    | object    | Any additional context                    |

---
**Data Integrity Rules:**
1. No passwords stored in Firestore.
2. No Firebase Admin credentials in React.
3. Historical attendance preserves team at time of record.
4. Changing a student's currentTeam does NOT rewrite historical attendance.
5. Changing a student's team creates/updates team membership history.
6. A student has only one current team (can be UNASSIGNED).
7. Only approved club students (provisioned by admin) gain portal access.
8. @vishnu.edu.in domain alone does NOT grant access. No public signup.
9. Registration/roll numbers are strictly alphanumeric strings and must not be altered.
10. Firebase Storage is used for leave attachments (see section 8).

---
## 7. leaveRequests
**Purpose:** Store student requests for absence.
**Document ID:** Auto-generated Firestore ID.

| Field              | Type      | Description                                          |
|--------------------|-----------|------------------------------------------------------|
| `leaveRequestId`   | string    | Auto-generated ID                                    |
| `studentId`        | string    | Roll number                                          |
| `rollNumber`       | string    | Roll number                                          |
| `studentName`      | string    | Student's full name                                  |
| `teamAtRequest`    | string    | Student's team at the time of request (Historical preserve) |
| `leaveDate`        | string    | YYYY-MM-DD format                                    |
| `reason`           | string    | Mandatory reason for absence                         |
| `permissionLetter` | object    | Optional file metadata (see below)                   |
| `status`           | string    | 'pending', 'approved', 'rejected'                    |
| `submittedAt`      | timestamp | When the request was created                         |
| `reviewedBy`       | string    | Admin UID who reviewed it                            |
| `reviewedAt`       | timestamp | When the admin reviewed it                           |
| `adminRemarks`     | string    | Optional remarks from the admin                      |
| `updatedAt`        | timestamp | Last update time                                     |

**Permission Letter Structure (metadata only):**
```json
{
  "fileName": "string",
  "storagePath": "string",
  "contentType": "string",
  "size": "number",
  "uploadedAt": "timestamp"
}
```

**Leave Business Rules:**
1. Only authenticated, active students can submit for themselves.
2. The reason field is mandatory; the permission letter is optional.
3. Actual files are stored in Firebase Storage, NOT Firestore.
4. Students cannot approve, reject, edit, or delete submitted leave requests.
5. Submitting or approving a leave request does NOT automatically change attendance records.
6. `teamAtRequest` must preserve the student's team exactly as it was when the request was submitted.
7. **Duplicate Protection:** A student cannot create multiple active leave requests for the same date.

---
## 8. Firebase Storage (Leave Attachments)
**Purpose:** Store uploaded permission letters securely.
**Path Structure:** `leave-requests/{studentId}/{leaveRequestId}/{fileName}`

**Security Considerations:**
- Files must NOT be publicly exposed by default.
- Students can only access their own uploaded files.
- Admins can access any student's files.
