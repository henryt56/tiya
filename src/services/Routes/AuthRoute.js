// components/AuthRoute.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types';

// AuthRoute is for pages that should only be accessible when NOT logged in
// (like login and register pages)
const AuthRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && currentUser) {
      // User is logged in, redirect to appropriate page
      router.push('/');
    }
  }, [currentUser, loading, router]);

  // If loading or user is logged in, don't render the children yet
  if (loading || currentUser) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  // Not logged in, show the children (login/register form)
  return children;
};

AuthRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthRoute;
