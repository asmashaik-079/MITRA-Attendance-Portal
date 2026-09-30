import { 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged 
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

// Define the admin email
const ADMIN_EMAIL = "admin@vishnu.edu.in";
const ALLOWED_DOMAIN = "@vishnu.edu.in";

/**
 * Sign in a user with email and password
 */
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Verify domain restriction
    if (!user.email.endsWith(ALLOWED_DOMAIN)) {
      await signOut(auth);
      throw new Error(`Unauthorized: Email must end with ${ALLOWED_DOMAIN}`);
    }

    // Verify role and access
    const roleData = await getUserRoleAndAccess(user.uid, user.email);
    
    if (roleData.role === "student" && !roleData.isApproved) {
      await signOut(auth);
      throw new Error("Unauthorized: Student record not found or not approved by admin.");
    }

    return { user, ...roleData };
  } catch (error) {
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOutUser = async () => {
  return signOut(auth);
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  if (!email.endsWith(ALLOWED_DOMAIN)) {
    throw new Error(`Invalid email domain. Must be ${ALLOWED_DOMAIN}`);
  }
  return sendPasswordResetEmail(auth, email);
};

/**
 * Check if the user is an admin or a valid student
 */
export const getUserRoleAndAccess = async (uid, email) => {
  if (email === ADMIN_EMAIL) {
    return { role: "admin", isApproved: true };
  }

  // If not admin, check Firestore for a provisioned student record
  // Assuming student records are kept in a 'students' collection where the document ID is the UID
  // or there is a field matching the email. We'll use UID as standard practice.
  try {
    const studentDocRef = doc(db, "students", uid);
    const studentDoc = await getDoc(studentDocRef);

    if (studentDoc.exists()) {
      // In the future, this can check an 'isApproved' or 'status' field.
      // For now, existence of the provisioned record grants access.
      return { role: "student", isApproved: true, data: studentDoc.data() };
    }
  } catch (error) {
    console.error("Error fetching student record:", error);
  }

  // Not an admin and no student record found
  return { role: "student", isApproved: false };
};

/**
 * Listen to auth state changes
 * @param {Function} callback - Function to call with the user and their role data
 */
export const listenToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Verify domain on auth state change (e.g., page reload)
      if (!user.email.endsWith(ALLOWED_DOMAIN)) {
        await signOut(auth);
        callback(null);
        return;
      }

      const roleData = await getUserRoleAndAccess(user.uid, user.email);
      
      if (roleData.role === "student" && !roleData.isApproved) {
        await signOut(auth);
        callback(null);
        return;
      }

      callback({ user, ...roleData });
    } else {
      callback(null);
    }
  });
};
