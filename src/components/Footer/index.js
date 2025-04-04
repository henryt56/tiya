import React from 'react';
import styles from './Footer.module.css';
import { FaFacebookF, FaLinkedinIn, FaYoutube, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.logo}>TIYA</div>

        <div className={styles.columns}>
          <div>
            <h4>Contact Us</h4>
            <ul>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Questions & Answers</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4>Register</h4>
            <ul>
              <li><a href="#">Homework Help</a></li>
              <li><a href="#">Test Prep</a></li>
              <li><a href="#">Page</a></li>
            </ul>
          </div>

          <div>
            <h4>About Us</h4>
            <ul>
              <li><a href="#">Site Map</a></li>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Tips and Tricks</a></li>
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
