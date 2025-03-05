import styles from "./Header.module.css";
import Logo from "./Logo";
import Banner from "./Banner.js";

export default function Header() {
  return (
    <header className={styles.headerContainer}>
      <Logo />
      <Banner />
    </header>
  );
}
