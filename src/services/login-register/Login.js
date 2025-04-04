import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
<<<<<<< Updated upstream
=======
import styles from './Login.module.css';
>>>>>>> Stashed changes

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);

      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      console.log('User authenticated:', user.uid);

      // Get user role from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;

        console.log('User document found with role:', role);

        // Redirect based on role
        if (role === 'student') {
          router.push('/StudentDashboard');
        } else if (role === 'tutor') {
          router.push('/TutorDashboard');
        } else if (role === 'admin') {
          router.push('/AdminDashboard');
        } else if (role === 'it') {
          router.push('/AdminDashboard');
        } else {
          router.push('/');
        }
      } else {
        console.log('User document not found. Creating one...');

        // User exists in Auth but not in Firestore
        // Create a basic user profile with student role by default
        try {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            role: 'student', // Default role
            displayName: user.displayName || email.split('@')[0],
            createdAt: new Date().toISOString(),
          });

          console.log('Created user document');
          router.push('/StudentDashboard');
        } catch (firestoreError) {
          console.error('Error creating user document:', firestoreError);
          setError('Failed to create user profile: ' + firestoreError.message);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
<<<<<<< Updated upstream
      setError('Failed to log in: ' + error.message);
=======
      if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/user-not-found') {
        setError('No account found with this email. Please try again.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/user-disabled') {
        setError('This account has been disabled. Please contact support.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many unsuccessful attempts. Please try again later.');
      } else {
        setError('Failed to log in: ' + error.message);
      }
>>>>>>> Stashed changes
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< Updated upstream
    <div className="login-container">
      <h2>Log in to Your Tiya Account</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
=======
    <div className={styles.loginContainer}>
      <h2>Log in</h2>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
>>>>>>> Stashed changes
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

<<<<<<< Updated upstream
        <div className="form-group">
=======
        <div className={styles.formGroup}>
>>>>>>> Stashed changes
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

<<<<<<< Updated upstream
        <div className="forgot-password">
          <Link href="/Forgot-password">Forgot password?</Link>
        </div>

        <button type="submit" disabled={loading}>
=======
        <div className={styles.forgotPassword}>
          <Link href="/Forgot-password">Forgot Password?</Link>
        </div>

        <button type="submit" disabled={loading} className={styles.loginButton}>
>>>>>>> Stashed changes
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

<<<<<<< Updated upstream
      <div className="register-link">
=======
      <div className={styles.registerLink}>
>>>>>>> Stashed changes
        Don&rsquo;t have an account? <Link href="/Register">Sign up</Link>
      </div>
    </div>
  );
};

export default Login;
