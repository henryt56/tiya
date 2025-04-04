import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.tiyaFooter}>
      <div className={styles.footerContainer}>
        <p>&copy; {new Date().getFullYear()} Tutor in Your Area</p>
        <div className={styles.footerLinks}>
          <a href="/contact">Contact</a>
          <a href="/about">About</a>
          <a href="/privacy">Privacy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
