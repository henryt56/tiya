import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !currentUser) {
      router.push('/Login');
      return;
    }

    // If user exists but doesn't have required role, redirect to appropriate dashboard
    if (
      !loading &&
      currentUser &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(userRole)
    ) {
      switch (userRole) {
        case 'student':
          router.push('/StudentDashboard');
          break;
        case 'tutor':
          router.push('/TutorDashboard');
          break;
        case 'admin':
          router.push('/AdminDashboard');
          break;
        default:
          router.push('/Login');
      }
    }
  }, [currentUser, userRole, loading, router, allowedRoles]);

  // Show loading or render children
  if (
    loading ||
    !currentUser ||
    (allowedRoles.length > 0 && !allowedRoles.includes(userRole))
  ) {
    return <div>Loading...</div>;
  }

  return children;
};
