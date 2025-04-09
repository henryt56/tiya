import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

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
      setError('Failed to log in: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div
        className="login-container bg-white p-4 rounded shadow"
        style={{ maxWidth: '400px', width: '100%' }}
      >
        <h2 className="text-center mb-4">Log in to Your Tiya Account</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <Link
                href="/forgot-password"
                className="text-decoration-none"
                style={{ color: '#67c2ff' }}
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="btn w-100 py-2"
            style={{
              backgroundColor: '#67c2ff',
              borderColor: '#67c2ff',
              color: 'white',
            }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="text-center mt-3">
          Don&apos;t have an account?{' '}
          <Link
            href="/Register"
            className="text-decoration-none"
            style={{ color: '#67c2ff' }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
