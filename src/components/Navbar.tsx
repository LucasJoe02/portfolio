"use client";

import Link from "next/link";
import styles from "./Navbar.module.css";

const Navbar = () => {

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">
          <img src="/logo.png" alt="Logo" />
        </Link>
      </div>
      
      <ul className={styles.navMenu}>
        <li className={styles.navItem}>
          <Link href="/" className={styles.navLink}>Home</Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/complaints" className={styles.navLink}>Complaints</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;