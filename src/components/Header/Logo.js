import React from 'react';
import Image from 'next/image';
import styles from './Logo.module.css';
import Link from 'next/link';

export default function Logo() {
  return (
    <div className={styles.logoContainer}>
      <Link href="/">
        <Image
          src="/images/tiya-logo.png"
          alt="TIYA"
          width={80}
          height={80}
          className={styles.logoImage}
        />
      </Link>
    </div>
  );
}
