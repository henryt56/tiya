import { createContext, useContext, useState, useEffect } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

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

// add more get user data fxns here

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserRole(null);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Get and set user roles
        try {
          const userRole = await getUserRole(user.uid);
          setUserRole(userRole);
        } catch (error) {
          console.error('Error getting user role:', error);
          setUserRole(null);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  const value = {
    currentUser,
    userRole,
    getUserRole,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};
