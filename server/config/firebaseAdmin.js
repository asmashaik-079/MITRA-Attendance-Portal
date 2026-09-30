const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

let adminAuth = null;
let adminDb = null;
let isInitialized = false;
let initializationError = null;

try {
  const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
  
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error('Firebase Admin service account key file is missing.');
  }

  const serviceAccount = require(serviceAccountPath);

  let app;
  if (!getApps().length) {
    app = initializeApp({
      credential: cert(serviceAccount)
    });
  } else {
    app = getApps()[0];
  }
  
  isInitialized = true;
  adminAuth = getAuth(app);
  adminDb = getFirestore(app);
  
} catch (error) {
  isInitialized = false;
  initializationError = 'Failed to initialize Firebase Admin SDK. Check server configuration.';
  console.error('[Firebase Admin Error]:', error.message || 'Initialization failed.');
}

module.exports = {
  adminAuth,
  adminDb,
  isInitialized,
  initializationError
};
