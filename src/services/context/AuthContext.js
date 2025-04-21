import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signOut, onAuthStateChanged, setPersistence, browserSessionPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Session storage key for admin login state
const ADMIN_SESSION_KEY = 'admin_session';
// Admin session timeout in minutes (set to 30 minutes of inactivity)
const ADMIN_SESSION_TIMEOUT_MINUTES = 30;

// Custom hook for session activity monitoring
export const useSessionTimeout = () => {
  const { isAdmin, logout } = useAuth();

  const resetSessionTimer = useCallback(() => {
    if (!isAdmin) return;

    // Update last activity timestamp in session storage
    const adminSession = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (adminSession) {
      try {
        const sessionData = JSON.parse(adminSession);
        sessionData.lastActivity = Date.now();
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
      } catch (error) {
        console.error('Error updating session activity:', error);
      }
    }
  }, [isAdmin]);

  const checkSessionTimeout = useCallback(() => {
    if (!isAdmin) return;

    const adminSession = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!adminSession) return;

    try {
      const sessionData = JSON.parse(adminSession);
      const lastActivity = sessionData.lastActivity || sessionData.lastLogin;
      const now = Date.now();
      const timeoutMs = ADMIN_SESSION_TIMEOUT_MINUTES * 60 * 1000;

      if (now - lastActivity > timeoutMs) {
        console.log('Admin session timeout - logging out');
        logout();
      }
    } catch (error) {
      console.error('Error checking session timeout:', error);
    }
  }, [isAdmin, logout]);

  useEffect(() => {
    if (!isAdmin) return;

    // Set up event listeners for user activity
    const activityEvents = [
      'mousedown', 'mousemove', 'keypress',
      'scroll', 'touchstart', 'click'
    ];

    // Handler for user activity
    const activityHandler = () => {
      resetSessionTimer();
    };

    // Add activity event listeners
    activityEvents.forEach(eventName => {
      window.addEventListener(eventName, activityHandler);
    });

    // Set up interval to check for timeout
    const intervalId = setInterval(checkSessionTimeout, 60000); // Check every minute

    // Initialize session activity
    resetSessionTimer();

    return () => {
      // Clean up event listeners and interval
      activityEvents.forEach(eventName => {
        window.removeEventListener(eventName, activityHandler);
      });
      clearInterval(intervalId);
    };
  }, [isAdmin, resetSessionTimer, checkSessionTimeout]);

  return { resetSessionTimer };
};

export const getUserData = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const getUserRole = async (uid) => {
  try {
    const userData = await getUserData(uid);
    return userData ? userData.role : null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

export const isUserAdmin = async (uid) => {
  try {
    const userData = await getUserData(uid);
    // Check for admin or IT roles which have admin privileges
    return userData && (userData.role === 'admin' || userData.role === 'it');
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Verify admin permissions with a timestamp check to prevent session fixation
export const verifyAdminPermissions = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return false;

    const userData = userSnap.data();
    const isAdmin = userData.role === 'admin' || userData.role === 'it';

    if (!isAdmin) return false;

    // Check if last verification was recent (within 15 minutes)
    const now = Date.now();
    const lastVerified = userData.lastAdminVerification || 0;
    const fifteenMinutes = 15 * 60 * 1000;

    // If verification is stale, return false to force re-authentication
    if (now - lastVerified > fifteenMinutes) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Admin verification error:', error);
    return false;
  }
};

// Login with email and password with appropriate persistence for user role
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    // First sign in with default persistence to get the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if user is admin
    const adminStatus = await isUserAdmin(user.uid);

    if (adminStatus) {
      // For admins, set session persistence and store session data
      await setPersistence(auth, browserSessionPersistence);

      // Store in session storage
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
        uid: user.uid,
        email: user.email,
        lastLogin: Date.now()
      }));

      // Update last login in firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
        lastAdminVerification: Date.now()
      });
    }

    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// add more get user data fxns here

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear admin session data
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      setCurrentUser(null);
      setUserRole(null);
      setIsAdmin(false);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Check for session storage on admin users
    const checkAdminSession = async (user) => {
      if (!user) return null;

      const adminStatus = await isUserAdmin(user.uid);

      if (adminStatus) {
        // Admin users - check session storage
        const adminSession = sessionStorage.getItem(ADMIN_SESSION_KEY);

        if (!adminSession) {
          // No session found for admin - force logout
          console.log('Admin session expired - logging out');
          await signOut(auth);
          return null;
        }

        // Validate admin session
        try {
          const sessionData = JSON.parse(adminSession);
          if (sessionData.uid !== user.uid) {
            // Session mismatch - force logout
            console.log('Admin session mismatch - logging out');
            await signOut(auth);
            sessionStorage.removeItem(ADMIN_SESSION_KEY);
            return null;
          }
        } catch (error) {
          console.error('Admin session parse error:', error);
          sessionStorage.removeItem(ADMIN_SESSION_KEY);
          await signOut(auth);
          return null;
        }
      }

      return user;
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Apply admin session checks
      user = await checkAdminSession(user);

      setCurrentUser(user);

      if (user) {
        // Get and set user roles
        try {
          const userRole = await getUserRole(user.uid);
          setUserRole(userRole);

          // Check if user is admin
          const adminStatus = await isUserAdmin(user.uid);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('Error getting user role:', error);
          setUserRole(null);
          setIsAdmin(false);
        }
      }

      setLoading(false);
    });

    // Add event listener to clear admin sessions on page unload
    const handleBeforeUnload = () => {
      if (isAdmin && currentUser) {
        // Don't actually remove the session data here because we want to check
        // if the session was terminated when the user comes back
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAdmin, currentUser]);

  const value = {
    currentUser,
    userRole,
    isAdmin,
    getUserRole,
    isUserAdmin,
    verifyAdminPermissions,
    logout,
    loading,
    loginWithEmailAndPassword, // Expose the login function
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};
