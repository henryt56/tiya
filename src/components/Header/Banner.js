import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './Banner.module.css';
import { CgProfile } from 'react-icons/cg';
import { FiMenu, FiLogOut } from 'react-icons/fi';
import { BiLogIn } from 'react-icons/bi';
import { useAuth } from '../../services/context/AuthContext';
import { useState, useRef, useEffect } from 'react';

export default function Banner() {
  const { currentUser, userRole, logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

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

  const handleDropdownMenu = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !e.target.closest(`.${styles.dropdownMenu}`)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
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
          <button
            onClick={handleDropdownMenu}
            className={`${styles.iconButton} ${styles.dropdownMenu}`}
            title="Menu"
          >
            <FiMenu />
          </button>
        </div>
      </div>

      {showDropdown && (
        <div className={styles.dropdown} ref={dropdownRef}>
          <Link href="/" className={styles.dropdownLink}>
            Home
          </Link>

          {currentUser && userRole === 'student' && (
            <Link href="/Search" className={styles.dropdownLink}>
              Find Tutors
            </Link>
          )}

          {currentUser && userRole === 'tutor' && (
            <Link href="/Sessions" className={styles.dropdownLink}>
              My Sessions
            </Link>
          )}

          <Link href="/About" className={styles.dropdownLink}>
            About Us
          </Link>

          <Link href="/Contact" className={styles.dropdownLink}>
            Contact
          </Link>

          {currentUser ? (
            <a
              href="#"
              className={styles.dropdownLink}
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
            >
              Logout
            </a>
          ) : (
            <>
              <Link href="/Login" className={styles.dropdownLink}>
                Login
              </Link>
              <Link href="/Register" className={styles.dropdownLink}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}
