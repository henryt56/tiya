import React from 'react';
import styles from './Footer.module.css';
import Link from 'next/link';
import { FaFacebookF, FaLinkedinIn, FaYoutube, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.logo}>TIYA</div>

        <div className={styles.columns}>
          <div>
            <ul>
              <li><Link href="/Contact"><strong>Contact Us</strong></Link></li>
              <li>Careers</li>
              <li>Questions & Answers</li>
              <li>Privacy Policy</li>
            </ul>
          </div>

          <div>
            <ul>
              <li><Link href="/Register"><strong>Register</strong></Link></li>
              <li>Homework Help</li>
              <li>Test Prep</li>
              <li>Become a Tutor</li>
            </ul>
          </div>

          <div>
            <ul>
              <li><Link href="/About"><strong>About Us</strong></Link></li>
              <li>Site Map</li>
              <li>Help Center</li>
              <li>Tips and Tricks</li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={styles.socials}>
          <FaFacebookF />
          <FaLinkedinIn />
          <FaYoutube />
          <FaInstagram />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
