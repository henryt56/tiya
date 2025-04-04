import React from 'react';
import styles from './Banner.module.css';
import { MdOutlineMessage } from 'react-icons/md';
import { CgProfile } from 'react-icons/cg';
import { FiMenu } from 'react-icons/fi';

export default function Banner() {
  const { currentUser, userRole, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      if (router.pathname === '/') {
        // Next.js by default will run an error if the user tries
        // redirect to the same page in order to prevent degradation of performance
        // Thus, I add a conditional so that if they are on the root dir and try to logout,
        // then logout, reload the page, otherwise, logout and redirect to home page
        window.location.reload();
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileClick = () => {
    if (currentUser) {
      // Redirect to appropriate dashboard based on role
      if (userRole === 'student') {
        router.push('/StudentDashboard');
      } else if (userRole === 'tutor') {
        router.push('/TutorDashboard');
      } else if (userRole === 'admin' || userRole === 'it') {
        router.push('/AdminDashboard');
      }
    } else {
      // If not logged in, go to login page
      router.push('/Login');
    }
  };

  return (
    <div className={styles.banner}>
      <div className={styles.bannerContent}></div>

      <div className={styles.navIcons}>
        <button className={styles.iconButton}>
          <MdOutlineMessage />
        </button>
        <button className={styles.iconButton}>
          <CgProfile />
        </button>
        <button className={styles.iconButton}>
          <FiMenu />
        </button>
      </div>
    </div>
  );
}
