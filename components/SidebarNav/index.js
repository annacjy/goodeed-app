import Link from 'next/link';
import styles from './styles.module.scss';

const SidebarNav = () => {
  return (
    <nav className={styles.nav}>
      <ul>
        <li>
          <Link href="/home">
            <a>Home</a>
          </Link>
        </li>
        <li>
          <Link href="/dashboard">
            <a>Dashboard</a>
          </Link>
        </li>
        <li>
          <Link href="/chat">
            <a>Messages</a>
          </Link>
        </li>
        <li>logout</li>
      </ul>
    </nav>
  );
};

export default SidebarNav;
