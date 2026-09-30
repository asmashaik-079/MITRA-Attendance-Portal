const { adminAuth, adminDb } = require('../config/firebaseAdmin');
const { COLLECTIONS, AUDIT_ACTIONS, ROLES } = require('../utils/constants');
const { FieldValue } = require('firebase-admin/firestore');

/**
 * Provision a single student idempotently
 */
const provisionStudent = async (studentData, adminUid) => {
  const { rollNumber, name, branch, currentTeam, email } = studentData;
  const initialPassword = process.env.INITIAL_STUDENT_PASSWORD;

  if (!initialPassword) {
    throw new Error('INITIAL_STUDENT_PASSWORD environment variable is missing.');
  }

  let authUid = null;
  let isNewAuth = false;
  let isNewStudent = false;
  let isNewUserDoc = false;
  let isNewMembership = false;
  let isNewAuditLog = false;

  // 1. Check or Create Auth User
  try {
    const existingUser = await adminAuth.getUserByEmail(email);
    authUid = existingUser.uid;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      const newUser = await adminAuth.createUser({
        email,
        password: initialPassword,
        displayName: name,
        disabled: false
      });
      authUid = newUser.uid;
      isNewAuth = true;
    } else {
      throw new Error(`Auth check/creation failed: ${error.message}`);
    }
  }

  // Use a batch to execute Firestore writes idempotently where possible
  const batch = adminDb.batch();
  const timestamp = FieldValue.serverTimestamp();

  // 2. Users Collection
  const userRef = adminDb.collection(COLLECTIONS.USERS).doc(authUid);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    batch.set(userRef, {
      uid: authUid,
      role: ROLES.STUDENT,
      email,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    isNewUserDoc = true;
  } else {
    batch.update(userRef, {
      role: ROLES.STUDENT, // ensure role is correct
      updatedAt: timestamp
    });
  }

  // 3. Students Collection
  const studentRef = adminDb.collection(COLLECTIONS.STUDENTS).doc(rollNumber);
  const studentDoc = await studentRef.get();
  
  if (!studentDoc.exists) {
    batch.set(studentRef, {
      studentId: rollNumber,
      rollNumber,
      name,
      email,
      branch,
      currentTeam,
      isActive: true,
      authUid,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    isNewStudent = true;
  } else {
    // Preserve existing currentTeam and other safe fields, just update authUid and updatedAt if necessary
    batch.update(studentRef, {
      authUid,
      updatedAt: timestamp
    });
  }

  // 4. Initial Team Membership
  // Only create if we are creating a new student record
  if (isNewStudent) {
    const membershipRef = adminDb.collection(COLLECTIONS.TEAM_MEMBERSHIPS).doc();
    batch.set(membershipRef, {
      studentId: rollNumber,
      team: currentTeam,
      startDate: timestamp,
      endDate: null,
      changedBy: adminUid,
      changedAt: timestamp,
      reason: "Initial club membership import"
    });
    isNewMembership = true;
  }

  // 5. Audit Log
  if (isNewStudent) {
    const auditRef = adminDb.collection(COLLECTIONS.AUDIT_LOGS).doc();
    batch.set(auditRef, {
      action: AUDIT_ACTIONS.STUDENT_CREATED,
      targetType: 'student',
      targetId: rollNumber,
      studentId: rollNumber,
      performedBy: adminUid,
      performedAt: timestamp,
      oldValue: null,
      newValue: {
        rollNumber,
        name,
        branch,
        currentTeam,
        email,
        authUid
      },
      reason: "Initial club membership import"
    });
    isNewAuditLog = true;
  }

  // Commit Firestore batch
  await batch.commit();

  return {
    authUid,
    isNewAuth,
    isNewStudent,
    isNewUserDoc,
    isNewMembership,
    isNewAuditLog
  };
};

module.exports = {
  provisionStudent
};
