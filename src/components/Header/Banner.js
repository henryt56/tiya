import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './Banner.module.css';
import { MdOutlineMessage } from 'react-icons/md';
import { CgProfile } from 'react-icons/cg';
import { FiMenu, FiLogOut } from 'react-icons/fi';
import { BiLogIn } from 'react-icons/bi';
import { useAuth } from '../../services/context/AuthContext';

export default function Banner() {
  const { currentUser, userRole, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
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
      <div className={styles.bannerContent}>
        {/* Navigation links can go here */}
        <nav className={styles.navigation}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          {currentUser && userRole === 'student' && (
            <Link href="/Search" className={styles.navLink}>
              Find Tutors
            </Link>
          )}
          {currentUser && userRole === 'tutor' && (
            <Link href="/Sessions" className={styles.navLink}>
              My Sessions
            </Link>
          )}
          <Link href="/About" className={styles.navLink}>
            About Us
          </Link>
          <Link href="/Contact" className={styles.navLink}>
            Contact
          </Link>
        </nav>
      </div>

      <div className={styles.navIcons}>
        {currentUser ? (
          <>
            <button className={styles.iconButton} title="Messages">
              <MdOutlineMessage />
            </button>
            <button
              className={styles.iconButton}
              onClick={handleProfileClick}
              title="Profile"
            >
              <CgProfile />
            </button>
            <button
              className={styles.iconButton}
              onClick={handleLogout}
              title="Logout"
            >
              <FiLogOut />
            </button>
          </>
        ) : (
          <>
            <Link href="/Login" className={styles.authLink}>
              <BiLogIn className={styles.authIcon} />
              <span>Login</span>
            </Link>
            <Link href="/Register" className={styles.authLink}>
              <span>Register</span>
            </Link>
          </>
        )}
        <button className={styles.iconButton} title="Menu">
          <FiMenu />
        </button>
      </div>
    </div>
  );
}
