require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { adminAuth, adminDb, isInitialized } = require('../config/firebaseAdmin');
const { validateStudentImport } = require('../services/studentImportValidationService');
const { provisionStudent } = require('../services/studentProvisioningService');
const { ROLES, COLLECTIONS } = require('../utils/constants');

const dataPath = path.resolve(__dirname, '../data/private/clubStudents.json');
const ADMIN_EMAIL = 'admin@vishnu.edu.in';

const runProvisioning = async () => {
  console.log('\n--- MITRA ATTENDANCE PORTAL: PROVISIONING SCRIPT ---\n');

  // Safely verify env
  if (!process.env.INITIAL_STUDENT_PASSWORD) {
    console.error('ERROR: INITIAL_STUDENT_PASSWORD is not set in .env');
    process.exit(1);
  }

  if (!isInitialized) {
    console.error('ERROR: Firebase Admin failed to initialize.');
    process.exit(1);
  }

  // Safely ensure admin exists
  let adminUid = null;
  try {
    const adminUser = await adminAuth.getUserByEmail(ADMIN_EMAIL);
    adminUid = adminUser.uid;
    console.log(`Admin account confirmed: ${ADMIN_EMAIL}`);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      console.log(`Admin account ${ADMIN_EMAIL} not found. Creating admin...`);
      // Optional: Ask user to create it from console, or we create it here with a secure prompt.
      // But the instructions say: "Do NOT change the admin password. Find the Admin Auth UID using Firebase Admin SDK. Do NOT create another admin account."
      // Ah! "Do NOT create another admin account." - meaning if it's missing, fail.
      console.error(`ERROR: Admin account ${ADMIN_EMAIL} does not exist in Firebase Auth. Please create it manually in Firebase Console first.`);
      process.exit(1);
    } else {
      console.error(`ERROR fetching admin account: ${err.message}`);
      process.exit(1);
    }
  }

  // Ensure Admin Users document exists
  try {
    const adminRef = adminDb.collection(COLLECTIONS.USERS).doc(adminUid);
    const adminDoc = await adminRef.get();
    if (!adminDoc.exists) {
      console.log(`Creating users collection document for admin...`);
      await adminRef.set({
        uid: adminUid,
        role: ROLES.ADMIN,
        email: ADMIN_EMAIL,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  } catch (err) {
    console.error(`ERROR verifying admin users document: ${err.message}`);
    process.exit(1);
  }

  // Load and validate students
  if (!fs.existsSync(dataPath)) {
    console.error('ERROR: clubStudents.json not found.');
    process.exit(1);
  }

  const rawStudents = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const validationResult = validateStudentImport(rawStudents);

  if (!validationResult.isValid) {
    console.error('ERROR: Student data validation failed. Cannot proceed with provisioning.');
    validationResult.errors.forEach(err => console.error(` - ${err}`));
    process.exit(1);
  }

  console.log(`Validation passed. Starting provisioning for ${validationResult.parsedStudents.length} students...\n`);

  // Summary Metrics
  const summary = {
    totalRecords: rawStudents.length,
    newAuth: 0,
    reusedAuth: 0,
    newStudentDocs: 0,
    reusedStudentDocs: 0,
    newUserDocs: 0,
    reusedUserDocs: 0,
    newMemberships: 0,
    reusedMemberships: 0,
    auditLogs: 0,
    failures: []
  };

  // Process all students
  let count = 0;
  for (const studentData of validationResult.parsedStudents) {
    count++;
    console.log(`[${count}/${summary.totalRecords}] Provisioning ${studentData.rollNumber}...`);
    try {
      const res = await provisionStudent(studentData, adminUid || 'system-initial-import');
      
      if (res.isNewAuth) summary.newAuth++; else summary.reusedAuth++;
      if (res.isNewStudent) summary.newStudentDocs++; else summary.reusedStudentDocs++;
      if (res.isNewUserDoc) summary.newUserDocs++; else summary.reusedUserDocs++;
      if (res.isNewMembership) summary.newMemberships++; else summary.reusedMemberships++;
      if (res.isNewAuditLog) summary.auditLogs++;
      
    } catch (err) {
      summary.failures.push({
        rollNumber: studentData.rollNumber,
        name: studentData.name,
        error: err.message
      });
    }
  }

  // Print Summary
  console.log('\n==================================================');
  console.log('STUDENT PROVISIONING COMPLETE');
  console.log('==================================================');
  console.log(`Total source records: ${summary.totalRecords}\n`);
  
  console.log(`New Auth accounts: ${summary.newAuth}`);
  console.log(`Existing Auth accounts reused: ${summary.reusedAuth}\n`);
  
  console.log(`New student documents: ${summary.newStudentDocs}`);
  console.log(`Existing student documents reused/updated: ${summary.reusedStudentDocs}\n`);
  
  console.log(`New users documents: ${summary.newUserDocs}`);
  console.log(`Existing users documents: ${summary.reusedUserDocs}\n`);
  
  console.log(`New team memberships: ${summary.newMemberships}`);
  console.log(`Existing memberships preserved: ${summary.reusedMemberships}\n`);
  
  console.log(`Audit logs created: ${summary.auditLogs}\n`);
  
  console.log(`Failures: ${summary.failures.length}`);
  
  if (summary.failures.length > 0) {
    console.log('\n--- Failure Details ---');
    summary.failures.forEach(f => {
      console.log(`- ${f.rollNumber} (${f.name}): ${f.error}`);
    });
  }

  console.log('==================================================\n');
  process.exit(summary.failures.length > 0 ? 1 : 0);
};

runProvisioning();
