import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

// AuthRoute is for pages that should only be accessible when NOT logged in
// (like login and register pages)
export const AuthRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && currentUser) {
      // User is logged in, redirect to appropriate page
      router.push('/');
    }
  }, [currentUser, loading, router]);

  if (loading || currentUser) {
    return <div>Loading...</div>;
  }

  // Not logged in, show the children (login/register form)
  return children;
};
