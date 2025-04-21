import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useAuth } from '../../services/context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminVerification, setAdminVerification] = useState(false);
  const [adminVerificationCode, setAdminVerificationCode] = useState('');
  const [adminUser, setAdminUser] = useState(null);

  // Get auth context with the loginWithEmailAndPassword function
  const { loginWithEmailAndPassword } = useAuth();

  const router = useRouter();

  // Handle admin verification code submission
  const handleAdminVerification = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app, this would verify the code against a code sent via SMS/email
      // Here we're using a simple check for demonstration
      if (adminVerificationCode === '123456') { // server-gen code in prod

        await updateDoc(doc(db, 'users', adminUser.uid), {
          lastAdminVerification: Date.now(),
          lastLogin: serverTimestamp()
        });

        router.push('/AdminDashboard');
      } else {
        setError('Invalid verification code');
      }
    } catch (error) {
      console.error('Admin verification error:', error);
      setError('Verification failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);

      // Sign in using the context function (non-persistent for admins)
      const user = await loginWithEmailAndPassword(email, password);

      console.log('User authenticated:', user.uid);

      // Get user role from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;

        console.log('User document found with role:', role);

        // If admin or IT role, require additional verification
        if (role === 'admin' || role === 'it') {
          // In prod, send verification code to user's device here

          // Set admin verification state
          setAdminUser(user);
          setAdminVerification(true);
          return; // Don't redirect yet - wait for verification
        }

        // Check if tutor profile is complete
        if (role === 'tutor' && userData.profileComplete === false) {
          // Tutor with incomplete profile - redirect to profile setup
          router.push('/TutorProfile');
          return;
        }

        // Redirect based on role
        if (role === 'student') {
          router.push('/StudentDashboard');
        } else if (role === 'tutor') {
          router.push('/TutorDashboard');
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
            profileComplete: false,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
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

  // If admin is verifying, show verification form
  if (adminVerification) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div
          className="login-container bg-white p-4 rounded shadow"
          style={{ maxWidth: '400px', width: '100%' }}
        >
          <h2 className="text-center mb-4">Admin Verification</h2>
          <p className="text-center mb-4">
            For security reasons, please enter the verification code sent to your registered email.
          </p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleAdminVerification}>
            <div className="mb-3">
              <label htmlFor="verification-code" className="form-label">
                Verification Code
              </label>
              <input
                type="text"
                className="form-control"
                id="verification-code"
                value={adminVerificationCode}
                onChange={(e) => setAdminVerificationCode(e.target.value)}
                required
              />
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
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          <div className="text-center mt-3">
            <a
              href="#"
              className="text-decoration-none"
              style={{ color: '#67c2ff' }}
              onClick={(e) => {
                e.preventDefault();
                setAdminVerification(false);
              }}
            >
              Back to login
            </a>
          </div>
        </div>
      </div>
    );
  }

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
                href="/Forgot-password"
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