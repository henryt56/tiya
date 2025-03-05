import React from 'react';
import styles from './Banner.module.css';
import { MdOutlineMessage } from 'react-icons/md';
import { CgProfile } from 'react-icons/cg';
import { FiMenu } from 'react-icons/fi';

export default function Banner() {
  // WILL LATER IMPLEMENT FUNCTIONALITY TO ICON BUTTONS
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
