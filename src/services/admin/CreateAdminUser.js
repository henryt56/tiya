import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig.js';

function generateSecurePassword(length = 16) {
  const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijkmnopqrstuvwxyz';
  const numberChars = '23456789';
  const specialChars = '!@#$%^&*_-+=';

  let password =
    uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length)) +
    lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length)) +
    numberChars.charAt(Math.floor(Math.random() * numberChars.length)) +
    specialChars.charAt(Math.floor(Math.random() * specialChars.length));

  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // fisher-yates shuffle
  const passwordArray = password.split('');
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join('');
}

export const createAdminUser = async (email, role = 'admin', createdBy) => {
  try {
    const generatedPassword = generateSecurePassword();
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      generatedPassword
    );
    const user = userCredential.user;
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      role: role, // 'admin' or 'it'
      displayName: email.split('@')[0],
      profileComplete: true,
      createdAt: serverTimestamp(),
      createdBy: createdBy, // store who created this admin for audit trail
      requirePasswordChange: true,
      accessLevel: role === 'it' ? 'full' : 'standard', // access lvls to be implemented... another time
    });

    // for prod apps...
    // await sendPasswordResetEmail(auth, email);

    // Log this action in a separate audit collection
    await setDoc(doc(db, 'admin_audit_log', `${Date.now()}_${user.uid}`), {
      action: 'create_admin',
      adminId: user.uid,
      adminEmail: email,
      createdBy: createdBy,
      role: role,
      timestamp: serverTimestamp()
    });

    return {
      success: true,
      message: 'Admin user created successfully',
      userId: user.uid,
      temporaryPassword: generatedPassword
    };
  } catch (error) {
    console.error('Error creating admin user:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

export default createAdminUser; 
