import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (password !== confirmPassword) {
      return setError("Passwords don't match");
    }

    if (password.length < 6) {
      return setError('Password should be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);

      // Create the user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      console.log('User created in Authentication:', user.uid);

      try {
        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          firstName,
          lastName,
          displayName: `${firstName} ${lastName}`,
          role,
          profileComplete: false, // Add this flag to track profile completion
          createdAt: new Date().toISOString(),
        });

        console.log('User document created in Firestore');

        // Redirect based on role
        if (role === 'student') {
          router.push('/StudentDashboard');
        } else if (role === 'tutor') {
          // Redirect tutors to profile setup page
          router.push('/TutorProfile');
        }
      } catch (firestoreError) {
        console.error('Firestore error:', firestoreError);
        setError(
          `Account created but profile setup failed: ${firestoreError.message}. Please contact support.`,
        );
        // You might want to delete the auth user here since the Firestore doc wasn't created
      }
    } catch (authError) {
      console.error('Authentication error:', authError);
      setError('Failed to create an account: ' + authError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="bg-white p-4 rounded shadow" style={{ maxWidth: '500px', width: '100%' }}>
        <h2 className="text-center mb-4">Create Your Tiya Account</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">I am a:</label>
            <div className="d-flex gap-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="role"
                  id="roleStudent"
                  value="student"
                  checked={role === 'student'}
                  onChange={(e) => setRole(e.target.value)}
                />
                <label className="form-check-label" htmlFor="roleStudent">
                  Student
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="role"
                  id="roleTutor"
                  value="tutor"
                  checked={role === 'tutor'}
                  onChange={(e) => setRole(e.target.value)}
                />
                <label className="form-check-label" htmlFor="roleTutor">
                  Tutor
                </label>
              </div>
            </div>
          </div>
          
          <div className="row mb-3">
            <div className="col-md-6 mb-3 mb-md-0">
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input
                type="text"
                className="form-control"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input
                type="text"
                className="form-control"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
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
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn w-100 py-2 mb-3"
            style={{ backgroundColor: '#67c2ff', borderColor: '#67c2ff', color: 'white' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="text-center">
          Already have an account? <Link href="/login" className="text-decoration-none" style={{ color: '#67c2ff' }}>Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;