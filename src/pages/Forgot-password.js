import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';
import { auth } from '../firebaseConfig';
import styles from '../styles/Forgot-password.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setMessage('');
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Failed to send reset email: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Reset Password</h2>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {message && <div className={styles.successMessage}>{message}</div>}

      <form onSubmit={handleSubmit} className={styles.formGroup}>
        <div className={styles.formInput}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading} className={styles.resetButton}>
          {loading ? 'Sending...' : 'Reset Password'}
        </button>
      </form>

      <div className={styles.loginLink}>
        <Link href="/Login" className={styles.link}>
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
