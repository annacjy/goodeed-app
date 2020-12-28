import Link from 'next/link';
import styles from './styles.module.scss';
import Button from 'components/Button';

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
        <Button name="Add your post" />
        <li>logout</li>
      </ul>
    </nav>
  );
};

export default SidebarNav;
